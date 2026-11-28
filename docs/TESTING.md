# Testlog V2.1 — 27 november 2026

## Automatische controles

- `npm test`: 39 tests geslaagd in zes bestanden; de oorspronkelijke twintig tests zijn behouden.
- `npm run validate:levels`: tutorial (60 objecten), voorbeeld (114), Midnight City (63) en Deep Sea Treasure (63) geldig, inclusief bestanden, verwijzingen, spritesheets en animaties.
- `npm run build`: validatie, TypeScript en Vite-productiebundel geslaagd. Vite waarschuwt over de grote Phaser-bundel; dit is geen bouwfout.
- Git-vergelijking: tutorial.json, first-adventure.json, src/core/rules.ts, src/core/physics.ts en src/entities/player.ts ongewijzigd ten opzichte van herstelpunt `pre-v2.1-20261127`.

Gameplaytests gebruiken de echte GameScene.tick, Player en botsingscode. Rendering en audio zijn daarin testdoubles. Alle vier complete routes worden met gesimuleerde toetsstatus doorlopen, zonder teleporteren. Gerichte bouwsteentests plaatsen de speler wel bewust bij het te onderzoeken object.

Gedekt: schade, knipperende bescherming, schild, drie levens/game over, afgrond via de routes, checkpoint/respawn, sleutel/deur, kist dragen/neerzetten, alle power-ups, hartje, springveer, geheim, finish, breekbare blokken, verdwijnende platforms, bewegende platforms en projectielen. Score, records, foutbestendige opslag, sprongafstanden en registertoevoeging/verwijdering zijn regressietests.

Nieuwe tests controleren alle 33 objecttypen met onafhankelijke beeld- en botsingsmaten, behoud van spelerhitbox bij respawn, assetpaden/formats, PNG-beschadiging, sheetindeling, ontbrekende bestanden/verwijzingen/frames, eindige en herhalende animaties, lange herhalende achtergronden, beeldfallback, renderer-opruiming en alleen het geselecteerde level preloaden. Audio: bestanden laden, decodefout/404, late antwoorden na stoppen, aparte volumes, oude volume-instellingen migreren, finishgeluid, loop aan/uit, pauze en hervatten op de bewaarde positie.

De registrytest voegt 100 geldige testlevels en één fout bestand toe, controleert isolatie en verwijdert daarna een testlevel en de foutieve file. Dit zijn fetch-testdoubles; er zijn geen blijvende testkaarten.

## Daadwerkelijk gespeeld in de browser

Chromium-gebaseerde ingebouwde browser, lokale Vite-server, echte toetsen en klikken:

- Midnight City volledig uitgespeeld: 4.968 punten, 13/19 munten, 1/1 geheimen, drie hartjes en drie levens; 0:45 inclusief tijd tussen testacties.
- Deep Sea Treasure volledig uitgespeeld: 4.780 punten, 13/19 munten, 1/1 geheimen, drie hartjes en drie levens; 1:08 inclusief tijd tussen testacties.
- In beide: eigen kaart- en verhaalbeelden, makeravatars, korte intro, eigen speler en bewegende vijanden, verzamelanimaties, gelaagde achtergrond, tegels, decor, sleutel, deur, checkpoint, stekels, bewegende brug, schild, geheime doorgang, bonus en eigen voltooiingsbeeld.
- Oude tutorial opnieuw gestart: lopen, springen, acht munten en pauze. Oud voorbeeld opnieuw gestart: lopen, springen, munten, schade en vijandstomp. Hun volledige routes zijn aanvullend automatisch getest.
- Wisselen van demo naar demo naar voorbeeld naar tutorial; één actieve game. Voltooid-markeringen en records zichtbaar in het menu.
- Pauze, instellingen, afzonderlijke volumeaanpassing en hervatten. Normale gameconsole zonder errors/warnings tijdens deze controles.

De oude browserronde vóór V2.1 had de tutorial al volledig uitgespeeld, met 5.098 punten, 13/23 munten, één vijand, één geheim en drie levens. Herladen en blijvende records werden toen gecontroleerd. Dat is historisch bewijs; de V2.1-browsertests hierboven zijn een aparte ronde.

## Lokale render- en audiometing

Met `tests/browser-check.html` draait de echte Phaser-renderer op 960×540. Vier runs van acht seconden, daarna twee runs van drie seconden met bewust defecte assets. Na de eerste 30 frames worden frameduur en updatekosten gemeten. Deze testpagina en testcode worden niet door de productie-entry geïmporteerd en staan niet in dist.

| Run | Gemiddelde FPS | 95e percentiel frameduur | 95e percentiel update/render-aansturing |
|---|---:|---:|---:|
| Tutorial | 60 | 16,67 ms | 0,8 ms |
| Voorbeeld | 60 | 16,67 ms | 0,7 ms |
| Midnight City | 60 | 16,69 ms | 2,6 ms |
| Deep Sea Treasure | 60 | 16,69 ms | 2,0 ms |
| Ontbrekende bestanden | 60 | 16,68 ms | 2,2 ms |
| Beschadigde bestanden | 60 | 16,68 ms | 2,3 ms |

Dit is een korte meting op de beschikbare computer/browser. Het bewijst geen 60 FPS op iedere gemiddelde schoollaptop, geen langdurige geheugentest en geen goede prestaties bij 4.000 bewegende objecten. De updatekolom meet JavaScript, niet afzonderlijk de volledige GPU-tijd. De schermverversing begrenst de waargenomen FPS.

De browser decodeerde alle zes eigen audiobestanden van de twee normale demo's succesvol. Bij zowel het ontbrekende als het beschadigde testbestand bleef de basisheld zichtbaar, liep de simulatie verder en bleef gegenereerde audio beschikbaar. De console meldde de verwachte asset/decodefouten. Geen vastloper. De Vite-server levert bij sommige ontbrekende URL's HTML terug; ook die decodefout werd afgevangen. Echte HTTP-404-afhandeling is aanvullend met een testdouble gecontroleerd.

Na elk van de zes runs waren nul gamecanvassen over. Dit controleert DOM-opruiming; timers, bronnen en teksturen worden ook via unit-tests gecontroleerd. Het is geen heap-profiel.

Herhalen:

```sh
npm run qa:fixtures
npm run dev -- --port 5176
```

Open `/tests/browser-check.html` en klik **Start controle**. Na afloop:

```sh
npm run qa:clean
npm run build
```

De tijdelijke corrupte bestanden zijn na de uitgevoerde meting verwijderd. Validatie/build weigert publicatie zolang public/assets/qa-local bestaat. De twee QA-gevallen staan nooit in het levelregister.

## Grenzen en resterende aandachtspunten

- Audio-decode, afspelen en lifecycle zijn getest; de muzikale kwaliteit is niet door luisteren beoordeeld. Demo's gebruiken WAV. MP3/OGG zijn schema-/codeondersteuning, geen afzonderlijk afgeluisterde browserfixtures. Codec-ondersteuning kan per browser verschillen.
- Geen afzonderlijke Firefox-/Safari-installaties en geen tweede fysieke schoollaptop getest.
- Willekeurige nieuwe kunst vereist controle op uitstraling en passend contactgebied. Validatie bewijst geen speelbaarheid of veilige bewegingsbaan.
- Geen zwemmen, verticale camera, video-intro, uploadeditor of nieuwe vijand-AI toegevoegd.
- De Phaser-productiebundel blijft ongeveer 1,6 MB ongecomprimeerd / 373 kB gzip, naast lokale fonts en levelassets. Grote beelden/audio laden per level, kaartbeelden kunnen al in het menu laden.

## V2.2 — 27 november 2026

De bovenstaande V2.1-resultaten zijn historisch. V2.2 voegt zwemmen en andere bouwstenen toe.

- `npm test`: 61 geslaagde tests, 7 bestanden. 22 gerichte tests voor alle twaalf nieuwe typen, triggerkoppelingen, kistplaat/deur, liften, ladders, water/zuurstof, oppervlakken, zones, geheime poorten, lusbeveiliging, instorten, gooien, schatkisten, NPC-beloningen/ontvangst, pauze/reset/opruiming en veilige botsingen.
- Alle vier bestaande levels worden in gameplaytests van start tot finish gespeeld met gesimuleerde toetsen, zonder verplaatsingshook. De gerichte mechaniektests plaatsen de speler wel bij een specifieke testopstelling; die tests zijn geen volledige speelroute.
- Registertest laadt 100 levels, isoleert een fout bestand en verwijdert een tijdelijke toevoeging. Publiek register blijft vier levels.
- `npm run build`: levelvalidatie, TypeScript en Vite geslaagd. Bundel circa 1,62 MB / 381 kB gzip; bekende chunkwaarschuwing.
- Git-vergelijking met herstelpunt: public/levels, public/assets, src/core en src/entities ongewijzigd.

### Werkelijke browsertests

Lokale echte Phaser-game via `/tests/building-lab.html`, met toetsen en stationkeuze:

- Kist opgepakt, op plaat neergezet: plaat actief en deur open.
- Ladder met ↑ beklommen: y 450 naar 304, klimstand actief.
- Water met stroming en ↓: zwemstand actief, zuurstof liep terug en verdween na verlaten van de zone.
- Geheime poort heen én terug met ↑; eenmaal beloning voor poort en aparte geheime ruimte.
- NPC toont eigen figuur en zichtbare tekstballon. Na tweede zin sleutel ontvangen.
- Schakelaar start meerpuntslift. Pauze bevriest positie ondanks toetsinvoer; herstart herstelt beginstand.
- Windzone verplaatst speler en routeplatform beweegt onafhankelijk.
- Gedragen kist met ↓ + Spatie naar vijand gegooid: 200 punten.
- Schatkist geopend: drie munten, bonus en schild ontvangen; apart geheimgebied telt ook mee.
- Geen JavaScript-consolefouten tijdens deze interacties.

Dit zijn gerichte browserproeven. De automatische tests dekken daarnaast randgevallen en overige instellingen; niet iedere mogelijke combinatie is handmatig gespeeld. Geen nieuwe browser-/hardwareprestatiemeting voor V2.2 en geen garantie voor het maximum van 4.000 objecten. De tijdelijke testpagina en fixture staan buiten de productie-entry en het publieke register.

### Volledige V2.2-labroute en hoofdmenu

Daarna is het interne lab in de echte browser van begin tot finish uitgespeeld, zonder stationwissel of debugverplaatsing. De spelpoorten zijn wel gebruikt. Eindresultaat: 4.986 punten, 4 munten, 3 geheimen, 3 hartjes en 3 levens; circa 159 seconden inclusief observatiepauzes. Doorlopen: kistplaat/deur, werpgebied, water met stroming, ijs/modder/transportband/veer, zones, geheime en automatische poort, platform op gewicht, instortende brug, handbediende lift, NPC-sleutel en deur, sleutel inleveren, tijdelijke schakelaar, permanente schakelaar, beloningskist en finish. Niet iedere optionele route is in deze ene run benut; losse stations en automatische tests vullen dat aan.

De hoofdgame is apart geopend: tutorial gestart, lopen/springen, vijf munten/500 punten en Escape-pauzemenu gecontroleerd. Geen consolefouten. Een testlabweergave na ontwikkelherladen reageerde tijdelijk niet op toetsen; na een schone paginaherlading werkte de volledige route. Dit is geen waargenomen fout in de productieflow. De testlab-HUD is aangepast zodat de finishmelding niet door de laatste HUD-update verdwijnt.

## V2.3 – 28 november 2026

76 automatische tests geslaagd. Alle vier eerdere levels zijn volledig uitgespeeld met gesimuleerde toetsen. De nieuwe integratietests gebruiken echte simulatiestappen en plaatsen de speler gericht bij de testobjecten. Ze controleren het volledige eindbaasgevecht met drie treffers, fasewisseling, een blokkade vóór de doelen, een checkpoint en levensverlies, plus een eenmalige eindscore. De zeven basisbewegingen en de zes extra gedragingen zijn getest, waaronder een vliegende schutter en een achtervolger die zich verstopt. Ongeldige combinaties en doelverwijzingen zijn afgewezen.

Levelvalidatie, TypeScript en de productiebuild slagen voor vijf levels. Vite meldt de bestaande waarschuwing voor de grote Phaser-bundel. Het eindbaasgevecht is automatisch getest, niet handmatig in een browser uitgespeeld.
