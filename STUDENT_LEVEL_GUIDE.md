# Super Scratch — ontwerp- en bouwcatalogus

**Voor de tien studentenduo’s van Scratch, MBO Utrecht**  
Gecontroleerd op 27 november 2026. Bijgewerkt voor **Super Scratch V2.2**. Zie [het testlog](docs/TESTING.md) voor de uitgevoerde controles.

## 1. Jullie opdracht

Ontwerp samen een eigen level voor Super Scratch. Jullie leveren een prompt in: een duidelijke beschrijving van wat de bouwer moet maken. Je mag tekeningen en afbeeldingen toevoegen. Je hoeft zelf geen code te schrijven.

Maak een avontuur dat bij een goede poging ongeveer **30 tot 60 seconden** duurt. Het moet een begin, een haalbare route en een duidelijke finish hebben. Geef jullie wereld een eigen verhaal. Denk bijvoorbeeld aan een festival, winkel, school, jungle of ruimtebasis. Een ander thema mag ook.

**Belangrijk:** een idee bedenken en dat idee al kunnen bouwen zijn twee verschillende dingen. Deze gids beschrijft de game die nu bestaat. Een getekend personage of een muziekbestand verschijnt niet vanzelf in de game.

### Zo lees je de status

| Status | Wat betekent dit? |
|---|---|
| **Werkt** | De functie zit in de huidige code. Je kunt haar gebruiken met de genoemde instellingen. Iedere nieuwe opstelling moet nog worden getest. |
| **Beperkt** | Een basis werkt, maar niet alle gewenste vormen of situaties worden ondersteund. Lees de beperking. |
| **Nog bouwen** | Hiervoor moet de bouwer nieuwe code of ondersteuning voor bestanden toevoegen. |

De namen tussen haakjes, zoals `ground`, zijn voor de bouwer. In jullie prompt mag je gewoon ‘grond’ schrijven.

## 2. Wat mogen jullie zelf kiezen?

| Onderdeel | Jullie keuze | Wat kan nu? |
|---|---|---|
| Naam en verhaal | Een eigen titel, verhaal en doel | **Werkt.** Het doel is een tekst; extra opdrachten worden niet vanzelf spelregels. |
| Thema | Iedere originele wereld | **Werkt.** Eigen pixelbeelden en achtergronden zijn mogelijk. Die beelden moeten wel worden gemaakt en gekoppeld. |
| Route | Plaats van grond, platforms, gevaren en finish | **Werkt**, binnen de grenzen van hoofdstuk 8. |
| Moeilijkheid | Easy, Medium of Hard | **Werkt.** Dit is een label. De bouwer maakt de route makkelijker of moeilijker. |
| Vijanden | Type, plaats, kleur, grootte en ondersteunde instellingen | **Werkt**, met beperkingen per type. |
| Beloningen | Munten, hartjes, bonusvoorwerpen en power-ups | **Werkt.** De puntwaarden staan vast. |
| Geheim | Een verborgen plek, bonus of doorgang | **Werkt**, binnen dezelfde wereld. |
| Personage | Naam, kleur en een ontwerpidee | **Werkt.** Eigen afbeeldingen, animaties en een apart contactgebied zijn instelbaar. |
| Makers | Twee namen en eigen avatarbeelden | **Werkt.** Lever twee eigen pixelportretten aan. Kleuren blijven een terugvaloptie. |
| Muziek | Sfeer, tempo en een korte melodie | **Werkt.** Een eenvoudige toonreeks of een eigen muziekbestand. |
| Extra spelmechaniek | Maximaal één nieuwe manier van spelen | **Nog bouwen** als het idee buiten de bestaande bouwstenen valt. De nieuwe bouwstenen hieronder mag je combineren. Zie hoofdstuk 10. |

Een schets is een ontwerpvoorstel. Een bruikbaar pixelbestand kan de bouwer nu rechtstreeks aan jullie level koppelen. Spreek formaat en animaties vooraf af.

## 3. Grond, platforms en omgeving

Een platform is een oppervlak waarop je kunt staan. ‘Massief’ betekent dat je er niet doorheen kunt lopen of springen.

| Bouwsteen | Wat gebeurt er? | Instelbaar en aandachtspunt | Status |
|---|---|---|---|
| Grond (`ground`) | Een massieve bodem | Plaats, breedte en hoogte. De kleuren komen uit het levelpalet. | **Werkt** |
| Vast platform (`platform`) | Je kunt erop landen. Ook de onderkant en zijkanten houden je tegen. | Plaats, grootte en kleur van de bovenrand. Zwevend betekent hier niet dat het beweegt. | **Werkt** |
| Muur (`wall`) | Houdt de speler tegen | Plaats, grootte en kleur van de bovenrand. | **Werkt** |
| Horizontaal platform (`movingX`) | Beweegt links en rechts. Neemt een speler die erop staat mee. | Plaats, grootte, snelheid en bewegingsafstand. Van onderen kun je erdoorheen springen. | **Werkt**, botsingen in iedere nieuwe opstelling testen |
| Verticaal platform (`movingY`) | Beweegt omhoog en omlaag en neemt de speler mee | Dezelfde instellingen. Het is geen lift met knoppen of vaste haltes. | **Werkt**, botsingen in iedere nieuwe opstelling testen |
| Verdwijnend platform (`vanish`) | Is een deel van de tijd bruikbaar. Daarna zie je alleen een rand. | De totale cyclus duurt 0,5–30 seconden. Het platform is 72% van die tijd bruikbaar. Je kunt er van onderen doorheen springen. | **Werkt** |
| Breekbaar blok (`breakable`) | Breekt als je van onderen ertegen springt | Plaats, grootte en kleuraccent. Er komt niet automatisch een munt uit. Het blijft kapot na verlies van een leven. | **Werkt** |
| Springveer (`spring`) | Lanceert je omhoog als je het gebied raakt terwijl je daalt | Plaats en contactgebied. De lanceerkracht staat vast. | **Werkt**, plaatsing zorgvuldig testen |
| Afgrond | Je valt uit de wereld en verliest één leven | Laat een stuk grond weg. Een afgrond is geen apart object. | **Werkt** |
| Decoratie of bord (`decoration`) | Toont een eigen beeld of een standaardbord. Dichtbij verschijnt eventueel een korte tekst. | Plaats, kleuraccent en tekst van maximaal 180 tekens. De afstand wordt alleen links-rechts gemeten. | **Werkt:** eigen beelden, animatie, schaal, spiegeling, draaiing, transparantie en eenvoudige beweging. Standaard geen botsing. |
| Achtergrondlagen | Eigen lagen of de standaardwolken en heuvels bewegen op verschillende snelheden | Eigen herhaalbare beelden, voorgrond, snelheid en lichtkleur zijn instelbaar. | **Werkt**; zie hoofdstuk 7 |

**Ontwerptip:** geef een bewegend platform vrije ruimte. Zet geen plafond zo laag dat de speler ertussen vast komt te zitten. Bouw een veilige plek om te wachten bij een verdwijnend platform.

## 4. Gevaren

| Gevaar | Gedrag | Wat kun je kiezen? | Status |
|---|---|---|---|
| Stekels (`spikes`) | Aanraken kost een hartje | Plaats, afmetingen en kleur | **Werkt** |
| Gevaarlijke vloer (`lava`) | Aanraken kost een hartje; de bovenkant beweegt in beeld | Plaats, contactgebied en eigen beeld. | **Werkt:** bijvoorbeeld lava, giftig water of stroom; de schade blijft gelijk |
| Bewegende val (`trap`) | Een stekelval beweegt links en rechts | Plaats, grootte, kleur, snelheid en afstand | **Werkt.** Geen verticale of zelfgetekende route. |
| Vallend blok (`falling`) | Valt wanneer je horizontaal binnen 100 pixels komt. Verschijnt bovenaan terug nadat het onder de wereld is verdwenen. | Plaats, grootte en kleuraccent | **Beperkt:** het blok landt niet op de grond en wordt geen platform; het valt door de omgeving heen. |
| Projectiel | Een schietende vijand vuurt een klein blokje af. Raken kost een hartje. | Via de instellingen van de schutter | **Werkt**, maar geen los plaatsbaar projectieltype in het levelbestand |

Gevaren gebruiken een rechthoekig contactgebied. Bij stekels is dat het hele vak, niet alleen het zichtbare driehoekje. Lava is zelf geen stevige vloer. Leg er grond onder als je een gevaarlijke vloer wilt maken in plaats van een valkuil.

## 5. De zes soorten vijanden

Alle vijanden doen bij contact één hartje schade. De basisvorm is een klein pixelmonster. Je kunt nu eigen dieren, robots of andere figuren gebruiken, met animaties en een apart contactgebied. Het gekozen vijandtype bepaalt nog steeds het gedrag.

| Vijand | Gedrag in de huidige game | Instellingen en grenzen |
|---|---|---|
| Wandelaar (`walker`) | Loopt links en rechts rond zijn startplek en valt door zwaartekracht | Snelheid en bereik. Hij kijkt niet of er een afgrond aankomt. **Werkt.** |
| Achtervolger (`chaser`) | Loopt normaal heen en weer. Volgt de speler zodra die horizontaal binnen 280 pixels komt. | Snelheid en bereik rond de startplek. Hij zoekt geen slimme route om muren heen. **Werkt.** |
| Springer (`jumper`) | Beweegt over de grond en springt opnieuw wanneer hij geland is en zijn timer voorbij 1,5 seconde is | Loopsnelheid en bereik. Sprongkracht en wachttijd staan vast. **Beperkt:** de timer voor zijn looprichting wordt bij iedere sprong gereset. Reken niet op een gelijkmatige patrouille naar beide kanten. |
| Vlieger (`flyer`) | Zweeft links en rechts en golft tegelijk op en neer | Horizontale snelheid en afstand. De verticale beweging is vast: 24 pixels omhoog en omlaag. Hij botst niet met platforms of muren. **Werkt als eenvoudige vlieger.** |
| Schutter (`shooter`) | Staat stil. Schiet naar links of rechts als de speler horizontaal binnen 650 pixels komt. | Tijd tussen schoten en projectielsnelheid. Hij richt niet omhoog of omlaag en controleert niet of er een muur tussen zit. **Werkt.** |
| Vaste wachter (`sentry`) | Staat op zijn plek. Is ook van boven gevaarlijk. | Plaats, grootte en kleur. Hij loopt, springt en schiet niet. **Werkt.** |

Je kunt de eerste vijf typen verslaan door er tijdens het dalen bovenop te landen. Daarna veer je omhoog. Een vaste wachter versla je alleen met de power-up voor onkwetsbaarheid. Met die power-up kun je ook de andere vijanden door aanraking verslaan.

### Grenzen van vijandgedrag

- Een vijand heeft één type. Een vliegende schutter of een achtervolger die ook springt is **nog niet beschikbaar**.
- Vijanden hebben geen levensbalk of instelbaar aantal hartjes. Een geldige aanval schakelt ze in één keer uit.
- Grondvijanden die onder de wereld vallen, worden op hun beginplek teruggezet. Dat levert geen punten op.
- Schutters en vaste wachters hebben geen zwaartekracht. De bouwer moet ze dus goed plaatsen.
- Een projectiel is 10 bij 10 pixels, beweegt horizontaal en blijft maximaal vier seconden bestaan. Het verdwijnt bij een treffer of botsing met een massief object.
- Bij een schutter bepaalt `speed` de projectielsnelheid: de game telt er 130 pixels per seconde bij op. Bij een vlieger op snelheid nul blijft de verticale beweging doorgaan.

## 6. Verzamelobjecten, power-ups en interactie

### Verzamelobjecten

| Voorwerp | Wat doet het? | Status |
|---|---|---|
| Munt (`coin`) | Eén munt en 100 punten | **Werkt** |
| Hartje (`heart`) | Herstelt één hartje. Blijft liggen als je al drie hartjes hebt. | **Werkt** |
| Sleutel (`key`) | Voegt een sleutelcode toe aan je sleutelbos. Kan bij een of meer deuren horen. | **Werkt** |
| Bonusvoorwerp (`bonus`) | Geeft 500 punten. Verhoogt het aantal munten niet. | **Werkt** |

Voor deze voorwerpen zijn geen vrij instelbare puntwaarden. Munten, hartjes en sleutels mogen eigen beelden krijgen. Een deur verbruikt geen sleutel. Een NPC kan een sleutel wel innemen als dit is ingesteld. De HUD toont alleen een sleutelteken, geen lijst met alle gevonden sleutels.

### De vier power-ups

Alle vier **werken**. De duur is per voorwerp instelbaar van 1 tot 60 seconden; standaard is dat 10 seconden.

| Power-up | Effect | Let op |
|---|---|---|
| Sterrenkracht (`invincible`) | Beschermt tegen contactschade en projectielen. Vijanden verdwijnen bij aanraking. | Een bodemloze afgrond kost nog steeds een leven. |
| Hoge sprong (`jump`) | Maakt de afzet 1,27 keer zo sterk. De maximale hoogte wordt ongeveer 168 pixels. | Dit geeft geen dubbele sprong. |
| Turbo (`speed`) | Maakt de topsnelheid 1,45 keer zo hoog: ongeveer 355 pixels per seconde. | De zwaartekracht en gewone sprongkracht blijven gelijk. |
| Schild (`shield`) | Vangt één treffer op. Daarna is het schild weg. | Het vervalt ook als de tijd om is. Beschermt niet tegen een afgrond. |

Verschillende power-ups kunnen tegelijk actief zijn. Een tweede power-up van hetzelfde type zet de tijd opnieuw op de duur van het nieuwe voorwerp. De tijden worden niet bij elkaar opgeteld. Bij verlies van een leven vervallen alle actieve power-ups. Opgepakte power-ups verschijnen dan niet opnieuw.

### Interactieve objecten

| Object | Hoe gebruik je het? | Status en grens |
|---|---|---|
| Sleuteldeur (`door`) | Verzamel de passende sleutel en druk naast de deur op ↑. | **Werkt.** De deur blijft open. Alle deuren van dit type vereisen een sleutel. De kleur verandert direct; er is geen uitgebreide openanimatie. |
| Geheime doorgang (`passage`) | Ga in de opening staan en druk op ↑. Je verschijnt op een opgegeven plek. | **Werkt.** Alleen verplaatsen binnen hetzelfde level. Een doorgang zonder sleutel kan hiermee worden gemaakt. |
| Checkpoint (`checkpoint`) | Raak het vlaggetje aan. Hier begin je na verlies van een leven. | **Werkt met beperking.** Geef ieder checkpoint een andere horizontale positie. De code vergelijkt alleen die positie. |
| Kist (`crate`) | Druk dichtbij op ↓ om hem boven je hoofd te dragen. Druk opnieuw op ↓ om hem neer te zetten. | **Werkt.** Eén kist tegelijk. Met de nieuwe draaginstellingen kun je gooien met ↓ + Spatie, een drukplaat activeren en vijf soorten vijanden raken. De stekelwachter is beschermd. Houd kisten klein, ongeveer 28 × 28 pixels. |
| Geheim gebied (`secret`) | Loop of spring erin. Je krijgt een bericht, lichteffect en 500 punten. | **Werkt.** Eén beloning per geheim per poging. Het vak is vooraf al heel vaag zichtbaar. |
| Finish (`finish`) | Raak het finishgebied aan. | **Werkt.** Geeft de uitslag en slaat het resultaat op. Standaard is het beeld een gele vlag; een eigen finishbeeld mag ook. |

Bij verlies van een leven worden kisten en vallende blokken teruggezet. Deuren blijven open, gebroken blokken blijven kapot en eerder verzamelde beloningen blijven weg.

**Plaatsingstips:** zet een checkpoint boven veilige, vaste grond. Zet een sleutel vóór de deur die hij opent. Geef iedere geheime kamer een uitgang. Plaats de bestemming van een doorgang niet in een muur, gevaar of andere doorgang.

## 6A. Nieuwe bouwstenen in V2.2

Deze onderdelen **werken in de code** en zijn getest in een intern testlevel. Ze staan nog niet in de vier bestaande speelwerelden. Een nieuw studentenlevel kan ze gebruiken zonder nieuwe spelcode. De bouwer stelt het gedrag in. Het testlog vermeldt welke controles zijn uitgevoerd; een Git-versie is pas live als de website die versie ook laadt.

| Bouwsteen | Wat kun je ontwerpen? | Let hierop |
|---|---|---|
| Schakelaar (`switch`) | Druk op ↑ om bijvoorbeeld een deur, val, brug of lift aan te sturen. | Kies: aan/uit, zolang je ↑ vasthoudt, een vaste tijd of blijvend aan. |
| Drukplaat (`pressurePlate`) | Een speler, kist of beide activeren de plaat. | Je kunt een minimumgewicht kiezen. De speler telt als 1. Een gedragen kist telt niet mee. Zet de plaat op een bereikbare plek. |
| Ladder (`ladder`) | Klim met ↑ en ↓. Spring weg met Spatie. | Kies plaats, hoogte, beeld en klimsnelheid. De camera gaat niet omhoog. |
| Lift (`elevator`) | Een lift met meerdere haltes, snelheid en wachttijd. | Automatisch, met ↑, alleen met een speler erop of via een schakelaar. Een handbediende lift rijdt na iedere druk één halte verder. |
| Routeplatform (`pathPlatform`) | Een platform volgt rechte lijnen langs jouw punten. | Heen en terug of een rondje. Ook aan te zetten met een schakelaar. Laat de hele route vrij. |
| Instortend platform (`collapsePlatform`) | Na erop landen valt het platform weg. | Kies de vertraging en de terugkeertijd. Je kunt terugkeer ook uitzetten. Het verschijnt pas terug als de plek vrij is. |
| Water (`water`) | Zwem met de pijltjes. Spatie geeft een zwemslag. Bij het oppervlak kun je eruit springen. | Kies snelheid, zwaartekracht en stroming. Zuurstof is optioneel: 2–120 seconden. Zonder zuurstofinstelling mag je onbeperkt onder water blijven. |
| Speciale vloer (`surface`) | IJs, modder, transportband, verende vloer, eigen wrijving of eenrichtingsplatform. | Kies effect en kracht. Eenrichtingsplatforms laten de speler van onderaf door. Kisten botsen er van beide kanten tegen. |
| Omgevingszone (`zone`) | Wind, lage of hoge zwaartekracht, zijwaartse of verticale beweging, tijdelijke snelheid. | Kies het gebied en het effect. Buiten de zone stopt het effect. Je mag ook een nawerking van maximaal 30 seconden kiezen. Resterende snelheid remt daarna normaal af. |
| Teleporter (`teleporter`) | Ga automatisch of met ↑ naar een andere plek in hetzelfde level. | Eén richting of twee gekoppelde poorten. Een sleutel of actieve schakelaar kan nodig zijn. Er is bescherming tegen eindeloos heen en weer springen. |
| Uitgebreide kist (`crate`) | Oppakken, dragen, neerzetten en gooien. | ↓ pakt op of zet neer. Houd ↓ vast en druk Spatie om te gooien. Een muur kan een worp blokkeren. Je kunt één kist dragen. |
| Schatkist (`chest`) | Open met ↑. Geef munten, een sleutel, hartjes, bonus, geheim of power-up. | De inhoud krijg je één keer per poging. Een sleutel of actieve schakelaar kan nodig zijn. |
| Personage voor een gesprek (`npc`) | Een eigen figuur met tekstballon, aanwijzing, beloning of actie. | Maximaal zes zinnen van 140 tekens. Druk voor iedere zin opnieuw ↑. Een NPC kan een sleutel of gedragen kist aannemen. Er is geen keuzevenster of uitgebreide inventaris. |

### Zo beschrijf je een koppeling

Geef ieder object een herkenbare naam. Bijvoorbeeld: **plaat-magazijn** en **deur-magazijn**. Beschrijf wat er bij aanzetten én bij uitzetten gebeurt:

> De drukplaat reageert alleen op een kist. Zolang de kist erop staat, blijft deur-magazijn open. Als je de kist weghaalt, gaat de deur dicht. De speler mag nooit in de deur vast komen te zitten.

Een deur wacht met sluiten zolang er iemand of een kist in staat. Een lift stopt bij een blokkade. Een brug die iemand zou insluiten, wordt niet ingeschakeld: zorg dat de schakelaar opnieuw te gebruiken is. Deze bescherming maakt niet iedere puzzel oplosbaar. Geef altijd een terugweg.

### Combinaties en grenzen

- Een kist op een drukplaat kan een deur openen. Een schakelaar kan een lift starten, een val uitzetten of een brug tonen.
- Een routeplatform mag door een windzone gaan. De wind beïnvloedt de speler, niet het platform.
- Een geheime poort kan naar een beloning leiden. Teken ook de terugweg. Een geheime poort en een apart geheimgebied tellen als twee geheimen.
- Een NPC kan een sleutel geven. Een tweede NPC kan die innemen en een route openen. Zorg dat de ingenomen sleutel niet later opnieuw verplicht is.
- Speciale vloeren mogen ook op grond, gewone platforms, oude bewegende platforms, liften, routeplatforms en instortende platforms.
- In water gelden de zweminstellingen. Wind en snelheidszones nemen daar de zwemregeling niet over. Bij overlappende waterzones geldt de eerste in het levelbestand. Combineer water en ladders liever niet; de ladder krijgt voorrang op de beweging.
- Nieuwe bouwstenen kunnen dezelfde eigen beelden en animaties gebruiken als andere objecten. Geef ook aan hoe een open deur, actieve plaat of pratende NPC eruitziet. Zonder eigen beeld gebruikt de game een eenvoudige standaardtekening.
- Bij levensverlies blijft de wereld normaal in dezelfde stand. De bouwer kan per object terugzetten aanzetten. Zuurstof, gesprekken en tijdelijke zone-effecten worden opgeruimd. Ontvangen beloningen worden niet opnieuw gegeven. Bij een volledige herstart begint alles opnieuw.

### Extra gegevens bij jullie ontwerp

Lever voor ieder nieuw object de naam, plaats, grootte, bediening en het gewenste gedrag aan. Teken bij routes alle haltes en de wachttijd. Geef bij water aan of er stroming en zuurstof is. Schrijf bij een schakelaar welke objecten veranderen en hoelang. Schrijf bij een poort de bestemming en terugweg. Geef bij een schatkist de inhoud; bij een NPC alle zinnen en wat het personage geeft of ontvangt. Lever bij eigen beelden ook de verschillende standen aan, zoals open/dicht of rustig/praten.

## 7. Een eigen uiterlijk en eigen muziek

### Personages en vijanden — werkt

Je mag een eigen robot, hond, duiker of ander figuur ontwerpen. Gebruik originele pixelart. Lever een transparante PNG aan, of een spritesheet met gelijke beeldvakjes. De bouwer koppelt beelden aan stilstaan, lopen, springen, vallen, schade en overwinning. Vijanden kunnen ook vlieg-, aanval- en verslaanbeelden krijgen. Snelheid van de animatie en spiegeling zijn instelbaar.

Een **contactgebied** is de onzichtbare rechthoek waarmee het spel botsingen berekent. De standaardspeler gebruikt 22 × 30 pixels. Een grotere tekening maakt de sprong niet hoger. Laat het contactgebied bij de tekening passen en houd ruimte voor doorgangen. Eigen beelden veranderen geen vijandgedrag of puntwaarden. Ontbreekt een animatie, dan gebruikt het spel een standaardbeeld; ontbreekt het hele bestand, dan verschijnt de basisvorm.

### Wereld, decoratie en kaarten — werkt

Alle bouwstenen kunnen een eigen beeld krijgen: ook munten, sleutels, power-ups, vallen en deuren. Een munt mag bijvoorbeeld een parel of energiecel lijken en blijft 100 punten waard. Gebruik herhaalbare tegels voor een lange vloer of muur. Zo wordt één klein plaatje niet over het hele level uitgerekt.

Eigen achtergrondlagen mogen langzamer of sneller schuiven dan de wereld. Dat geeft diepte. Ze kunnen herhalen, bewegen en animaties hebben. Voorgrondlagen staan vóór de speler. Een lichtkleur over het beeld kan een nachtelijke of onderwatersfeer geven. Dit zijn geen echte lampen met schaduwen. Ook de standaardheuvels blijven nu doorlopen in lange levels.

Decoratie kan een boom, kast, voertuig of koraal zijn. Plaats, grootte, draaiing, spiegeling, transparantie, animatie en een eenvoudige beweging zijn instelbaar. Decoratie heeft normaal geen botsing. Zeg duidelijk waarop de speler moet kunnen staan. Geef gevaren een herkenbaar uiterlijk; maak een gevaar niet groter dan de speler verwacht.

Lever twee pixelavatars aan voor jullie makersnamen. Daarnaast mogen er drie eigen afbeeldingen komen: voor de levelkaart, de verhaalkaart en de uitslag. Een korte intro met een afbeelding of animatie mag ook; deze duurt maximaal acht seconden en kan worden overgeslagen. Een filmpje met keuzes is nog geen bestaande functie.

### Muziek en geluid — werkt

Je kunt kiezen voor de bestaande retrotonen, of voor eigen MP3-, OGG- of WAV-bestanden. Gebruik alleen eigen muziek of muziek die je hiervoor mag gebruiken. De bouwer kan achtergrondmuziek laten herhalen en eigen geluiden koppelen aan bijvoorbeeld springen, verzamelen en de finish.

Muziek en effecten hebben aparte volumeregelaars. Bij pauze stopt het geluid. Na hervatten gaat de muziek verder. Bij een nieuw level wordt het oude geluid opgeruimd. Een ontbrekend of niet afspeelbaar bestand gebruikt het standaardgeluid. De browser moet het bestandstype kunnen afspelen; daarom test de bouwer dit op de schoollaptop.

Voor de bestaande toonreeks mag je 4–64 noten kiezen met een tempo van 60–200. Alle stappen duren even lang. De bouwer vertaalt jullie sfeerbeschrijving naar een melodie als jullie geen eigen bestand hebben.

### Wat lever je voor beelden aan?

- Een routeschets met start, finish, platformen en gevaren.
- De originele PNG-bestanden; alleen een plaatje in een tekstbestand is niet genoeg voor de definitieve versie.
- Per spritesheet: breedte en hoogte van één vakje, aantal vakjes en de volgorde per animatie.
- De gewenste grootte in het spel en een tekening van het contactgebied.
- Losse achtergronden met uitleg over volgorde, herhaling en beweging.
- Twee avatars, kaartbeelden en eventueel een korte intro.
- Muziek en effecten met bestandsnaam, moment van afspelen en informatie over het gebruiksrecht.

Advies: teken kleine figuren op een raster van 16, 32 of 48 pixels. Houd alles scherp en in dezelfde stijl. Gebruik voor kaarten ongeveer 16:9. De bouwer controleert de technische grenzen in de [assetgids](docs/ASSETS.md). Bestanden worden per duo in een eigen map bewaard.

## 8. Technische grenzen in gewone taal

Een pixel is een klein beeldpunt. Gebruik op een schets bijvoorbeeld **één ruitje voor 32 pixels**. Je hoeft niet ieder punt precies uit te rekenen. De bouwer vertaalt jullie schets naar het level.

### Lopen en springen

| Onderdeel | Waarde in de huidige game |
|---|---|
| Gewone topsnelheid | 245 pixels per seconde |
| Turbo | Ongeveer 355 pixels per seconde |
| Gewone maximale spronghoogte | Ongeveer 104 pixels, ruim drie ruitjes van 32 |
| Gewone sprongafstand | Ongeveer 200 pixels bij volle snelheid en landen op dezelfde hoogte |
| Hoge-sprong-power-up | Ongeveer 168 pixels hoog; ongeveer 254 pixels ver bij gewone snelheid |
| Springveer | Theoretisch ongeveer 219 pixels hoog bij een ononderbroken lancering |
| Sturen in de lucht | Links en rechts werken ook tijdens een sprong |
| Spatie vroeg loslaten | Remt een opwaartse beweging af en maakt de sprong korter |

De hoogtes en afstanden zijn **schattingen uit de bewegingsregels**, geen gegarandeerde veilige sprongen. Aanloop, het loslaten van Spatie, platforms en het moment van landen maken verschil. Ook een lancering door een springveer kan worden afgeremd door Spatie los te laten.

Ontwerp verplichte gewone sprongen daarom liever met **maximaal 80–90 pixels hoogteverschil** en **maximaal 160 pixels tussen de randen**. Een gat van 180 pixels kan moeilijk worden. Bij een hoger landingspunt kun je minder ver springen. Geef voldoende ruimte boven het hoofd en een breed landingsvlak. Een power-up die nodig is voor de route moet ook na verlies van een leven bereikbaar of overbodig zijn.

Ladders en zwemmen werken in V2.2. Een waterzone moet wel echt worden toegevoegd: alleen een blauwe achtergrond verandert de beweging niet. Dubbele sprong, muursprong en kruipen zijn nog niet gebouwd. De sprongmaten hierboven gelden op gewone grond. Wind, water, een verende vloer of andere zwaartekracht verandert het bereik.

### Grootte van het level

| Onderdeel | Grens die het bestand accepteert | Advies voor jullie ontwerp |
|---|---|---|
| Speelbeeld | Vast 960 × 540 pixels | Teken een brede route die links-rechts doorloopt. |
| Wereldbreedte | 960–50.000 pixels | Begin rond de voorbeelden: 5.200 en 8.800 pixels. Meet daarna de speeltijd. |
| Wereldhoogte | 540–4.000 pixels | **Gebruik 540.** De camera volgt niet omhoog of omlaag. Een grotere ingevoerde hoogte maakt geen goed werkend verticaal level. |
| Aantal objecten | 1–4.000 per level | Dit is geen prestatiedoel. Gebruik alleen wat nodig is en test op een schoollaptop. |
| Objectbreedte | 8–8.000 pixels | Gebruik eigen beelden op passende grootte. Maak een lange bodem uit meerdere grondstukken. |
| Objecthoogte | 8–800 pixels | Houd de route en belangrijke voorwerpen binnen het zichtbare scherm. |
| Streeftijd | 10–600 seconden | Richt op 30–60 seconden. Dit is voor de bonus, niet een aftellende tijdslimiet. |

De oorsprong ligt linksboven. Naar rechts neemt `x` toe, naar beneden neemt `y` toe. In de voorbeelden ligt de grond meestal op `y = 480`. De speler staat dan met zijn bovenkant rond `y = 450`.

### Beweging van objecten

- De oude beweegbare platforms (`movingX`, `movingY`) en vallen gebruiken `speed` van 0–500 en `range` van 0–1.500 pixels. Ze bewegen vloeiend heen en terug, niet langs een getekende route.
- Een bereik van 100 betekent maximaal 100 pixels aan iedere kant van het startpunt: een totale baan van 200 pixels.
- De volledige baan moet binnen de wereld blijven. Het bestand controleert de beginplek, maar niet alle uiterste bewegingspunten.
- De tijd voor één heen-en-terugbeweging volgt uit snelheid en bereik. Het veld `period` regelt bij deze platforms niet de omlooptijd.
- `period` regelt wel de cyclus van verdwijnende platforms en de wachttijd van schutters: 0,5–30 seconden.
- Maximale toegestane waarden zijn geen advies. Extreem snelle of grote objecten moeten extra worden getest.

Voor een nieuwe lift of routeplatform teken je 2 tot 32 stopplaatsen. De snelheid is 5–400 pixels per seconde. De wachttijd is 0–30 seconden per stop. Laat voldoende ruimte voor het platform, de speler en een gedragen kist. Nieuwe liften stoppen bij een botsing; geef de speler altijd een veilige weg terug.

## 9. Verborgen verrassingen

Deze ideeën kunnen met bestaande bouwstenen:

| Idee | Zo bouw je het |
|---|---|
| Een geheime hoek onder een platform | Plaats daar een `secret`-gebied en eventueel munten. |
| Een verborgen makerskamer | Maak een ruimte met muren, een ingang en een veilige uitgang. Zet er een geheimbericht in. |
| Een geheime doorgang | Gebruik `passage` met een bestemming in hetzelfde level. Geef een kleine aanwijzing voor ↑. |
| Een bonus achter breekbare blokken | Zet het bonusvoorwerp apart achter de blokken. Het blok zelf maakt geen voorwerp aan. |
| Een verrassende route bovenlangs | Gebruik een springveer of hoge sprong, plus een route terug. |

Een bericht bij een geheim mag maximaal 180 tekens bevatten. Meerdere geheimen mogen, met ieder een eigen object-ID. De game telt ontdekte geheimen in de uitslag. Het blijvende record onthoudt alleen **of er minstens één geheim is gevonden**, niet welke geheimen dat waren.

Een geheime kamer hoort bij dezelfde speelwereld. Een aparte kamer met een eigen scherm of achtergrond, een filmpje, een gesprek met keuzes of een deur die pas na een quiz opent is **nog te bouwen**.

## 10. Maximaal één nieuwe spelmechaniek

Een spelmechaniek is een regel die bepaalt hoe je speelt. ‘Een rode vijand’ is een uiterlijk. ‘Een vijand die alleen beweegt als jij stilstaat’ is een nieuwe spelmechaniek.

Beschrijf bij een nieuw idee:

1. Wat kan de speler ermee doen?
2. Wanneer begint het effect en wanneer stopt het?
3. Welke bestaande toets gebruikt de speler?
4. Wat gebeurt er bij pauze, schade, levensverlies en het verlaten van het level?
5. Hoe leert de speler het zonder lange uitleg?
6. Hoe kan de speler altijd verder of opnieuw proberen?

**De bestaande bouwstenen tellen niet als nieuwe mechaniek.** Je mag bijvoorbeeld water, een drukplaat, een lift en een NPC in één level combineren. Ze gebruiken instellingen in jullie eigen levelbestand. Voor wind kies je de nieuwe omgevingszone. De oude extra mechaniek `wind` blijft alleen beschikbaar voor oude ontwerpen.

Voor een andere mechaniek moet de bouwer code toevoegen en de toegestane lijst met mechanieken uitbreiden. Alleen een nieuwe naam in de prompt of het JSON-bestand schrijven werkt niet.

De nieuwe code moet:

- alleen actief zijn in het level dat haar gebruikt;
- de vaste score, levens en basisbesturing behouden;
- eigen tijdelijke gegevens gebruiken;
- timers, geluid en gebeurtenissen opruimen na het level;
- een duidelijke afspraak hebben over opnieuw starten na levensverlies;
- apart worden getest én met de bestaande levels worden getest.

De huidige koppeling biedt alleen een update tijdens het spelen en opruimen bij afsluiten. Een knopreactie, eigen objecten, extra beeld of een actie bij levensverlies kan dus ook een uitbreiding van die koppeling vragen. Isolatie is nu een programmeerafspraak, geen technische beveiligde omgeving. Laat een bouwer eerst aangeven of jullie idee past binnen één kleine uitbreiding.

## 11. Deze spelregels staan vast

### Besturing en gezondheid

| Toets | Actie |
|---|---|
| ← en → | Lopen en sturen in de lucht |
| Spatie | Springen |
| ↑ | Deur of doorgang gebruiken |
| ↓ | Kist oppakken of neerzetten |
| Escape | Pauzemenu openen |

Je begint ieder level met drie levens, drie hartjes, nul munten en een nieuwe score en tijd. Schade kost één hartje. Daarna knipper je en ben je 1,5 seconde beschermd. Zijn je hartjes op, dan verlies je een leven. Je krijgt drie hartjes en verschijnt bij het laatst geraakte checkpoint of het begin. Een afgrond kost direct een leven. Bij nul levens volgt Game Over.

Een verloren leven wist je tijd, score en eerdere vondsten niet. Dezelfde munt, verslagen vijand of hetzelfde geheim levert binnen die poging geen tweede keer punten op. Kies je ‘Opnieuw spelen’, dan begint een nieuwe poging.

De finish is het hoofddoel. Je hoeft niet alle munten te pakken of vijanden te verslaan. Een sleuteldeur kan een route afsluiten. Andere voorwaarden, zoals ‘verzamel precies tien munten’, worden niet vanzelf gecontroleerd omdat ze in het verhaal staan.

### Punten

| Actie | Punten |
|---|---:|
| Munt | 100 |
| Vijand verslaan | 200 |
| Geheim ontdekken | 500 |
| Bonusvoorwerp | 500 |
| Finish bereiken | 1.000 |
| Ieder overgebleven hartje bij finish | 100 |
| Ieder overgebleven leven bij finish | 250 |
| Tijdbonus | 0–1.000 |

Bij de ingestelde streeftijd krijg je 500 tijdpunten. Bij twee keer die tijd krijg je nul tijdpunten. Sneller is meer, maar langzamer geeft nooit minpunten. Voor de bouwer: `afronden(1000 × max(0, min(1, 1 − tijd / (2 × streeftijd))))`.

Pauze stopt de speeltijd. Records worden na een succesvolle finish in die browser opgeslagen: beste score, snelste tijd, meeste munten, voltooid en minstens één geheim gevonden. Er is geen gezamenlijk klassement of account. Een andere browser of website-adres heeft eigen records.

## 12. Dit leveren jullie in

Lever één document aan per duo. Gebruik een nummer, bijvoorbeeld **duo 03**.

### De prompt

- Twee makersnamen die op de openbare website mogen staan.
- Een unieke levelnaam van maximaal 80 tekens.
- Een kort verhaal van maximaal 1.500 tekens.
- Het doel en een beschrijving van de finish.
- Easy, Medium of Hard, met uitleg waarom.
- Een gewenste speelduur van ongeveer 30–60 seconden.
- Personagenaam, kleur en eventueel een schets voor een ander uiterlijk.
- Thema en kleuren voor lucht, achtergronden, grond en accenten.
- De route: begin, midden, einde en eventuele zijpaden.
- Minimaal één soort vijand, munten en één verborgen verrassing.
- Plaats van sleutels, deuren, checkpoints en power-ups als jullie die gebruiken.
- Twee eigen avatarbeelden en twee terugvalkleuren.
- Muzieksfeer en gewenst tempo. Een eigen melodie mag erbij.
- Korte teksten voor bordjes of geheimen, maximaal 180 tekens per tekst.
- Eventueel één nieuwe spelmechaniek, uitgelegd met de vragen uit hoofdstuk 10.

Een level kan zonder sleutel, deur of power-up werken. Die onderdelen zijn dus keuzes. De unieke naam, het verhaal, twee makers, een personage, wereld, vijand, munten, geheim, finish en moeilijkheid horen wel bij ieder studentenontwerp.

### Afbeeldingen en schetsen

**Voor een level met alleen bestaande vormen zijn afbeeldingsbestanden niet technisch nodig.** Een routeschets helpt wel sterk. Gebruik bijvoorbeeld deze namen:

| Bijlage | Wat moet erop staan? |
|---|---|
| `duo-03-route.png` | Start, finish, platforms, gevaren, sleutel, geheim en pijlen voor de looproute. Zet erbij wat één ruitje betekent. |
| `duo-03-personage.png` | Het gewenste personage, duidelijk van opzij. Benoem de belangrijkste kleuren en vormen. |
| `duo-03-wereld.png` | Sfeer, kleuren en achtergrondidee. Benoem wat decor is en waarop je moet kunnen staan. |
| `duo-03-vijand.png` | Vorm, kleur en gekozen gedrag per vijand. |
| `duo-03-avatars.png` | Twee duidelijk gelabelde avatarideeën. |

Een foto van een duidelijke tekening mag ook. Leg per afbeelding uit wat de bouwer moet overnemen. Gebruik eigen werk of materiaal waarvoor je toestemming hebt. Een echte foto van de makers is niet nodig.

Voor een nieuw figuurtje lever je een transparante PNG of een spritesheet: meerdere gelijke beeldvakjes in één bestand. Geef aan welke vakjes bij stilstaan, lopen, springen, vallen, schade en overwinning horen. Spreek formaat, snelheid en contactgebied af. Lever achtergronden, twee avatars, drie kaartbeelden en muziek apart aan. Zie hoofdstuk 7 en de [technische assetgids](docs/ASSETS.md). Er is geen uploadknop in de game; de bouwer voegt jullie bestanden toe.

### Voorbeeld van een bruikbare prompt

> Wij zijn duo 03: Noor en Sam. Ons level heet Nacht in de winkel. Je speelt als Pip met een paarse tint. Pip zoekt de sleutel van het magazijn. De lucht is donkerblauw en de accenten zijn geel. Het level is Easy en duurt ongeveer 45 seconden.
>
> Begin op veilige grond met vijf munten. Daarna komen twee lage platforms en een langzaam lopende vijand. Halverwege staat een checkpoint. De sleutel ligt vóór de magazijndeur. Met ↑ open je die deur. Onder een platform ligt een geheime plek met een bonus. Het bericht is: ‘Je vond de geheime voorraad!’ Aan het einde staat de gele vlag. De muziek is rustig en spannend. We gebruiken geen nieuwe spelmechaniek.
>
> Bijlage 1 is onze routeschets. Bijlage 2 bevat onze eigen pixelbeelden van winkelrekken. Gebruik die als decoratie zonder botsing.

## 13. Wat werkt nog niet volledig en wat ontbreekt?

Dit overzicht helpt om een haalbaar ontwerp te kiezen. V2.2 voegt spelgedrag toe. Eigen beelden en audio uit V2.1 blijven bruikbaar.

| Onderdeel | Status | Gevolg voor jullie ontwerp |
|---|---|---|
| Eigen personages, avatars en vijandvormen | **Werkt** | Beelden en animaties zijn per level instelbaar. Test het contactgebied. |
| Andere achtergronden en kaartafbeeldingen | **Werkt** | Eigen herhaalbare lagen en kaartbeelden. Ook de oude heuvels lopen nu door. |
| Grootte en kleur van objecten | **Werkt met eigen beelden** | Schaal, tint en contactgebied zijn apart instelbaar. De standaardtekeningen houden hun oude beperkingen. |
| Springer die netjes heen en weer patrouilleert | **Beperkt:** sprong en looprichting delen een timer | Laat de precieze beweging testen voordat die belangrijk is voor een puzzel. |
| Vallende steen die blijft liggen | **Nog bouwen** | De bestaande steen valt door de omgeving en begint later opnieuw. |
| Kisten voor ingewikkelde puzzels | **Beperkt:** vaste draag- en neerzetafstand | Gebruik kleine kisten en vermijd verplichte stapelpuzzels zonder extra tests. |
| Checkpoints boven elkaar | **Beperkt:** alleen de x-positie wordt vergeleken | Gebruik verschillende horizontale posities. |
| Hoge werelden met een verticale camera | **Nog bouwen** | Gebruik één schermhoogte van 540 pixels. |
| Eigen muziekbestanden en effecten | **Werkt** | MP3, OGG of WAV; aparte volumes en terugvalgeluid. Een muziekeditor is er niet. |
| Drukplaten, schakelaars, liften, water en korte gesprekken | **Werkt** | Zie hoofdstuk 6A voor de instellingen en grenzen. |
| Nieuwe vijand-AI, eindbazen en gesprekken met keuzemenu | **Nog bouwen** | Kies hoogstens één kleine extra mechaniek. |
| Vrij vliegen als speler, dubbele sprong en multiplayer | **Nog bouwen** | Een bijpassend thema geeft deze bewegingen nog niet. |
| Editor waarin studenten zelf objecten slepen of prompts uploaden | **Nog bouwen** | Lever jullie ontwerp bij de docent of bouwer in. |
| Volledige bescherming tegen fouten in nieuwe code | **Beperkt** | Nieuwe code moet worden nagekeken en getest voor publicatie. |

## 14. Kunnen tien duo’s een los level toevoegen?

**Ja, voor levels met de bestaande bouwstenen is de opzet geschikt.** Elk duo krijgt een eigen gegevensbestand. De bestaande tutorial en het voorbeeldlevel hoeven daarvoor niet te worden veranderd.

Een gegevensbestand, hier een **JSON-bestand**, bevat de naam, het verhaal, kleuren, muzieknoten en de lijst met objecten. De game leest die gegevens en bouwt daarmee de wereld.

### Wat al goed is geregeld

- Ieder level heeft een eigen ID, versie en bestand in `public/levels/`.
- `public/levels/index.json` is de gezamenlijke lijst met bestanden. Het menu wordt uit die lijst gemaakt. Nieuwe studentenlevels krijgen `tutorial: false`.
- De controle van het bestandsformaat staat in `src/levels/schema.ts`.
- Eén ongeldig of ontbrekend levelbestand wordt overgeslagen. Andere geldige levels kunnen blijven laden. Een dubbel level-ID wordt niet een tweede keer toegevoegd.
- De spelerstatus, objecten, sleutels en score worden voor iedere nieuwe poging apart gemaakt. Tijdens het spelen worden kopieën van de objectgegevens gebruikt.
- Records worden per level-ID bewaard.
- Bij verlaten van een level wordt de Phaser-game opgeruimd. De code verwijdert toetsen, focuslistener, muziekinterval en de actieve extra mechaniek.
- Een bestaande test laadt 100 geldige testlevels, slaat één ongeldig bestand over en verwijdert daarna een testlevel. Dat ondersteunt de keuze voor tien extra levels.

### Waar de architectuur nog grenzen heeft

**1. De gezamenlijke lijst blijft belangrijk.** Als `index.json` zelf ontbreekt of ongeldig is, kan de game geen levels laden. Laat daarom één persoon wijzigingen in deze lijst samenvoegen.

**2. Een geldig bestand is nog geen speelbaar level.** De controle vindt bijvoorbeeld een ontbrekende sleuteldefinitie, maar niet of de speler werkelijk bij die sleutel kan komen. Zij controleert ook niet alle bewegingsbanen, veilige doorgangen of complete objecthoogtes. Zelfs de melding ‘bereikbare sleuteldefinitie’ in de code bewijst geen bereikbaarheid.

**3. Nieuwe code is niet volledig afgeschermd.** De meeste objectgedragingen en tekeningen staan samen in `GameScene.ts`. Een fout in die gedeelde code kan meerdere levels raken. Er is geen aparte foutopvang rond iedere extra mechaniek. Dat maakt de basis geschikt voor losse data, maar nog geen volledig onafhankelijk systeem voor willekeurige nieuwe code.

**4. Unieke beelden passen nu in losse levelbestanden.** Geef ieder duo een eigen assetmap en verwijs ernaar in het eigen JSON-bestand. De standaardweergave blijft beschikbaar bij een ontbrekend beeld. Grote beelden laden pas bij het starten van het betreffende level; kaartbeelden kunnen al in het menu laden.

**5. Spreek af wat na levensverlies teruggaat naar de start.** De nieuwe bouwstenen kunnen hun stand bewaren of teruggaan naar hun beginstand. Ontvangen beloningen blijven verbruikt. Een volledige herstart begint alles opnieuw. Voor eigen nieuwe code blijft een aparte controle nodig.

**6. Honderd bestanden laden is geen snelheidstest.** De test gebruikt nagebootste netwerkantwoorden. Zij bewijst niet dat 100 zware levels of 4.000 bewegende objecten soepel lopen. Tien eenvoudige levels worden na elkaar gespeeld, maar de gegevens van alle geregistreerde levels worden bij het openen geladen.

### Veilige werkwijze voor de bouwer

1. Geef ieder duo een uniek ID, bijvoorbeeld `duo-01-maanmarkt` tot en met `duo-10-festival`.
2. Maak per duo een eigen branch: een aparte werkversie in Git.
3. Voeg alleen het nieuwe bestand toe, bijvoorbeeld `public/levels/duo-01-maanmarkt.json`.
4. Voeg die bestandsnaam toe aan `public/levels/index.json`. Verander de bestaande levelbestanden niet.
5. Geef ieder object binnen het level een uniek ID. Bewaar eventuele nieuwe beelden in een eigen map per duo. Koppel deze bestanden via de nieuwe assetvelden.
6. Controleer met `npm run validate:levels`, `npm test` en `npm run build`.
7. Speel het nieuwe level helemaal uit. Test ook pauze, doodgaan, checkpoint, sleutel, deur, geheim en herstart. Laat een ander duo dit ook doen.
8. Controleer toevoegen én verwijderen via het register. Laat geen tijdelijke testkaart staan.
9. Wijzigt gedeelde code? Test dan ook beide basislevels en alle eerder toegevoegde studentenlevels die geraakt kunnen worden.
10. Laat de docent het resultaat beoordelen vóór het samenvoegen en publiceren.

Voor nieuwe levels met bestaande bouwstenen hoeft de spelcode niet te veranderen. **Op de huidige Vercel-site is wel een nieuwe publicatie nodig.** Bij de Git-werkwijze worden de nieuwe bestanden gepusht en maakt Vercel een nieuwe build. De opmerking ‘zonder nieuwe enginebuild’ uit de eerdere handleiding betekent dus niet dat een bestand op je laptop vanzelf live staat.

## 15. Controle vóór het inleveren

- [ ] Onze twee makersnamen en avatar-kleuren staan erbij.
- [ ] Ons level heeft een unieke naam, verhaal, personage en wereld.
- [ ] We hebben een vijand, munten, een geheim en een finish beschreven.
- [ ] We hebben begin, midden en einde van de route uitgelegd.
- [ ] Gewone sprongen blijven ruim binnen de veilige afstanden.
- [ ] Sleutels liggen vóór hun deuren en zijn bereikbaar.
- [ ] Een geheime ruimte heeft een veilige uitgang.
- [ ] Na een verloren leven kan de speler nog steeds verder.
- [ ] We hebben Easy, Medium of Hard gekozen en streven naar 30–60 seconden.
- [ ] We noemen welke wensen al werken en welke extra bouw nodig hebben.
- [ ] We vragen maximaal één nieuwe spelmechaniek.
- [ ] Bij iedere afbeelding staat wat de bouwer moet overnemen.

## 16. Verantwoording voor docent en bouwer

Deze catalogus begon met een controle van de basisgame op commit `b55777a`. Hij is daarna bijgewerkt op basis van de gebouwde V2.1-code, vier levelbestanden, assetbestanden en tests. Het Git-herstelpunt vóór de uitbreiding heet `pre-v2.1-20261127`.

De oude twintig tests zijn behouden. De uitgebreide set telt **39 geslaagde tests**. Vier levelbestanden en hun assets zijn gevalideerd. De twee oorspronkelijke levelbestanden en de vaste regels zijn ongewijzigd. Het [testlog](docs/TESTING.md) beschrijft ook de browsercontroles, audio en lokale prestatiemeting.

‘Werkt’ in deze gids betekent dat de functie in de code aanwezig is, met ondersteuning van de bestaande tests waar die er zijn. Het betekent niet dat alle combinaties zijn bewezen. De volledige routes worden in de tests doorlopen met gesimuleerde toetsen. Beeld en audio worden daar niet echt afgespeeld. De test die alle bouwstenen telt, controleert alleen of ze in de voorbeelddata voorkomen.

Voor V2.1 zijn beide demolevels volledig uitgespeeld in de browser, inclusief geheim en finish. Tutorial en voorbeeldlevel zijn opnieuw gestart en gespeeld. De volledige routes van alle vier levels worden daarnaast automatisch met toetsbesturing getest. De lange achtergrond is in V2.1 gerepareerd. Het gedrag van de springer is ongewijzigd.

### Bronnen in dit project

| Bron | Gebruikt voor |
|---|---|
| [Levelschema](src/levels/schema.ts) | Beschikbare typen, invoervelden en grenzen |
| [Levellader](src/levels/registry.ts) | Register, foutafhandeling en toevoegen/verwijderen |
| [Gameplay](src/scenes/GameScene.ts) | Werkelijk gedrag, botsingen, tekeningen en opruimen |
| [Speler](src/entities/player.ts) en [botsingen](src/core/physics.ts) | Beweging en contactgebieden |
| [Spelregels](src/core/rules.ts) | Gezondheid, score en tijdpunten |
| [Pixelbeelden](src/entities/art.ts) en [menu’s](src/main.ts) | Personages, achtergrond, avatars en kaarten |
| [Muziek](src/audio/audio.ts) | Melodieën, effecten en volume |
| [Mechanieken](src/mechanics/registry.ts) | Wind en koppeling van uitbreidingen |
| [Records](src/storage/records.ts) | Wat lokaal bewaard blijft |
| [Gameplaytests](tests/gameplay.test.ts), [basistests](tests/core.test.ts) en [registertest](tests/registry.test.ts) | Wat automatisch wordt gecontroleerd |
| [Testlog](docs/TESTING.md) | Uitgevoerde browsercontroles en grenzen daarvan |
| [Bouwstenen](docs/BUILDING_BLOCKS.md), [schema-uitleg](docs/LEVEL_SCHEMA.md), [spelregels](docs/GAME_RULES.md), [levels toevoegen](docs/ADD_LEVEL.md), [promptformat](docs/STUDENT_PROMPT_TEMPLATE.md), [README](README.md) en [AGENTS](AGENTS.md) | Vergelijking met de documentatie en afspraken voor toekomstige bouwers |
| [Vercel-configuratie](vercel.json) | Bouwen, publiceren en vernieuwen van levelgegevens |

Als een wens uit het oorspronkelijke plan ruimer is dan wat de code nu kan, volgt deze gids de code. Bespreek een ontbrekende functie eerst met de bouwer voordat je er een verplicht deel van jullie route van maakt.
