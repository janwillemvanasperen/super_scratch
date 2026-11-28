import { Challenges } from '../mechanics/challenges';
import { WorldSystem } from '../mechanics/world-system';
import { drawBuilding } from '../mechanics/draw-building';
import type { Controls } from '../mechanics/world-types';
import Phaser from 'phaser';
import type { Level, Block } from '../levels/schema';
import { Run, RULES } from '../core/rules';
import { overlap, moveBody, type Rect } from '../core/physics';
import { Player } from '../entities/player';
import { makeArt, landscape } from '../entities/art';
import type { AudioEngine } from '../audio/audio';
import { mechanics } from '../mechanics/registry';
import { AssetRenderer, preloadGraphics } from '../assets/renderer';
import { objectBody, objectBounds } from '../assets/layout';
type Obj = Block & {
  ox: number;
  oy: number;
  alive: boolean;
  vy: number;
  phase: number;
  opened: boolean;
  layoutWidth?: number;
  layoutHeight?: number;
  facing?: number;
  attackUntil?: number;
  defeatedAt?: number;
};
type Shot = Rect & { vx: number; vy: number; ttl: number; damage?: number };
export type GameHooks = {
  hud: (
    run: Run,
    powers: Record<string, number>,
    message: string,
    oxygen?: { remaining: number; total: number },
    objectives?: string[],
  ) => void;
  pause: () => void;
  finish: (run: Run) => void;
  over: () => void;
};
export class GameScene extends Phaser.Scene {
  level!: Level;
  systems?: WorldSystem;
  challenge = new Challenges(this);
  speechLabel?: Phaser.GameObjects.Text;
  run = new Run();
  p!: Player;
  objects: Obj[] = [];
  shots: Shot[] = [];
  powers: Record<string, number> = {};
  checkpoint = { x: 60, y: 400 };
  keys!: Record<string, Phaser.Input.Keyboard.Key>;
  bg!: Phaser.GameObjects.Graphics;
  assetRenderer?: AssetRenderer;
  celebration = 0;
  fg!: Phaser.GameObjects.Graphics;
  hero!: Phaser.GameObjects.Sprite;
  cam = 0;
  elapsed = 0;
  accum = 0;
  message = '';
  messageUntil = 0;
  paused = false;
  mechanic?: ReturnType<typeof mechanics.wind>;
  sparkles: { x: number; y: number; vx: number; vy: number; t: number; color: number }[] = [];
  wasUp = false;
  wasDown = false;
  wasJump = false;
  standing?: Obj;
  labels: Phaser.GameObjects.Text[] = [];
  constructor(
    private definition: Level,
    readonly audio: AudioEngine,
    private hooks: GameHooks,
  ) {
    super('play');
  }
  preload() {
    preloadGraphics(this, this.definition);
  }
  createPlayer(x: number, y: number, visualOrigin = false) {
    const p = new Player(x, y);
    const h = this.level.character.hitbox;
    if (h) {
      p.w = h.width;
      p.h = h.height;
      if (visualOrigin) {
        p.x += h.offsetX;
        p.y += h.offsetY;
      }
    }
    return p;
  }
  create() {
    this.level = this.definition;
    this.challenge = new Challenges(this);
    this.run = new Run();
    this.objects = this.level.objects.map((b) => ({
      ...b,
      ...objectBody(b),
      ox: objectBody(b).x,
      oy: objectBody(b).y,
      alive: true,
      vy: 0,
      phase: 0,
      opened: false,
    }));
    this.p = this.createPlayer(this.level.spawn.x, this.level.spawn.y, true);
    this.checkpoint = { x: this.p.x, y: this.p.y };
    this.systems = new WorldSystem(this, (name) => this.audio.play(name));
    this.bg = this.add.graphics().setScrollFactor(0).setDepth(-1000);
    this.fg = this.add.graphics().setDepth(90);
    this.assetRenderer = new AssetRenderer(this, this.level);
    makeArt(this);
    this.hero = this.add
      .sprite(0, 0, 'hero0')
      .setDepth(110)
      .setOrigin(0)
      .setScale(2)
      .setTint(parseInt(this.level.character.color.slice(1), 16));
    this.keys = this.input.keyboard!.addKeys({
      left: 'LEFT',
      right: 'RIGHT',
      up: 'UP',
      down: 'DOWN',
      jump: 'SPACE',
      pause: 'ESC',
    }) as typeof this.keys;
    this.input.keyboard!.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.keys.pause.on('down', () => {
      if (!this.paused) this.hooks.pause();
    });
    this.game.events.on('blur', this.onBlur, this);
    this.events.once('shutdown', () => {
      this.game.events.off('blur', this.onBlur, this);
      this.audio.stop();
      this.assetRenderer?.destroy();
      this.mechanic?.destroy();
      this.systems?.destroy();
      this.shots = [];
      this.sparkles = [];
      this.input.keyboard?.removeAllKeys(true);
    });
    if (this.level.mechanic) this.mechanic = mechanics[this.level.mechanic]();
    this.audio.start(this.level.music.notes, this.level.music.tempo, this.level);
    this.say(this.level.instructions || 'Volg de munten. Het avontuur wacht!', 5);
    this.renderWorld();
  }
  onBlur() {
    if (!this.paused && !this.run.finished) this.hooks.pause();
  }
  setPaused(value: boolean) {
    this.paused = value;
    if (value) this.audio.pause();
    else this.audio.resume();
    this.input.keyboard?.resetKeys();
  }
  say(text: string, seconds = 3) {
    this.message = text;
    this.messageUntil = this.elapsed + seconds;
  }
  burst(x: number, y: number, color = 0xffd65b, n = 10) {
    for (let i = 0; i < n; i++)
      this.sparkles.push({
        x,
        y,
        vx: Math.cos((i / n) * Math.PI * 2) * 70,
        vy: Math.sin((i / n) * Math.PI * 2) * 70 - 40,
        t: 0.6,
        color,
      });
  }
  active(o: Obj) {
    return (
      o.alive &&
      (this.systems?.active(o) ?? true) &&
      (o.kind !== 'vanish' || this.elapsed % o.period < o.period * 0.72)
    );
  }
  solids() {
    return this.objects.filter(
      (o) =>
        this.active(o) &&
        ([
          'ground',
          'platform',
          'movingX',
          'movingY',
          'vanish',
          'breakable',
          'wall',
          'crate',
        ].includes(o.kind) ||
          (o.kind === 'door' && !o.opened) ||
          (o.kind === 'decoration' && o.solid) ||
          this.systems?.solid(o)) &&
        o.id !== this.p.carrying,
    );
  }
  update(_time: number, delta: number) {
    if (this.paused) return;
    if (this.run.finished) {
      this.celebration += Math.min(delta / 1000, 0.1);
      this.renderWorld();
      return;
    }
    this.accum += Math.min(delta / 1000, 0.1);
    while (this.accum >= 1 / 120) {
      this.tick(1 / 120);
      this.accum -= 1 / 120;
      if (this.paused || this.run.finished) break;
    }
    this.renderWorld();
    this.hooks.hud(
      this.run,
      this.powers,
      this.elapsed < this.messageUntil ? this.message : '',
      this.systems?.oxygen,
      this.challenge.hud(),
    );
  }
  tick(dt: number) {
    this.elapsed += dt;
    this.run.seconds += dt;
    const p = this.p;
    for (const key of Object.keys(this.powers)) {
      this.powers[key] -= dt;
      if (this.powers[key] <= 0) delete this.powers[key];
    }
    const jump = this.keys.jump.isDown,
      up = this.keys.up.isDown,
      down = this.keys.down.isDown;
    const controls: Controls = {
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
      up,
      down,
      jump,
      jumpPressed: jump && !this.wasJump,
      interact: up && !this.wasUp,
      downPressed: down && !this.wasDown,
    };
    if (jump && !this.wasJump) p.buffer = 0.13;
    if (!jump && this.wasJump && p.vy < -200) p.vy = -200;
    this.wasJump = jump;
    for (const o of this.objects) {
      const motionTime = this.systems?.clock(o, dt) ?? this.elapsed;
      if (this.systems && !this.systems.moving(o)) continue;
      const prevX = o.x,
        prevY = o.y;
      if (o.kind === 'movingX' || o.kind === 'trap')
        o.x = o.ox + Math.sin((motionTime * o.speed) / Math.max(o.range, 1)) * o.range;
      if (o.kind === 'decoration' && o.motion) {
        const d =
          Math.sin(
            (motionTime * Math.PI * 2) / o.motion.period + (o.motion.phase * Math.PI) / 180,
          ) * o.motion.distance;
        o.x = o.ox + (o.motion.axis === 'x' ? d : 0);
        o.y = o.oy + (o.motion.axis === 'y' ? d : 0);
      }
      if (o.kind === 'movingY')
        o.y = o.oy + Math.sin((motionTime * o.speed) / Math.max(o.range, 1)) * o.range;
      if (o === this.standing && this.active(o)) {
        p.x += o.x - prevX;
        p.y += o.y - prevY;
      }
    }
    const threw = this.systems?.before(dt, controls) ?? false;
    if (threw) {
      p.buffer = 0;
      controls.jumpPressed = false;
    }
    if (this.systems) this.systems.playerStep(dt, controls, !!this.powers.speed);
    else
      p.tick(
        dt,
        Number(this.keys.right.isDown) - Number(this.keys.left.isDown),
        !!this.powers.speed,
      );
    this.mechanic?.update(dt, p);
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = -RULES.jump * (this.powers.jump ? 1.27 : 1);
      p.grounded = false;
      p.coyote = 0;
      p.buffer = 0;
      this.audio.play('jump');
    }
    const previousBottom = p.y + p.h;
    const solids = this.solids().filter(
      (o) =>
        !(['movingX', 'movingY', 'vanish'].includes(o.kind) || this.systems?.oneWay(o)) ||
        (p.vy >= 0 && previousBottom <= o.y + 3),
    );
    const collision = moveBody(p, dt, solids);
    p.grounded = collision.grounded;
    this.standing = solids.find(
      (o) => Math.abs(p.y + p.h - o.y) < 1 && p.x + p.w > o.x && p.x < o.x + o.w,
    );
    this.systems?.afterMovement();
    if (collision.ceiling) {
      const b = collision.ceiling as Obj;
      if (b.kind === 'breakable') {
        b.alive = false;
        this.burst(b.x + b.w / 2, b.y, 0xf8ae73);
        this.audio.play('enemy');
      }
    }
    p.x = Phaser.Math.Clamp(p.x, 0, this.level.world.width - p.w);
    if (p.y > this.level.world.height + 50) {
      this.loseLife();
      return;
    }
    for (const o of this.objects) {
      if (!o.alive || (this.systems && !this.systems.active(o))) continue;
      if (o.enemy) {
        this.challenge.enemy(o, dt, previousBottom);
        if (this.p !== p) return;
        continue;
      }
      if (['walker', 'chaser', 'jumper', 'flyer', 'shooter', 'sentry'].includes(o.kind)) {
        this.enemy(o, dt);
        if (overlap(p, o)) {
          if (
            this.powers.invincible ||
            (p.vy > 0 && previousBottom <= o.y + 12 && o.kind !== 'sentry')
          ) {
            o.alive = false;
            o.defeatedAt = this.elapsed;
            if (this.run.claim(o.id, 'enemy')) this.burst(o.x, o.y, 0xff967e);
            p.vy = -330;
            this.audio.play('enemy');
          } else this.hurt(o.x);
        }
        continue;
      }
      if (o.kind === 'falling') {
        if (Math.abs(p.x - o.x) < 100 || o.y !== o.oy) {
          o.vy += 800 * dt;
          o.y += o.vy * dt;
          if (o.y > this.level.world.height) {
            o.y = o.oy;
            o.vy = 0;
          }
        }
      }
      if (o.kind === 'crate' && !o.carry && p.carrying !== o.id) {
        o.vy += RULES.gravity * dt;
        const body = { x: o.x, y: o.y, w: o.w, h: o.h, vx: 0, vy: o.vy };
        moveBody(
          body,
          dt,
          this.solids().filter((b) => b.id !== o.id),
        );
        o.y = body.y;
        o.vy = body.vy;
        if (o.y > this.level.world.height) {
          o.x = o.ox;
          o.y = o.oy;
          o.vy = 0;
        }
      }
      if (o.kind === 'decoration' && o.text && Math.abs(p.x - o.x) < 120) this.say(o.text, 0.2);
      if (!overlap(p, o)) continue;
      switch (o.kind) {
        case 'coin':
        case 'bonus':
          if (this.run.claim(o.id, o.kind)) {
            this.audio.play('coin');
            this.burst(o.x, o.y);
          }
          o.alive = false;
          break;
        case 'heart':
          if (this.run.hearts < 3) {
            this.run.hearts++;
            o.alive = false;
            this.run.claimed.add(o.id);
            this.audio.play('heart');
            this.burst(o.x, o.y, 0xff8ea5);
          }
          break;
        case 'key':
          this.run.keys.add(o.key || o.id);
          o.alive = false;
          this.run.claimed.add(o.id);
          this.audio.play('coin');
          this.say('Sleutel gevonden! Open de deur met ↑.');
          break;
        case 'invincible':
        case 'jump':
        case 'speed':
        case 'shield':
          this.powers[o.kind] = o.duration;
          o.alive = false;
          this.audio.play('power');
          this.burst(o.x, o.y, 0x89f5ce);
          this.say(
            {
              invincible: 'Sterrenkracht: onkwetsbaar!',
              jump: 'Maanlaarzen: spring hoger!',
              speed: 'Turbo: sneller lopen!',
              shield: 'Schild: vangt één klap op!',
            }[o.kind],
          );
          break;
        case 'spikes':
        case 'trap':
        case 'falling':
        case 'lava':
          this.hurt(o.x);
          break;
        case 'spring':
          if (p.vy >= 0) {
            p.y = o.y - p.h;
            p.vy = -740;
            this.audio.play('jump');
            this.burst(o.x, o.y, 0xbdf697);
          }
          break;
        case 'checkpoint':
          if (this.checkpoint.x !== o.x) {
            this.checkpoint = { x: o.x, y: o.y - p.h };
            this.audio.play('checkpoint');
            this.say('Checkpoint! Hier ga je verder na een verloren leven.');
            this.burst(o.x, o.y, 0x8cf3cc);
          }
          break;
        case 'secret':
          if (this.run.claim(o.id, 'secret')) {
            this.audio.play('secret');
            this.say(o.text || 'Geheime plek ontdekt! +500', 4);
            this.burst(o.x, o.y, 0xf9b4ff, 28);
          }
          break;
        case 'finish':
          if (this.level.goals?.length || o.requirements?.length || this.level.events?.length) break;
          this.run.finish(this.level.targetTime);
          this.run.finished = true;
          this.audio.stop(true);
          this.audio.play('finish');
          this.hooks.finish(this.run);
          return;
        case 'passage':
          if (o.portal) break;
          if (up && !this.wasUp && o.target) {
            p.x = o.target.x;
            p.y = o.target.y;
            p.vy = 0;
            this.audio.play('door');
            this.say('Een geheime doorgang…');
          }
          break;
      }
    }
    if (up && !this.wasUp) {
      for (const o of this.objects)
        if (
          o.kind === 'door' &&
          !o.opened &&
          Math.abs(p.x - o.x) < 75 &&
          Math.abs(p.y - o.y) < 130
        ) {
          if (this.run.keys.has(o.key!)) {
            o.opened = true;
            this.audio.play('door');
            this.burst(o.x, o.y, 0xc6a1ff);
            this.say('Deur geopend!');
          } else this.say('Je hebt een sleutel nodig.');
        }
    }
    if (down && !this.wasDown && !threw) {
      if (p.carrying) {
        const o = this.objects.find((o) => o.id === p.carrying)!;
        const pos = {
          x: o.carry ? (p.facing > 0 ? p.x + p.w + 4 : p.x - o.w - 4) : p.x + p.facing * 38,
          y: o.carry ? p.y + p.h - o.h : p.y,
          w: o.w,
          h: o.h,
        };
        if (!this.solids().some((b) => overlap(pos, b))) {
          o.x = Phaser.Math.Clamp(pos.x, 0, this.level.world.width - o.w);
          o.y = pos.y;
          p.carrying = undefined;
          this.say('Voorwerp neergezet.');
        } else this.say('Maak eerst wat ruimte om het voorwerp neer te zetten.');
      } else {
        const o = this.objects.find(
          (o) =>
            o.kind === 'crate' &&
            o.alive &&
            (this.systems?.active(o) ?? true) &&
            Math.abs(p.x - o.x) < 60 &&
            Math.abs(p.y - o.y) < 60,
        );
        if (o) {
          p.carrying = o.id;
          this.say('Opgepakt! Druk ↓ om neer te zetten.');
        }
      }
    }
    if (p.carrying) {
      const o = this.objects.find((o) => o.id === p.carrying)!;
      o.x = p.x;
      o.y = p.y - (o.carry ? o.h + 3 : 28);
    }
    this.systems?.after(dt, controls);
    if (this.p !== p) return;
    this.challenge.tick();
    const finishes = this.objects.filter(
      (o) => o.kind === 'finish' && o.alive && this.active(o) && overlap(p, o),
    );
    if (finishes.length) {
      const missing = finishes.map((o) =>
        this.challenge
          .goals(o)
          .map((g) => this.challenge.progress(g))
          .filter((g) => !g.done),
      );
      if (missing.some((goals) => !goals.length)) {
        this.run.finish(this.level.targetTime);
        this.audio.stop(true);
        this.audio.play('finish');
        this.hooks.finish(this.run);
        return;
      }
      this.say('Finish gesloten. Nog nodig: ' + missing[0].map((g) => g.text).join(', '), 0.25);
    }
    this.wasUp = up;
    this.wasDown = down;
    this.shots = this.shots.filter((s) => {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.ttl -= dt;
      if (overlap(p, s)) {
        if (s.damage !== 0) this.hurt(s.x, s.damage);
        return false;
      }
      return s.ttl > 0 && !this.solids().some((b) => overlap(s, b));
    });
    this.sparkles = this.sparkles.filter((s) => {
      s.t -= dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 150 * dt;
      return s.t > 0;
    });
    this.cam +=
      (Phaser.Math.Clamp(p.x - 320, 0, this.level.world.width - 960) - this.cam) *
      Math.min(1, dt * 6);
  }
  enemy(o: Obj, dt: number) {
    const oldX = o.x;
    o.phase += dt;
    const direction = this.p.x > o.x ? 1 : -1;
    if (o.kind === 'flyer') {
      o.x = o.ox + Math.sin((this.elapsed * o.speed) / Math.max(1, o.range)) * o.range;
      o.y = o.oy + Math.sin(this.elapsed * 2) * 24;
    } else if (o.kind !== 'sentry' && o.kind !== 'shooter') {
      let vx =
        o.kind === 'chaser' && Math.abs(this.p.x - o.x) < 280
          ? direction * o.speed
          : Math.cos((o.phase * o.speed) / Math.max(1, o.range)) >= 0
            ? o.speed
            : -o.speed;
      if (o.x < o.ox - o.range) vx = Math.abs(vx);
      if (o.x > o.ox + o.range) vx = -Math.abs(vx);
      o.vy += RULES.gravity * dt;
      const body = { ...o, vx, vy: o.vy };
      const result = moveBody(body, dt, this.solids());
      o.x = body.x;
      o.y = body.y;
      o.vy = body.vy;
      if (o.kind === 'jumper' && result.grounded && o.phase > 1.5) {
        o.vy = -360;
        o.phase = 0;
      }
      if (o.y > this.level.world.height) {
        o.x = o.ox;
        o.y = o.oy;
        o.vy = 0;
      }
    }
    if (o.x !== oldX) o.facing = o.x > oldX ? 1 : -1;
    if (o.kind === 'shooter' && o.phase > o.period && Math.abs(this.p.x - o.x) < 650) {
      o.phase = 0;
      o.attackUntil = this.elapsed + 0.3;
      o.facing = direction;
      this.shots.push({
        x: o.x + o.w / 2,
        y: o.y + 8,
        w: 10,
        h: 10,
        vx: direction * (o.speed + 130),
        vy: 0,
        ttl: 4,
      });
    }
  }
  music(notes: number[], tempo: number) {
    this.audio.start(notes, tempo);
    if (this.paused) this.audio.pause();
  }
  hurt(x: number, damage = 1) {
    const p = this.p;
    if (p.invuln > 0 || this.powers.invincible) return;
    if (this.powers.shield) {
      delete this.powers.shield;
      p.invuln = 1;
      this.audio.play('power');
      return;
    }
    this.run.hearts = Math.max(0, this.run.hearts - damage);
    this.audio.play('hurt');
    this.burst(p.x, p.y, 0xff7676);
    p.invuln = 1.5;
    p.vx = p.x < x ? -260 : 260;
    p.vy = -260;
    if (this.run.hearts <= 0) this.loseLife();
  }
  loseLife() {
    this.audio.play('life');
    if (!this.run.loseLife()) {
      this.paused = true;
      this.audio.stop(true);
      this.audio.play('over');
      this.hooks.over();
      return;
    }
    this.p = this.createPlayer(this.checkpoint.x, this.checkpoint.y);
    this.p.invuln = 2;
    this.powers = {};
    this.shots = [];
    this.standing = undefined;
    for (const o of this.objects) {
      if (o.kind === 'crate' || o.kind === 'falling') {
        o.x = o.ox;
        o.y = o.oy;
        o.vy = 0;
      }
    }
    this.systems?.respawn();
    this.say('Nieuw leven. Je verzamelde punten blijven behouden.');
  }
  renderWorld() {
    const g = this.fg,
      p = this.p;
    const artTime = this.elapsed + this.celebration;
    if (
      !this.level.background ||
      this.level.background.legacy ||
      (this.level.background.layers.length > 0 &&
        !this.level.background.layers.some((l) => this.assetRenderer?.available(l.visual)))
    )
      landscape(this.bg, 960, 540, this.level.palette, this.cam, this.elapsed);
    else {
      this.bg.clear();
      this.bg.fillStyle(
        parseInt((this.level.background.color || this.level.palette.sky).slice(1), 16),
      );
      this.bg.fillRect(0, 0, 960, 540);
    }
    if (this.challenge.background !== undefined) {
      this.bg.fillStyle(this.challenge.background, 0.45);
      this.bg.fillRect(0, 0, 960, 540);
    }
    this.assetRenderer?.begin();
    this.assetRenderer?.layers(this.cam, artTime);
    g.clear();
    const col = (s: string) => parseInt(s.slice(1), 16);
    const rect = (x: number, y: number, w: number, h: number, c: number) => {
      g.fillStyle(c);
      g.fillRect(Math.round(x - this.cam), Math.round(y), w, h);
    };
    for (const o of this.objects) {
      if (this.systems && !this.systems.visible(o)) continue;
      if (this.challenge.hidden(o)) continue;
      if (o.enemy && o.alive && (o.enemy.bar ?? o.enemy.boss)) {
        g.fillStyle(0x241a2f);
        g.fillRect(o.x - this.cam, o.y - 9, o.w, 5);
        g.fillStyle(0x68ec9b);
        g.fillRect(o.x - this.cam, o.y - 9, (o.w * this.challenge.state(o).hp) / o.enemy.hp, 5);
      }
      const visual = o.visual || this.level.styles?.[o.kind];
      const defeated =
        !o.alive &&
        o.defeatedAt !== undefined &&
        artTime - o.defeatedAt <
          Math.min(
            3,
            (visual?.animations?.defeat?.frames.length || 0) /
              (visual?.animations?.defeat?.fps || 8),
          );
      if ((!o.alive && !defeated) || o.x + o.w < this.cam - 200 || o.x > this.cam + 1160) continue;
      const enemy =
        !!o.enemy || ['walker', 'chaser', 'jumper', 'flyer', 'shooter', 'sentry'].includes(o.kind);
      const state =
        this.systems?.animation(o) ||
        (defeated
          ? 'defeat'
          : o.opened
            ? 'open'
            : o.kind === 'checkpoint' && this.checkpoint.x === o.x
              ? 'active'
              : (o.attackUntil || 0) > this.elapsed
                ? 'attack'
                : enemy
                  ? o.kind === 'flyer'
                    ? 'fly'
                    : o.vy < -10
                      ? 'jump'
                      : o.vy > 30
                        ? 'fall'
                        : o.kind === 'sentry' || o.kind === 'shooter'
                          ? 'idle'
                          : 'walk'
                  : visual?.animation || 'idle');
      const alpha =
        o.kind === 'vanish' && !this.active(o)
          ? 0.15
          : o.kind === 'secret' && !this.run.claimed.has(o.id)
            ? 0.08
            : 1;
      if (
        this.assetRenderer?.draw(
          `object:${o.id}`,
          objectBounds(o),
          visual,
          state,
          artTime,
          this.cam,
          enemy ? o.facing || 1 : 1,
          alpha * (this.systems && !this.systems.active(o) ? 0.2 : 1),
        )
      )
        continue;
      if (defeated) continue;
      if (this.systems && drawBuilding(g, o, this.systems.state(o), this.cam, this.elapsed))
        continue;
      let c = o.color ? col(o.color) : col(this.level.palette.accent);
      const x = o.x,
        y = o.y;
      if (['ground', 'platform', 'movingX', 'movingY', 'vanish', 'wall'].includes(o.kind)) {
        if (o.kind === 'vanish' && !this.active(o)) {
          g.lineStyle(2, c, 0.35);
          g.strokeRect(x - this.cam, y, o.w, o.h);
          continue;
        }
        rect(x, y, o.w, o.h, o.kind === 'ground' ? col(this.level.palette.ground) : 0x536480);
        rect(x, y, o.w, 7, o.kind === 'ground' ? col(this.level.palette.near) : c);
        for (let j = 12; j < o.w; j += 24) rect(x + j, y + 14, 8, 4, 0xffffff);
        if (o.kind === 'ground')
          for (let j = 8; j < o.w; j += 36) rect(x + j, y + 32, 6, 5, 0x364654);
      } else if (o.enemy) {
        rect(x, y + 4, o.w, o.h - 4, o.enemy.boss ? 0x874b82 : 0x4b577d);
        rect(x + o.w * 0.12, y, o.w * 0.76, 7, 0xf1be73);
        rect(x + o.w * 0.24, y + o.h * 0.35, o.w * 0.52, 6, 0xfde7ba);
      } else if (o.kind === 'objective') {
        if (o.text) rect(x, y + o.h - 4, o.w, 4, 0x9fd4ce);
      } else if (['walker', 'chaser', 'jumper', 'flyer', 'shooter', 'sentry'].includes(o.kind)) {
        rect(x + 3, y, o.w - 6, o.h, c);
        rect(x, y + 5, o.w, o.h - 10, c);
        rect(x + 5, y + 6, 5, 7, 0xffffff);
        rect(x + o.w - 10, y + 6, 5, 7, 0xffffff);
        rect(x + 7, y + 8, 3, 4, 0x172039);
        rect(x + o.w - 8, y + 8, 3, 4, 0x172039);
        rect(x + 3, y + o.h - 3, 7, 5, 0x263447);
        rect(x + o.w - 10, y + o.h - 3, 7, 5, 0x263447);
        if (o.kind === 'flyer') {
          rect(x - 8, y + Math.sin(this.elapsed * 15) * 5, 8, 5, 0xffffff);
          rect(x + o.w, y - Math.sin(this.elapsed * 15) * 5, 8, 5, 0xffffff);
        }
      } else if (o.kind === 'coin') {
        const ww = Math.max(4, Math.abs(Math.cos(this.elapsed * 4 + x)) * 16);
        rect(x + (o.w - ww) / 2, y + Math.sin(this.elapsed * 3 + x) * 3, ww, 20, 0xffd65b);
        rect(x + o.w / 2 - 2, y + 4, 3, 10, 0xfff2bb);
      } else if (o.kind === 'door') {
        rect(x, y, o.w, o.h, 0x362e5e);
        rect(x + 4, y + 4, o.w - 8, o.h - 4, o.opened ? 0x182139 : 0x8c6ac7);
        if (!o.opened) {
          rect(x + o.w - 12, y + o.h / 2, 6, 6, 0xffdb80);
          rect(x + 8, y + 8, 5, o.h - 16, 0xb195e0);
        }
      } else if (o.kind === 'finish') {
        rect(x + 10, y, 5, o.h, 0xf9edc3);
        rect(x + 15, y, 52, 32, 0xffcc60);
        rect(x + 24, y + 7, 9, 9, 0xffffff);
        rect(x + 33, y + 16, 9, 9, 0xffffff);
        rect(x, y + o.h - 8, 45, 8, 0xd39b51);
      } else if (o.kind === 'checkpoint') {
        rect(x + 8, y, 4, o.h, 0xffefca);
        rect(x + 12, y, 27, 20, this.checkpoint.x === o.x ? 0x8af2c6 : 0x657aa6);
      } else if (['spikes', 'lava', 'trap'].includes(o.kind)) {
        if (o.kind === 'lava') {
          rect(x, y, o.w, o.h, 0xf46c57);
          for (let j = 0; j < o.w; j += 16)
            rect(x + j, y + Math.sin(this.elapsed * 5 + j) * 3, 10, 5, 0xffd56a);
        } else
          for (let j = 0; j < o.w; j += 16) {
            g.fillStyle(c);
            g.fillTriangle(
              x + j - this.cam,
              y + o.h,
              x + j + 8 - this.cam,
              y,
              x + j + 16 - this.cam,
              y + o.h,
            );
          }
      } else if (o.kind === 'spring') {
        rect(x, y + o.h - 6, o.w, 6, 0x20354b);
        for (let j = 2; j < o.h - 5; j += 5) rect(x + 5, y + j, o.w - 10, 2, 0xf8df7c);
        rect(x, y, o.w, 5, 0xff7f91);
      } else if (o.kind === 'breakable' || o.kind === 'crate' || o.kind === 'falling') {
        rect(x, y, o.w, o.h, c);
        rect(x + 3, y + 3, o.w - 6, o.h - 6, 0x8c6253);
        rect(x + 5, y + 5, o.w - 10, 3, c);
        rect(x + 5, y + o.h - 8, o.w - 10, 3, c);
        rect(x + o.w / 2 - 2, y + 3, 4, o.h - 6, c);
      } else if (o.kind === 'key') {
        rect(x + 2, y + 3, 12, 12, 0xffde72);
        rect(x + 6, y + 6, 4, 5, 0x624964);
        rect(x + 12, y + 10, 15, 5, 0xffde72);
        rect(x + 22, y + 13, 4, 7, 0xffde72);
      } else if (o.kind === 'heart') {
        rect(x + 2, y + 3, 9, 9, 0xff83a4);
        rect(x + 14, y + 3, 9, 9, 0xff83a4);
        rect(x + 5, y + 9, 15, 9, 0xff83a4);
        rect(x + 9, y + 17, 7, 5, 0xff83a4);
      } else if (['invincible', 'jump', 'speed', 'shield', 'bonus'].includes(o.kind)) {
        rect(x + 4, y, 20, 28, c);
        rect(x, y + 4, 28, 20, c);
        rect(x + 7, y + 7, 14, 14, 0x243959);
        if (o.kind === 'jump') {
          rect(x + 12, y + 8, 5, 12, 0xffffff);
          rect(x + 8, y + 10, 13, 4, 0xffffff);
        } else if (o.kind === 'speed') {
          rect(x + 9, y + 10, 10, 4, 0xffffff);
          rect(x + 12, y + 14, 10, 4, 0xffffff);
        } else {
          rect(x + 12, y + 9, 4, 12, 0xffffff);
          rect(x + 8, y + 13, 12, 4, 0xffffff);
        }
      } else if (o.kind === 'secret') {
        g.lineStyle(2, 0xfff1a7, this.run.claimed.has(o.id) ? 0.6 : 0.15);
        g.strokeRect(x - this.cam, y, o.w, o.h);
        if (this.run.claimed.has(o.id)) rect(x + o.w / 2 - 5, y + 10, 10, 10, 0xffdc74);
      } else if (o.kind === 'passage') {
        rect(x, y, o.w, o.h, 0x242d49);
        rect(x + 5, y + 5, o.w - 10, o.h - 5, 0x101b30);
      } else if (o.kind === 'decoration') {
        rect(x + 12, y, 7, o.h, 0x546b66);
        rect(x, y, 32, 22, c);
        rect(x + 7, y + 7, 18, 3, 0x304159);
      }
    }
    this.shots.forEach((s, i) => {
      if (
        !this.assetRenderer?.draw(
          `shot:${i}`,
          s,
          this.level.styles?.projectile,
          'idle',
          artTime,
          this.cam,
          s.vx >= 0 ? 1 : -1,
        )
      )
        rect(s.x, s.y, s.w, s.h, 0xffbb81);
    });
    for (const s of this.sparkles) rect(s.x, s.y, 4, 4, s.color);
    const heroState = this.run.finished
      ? 'victory'
      : this.systems?.climbing
        ? 'climb'
        : this.systems?.swimming
          ? 'swim'
          : p.invuln > 0
            ? 'hurt'
            : p.vy < -20
              ? 'jump'
              : !p.grounded && p.vy > 20
                ? 'fall'
                : Math.abs(p.vx) > 20
                  ? 'walk'
                  : 'idle';
    const h = this.level.character.hitbox;
    const heroDrawn = this.assetRenderer?.draw(
      'player',
      { x: p.x - (h?.offsetX || 0), y: p.y - (h?.offsetY || 0), w: p.w, h: p.h },
      this.level.character.visual,
      heroState,
      artTime,
      this.cam,
      p.facing,
      p.invuln > 0 && Math.floor(this.elapsed * 14) % 2 ? 0.25 : 1,
      110,
    );
    this.hero.setVisible(!heroDrawn);
    this.hero
      .setPosition(Math.round(p.x - this.cam - 3), Math.round(p.y - 2))
      .setFlipX(p.facing < 0)
      .setTexture(
        `hero${p.grounded && Math.abs(p.vx) > 20 ? 1 + (Math.floor(this.elapsed * 12) % 2) : 0}`,
      )
      .setAlpha(p.invuln > 0 && Math.floor(this.elapsed * 14) % 2 ? 0.25 : 1);
    if (this.powers.shield || this.powers.invincible) {
      g.lineStyle(2, this.powers.shield ? 0x9ee6ff : 0xffe28d);
      g.strokeCircle(p.x - this.cam + p.w / 2, p.y + p.h / 2, Math.max(p.w, p.h) / 2 + 9);
    }
    const speech = this.systems?.speech;
    if (speech) {
      const o = this.objects.find((o) => o.id === speech.id)!;
      this.speechLabel ??= this.add
        .text(0, 0, '', {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#172039',
          backgroundColor: '#fff3ce',
          padding: { x: 10, y: 8 },
          wordWrap: { width: 230 },
        })
        .setDepth(500);
      this.speechLabel
        .setText(speech.text)
        .setPosition(Math.max(8, Math.min(700, o.x - this.cam - 70)), Math.max(80, o.y - 85))
        .setVisible(true);
    } else this.speechLabel?.setVisible(false);
    this.assetRenderer?.end();
  }
}
