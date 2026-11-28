import type { Block } from '../levels/schema';
import { overlap } from '../core/physics';
export function validateBuildingLinks(l: {
  objects: Block[];
  world: { width: number; height: number };
  character: { hitbox?: { width: number; height: number } };
}): string[] {
  const errors: string[] = [],
    byId = new Map(l.objects.map((o) => [o.id, o]));
  const fields: Record<string, string[]> = {
    trigger: ['switch', 'pressurePlate'],
    route: ['elevator', 'pathPlatform'],
    ladder: ['ladder'],
    water: ['water'],
    surface: [
      'surface',
      'ground',
      'platform',
      'movingX',
      'movingY',
      'pathPlatform',
      'collapsePlatform',
      'elevator',
    ],
    zone: ['zone'],
    portal: ['teleporter', 'passage'],
    collapse: ['collapsePlatform'],
    carry: ['crate'],
    chest: ['chest'],
    npc: ['npc'],
  };
  const required: Record<string, string> = {
    switch: 'trigger',
    pressurePlate: 'trigger',
    ladder: 'ladder',
    elevator: 'route',
    water: 'water',
    surface: 'surface',
    zone: 'zone',
    teleporter: 'portal',
    pathPlatform: 'route',
    collapsePlatform: 'collapse',
    chest: 'chest',
    npc: 'npc',
  };
  const body = { w: l.character.hitbox?.width ?? 22, h: l.character.hitbox?.height ?? 30 };
  const keys = new Set<string>();
  for (const o of l.objects) {
    if (o.kind === 'key') keys.add(o.key || o.id);
    for (const r of [...(o.chest?.rewards || []), ...(o.npc?.reward ? [o.npc.reward] : [])])
      if (r.key) keys.add(r.key);
    for (const a of [
      ...(o.trigger?.on || []),
      ...(o.trigger?.off || []),
      ...(o.npc?.actions || []),
    ])
      if (a.type === 'reward' && a.reward.key) keys.add(a.reward.key);
  }
  for (const o of l.objects) {
    const data = o as unknown as Record<string, unknown>;
    for (const [field, kinds] of Object.entries(fields))
      if (data[field] && !kinds.includes(o.kind))
        errors.push(`${o.id}: ${field} past niet bij ${o.kind}`);
    if (required[o.kind] && !data[required[o.kind]])
      errors.push(`${o.id}: mist ${required[o.kind]}`);
    for (const key of [o.portal?.key, o.chest?.key, o.npc?.requiresKey])
      if (key && !keys.has(key)) errors.push(`${o.id}: sleutel ${key} heeft geen bron`);
    for (const id of [o.portal?.switch, o.chest?.switch])
      if (id && !byId.get(id)?.trigger) errors.push(`${o.id}: schakelaar ${id} ontbreekt`);
    for (const a of [
      ...(o.trigger?.on || []),
      ...(o.trigger?.off || []),
      ...(o.npc?.actions || []),
    ])
      if (a.type === 'object') {
        const target = byId.get(a.target);
        if (!target) errors.push(`${o.id}: actiedoel ${a.target} ontbreekt`);
        else if (['open', 'close'].includes(a.action) && target.kind !== 'door')
          errors.push(`${o.id}: open/close vereist een deur`);
        else if (
          ['start', 'stop'].includes(a.action) &&
          !target.route &&
          !['movingX', 'movingY', 'trap', 'decoration'].includes(target.kind)
        )
          errors.push(`${o.id}: start/stop vereist een bewegend object`);
        if (a.target === o.id && a.action === 'reset')
          errors.push(`${o.id}: trigger mag zichzelf niet resetten`);
      }
    if (o.route) {
      if (o.route.points[0].x !== o.x || o.route.points[0].y !== o.y)
        errors.push(`${o.id}: eerste routepunt moet gelijk zijn aan x/y`);
      for (const p of o.route.points)
        if (p.x + o.w > l.world.width || p.y + o.h > l.world.height)
          errors.push(`${o.id}: routepunt buiten wereld`);
    }
    if (o.portal) {
      const d = o.portal.destination,
        t = 'object' in d ? byId.get(d.object) : undefined;
      if ('object' in d && !t) {
        errors.push(`${o.id}: teleportbestemming ontbreekt`);
        continue;
      }
      const p = 'object' in d ? { x: t!.x + d.offsetX, y: t!.y + d.offsetY } : d;
      if (p.x < 0 || p.y < 0 || p.x + body.w > l.world.width || p.y + body.h > l.world.height)
        errors.push(`${o.id}: teleportbestemming buiten wereld`);
      if ('object' in d && d.object === o.id)
        errors.push(`${o.id}: teleporter verwijst naar zichzelf`);
      if (
        l.objects.some(
          (b) =>
            b.enabled &&
            ['ground', 'wall', 'platform'].includes(b.kind) &&
            overlap(
              { ...p, ...body },
              {
                x: b.x + (b.hitbox?.offsetX || 0),
                y: b.y + (b.hitbox?.offsetY || 0),
                w: b.hitbox?.width ?? b.w,
                h: b.hitbox?.height ?? b.h,
              },
            ),
        )
      )
        errors.push(`${o.id}: teleportbestemming ligt in een vast object`);
    }
  }
  return errors;
}
