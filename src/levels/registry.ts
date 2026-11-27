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
    files.map(async (file) => {
      if (typeof file !== 'string' || !/^[-a-z0-9]+\.json$/.test(file))
        throw Error('Ongeldige bestandsnaam');
      const r = await fetch(`${base}levels/${file}`, { cache: 'no-cache' });
      if (!r.ok) throw Error(`${file}: niet gevonden`);
      return levelSchema.parse(await r.json());
    }),
  );
  for (const r of results) {
    if (r.status === 'fulfilled') {
      if (levels.some((l) => l.id === r.value.id)) errors.push(`Dubbel level-ID ${r.value.id}`);
      else levels.push(r.value);
    } else errors.push(String(r.reason));
  }
  return { levels, errors };
}
