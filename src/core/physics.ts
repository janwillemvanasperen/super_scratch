export type Rect = { x: number; y: number; w: number; h: number };
export const overlap = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export function moveBody(p: Rect & { vx: number; vy: number }, dt: number, solids: Rect[]) {
  let grounded = false,
    ceiling: Rect | undefined;
  p.x += p.vx * dt;
  for (const b of solids)
    if (overlap(p, b)) {
      p.x = p.vx > 0 ? b.x - p.w : b.x + b.w;
      p.vx = 0;
    }
  p.y += p.vy * dt;
  for (const b of solids)
    if (overlap(p, b)) {
      if (p.vy >= 0) {
        p.y = b.y - p.h;
        grounded = true;
      } else {
        p.y = b.y + b.h;
        ceiling = b;
      }
      p.vy = 0;
    }
  return { grounded, ceiling };
}
