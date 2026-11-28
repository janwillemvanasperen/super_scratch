import { playgroundSchema, type Block, type Level } from '../levels/schema';
import type { z } from 'zod';
import type { objectSchema } from '../levels/schema';
type Input = z.input<typeof objectSchema>;
export type Card = readonly [
  name: string,
  effect: string,
  choice: string,
  combo: string,
  limit: string,
  idea: string,
];
type Zone = {
  id: string;
  title: string;
  instruction: string;
  cards: readonly Card[];
  objects: Input[];
  width?: number;
  height?: number;
  floor?: boolean;
  goals?: Level['goals'];
  events?: Level['events'];
  camera?: Level['camera'];
};
const o = (
  id: string,
  kind: Block['kind'],
  x: number,
  y: number,
  w: number,
  h: number,
  settings: Partial<Input> = {},
): Input => ({ id, kind, x, y, w, h, ...settings });
const points = (...coords: [number, number][]) => coords.map(([x, y]) => ({ x, y }));
const link = (
  target: string,
  action: 'open' | 'close' | 'start' | 'stop' | 'enable' | 'disable' | 'show',
) => ({ type: 'object' as const, target, action });
const card = (...data: Card) => data;
const coin = (id: string, x: number, y = 452) => o(id, 'coin', x, y, 18, 22);
const finish = (id: string, x: number, y = 420) => o(id, 'finish', x, y, 30, 60);
const arrow = (id: string, x: number, text: string) =>
  o(id, 'decoration', x, 424, 28, 50, { text });
const surface = (
  type: 'ice' | 'conveyor' | 'mud' | 'bounce' | 'friction' | 'oneWay',
  x: number,
  w = 110,
  y = 465,
) =>
  o(type, 'surface', x, y, w, 15, {
    surface: {
      type,
      conveyor: type === 'conveyor' ? -90 : 0,
      friction: type === 'friction' ? 0.45 : undefined,
    },
  });
export const zones: Zone[] = [
  {
    id: 'platforms',
    title: 'Platforms en beweging',
    instruction:
      'Spring van blok naar blok. Land ook op het gebarsten platform en kijk hoe lang het blijft.',
    objects: [
      o('vast', 'platform', 130, 417, 100, 16),
      o('muur', 'wall', 270, 421, 24, 59),
      o('horizontaal', 'movingX', 390, 407, 90, 15, { speed: 70, range: 55 }),
      o('verticaal', 'movingY', 540, 405, 85, 15, { speed: 60, range: 55 }),
      o('ritme', 'vanish', 655, 418, 100, 14),
      o('breek', 'breakable', 800, 364, 48, 24),
      o('veer', 'spring', 875, 451, 38, 29),
      o('route', 'pathPlatform', 980, 410, 84, 18, {
        route: { points: points([980, 410], [1090, 375], [1180, 410]), activation: 'rider' },
      }),
      o('breuk', 'collapsePlatform', 1260, 405, 100, 18, {
        collapse: { delay: 0.7, returnAfter: 3 },
      }),
    ],
    width: 1450,
    cards: [
      card(
        'Grond, muur en vast platform',
        'Ze houden je tegen of geven een plek om te staan.',
        'Plaats, grootte en beeld.',
        'Maak treden met vaste platforms.',
        'Een vast platform blokkeert ook van onderen.',
        'Bouw een trap van wolken.',
      ),
      card(
        'Horizontaal en verticaal platform',
        'Het platform beweegt heen en weer.',
        'Richting, snelheid en afstand.',
        'Laat het twee vaste richels verbinden.',
        'Houd de baan en de ruimte erboven vrij.',
        'Laat een boot tussen oevers varen.',
      ),
      card(
        'Routeplatform',
        'Het platform volgt punten en kan starten zodra je erop staat.',
        'Route, haltes, snelheid en bediening.',
        'Een schakelaar kan het laten starten.',
        'Een blokkade kan het stilzetten.',
        'Ontwerp een zwevende taxi.',
      ),
      card(
        'Verdwijnen en instorten',
        'Het ene platform knippert op tijd, het andere valt weg nadat je erop landt.',
        'Wachttijd en terugkeer.',
        'Plaats een veilige wachtplek tussen twee platforms.',
        'Een instortend platform komt pas terug als de plek vrij is.',
        'Maak broos ijs boven een schat.',
      ),
      card(
        'Breekbaar blok en springveer',
        'Spring tegen een blok om het te breken. Land op een veer voor een extra hoge sprong.',
        'Plaats, afmetingen en beeld.',
        'Een veer helpt je een blok boven je te bereiken.',
        'Een blok laat uit zichzelf geen munt vallen.',
        'Verstop een tunnel achter een plafond.',
      ),
    ],
  },
  {
    id: 'surfaces',
    title: 'IJs, modder en speciale vloeren',
    instruction: 'Loop over elke strook. Laat ← of → los om te voelen hoe snel je remt.',
    objects: [
      surface('ice', 115),
      surface('mud', 250),
      surface('conveyor', 385),
      surface('bounce', 520),
      surface('friction', 655),
      surface('oneWay', 810, 110, 387),
    ],
    cards: [
      card(
        'IJs en wrijving',
        'Je glijdt door of remt juist sneller.',
        'Hoe glad de vloer is.',
        'Leg ijs vóór een ruime landing.',
        'Gebruik ruimte om te stoppen.',
        'Maak een gladde vijver in een winterdorp.',
      ),
      card(
        'Modder en transportband',
        'Modder vertraagt. Een band duwt opzij.',
        'Snelheid en richting.',
        'Combineer een band met een schakelaar.',
        'Een band mag een verplichte route niet onmogelijk maken.',
        'Bouw een lopende band voor pakjes.',
      ),
      card(
        'Verende vloer en eenrichtingsplatform',
        'Een vloer kan je lanceren. Door een eenrichtingsplatform spring je van onderen heen.',
        'Veerkracht, plaats en beeld.',
        'Gebruik beide om hoger te komen.',
        'Kisten botsen ook tegen de onderkant.',
        'Maak een trampoline onder een boomhut.',
      ),
    ],
  },
  {
    id: 'enemies',
    title: 'Vijanden',
    instruction:
      'Probeer een sprong op de wandelaar. Let bij de volgende vijanden op hun beweging en kogels.',
    width: 2250,
    objects: [
      ...(['walker', 'chaser', 'jumper', 'flyer', 'shooter', 'sentry'] as const).map((k, i) =>
        o(k, k, 230 + i * 235, k === 'flyer' ? 356 : 450, 30, 30, { range: 42, speed: 40 }),
      ),
      o('route-schutter', 'enemy', 1740, 351, 36, 30, {
        enemy: {
          behavior: {
            move: 'route',
            route: points([1740, 351], [1880, 322], [1910, 372]),
            shoot: { direction: 'aim', speed: 105 },
            interval: 3,
          },
        },
      }),
      o('schuwe-springer', 'enemy', 2040, 450, 30, 30, {
        enemy: { behavior: { move: 'flee', detect: 110, jump: 260, jumpNear: true } },
      }),
    ],
    cards: [
      card(
        'Wandelaar en achtervolger',
        'De wandelaar loopt heen en weer. De achtervolger reageert op jou.',
        'Uiterlijk, snelheid en bereik.',
        'Zet een achtervolger bij een uitwijkroute.',
        'Bestaande types houden hun eigen gedrag.',
        'Laat een speelgoedrobot een werkbank bewaken.',
      ),
      card(
        'Springer en vlieger',
        'De een springt, de ander blijft boven de grond.',
        'Plaats, beeld en ondersteunde snelheid.',
        'Leg lage en hoge routes aan.',
        'Een gewone vlieger schiet niet.',
        'Laat een vuurvlieg boven een rivier hangen.',
      ),
      card(
        'Schutter en stekelwachter',
        'Een schutter vuurt blokjes af. De stekelwachter is beschermd tegen gewoon stampen.',
        'Plaats en schietritme.',
        'Gebruik beschutting of een ster.',
        'Een gegooide kist verslaat de stekelwachter niet.',
        'Bewaar een ster voor een bewaakte schat.',
      ),
      card(
        'Vijand op maat',
        'Combineer gedrag. Hier zie je een schutter op een route in de lucht en een vluchtende springer.',
        'Detectie, aanval, route, levenspunten en zwakke plek.',
        'Laat een vijand bij gevaar wegvluchten of tijdelijk verdwijnen.',
        'Een vaste route sluit springen, vrij vliegen en teleporteren uit.',
        'Ontwerp een drone die na een waarschuwing schiet.',
      ),
    ],
  },
  {
    id: 'hazards',
    title: 'Vallen en gevaren',
    instruction:
      'Probeer over de stekels en de hete vloer te springen. Blijf kijken naar de bewegende val.',
    width: 1150,
    floor: false,
    objects: [
      o('links', 'ground', 0, 480, 900, 60),
      o('rechts', 'ground', 1000, 480, 150, 60),
      o('spikes', 'spikes', 210, 460, 50, 20),
      o('lava', 'lava', 350, 464, 75, 16),
      o('trap', 'trap', 535, 451, 32, 29, { range: 50, speed: 55 }),
      o('falling', 'falling', 730, 260, 39, 39),
      o('safe', 'checkpoint', 850, 425, 28, 55),
    ],
    cards: [
      card(
        'Stekels en gevaarlijke vloer',
        'Aanraken kost een hartje.',
        'Plaats, grootte en uiterlijk.',
        'Zet platforms boven gevaarlijke grond.',
        'Het plaatje bepaalt de schadeplek niet.',
        'Maak een strook met elektrische kabels.',
      ),
      card(
        'Bewegende val en vallend blok',
        'Een val schuift heen en weer. Een blok valt als je dichtbij komt.',
        'Plaats, bereik en snelheid van de val.',
        'Een schakelaar kan een val uitzetten.',
        'Een vallend blok blijft niet als platform liggen.',
        'Laat kisten uit een machine vallen.',
      ),
      card(
        'Afgrond en checkpoint',
        'In een afgrond verlies je een leven. Een checkpoint bewaart je terugkeerplek.',
        'Plaats en veilige terugkeer.',
        'Zet een checkpoint vóór een lastig deel.',
        'Test na een val of de route opnieuw lukt.',
        'Maak een veilige hut voor een brug.',
      ),
    ],
  },
  {
    id: 'powerups',
    title: 'Power-ups',
    instruction:
      'Pak de vier tekens. Probeer de sprong, sprint en bescherming. Herstart om elk effect los te testen.',
    objects: [
      o('shield', 'shield', 150, 450, 26, 26, { duration: 12 }),
      o('jump', 'jump', 270, 450, 26, 26, { duration: 12 }),
      o('speed', 'speed', 390, 450, 26, 26, { duration: 12 }),
      o('star', 'invincible', 510, 450, 26, 26, { duration: 12 }),
      o('spikes', 'spikes', 620, 460, 48, 20),
      o('sentry', 'sentry', 760, 450, 30, 30),
      o('high', 'platform', 825, 344, 100, 20),
      coin('high-coin', 875, 318),
    ],
    cards: [
      card(
        'Hoge sprong en turbo',
        'Je springt hoger of loopt tijdelijk sneller.',
        'Plaats, beeld en duur.',
        'Leg een extra route boven de gewone route.',
        'Een noodzakelijk effect moet na levensverlies weer haalbaar zijn.',
        'Bereik een dak met een springdrankje.',
      ),
      card(
        'Schild en ster',
        'Een schild vangt één treffer op. De ster maakt je tijdelijk onkwetsbaar en schakelt vijanden bij contact uit als ze daarvoor gevoelig zijn.',
        'Plaats, beeld en duur.',
        'Laat een ster helpen bij een stekelwachter.',
        'Een afgrond blijft gevaarlijk.',
        'Steek met een beschermpak een fabriek over.',
      ),
    ],
  },
  {
    id: 'collect',
    title: 'Munten, voorwerpen en schatten',
    instruction: 'Pak de munt, sleutel en bonus. Open de schatkist met ↑.',
    objects: [
      coin('coin-a', 160),
      o('bonus', 'bonus', 255, 450, 24, 26),
      o('heart', 'heart', 345, 450, 24, 26),
      o('key', 'key', 437, 450, 24, 26, { key: 'practice' }),
      o('chest', 'chest', 565, 440, 42, 40, {
        chest: { rewards: [{ kind: 'coin', amount: 3 }, { kind: 'shield' }], key: 'practice' },
      }),
      o('practice-spikes', 'spikes', 305, 460, 24, 20),
    ],
    cards: [
      card(
        'Munt, bonus en hartje',
        'Munten en bonusvoorwerpen geven punten. Een hartje herstelt gezondheid als je een hartje mist.',
        'Plaats, aantal en beeld.',
        'Leg munten als aanwijzing naar een omweg.',
        'De puntwaarden staan vast.',
        'Verzamel fruit op een markt.',
      ),
      card(
        'Sleutel en schatkist',
        'Een sleutel geeft toegang. Een schatkist geeft haar inhoud één keer per poging.',
        'Sleutelnaam en beloning.',
        'Open de schatkist met een sleutel of actieve schakelaar.',
        'Een gewone deur neemt de sleutel niet in.',
        'Verstop een schild in een gereedschapskist.',
      ),
    ],
  },
  {
    id: 'water',
    title: 'Water en zwemmen',
    instruction:
      'Zwem met ↑ en ↓. Probeer Spatie bij het oppervlak. Kijk in het tweede bad naar de zuurstofmeter.',
    width: 1250,
    floor: false,
    objects: [
      o('links', 'ground', 0, 462, 190, 78),
      o('midden', 'ground', 520, 462, 100, 78),
      o('rechts', 'ground', 1000, 462, 250, 78),
      o('waterbodem', 'ground', 190, 518, 810, 22),
      o('bad', 'water', 190, 365, 330, 153, { water: { currentX: 45 } }),
      o('diep', 'water', 620, 345, 380, 173, { water: { oxygen: 7, currentX: -25, currentY: 10 } }),
      coin('under', 790, 474),
    ],
    cards: [
      card(
        'Water',
        'Zwem met de pijlen. Water kan een stroming en zuurstof hebben.',
        'Diepte, stroming, snelheid en zuurstof.',
        'Leg een voorwerp onder water en geef een uitgang.',
        'Vijanden en kisten gaan niet vanzelf zwemmen of drijven.',
        'Maak een overstroomde tunnel met luchtplekken.',
      ),
    ],
  },
  {
    id: 'climb',
    title: 'Ladders, liften en verdiepingen',
    instruction: 'Klim met ↑ en ↓. Ga op de lift staan en druk ↑ voor de volgende halte.',
    height: 900,
    width: 1050,
    camera: { axis: 'both', smoothing: 6, zones: [] },
    objects: [
      o('deck', 'surface', 160, 615, 238, 18, { surface: { type: 'oneWay' } }),
      o('ladder', 'ladder', 220, 615, 42, 225, { ladder: {} }),
      o('lift', 'elevator', 490, 818, 105, 18, {
        route: {
          points: points([490, 818], [490, 655], [660, 500]),
          activation: 'interact',
          speed: 110,
        },
      }),
      o('top', 'surface', 765, 500, 220, 18, { surface: { type: 'oneWay' } }),
      o('high-cp', 'checkpoint', 830, 447, 30, 53, { respawn: { x: 826, y: 468 } }),
      coin('up-a', 320, 583),
      coin('up-b', 880, 470),
    ],
    cards: [
      card(
        'Ladder',
        'Je klimt met ↑ en ↓ en springt weg met Spatie.',
        'Hoogte, beeld en klimsnelheid.',
        'Combineer een ladder en eenrichtingsvloer.',
        'Maak een vrije uitstap bij de bovenkant.',
        'Bouw een uitkijktoren.',
      ),
      card(
        'Lift, camera en hoog checkpoint',
        'Een lift brengt je naar meerdere haltes. De camera kan omhoog volgen.',
        'Haltes, snelheid, wachttijd en bediening.',
        'Gebruik een checkpoint op een hoge verdieping.',
        'Een lift stopt bij blokkades. Test ook de route terug.',
        'Maak een lift in een glasmijn.',
      ),
    ],
  },
  {
    id: 'switches',
    title: 'Schakelaars en drukplaten',
    instruction: 'Leg met ↓ een kist op de plaat. Verderop zet ↑ een val tijdelijk uit.',
    width: 1160,
    objects: [
      o('weight', 'crate', 185, 448, 32, 32, { carry: {} }),
      o('plate', 'pressurePlate', 330, 470, 100, 10, {
        trigger: {
          mode: 'momentary',
          accepts: 'crate',
          on: [link('door', 'open')],
          off: [link('door', 'close')],
        },
      }),
      o('door', 'door', 495, 380, 32, 100),
      o('timer', 'switch', 650, 443, 32, 37, {
        trigger: {
          mode: 'timed',
          duration: 5,
          on: [link('trap', 'disable')],
          off: [link('trap', 'enable')],
        },
      }),
      o('trap', 'trap', 810, 452, 27, 28, { range: 42 }),
      o('lever', 'switch', 970, 443, 32, 37, {
        trigger: { mode: 'once', on: [link('bridge', 'enable')] },
      }),
      o('bridge', 'platform', 1030, 400, 95, 16, { enabled: false }),
    ],
    cards: [
      card(
        'Schakelaar',
        'Druk ↑ om een actie te laten gebeuren.',
        'Eenmalig, aan/uit, ingedrukt of op tijd.',
        'Open een deur, stop een val of start een lift.',
        'Een tijdelijk effect kan stoppen terwijl je nog onderweg bent.',
        'Zet het licht in een spookhuis aan.',
      ),
      card(
        'Drukplaat',
        'Gewicht op de plaat zet iets aan.',
        'Wie meetelt en welk gewicht nodig is.',
        'Laat een kist een deur openhouden.',
        'Een gedragen kist geeft geen gewicht.',
        'Open een voorraadkast met een zware krat.',
      ),
    ],
  },
  {
    id: 'doors',
    title: 'Deuren en teleporters',
    instruction:
      'Pak de sleutel en druk ↑ bij de deur. Druk daarna ↑ in de eerste poort of loop door de automatische poort.',
    width: 1200,
    objects: [
      o('key', 'key', 150, 451, 25, 26, { key: 'blue' }),
      o('door', 'door', 265, 365, 32, 115, { key: 'blue' }),
      o('out', 'teleporter', 410, 417, 44, 63, {
        portal: { destination: { object: 'back' }, key: 'blue' },
      }),
      o('back', 'teleporter', 720, 417, 44, 63, { portal: { destination: { object: 'out' } } }),
      o('auto', 'teleporter', 865, 417, 44, 63, {
        portal: { activation: 'auto', destination: { x: 1080, y: 450 } },
      }),
      arrow('hint', 1055, 'Deze poort gaat maar één kant op.'),
    ],
    cards: [
      card(
        'Deur',
        'Met ↑ open je de deur als je de sleutel hebt. Een schakelaar kan een deur ook bedienen.',
        'Slot, beeld en plaats.',
        'Laat een NPC eerst de sleutel geven.',
        'Een deur wacht met automatisch sluiten als iemand erin staat.',
        'Maak een archief dat pas na een opdracht opent.',
      ),
      card(
        'Teleporter en doorgang',
        'Een poort stuurt je naar een andere plek.',
        'Automatisch of met ↑, één richting of twee, sleutel of schakelaar.',
        'Verstop een terugpoort in een schatkamer.',
        'Een bestemming in vaste grond werkt niet.',
        'Maak twee verbonden kleedkamers.',
      ),
    ],
  },
  {
    id: 'zones',
    title: 'Wind, zwaartekracht en snelheid',
    instruction:
      'Loop en spring door de gekleurde gebieden. Kijk wat er verandert als je eruit loopt.',
    width: 1550,
    objects: [
      o('wind', 'zone', 155, 200, 195, 280, { zone: { forceX: 600 } }),
      o('low', 'zone', 385, 110, 220, 370, { zone: { gravity: 0.35 } }),
      o('heavy', 'zone', 635, 160, 185, 320, { zone: { gravity: 2 } }),
      o('updraft', 'zone', 850, 240, 160, 240, { zone: { driftY: -95 } }),
      o('belt-air', 'zone', 1035, 240, 160, 240, { zone: { driftX: 95 } }),
      o('speed-zone', 'zone', 1250, 235, 190, 245, { zone: { speedFactor: 1.55, duration: 3 } }),
      o('wind-ride', 'pathPlatform', 178, 412, 65, 14, {
        route: { points: points([178, 412], [270, 360]), speed: 55 },
      }),
    ],
    cards: [
      card(
        'Wind en luchtstroming',
        'Een zone duwt je opzij of omhoog.',
        'Richting, kracht, hoogte en breedte.',
        'Laat een platform door de wind bewegen. Het platform volgt zijn baan.',
        'De wind werkt vooral op de speler.',
        'Laat een ventilator je naar een balkon blazen.',
      ),
      card(
        'Zwaartekracht en snelheid',
        'Je valt anders of loopt sneller of langzamer.',
        'Kracht, omvang en eventuele nawerking.',
        'Maak een lichte sprong over een gat.',
        'Water en ladders regelen hun eigen beweging.',
        'Laat iemand licht bewegen op de maan.',
      ),
    ],
  },
  {
    id: 'objects',
    title: 'Voorwerpen dragen en bezorgen',
    instruction:
      'Druk ↓ om een kist op te pakken of neer te zetten. Houd ↓ vast en druk Spatie om te gooien.',
    objects: [
      o('throw', 'crate', 175, 448, 32, 32, { carry: {} }),
      o('target', 'walker', 335, 450, 30, 30, { speed: 0 }),
      o('parcel', 'crate', 490, 448, 32, 32, { carry: { throwable: false } }),
      o('dock', 'objective', 650, 425, 95, 55, { text: 'Bezorgplek' }),
      arrow('mail', 640, 'Zet de tweede kist neer op de blauwe streep.'),
      finish('flag', 850),
    ],
    goals: [
      {
        label: 'Bezorg de tweede kist',
        condition: { type: 'deliver', object: 'parcel', to: 'dock' },
      },
    ],
    cards: [
      card(
        'Draagkist en bezorgplek',
        'Draag een kist, leg haar neer of gooi haar. Een bezorgplek herkent een neergezette kist.',
        'Gewicht, werpkracht, doel en of de kist mag worden gegooid.',
        'Raak een vijand of activeer een drukplaat.',
        'Je draagt één kist tegelijk.',
        'Breng een bestelling naar een klant.',
      ),
    ],
  },
  {
    id: 'story',
    title: 'Personages en verhaal',
    instruction:
      'Druk bij elk personage op ↑. Druk opnieuw voor de volgende zin. Breng de sleutel naar de bewaker.',
    objects: [
      o('helper', 'npc', 170, 430, 32, 50, {
        npc: {
          lines: ['Mijn sleutel past op de voorraadkamer.', 'Breng hem naar de bewaker.'],
          reward: { kind: 'key', key: 'story' },
        },
      }),
      o('receiver', 'npc', 470, 430, 32, 50, {
        npc: {
          lines: ['Bedankt! Ik open de deur.'],
          requiresKey: 'story',
          receive: 'key',
          actions: [link('story-door', 'open'), { type: 'background', color: '#8d658a' }],
        },
      }),
      o('story-door', 'door', 640, 375, 32, 105),
      o('visit', 'objective', 70, 390, 72, 90),
      coin('prize', 740),
    ],
    events: [
      {
        id: 'greet',
        when: [{ label: 'Loop langs het bord', condition: { type: 'visit', ids: ['visit'] } }],
        actions: [{ type: 'object', target: 'helper', action: 'talk' }],
      },
    ],
    cards: [
      card(
        'Bord en decoratie',
        'Een bord geeft een aanwijzing. Decoratie geeft je wereld een eigen sfeer.',
        'Tekst, beeld en eenvoudige beweging.',
        'Zet een aanwijzing bij een gesprek of geheim.',
        'Decoratie blokkeert standaard niet.',
        'Hang een knipperende wegwijzer op.',
      ),
      card(
        'Personage en gebeurtenis',
        'Een personage praat, geeft iets of neemt iets aan. Een gebeurtenis reageert op een doel.',
        'Korte zinnen, voorwerp en actie.',
        'Laat een deur openen nadat je iemand helpt.',
        'Geen keuzemenu voor gesprekken. Een verhaalactie loopt normaal één keer.',
        'Bezorg een sleutel om de verlichting terug te brengen.',
      ),
    ],
  },
  {
    id: 'goals',
    title: 'Leveldoelen en uitgangen',
    instruction:
      'Raak de eerste vlag aan. Lees wat er ontbreekt. Pak drie munten en zet de schakelaar aan.',
    width: 1100,
    objects: [
      finish('early', 145),
      coin('one', 280),
      coin('two', 370),
      coin('three', 470),
      o('lever', 'switch', 610, 442, 28, 38, {
        trigger: { mode: 'once', on: [{ type: 'message', text: 'De uitgang is klaar.' }] },
      }),
      finish('ending', 910),
    ],
    goals: [
      { label: 'Munten', condition: { type: 'coins', count: 3 } },
      { label: 'Zet de schakelaar aan', condition: { type: 'switches', ids: ['lever'] } },
    ],
    cards: [
      card(
        'Doel en finish',
        'Een vlag sluit de demonstratie af als de opdrachten klaar zijn.',
        'Munten, voorwerpen, gevecht, schakelaars, personen, bezorgen, sleutels, plek en eventueel tijd in avonturen.',
        'Gebruik twee uitgangen met verschillende voorwaarden.',
        'Puzzelvoorwaarden moeten na een fout haalbaar blijven.',
        'Verzamel een toegangsbewijs voor een festival.',
      ),
    ],
  },
  {
    id: 'boss',
    title: 'Eindbaas',
    instruction:
      'Spring drie keer van boven op de Wachter. Wacht even tussen treffers. Let op het andere schot in de tweede fase.',
    width: 1250,
    objects: [
      o('step', 'platform', 245, 420, 90, 16),
      o('watcher', 'enemy', 465, 432, 64, 48, {
        enemy: {
          boss: true,
          hp: 3,
          accepts: ['stomp'],
          hitDelay: 0.65,
          intro: 'Raak de bovenkant van de Wachter!',
          weakSpot: { x: 0, y: 0, w: 1, h: 0.5 },
          music: { tempo: 144, notes: [48, 55, 51, 55, 48, 60, 58, 55] },
          behavior: { move: 'patrol', speed: 25, range: 45, interval: 3, shoot: { speed: 100 } },
          phases: [
            {
              at: 0.66,
              behavior: {
                move: 'patrol',
                speed: 38,
                range: 50,
                interval: 2.6,
                shoot: { pattern: 'spread', speed: 112 },
              },
            },
          ],
          defeated: [{ type: 'reward', reward: { kind: 'bonus' } }],
        },
      }),
      finish('boss-out', 1000),
    ],
    goals: [{ label: 'Versla de Wachter', condition: { type: 'enemies', ids: ['watcher'] } }],
    cards: [
      card(
        'Baas met fases',
        'De baas heeft meerdere levenspunten. Na schade kan zijn aanval veranderen.',
        'Uiterlijk, balk, muzieknoten, zwakke plek, fases en beloning.',
        'Open een uitgang na het winnen.',
        'Beelden, aanvalstijd en uitwijkplekken moeten samen getest worden.',
        'Laat een festivalmachine na schade een ander ritme schieten.',
      ),
    ],
  },
  {
    id: 'secrets',
    title: 'Verborgen verrassingen',
    instruction: 'Volg de munten. Onderzoek de zwakke muur en de ruimte achter de geheime poort.',
    width: 1150,
    objects: [
      coin('clue', 185, 424),
      o('crack', 'breakable', 270, 350, 55, 30),
      o('extra', 'bonus', 286, 320, 24, 24),
      o('secret-portal', 'passage', 440, 416, 44, 64, {
        portal: { secret: true, destination: { object: 'return' } },
      }),
      o('return', 'teleporter', 820, 416, 44, 64, {
        portal: { destination: { object: 'secret-portal' } },
      }),
      o('secret', 'secret', 880, 400, 135, 80, { text: 'Je vond de geheime kamer!' }),
      o('treasure', 'chest', 970, 440, 44, 40, { chest: { rewards: [{ kind: 'bonus' }] } }),
    ],
    cards: [
      card(
        'Geheim, doorgang en bonusroute',
        'Een verborgen plek kan punten, een bericht of iets extra’s opleveren.',
        'Clue, ingang, beloning en terugweg.',
        'Gebruik een breekbaar blok, poort of schatkist.',
        'Een poort en een geheimgebied tellen apart.',
        'Bouw een geheime radiozender achter een podium.',
      ),
    ],
  },
];

export function makeZone(zone: Zone): Level {
  const width = zone.width ?? 960,
    height = zone.height ?? 540;
  const floor = zone.floor === false ? [] : [o('base-floor', 'ground', 0, height - 60, width, 60)];
  return playgroundSchema.parse({
    id: 'playground-' + zone.id,
    version: 1,
    name: zone.title,
    story: zone.instruction,
    goal: zone.instruction,
    difficulty: 'Easy',
    makers: [
      { name: 'Super Scratch', avatar: '#68e6cb' },
      { name: 'Playground', avatar: '#fcc96f' },
    ],
    palette: {
      sky: '#c7e8e1',
      far: '#9dbbbe',
      near: '#518e89',
      ground: '#263f52',
      accent: '#f4bf69',
    },
    character: { name: 'Pip', color: '#ffe2a0' },
    music: { tempo: 110, notes: [60, 64, 67, 69, 67, 64, 62, 67] },
    world: { width, height },
    spawn: { x: 52, y: height - 124 },
    targetTime: 60,
    instructions: zone.instruction,
    objects: [...floor, ...zone.objects],
    goals: zone.goals,
    events: zone.events,
    camera: zone.camera,
  });
}
