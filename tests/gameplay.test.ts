import { describe, it, expect, vi } from 'vitest';
vi.mock('phaser', () => ({
  default: {
    Scene: class {},
    Math: { Clamp: (n: number, min: number, max: number) => Math.max(min, Math.min(max, n)) },
  },
}));
import { GameScene } from '../src/scenes/GameScene';
import { Player } from '../src/entities/player';
import { levelSchema } from '../src/levels/schema';
import { readFileSync } from 'node:fs';
function setup(id = 'tutorial') {
  const l = levelSchema.parse(JSON.parse(readFileSync(`public/levels/${id}.json`, 'utf8')));
  const audio = { play: vi.fn(), stop: vi.fn(), start: vi.fn() } as any;
  const hooks = { hud: vi.fn(), pause: vi.fn(), finish: vi.fn(), over: vi.fn() };
  const s = new GameScene(l, audio, hooks);
  s.level = l;
  s.objects = l.objects.map((b) => ({
    ...b,
    ox: b.x,
    oy: b.y,
    alive: true,
    vy: 0,
    phase: 0,
    opened: false,
  }));
  s.p = new Player(l.spawn.x, l.spawn.y);
  s.checkpoint = { ...l.spawn };
  s.keys = Object.fromEntries(
    ['left', 'right', 'up', 'down', 'jump', 'pause'].map((k) => [k, { isDown: false }]),
  ) as any;
  const step = (n: number) => {
    for (let i = 0; i < n && !s.paused && !s.run.finished; i++) s.tick(1 / 120);
  };
  return { s, step, hooks };
}
describe('gameplay integration', () => {
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
  for (const id of ['tutorial', 'first-adventure'])
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
