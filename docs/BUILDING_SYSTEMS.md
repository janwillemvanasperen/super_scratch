# V2.2 — configureerbare bouwsystemen

Deze ingebouwde systemen mogen samen in één level. Ze tellen niet mee als de ene nieuwe, zelf te programmeren mechaniek. Bestaande 33 soorten blijven beschikbaar; V2.2 voegt 12 soorten toe, totaal 45. De vier bestaande level-JSON's zijn ongewijzigd. De interne demonstratie staat in `tests/fixtures/building-lab.json`, buiten het publieke register.

## Contract en architectuur

`building-schema.ts` valideert waarden. `validate-buildings.ts` controleert koppelingen en bestemmingen. `world-system.ts` beheert per poging een eigen toestand en gebruikt de bestaande botsingen en score. `draw-building.ts` tekent de standaardvormen. `GameScene` verbindt invoer, simulatie, rendering, HUD en lifecycle.

Alle objecten houden de bestaande velden `id`, `kind`, `x`, `y`, `w`, `h`. Optioneel: `enabled` (standaard true) en `resetOnDeath` (standaard false). `enabled:false` schakelt gedrag en botsing uit; het beeld blijft zichtbaar. Actie `hide` verbergt ook het beeld en schakelt gedrag/botsing uit. Gebruik `show` om dat terug te draaien. `show` verandert `enabled` niet.

Het V2.1-assetsysteem blijft beschikbaar: `asset`, `style`, `animations`, `hitbox`, tint, schaal en decorbeweging. Beeld en contactgebied zijn onafhankelijk. Nieuwe toestandsnamen voor animaties: `active`, `inactive`, `shake`, `open`, `talk`; speler `climb` en `swim`. Ontbrekende animaties gebruiken de bestaande terugvalweergave. Kleuren/beelden regelen uiterlijk, niet het gedrag.

## Trigger en acties

`trigger` is verplicht op `switch` en `pressurePlate`:

| Veld | Waarden | Standaard |
|---|---|---|
| `mode` | `toggle`, `momentary`, `timed`, `once` | `toggle` |
| `duration` | 0,1–120 seconden; alleen timed | 3 |
| `accepts` | `player`, `crate`, `both`; alleen plaat | `both` |
| `weight` | 0,1–20; speler weegt 1, kist gebruikt carry.weight | 1 |
| `on` | 1–32 acties bij activeren | verplicht |
| `off` | 0–32 acties bij deactiveren | [] |

`toggle` wisselt bij iedere nieuwe druk; `momentary` werkt zolang ↑ is ingedrukt of voldoende gewicht op de plaat staat; `timed` schakelt na de duur uit; `once` blijft aan. Voor een volgende tijdstart moet je opnieuw drukken of de plaat verlaten en betreden. Een gedragen kist telt niet mee.

Acties zijn gegevens, geen scripts. Ze activeren niet recursief andere triggers.

```json
{"type":"object","target":"deur-magazijn","action":"open"}
```

- `open` / `close`: alleen deuren. Een deur wacht met sluiten zolang speler of kist de ruimte bezet.
- `enable` / `disable`: gedrag en botsing aan/uit.
- `show` / `hide`: zichtbaarheid plus deelname aan gedrag/botsing.
- `start` / `stop`: routeplatform, lift, movingX, movingY, trap of decoratie. Stilzetten bewaart de plaats; starten gaat verder. `start` zet ook enabled aan.
- `toggle`: wisselt enabled, niet de triggerstand van het doel.
- `reset`: beginstand, beginpositie en bewegingsklok herstellen. Ontvangen beloningen blijven verbruikt. Niet gebruiken om een trigger zichzelf te laten resetten.
- `{"type":"message","text":"De brug is open."}`: maximaal 180 tekens.
- `{"type":"reward","reward":{"kind":"coin","amount":3}}`: eenmalige beloning per actie en bron (on/off zijn afzonderlijke bronnen).

Een vast object inschakelen, tonen of resetten wordt geweigerd als het de speler of een kist zou insluiten. Alleen het sluiten van een deur wordt uitgesteld en automatisch opnieuw geprobeerd. Zorg bij een brug voor vrije ruimte of een herhaalbare schakelaar.

Voorbeeld: kistplaat en deur. Deze objecten horen in een volledig geldig level:

```json
[
  {"id":"kist","kind":"crate","x":240,"y":448,"w":32,"h":32,"carry":{}},
  {"id":"plaat","kind":"pressurePlate","x":400,"y":470,"w":96,"h":10,
   "trigger":{"mode":"momentary","accepts":"crate",
    "on":[{"type":"object","target":"deur","action":"open"}],
    "off":[{"type":"object","target":"deur","action":"close"}]}},
  {"id":"deur","kind":"door","x":600,"y":370,"w":32,"h":110}
]
```

Een gekoppelde deur mag zonder sleutel. Een sleuteldeur kan ook een sleutel uit een NPC, schatkist of beloningsactie gebruiken. Deurinteractie verbruikt de sleutel niet. Een combinatie van sleutelinteractie en trigger kan dezelfde deur bedienen; vermijd tegenstrijdige opdrachten.

## Ladder en routes

`ladder` heeft `ladder:{speed:120}`; snelheid 20–300 px/s. ↑/↓ klimmen, Spatie springt weg. Na een sprong eerst de klimtoets loslaten of de ladder verlaten voordat opnieuw vastgrijpen werkt.

`elevator` en `pathPlatform` vereisen `route`:

```json
{"points":[{"x":1200,"y":460},{"x":1200,"y":350},{"x":1340,"y":280}],
 "speed":70,"wait":1,"mode":"pingpong","activation":"trigger","oneWay":true}
```

- 2–32 punten, eerste punt exact object-x/y. Rechte lijnen tussen de punten.
- `speed`: 5–400 px/s; standaard 70. `wait`: 0–30 seconden per halte; standaard 1.
- `mode`: `pingpong` heen/terug, of `loop` van laatste naar eerste punt.
- `activation`: `auto`, `rider` (speler staat erop), `interact` (↑ rijdt één halte verder), `trigger` (wacht op startactie).
- `oneWay`: standaard true; speler kan van onderen door het platform.
- Speler en losse kisten bovenop worden meegenomen. Het platform stopt bij een vast obstakel of een plafond voor een passagier. Dit is botsingsbescherming, geen automatische routezoeker. Geef een ontsnappingsroute en vrije ruimte voor de gedragen kist.

Een lift kan niet gegarandeerd iedere verkeerd ontworpen puzzel oplossen. Geometrie, timing en terugweg moeten worden gespeeld. De camera blijft horizontaal.

## Water

`water` vereist `water:{}`. De zone zelf is niet massief; teken de bodem apart.

| Veld | Bereik | Standaard |
|---|---|---|
| `gravity` | 0–1 maal normale zwaartekracht | 0,18 |
| `speed`, `swimSpeed` | 20–350 px/s, horizontaal/verticaal | 130 |
| `exitJump` | 150–650 beginsnelheid omhoog | 420 |
| `currentX`, `currentY` | -250–250 px/s | 0 |
| `oxygen` | optioneel, 2–120 seconden | onbeperkt |

Pijltjes sturen, Spatie geeft een zwemslag. Bij het oppervlak geeft ↑ of Spatie een uitstapsprong. De zuurstofmeter loopt terug met het hoofd onder water en vult opnieuw bij bovenkomen, verlaten of een andere waterzone. Bij nul volgt periodiek schade volgens de bestaande schadebescherming. De HUD toont seconden en een meter. Zonder oxygen is er geen zuurstofschade. Schilden en onkwetsbaarheid blijven gelden.

Water regelt alleen de speler, geen drijvende kisten of zwemmende vijanden. Stroming kan sterker zijn dan de eigen zwemsnelheid: test altijd een uitgang. Bij overlappende waterzones geldt de eerste in objectvolgorde.

## Oppervlakken

`surface` is verplicht op soort `surface`, optioneel op ground, platform, movingX, movingY, elevator, pathPlatform en collapsePlatform.

| `type` | Effect |
|---|---|
| `ice` | Wrijving standaard 0,12; langzamer versnellen en remmen |
| `mud` | Snelheidsfactor standaard 0,45; wrijving 1,5 |
| `conveyor` | Geef `conveyor` mee: negatief links, positief rechts |
| `bounce` | Landen lanceert met `bounce` (standaard 650) |
| `friction` | Eigen wrijving; standaard 1 |
| `oneWay` | Speler springt van onderaf door het platform |

Aanpasbaar bij alle types: `friction` 0,01–4, `speedFactor` 0,1–2, `conveyor` -300–300, `bounce` 100–900. Effecten op horizontale snelheid werken zolang de speler erop staat. Kisten gebruiken gewone vaste botsingen, ook op eenrichtingsplatforms. Er is geen helling- of vloeistoffysica.

## Omgevingszones

`zone` vereist `zone:{}`. `gravity` 0–3 (1), `speedFactor` 0,1–2 (1), `forceX/Y` -1500–1500 (0), `driftX/Y` -300–300 (0), `duration` 0–30 seconden (0). Haakjes geven standaardwaarden.

Force is versnelling; drift is een doelsnelheid. Positief is rechts/beneden, negatief links/boven. Buiten de zone stopt het effect, behalve de expliciete duur na verlaten. Bestaande snelheid verdwijnt niet onmiddellijk. Overlappende zones vermenigvuldigen zwaartekracht/snelheid (begrensd op 3 en 2) en tellen krachten/drift op. De snelheid is begrensd op horizontaal ±700 en verticaal ±850 vóór eventuele water/ladderregeling.

Zones beïnvloeden de speler; een platform behoudt zijn eigen route. Water vervangt de zonebewegingsregeling; een actieve ladder heeft vervolgens voorrang. Vermijd onduidelijke overlap. Een vloer kan snelheid/wrijving toevoegen. De standaardzone toont een kader; eigen asset, tint en transparantie zijn instelbaar.

## Portalen

`teleporter` vereist `portal`; bestaand `passage` mag portal gebruiken in plaats van het oude target-gedrag.

```json
{"destination":{"object":"poort-b","offsetX":0,"offsetY":0},
 "activation":"interact","cooldown":0.75,"secret":true}
```

Of destination `{"x":2000,"y":420}`. Optioneel `key` en `switch`; beide voorwaarden moeten kloppen als beide opgegeven zijn. `activation`: auto/interact. Cooldown 0,25–10 s. Voor twee richtingen maak je twee objecten met elkaars ID als bestemming. Voor één richting alleen de heenpoort.

Een automatische poort wacht na gebruik tot de speler alle poortgebieden heeft verlaten en de cooldown voorbij is. Een handmatige terugpoort vereist opnieuw ↑ na de cooldown. Bestemmingen moeten bestaan en binnen de wereld liggen. Bekende vaste muren worden bij laden afgewezen; tijdens gebruik wordt de actuele bestemming opnieuw op grenzen en botsingen gecontroleerd. Een geblokkeerde bestemming geeft een bericht. Een geheime poort geeft eenmaal 500 punten; een apart geheimgebied erachter is een afzonderlijke beloning.

## Instorten, dragen en beloningen

`collapsePlatform` vereist `collapse:{delay:0.5,returnAfter:3}`. Delay 0,05–10 s na erop landen. ReturnAfter 0–60 s; 0 betekent niet terugkeren. Herstel wacht tot de plek vrij is. Het platform zelf valt niet als een steen omlaag; het verdwijnt.

Een `crate` met `carry:{}` kan worden gegooid: `throwable` true, `weight` 1 (0,1–20), `throwSpeed` 340 (50–600), `throwLift` 180 (0–500), `defeatsEnemies` true. ↓ oppakken/neerzetten, ↓ + nieuwe Spatie gooien. Eén tegelijk. Worp richting de kijkrichting, stopt tegen vaste objecten en remt af. Raakt walker/chaser/jumper/flyer/shooter zolang de worp snel genoeg is; sentry blijft beschermd. Score eenmaal 200 per vijand. Buiten de wereld keert een kist terug naar zijn beginpunt. Zonder carry blijven oude kisten het oude gedrag houden.

`chest:{rewards:[...]}` op `chest`. 1–10 beloningen; optioneel key/switch als toegangseis. ↑ opent eenmaal per poging.

Beloning: `kind` coin, bonus, key, heart, invincible, jump, speed, shield of secret. `amount` 1–20 (1) voor munten/bonus/geheim/hartjes; hartjes maximaal 3. Sleutel vereist `key` en wordt als één sleutel opgeslagen. Power-up gebruikt `duration` 1–60 s (10); amount vermenigvuldigt die duur niet. Alle puntwaarden blijven vast. Beloningen worden direct toegekend, niet als losse voorwerpen uitgeworpen. Resultaat toont bij levels met extra beloningsbronnen de verzamelde aantallen, zonder misleidend totaal van alleen geplaatste objecten.

## NPC

`npc` vereist bijvoorbeeld:

```json
{"lines":["Welkom!","Hier is de sleutel."],
 "reward":{"kind":"key","key":"archief"},"actions":[],"repeatDialogue":true}
```

1–6 zinnen, elk 1–140 tekens. Iedere nieuwe ↑ toont de volgende zin in een ballon (6 seconden of tot weglopen). Beloning/acties volgen na de laatste zin, eenmaal per poging. `actions` maximaal 32. `repeatDialogue` true laat alleen het gesprek herhalen.

`requiresKey` controleert een sleutel. `receive` is none/key/crate. Key vereist requiresKey; crate vereist een gedragen kist. `consume` standaard true neemt het voorwerp na de laatste zin in. False controleert alleen bezit. Geen willekeurige inventaris, keuzes, questboom of nieuw gevechtssysteem. Eigen uiterlijk via V2.1-assets.

## Levenscyclus en grenzen

- Pauze stopt de simulatie en alle nieuwe timers; audio gebruikt de bestaande pauzefunctie.
- Levensverlies ruimt zuurstof, tekstballon, klimstand, werpsnelheid en tijdelijke zonewerking op. Objectstand blijft standaard bestaan. `resetOnDeath:true` herstelt beginpositie en systeemstand; verzamelde beloningen blijven verbruikt. Zet bij samenhangende puzzels alle nodige objecten consequent terug. Er is geen automatisch herstel van sleutelafhankelijkheden.
- Herstart bouwt een nieuwe scene en WorldSystem. Shutdown verwijdert systeemtoestanden naast de bestaande listener-/asset-/audio-opruiming. Er draaien geen afzonderlijke mechaniektimers of geëvalueerde scripts.
- Validatie controleert typecombinaties, bereikwaarden, unieke IDs, actie-/sleutel-/switchverwijzingen, routepunten en poortbestemmingen. Ze bewijst geen bereikbaarheid, veilige volledige baan, afwezigheid van sleutelcycli of goede performance bij het maximale aantal objecten.
- De interne testpagina heeft een stationkeuze en leesbare teststatus. Zij wordt niet geïmporteerd door productie en heeft geen productie-debughooks.
- Tien losse studentenlevels passen in deze architectuur: eigen JSON, eigen assetmap, uniek level-ID, één toevoeging aan het register. Bestaande levels hoeven niet te veranderen. Eén coördinator beheert het register; nieuwe code vereist regressietests voor alle levels.
