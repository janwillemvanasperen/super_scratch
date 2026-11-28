import { levelEntry } from './entries';
import { auditLevel } from './audit';
import { assetReferenceIssues } from '../assets/catalog';
import { levelSchema, type Level } from './schema';
export async function loadLevels(): Promise<{ levels: Level[]; errors: string[] }> {
  const levels: Level[] = [],
    errors: string[] = [];
  const base = import.meta.env.BASE_URL;
  const res = await fetch(`${base}levels/index.json`, { cache: 'no-cache' });
  if (!res.ok) throw Error('Levelregister kon niet worden geladen.');
  const files: unknown = await res.json();
  if (!Array.isArray(files)) throw Error('Ongeldig levelregister');
  const results = await Promise.allSettled(
    files.map(async (raw) => {
      const { file, enabled } = levelEntry(raw);
      if (!enabled) return;
      const r = await fetch(`${base}levels/${file}`, { cache: 'no-cache' });
      if (!r.ok) throw Error(`${file}: niet gevonden`);
      const level = levelSchema.parse(await r.json());
      const { errors } = auditLevel(level);
      if (errors.length) throw Error(file + ': ' + errors.join(', '));
      return level;
    }),
  );
  for (const r of results) {
    if (r.status === 'fulfilled') {
      const level = r.value;
      if (!level) continue;
      if (levels.some((l) => l.id === level.id)) errors.push(`Dubbel level-ID ${level.id}`);
      else {
        levels.push(level);
        const warnings = assetReferenceIssues(level);
        if (warnings.length) console.warn(`Assetverwijzingen ${level.id}:`, warnings);
      }
    } else errors.push(String(r.reason));
  }
  return { levels, errors };
}
