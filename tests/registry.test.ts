import { it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadLevels } from '../src/levels/registry';
const base = JSON.parse(readFileSync('public/levels/tutorial.json', 'utf8'));
afterEach(() => vi.unstubAllGlobals());
it('loads 100 levels, isolates a bad file and supports removal', async () => {
  let names = Array.from({ length: 100 }, (_, i) => `duo-${i}.json`);
  names.push('broken.json');
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.endsWith('index.json')
          ? names
          : url.endsWith('broken.json')
            ? { id: 'broken' }
            : { ...base, id: url.split('/').at(-1)!.replace('.json', '') },
    })),
  );
  let result = await loadLevels();
  expect(result.levels).toHaveLength(100);
  expect(result.errors).toHaveLength(1);
  names = names.filter((n) => n !== 'duo-99.json' && n !== 'broken.json');
  result = await loadLevels();
  expect(result.levels).toHaveLength(99);
  expect(result.errors).toHaveLength(0);
  expect(result.levels.some((l) => l.id === 'duo-99')).toBe(false);
});
