import { RULES } from '../core/rules';
import { moveBody, overlap, type Rect } from '../core/physics';
import type { Action, Reward } from './building-schema';
import type { Controls, Environment, ObjectState, WorldHost, WorldObject } from './world-types';
const approach = (a: number, b: number, step: number) =>
  a + Math.sign(b - a) * Math.min(Math.abs(b - a), step);
const enemies = ['walker', 'chaser', 'jumper', 'flyer', 'shooter', 'sentry'];
const near = (p: Rect, o: Rect) =>
  Math.abs(p.x + p.w / 2 - o.x - o.w / 2) < 75 && p.y + p.h > o.y - 30 && p.y < o.y + o.h + 30;
const onTop = (p: Rect, o: Rect) =>
  Math.abs(p.y + p.h - o.y) < 4 && p.x + p.w > o.x && p.x < o.x + o.w;

/** One disposable instance per run. Data-only actions never evaluate scripts or recurse. */
export class WorldSystem {
  readonly states = new Map<string, ObjectState>();
  oxygen?: { remaining: number; total: number };
  speech?: { id: string; text: string; until: number };
  swimming = false;
  climbing = false;
  private climbLock = false;
  private oxygenZone?: string;
  private oxygenDamage = 0;
  private portalTime = 0;
  private portalLocked = false;
  private lingering = new Map<string, number>();
  private environment?: Environment;
  constructor(
    private host: WorldHost,
    private sound: (name: string) => void,
  ) {
    for (const o of host.objects) this.states.set(o.id, this.initial(o));
  }
  private initial(o: WorldObject): ObjectState {
    return {
      enabled: o.enabled,
      visible: true,
      moving: o.route ? o.route.activation === 'auto' || o.route.activation === 'rider' : true,
      active: false,
      pressed: false,
      timer: 0,
      routeIndex: 1,
      direction: 1,
      wait: 0,
      collapse: -1,
      returnTimer: 0,
      vx: 0,
      thrown: false,
      npcLine: 0,
      completed: false,
      closePending: false,
      motionTime: 0,
    };
  }
  state(o: WorldObject) {
    return this.states.get(o.id)!;
  }
  active(o: WorldObject) {
    const s = this.state(o);
    return s.enabled && s.visible && s.collapse !== -2;
  }
  visible(o: WorldObject) {
    return this.state(o).visible;
  }
  moving(o: WorldObject) {
    return this.active(o) && this.state(o).moving;
  }
  clock(o: WorldObject, dt: number) {
    if (this.moving(o)) this.state(o).motionTime += dt;
    return this.state(o).motionTime;
  }
  oneWay(o: WorldObject) {
    return (
      o.surface?.type === 'oneWay' || o.kind === 'collapsePlatform' || (!!o.route && o.route.oneWay)
    );
  }
  solid(o: WorldObject) {
    return ['surface', 'elevator', 'pathPlatform', 'collapsePlatform', 'pressurePlate'].includes(
      o.kind,
    );
  }
  private blocking(o: WorldObject) {
    return (
      this.solid(o) ||
      ['ground', 'platform', 'movingX', 'movingY', 'vanish', 'wall', 'crate', 'breakable'].includes(
        o.kind,
      ) ||
      (o.kind === 'door' && !o.opened) ||
      (o.kind === 'decoration' && o.solid)
    );
  }
  animation(o: WorldObject) {
    const s = this.state(o);
    return o.kind === 'npc' && this.speech?.id === o.id
      ? 'talk'
      : s.completed
        ? 'open'
        : s.active
          ? 'active'
          : s.collapse >= 0
            ? 'shake'
            : !s.enabled
              ? 'inactive'
              : undefined;
  }
  private occupied(o: Rect) {
    return (
      overlap(this.host.p, o) ||
      this.host.objects.some(
        (b) => b.kind === 'crate' && b.alive && this.host.p.carrying !== b.id && overlap(b, o),
      )
    );
  }
  private effect(id: string, index: number, reward: Reward) {
    const h = this.host,
      base = `reward:${id}:${index}`;
    if (h.run.claimed.has(base)) return;
    h.run.claimed.add(base);
    if (reward.kind === 'key') {
      h.run.keys.add(reward.key!);
      this.sound('coin');
    } else if (reward.kind === 'heart') {
      h.run.hearts = Math.min(3, h.run.hearts + reward.amount);
      this.sound('heart');
    } else if (['invincible', 'jump', 'speed', 'shield'].includes(reward.kind)) {
      h.powers[reward.kind] = reward.duration;
      this.sound('power');
    } else {
      for (let i = 0; i < reward.amount; i++)
        h.run.claim(`${base}:${i}`, reward.kind as 'coin' | 'bonus' | 'secret');
      this.sound(reward.kind === 'secret' ? 'secret' : 'coin');
    }
    h.burst(h.p.x, h.p.y);
  }
  actions(actions: Action[], source: string) {
    actions.forEach((a, i) => {
      const h = this.host;
      if (a.type === 'message') {
        h.say(a.text, 4);
        return;
      }
      if (a.type === 'reward') {
        this.effect(source, i, a.reward);
        return;
      }
      const o = h.objects.find((o) => o.id === a.target);
      if (!o) return;
      const s = this.state(o);
      switch (a.action) {
        case 'open':
          o.opened = true;
          s.closePending = false;
          break;
        case 'close':
          if (this.occupied(o)) s.closePending = true;
          else o.opened = false;
          break;
        case 'enable':
          if (this.blocking(o) && this.occupied(o)) return;
          s.enabled = true;
          break;
        case 'disable':
          s.enabled = false;
          break;
        case 'show':
          if (this.blocking(o) && this.occupied(o)) return;
          s.visible = true;
          break;
        case 'hide':
          s.visible = false;
          break;
        case 'start':
          if (!s.enabled && this.blocking(o) && this.occupied(o)) return;
          s.moving = true;
          s.enabled = true;
          break;
        case 'stop':
          s.moving = false;
          break;
        case 'toggle':
          if (!s.enabled && this.blocking(o) && this.occupied(o)) return;
          s.enabled = !s.enabled;
          break;
        case 'reset':
          if (!this.occupied({ x: o.ox, y: o.oy, w: o.w, h: o.h })) {
            this.states.set(o.id, this.initial(o));
            o.x = o.ox;
            o.y = o.oy;
            o.vy = 0;
            if (h.run.claimed.has(`interaction:${o.id}`)) {
              this.state(o).completed = true;
              o.opened = true;
            } else if (o.kind === 'door') o.opened = false;
          }
          break;
      }
    });
  }
  private activate(o: WorldObject, value: boolean) {
    const s = this.state(o);
    if (s.active === value) return;
    s.active = value;
    this.actions(value ? o.trigger!.on : o.trigger!.off, `${o.id}:${value ? 'on' : 'off'}`);
    this.sound('door');
  }
  private press(o: WorldObject, pressed: boolean) {
    const s = this.state(o),
      t = o.trigger!;
    if (t.mode === 'momentary') this.activate(o, pressed);
    else if (pressed && !s.pressed) {
      if (t.mode === 'toggle') this.activate(o, !s.active);
      else if (t.mode === 'once') this.activate(o, true);
      else {
        this.activate(o, true);
        s.timer = t.duration;
      }
    }
    s.pressed = pressed;
  }
  before(dt: number, c: Controls): boolean {
    const h = this.host,
      p = h.p;
    this.portalTime = Math.max(0, this.portalTime - dt);
    this.oxygenDamage = Math.max(0, this.oxygenDamage - dt);
    if (!h.objects.some((o) => o.portal && this.active(o) && overlap(p, o)))
      this.portalLocked = false;
    if (
      this.speech &&
      (this.speech.until < h.elapsed ||
        !near(
          p,
          h.objects.find((o) => o.id === this.speech!.id)!,
        ))
    )
      this.speech = undefined;
    for (const o of h.objects) {
      const s = this.state(o);
      if (s.closePending && !this.occupied(o)) {
        o.opened = false;
        s.closePending = false;
      }
      if (o.trigger && s.timer > 0) {
        s.timer -= dt;
        if (s.timer <= 0) this.activate(o, false);
      }
      if (o.kind === 'switch' && o.trigger && o.trigger.mode === 'momentary' && s.active && !c.up)
        this.press(o, false);
      if (o.collapse) {
        if (s.collapse > 0) {
          s.collapse -= dt;
          if (s.collapse <= 0) {
            s.collapse = -2;
            s.returnTimer = o.collapse.returnAfter || Infinity;
            this.sound('enemy');
          }
        }
        if (s.collapse === -2 && Number.isFinite(s.returnTimer)) {
          s.returnTimer = Math.max(0, s.returnTimer - dt);
          if (s.returnTimer === 0 && !this.occupied(o)) {
            s.collapse = -1;
          }
        }
      }
      if (o.route && this.active(o)) this.route(o, dt, c);
    }
    if (p.carrying && c.jumpPressed && c.down) {
      const o = h.objects.find((o) => o.id === p.carrying)!;
      if (o.carry?.throwable) {
        const s = this.state(o),
          target = {
            x: p.facing > 0 ? p.x + p.w + 3 : p.x - o.w - 3,
            y: p.y + p.h - o.h,
            w: o.w,
            h: o.h,
          };
        if (h.solids().some((b) => b !== o && overlap(target, b))) {
          h.say('Geen ruimte om te gooien.');
          return true;
        }
        p.carrying = undefined;
        o.x = target.x;
        o.y = target.y;
        s.vx = p.facing * o.carry.throwSpeed;
        o.vy = -o.carry.throwLift;
        s.thrown = true;
        this.sound('jump');
        h.say('Gegooid!');
        return true;
      }
    }
    return false;
  }
  private route(o: WorldObject, dt: number, c: Controls) {
    const h = this.host,
      p = h.p,
      r = o.route!,
      s = this.state(o),
      rider = onTop(p, o);
    if (r.activation === 'interact' && c.interact && near(p, o)) s.moving = true;
    if (!s.moving || (r.activation === 'rider' && !rider)) return;
    if (s.wait > 0) {
      s.wait = Math.max(0, s.wait - dt);
      return;
    }
    const target = r.points[s.routeIndex],
      dx = target.x + (o.hitbox?.offsetX || 0) - o.x,
      dy = target.y + (o.hitbox?.offsetY || 0) - o.y,
      d = Math.hypot(dx, dy),
      travel = Math.min(d, r.speed * dt),
      mx = d ? (dx / d) * travel : 0,
      my = d ? (dy / d) * travel : 0;
    const solids = h.solids().filter((b) => b !== o && b.kind !== 'crate'),
      next = { x: o.x + mx, y: o.y + my, w: o.w, h: o.h };
    const passengers = [
      ...(rider ? [p] : []),
      ...h.objects.filter(
        (b) => b.kind === 'crate' && b.alive && p.carrying !== b.id && onTop(b, o),
      ),
    ];
    const blocked =
      solids.some((b) => overlap(next, b)) ||
      (!rider && overlap(next, p)) ||
      passengers.some((b) =>
        solids.some((w) => overlap({ x: b.x + mx, y: b.y + my, w: b.w, h: b.h }, w)),
      );
    if (blocked) return; // Stop safely until clear; never crush or push a rider into a ceiling.
    o.x = next.x;
    o.y = next.y;
    for (const b of passengers) {
      b.x += mx;
      b.y += my;
    }
    if (d <= travel + 0.001) {
      s.wait = r.wait;
      if (r.mode === 'loop') s.routeIndex = (s.routeIndex + 1) % r.points.length;
      else {
        if (s.routeIndex === r.points.length - 1) s.direction = -1;
        if (s.routeIndex === 0) s.direction = 1;
        s.routeIndex += s.direction;
      }
      if (r.activation === 'interact') s.moving = false;
    }
  }
  playerStep(dt: number, c: Controls, boost: boolean) {
    const h = this.host,
      p = h.p,
      axis = Number(c.right) - Number(c.left),
      oldVx = p.vx,
      oldVy = p.vy;
    const env: Environment = {
      gravity: 1,
      speed: 1,
      friction: 1,
      forceX: 0,
      forceY: 0,
      driftX: 0,
      driftY: 0,
    };
    for (const [id, t] of this.lingering) {
      if (t <= dt) this.lingering.delete(id);
      else this.lingering.set(id, t - dt);
    }
    for (const o of h.objects) {
      if (!this.active(o)) continue;
      if (o.zone) {
        const inside = overlap(p, o);
        if (inside && o.zone.duration) this.lingering.set(o.id, o.zone.duration);
        if (inside || this.lingering.has(o.id)) {
          env.gravity *= o.zone.gravity;
          env.speed *= o.zone.speedFactor;
          env.forceX += o.zone.forceX;
          env.forceY += o.zone.forceY;
          env.driftX += o.zone.driftX;
          env.driftY += o.zone.driftY;
        }
      }
      if (o.water && overlap(p, o) && !env.water) env.water = o;
      if (o.ladder && overlap(p, o) && !env.ladder) env.ladder = o;
    }
    const surface = h.standing && this.active(h.standing) ? h.standing.surface : undefined;
    if (surface) {
      env.friction =
        surface.friction ?? (surface.type === 'ice' ? 0.12 : surface.type === 'mud' ? 1.5 : 1);
      env.speed *= surface.speedFactor ?? (surface.type === 'mud' ? 0.45 : 1);
      env.driftX += surface.conveyor;
    }
    env.gravity = Math.min(3, env.gravity);
    env.speed = Math.min(2, env.speed);
    this.environment = env;
    p.tick(dt, axis, boost);
    if (env.speed !== 1 || env.friction !== 1 || env.driftX !== 0)
      p.vx = approach(
        oldVx,
        axis * RULES.speed * (boost ? 1.45 : 1) * env.speed + env.driftX,
        RULES.acceleration * env.friction * dt,
      );
    if (env.gravity !== 1) p.vy = Math.min(850, oldVy + RULES.gravity * env.gravity * dt);
    p.vx = Math.max(
      -700,
      Math.min(700, (!axis && env.forceX ? oldVx * Math.exp(-2 * dt) : p.vx) + env.forceX * dt),
    );
    p.vy = Math.max(-850, Math.min(850, p.vy + env.forceY * dt));
    if (env.driftY !== 0) p.vy = approach(oldVy, env.driftY, 1800 * dt);
    this.swimming = !!env.water;
    if (!env.ladder || (!c.up && !c.down)) this.climbLock = false;
    this.climbing = !!env.ladder && !this.climbLock && (c.up || c.down || this.climbing);
    if (env.water) {
      const w = env.water.water!;
      p.vx = approach(oldVx, axis * w.speed + w.currentX, 1000 * dt);
      const vertical = Number(c.down) - Number(c.up);
      p.vy = vertical
        ? vertical * w.swimSpeed + w.currentY
        : Math.min(w.swimSpeed, oldVy + RULES.gravity * w.gravity * dt) * Math.max(0, 1 - dt * 2) +
          w.currentY * dt * 2;
      if (c.jumpPressed) p.vy = -(p.y < env.water.y + 18 ? w.exitJump : w.swimSpeed * 1.5);
      else if (c.up && p.y < env.water.y + 8) p.vy = -w.exitJump;
      p.buffer = 0;
      p.coyote = 0;
      if (w.oxygen && p.y + 8 > env.water.y) {
        if (this.oxygenZone !== env.water.id) {
          this.oxygen = { remaining: w.oxygen, total: w.oxygen };
          this.oxygenZone = env.water.id;
        }
        this.oxygen!.remaining = Math.max(0, this.oxygen!.remaining - dt);
      } else {
        this.oxygen = undefined;
        this.oxygenZone = undefined;
      }
    } else {
      this.oxygen = undefined;
      this.oxygenZone = undefined;
    }
    if (this.climbing && env.ladder) {
      p.vx = axis * RULES.speed * 0.5;
      p.vy = (Number(c.down) - Number(c.up)) * env.ladder.ladder!.speed;
      p.coyote = 0;
      p.buffer = 0;
      if (c.jumpPressed) {
        p.vy = -RULES.jump;
        this.climbing = false;
        this.climbLock = true;
      }
    }
  }
  afterMovement() {
    const h = this.host,
      s = h.standing?.surface;
    if (s?.type === 'bounce' && h.p.grounded) {
      h.p.vy = -s.bounce;
      h.p.grounded = false;
      h.p.coyote = 0;
      h.standing = undefined;
      this.sound('jump');
    }
    const o = h.standing;
    if (o?.collapse && this.state(o).collapse === -1) this.state(o).collapse = o.collapse.delay;
  }
  after(dt: number, c: Controls) {
    const h = this.host,
      p = h.p;
    for (const o of h.objects) {
      if (!o.alive || !this.active(o)) continue;
      if (o.carry && o.kind === 'crate' && p.carrying !== o.id) {
        const s = this.state(o);
        o.vy += RULES.gravity * dt;
        const b = { x: o.x, y: o.y, w: o.w, h: o.h, vx: s.vx, vy: o.vy };
        const collision = moveBody(
          b,
          dt,
          h.solids().filter((x) => x !== o),
        );
        o.x = b.x;
        o.y = b.y;
        o.vy = b.vy;
        s.vx = approach(b.vx, 0, (collision.grounded ? 450 : 30) * dt);
        if (o.y > h.level.world.height || o.x < 0 || o.x + o.w > h.level.world.width) {
          o.x = o.ox;
          o.y = o.oy;
          o.vy = 0;
          s.vx = 0;
          s.thrown = false;
        }
        if (s.thrown && o.carry.defeatsEnemies && Math.abs(s.vx) > 20)
          for (const enemy of h.objects)
            if (
              enemy.alive &&
              this.active(enemy) &&
              enemies.includes(enemy.kind) &&
              enemy.kind !== 'sentry' &&
              overlap(o, enemy)
            ) {
              enemy.alive = false;
              enemy.defeatedAt = h.elapsed;
              h.run.claim(enemy.id, 'enemy');
              h.burst(enemy.x, enemy.y);
              this.sound('enemy');
              s.vx *= 0.4;
            }
        if (Math.abs(s.vx) < 20) s.thrown = false;
      }
      if (o.kind === 'pressurePlate' && o.trigger) {
        const t = o.trigger;
        let weight = t.accepts !== 'crate' && onTop(p, o) ? 1 : 0;
        if (t.accepts !== 'player')
          for (const b of h.objects)
            if (b.kind === 'crate' && b.alive && p.carrying !== b.id && onTop(b, o))
              weight += b.carry?.weight ?? 1;
        this.press(o, weight >= t.weight);
      }
      if (
        o.portal &&
        o.portal.activation === 'auto' &&
        !this.portalLocked &&
        this.portalTime === 0 &&
        overlap(p, o)
      )
        this.teleport(o);
    }
    if (c.interact) {
      const targets = h.objects
        .filter(
          (o) =>
            o.alive &&
            this.active(o) &&
            near(p, o) &&
            (['switch', 'chest', 'npc'].includes(o.kind) ||
              (o.portal?.activation === 'interact' && overlap(p, o))),
        )
        .sort((a, b) => Math.abs(p.x - a.x) - Math.abs(p.x - b.x));
      const o = targets[0];
      if (o) {
        if (o.trigger) {
          this.state(o).pressed = false;
          this.press(o, true);
        }
        if (o.chest) this.chest(o);
        if (o.npc) this.npc(o);
        if (o.portal && this.portalTime === 0) this.teleport(o);
      }
    }
    if (this.oxygen?.remaining === 0 && this.oxygenDamage === 0) {
      this.oxygenDamage = 1.6;
      h.hurt(p.x + 1);
      h.say('Geen zuurstof! Zwem naar boven.');
    }
  }
  private permitted(key?: string, trigger?: string) {
    const h = this.host;
    if (key && !h.run.keys.has(key)) {
      h.say('Je hebt een sleutel nodig.');
      return false;
    }
    if (trigger && !this.states.get(trigger)?.active) {
      h.say('Activeer eerst de schakelaar.');
      return false;
    }
    return true;
  }
  private teleport(o: WorldObject) {
    const h = this.host,
      c = o.portal!;
    if (!this.permitted(c.key, c.switch)) return;
    const d = c.destination,
      t = 'object' in d ? h.objects.find((b) => b.id === d.object) : undefined;
    const target = 'object' in d ? { x: t!.x + d.offsetX, y: t!.y + d.offsetY } : d;
    const box = { ...target, w: h.p.w, h: h.p.h };
    if (
      box.x < 0 ||
      box.y < 0 ||
      box.x + box.w > h.level.world.width ||
      box.y + box.h > h.level.world.height ||
      h.solids().some((b) => overlap(box, b))
    ) {
      h.say('De bestemming is geblokkeerd.');
      this.portalTime = 0.5;
      return;
    }
    h.p.x = target.x;
    h.p.y = target.y;
    h.p.vx = 0;
    h.p.vy = 0;
    h.p.buffer = 0;
    h.p.coyote = 0;
    h.standing = undefined;
    this.portalTime = c.cooldown;
    this.portalLocked = true;
    this.climbing = false;
    if (c.secret) h.run.claim(`portal-secret:${o.id}`, 'secret');
    h.say(c.secret ? 'Een geheime doorgang!' : 'Doorgang gebruikt.');
    this.sound('door');
  }
  private chest(o: WorldObject) {
    const h = this.host,
      s = this.state(o);
    if (s.completed || !this.permitted(o.chest!.key, o.chest!.switch)) return;
    s.completed = true;
    o.opened = true;
    o.chest!.rewards.forEach((r, i) => this.effect(o.id, i, r));
    h.run.claimed.add(`interaction:${o.id}`);
    h.say('Schatkist geopend!');
  }
  private npc(o: WorldObject) {
    const h = this.host,
      n = o.npc!,
      s = this.state(o);
    if (s.completed && !n.repeatDialogue) return;
    if (!s.completed) {
      if (!this.permitted(n.requiresKey)) return;
      if (n.receive === 'crate' && !h.p.carrying) {
        this.talk(o, 'Breng mij een kist.');
        return;
      }
    }
    this.talk(o, n.lines[s.npcLine]);
    s.npcLine++;
    if (s.npcLine < n.lines.length) return;
    s.npcLine = 0;
    if (s.completed) return;
    if (n.receive === 'key' && n.consume) h.run.keys.delete(n.requiresKey!);
    if (n.receive === 'crate' && n.consume) {
      const b = h.objects.find((b) => b.id === h.p.carrying)!;
      b.alive = false;
      h.p.carrying = undefined;
    }
    if (n.reward) this.effect(o.id, 0, n.reward);
    this.actions(n.actions, `npc:${o.id}`);
    s.completed = true;
    h.run.claimed.add(`interaction:${o.id}`);
  }
  private talk(o: WorldObject, text: string) {
    this.speech = { id: o.id, text, until: this.host.elapsed + 6 };
    this.host.say(text, 6);
    this.sound('checkpoint');
  }
  respawn() {
    this.climbLock = false;
    this.oxygen = undefined;
    this.oxygenZone = undefined;
    this.lingering.clear();
    this.climbing = false;
    this.swimming = false;
    this.portalTime = 0.5;
    this.portalLocked = false;
    this.speech = undefined;
    for (const o of this.host.objects) {
      const s = this.state(o);
      s.vx = 0;
      s.thrown = false;
      if (o.resetOnDeath) {
        this.states.set(o.id, this.initial(o));
        o.x = o.ox;
        o.y = o.oy;
        o.vy = 0;
        if (o.kind === 'door') o.opened = false;
        if (this.host.run.claimed.has(`interaction:${o.id}`)) {
          this.state(o).completed = true;
          o.opened = true;
        }
      }
    }
  }
  destroy() {
    this.states.clear();
    this.lingering.clear();
    this.speech = undefined;
    this.oxygen = undefined;
  }
}
