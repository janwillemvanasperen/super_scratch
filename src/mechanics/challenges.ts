import { moveBody, overlap, type Rect } from '../core/physics';
import { RULES } from '../core/rules';
import type { GameScene } from '../scenes/GameScene';
import type { WorldObject } from './world-types';
import type { Goal } from './challenge-schema';

type Hit = 'stomp' | 'throw' | 'power' | 'event';
type EnemyState = {
  hp: number;
  timer: number;
  near: number;
  age: number;
  index: number;
  phase: number;
  wait: number;
  direction: number;
  hit: number;
  hidden: number;
};
export const enemyKinds = ['walker', 'chaser', 'jumper', 'flyer', 'shooter', 'sentry', 'enemy'];
export class Challenges {
  private enemies = new Map<string, EnemyState>();
  private completed = new Set<string>();
  private switches = new Set<string>();
  private keys = new Set<string>();
  private visits = new Set<string>();
  private bossMusic?: string;
  background?: number;
  constructor(private scene: GameScene) {}
  state(o: WorldObject) {
    let s = this.enemies.get(o.id);
    if (!s) {
      s = {
        hp: o.enemy!.hp,
        timer: 0,
        near: 0,
        age: 0,
        index: 0,
        phase: -1,
        wait: 0,
        direction: 1,
        hit: 0,
        hidden: 0,
      };
      this.enemies.set(o.id, s);
    }
    return s;
  }
  hidden(o: WorldObject) {
    return (this.enemies.get(o.id)?.hidden ?? 0) > 0;
  }
  hit(o: WorldObject, method: Hit, source?: Rect) {
    const h = this.scene,
      e = o.enemy!,
      s = this.state(o);
    const b = e.phases[s.phase]?.behavior ?? e.behavior;
    if (
      !o.alive ||
      !h.active(o) ||
      !e.accepts.includes(method) ||
      s.hit > 0 ||
      (method !== 'event' &&
        (s.hidden > 0 ||
          (b.vulnerableFor !== undefined && (s.timer <= 0 || s.timer > b.vulnerableFor))))
    )
      return false;
    if (source && e.weakSpot) {
      const r = e.weakSpot;
      if (!overlap(source, { x: o.x + r.x * o.w, y: o.y + r.y * o.h, w: r.w * o.w, h: r.h * o.h }))
        return false;
    }
    s.hp--;
    s.hit = e.hitDelay;
    h.burst(o.x + o.w / 2, o.y);
    if (s.hp <= 0) {
      o.alive = false;
      o.defeatedAt = h.elapsed;
      h.run.claim(o.id, 'enemy');
      h.audio.play('enemy');
      h.systems?.actions(e.defeated, 'defeat:' + o.id);
      if (this.bossMusic === o.id) {
        this.bossMusic = undefined;
        h.audio.start(h.level.music.notes, h.level.music.tempo, h.level);
      }
    }
    return true;
  }
  enemy(o: WorldObject, dt: number, previousBottom: number) {
    const h = this.scene,
      e = o.enemy!,
      s = this.state(o),
      p = h.p;
    const phase = e.phases.reduce((last, f, i) => (s.hp / e.hp <= f.at ? i : last), -1);
    const b = e.phases[phase]?.behavior ?? e.behavior;
    if (s.phase !== phase) {
      s.phase = phase;
      s.index = 0;
      s.timer = 0;
      s.hidden = 0;
      s.wait = 0;
    }
    s.hit = Math.max(0, s.hit - dt);
    s.age += dt;
    const dx = p.x + p.w / 2 - o.x - o.w / 2,
      dy = p.y + p.h / 2 - o.y - o.h / 2;
    const near = Math.hypot(dx, dy) < b.detect;
    s.near = near ? s.near + dt : 0;
    const ready = near && s.near >= b.reaction;
    if (ready && !this.completed.has('intro:' + o.id)) {
      this.completed.add('intro:' + o.id);
      if (e.intro) h.say(e.intro, 5);
      if (e.music) {
        this.bossMusic = o.id;
        h.audio.start(e.music.notes, e.music.tempo);
      }
    }
    s.hidden = Math.max(0, s.hidden - dt);
    s.timer = Math.max(0, s.timer - dt);
    s.wait = Math.max(0, s.wait - dt);
    if (!s.hidden && (!b.waitNear || ready)) {
      let vx = 0,
        vy = o.vy;
      if (b.move === 'walk') vx = b.speed;
      if (b.move === 'patrol' || b.move === 'guard') {
        if (o.x >= o.ox + b.range) s.direction = -1;
        if (o.x <= o.ox - b.range) s.direction = 1;
        vx = s.direction * b.speed;
      }
      if (ready && ['chase', 'flee', 'guard'].includes(b.move))
        vx = Math.sign(dx) * b.speed * (b.move === 'flee' ? -1 : 1);
      if (b.move === 'guard' && (o.x - o.ox) * vx > 0 && Math.abs(o.x - o.ox) >= b.range) vx = 0;
      if (b.route) {
        const target = b.route[s.index % b.route.length];
        const tx = target.x - o.x,
          ty = target.y - o.y,
          d = Math.hypot(tx, ty);
        if (d <= b.speed * dt && !s.wait) {
          o.x = target.x;
          o.y = target.y;
          s.index++;
          s.wait = b.wait;
        }
        vx = s.wait || !d ? 0 : (tx / d) * b.speed;
        vy = s.wait || !d ? 0 : (ty / d) * b.speed;
      } else if (b.flight !== undefined) {
        vy = Math.max(
          -b.speed,
          Math.min(b.speed, (o.oy + Math.sin(s.age * 2) * b.flight - o.y) * 4),
        );
      } else vy = Math.min(850, vy + RULES.gravity * dt);
      const old = o.x;
      if (h.systems && !h.systems.moving(o)) {
        vx = 0;
        vy = 0;
      }
      const body = { ...o, vx, vy };
      const result = moveBody(body, dt, h.solids());
      o.x = Math.max(0, Math.min(h.level.world.width - o.w, body.x));
      o.y = body.y;
      o.vy = body.vy;
      if (o.x !== old) o.facing = Math.sign(o.x - old);
      if (vx && !body.vx && b.move === 'patrol') s.direction *= -1;
      if (o.y > h.level.world.height + 50) {
        o.x = o.ox;
        o.y = o.oy;
        o.vy = 0;
      }
      if (b.jump && result.grounded && (!b.jumpNear || ready) && !s.timer) o.vy = -b.jump;
      if (
        !s.timer &&
        (!b.jump || result.grounded || b.shoot || b.hide || b.teleport) &&
        (ready || (!b.shoot && !b.hide && !b.teleport && !b.jumpNear))
      ) {
        s.timer = b.interval;
        if (b.hide) s.hidden = b.hide;
        if (b.teleport) {
          const target = b.teleport[s.index++ % b.teleport.length],
            box = { ...target, w: o.w, h: o.h };
          if (!h.solids().some((x) => overlap(box, x)) && !overlap(box, p)) {
            o.x = target.x;
            o.y = target.y;
            o.vy = 0;
          }
        }
        if (b.shoot && h.shots.length < 128) {
          const angle =
            b.shoot.direction === 'aim'
              ? Math.atan2(dy, dx)
              : b.shoot.direction === 'left' || (b.shoot.direction === 'horizontal' && dx < 0)
                ? Math.PI
                : 0;
          for (const offset of b.shoot.pattern === 'spread' ? [-0.24, 0, 0.24] : [0])
            h.shots.push({
              x: o.x + o.w / 2,
              y: o.y + o.h / 2,
              w: 10,
              h: 10,
              vx: Math.cos(angle + offset) * b.shoot.speed,
              vy: Math.sin(angle + offset) * b.shoot.speed,
              ttl: 4,
              damage: e.damage,
            });
          o.attackUntil = h.elapsed + 0.3;
        }
      }
    }
    if (s.hidden || !overlap(p, o)) return;
    if (h.powers.invincible) this.hit(o, 'power', p);
    else if (p.vy > 0 && previousBottom <= o.y + 12) {
      const foot = { x: p.x, y: p.y + p.h - 5, w: p.w, h: 12 };
      this.hit(o, 'stomp', foot);
      p.vy = -330;
    } else if (e.damage) h.hurt(o.x, e.damage);
  }
  progress(goal: Goal) {
    const h = this.scene,
      g = goal.condition;
    const total = 'count' in g ? g.count : 'ids' in g ? g.ids.length : 1;
    let current = 0;
    if (g.type === 'coins') current = h.run.coins;
    if (g.type === 'kills') current = h.run.kills;
    if (g.type === 'time') current = Number(h.run.seconds <= g.seconds);
    if (g.type === 'deliver')
      current = Number(this.completed.has('deliver:' + g.object + ':' + g.to));
    if ('ids' in g)
      current = g.ids.filter((id) => {
        if (g.type === 'keys') return h.run.keys.has(id) || this.keys.has(id);
        if (g.type === 'visit') return this.visits.has(id);
        if (g.type === 'people') return h.run.claimed.has('interaction:' + id);
        if (g.type === 'switches')
          return this.switches.has(id) || !!h.systems?.states.get(id)?.active;
        if (g.type === 'enemies') return h.run.claimed.has(id);
        return h.run.claimed.has(id);
      }).length;
    return {
      done: current >= total,
      text:
        g.type === 'time'
          ? goal.label + ' · ' + Math.max(0, Math.ceil(g.seconds - h.run.seconds)) + ' s'
          : goal.label + (total > 1 ? ' ' + Math.min(current, total) + '/' + total : ''),
    };
  }
  goals(finish?: WorldObject) {
    return [...(this.scene.level.goals ?? []), ...(finish?.requirements ?? [])];
  }
  hud() {
    const h = this.scene;
    const goals = [...this.goals(), ...h.objects.flatMap((o) => o.requirements ?? [])];
    return [
      ...new Set(
        goals.map((g) => {
          const p = this.progress(g);
          return (p.done ? '✓ ' : '○ ') + p.text;
        }),
      ),
    ];
  }
  tick() {
    const h = this.scene;
    if (
      !h.level.goals?.length &&
      !h.level.events?.length &&
      !h.objects.some((o) => o.requirements?.length)
    )
      return;
    for (const key of h.run.keys) this.keys.add(key);
    for (const o of h.objects) {
      if (o.trigger && h.systems?.states.get(o.id)?.active) this.switches.add(o.id);
      if (h.active(o) && overlap(h.p, o)) this.visits.add(o.id);
    }
    const goals = [
      ...this.goals(),
      ...h.objects.flatMap((o) => o.requirements ?? []),
      ...(h.level.events ?? []).flatMap((e) => e.when),
    ];
    for (const { condition: g } of goals)
      if (g.type === 'deliver') {
        const object = h.objects.find((o) => o.id === g.object),
          target = h.objects.find((o) => o.id === g.to);
        if (
          object?.alive &&
          target &&
          h.active(object) &&
          h.active(target) &&
          h.p.carrying !== object.id &&
          overlap(object, target)
        )
          this.completed.add('deliver:' + g.object + ':' + g.to);
      }
    for (const e of h.level.events ?? [])
      if (!this.completed.has('event:' + e.id) && e.when.every((g) => this.progress(g).done)) {
        this.completed.add('event:' + e.id);
        h.systems?.actions(e.actions, 'story:' + e.id);
      }
  }
}
