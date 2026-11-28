import { enemySchema, eventSchema, goalSchema } from '../mechanics/challenge-schema';
import { validateChallenges } from '../mechanics/validate-challenges';
import {
  triggerSchema,
  routeSchema,
  ladderSchema,
  waterSchema,
  surfaceSchema,
  zoneSchema,
  portalSchema,
  collapseSchema,
  carrySchema,
  chestSchema,
  npcSchema,
} from '../mechanics/building-schema';
import { validateBuildingLinks } from '../mechanics/validate-buildings';
import { z } from 'zod';
import {
  assetSchema,
  visualSchema,
  hitboxSchema,
  motionSchema,
  layerSchema,
  atmosphereSchema,
  presentationSchema,
  audioSchema,
} from '../assets/schema';
const pos = { x: z.number().min(0), y: z.number().min(0) };
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const kinds = [
  'ground',
  'platform',
  'movingX',
  'movingY',
  'vanish',
  'breakable',
  'spring',
  'wall',
  'spikes',
  'trap',
  'falling',
  'lava',
  'walker',
  'chaser',
  'jumper',
  'flyer',
  'shooter',
  'sentry',
  'coin',
  'heart',
  'key',
  'bonus',
  'invincible',
  'jump',
  'speed',
  'shield',
  'door',
  'checkpoint',
  'secret',
  'passage',
  'finish',
  'crate',
  'decoration',
  'switch',
  'pressurePlate',
  'ladder',
  'elevator',
  'water',
  'surface',
  'zone',
  'teleporter',
  'pathPlatform',
  'collapsePlatform',
  'chest',
  'npc',
  'enemy',
  'objective',
] as const;
export const objectSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(kinds),
  ...pos,
  w: z.number().min(8).max(8000).default(32),
  h: z.number().min(8).max(800).default(32),
  color: color.optional(),
  speed: z.number().min(0).max(500).default(55),
  range: z.number().min(0).max(1500).default(100),
  period: z.number().min(0.5).max(30).default(3),
  duration: z.number().min(1).max(60).default(10),
  key: z.string().optional(),
  target: z.object(pos).optional(),
  text: z.string().max(180).optional(),
  visual: visualSchema.optional(),
  hitbox: hitboxSchema.optional(),
  motion: motionSchema.optional(),
  solid: z.boolean().default(false),
  enabled: z.boolean().default(true),
  resetOnDeath: z.boolean().default(false),
  trigger: triggerSchema.optional(),
  route: routeSchema.optional(),
  ladder: ladderSchema.optional(),
  water: waterSchema.optional(),
  surface: surfaceSchema.optional(),
  zone: zoneSchema.optional(),
  portal: portalSchema.optional(),
  collapse: collapseSchema.optional(),
  carry: carrySchema.optional(),
  enemy: enemySchema.optional(),
  requirements: z.array(goalSchema).min(1).max(16).optional(),
  chest: chestSchema.optional(),
  npc: npcSchema.optional(),
});
const levelDataSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  version: z.number().int().positive(),
  name: z.string().min(1).max(80),
  story: z.string().min(1).max(1500),
  goal: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  tutorial: z.boolean().default(false),
  makers: z
    .array(z.object({ name: z.string().min(1), avatar: color, avatarAsset: z.string().optional() }))
    .length(2),
  palette: z.object({ sky: color, far: color, near: color, ground: color, accent: color }),
  character: z.object({
    name: z.string(),
    color: color,
    visual: visualSchema.optional(),
    hitbox: hitboxSchema.optional(),
  }),
  music: z.object({
    tempo: z.number().min(60).max(200),
    notes: z.array(z.number().int().min(36).max(96)).min(4).max(64),
  }),
  world: z.object({
    width: z.number().min(960).max(50000),
    height: z.number().min(540).max(4000),
  }),
  spawn: z.object(pos),
  targetTime: z.number().min(10).max(600),
  mechanic: z.enum(['wind']).optional(),
  instructions: z.string().optional(),
  goals: z.array(goalSchema).max(16).optional(),
  events: z.array(eventSchema).max(32).optional(),
  objects: z.array(objectSchema).min(1).max(4000),
  assets: z.record(z.string().regex(/^[a-zA-Z0-9_-]+$/), assetSchema).optional(),
  styles: z.record(visualSchema).optional(),
  background: z
    .object({
      color: color.optional(),
      legacy: z.boolean().default(false),
      layers: z.array(layerSchema).max(24),
      light: atmosphereSchema.optional(),
    })
    .optional(),
  presentation: presentationSchema.optional(),
  audio: audioSchema.optional(),
  demo: z.boolean().default(false),
});
export type Level = z.infer<typeof levelDataSchema>;
export const levelSchema = levelDataSchema.superRefine((l, ctx) => {
  for (const message of [...validateBuildingLinks(l), ...validateChallenges(l)])
    ctx.addIssue({ code: 'custom', message });
  const layerIds = new Set<string>();
  for (const layer of l.background?.layers || []) {
    if (layerIds.has(layer.id))
      ctx.addIssue({ code: 'custom', message: `Dubbele achtergrondlaag: ${layer.id}` });
    layerIds.add(layer.id);
  }
  const ids = new Set<string>();
  for (const o of l.objects) {
    if (ids.has(o.id)) ctx.addIssue({ code: 'custom', message: `Dubbel object-ID: ${o.id}` });
    ids.add(o.id);
    if (o.x + o.w > l.world.width || o.y > l.world.height)
      ctx.addIssue({ code: 'custom', message: `Object buiten wereld: ${o.id}` });
    if (
      o.kind === 'door' &&
      !o.key &&
      !l.objects.some((t) =>
        [
          ...(t.trigger?.on || []),
          ...(t.trigger?.off || []),
          ...(t.npc?.actions || []),
          ...(t.enemy?.defeated ?? []),
          ...(l.events ?? []).flatMap((e) => e.actions),
        ].some((a) => a.type === 'object' && a.target === o.id),
      )
    )
      ctx.addIssue({ code: 'custom', message: 'Deur mist sleutel-ID' });
    if (
      o.kind === 'door' &&
      o.key &&
      !l.objects.some(
        (k) =>
          (k.kind === 'key' && k.key === o.key) ||
          k.chest?.rewards.some((r) => r.kind === 'key' && r.key === o.key) ||
          (k.npc?.reward?.kind === 'key' && k.npc.reward.key === o.key) ||
          [
            ...(k.trigger?.on || []),
            ...(k.trigger?.off || []),
            ...(k.npc?.actions || []),
            ...(k.enemy?.defeated ?? []),
            ...(l.events ?? []).flatMap((e) => e.actions),
          ].some((a) => a.type === 'reward' && a.reward.kind === 'key' && a.reward.key === o.key),
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: `Deur ${o.id} heeft geen bereikbare sleuteldefinitie`,
      });
  }
  for (const kind of ['coin', 'secret', 'finish'])
    if (!l.objects.some((o) => o.kind === kind))
      ctx.addIssue({ code: 'custom', message: `Ontbreekt: ${kind}` });
  if (
    !l.objects.some((o) =>
      ['walker', 'chaser', 'jumper', 'flyer', 'shooter', 'sentry', 'enemy'].includes(o.kind),
    )
  )
    ctx.addIssue({ code: 'custom', message: 'Vijand ontbreekt' });
  if (l.spawn.x >= l.world.width || l.spawn.y >= l.world.height)
    ctx.addIssue({ code: 'custom', message: 'Start buiten wereld' });
});

export type Block = z.infer<typeof objectSchema>;
