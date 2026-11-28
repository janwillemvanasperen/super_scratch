export type Rect = { x: number; y: number; w: number; h: number };
export const overlap = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export function moveBody(
  p: Rect & { vx: number; vy: number },
  dt: number,
  solids: Rect[],
): { grounded: boolean; ceiling?: Rect; wall?: Rect } {
  const steps = Math.max(1, Math.ceil((Math.max(Math.abs(p.vx), Math.abs(p.vy)) * dt) / 7));
  if (steps > 1) {
    const area = {
      x: Math.min(p.x, p.x + p.vx * dt) - 1,
      y: Math.min(p.y, p.y + p.vy * dt) - 1,
      w: p.w + Math.abs(p.vx * dt) + 2,
      h: p.h + Math.abs(p.vy * dt) + 2,
    };
    const nearby = solids.filter((b) => overlap(area, b));
    let grounded = false,
      ceiling: Rect | undefined,
      wall: Rect | undefined;
    for (let i = 0; i < steps; i++) {
      const result = moveBody(p, dt / steps, nearby);
      grounded ||= result.grounded;
      ceiling ??= result.ceiling;
      wall ??= result.wall;
    }
    return { grounded, ceiling, wall };
  }
  let grounded = false,
    ceiling: Rect | undefined,
    wall: Rect | undefined;
  p.x += p.vx * dt;
  for (const b of solids)
    if (overlap(p, b)) {
      p.x = p.vx > 0 ? b.x - p.w : b.x + b.w;
      p.vx = 0;
      wall = b;
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
  return { grounded, ceiling, wall };
}
export function impactTime(body: Rect, dx: number, dy: number, target: Rect): number {
  if (overlap(body, target)) return 0;
  const span = (a: number, size: number, b: number, width: number, d: number) => {
    if (!d) return a < b + width && a + size > b ? [-Infinity, Infinity] : [Infinity, -Infinity];
    const t1 = (b - a - size) / d,
      t2 = (b + width - a) / d;
    return [Math.min(t1, t2), Math.max(t1, t2)];
  };
  const [ax, bx] = span(body.x, body.w, target.x, target.w, dx);
  const [ay, by] = span(body.y, body.h, target.y, target.h, dy);
  const enter = Math.max(ax, ay),
    leave = Math.min(bx, by);
  return enter >= 0 && enter <= 1 && enter < leave ? enter : Infinity;
}
