import Phaser from 'phaser';
import { GameScene } from '../src/scenes/GameScene';
import { AudioEngine } from '../src/audio/audio';
import { levelSchema, type Level } from '../src/levels/schema';
import { auditLevel } from '../src/levels/audit';
import { levelEntry } from '../src/levels/entries';
import { assetReferenceIssues } from '../src/assets/catalog';

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const checked = (id: string) => el<HTMLInputElement>(id).checked;
const audio = new AudioEngine();
let game: Phaser.Game | undefined,
  scene: Builder | undefined,
  current: Level | undefined,
  busy = false;
let samples: number[] = [],
  frameTimes: number[] = [],
  measure = false,
  worldError = '';
class Builder extends GameScene {
  private debug?: Phaser.GameObjects.Graphics;
  update(time: number, delta: number) {
    const t = performance.now();
    if (this.p && checked('safe')) this.p.invuln = 2;
    if (this.p && checked('fly')) {
      if (!this.paused) {
        const step = Math.min(delta / 1000, 0.05) * 420;
        this.go(
          this.p.x + step * (Number(this.keys.right.isDown) - Number(this.keys.left.isDown)),
          this.p.y + step * (Number(this.keys.down.isDown) - Number(this.keys.up.isDown)),
        );
      }
      this.renderWorld();
    } else super.update(time, delta);
    if (!this.p) return;
    const overlay = (this.debug ??= this.add.graphics().setDepth(700));
    overlay.clear();
    if (checked('boxes')) {
      overlay.lineStyle(1, 0xfcef82, 0.65);
      overlay.strokeRect(this.p.x - this.cam, this.p.y, this.p.w, this.p.h);
      for (const o of this.objects) {
        if (
          o.x + o.w < this.cam ||
          o.x > this.cam + 960 ||
          o.y + o.h < this.camY ||
          o.y > this.camY + 540
        )
          continue;
        overlay.lineStyle(
          1,
          o.trigger || o.zone || o.water || o.portal ? 0x75eeff : 0xfcef82,
          0.65,
        );
        overlay.strokeRect(o.x - this.cam, o.y, o.w, o.h);
        const route = o.route?.points ?? o.enemy?.behavior.route;
        if (route?.length) {
          overlay.beginPath();
          overlay.moveTo(route[0].x - this.cam, route[0].y);
          for (const p of route.slice(1)) overlay.lineTo(p.x - this.cam, p.y);
          overlay.strokePath();
        }
      }
      for (const z of this.level.camera?.zones ?? [])
        overlay.strokeRect(z.x - this.cam, z.y, z.w, z.h);
    }
    if (measure) {
      samples.push(performance.now() - t);
      frameTimes.push(delta);
    }
    if (Math.floor(time / 200) !== Math.floor((time - delta) / 200)) {
      el('stats').textContent =
        'Speler X ' +
        Math.round(this.p.x) +
        ' Y ' +
        Math.round(this.p.y) +
        ' · camera ' +
        Math.round(this.cam) +
        ', ' +
        Math.round(this.camY) +
        ' · ' +
        this.objects.length +
        ' objecten';
      el('errors').textContent = [worldError, ...this.mechanicErrors].filter(Boolean).join('\n');
    }
  }
  go(x: number, y: number) {
    if (!this.p || !Number.isFinite(x) || !Number.isFinite(y)) return;
    Object.assign(this.p, {
      x: Math.max(0, Math.min(this.level.world.width - this.p.w, x)),
      y: Math.max(0, Math.min(this.level.world.height - this.p.h, y)),
      vx: 0,
      vy: 0,
    });
    this.updateCamera(0, true);
  }
}
async function load(file: string, stress = false) {
  const result = await fetch('/levels/' + levelEntry(file).file);
  if (!result.ok) throw Error('Levelbestand niet gevonden');
  const raw = await result.json();
  if (stress) {
    raw.world = { width: 8000, height: 2200 };
    raw.camera = {
      axis: 'both',
      zones: [{ x: 750, y: 1550, w: 200, h: 320, viewX: 450, viewY: 1480 }],
    };
    raw.spawn = { x: 60, y: 1940 };
    raw.objects = raw.objects.map((o: any) => ({ ...o, y: o.y + 1520 }));
    raw.objects.push(
      { id: 'ladder-qa', kind: 'ladder', x: 800, y: 900, w: 48, h: 600, ladder: {} },
      { id: 'ladder-qa-low', kind: 'ladder', x: 800, y: 1490, w: 48, h: 510, ladder: {} },
      { id: 'upper-qa', kind: 'checkpoint', x: 800, y: 930, w: 36, h: 40 },
      { id: 'upper-floor-qa', kind: 'platform', x: 850, y: 970, w: 420, h: 18 },
    );
    for (let i = 0; i < 1100; i++)
      raw.objects.push({
        id: 'stress-' + i,
        kind: 'decoration',
        x: 1400 + (i % 80) * 76,
        y: 50 + Math.floor(i / 80) * 80,
        w: 12,
        h: 16,
      });
  }
  return levelSchema.parse(raw);
}
async function boot(level: Level, checkpoint?: string) {
  if (game) {
    const previous = game;
    await new Promise<void>((resolve) => {
      previous.events.once('destroy', resolve);
      previous.destroy(true);
    });
  }
  current = level;
  const audit = auditLevel(level);
  worldError = [...audit.errors, ...audit.warnings, ...assetReferenceIssues(level)].join('\n');
  const dropdown = el<HTMLSelectElement>('checkpoints');
  dropdown.replaceChildren();
  dropdown.add(new Option('Startpositie', ''));
  for (const o of level.objects.filter((o) => o.kind === 'checkpoint'))
    dropdown.add(new Option(o.id, o.id));
  dropdown.value = checkpoint ?? '';
  const ready = new Promise<void>((resolve) => {
    scene = new (class extends Builder {
      create() {
        super.create();
        const cp = this.objects.find((o) => o.id === checkpoint);
        if (cp) {
          this.checkpointId = cp.id;
          this.checkpoint = cp.respawn ?? { x: cp.x, y: cp.y - this.p.h };
          this.go(this.checkpoint.x, this.checkpoint.y);
        }
        resolve();
      }
    })(level, audio, { hud: () => {}, pause: () => {}, finish: () => {}, over: () => {} });
  });
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 540,
    pixelArt: true,
    banner: false,
    audio: { noAudio: true },
    scene: [scene!],
    scale: { mode: Phaser.Scale.FIT },
  });
  await ready;
}
const run = (action: () => Promise<void>) => async () => {
  if (busy) return;
  busy = true;
  audio.unlock();
  try {
    await action();
  } catch (error) {
    worldError = String(error);
    el('errors').textContent = worldError;
  } finally {
    busy = false;
    measure = false;
  }
};
el('start').onclick = run(async () => boot(await load(el<HTMLInputElement>('file').value)));
el('stress').onclick = run(async () => boot(await load('crystal-workshop.json', true)));
el('respawn').onclick = run(async () => {
  if (current) await boot(current, el<HTMLSelectElement>('checkpoints').value);
});
el('go').onclick = () =>
  scene?.go(el<HTMLInputElement>('x').valueAsNumber, el<HTMLInputElement>('y').valueAsNumber);
el('measure').onclick = run(async () => {
  const files = (await (await fetch('/levels/index.json')).json())
    .map(levelEntry)
    .filter((v: { enabled: boolean }) => v.enabled)
    .map((v: { file: string }) => v.file);
  el('perf').textContent = '';
  for (const file of [...files, 'stress']) {
    const started = performance.now();
    await boot(await load(file === 'stress' ? 'crystal-workshop.json' : file, file === 'stress'));
    const loadMs = Math.round(performance.now() - started);
    const canvases = el('game').querySelectorAll('canvas').length;
    el<HTMLInputElement>('boxes').checked = false;
    el<HTMLInputElement>('fly').checked = false;
    el<HTMLInputElement>('safe').checked = true;
    samples = [];
    frameTimes = [];
    measure = true;
    await new Promise((resolve) => setTimeout(resolve, 2200));
    measure = false;
    const p95 = (a: number[]) =>
      a.sort((x, y) => x - y)[Math.floor(a.length * 0.95)]?.toFixed(2) ?? 'n.v.t.';
    el('perf').textContent +=
      file +
      ' · ' +
      current!.objects.length +
      ' objecten · ' +
      loadMs +
      ' ms start · ' +
      samples.length +
      ' frames · p95 frame ' +
      p95(frameTimes) +
      ' ms · p95 update ' +
      p95(samples) +
      ' ms · ' +
      canvases +
      ' canvas\n';
  }
});
