// Local-only test UI. Start positions create a NEW run; no production debug API.
import Phaser from 'phaser';
import { GameScene } from '../src/scenes/GameScene';
import { levelSchema } from '../src/levels/schema';
import { AudioEngine } from '../src/audio/audio';
const stations = [
  ['Drukplaat en kist', 240, 420],
  ['Gooien naar vijand', 740, 420],
  ['Schakelaar en lift', 1110, 420],
  ['Ladder', 1735, 420],
  ['Water en stroming', 2170, 340],
  ['Water en zuurstof', 2730, 340],
  ['IJs', 3240, 410],
  ['Modder', 3440, 410],
  ['Transportband', 3640, 410],
  ['Verend oppervlak', 3840, 410],
  ['Eenrichtingsplatform', 4020, 420],
  ['Aangepaste wrijving', 4210, 410],
  ['Wind en routeplatform', 4530, 325],
  ['Lage zwaartekracht', 4840, 420],
  ['Hoge zwaartekracht', 5100, 420],
  ['Horizontale beweging', 5340, 420],
  ['Verticale beweging', 5570, 380],
  ['Tijdelijke snelheid', 5800, 420],
  ['Geheime tweerichtingspoort', 6220, 420],
  ['Automatische teleporters', 6870, 420],
  ['Platform op gewicht', 7560, 370],
  ['Instortend platform', 7920, 340],
  ['Handbediende lift', 8210, 410],
  ['NPC geeft sleutel', 8600, 420],
  ['Schatkist', 6660, 420],
  ['Tijdelijke schakelaar', 9700, 420],
  ['Permanente schakelaar', 10360, 420],
  ['Alle beloningen', 11170, 420],
  ['Volledige route', 60, 420],
] as const;
const select = document.querySelector<HTMLSelectElement>('#station')!;
stations.forEach(([name], i) => {
  const o = document.createElement('option');
  o.value = String(i);
  o.textContent = name;
  select.append(o);
});
const audio = new AudioEngine();
let game: Phaser.Game | undefined,
  scene: GameScene | undefined,
  lastHUD = 0;
async function start() {
  audio.unlock();
  audio.stop();
  if (game) {
    const old = game;
    game = undefined;
    await new Promise<void>((r) => {
      old.events.once('destroy', () => r());
      old.destroy(true);
    });
  }
  const l = await (await fetch('/tests/fixtures/building-lab.json')).json(),
    station = stations[Number(select.value)];
  l.spawn = { x: station[1], y: station[2] };
  const level = levelSchema.parse(l);
  scene = new GameScene(level, audio, {
    hud: (run, powers, message, oxygen) => {
      document.querySelector('#hint')!.textContent = run.finished ? 'FINISH BEREIKT' : message;
      document.querySelector('#hud')!.textContent =
        `Hartjes ${run.hearts} · Levens ${run.lives} · Munten ${run.coins} · Score ${run.score} · Sleutels ${[...run.keys].join(',')} · Geheimen ${run.secrets} · ${oxygen ? 'Zuurstof ' + oxygen.remaining.toFixed(1) + ' / ' + oxygen.total + ' s' : ''} · ${Object.keys(powers).join(',')}`;
      if (scene && run.seconds - lastHUD > 0.15) {
        lastHUD = run.seconds;
        const near = scene.objects
          .filter(
            (o) =>
              Math.abs(o.x - scene!.p.x) < 700 &&
              (o.trigger ||
                o.route ||
                o.collapse ||
                o.npc ||
                o.chest ||
                o.portal ||
                o.kind === 'door' ||
                o.carry),
          )
          .map((o) => ({
            id: o.id,
            x: Math.round(o.x),
            y: Math.round(o.y),
            alive: o.alive,
            open: o.opened,
            enabled: scene!.systems!.state(o).enabled,
            active: scene!.systems!.state(o).active,
            moving: scene!.systems!.state(o).moving,
            collapsed: scene!.systems!.state(o).collapse === -2,
          }));
        document.querySelector('#state')!.textContent = JSON.stringify(
          {
            seconds: Math.round(run.seconds * 10) / 10,
            paused: scene.paused,
            right: scene.keys.right.isDown,
            player: {
              x: Math.round(scene.p.x),
              y: Math.round(scene.p.y),
              vx: Math.round(scene.p.vx),
              vy: Math.round(scene.p.vy),
              carrying: scene.p.carrying,
              swimming: scene.systems?.swimming,
              climbing: scene.systems?.climbing,
            },
            objects: near,
          },
          null,
          1,
        );
      }
    },
    pause: () => scene?.setPaused(true),
    finish: () => {
      document.querySelector('#hint')!.textContent = 'FINISH BEREIKT';
    },
    over: () => {
      document.querySelector('#hint')!.textContent = 'GAME OVER — herstart station';
    },
  });
  lastHUD = -1;
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 540,
    pixelArt: true,
    roundPixels: true,
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [scene],
    loader: { maxParallelDownloads: 4 },
  });
}
document.querySelector('#start')!.addEventListener('click', () => void start());
document.querySelector('#restart')!.addEventListener('click', () => void start());
document.querySelector('#pause')!.addEventListener('click', () => scene?.setPaused(!scene.paused));
