# Super Scratch

Originele 2D-platformgame voor Scratch, Marketing & Communicatie, MBO Utrecht. TypeScript + Phaser 3, volledig statisch; records staan uitsluitend in de browser. De naam Scratch verwijst hier naar de opleiding, niet naar het MIT-programmeerplatform. Geen Nintendo-assets.

## Direct lokaal spelen

Dubbelklik op `START_GAME.cmd` in het uitgepakte project. Deze start de meegeleverde build met Node.js; er is geen npm-installatie nodig. Laat het servervenster open. De URL is http://127.0.0.1:5175. Op een gepubliceerde website hebben spelers ook Node.js niet nodig.

## Starten

Ontwikkelaars hebben Node.js 22+ nodig. Spelers hebben alleen een moderne desktopbrowser nodig.

```sh
npm ci
npm run dev
```

Open de lokale URL die Vite afdrukt (standaard http://127.0.0.1:5173). Gebruik een webserver; dubbelklikken op index.html werkt niet vanwege modules en JSON-fetches.

```sh
npm test
npm run validate:levels
npm run build
npm run preview
```

`dist/` is de volledige publiceerbare game. De Phaser-bundel is relatief groot; de browser cachet deze na de eerste keer. Muziek gebruikt originele procedurele Web Audio of eigen bestanden per level. Pixelart is met code getekend. Lettertypen worden lokaal meegebundeld (Fontsource, OFL-licenties in de pakketten); de game doet geen externe fontrequests.

## Publiceren via een website

1. Voer `npm ci`, `npm test`, `npm run validate:levels` en `npm run build` uit.
2. Upload **de inhoud** van `dist/` naar een statische HTTPS-webhost, bijvoorbeeld de schoolwebserver, Netlify of Cloudflare Pages. Er is geen database, serverfunctie of account nodig.
3. Bij een Git-gekoppelde host: buildcommando `npm run build`, uitvoermap `dist`, Node 22 of nieuwer.
4. Voor hosting in een submap: `npm run build -- --base=/super-scratch/`. Zet alle bestanden onder precies die submap.
5. Controleer de link op een tweede laptop; start alle vier levels, finish ze, vernieuw de pagina en controleer records.
6. Deel pas daarna de link met studenten. Een eventuele private Sites-publicatie vereist toegang; de `dist/`-map kan onafhankelijk op een openbare schoolwebsite worden geplaatst.

Geef `levels/index.json` en `levels/*.json` een korte cacheduur of `Cache-Control: no-cache`. Content-hashed JavaScript/CSS mag lang gecachet worden.

## Nieuwe levels zonder enginebuild

Voeg een gevalideerd JSON-bestand toe aan `dist/levels/` en de bestandsnaam aan `dist/levels/index.json`. Herlaad de pagina. Bewaar dezelfde wijziging ook in `public/levels/` en in Git, anders verdwijnt zij bij de volgende build. Het register bevat alleen bestaande, geteste levels. De zoekfunctie en moeilijkheidsfilter ondersteunen ook 100+ levels.

## Architectuur

- `src/core/`: vaste regels, score, asgescheiden botsingen en natuurkunde.
- `src/entities/`: spelerstatus en procedurele pixelassets.
- `src/scenes/GameScene.ts`: Phaser-scene, wereldopbouw, bouwstenen, camera en lifecycle.
- `src/main.ts`, `src/style.css`: Nederlandse HTML-menu's, HUD, introductie, instellingen en resultaten.
- `src/levels/`: Zod-schema en foutgeïsoleerde asynchrone registryloader.
- `public/levels/`: zelfstandige leveldefinities en register.
- `src/audio/`: originele melodiesequencer en geluidseffecten.
- `src/storage/`: robuuste lokale records.
- `src/mechanics/`: factories voor geïsoleerde levelmechanieken.
- `public/assets/`: eigen pixelbeelden en audio per level; de standaardvormen blijven door code getekend.
- `tests/`: automatische regressietests; `docs/`: uitbreidingshandleidingen.

De engine simuleert op 120 vaste stappen per seconde, met maximaal 100 ms inhaaltijd per frame. Canvas is 960×540, pixels blijven scherp. De camera volgt horizontaal. De meegeleverde worlds gebruiken één schermhoogte. Verticale multi-screen werelden zijn geen ondersteund ontwerp in versie 1.

## Inhoud

De Proeftuin leert alle basisacties. Scratch – The First Adventure demonstreert de bouwstenen in een avonturenwereld van circa 40–60 seconden bij een vlotte route; ontdekken duurt langer. De makerslabels zijn eerlijk als basisgame aangeduid. Vervang ze bij echte studentenlevels door twee echte namen en avatar-kleuren.

Zie [spelregels](docs/GAME_RULES.md), [schema](docs/LEVEL_SCHEMA.md), [bouwstenen](docs/BUILDING_BLOCKS.md), [levels toevoegen](docs/ADD_LEVEL.md), [studentenformat](docs/STUDENT_PROMPT_TEMPLATE.md) en [testlog](docs/TESTING.md).

Huisstijl is voorlopig: de tekstvermelding Scratch / MBO Utrecht is geen officieel logo. Kleuren en typografie zijn centraal vervangbaar in `src/style.css`.

## V2.1: eigen visuele werelden

Eigen sprites, animaties, hitboxes, textures, parallax, decor, avatars, kaartbeelden, korte intros en muziek/effectbestanden zijn per level instelbaar. Zie [de assetgids](docs/ASSETS.md) en [de studentencatalogus](STUDENT_LEVEL_GUIDE.md). De oorspronkelijke tutorial en het voorbeeldlevel blijven ongewijzigd. Twee verwijderbare demo's, Midnight City en Deep Sea Treasure, tonen originele pixelart en audio.

`src/assets/` koppelt data aan beelden; `public/assets/<level-id>/` houdt bestanden per level apart. Offline levelvalidatie controleert ook de assets. Ontbrekende bestanden krijgen tijdens het spelen een terugval. De generatoren in `scripts/generate-demo-*.mjs` bevatten de originele tekeningen, melodieën en levelindeling. Nieuwe studentenlevels gebruiken eigen bestanden; voer deze demo-generatoren daarvoor niet uit.

## V2.2 — herbruikbare spelbouwstenen

Schakelaars, drukplaten, ladders, liften, water, speciale vloeren, omgevingszones, teleporters, routeplatforms, instortende platforms, werpbare kisten, schatkisten en korte NPC-gesprekken zijn per level instelbaar. De vier bestaande levelbestanden blijven ongewijzigd. Zie [studentencatalogus](STUDENT_LEVEL_GUIDE.md), [technische instellingen](docs/BUILDING_SYSTEMS.md) en [releaseverslag](docs/RELEASE_V2_2.md).

Het interne lab staat buiten het publieke register: start Vite en open `/tests/building-lab.html`. Kies een station en klik Start station. De pagina en fixture komen niet in de productiebuild.

## V2.3

[De technische handleiding voor vijanden en doelen](docs/ENEMIES_AND_GOALS.md) beschrijft de mogelijkheden van De Kristalwerkplaats.
