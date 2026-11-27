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
