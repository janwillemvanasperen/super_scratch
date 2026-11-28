import { z } from 'zod';
import { actionSchema } from './building-schema';

const id = z.string().min(1).max(100);
const point = z.object({ x: z.number().nonnegative(), y: z.number().nonnegative() });
const attacks = z.enum(['stomp', 'throw', 'power', 'event']);
const behavior = z
  .object({
    move: z.enum(['stand', 'walk', 'patrol', 'chase', 'flee', 'route', 'guard']).default('patrol'),
    flight: z.number().min(0).max(250).optional(),
    jump: z.number().min(100).max(700).optional(),
    jumpNear: z.boolean().default(false),
    speed: z.number().min(0).max(400).default(75),
    range: z.number().min(8).max(1500).default(120),
    detect: z.number().min(10).max(1500).default(300),
    reaction: z.number().min(0).max(10).default(0),
    wait: z.number().min(0).max(30).default(0),
    waitNear: z.boolean().default(false),
    route: z.array(point).min(2).max(32).optional(),
    hide: z.number().min(0.1).max(10).optional(),
    teleport: z.array(point).min(2).max(16).optional(),
    interval: z.number().min(0.2).max(60).default(2),
    shoot: z
      .object({
        speed: z.number().min(30).max(600).default(180),
        direction: z.enum(['aim', 'left', 'right', 'horizontal']).default('horizontal'),
        pattern: z.enum(['single', 'spread']).default('single'),
      })
      .optional(),
    vulnerableFor: z.number().min(0.1).max(60).optional(),
  })
  .superRefine((b, c) => {
    if (
      (b.move === 'route') !== !!b.route ||
      (b.flight !== undefined && b.jump) ||
      (b.jumpNear && !b.jump) ||
      (b.route && (b.jump || b.flight !== undefined)) ||
      (b.hide !== undefined && b.hide >= b.interval) ||
      (b.teleport && b.route) ||
      (b.vulnerableFor !== undefined && b.vulnerableFor >= b.interval)
    )
      c.addIssue({ code: 'custom', message: 'Incompatibele vijandinstellingen' });
  });
export const enemySchema = z
  .object({
    name: id.optional(),
    boss: z.boolean().default(false),
    hp: z.number().int().min(1).max(100).default(1),
    damage: z.number().int().min(0).max(3).default(1),
    hitDelay: z.number().min(0.1).max(10).default(0.75),
    accepts: z.array(attacks).min(1).max(4).default(['stomp', 'throw', 'power']),
    weakSpot: z
      .object({
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
        w: z.number().positive().max(1),
        h: z.number().positive().max(1),
      })
      .refine((b) => b.x + b.w <= 1 && b.y + b.h <= 1)
      .optional(),
    bar: z.boolean().optional(),
    intro: z.string().min(1).max(180).optional(),
    music: z
      .object({
        tempo: z.number().min(60).max(200),
        notes: z.array(z.number().int().min(36).max(96)).min(4).max(64),
      })
      .optional(),
    behavior,
    phases: z
      .array(z.object({ at: z.number().min(0.01).max(0.99), behavior }))
      .max(8)
      .default([]),
    defeated: z.array(actionSchema).max(32).default([]),
  })
  .superRefine((e, c) => {
    if (e.phases.some((p, i) => i > 0 && p.at >= e.phases[i - 1].at))
      c.addIssue({ code: 'custom', message: 'Fasedrempels moeten strikt dalen' });
  });
const count = z.number().int().min(1).max(4000);
const ids = z
  .array(id)
  .min(1)
  .max(32)
  .refine((a) => new Set(a).size === a.length);
const goal = z.discriminatedUnion('type', [
  z.object({ type: z.literal('coins'), count }),
  z.object({ type: z.literal('kills'), count }),
  ...(['items', 'enemies', 'switches', 'people', 'keys', 'visit'] as const).map((type) =>
    z.object({ type: z.literal(type), ids }),
  ),
  z.object({ type: z.literal('deliver'), object: id, to: id }),
  z.object({ type: z.literal('time'), seconds: z.number().min(1).max(3600) }),
]);
export const goalSchema = z.object({
  condition: goal,
  label: z.string().min(1).max(120),
});
export const eventSchema = z.object({
  id,
  when: z.array(goalSchema).min(1).max(16),
  actions: z.array(actionSchema).min(1).max(32),
});
export type EnemySpec = z.infer<typeof enemySchema>;
export type Goal = z.infer<typeof goalSchema>;
