import { z } from 'zod';
import type { Rect } from './physics';

const coordinate = z.number().nonnegative();
export const cameraSchema = z.object({
  axis: z.enum(['horizontal', 'vertical', 'both']).default('horizontal'),
  smoothing: z.number().min(1).max(30).default(6),
  bounds: z
    .object({ left: coordinate, top: coordinate, right: coordinate, bottom: coordinate })
    .optional(),
  zones: z
    .array(
      z.object({
        x: coordinate,
        y: coordinate,
        w: z.number().positive(),
        h: z.number().positive(),
        viewX: coordinate,
        viewY: coordinate,
      }),
    )
    .max(32)
    .default([]),
});
type Config = z.infer<typeof cameraSchema>;
const clamp = (x: number, min: number, max: number) => Math.min(Math.max(x, min), max);
export function cameraPosition(
  p: Rect,
  world: { width: number; height: number },
  config: Config | undefined,
  old: { x: number; y: number },
  dt: number,
  snap = false,
) {
  const b = config?.bounds;
  const left = b?.left ?? 0,
    top = b?.top ?? 0;
  const right = (b?.right ?? world.width) - 960,
    bottom = (b?.bottom ?? world.height) - 540;
  const zone = config?.zones.find(
    (z) => p.x + p.w > z.x && p.x < z.x + z.w && p.y + p.h > z.y && p.y < z.y + z.h,
  );
  const axis = config?.axis ?? 'horizontal',
    factor = snap ? 1 : Math.min(1, dt * (config?.smoothing ?? 6));
  const targetX = clamp(zone?.viewX ?? (axis === 'vertical' ? left : p.x - 320), left, right);
  const targetY = clamp(zone?.viewY ?? (axis === 'horizontal' ? top : p.y - 280), top, bottom);
  let x = old.x + (targetX - old.x) * factor,
    y = old.y + (targetY - old.y) * factor;
  if (config) {
    // Break a lock or tighten follow only when the player approaches a viewport edge.
    x = clamp(clamp(x, p.x + p.w - 944, p.x - 16), left, right);
    y = clamp(clamp(y, p.y + p.h - 524, p.y - 16), top, bottom);
  }
  return { x, y };
}
