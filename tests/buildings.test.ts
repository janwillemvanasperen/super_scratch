import { describe, it, expect, vi } from 'vitest';
vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    Math: { Clamp: (n: number, min: number, max: number) => Math.max(min, Math.min(max, n)) },
  },
}));
import { GameScene } from '../src/scenes/GameScene';
import { WorldSystem } from '../src/mechanics/world-system';
import { levelSchema, kinds } from '../src/levels/schema';
import { objectBody } from '../src/assets/layout';
import { readFileSync } from 'node:fs';
const raw = () => JSON.parse(readFileSync('tests/fixtures/building-lab.json', 'utf8'));
function setup() {
  const level = levelSchema.parse(raw()),
    hooks = { hud: vi.fn(), pause: vi.fn(), finish: vi.fn(), over: vi.fn() },
    sound = { play: vi.fn(), stop: vi.fn(), start: vi.fn(), pause: vi.fn(), resume: vi.fn() };
  const s = new GameScene(level, sound as any, hooks);
  s.level = level;
  s.objects = level.objects.map((b) => ({
    ...b,
    ...objectBody(b),
    ox: objectBody(b).x,
    oy: objectBody(b).y,
    alive: true,
    vy: 0,
    phase: 0,
    opened: false,
  }));
  s.p = s.createPlayer(level.spawn.x, level.spawn.y, true);
  s.checkpoint = { x: s.p.x, y: s.p.y };
  s.systems = new WorldSystem(s, sound.play);
  s.input = { keyboard: { resetKeys: vi.fn() } } as any;
  s.keys = Object.fromEntries(
    ['left', 'right', 'up', 'down', 'jump', 'pause'].map((k) => [k, { isDown: false }]),
  ) as any;
  const step = (n = 1) => {
    for (let i = 0; i < n && !s.paused && !s.run.finished; i++) s.tick(1 / 120);
  };
  const at = (id: string, dx = 0, dy = 0) => {
    const o = s.objects.find((o) => o.id === id)!;
    s.p.x = o.x + dx;
    s.p.y = o.y + dy;
    s.p.vx = 0;
    s.p.vy = 0;
    s.p.grounded = false;
    s.standing = undefined;
    return o;
  };
  const up = () => {
    s.keys.up.isDown = false;
    step();
    s.keys.up.isDown = true;
    step();
    s.keys.up.isDown = false;
    step();
  };
  const obj = (id: string) => s.objects.find((o) => o.id === id)!;
  return { s, step, at, up, obj, hooks };
}
describe('V2.2 reusable building systems', () => {
  it('validates the complete internal lab, while keeping it out of the public register', () => {
    expect(levelSchema.safeParse(raw()).success).toBe(true);
    const all = raw().objects;
    for (const kind of kinds.slice(33))
      expect(
        all.some((o: any) => o.kind === kind),
        kind,
      ).toBe(true);
    expect(readFileSync('public/levels/index.json', 'utf8')).not.toContain('building-lab');
  });
  it('rejects dangling action IDs, invalid destination, wrong settings and missing key sources', () => {
    for (const mutate of [
      (l: any) =>
        (l.objects.find((o: any) => o.id === 'lift-switch').trigger.on[0].target = 'absent'),
      (l: any) =>
        (l.objects.find((o: any) => o.id === 'portal-a').portal.destination = { x: 1, y: 490 }),
      (l: any) => (l.objects.find((o: any) => o.id === 'water-free').water.speed = -1),
      (l: any) => (l.objects.find((o: any) => o.id === 'helper').npc.requiresKey = 'missing'),
      (l: any) => (l.objects.find((o: any) => o.id === 'ice').npc = { lines: ['bad'] }),
    ]) {
      const l = raw();
      mutate(l);
      expect(levelSchema.safeParse(l).success).toBe(false);
    }
  });
  it('a weighted crate opens a plate door, removal closes it, occupied doors wait', () => {
    const { s, step, obj } = setup(),
      crate = obj('plate-crate'),
      plate = obj('plate'),
      door = obj('plate-door');
    crate.x = plate.x + 10;
    crate.y = plate.y - crate.h;
    step(3);
    expect(door.opened).toBe(true);
    s.p.x = door.x;
    s.p.y = 430;
    crate.x = 200;
    step(3);
    expect(door.opened).toBe(true);
    s.p.x = 700;
    step(3);
    expect(door.opened).toBe(false);
  });
  it('a player cannot activate a crate-only plate, and carried objects do not count', () => {
    const { s, step, at, obj } = setup();
    at('plate', 10, -30);
    step(5);
    expect(obj('plate-door').opened).toBe(false);
    const b = obj('plate-crate');
    b.x = obj('plate').x;
    b.y = obj('plate').y - b.h;
    s.p.carrying = b.id;
    step(3);
    expect(obj('plate-door').opened).toBe(false);
  });
  it('switches start and stop a multi-stop lift without a position jump', () => {
    const { s, step, at, up, obj } = setup();
    at('lift-switch', -20, 0);
    const lift = obj('lift');
    step(10);
    expect(lift.y).toBe(460);
    up();
    step(120);
    expect(lift.y).toBeLessThan(430);
    up();
    const y = lift.y;
    step(120);
    expect(lift.y).toBe(y);
    up();
    step(1);
    expect(Math.abs(lift.y - y)).toBeLessThan(2);
  });
  it('timed actions expire and permanent switches remain on', () => {
    const { s, step, at, up, obj } = setup();
    at('timed-switch', -20, 0);
    up();
    expect(s.active(obj('test-trap'))).toBe(false);
    expect(s.active(obj('hidden-bridge'))).toBe(true);
    step(500);
    expect(s.active(obj('test-trap'))).toBe(true);
    expect(s.active(obj('hidden-bridge'))).toBe(false);
    at('permanent-switch', -20, 0);
    up();
    up();
    expect(s.systems!.state(obj('permanent-switch')).active).toBe(true);
  });
  it('climbs ladders with arrows and jumps off, no effect after leaving', () => {
    const { s, step, at } = setup();
    at('ladder2', 4, 120);
    s.keys.up.isDown = true;
    step(60);
    expect(s.p.y).toBeLessThan(370);
    expect(s.systems!.climbing).toBe(true);
    s.keys.jump.isDown = true;
    step();
    expect(s.p.vy).toBeLessThan(-450);
    s.keys.up.isDown = false;
    s.p.x = 2000;
    step();
    expect(s.systems!.climbing).toBe(false);
  });
  it('swims with currents, up/down control, oxygen loss and surface recovery', () => {
    const { s, step, at, obj } = setup();
    at('water-free', 50, 80);
    const x = s.p.x;
    s.keys.up.isDown = true;
    step(60);
    expect(s.p.y).toBeLessThan(340);
    expect(s.p.x).toBeGreaterThan(x);
    expect(s.systems!.oxygen).toBeUndefined();
    s.keys.up.isDown = false;
    at('water-oxygen', 80, 100);
    step(120);
    expect(s.systems!.oxygen!.remaining).toBeLessThan(8);
    s.p.y = 350;
    s.p.vy = 0;
    s.keys.down.isDown = true;
    step(30);
    expect(s.p.vy).toBeGreaterThan(0);
    s.keys.down.isDown = false;
    s.p.y = obj('water-oxygen').y - 10;
    step();
    expect(s.systems!.oxygen).toBeUndefined();
  });
  it('oxygen exhaustion costs health and respawn clears transient states', () => {
    const { s, step, at } = setup();
    at('water-oxygen', 200, 150);
    step(120 * 9);
    expect(s.run.hearts).toBeLessThan(3);
    s.loseLife();
    expect(s.systems!.oxygen).toBeUndefined();
    expect(s.systems!.climbing).toBe(false);
  });
  it('special surfaces change motion and one-way platforms pass from below', () => {
    const { s, step, at, obj } = setup();
    at('ice', 20, -30);
    step(5);
    s.p.vx = 200;
    step(10);
    expect(s.p.vx).toBeGreaterThan(170);
    at('mud', 20, -30);
    s.keys.right.isDown = true;
    step(40);
    expect(s.p.vx).toBeLessThan(120);
    s.keys.right.isDown = false;
    at('belt', 50, -30);
    step(40);
    expect(s.p.vx).toBeLessThan(-50);
    at('bounce', 10, -30);
    s.p.vy = 10;
    step(2);
    expect(s.p.vy).toBeLessThan(-600);
    at('one-way', 20, 24);
    s.p.vy = -510;
    step(18);
    expect(s.p.y + s.p.h).toBeLessThan(obj('one-way').y);
  });
  it('zones combine, stop on exit, and explicit temporary speed expires', () => {
    const { s, step, at } = setup();
    at('low-g', 10, 20);
    s.p.vy = 0;
    step(10);
    expect(s.p.vy).toBeLessThan(50);
    s.p.x = 6000;
    s.p.vy = 0;
    step(10);
    expect(s.p.vy).toBeGreaterThan(90);
    at('temporary-speed', 20, 100);
    s.keys.right.isDown = true;
    step(40);
    s.p.x = 6100;
    step(10);
    expect(s.p.vx).toBeGreaterThan(300);
    s.keys.right.isDown = false;
    step(400);
    s.keys.right.isDown = true;
    step(40);
    expect(s.p.vx).toBeLessThanOrEqual(245);
  });
  it('teleports both ways, awards a secret once, and prevents automatic loops', () => {
    const { s, step, at, up } = setup();
    at('portal-a', 10, 10);
    up();
    expect(s.p.x).toBeGreaterThan(6500);
    expect(s.run.secrets).toBe(2);
    step(100);
    up();
    expect(s.p.x).toBeLessThan(6300);
    step(100);
    up();
    expect(s.run.secrets).toBeLessThanOrEqual(2); // One portal reward plus one room reward.
    s.p.x = 6800;
    step(100);
    at('auto-a', 5, 10);
    step();
    const x = s.p.x;
    step(240);
    expect(s.p.x).toBeCloseTo(x);
    expect(s.p.x).toBeGreaterThan(7100);
  });
  it('collapse platforms vanish after contact and safely return', () => {
    const { s, step, at, obj } = setup();
    at('collapse', 10, -30);
    step(10);
    expect(s.active(obj('collapse'))).toBe(true);
    step(100);
    expect(s.active(obj('collapse'))).toBe(false);
    s.p.x = 8100;
    step(380);
    expect(s.active(obj('collapse'))).toBe(true);
  });
  it('a carried crate can be thrown to defeat an enemy, without duplicate score', () => {
    const { s, step, at, obj } = setup();
    at('throw-crate', -10, 0);
    s.keys.down.isDown = true;
    step();
    expect(s.p.carrying).toBe('throw-crate');
    s.keys.down.isDown = false;
    step();
    s.keys.down.isDown = true;
    s.keys.jump.isDown = true;
    step();
    expect(s.p.carrying).toBeUndefined();
    step(120);
    expect(obj('test-enemy').alive).toBe(false);
    expect(s.run.kills).toBe(1);
    step(120);
    expect(s.run.kills).toBe(1);
  });
  it('treasure rewards occur once and remain consumed after life loss', () => {
    const { s, at, up } = setup();
    at('treasure', -20, 0);
    up();
    expect(s.run.coins).toBe(3);
    expect(s.powers.shield).toBeGreaterThan(0);
    const score = s.run.score;
    up();
    expect(s.run.score).toBe(score);
    s.loseLife();
    at('treasure', -20, 0);
    up();
    expect(s.run.coins).toBe(3);
  });
  it('NPC gives a key, another receives it and starts an event, without reward farming', () => {
    const { s, at, up, obj } = setup();
    at('helper', -20, 0);
    up();
    expect(s.systems!.speech?.text).toContain('Welkom');
    expect(s.run.keys.has('archive')).toBe(false);
    up();
    expect(s.run.keys.has('archive')).toBe(true);
    at('receiver', -20, 0);
    up();
    expect(s.run.keys.has('archive')).toBe(false);
    expect(s.active(obj('locked-portal'))).toBe(true);
    at('helper', -20, 0);
    up();
    up();
    expect(s.run.keys.has('archive')).toBe(false);
  });
  it('safe lifts stop rather than crushing a rider under a solid ceiling', () => {
    const { s, step, at, obj } = setup(),
      lift = obj('lift');
    at('lift', 20, -30);
    const roof = obj('high-deck');
    roof.x = lift.x;
    roof.y = 380;
    roof.w = 200;
    s.systems!.actions([{ type: 'object', target: 'lift', action: 'start' }], 'test');
    step(240);
    expect(s.p.y).toBeGreaterThanOrEqual(roof.y + roof.h);
    expect(s.run.hearts).toBe(3);
    expect(lift.y).toBeGreaterThanOrEqual(430);
  });
  it('pause freezes timers, restart isolates state, shutdown clears runtime collections', () => {
    const { s, at, up, step, obj } = setup();
    at('timed-switch', -20, 0);
    up();
    const timer = s.systems!.state(obj('timed-switch')).timer;
    s.setPaused(true);
    step(600);
    expect(s.systems!.state(obj('timed-switch')).timer).toBe(timer);
    s.setPaused(false);
    step(600);
    expect(s.systems!.state(obj('timed-switch')).active).toBe(false);
    const fresh = setup();
    expect(fresh.s.systems!.state(fresh.obj('timed-switch')).active).toBe(false);
    s.systems!.destroy();
    expect(s.systems!.states.size).toBe(0);
    expect(fresh.s.systems!.states.size).toBe(61);
  });
  it('resetOnDeath restores configured motion but preserves consumed rewards', () => {
    const { s, at, up, obj } = setup();
    obj('treasure').resetOnDeath = true;
    obj('lift').resetOnDeath = true;
    at('treasure', -20, 0);
    up();
    obj('lift').y = 320;
    s.loseLife();
    expect(obj('lift').y).toBe(obj('lift').oy);
    expect(s.systems!.state(obj('lift')).moving).toBe(false);
    at('treasure', -20, 0);
    up();
    expect(s.run.coins).toBe(3);
    expect(obj('treasure').opened).toBe(true);
  });
  it('NPC receives a carried crate and grants an event only once', () => {
    const { s, at, up, obj } = setup();
    const npc = obj('receiver');
    npc.npc!.requiresKey = undefined;
    npc.npc!.receive = 'crate';
    at('receiver', -20, 0);
    up();
    expect(s.active(obj('locked-portal'))).toBe(false);
    s.p.carrying = 'throw-crate';
    up();
    expect(obj('throw-crate').alive).toBe(false);
    expect(s.p.carrying).toBeUndefined();
    expect(s.active(obj('locked-portal'))).toBe(true);
  });
  it('switch gates a portal and runtime rejects a moved destination outside the world', () => {
    const { s, at, up, obj } = setup();
    s.systems!.actions([{ type: 'object', target: 'final-portal', action: 'enable' }], 'test');
    at('final-portal');
    up();
    expect(s.p.x).toBeLessThan(11000);
    at('permanent-switch', -20, 0);
    up();
    at('final-portal');
    up();
    expect(s.p.x).toBe(11000);
    const fresh = setup();
    fresh.obj('portal-b').x = 13000;
    fresh.at('portal-a');
    fresh.up();
    expect(fresh.s.p.x).toBe(6250);
  });
  it('rider platform waits for a player and manual lift stops at the next stop', () => {
    const { s, step, at, up, obj } = setup();
    const rider = obj('rider-platform');
    step(60);
    expect(rider.x).toBe(rider.ox);
    at('rider-platform', 20, -30);
    step(60);
    expect(rider.x).toBeGreaterThan(rider.ox);
    at('manual-lift', 20, -30);
    up();
    step(300);
    expect(obj('manual-lift').y).toBeCloseTo(350);
    expect(s.systems!.state(obj('manual-lift')).moving).toBe(false);
  });
});
