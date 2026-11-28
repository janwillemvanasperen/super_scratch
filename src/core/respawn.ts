import { overlap, type Rect } from './physics';

export function safeRespawn(
  preferred: { x: number; y: number },
  fallback: { x: number; y: number },
  body: { w: number; h: number },
  world: { width: number; height: number },
  blocked: Rect[],
) {
  const fits = (p: { x: number; y: number }) =>
    p.x >= 0 &&
    p.y >= 0 &&
    p.x + body.w <= world.width &&
    p.y + body.h <= world.height &&
    !blocked.some((o) => overlap({ ...p, w: body.w, h: body.h }, o));
  for (const base of [preferred, fallback]) {
    if (fits(base)) return base;
    for (let r = 16; r <= 160; r += 16)
      for (const [x, y] of [
        [0, -r],
        [-r, 0],
        [r, 0],
        [-r, -r],
        [r, -r],
        [0, r],
      ])
        if (fits({ x: base.x + x, y: base.y + y })) return { x: base.x + x, y: base.y + y };
  }
  return undefined;
}
