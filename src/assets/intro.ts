import type { Level } from '../levels/schema';
import { assetUrl } from './catalog';
import { frameAt, checkSheet } from './schema';

// A short optional visual introduction, before the run clock begins.
export function startVisualIntro(
  canvas: HTMLCanvasElement,
  level: Level,
  done: () => void,
): () => void {
  const intro = level.presentation?.intro,
    asset = intro ? level.assets?.[intro.asset] : undefined;
  if (!intro || !asset || asset.type === 'audio') {
    queueMicrotask(done);
    return () => {};
  }
  let disposed = false,
    raf = 0;
  const image = new Image();
  const timeout = setTimeout(() => {
    if (!disposed) done();
  }, 10000);
  image.onload = () => {
    clearTimeout(timeout);
    if (disposed) return;
    if (checkSheet(asset, image.width, image.height)) {
      done();
      return;
    }
    const w = asset.type === 'sheet' ? asset.frameWidth : image.width,
      h = asset.type === 'sheet' ? asset.frameHeight : image.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const start = performance.now();
    const draw = (now: number) => {
      if (disposed) return;
      const time = (now - start) / 1000;
      if (time >= intro.duration) {
        done();
        return;
      }
      let frame = intro.animation ? frameAt(intro.animation, time) : 0;
      const margin = asset.type === 'sheet' ? asset.margin : 0,
        spacing = asset.type === 'sheet' ? asset.spacing : 0;
      const columns = Math.floor((image.width - 2 * margin + spacing) / (w + spacing));
      if (asset.type === 'sheet' && frame >= asset.frameCount) frame = 0;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(
        image,
        margin + (frame % columns) * (w + spacing),
        margin + Math.floor(frame / columns) * (h + spacing),
        w,
        h,
        0,
        0,
        w,
        h,
      );
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
  };
  image.onerror = () => {
    clearTimeout(timeout);
    if (!disposed) done();
  };
  image.src = assetUrl(asset.src);
  return () => {
    disposed = true;
    clearTimeout(timeout);
    cancelAnimationFrame(raf);
    image.onload = null;
    image.onerror = null;
    image.src = '';
  };
}
