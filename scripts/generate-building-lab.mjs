import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const l = JSON.parse(readFileSync('public/levels/midnight-city.json', 'utf8'));
l.id = 'internal-building-lab';
l.name = 'Intern bouwstenenlab V2.2';
l.version = 1;
l.world.width = 12000;
l.story = 'Interne testwereld. Elke gemarkeerde zone test een bouwsteen of combinatie.';
l.goal = 'Test de stations en bereik de finish.';
l.instructions = '↑ interactie/klimmen · ↓ dalen/oppakken · ↓ + Spatie gooien';
l.spawn = { x: 60, y: 420 };
l.targetTime = 120;
delete l.presentation;
l.objects = [];
const add = (id, kind, x, y, w = 32, h = 32, extra = {}) =>
  l.objects.push({ id, kind, x, y, w, h, ...extra });
const action = (target, action) => ({ type: 'object', target, action });
const note = (x, text) => add(`bord-${x}`, 'decoration', x, 380, 64, 96, { text });
add('floor', 'ground', 0, 480, 8000, 60);
add('floor2', 'ground', 8000, 480, 4000, 60);
add('coin', 'coin', 220, 445, 24, 28);
add('test-enemy', 'walker', 900, 448, 32, 32, { speed: 0, range: 0 });
note(90, '1. Pak de kist met ↓. Leg hem met ↓ op de drukplaat. De deur opent.');
add('plate-crate', 'crate', 300, 448, 32, 32, { carry: {} });
add('plate', 'pressurePlate', 410, 470, 100, 10, {
  trigger: {
    mode: 'momentary',
    accepts: 'crate',
    on: [action('plate-door', 'open')],
    off: [action('plate-door', 'close')],
  },
});
add('plate-door', 'door', 610, 370, 36, 110);
add('throw-crate', 'crate', 790, 448, 32, 32, { carry: {} });
note(700, '2. Pak de kist. Houd ↓ ingedrukt en druk Spatie om naar de wandelaar te gooien.');
note(1060, '3. Druk ↑ bij de schakelaar. De lift begint te bewegen langs drie stopplaatsen.');
add('lift-switch', 'switch', 1160, 442, 30, 38, {
  trigger: { mode: 'toggle', on: [action('lift', 'start')], off: [action('lift', 'stop')] },
});
add('lift', 'elevator', 1240, 460, 100, 20, {
  route: {
    points: [
      { x: 1240, y: 460 },
      { x: 1240, y: 350 },
      { x: 1370, y: 280 },
    ],
    activation: 'trigger',
    speed: 70,
    wait: 1,
  },
});
add('high-deck', 'surface', 1470, 280, 180, 20, { surface: { type: 'oneWay' } });
add('ladder', 'ladder', 1490, 280, 32, 200, { ladder: { speed: 120 } });
note(1660, '4. Ladder: ↑ omhoog, ↓ omlaag. Spatie laat je wegspringen.');
add('ladder2', 'ladder', 1750, 300, 32, 180, { ladder: {} });
add('ladder-top', 'surface', 1690, 300, 200, 20, { surface: { type: 'oneWay' } });
note(
  2020,
  '5. Water met stroming: pijltjes sturen. Spatie geeft een zwemslag; bij het oppervlak spring je eruit.',
);
add('water-free', 'water', 2160, 300, 380, 180, { water: { currentX: 45, gravity: 0.12 } });
add('water-oxygen', 'water', 2660, 280, 380, 200, {
  water: { currentX: -20, currentY: 8, oxygen: 8 },
});
note(2570, '6. Hier is zuurstof beperkt. Kijk naar de meter. Zwem op tijd naar het oppervlak.');
note(3100, '7. Speciale vloeren: ijs, modder, transportband, veer en eenrichtingsplatform.');
add('ice', 'surface', 3220, 460, 180, 20, { surface: { type: 'ice' } });
add('mud', 'surface', 3420, 460, 180, 20, { surface: { type: 'mud' } });
add('belt', 'surface', 3620, 460, 180, 20, { surface: { type: 'conveyor', conveyor: -90 } });
add('bounce', 'surface', 3820, 460, 120, 20, { surface: { type: 'bounce', bounce: 650 } });
add('one-way', 'surface', 4000, 360, 140, 20, { surface: { type: 'oneWay' } });
add('friction', 'surface', 4200, 460, 140, 20, { surface: { type: 'friction', friction: 0.5 } });
note(4420, '8. Omgevingszones: wind, lage/hoge zwaartekracht, beweging en tijdelijke snelheid.');
add('wind-zone', 'zone', 4520, 180, 250, 300, { zone: { forceX: 600 } });
add('low-g', 'zone', 4820, 100, 200, 380, { zone: { gravity: 0.35 } });
add('high-g', 'zone', 5080, 100, 180, 380, { zone: { gravity: 2 } });
add('drift-h', 'zone', 5320, 100, 180, 380, { zone: { driftX: 100 } });
add('drift-v', 'zone', 5550, 200, 180, 280, { zone: { driftY: -110 } });
add('temporary-speed', 'zone', 5780, 100, 160, 380, { zone: { speedFactor: 1.6, duration: 3 } });
add('wind-platform', 'pathPlatform', 4520, 380, 100, 20, {
  route: {
    points: [
      { x: 4520, y: 380 },
      { x: 4640, y: 300 },
      { x: 4700, y: 380 },
    ],
    speed: 50,
    wait: 0.3,
  },
});
note(
  6100,
  '9. Druk ↑ bij de poort. Je gaat naar de geheime kamer. De andere poort brengt je terug.',
);
add('portal-a', 'teleporter', 6250, 416, 48, 64, {
  portal: { destination: { object: 'portal-b' }, secret: true },
});
add('portal-b', 'teleporter', 6600, 416, 48, 64, {
  portal: { destination: { object: 'portal-a' } },
});
add('secret-area', 'secret', 6560, 400, 180, 80);
add('treasure', 'chest', 6690, 444, 40, 36, {
  chest: { rewards: [{ kind: 'coin', amount: 3 }, { kind: 'shield' }, { kind: 'bonus' }] },
});
add('auto-a', 'teleporter', 6900, 416, 48, 64, {
  portal: { destination: { object: 'auto-b' }, activation: 'auto' },
});
add('auto-b', 'teleporter', 7200, 416, 48, 64, {
  portal: { destination: { object: 'auto-a' }, activation: 'auto' },
});
note(
  7420,
  '10. Beweegplatform start wanneer je erop staat. De gebarsten brug stort in en keert terug.',
);
add('rider-platform', 'pathPlatform', 7550, 420, 120, 20, {
  route: {
    points: [
      { x: 7550, y: 420 },
      { x: 7750, y: 330 },
    ],
    activation: 'rider',
    speed: 75,
  },
});
add('collapse', 'collapsePlatform', 7900, 390, 180, 20, {
  collapse: { delay: 0.7, returnAfter: 3 },
});
add('manual-lift', 'elevator', 8200, 460, 100, 20, {
  route: {
    points: [
      { x: 8200, y: 460 },
      { x: 8200, y: 350 },
      { x: 8380, y: 300 },
    ],
    activation: 'interact',
    speed: 100,
    wait: 0.3,
  },
});
note(
  8520,
  '11. Praat met de monteur: druk voor iedere volgende zin opnieuw ↑. Hij geeft een sleutel.',
);
add('helper', 'npc', 8650, 432, 32, 48, {
  npc: {
    lines: ['Welkom in het lab!', 'Hier is de sleutel voor de archiefdeur.'],
    reward: { kind: 'key', key: 'archive' },
  },
});
add('npc-door', 'door', 8850, 370, 36, 110, { key: 'archive' });
add('receiver', 'npc', 9050, 432, 32, 48, {
  npc: {
    lines: ['Dank je. De sleutel opent nu de geheime poort.'],
    requiresKey: 'archive',
    receive: 'key',
    actions: [action('locked-portal', 'enable')],
  },
});
add('locked-portal', 'teleporter', 9220, 416, 48, 64, {
  enabled: false,
  portal: { destination: { x: 9500, y: 420 }, activation: 'interact' },
});
note(
  9620,
  '12. Een tijdelijke schakelaar schakelt de val uit en maakt een verborgen brug beschikbaar.',
);
add('timed-switch', 'switch', 9740, 442, 30, 38, {
  trigger: {
    mode: 'timed',
    duration: 4,
    on: [action('test-trap', 'disable'), action('hidden-bridge', 'enable')],
    off: [action('test-trap', 'enable'), action('hidden-bridge', 'disable')],
  },
});
add('test-trap', 'trap', 9930, 450, 40, 30, { range: 30, speed: 50 });
add('hidden-bridge', 'platform', 10070, 370, 150, 20, { enabled: false });
add('permanent-switch', 'switch', 10400, 442, 30, 38, {
  trigger: {
    mode: 'once',
    on: [
      action('final-portal', 'enable'),
      { type: 'message', text: 'De laatste doorgang blijft open.' },
    ],
  },
});
add('final-portal', 'teleporter', 10600, 416, 48, 64, {
  enabled: false,
  portal: { destination: { x: 11000, y: 420 }, switch: 'permanent-switch' },
});
add('bonus-chest', 'chest', 11200, 444, 40, 36, {
  chest: {
    rewards: [
      { kind: 'key', key: 'extra' },
      { kind: 'invincible', duration: 5 },
      { kind: 'jump' },
      { kind: 'speed' },
      { kind: 'heart' },
      { kind: 'secret' },
    ],
  },
});
add('finish', 'finish', 11700, 384, 64, 96);
l.styles = { ...l.styles, npc: { asset: 'hero', frame: 0 }, water: undefined, zone: undefined };
mkdirSync('tests/fixtures', { recursive: true });
writeFileSync('tests/fixtures/building-lab.json', JSON.stringify(l, null, 2) + '\n');
console.log(`Internal lab: ${l.objects.length} objects, not in public registry`);
