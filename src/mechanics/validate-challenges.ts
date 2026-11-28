import type { Level } from '../levels/schema';
import { enemyKinds } from './challenges';

export function validateChallenges(l: Level): string[] {
  const errors: string[] = [];
  const byId = new Map(l.objects.map((o) => [o.id, o]));
  const events = l.events ?? [];
  const actions = [
    ...events.flatMap((e) => e.actions),
    ...l.objects.flatMap((o) => o.enemy?.defeated ?? []),
  ];
  for (const o of l.objects) {
    if ((o.kind === 'enemy') !== !!o.enemy)
      errors.push(o.id + ': enemy-instellingen passen alleen bij enemy');
    if (o.requirements && o.kind !== 'finish')
      errors.push(o.id + ': requirements horen bij een finish');
    if (o.enemy)
      for (const b of [o.enemy.behavior, ...o.enemy.phases.map((f) => f.behavior)])
        for (const p of [...(b.route ?? []), ...(b.teleport ?? [])])
          if (p.x + o.w > l.world.width || p.y + o.h > l.world.height)
            errors.push(o.id + ': vijandpunt valt buiten de wereld');
  }
  if (new Set(events.map((e) => e.id)).size !== events.length)
    errors.push('Dubbel verhaalgebeurtenis-ID');
  for (const a of actions)
    if (a.type === 'object') {
      const o = byId.get(a.target);
      if (
        !o ||
        (['open', 'close'].includes(a.action) && o.kind !== 'door') ||
        (['start', 'stop'].includes(a.action) &&
          !o.route &&
          !['movingX', 'movingY', 'trap', 'decoration', 'enemy'].includes(o.kind))
      )
        errors.push('Ongeldig verhaal- of beloningsdoel: ' + a.target);
    }
  const allActions = [
    ...actions,
    ...l.objects.flatMap((o) => [
      ...(o.trigger?.on ?? []),
      ...(o.trigger?.off ?? []),
      ...(o.npc?.actions ?? []),
    ]),
  ];
  for (const a of allActions)
    if (
      a.type === 'object' &&
      a.action === 'damage' &&
      !byId.get(a.target)?.enemy?.accepts.includes('event')
    )
      errors.push('Schadedoel accepteert geen event: ' + a.target);
  for (const a of allActions)
    if (a.type === 'object' && a.action === 'talk' && byId.get(a.target)?.kind !== 'npc')
      errors.push('Tekstballon vereist NPC: ' + a.target);
  const keySources = new Set([
    ...l.objects.filter((o) => o.kind === 'key').map((o) => o.key || o.id),
    ...l.objects
      .flatMap((o) => [...(o.chest?.rewards ?? []), o.npc?.reward])
      .filter((r) => r?.kind === 'key')
      .map((r) => r!.key),
    ...allActions.flatMap((a) =>
      a.type === 'reward' && a.reward.kind === 'key' ? [a.reward.key] : [],
    ),
  ]);
  const goals = [
    ...(l.goals ?? []),
    ...events.flatMap((e) => e.when),
    ...l.objects.flatMap((o) => o.requirements ?? []),
  ];
  for (const { condition: g, label } of goals) {
    if (
      g.type === 'deliver' &&
      (byId.get(g.object)?.kind !== 'crate' || byId.get(g.to)?.kind !== 'objective')
    )
      errors.push(label + ': bezorging vereist kist en objective');
    if ('ids' in g)
      for (const id of g.ids) {
        const o = byId.get(id);
        const valid =
          g.type === 'keys'
            ? keySources.has(id)
            : o &&
              (g.type === 'items'
                ? ['coin', 'bonus', 'heart', 'key', 'secret'].includes(o.kind)
                : g.type === 'enemies'
                  ? enemyKinds.includes(o.kind)
                  : g.type === 'switches'
                    ? !!o.trigger
                    : g.type === 'people'
                      ? o.kind === 'npc'
                      : g.type === 'visit'
                        ? o.kind === 'objective'
                        : false);
        if (!valid) errors.push(label + ': ongeldig doel ' + id);
      }
  }
  return errors;
}
