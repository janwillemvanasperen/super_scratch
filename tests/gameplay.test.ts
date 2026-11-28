import { describe, it, expect, vi } from 'vitest';
vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    Math: { Clamp: (n: number, min: number, max: number) => Math.max(min, Math.min(max, n)) },
  },
}));
import { GameScene } from '../src/scenes/GameScene';
import { WorldSystem } from '../src/mechanics/world-system';
import { Player } from '../src/entities/player';
import { objectBody } from '../src/assets/layout';
import { levelSchema } from '../src/levels/schema';
import { readFileSync } from 'node:fs';
function setup(id = 'tutorial') {
  const l = levelSchema.parse(JSON.parse(readFileSync(`public/levels/${id}.json`, 'utf8')));
  const audio = {
    play: vi.fn(),
    stop: vi.fn(),
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  } as any;
  const hooks = { hud: vi.fn(), pause: vi.fn(), finish: vi.fn(), over: vi.fn() };
  const s = new GameScene(l, audio, hooks);
  s.level = l;
  s.objects = l.objects.map((b) => ({
    ...b,
    ...objectBody(b),
    ox: objectBody(b).x,
    oy: objectBody(b).y,
    alive: true,
    vy: 0,
    phase: 0,
    opened: false,
  }));
  s.p = s.createPlayer(l.spawn.x, l.spawn.y, true);
  s.checkpoint = { x: s.p.x, y: s.p.y };
  s.systems = new WorldSystem(s, () => {});
  s.keys = Object.fromEntries(
    ['left', 'right', 'up', 'down', 'jump', 'pause'].map((k) => [k, { isDown: false }]),
  ) as any;
  const step = (n: number) => {
    for (let i = 0; i < n && !s.paused && !s.run.finished; i++) s.tick(1 / 120);
  };
  return { s, step, hooks };
}
describe('gameplay integration', () => {
  it('preserves the custom player hitbox and visual origin through respawn', () => {
    const { s } = setup('midnight-city');
    expect([s.p.x, s.p.y, s.p.w, s.p.h]).toEqual([73, 438, 22, 30]);
    s.checkpoint = { x: 1800, y: 354 };
    s.loseLife();
    expect([s.p.x, s.p.y, s.p.w, s.p.h]).toEqual([1800, 354, 22, 30]);
    const initial = s.createPlayer(60, 420, true);
    s.level.character.visual!.scale = 4;
    const scaled = s.createPlayer(60, 420, true);
    expect(scaled).toEqual(initial);
  });
  it('never pushes an idle player sideways when a moving platform passes overhead', () => {
    const { s, step } = setup('first-adventure');
    s.p.x = 3740;
    s.p.y = 450;
    const x = s.p.x;
    step(120 * 15);
    expect(s.p.x).toBeCloseTo(x);
    expect(s.run.lives).toBe(3);
  });
  it('breaks blocks from below, cycles vanishing platforms and emits projectiles', () => {
    const { s, step } = setup('first-adventure');
    s.p.x = 1135;
    s.p.y = 405;
    s.p.vy = -510;
    step(3);
    expect(s.objects.find((o) => o.kind === 'breakable')!.alive).toBe(false);
    const v = s.objects.find((o) => o.kind === 'vanish')!;
    s.elapsed = v.period * 0.8;
    expect(s.active(v)).toBe(false);
    s.elapsed = v.period;
    expect(s.active(v)).toBe(true);
    const shooter = s.objects.find((o) => o.kind === 'shooter')!;
    s.p.x = shooter.x - 200;
    s.p.y = 450;
    shooter.phase = 10;
    s.enemy(shooter, 1 / 120);
    expect(s.shots.length).toBe(1);
  });
  it('handles damage, invulnerability, shield, checkpoint and game over', () => {
    const { s, step, hooks } = setup();
    s.hurt(100);
    expect(s.run.hearts).toBe(2);
    s.hurt(100);
    expect(s.run.hearts).toBe(2);
    s.p.invuln = 0;
    s.powers.shield = 5;
    s.hurt(100);
    expect(s.run.hearts).toBe(2);
    expect(s.powers.shield).toBeUndefined();
    s.p.x = 1930;
    s.p.y = 440;
    step(1);
    expect(s.checkpoint.x).toBe(1930);
    s.loseLife();
    expect(s.run.lives).toBe(2);
    expect(s.p.x).toBe(1930);
    expect(s.run.hearts).toBe(3);
    s.loseLife();
    s.loseLife();
    expect(hooks.over).toHaveBeenCalledOnce();
  });
  it('collects key, opens door and carries/drops a crate', () => {
    const { s, step } = setup();
    s.p.x = 1435;
    s.p.y = 450;
    step(1);
    expect(s.run.keys.has('garden')).toBe(true);
    s.p.x = 1540;
    s.keys.up.isDown = true;
    step(1);
    expect(s.objects.find((o) => o.kind === 'door')!.opened).toBe(true);
    s.p.x = 1200;
    s.p.y = 450;
    s.keys.down.isDown = true;
    step(1);
    expect(s.p.carrying).toBeTruthy();
    s.keys.down.isDown = false;
    step(1);
    s.p.x = 1300;
    s.keys.down.isDown = true;
    step(1);
    expect(s.p.carrying).toBeUndefined();
  });
  it('activates all powerups, heart, spring, secrets and finishes once', () => {
    const { s, step, hooks } = setup();
    for (const kind of ['speed', 'shield', 'jump', 'invincible']) {
      const o = s.objects.find((o) => o.kind === kind)!;
      s.p.x = o.x;
      s.p.y = o.y;
      s.p.vy = 0;
      step(1);
      expect(s.powers[kind]).toBeGreaterThan(0);
    }
    s.run.hearts = 1;
    const heart = s.objects.find((o) => o.kind === 'heart')!;
    s.p.x = heart.x;
    s.p.y = heart.y;
    step(1);
    expect(s.run.hearts).toBe(2);
    const spring = s.objects.find((o) => o.kind === 'spring')!;
    s.p.x = spring.x;
    s.p.y = spring.y - 25;
    s.p.vy = 10;
    step(1);
    expect(s.p.vy).toBe(-740);
    s.p.x = 2920;
    s.p.y = 440;
    s.p.vy = 0;
    step(1);
    expect(s.run.secrets).toBe(1);
    s.p.x = 4950;
    s.p.y = 440;
    step(1);
    expect(hooks.finish).toHaveBeenCalledOnce();
    expect(s.run.finished).toBe(true);
  });
  for (const id of ['tutorial', 'first-adventure', 'midnight-city', 'deep-sea-treasure'])
    it(`completes ${id} with simulated controls, no teleport`, () => {
      const { s, step } = setup(id);
      let jumpRelease = 0;
      let lastJump = -100;
      const trace: { x: number; y: number; l: number }[] = [];
      for (let i = 0; i < 120 * 180 && !s.run.finished && !s.paused; i++) {
        const p = s.p;
        s.keys.right.isDown = true;
        s.keys.up.isDown = i % 20 < 10;
        s.keys.down.isDown = i % 20 < 10;
        const threats = s.objects.filter(
          (o) =>
            o.alive &&
            [
              'walker',
              'chaser',
              'jumper',
              'sentry',
              'shooter',
              'spikes',
              'lava',
              'trap',
              'crate',
              'wall',
            ].includes(o.kind),
        );
        const danger = threats.some(
          (o) => o.x >= p.x - 5 && o.x - p.x < 90 && Math.abs(o.y - p.y) < 65,
        );
        const ground = s.objects.filter((o) => o.kind === 'ground');
        const ahead = ground.some((o) => p.x + 90 >= o.x && p.x + 90 < o.x + o.w);
        // The secret-room wall requires the explicitly signposted passage.
        if (id === 'first-adventure' && p.x > 6020 && p.x < 6110) s.keys.right.isDown = false;
        if (id === 'first-adventure' && p.x > 6615 && p.x < 6700) s.keys.right.isDown = false;
        if (p.grounded && (danger || !ahead) && i - lastJump > 25) {
          jumpRelease = i + 90;
          lastJump = i;
        }
        s.keys.jump.isDown = i < jumpRelease;
        step(1);
        if (i % 120 === 0) trace.push({ x: Math.round(p.x), y: Math.round(p.y), l: s.run.lives });
      }
      expect(s.run.finished, JSON.stringify(trace.slice(-20))).toBe(true);
      expect(s.run.lives).toBeGreaterThan(0);
    });
});

describe('V2.3 combat and objectives', () => {
  it('completes the demonstration boss, three objectives and one of two finishes after respawn', () => {
    const { s, step, hooks } = setup('crystal-workshop');
    const find = (id: string) => s.objects.find((o) => o.id === id)!;
    const at = (id: string) => {
      s.p.x = find(id).x;
      s.p.y = 450;
      s.p.vx = 0;
      s.p.vy = 0;
    };
    at('finish-lower');
    step(1);
    expect(s.run.finished).toBe(false);
    expect(s.challenge.hud()).toContain('○ Kristallen 0/3');
    for (const id of ['crystal-0', 'crystal-1', 'crystal-2']) {
      at(id);
      step(1);
    }
    at('machine');
    s.keys.up.isDown = true;
    step(1);
    s.keys.up.isDown = false;
    const boss = find('boss');
    expect(s.active(boss)).toBe(true);
    at('safe');
    step(1);
    s.loseLife();
    expect(s.p.x).toBe(s.checkpoint.x);
    expect(s.challenge.hud()).toContain('✓ Kristallen 3/3');
    expect(s.challenge.hud()).toContain('✓ Zet de machine aan');
    for (let i = 0; i < 3; i++) {
      s.p.x = boss.x + 20;
      s.p.y = boss.y - s.p.h - 1;
      s.p.vy = 320;
      step(1);
      expect(s.challenge.state(boss).hp).toBe(2 - i);
      if (i === 0) {
        s.p.y = boss.y - s.p.h - 1;
        s.p.vy = 320;
        step(1);
        expect(s.challenge.state(boss).hp).toBe(2);
      }
      at('safe');
      step(95);
      if (i === 1) expect(s.challenge.state(boss).phase).toBe(0);
    }
    expect(s.run.kills).toBe(1);
    expect(s.challenge.hit(boss, 'stomp')).toBe(false);
    expect(s.run.score).toBe(1000);
    at('finish-lower');
    step(1);
    expect(hooks.finish).toHaveBeenCalledTimes(1);
    step(10);
    expect(hooks.finish).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['stand', 0],
    ['walk', 1],
    ['patrol', 1],
    ['chase', 1],
    ['flee', -1],
    ['guard', 1],
    ['route', 1],
  ] as const)('moves with the %s behavior', (move, direction) => {
    const { s, step } = setup('crystal-workshop');
    const boss = s.objects.find((o) => o.id === 'boss')!;
    boss.enemy!.behavior = {
      ...boss.enemy!.behavior,
      move,
      route:
        move === 'route'
          ? [
              { x: boss.x + 40, y: boss.y },
              { x: boss.x + 80, y: boss.y },
            ]
          : undefined,
    };
    s.systems!.actions([{ type: 'object', target: 'boss', action: 'enable' }], 'test');
    s.p.x = boss.x + 170;
    s.p.y = 450;
    const start = boss.x;
    step(30);
    expect(Math.sign(boss.x - start)).toBe(direction);
  });
  it.each(['flight', 'jump', 'wait', 'hide', 'teleport', 'shoot'] as const)(
    'executes %s with compatible movement',
    (feature) => {
      const { s, step } = setup('crystal-workshop');
      const boss = s.objects.find((o) => o.id === 'boss')!,
        b = boss.enemy!.behavior;
      b.shoot = undefined;
      s.systems!.actions([{ type: 'object', target: 'boss', action: 'enable' }], 'test');
      const x = boss.x,
        y = boss.y;
      s.p.x = x + 160;
      s.p.y = 450;
      if (feature === 'flight') {
        b.flight = 40;
        b.shoot = { speed: 100, direction: 'aim', pattern: 'spread' };
      }
      if (feature === 'jump') {
        b.jump = 360;
        b.jumpNear = true;
      }
      if (feature === 'wait') {
        b.waitNear = true;
        b.reaction = 1;
      }
      if (feature === 'hide') {
        b.hide = 0.5;
        b.move = 'chase';
      }
      if (feature === 'teleport')
        b.teleport = [
          { x: 1100, y },
          { x: 1200, y },
        ];
      if (feature === 'shoot') b.shoot = { speed: 100, direction: 'left', pattern: 'single' };
      step(30);
      if (feature === 'flight') {
        expect(boss.y).toBeLessThanOrEqual(y);
        expect(s.shots.length).toBe(3);
      }
      if (feature === 'jump') expect(boss.y).toBeLessThan(y);
      if (feature === 'wait') {
        expect(boss.x).toBe(x);
        step(100);
        expect(boss.x).toBeGreaterThan(x);
      }
      if (feature === 'hide') {
        expect(s.challenge.hidden(boss)).toBe(true);
        step(45);
        expect(s.challenge.hidden(boss)).toBe(false);
      }
      if (feature === 'teleport') expect(boss.x).toBeGreaterThan(1090);
      if (feature === 'shoot') expect(s.shots[0].vx).toBeLessThan(0);
    },
  );
  it('rejects incompatible movement, unordered phases and missing objective references', () => {
    for (const mutate of [
      (l: any, e: any) => {
        e.behavior.flight = 20;
        e.behavior.jump = 300;
      },
      (l: any, e: any) => {
        e.phases.push(e.phases[0]);
      },
      (l: any) => {
        l.goals[0].condition.ids = ['missing'];
      },
    ]) {
      const l = JSON.parse(readFileSync('public/levels/crystal-workshop.json', 'utf8'));
      mutate(l, l.objects.find((o: any) => o.id === 'boss').enemy);
      expect(levelSchema.safeParse(l).success).toBe(false);
    }
  });
});

it('activates checkpoints on distinct floors at the same x and preserves a dropped enhanced crate on life loss', () => {
  const { s, step } = setup('crystal-workshop');
  const original = s.objects.find((o) => o.kind === 'checkpoint')!;
  const top = {
    ...original,
    id: 'above',
    y: 250,
    oy: 250,
    respawn: { x: original.x + 24, y: 220 },
  };
  const crate = {
    ...original,
    id: 'delivery',
    kind: 'crate' as const,
    x: 700,
    y: 450,
    ox: 630,
    oy: 450,
    w: 24,
    h: 24,
    carry: { throwable: true, weight: 1, throwSpeed: 340, throwLift: 180, defeatsEnemies: true },
  };
  s.objects.push(top, crate);
  s.systems = new WorldSystem(s, () => {});
  s.p.x = original.x;
  s.p.y = 450;
  step(1);
  expect(s.checkpointId).toBe(original.id);
  s.p.x = top.x;
  s.p.y = top.y;
  step(1);
  expect(s.checkpointId).toBe('above');
  s.loseLife();
  expect(s.p.y).toBe(220);
  expect(crate.x).toBe(700);
});

it('restores health and respawns after repeated practice falls without reducing lives', () => {
  const { s } = setup('crystal-workshop');
  s.practice = true;
  s.run.claim('test-coin', 'coin');
  s.powers.shield = 4;
  for (let n = 0; n < 6; n++) {
    s.run.hearts = 0;
    s.loseLife();
    expect(s.run.hearts).toBe(3);
    expect(s.run.lives).toBe(3);
    expect(s.paused).toBe(false);
  }
  expect(s.run.coins).toBe(1);
  expect(s.powers.shield).toBeUndefined();
});
