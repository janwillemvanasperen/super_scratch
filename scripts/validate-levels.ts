import { readFileSync } from 'node:fs';
import { levelSchema } from '../src/levels/schema';
const files = JSON.parse(readFileSync('public/levels/index.json', 'utf8')) as string[];
const ids = new Set();
for (const file of files) {
  if (!/^[-a-z0-9]+\.json$/.test(file)) throw Error('Ongeldige bestandsnaam');
  const l = levelSchema.parse(JSON.parse(readFileSync(`public/levels/${file}`, 'utf8')));
  if (ids.has(l.id)) throw Error('Dubbel level-ID');
  ids.add(l.id);
  console.log(`OK ${l.id}: ${l.objects.length} objecten`);
}
