# Levelschema — basis en V2.1

De uitvoerbare waarheid is `src/levels/schema.ts` (Zod). De loader valideert ieder bestand afzonderlijk. Eén foutief bestand blokkeert andere levels niet. JSON bevat data, nooit uitvoerbare scripts. Object-ID's moeten uniek zijn binnen het level; level-ID's binnen het register.

## Verplichte levelvelden

| Veld       | Type en grenzen                                                                   |
| ---------- | --------------------------------------------------------------------------------- |
| id         | Kleine letters a–z, cijfers, koppeltekens; uniek                                  |
| version    | Positief geheel getal                                                             |
| name       | 1–80 tekens                                                                       |
| story      | 1–1500 tekens                                                                     |
| goal       | Niet-lege doelomschrijving                                                        |
| difficulty | Easy, Medium of Hard                                                              |
| makers     | Exact twee objecten met niet-lege name en avatar (#RRGGBB)                        |
| palette    | sky, far, near, ground, accent: elk #RRGGBB                                       |
| character  | name en color (#RRGGBB)                                                           |
| music      | tempo: 60–200; notes: 4–64 gehele MIDI-noten van 36–96                            |
| world      | width: 960–50000; height: 540–4000; ontwerp v1 op hoogte 540 (horizontale camera) |
| spawn      | x en y ≥ 0, binnen de wereld                                                      |
| targetTime | 10–600 seconden                                                                   |
| objects    | 1–4000 bouwstenen; minimaal munt, vijand, geheim en finish                        |

Optioneel: `tutorial` (boolean, standaard false), `instructions` (tekst), `mechanic` (één geregistreerde naam, momenteel wind). Het register `public/levels/index.json` is een array van bestandsnamen zoals `["tutorial.json","first-adventure.json"]`. Bestandsnamen mogen alleen kleine letters, cijfers en koppeltekens bevatten met extensie .json.

## Objectvelden

| Veld     | Type / standaard                                                            |
| -------- | --------------------------------------------------------------------------- |
| id       | Niet-lege unieke string                                                     |
| kind     | Eén type uit BUILDING_BLOCKS.md                                             |
| x, y     | Getal ≥ 0; object-x + breedte binnen wereld                                 |
| w        | 8–8000; standaard 32                                                        |
| h        | 8–800; standaard 32                                                         |
| color    | Optioneel #RRGGBB                                                           |
| speed    | 0–500; standaard 55                                                         |
| range    | 0–1500; standaard 100                                                       |
| period   | 0,5–30 seconden; standaard 3                                                |
| duration | 1–60 seconden; standaard 10                                                 |
| key      | Optionele sleutelcode; voor deur verplicht en moet bij een key-object horen |
| target   | Optioneel {x,y} ≥ 0; bestemming van passage                                 |
| text     | Optioneel, maximaal 180 tekens                                              |

Geometrievalidatie kan niet bewijzen dat iedere route haalbaar is. Speelbaarheidstests blijven noodzakelijk. Bewegingsextremen van platforms en vijanden moeten binnen de wereld blijven; ontwerpers bewaken die marges. Geen HTML in teksten: de UI ontsmet alle leveltekst.

## Volledige voorbeelddefinitie

Dit is een compacte technisch geldige startwereld; breid hem uit tot de gewenste 30–60 seconden. Vervang makers door echte namen, voeg een eigen identiteit toe en test de route.

```json
{
  "id": "duo-voorbeeld",
  "version": 1,
  "name": "De ideeënroute",
  "story": "Twee makers zoeken het licht van hun atelier. Pip helpt de gouden sleutel terug te vinden.",
  "goal": "Vind de sleutel en bereik de gele vlag.",
  "difficulty": "Easy",
  "tutorial": false,
  "makers": [
    {
      "name": "Maker 1",
      "avatar": "#ffcc88"
    },
    {
      "name": "Maker 2",
      "avatar": "#88ddcc"
    }
  ],
  "palette": {
    "sky": "#bce8e5",
    "far": "#87c6bb",
    "near": "#4c9b85",
    "ground": "#7c6652",
    "accent": "#f8cc71"
  },
  "character": {
    "name": "Pip",
    "color": "#ffdc8b"
  },
  "music": {
    "tempo": 110,
    "notes": [60, 64, 67, 72, 67, 64, 62, 67]
  },
  "world": {
    "width": 2400,
    "height": 540
  },
  "spawn": {
    "x": 60,
    "y": 420
  },
  "targetTime": 30,
  "instructions": "Pijltjes lopen. Spatie springen. Open de deur met ↑.",
  "objects": [
    {
      "id": "grond",
      "kind": "ground",
      "x": 0,
      "y": 480,
      "w": 2400,
      "h": 60
    },
    {
      "id": "munt",
      "kind": "coin",
      "x": 250,
      "y": 440,
      "w": 20,
      "h": 24
    },
    {
      "id": "vijand",
      "kind": "walker",
      "x": 650,
      "y": 450,
      "w": 30,
      "h": 30,
      "speed": 45,
      "range": 60,
      "color": "#cc8899"
    },
    {
      "id": "dak",
      "kind": "platform",
      "x": 900,
      "y": 380,
      "w": 180,
      "h": 20
    },
    {
      "id": "geheim",
      "kind": "secret",
      "x": 920,
      "y": 410,
      "w": 130,
      "h": 70,
      "text": "De geheime ideeënkamer! +500"
    },
    {
      "id": "sleutel",
      "kind": "key",
      "x": 1200,
      "y": 440,
      "w": 28,
      "h": 28,
      "key": "atelier"
    },
    {
      "id": "checkpoint",
      "kind": "checkpoint",
      "x": 1350,
      "y": 414,
      "w": 32,
      "h": 66
    },
    {
      "id": "deur",
      "kind": "door",
      "x": 1550,
      "y": 350,
      "w": 40,
      "h": 130,
      "key": "atelier"
    },
    {
      "id": "finish",
      "kind": "finish",
      "x": 2250,
      "y": 365,
      "w": 64,
      "h": 115
    }
  ]
}
```

De uitgebreide werkende definities staan in `public/levels/tutorial.json` en `public/levels/first-adventure.json`. Je hoeft niet alle optionele objectvelden over te nemen: validatie vult de standaardwaarden in.

## Optionele uitbreiding V2.1

De verplichte velden hierboven blijven geldig. Optioneel: `assets`, `styles`, `background`, `presentation`, `audio`, `demo`; daarnaast `character.visual/hitbox`, `makers[].avatarAsset` en `objects[].visual/hitbox/motion/solid`. Volledige uitleg en grenzen: [ASSETS.md](ASSETS.md). Alle 33 objectsoorten kunnen dezelfde visuele instellingen gebruiken. `motion` is alleen voor decor; `solid` maakt alleen decor massief. De oude tekeningen blijven terugval.

## Aanvulling V2.2

Zie [bouwsystemen](BUILDING_SYSTEMS.md) voor de twaalf nieuwe objecttypen en de uitbreiding van kisten en doorgangen. Deze bestaande functies mogen gecombineerd worden zonder nieuwe spelcode. Beschrijf object-ID, bediening, gekoppelde doelen, duur, terugkeer bij levensverlies en benodigde beelden. De actuele [studentencatalogus](../STUDENT_LEVEL_GUIDE.md) bevat uitleg op taalniveau 2F.
