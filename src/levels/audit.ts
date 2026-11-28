import type { Level } from './schema';
import { objectBody } from '../assets/layout';
import { overlap } from '../core/physics';
const fixed = ['ground', 'wall', 'platform', 'surface', 'breakable'];
const danger = [
  'spikes',
  'lava',
  'trap',
  'falling',
  'enemy',
  'walker',
  'chaser',
  'jumper',
  'flyer',
  'shooter',
  'sentry',
];
export function auditLevel(level: Level) {
  const errors: string[] = [],
    warnings: string[] = [];
  const player = level.character.hitbox;
  const body = { w: player?.width ?? 22, h: player?.height ?? 30 };
  const { width, height } = level.world;
  const solids = level.objects
    .filter((o) => o.enabled && fixed.includes(o.kind) && o.surface?.type !== 'oneWay')
    .map(objectBody);
  const hazards = level.objects.filter((o) => o.enabled && danger.includes(o.kind)).map(objectBody);
  const within = (r: { x: number; y: number; w: number; h: number }) =>
    r.x >= 0 && r.y >= 0 && r.x + r.w <= width && r.y + r.h <= height;
  const start = {
    x: level.spawn.x + (player?.offsetX ?? 0),
    y: level.spawn.y + (player?.offsetY ?? 0),
    ...body,
  };
  if (!within(start) || solids.some((s) => overlap(start, s)))
    errors.push('Start past niet vrij binnen de wereld');
  if (hazards.some((s) => overlap(start, s))) warnings.push('Gevaar op startpositie');
  for (const o of level.objects) {
    const r = objectBody(o);
    if (!within(r)) warnings.push(o.id + ': contactgebied valt deels buiten de wereld');
    if (o.kind === 'checkpoint') {
      const restart = { ...(o.respawn ?? { x: r.x, y: r.y - body.h }), ...body };
      if (!within(restart) || [...solids, ...hazards].some((s) => overlap(s, restart)))
        warnings.push(o.id + ': mogelijk onveilige terugkeer');
    }
    if (o.kind === 'finish' && solids.some((s) => overlap(s, r)))
      warnings.push(o.id + ': finish overlapt een vaste blokkade');
    if (o.route)
      for (let i = 1; i < o.route.points.length; i++) {
        const a = o.route.points[i - 1],
          b = o.route.points[i];
        const steps = Math.min(30, Math.max(2, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 32)));
        if (
          Array.from({ length: steps + 1 }, (_, n) => n / steps).some((t) =>
            solids.some((s) =>
              overlap(s, {
                ...r,
                x: r.x + a.x - o.x + (b.x - a.x) * t,
                y: r.y + a.y - o.y + (b.y - a.y) * t,
              }),
            ),
          )
        ) {
          warnings.push(o.id + ': route kan tegen een vast object stoppen');
          break;
        }
      }
    if (o.kind === 'passage' && o.target && !o.portal && !within({ ...o.target, ...body }))
      errors.push(o.id + ': oude doorgang buiten wereld');
  }
  const grounds = level.objects
    .filter((o) => o.kind === 'ground' && o.enabled)
    .sort((a, b) => a.x - b.x);
  for (let i = 1; i < grounds.length; i++) {
    const last = grounds[i - 1],
      next = grounds[i],
      gap = next.x - last.x - last.w;
    if (gap > 200 && Math.abs(next.y - last.y) < 110)
      warnings.push(
        'Grote afstand tussen ' +
          last.id +
          ' en ' +
          next.id +
          ' (' +
          gap +
          ' px). Controleer tussenplatforms.',
      );
  }
  return { errors, warnings };
}
