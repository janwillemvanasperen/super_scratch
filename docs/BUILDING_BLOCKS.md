# Bouwstenen

Alle objecten hebben `id, kind, x, y, w, h`. Coördinaten zijn pixels vanaf linksboven. Optioneel: `color, speed, range, period, duration, key, target, text`. Zie schema voor grenzen en standaardwaarden. Alleen de bij het type genoemde velden hebben een effect.

| kind              | Werking / extra velden                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| ground            | Massieve grond, kleur uit levelpalet, groene bovenrand                                                                       |
| platform          | Massief vast zwevend platform                                                                                                |
| wall              | Massieve wand                                                                                                                |
| movingX / movingY | Eenzijdig platform (van onderen passeerbaar) beweegt sinusvormig ±`range`; `speed` bepaalt beweging. Speler wordt meegenomen |
| vanish            | Van boven betreedbaar gedurende eerste 72% van `period` seconden; daarna alleen een zichtbare omtrek                         |
| breakable         | Massief; breekt bij een sprong tegen de onderkant, deeltjeseffect                                                            |
| spring            | Lanceert speler met impuls 740 px/s                                                                                          |
| spikes / lava     | Contact kost een hartje; afmetingen bepalen gevaarlijk gebied                                                                |
| trap              | Stekelval beweegt horizontaal ±`range` met `speed`                                                                           |
| falling           | Valt zodra speler binnen 100 px horizontaal komt; herstelt na verlaten onderzijde wereld                                     |
| walker            | Patrouilleert rond beginpositie, `speed`, `range`                                                                            |
| chaser            | Patrouilleert; volgt speler binnen 280 px                                                                                    |
| jumper            | Patrouilleert en springt ongeveer elke 1,5 s                                                                                 |
| flyer             | Sinusvlucht, horizontaal `range` en `speed`, verticaal ±24 px                                                                |
| shooter           | Staat stil; vuurt binnen 650 px elke `period` seconden een projectiel af; snelheid projectiel = `speed` + 130                |
| sentry            | Vaste vijand, ook van boven gevaarlijk                                                                                       |
| coin              | Eenmalig 100 punten en één munt                                                                                              |
| heart             | Herstelt één hartje, blijft liggen als gezondheid vol is                                                                     |
| key               | Voegt `key` toe aan sleutelbos (valt terug op eigen ID)                                                                      |
| bonus             | Eenmalig 500 punten                                                                                                          |
| invincible        | Tijdelijk onkwetsbaar gedurende `duration`                                                                                   |
| jump              | Tijdelijk hoger springen gedurende `duration`                                                                                |
| speed             | Tijdelijk sneller lopen gedurende `duration`                                                                                 |
| shield            | Tijdelijk schild gedurende `duration`, vervalt na eerste treffer                                                             |
| door              | Massief zolang gesloten; ↑ binnen 75 px, juiste `key` nodig; verandert visueel na openen                                     |
| checkpoint        | Aanraking stelt respawn in boven het vlaggetje; plaats op vaste veilige grond                                                |
| secret            | Verborgen ontdekkingsgebied; één keer 500 punten; `text` voor onthulling                                                     |
| passage           | Donkere opening; ↑ bij overlap teleporteert naar `target:{x,y}`                                                              |
| finish            | Aanraken voltooit level; vlag is herkenbaar en geanimeerde felicitatie volgt                                                 |
| crate             | Massieve kist met zwaartekracht; ↓ dichtbij oppakken/neerzetten; draagt mee boven hoofd                                      |
| decoration        | Decoratief bord; `text` verschijnt binnen 120 px                                                                             |

Afgronden maak je door grond weg te laten. Een geheime ruimte ontstaat uit platforms/muren, een `secret`-gebied en eventueel twee passages. Achtergronden bestaan uit twee parallaxlandschappen, bewegende wolken en zon. Kleur ze via het levelpalet. Personage en makersavatars worden uit pixelvormen met kleuraccent gegenereerd. Vijandkleur, afmetingen en gedrag zijn per object instelbaar; complexe eigen silhouettes vereisen uitbreiding van de vertrouwde renderer.

## Nieuwe unieke mechaniek

Het schema kent maximaal één `mechanic` per level. `wind` is een voorbeeldfactory: alleen invloed op de eigen speler in de lucht, eigen lokale tijd en `destroy()`. Registreer nieuwe vertrouwde TypeScript-factories in `src/mechanics/registry.ts` en breid de schema-enum uit. Dit vereist een eenmalige enginebuild. JSON wordt nooit als JavaScript geëvalueerd. Alleen extra levels met bestaande bouwstenen kunnen zonder enginebuild worden toegevoegd.

Opruimen: scene-shutdown verwijdert focuslistener, toetsen, muziekinterval en mechaniekstatus. Phaser ruimt scene-objecten op. Menunavigatie vernietigt de volledige game-instance. Web Audio-oscillatoren hebben korte eindtijden, zodat er geen blijvende stemmen achterblijven.

## Visuele uitbreiding V2.1

Alle bovenstaande soorten ondersteunen een eigen afbeelding of spritesheet via `styles.<kind>` of `object.visual`, met een optionele afzonderlijke `hitbox`. Spelgedrag blijft gelijk. Decoratie ondersteunt nu willekeurige beelden, animatie, transforms en sinusbeweging, zonder botsing tenzij `solid:true`. Zie [ASSETS.md](ASSETS.md).

## Aanvulling V2.2

Zie [bouwsystemen](BUILDING_SYSTEMS.md) voor de twaalf nieuwe objecttypen en de uitbreiding van kisten en doorgangen. Deze bestaande functies mogen gecombineerd worden zonder nieuwe spelcode. Beschrijf object-ID, bediening, gekoppelde doelen, duur, terugkeer bij levensverlies en benodigde beelden. De actuele [studentencatalogus](../STUDENT_LEVEL_GUIDE.md) bevat uitleg op taalniveau 2F.

V2.3 voegt modulaire vijanden, eindbazen, doelgebieden en finishvoorwaarden toe. Zie [vijanden en doelen](ENEMIES_AND_GOALS.md).

## V2.5 – Bouwstenen uitproberen

Open Super Scratch Playground op het startscherm. De zestien zones dekken samen alle ondersteunde objecttypen. Bij iedere groep staat een kaart met werking, instelbare keuzes, combinaties, grenzen en een ontwerpidee. Een oefenzone hoeft geen complete avonturenroute te vormen. De vijf reguliere levels worden apart geregistreerd en kunnen records opslaan.
