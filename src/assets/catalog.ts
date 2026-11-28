import type { Level } from '../levels/schema';
import { visualIssues, type Visual, type Asset } from './schema';

export function assetUrl(src: string): string {
  return `${import.meta.env.BASE_URL}${src}`;
}
export function levelVisuals(level: Level): Visual[] {
  return [
    level.character.visual,
    ...Object.values(level.styles || {}),
    ...level.objects.map((o) => o.visual),
    ...(level.background?.layers.map((l) => l.visual) || []),
  ].filter((v): v is Visual => !!v);
}
// Report bad references separately: production can still play a valid level with fallback art.
export function assetReferenceIssues(level: Level): string[] {
  const assets = level.assets || {},
    errors = levelVisuals(level).flatMap((v) => visualIssues(assets, v));
  const check = (id: string | undefined, type: 'image' | 'audio', label: string) => {
    if (!id) return;
    const a = assets[id];
    if (!a || (type === 'audio' ? a.type !== 'audio' : a.type !== 'image'))
      errors.push(`${label}: ${id} is geen ${type}`);
  };
  for (const m of level.makers) check(m.avatarAsset, 'image', 'Avatar');
  for (const k of ['card', 'story', 'completion'] as const)
    check(level.presentation?.[k], 'image', k);
  const intro = level.presentation?.intro;
  if (intro) {
    const a = assets[intro.asset];
    if (!a || a.type === 'audio') errors.push(`Intro: afbeelding ${intro.asset} ontbreekt`);
    else if (
      intro.animation &&
      intro.animation.frames.some((f) => f >= (a.type === 'sheet' ? a.frameCount : 1))
    )
      errors.push('Intro: ongeldig animatieframe');
  }
  check(level.audio?.music, 'audio', 'Muziek');
  for (const [name, id] of Object.entries(level.audio?.effects || {}))
    check(id, 'audio', `Effect ${name}`);
  return errors;
}
export function assetKey(level: Level, id: string) {
  return `level:${level.id}:${level.version}:${id}`;
}
export function imageAsset(level: Level, id?: string): Asset | undefined {
  const a = id ? level.assets?.[id] : undefined;
  return a && a.type !== 'audio' ? a : undefined;
}
