// Dev-only browser harness: never imported by the production entry point.
import Phaser from 'phaser';
import { GameScene } from '../src/scenes/GameScene';
import { AudioEngine } from '../src/audio/audio';
import { levelSchema } from '../src/levels/schema';
const output = document.querySelector<HTMLPreElement>('#result')!;
const button = document.querySelector<HTMLButtonElement>('#run')!;
button.onclick = async () => {
  button.disabled = true;
  output.textContent = 'Meting gestart…\n';
  const audio = new AudioEngine();
  audio.unlock();
  let decodes = 0,
    decodeFailures = 0;
  if (audio.ctx) {
    const decode = audio.ctx.decodeAudioData.bind(audio.ctx);
    audio.ctx.decodeAudioData = ((b: ArrayBuffer) =>
      decode(b).then(
        (result) => {
          decodes++;
          return result;
        },
        (e) => {
          decodeFailures++;
          throw e;
        },
      )) as typeof audio.ctx.decodeAudioData;
  }
  for (const name of [
    'tutorial',
    'first-adventure',
    'midnight-city',
    'deep-sea-treasure',
    'missing',
    'corrupt',
  ]) {
    const broken = name === 'missing' || name === 'corrupt',
      base = broken ? 'midnight-city' : name;
    const raw = await (await fetch(`/levels/${base}.json`)).json();
    if (broken) {
      raw.id = `qa-${name}`;
      raw.character.visual.asset = 'hero';
      raw.assets.hero = { type: 'image', src: `assets/qa-local/${name}.png` };
      raw.assets.music = { type: 'audio', src: `assets/qa-local/${name}.wav` };
      delete raw.presentation;
    }
    const level = levelSchema.parse(raw),
      deltas: number[] = [],
      work: number[] = [];
    let frames = 0,
      game: Phaser.Game,
      lastJump = -100,
      release = 0;
    const result = await new Promise<Record<string, unknown>>((resolve) => {
      class CheckScene extends GameScene {
        update(time: number, delta: number) {
          const start = performance.now();
          if (this.p) {
            this.keys.right.isDown = true;
            this.keys.up.isDown = frames % 20 < 10;
            const danger = this.objects.some(
              (o) =>
                o.alive &&
                ['walker', 'chaser', 'jumper', 'spikes', 'crate'].includes(o.kind) &&
                o.x >= this.p.x - 5 &&
                o.x - this.p.x < 90 &&
                Math.abs(o.y - this.p.y) < 65,
            );
            if (this.p.grounded && danger && frames - lastJump > 20) {
              release = frames + 45;
              lastJump = frames;
            }
            this.keys.jump.isDown = frames < release;
          }
          super.update(time, delta);
          frames++;
          if (frames > 30) {
            deltas.push(delta);
            work.push(performance.now() - start);
          }
          if (this.elapsed >= (broken ? 3 : 8)) {
            this.paused = true;
            const sorted = [...deltas].sort((a, b) => a - b),
              cost = [...work].sort((a, b) => a - b);
            const result = {
              level: name,
              frames,
              meanFps: Math.round(1000 / (deltas.reduce((a, b) => a + b, 0) / deltas.length)),
              p95FrameMs: Number(sorted[Math.floor(sorted.length * 0.95)].toFixed(2)),
              p95UpdateMs: Number(cost[Math.floor(cost.length * 0.95)].toFixed(2)),
              fallbackHero: this.hero.visible,
              assetIssues: this.assetRenderer?.issues || [],
              audioDecoded: decodes,
              audioDecodeFailures: decodeFailures,
            };
            setTimeout(() => {
              game.destroy(true);
              audio.stop();
              setTimeout(
                () =>
                  resolve({
                    ...result,
                    remainingCanvases: document.querySelectorAll('#game canvas').length,
                  }),
                50,
              );
            }, 0);
          }
        }
      }
      const scene = new CheckScene(level, audio, {
        hud: () => {},
        pause: () => {},
        finish: () => {},
        over: () => {},
      });
      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'game',
        width: 960,
        height: 540,
        pixelArt: true,
        roundPixels: true,
        banner: false,
        audio: { noAudio: true },
        scene: [scene],
        loader: { maxParallelDownloads: 4 },
      });
    });
    output.textContent += JSON.stringify(result) + '\n';
  }
  output.textContent += 'KLAAR';
  button.disabled = false;
};
