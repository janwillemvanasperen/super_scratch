# V2.4 – Camera, controles en bouwersmodus

## Camera

Zonder camera-instelling blijft de oorspronkelijke horizontale besturing gelden. Gebruik bijvoorbeeld:

    "world": { "width": 3000, "height": 2200 },
    "camera": { "axis": "both", "smoothing": 6 }

Kies horizontal, vertical of both. Het spelbeeld blijft 960 × 540. De wereld mag 960–50.000 pixels breed en 540–12.000 pixels hoog zijn. Een losse ladder of ander object blijft maximaal 800 pixels hoog. Laat lange ladders overlappen en geef tussenverdiepingen een veilige uitstap.

Optionele bounds hebben left, top, right en bottom in wereldcoördinaten. Ze omvatten minimaal één scherm. Plaats de route, doelen en veilige terugkeerpunten binnen die grenzen. Zones hebben x, y, w, h en viewX/viewY. De eerste overlappende zone vraagt een vaste kijkpositie. Dicht bij de schermrand mag de camera mee bewegen om de speler te blijven tonen. De grenzen hebben voorrang, dus buiten de gekozen cameragrenzen kan de speler uit beeld raken. Een sprong boven de wereldrand kan ook kort uit beeld komen.

Achtergrondlagen kunnen parallaxY tussen -2 en 2 krijgen. Standaard 0 behoudt hun bestaande verticale gedrag. Gebruik repeatY als een afbeelding voor verticale herhaling is getekend. De V2.1-verlichting blijft aan het scherm gekoppeld.

## Eigen mechaniek

Registreer vertrouwde TypeScript-code in src/mechanics/registry.ts en voeg de naam toe aan het levelcontract. Per poging maakt GameScene één instantie. Een factory ontvangt toegang tot de actuele speler, korte spelmeldingen en cleanup voor eigen timers, listeners en tijdelijke objecten. Gebruik update voor spelstappen en event voor init, input, collision, damage, collect, checkpoint, life, pause, resume, restart en exit. Collision meldt actieve grond-, muur- of plafondcontacten, mogelijk meerdere keren. Collect meldt opgepakte objecten die een claim krijgen. V2.2-beloningen via acties lopen via hun eigen beloningssysteem.

Een synchrone uitzondering schakelt de betreffende instantie uit en voert geregistreerde opruimacties uit. De fout verschijnt in de ontwikkelconsole en bouwersmodus. Code draait in hetzelfde proces en heeft vertrouwde toegang. Dit is foutopvang, geen beveiligde sandbox. Vang eigen asynchrone fouten af. Ontwerp een terugweg als een extra mechaniek uitvalt.

## Botsingen en terugkeer

Snelle lichaamsbeweging wordt in kleinere stappen verdeeld. Projectielen controleren het traject op het eerste contact met een muur of de speler. Hoge snelheid is daarmee beter afgevangen, maar extreme hitboxes, oude bewegende platforms, hoekcontacten en bewegende objecten tegelijk kunnen nog randgevallen geven. Liften stoppen bij blokkades en eenrichtingsplatforms gelden voor de speler. Water regelt geen opwaartse kracht voor kisten. Vijanden zoeken geen pad om obstakels heen. De V2.1-hitbox bepaalt contact, het beeld blijft apart instelbaar.

Een checkpoint gebruikt een eigen ID en mag optioneel respawn met x/y voor de linkerbovenhoek van de hitbox hebben. Bij levensverlies zoekt het spel eerst rond het checkpoint, dan rond de start. De zoekafstand is maximaal 160 pixels per anker. De controle kijkt naar actuele vaste obstakels en actieve gevaren. Er volgt korte onkwetsbaarheid. De zoektocht bewijst geen stevige grond of bereikbare route. Bij een volledig geblokkeerde kaart valt het systeem terug op de start en geeft het een consolemelding.

Munten, punten, voltooiing van opdrachten en reeds uitgekeerde beloningen blijven behouden. Tijdelijke power-ups en projectielen worden opgeruimd. Nieuwe, neergezette draagkisten blijven liggen, tenzij resetOnDeath is ingeschakeld. Een gedragen kist keert terug naar haar beginpunt. Oude kisten houden hun oorspronkelijke herstelgedrag. Voor terugzetbare schakelaars, deuren en platforms gelden de bestaande V2.2-instellingen. Zet gekoppelde objecten consequent terug en speel de route na verlies van een leven. Een ingeleverde sleutel kan niet worden teruggevraagd. Een verstreken harde tijdslimiet vraagt een nieuwe poging. De engine kan geen willekeurige sleutelpuzzel automatisch herstellen.

## Validatie en testen

Een fout in bestand, schema, verwijzing of startpositie houdt het betreffende level tegen. De productiebuild controleert ook lokale bestanden. Waarschuwingen melden onder meer objecten buiten beeldgrenzen, mogelijk geblokkeerde liftbanen, onveilige checkpoints en grote gaten tussen grondstukken. Een waarschuwing kan bewust zijn als een lift, teleport of tussenplatform het gat oplost. Verplichte voorwerpen, puzzelvolgorde, tijdslimieten, vijandtiming en terugwegen blijven onderwerpen voor speeltests. De controle van liftbanen neemt steekproeven langs de baan.

Start npm run dev en open /tests/builder.html. Kies een levelbestand, eventueel in een eigen submap. Je kunt vrij vliegen met de pijlen, tijdelijke onkwetsbaarheid inschakelen, X/Y invullen, bij een checkpoint beginnen en hitboxes, zones en bewegingsroutes tonen. Start opnieuw om de doelen te resetten. De tester toont fouten en waarschuwingen. De productiebuild bevat deze pagina niet en de tester bewaart geen records.

## Namen, registreren en herstellen

Gebruik per duo bijvoorbeeld public/levels/duo-01/level.json en public/assets/duo-01/. Voeg aan het register een tekenreeks toe of gebruik een object zoals {"file":"duo-01/level.json","enabled":true}. Met false verdwijnt het level uit het menu zonder het bestand of zijn records te verwijderen. Controleer een uitgeschakeld level los in de bouwersmodus. Verwijder de registratie om het level te verwijderen. Zet bij herstel het afzonderlijke bestand, de eigen assets en de gewenste registervermelding terug uit Git.

Records staan lokaal in de browser en gebruiken level-ID. Behoud dat ID bij kleine wijzigingen. Geef een sterk gewijzigde route of puntentelling een nieuw ID als oude en nieuwe scores niet vergelijkbaar zijn. Alleen het versienummer wijzigen reset het record niet.

## Prestaties

De browser haalt de gegevens van ingeschakelde levels op voor het menu. Uitgeschakelde levels kosten geen JSON-request. Spelbeelden en muziek worden per run geladen en bij het verlaten opgeruimd. Custom sprites buiten het camerabeeld worden verwijderd en zo nodig opnieuw aangemaakt. Projectielen delen de lijst met vaste botsingsobjecten voor hun huidige simulatiestap. Er is geen aparte ruimtelijke index voor duizenden actieve bewegende objecten. Zie het testlog voor de metingen. Er is geen diep geheugenprofiel of test op een tweede schoollaptop uitgevoerd.
