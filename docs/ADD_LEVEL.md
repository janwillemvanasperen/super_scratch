# Een studentenlevel veilig toevoegen

1. Bewaar de oorspronkelijke prompt en schetsen. Leg vast: twee makers, naam, verhaal, personage, thema, moeilijkheid, doel, vijand, munten en geheim.
2. Maak een Git-branch. Kies een ongebruikt level-ID, bijvoorbeeld `duo-03-maanmarkt`. Wijzig geen bestaande levels of assets.
3. Gebruik `LEVEL_SCHEMA.md` en `BUILDING_BLOCKS.md`. Kopieer het volledige schema-voorbeeld naar `public/levels/<id>.json`. Pas de inhoud aan; geef ieder object een uniek ID.
4. Teken een route van start naar finish. Gebruik wereldhoogte 540. Plaats grond op y=480. Bereikbare verhogingen maximaal circa 90 px per sprong; afgronden met marge maximaal 160–180 px. Bied bij moeilijkere routes een veilige basisroute.
5. Houd sleutel, checkpoint en finish bereikbaar. Zet een sleutel vóór zijn deur. Voorkom respawn in muren/gevaren. Maak geheime kamers te verlaten. Kisten mogen geen softlock veroorzaken.
6. Geef het level een eigen palet, personagekleur, twee avatar-kleuren, melodie en verhaal. Voor andere sprites: originele bestanden onder `public/assets/<level-id>/`; nooit bestaande assets overschrijven. Koppel de bestanden via de assetvelden uit ASSETS.md. De procedurele pixelart blijft terugval; externe sprite-URL's zijn niet toegestaan.
7. Voeg maximaal één nieuwe geïsoleerde mechaniek toe als de bestaande bouwstenen tekortschieten. Test die apart en in combinatie met de basisgame. Vertrouwde codewijzigingen vereisen een build; losse JSON-data niet.
8. Voeg de bestandsnaam toe aan `public/levels/index.json`. Draai `npm run validate:levels`, `npm test` en `npm run build`.
9. Speel het nieuwe level van begin tot finish zonder ontwikkelaarstrucs. Controleer iedere vereiste sprong, geheim, verloren leven, checkpoint, deur, pauze en herstart. Speel beide bestaande levels opnieuw bij enginewijzigingen.
10. Test verwijderen: haal alleen de testlevelverwijzing tijdelijk uit het register, herlaad en controleer de bestaande levels. Herstel daarna de bedoelde registerinhoud. Verwijderde levels tonen geen kaart; hun oude browserrecord mag blijven staan.
11. Commit bronbestanden. Publiceer dist. Voor een data-only toevoeging mag je het JSON-bestand en register direct op de statische host actualiseren; leg dezelfde bestanden in Git vast. Upload eerst de leveldata, daarna het register zodat spelers geen ontbrekende file treffen.

Een ongeldige file wordt overgeslagen met een waarschuwing, niet uitgevoerd. Duplicaat-ID's worden geweigerd. De registryloader ondersteunt een willekeurig aantal bestanden, met gelijktijdige fetches en menuzoekfunctie. Geef de browser geen gigantische afbeeldingen en beperk objecten per level tot 4000. Een data-validatie bewijst nog geen speelbaarheid: handmatig finishen blijft verplicht.

Gebruik bij vervanging hetzelfde level-ID uitsluitend voor een update van hetzelfde level. Verhoog `version`. Records zijn aan het ID gekoppeld en blijven dus bestaan; bij een wezenlijk andere uitdaging verdient een nieuw ID de voorkeur.

## Eigen beelden en audio in V2.1

Volg [ASSETS.md](ASSETS.md). Voeg eigen bestanden toe onder `public/assets/<id>/` en koppel ze in het eigen JSON-bestand. Hiervoor is geen centrale enginewijziging nodig. Test zowel correcte bestanden als een ontbrekende verwijzing, animaties, contactgebieden en pauze/herstart met audio. Gebruik aparte muziek- en effectenregelaars. Houd de standaardkleuren en toonreeks als terugval. Bij Git/Vercel blijft een nieuwe publicatie nodig, ook voor een wijziging die alleen leveldata betreft.
