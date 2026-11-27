# Testlog — 27 november 2026

## Automatisch

`npm test`: 20 tests geslaagd. Regels, score, geen dubbele punten, levens, physics, opslag/herladen/foutafhandeling, schema, verplichte bouwstenen, sprongafstanden en registertoevoeging/verwijdering.

De gameplay-integratietests gebruiken de echte GameScene.tick, speler en botsingscode, met alleen Phaser-rendering/audio vervangen door testdoubles. Beide volledige routes worden doorlopen met gesimuleerde toetsstatus, zonder teleportatie. Afzonderlijke bouwsteentests plaatsen de speler bewust bij het te testen object: schade, onkwetsbaarheid, schild, checkpoint/respawn/game over, sleutel/deur, kist oppakken/neerzetten, alle power-ups, hartje, springveer, geheim, finish, breekbaar blok, verdwijnend platform en projectiel. Een specifieke regressietest laat een stilstaande speler 15 seconden onder een bewegend platform staan: geen zijwaartse verplaatsing en geen levensverlies.

Registrytest laadt 100 geldige levels plus één ongeldig bestand, controleert foutisolatie en verwijdert vervolgens één testlevel en de foutieve file. Dit gebruikt fetch-testdoubles; er blijven geen testkaarten in productie achter.

`npm run validate:levels`: beide echte JSON-bestanden geldig. `npm run build`: TypeScript-controle en Vite-productiebundel.

## Daadwerkelijk in de browser

Getest in de Chromium-gebaseerde ingebouwde browser, met echte muisklikken en toetsen:

- Start, levelmenu, filter inclusief lege zoekuitkomst, verhaalkaarten, instellingen en Over-pagina.
- Starten van tutorial en voorbeeldlevel; herladen en wisselen tussen menu/game zonder oude canvas of resterende gameplay.
- Lopen, sprong, luchtbesturing, horizontale camera, munten en HUD.
- Vijandstomp met +200, contactschade en knipperende bescherming.
- Kist oppakken, dragen en neerzetten; sleutel ophalen en deur met ↑ openen.
- Power-ups, checkpoint, verloren leven en herstart met behouden score.
- Bewegende brug na botsingsreparatie; secret-gebied en bonus.
- Tutorial volledig uitgespeeld: 5.098 punten, 13/23 munten, 1 vijand, 1 geheim, 2 hartjes, 3 levens, 1:03 speeltijd (inclusief wachttijd tussen testacties).
- Finishdialoog toont uitsplitsing en nieuw record. Na browserherladen toont Mijn records hetzelfde resultaat en ontdekt geheim.
- Muziek en effecten afzonderlijk uitgezet via de instellingen.
- Laatste gecontroleerde browserconsole zonder errors.

## Gevonden en hersteld

Een horizontaal bewegend platform kon een stilstaande speler onder de rand zijwaarts verplaatsen door volledige rechthoekbotsing. Bewegende en verdwijnende platforms zijn nu eenzijdig: landen van boven, van onderen passeren. De grond en vaste platforms blijven massief. Aanvullende regressietest en browseroversteek geslaagd.

Verder: scrollpositie gereset bij schermwissel, correct wereldlabel in tutorialintro, lettertypen lokaal meegebundeld.

## Verificatiegrenzen

Het voorbeeldlevel is in de browser gedeeltelijk gespeeld; de complete finishroute is via de echte simulatie met toetsbesturing getest. Niet getest in afzonderlijke Firefox- en Safari-installaties. Audio-aansturing is uitgevoerd, maar muzikale kwaliteit is niet door luisteren beoordeeld. Er is geen toegankelijkheidscertificering en geen mobiele aanraakbesturing; de opdracht richt zich op laptops/desktops met toetsenbord.
