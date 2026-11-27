# Super Scratch V2.1 — oplevering

## Gebouwd

Eigen levelgebonden PNG/JPEG/WebP-beelden en spritesheets voor speler, alle vijanden en alle 33 bouwstenen. Animaties, schaal, spiegeling, tint, transparantie en aparte rechthoekige hitboxes. Herhaalbare tegels, parallaxlagen, voorgrond en kleurlicht. Vrije decorbeelden met eenvoudige beweging. Eigen makeravatars, kaart-/verhaal-/resultaatbeelden en een overslaande korte beeldintro. MP3/OGG/WAV-ondersteuning met aparte muziek-/effectvolumes, pauze/hervatten en standaardgeluid als terugval.

Twee originele demolevels: Midnight City (robot/stad) en Deep Sea Treasure (duiker/parels/vissen). De levelindeling gebruikt bestaande spelmechanieken. Alle kunst en melodieën hebben reproduceerbare bronnen in de demo-generatoren. Er zijn geen externe personages, samples of Nintendo-assets gebruikt.

De oude tutorial, het voorbeeldlevel, besturing, physicsconstanten en puntwaarden zijn behouden. De oude achtergrond blijft ook in lange levels doorlopen. Nieuw uiterlijk vereist geen wijziging in de centrale spelcode: een nieuw JSON-bestand, eigen assetmap en registerverwijzing volstaan voor bestaande mechanieken.

## Controles en beperkingen

39 automatische tests, vier gevalideerde levels/assetpakketten, productiebuild, volledige browserruns van beide demo's, browsercontrole van beide oude levels, echte audiodecode, ontbrekende/beschadigde bestanden en lokale 60-FPS-meting. Details en grenzen staan in [TESTING.md](TESTING.md). Geen claim dat iedere schoollaptop is getest. Geen zwemmechaniek, verticale camera of uploadeditor. Nieuwe mechanieken vragen nog steeds vertrouwde code en regressietests.

## Gewijzigde en nieuwe bestanden

| Groep | Bestanden |
|---|---|
| Nieuw assetsysteem | `src/assets/schema.ts`, `catalog.ts`, `layout.ts`, `renderer.ts`, `repeat.ts`, `intro.ts` |
| Enginekoppeling | `src/scenes/GameScene.ts`, `src/entities/art.ts`, `src/levels/schema.ts`, `src/levels/registry.ts` |
| Audio en menu | `src/audio/audio.ts`, `src/main.ts`, `src/style.css` |
| Demo's | `public/levels/midnight-city.json`, `deep-sea-treasure.json`, aangevuld `index.json` |
| Originele assets | `public/assets/midnight-city/` en `public/assets/deep-sea-treasure/`, inclusief `CREDITS.txt` |
| Herkomst/generatoren | `scripts/generate-demo-assets.mjs`, `scripts/generate-demo-levels.mjs` |
| Validatie/testhulp | `scripts/asset-validation.ts`, `scripts/validate-levels.ts`, `scripts/qa-fixtures.mjs`, `tests/browser-check.html`, `tests/browser-check.ts` |
| Tests | `tests/gameplay.test.ts`, `tests/assets.test.ts`, `tests/audio.test.ts`, `tests/renderer.test.ts`; bestaande core-/registrytests behouden |
| Handleidingen | `STUDENT_LEVEL_GUIDE.md`, `README.md`, `docs/ASSETS.md`, `LEVEL_SCHEMA.md`, `BUILDING_BLOCKS.md`, `ADD_LEVEL.md`, `STUDENT_PROMPT_TEMPLATE.md`, `TESTING.md`, dit document |
| Versie/build | `package.json`, `package-lock.json`, `public/version.json`, `.gitignore` |

## Herstellen en publiceren

Herstelpunt vóór de enginewijzigingen: tag `pre-v2.1-20261127`, commit `a0824bc`. Ontwikkeling op `feature/visual-v2-1`, daarna publicatie via GitHub main en de bestaande Vercel-koppeling. Bij terugdraaien: maak een herstelcommit vanaf de tag en publiceer die via dezelfde werkwijze; gebruik geen ongecontroleerde force-push.

De demo's zijn optioneel: verwijder hun twee regels uit het register om ze uit het menu te halen. Echte duo's krijgen elk een eigen ID, JSON-bestand en assetmap. Zie de bijgewerkte [studentencatalogus](../STUDENT_LEVEL_GUIDE.md) en [assetgids](ASSETS.md).
