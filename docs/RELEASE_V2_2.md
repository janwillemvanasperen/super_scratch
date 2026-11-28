# Super Scratch V2.2 — uitbreiding van de bouwstenen

Herstelpunt vóór wijzigingen: tag `pre-v2.2-20261127`, commit `45d4fdd`. Ontwikkelbranch: `feature/building-blocks-v2-2`.

## Gerealiseerd

- Twaalf nieuwe objecttypen, totaal 45. Herbruikbare triggers/acties, liften/routes, water/zuurstof, oppervlakken/zones, portalen, instorten, schatkisten en NPC's.
- Bestaande kisten krijgen optionele werpinstellingen. Oude doorgangen kunnen het nieuwe poortcontract gebruiken.
- Eigen V2.1-assets, animaties en contactgebieden blijven beschikbaar. Procedurele terugval voor nieuwe objecten en tekstballonnen.
- Validatie van waarden en koppelingen; botsingscontrole bij liften, deuren en poortbestemmingen; bescherming tegen teleportlussen en dubbele beloningen.
- Per poging eigen systeemtoestand, pauze, herstart, opruiming en instelbaar herstel na levensverlies.
- Studentencatalogus op 2F en technische bouwdocumentatie bijgewerkt. Intern testlab buiten productie.

## Behoud en controles

De vier bestaande levelbestanden, hun assets, vaste regels, spelerklasse en kernbotsingen zijn ongewijzigd. De 61 automatische tests slagen, inclusief volledige gesimuleerde speelroutes van alle vier levels, 22 tests van de nieuwe systemen en registertoevoeging/verwijdering. Levelvalidatie, TypeScript en Vite-productiebuild slagen. Zie [testlog](TESTING.md) voor daadwerkelijke browsercontroles en grenzen.

## Beperkingen

Geen verticale camera, keuzegesprekken, uitgebreide inventaris, zwemmende vijanden of drijvende kisten. Eenrichtingsplatforms gelden voor de speler; kisten gebruiken vaste botsingen. Water/ladderregeling heeft voorrang op zones. Botsingsbescherming bewijst geen oplosbare puzzel. Inschakelen van een bezet vast object wordt geweigerd; alleen deursluiting en platformterugkeer wachten automatisch. Geen nieuwe prestatiemeting op een tweede schoollaptop. De Phaser-bundel geeft de bestaande waarschuwing voor een grote chunk (circa 1,62 MB / 381 kB gzip).

## Publicatie

Publicatie volgt via de bestaande GitHub-repository en Vercel. Controleer na deployment `/version.json`: versie `2.2.0`, release `building-blocks`. Een succesvolle Git-push is op zichzelf geen bewijs van een succesvolle Vercel-deployment. Het interne lab wordt niet in dist opgenomen. De bestaande vier levels tonen de nieuwe bouwstenen niet vanzelf; nieuwe studentenlevels kunnen ze configureren.
