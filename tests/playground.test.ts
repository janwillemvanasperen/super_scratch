import { describe, expect, it } from 'vitest';
import { makeZone, zones } from '../src/playground/zones';
import { kinds, levelSchema } from '../src/levels/schema';
import { auditLevel } from '../src/levels/audit';
import { readFileSync } from 'node:fs';

describe('Playground', () => {
  it.each(zones)('has safe starts and fresh state in $title', (zone) => {
    const first = makeZone(zone),
      next = makeZone(zone);
    expect(auditLevel(first).errors).toEqual([]);
    expect(next.objects).toEqual(first.objects);
    expect(next.objects[0]).not.toBe(first.objects[0]);
    expect(zone.cards.length).toBeGreaterThan(0);
    expect(zone.cards.every((card) => card.every((text) => text.trim().length > 0))).toBe(true);
    expect(first.goals?.some((g) => g.condition.type === 'time') ?? false).toBe(false);
  });
  it('offers every object type outside the adventure registry', () => {
    const included = new Set(zones.flatMap((z) => makeZone(z).objects.map((o) => o.kind)));
    expect(kinds.filter((k) => !included.has(k))).toEqual([]);
    const registry = JSON.parse(readFileSync('public/levels/index.json', 'utf8'));
    expect(registry).toEqual([
      'tutorial.json',
      'first-adventure.json',
      'midnight-city.json',
      'deep-sea-treasure.json',
      'crystal-workshop.json',
    ]);
    expect(levelSchema.safeParse(makeZone(zones[0])).success).toBe(false);
  });
});
