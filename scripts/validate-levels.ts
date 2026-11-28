import { readFileSync, existsSync } from 'node:fs';
import { levelSchema } from '../src/levels/schema';
import { validateAssets } from './asset-validation';
const files = JSON.parse(readFileSync('public/levels/index.json', 'utf8')) as string[];
if (existsSync('public/assets/qa-local'))
  throw Error(
    'Verwijder tijdelijke QA-bestanden met node scripts/qa-fixtures.mjs clean vóór publicatie.',
  );
const ids = new Set();
for (const file of files) {
  if (!/^[-a-z0-9]+\.json$/.test(file)) throw Error('Ongeldige bestandsnaam');
  const l = levelSchema.parse(JSON.parse(readFileSync(`public/levels/${file}`, 'utf8')));
  if (ids.has(l.id)) throw Error('Dubbel level-ID');
  ids.add(l.id);
  const issues = validateAssets(l);
  if (issues.length) throw Error(`${l.id}:\n${issues.join('\n')}`);
  console.log(`OK ${l.id}: ${l.objects.length} objecten`);
}
