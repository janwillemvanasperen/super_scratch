import { z } from 'zod';

// Only site-local, portable paths. No scripts, remote URLs or parent traversal.
export const assetPathSchema = z
  .string()
  .max(240)
  .regex(/^assets\/[a-zA-Z0-9_-]+\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+$/)
  .refine((p) => !p.includes('..'), 'Gebruik geen .. in assetpaden');
const dimension = z.number().int().min(1).max(4096);
const imagePath = assetPathSchema.refine(
  (p) => /\.(png|webp|jpe?g)$/i.test(p),
  'Afbeelding moet PNG, WebP of JPEG zijn',
);
export const assetSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('image'), src: imagePath }),
  z.object({
    type: z.literal('sheet'),
    src: imagePath,
    frameWidth: dimension,
    frameHeight: dimension,
    frameCount: z.number().int().min(1).max(512),
    margin: z.number().int().min(0).max(128).default(0),
    spacing: z.number().int().min(0).max(128).default(0),
  }),
  z.object({
    type: z.literal('audio'),
    src: assetPathSchema.refine(
      (p) => /\.(mp3|ogg|wav)$/i.test(p),
      'Audio moet MP3, OGG of WAV zijn',
    ),
  }),
]);
export const animationSchema = z.object({
  frames: z.array(z.number().int().min(0).max(511)).min(1).max(512),
  fps: z.number().min(0.1).max(60).default(8),
  repeat: z.number().int().min(-1).max(100).default(-1),
});
export const visualSchema = z.object({
  asset: z.string().min(1),
  frame: z.number().int().min(0).max(511).default(0),
  mode: z.enum(['sprite', 'tile']).default('sprite'),
  fit: z.enum(['body', 'native']).default('body'),
  scale: z.number().min(0.1).max(16).default(1),
  offsetX: z.number().min(-2000).max(2000).default(0),
  offsetY: z.number().min(-2000).max(2000).default(0),
  flipX: z.boolean().default(false),
  flipY: z.boolean().default(false),
  rotation: z.number().min(-360).max(360).default(0),
  alpha: z.number().min(0).max(1).default(1),
  depth: z.number().min(-100).max(100).default(0),
  tint: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  animations: z.record(animationSchema).optional(),
  animation: z.string().optional(),
});
export const hitboxSchema = z.object({
  width: z.number().min(4).max(8000),
  height: z.number().min(4).max(800),
  offsetX: z.number().min(-1000).max(1000).default(0),
  offsetY: z.number().min(-1000).max(1000).default(0),
});
export const motionSchema = z.object({
  axis: z.enum(['x', 'y']),
  distance: z.number().min(0).max(1500),
  period: z.number().min(0.5).max(60).default(4),
  phase: z.number().min(0).max(360).default(0),
});
export const layerSchema = z.object({
  id: z.string().min(1),
  visual: visualSchema,
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().min(64).max(50000),
  height: z.number().min(64).max(4000),
  parallaxY: z.number().min(-2).max(2).default(0),
  parallax: z.number().min(-2).max(2).default(0.2),
  scrollX: z.number().min(-500).max(500).default(0),
  scrollY: z.number().min(-500).max(500).default(0),
  repeatX: z.boolean().default(true),
  repeatY: z.boolean().default(false),
  foreground: z.boolean().default(false),
});
export const atmosphereSchema = z.object({
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  alpha: z.number().min(0).max(0.85).default(0.15),
});
export const presentationSchema = z.object({
  card: z.string().optional(),
  story: z.string().optional(),
  completion: z.string().optional(),
  intro: z
    .object({
      asset: z.string(),
      duration: z.number().min(0.5).max(8).default(3),
      animation: animationSchema.optional(),
    })
    .optional(),
});
export const audioSchema = z.object({
  music: z.string().optional(),
  loop: z.boolean().default(true),
  musicVolume: z.number().min(0).max(1).default(1),
  effectsVolume: z.number().min(0).max(1).default(1),
  effects: z.record(z.string()).optional(),
});
export type Asset = z.infer<typeof assetSchema>;
export type Visual = z.infer<typeof visualSchema>;
export type Animation = z.infer<typeof animationSchema>;
export type Layer = z.infer<typeof layerSchema>;

export function checkSheet(asset: Asset, width: number, height: number): string | null {
  if (width < 1 || height < 1 || width > 8192 || height > 8192 || width * height > 16777216)
    return 'Afbeelding heeft ongeldige of te grote afmetingen (maximaal 16 megapixels)';
  if (asset.type !== 'sheet') return null;
  const usableW = width - 2 * asset.margin,
    usableH = height - 2 * asset.margin;
  const cols = Math.floor((usableW + asset.spacing) / (asset.frameWidth + asset.spacing));
  const rows = Math.floor((usableH + asset.spacing) / (asset.frameHeight + asset.spacing));
  if (cols < 1 || rows < 1 || cols * rows < asset.frameCount)
    return 'Spritesheet bevat onvoldoende volledige frames';
  if (
    (usableW + asset.spacing) % (asset.frameWidth + asset.spacing) !== 0 ||
    (usableH + asset.spacing) % (asset.frameHeight + asset.spacing) !== 0
  )
    return 'Spritesheet past niet op het opgegeven raster';
  return null;
}

export function visualIssues(assets: Record<string, Asset>, v: Visual): string[] {
  const a = assets[v.asset];
  if (!a || a.type === 'audio') return [`Afbeelding ontbreekt: ${v.asset}`];
  const count = a.type === 'sheet' ? a.frameCount : 1;
  const errors: string[] = [];
  if (v.frame >= count) errors.push(`Frame ${v.frame} bestaat niet in ${v.asset}`);
  for (const [name, clip] of Object.entries(v.animations || {}))
    if (clip.frames.some((f) => f >= count))
      errors.push(`Animatie ${name} verwijst naar een ontbrekend frame in ${v.asset}`);
  if (v.animation && !v.animations?.[v.animation])
    errors.push(`Startanimatie ${v.animation} ontbreekt`);
  return errors;
}

export function frameAt(clip: Animation, elapsed: number): number {
  const tick = Math.floor(Math.max(0, elapsed) * clip.fps);
  if (clip.repeat >= 0 && tick >= clip.frames.length * (clip.repeat + 1))
    return clip.frames.at(-1)!;
  return clip.frames[tick % clip.frames.length];
}
