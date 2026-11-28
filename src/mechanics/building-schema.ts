import { z } from 'zod';
const point = z.object({ x: z.number().min(0), y: z.number().min(0) });
export const rewardSchema = z
  .object({
    kind: z.enum([
      'coin',
      'bonus',
      'key',
      'heart',
      'invincible',
      'jump',
      'speed',
      'shield',
      'secret',
    ]),
    amount: z.number().int().min(1).max(20).default(1),
    key: z.string().min(1).optional(),
    duration: z.number().min(1).max(60).default(10),
  })
  .superRefine((r, c) => {
    if (r.kind === 'key' && !r.key)
      c.addIssue({ code: 'custom', message: 'Sleutelbeloning mist key' });
  });
export const actionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('object'),
    target: z.string().min(1),
    action: z.enum([
      'open',
      'close',
      'enable',
      'disable',
      'show',
      'hide',
      'start',
      'stop',
      'toggle',
      'reset',
    ]),
  }),
  z.object({ type: z.literal('message'), text: z.string().min(1).max(180) }),
  z.object({ type: z.literal('reward'), reward: rewardSchema }),
]);
export const triggerSchema = z.object({
  mode: z.enum(['toggle', 'momentary', 'timed', 'once']).default('toggle'),
  duration: z.number().min(0.1).max(120).default(3),
  accepts: z.enum(['player', 'crate', 'both']).default('both'),
  weight: z.number().min(0.1).max(20).default(1),
  on: z.array(actionSchema).min(1).max(32),
  off: z.array(actionSchema).max(32).default([]),
});
export const routeSchema = z.object({
  points: z.array(point).min(2).max(32),
  speed: z.number().min(5).max(400).default(70),
  wait: z.number().min(0).max(30).default(1),
  mode: z.enum(['pingpong', 'loop']).default('pingpong'),
  activation: z.enum(['auto', 'rider', 'interact', 'trigger']).default('auto'),
  oneWay: z.boolean().default(true),
});
export const ladderSchema = z.object({ speed: z.number().min(20).max(300).default(120) });
export const waterSchema = z.object({
  gravity: z.number().min(0).max(1).default(0.18),
  speed: z.number().min(20).max(350).default(130),
  swimSpeed: z.number().min(20).max(350).default(130),
  exitJump: z.number().min(150).max(650).default(420),
  currentX: z.number().min(-250).max(250).default(0),
  currentY: z.number().min(-250).max(250).default(0),
  oxygen: z.number().min(2).max(120).optional(),
});
export const surfaceSchema = z.object({
  type: z.enum(['ice', 'conveyor', 'mud', 'bounce', 'friction', 'oneWay']),
  friction: z.number().min(0.01).max(4).optional(),
  speedFactor: z.number().min(0.1).max(2).optional(),
  conveyor: z.number().min(-300).max(300).default(0),
  bounce: z.number().min(100).max(900).default(650),
});
export const zoneSchema = z.object({
  gravity: z.number().min(0).max(3).default(1),
  speedFactor: z.number().min(0.1).max(2).default(1),
  forceX: z.number().min(-1500).max(1500).default(0),
  forceY: z.number().min(-1500).max(1500).default(0),
  driftX: z.number().min(-300).max(300).default(0),
  driftY: z.number().min(-300).max(300).default(0),
  duration: z.number().min(0).max(30).default(0),
});
export const portalSchema = z.object({
  destination: z.union([
    point,
    z.object({
      object: z.string().min(1),
      offsetX: z.number().min(-2000).max(2000).default(0),
      offsetY: z.number().min(-2000).max(2000).default(0),
    }),
  ]),
  activation: z.enum(['auto', 'interact']).default('interact'),
  key: z.string().optional(),
  switch: z.string().optional(),
  cooldown: z.number().min(0.25).max(10).default(0.75),
  secret: z.boolean().default(false),
});
export const collapseSchema = z.object({
  delay: z.number().min(0.05).max(10).default(0.5),
  returnAfter: z.number().min(0).max(60).default(3),
});
export const carrySchema = z.object({
  throwable: z.boolean().default(true),
  weight: z.number().min(0.1).max(20).default(1),
  throwSpeed: z.number().min(50).max(600).default(340),
  throwLift: z.number().min(0).max(500).default(180),
  defeatsEnemies: z.boolean().default(true),
});
export const chestSchema = z.object({
  rewards: z.array(rewardSchema).min(1).max(10),
  key: z.string().optional(),
  switch: z.string().optional(),
});
export const npcSchema = z
  .object({
    lines: z.array(z.string().min(1).max(140)).min(1).max(6),
    requiresKey: z.string().optional(),
    receive: z.enum(['none', 'key', 'crate']).default('none'),
    consume: z.boolean().default(true),
    reward: rewardSchema.optional(),
    actions: z.array(actionSchema).max(32).default([]),
    repeatDialogue: z.boolean().default(true),
  })
  .superRefine((n, c) => {
    if (n.receive === 'key' && !n.requiresKey)
      c.addIssue({ code: 'custom', message: 'NPC ontvangt sleutel zonder requiresKey' });
  });
export type Action = z.infer<typeof actionSchema>;
export type Reward = z.infer<typeof rewardSchema>;
export type Route = z.infer<typeof routeSchema>;
