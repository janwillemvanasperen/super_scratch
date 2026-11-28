# V2.3 – Vijanden, eindbazen en leveldoelen

De bestaande zes vijandtypen behouden hun gedrag. Het nieuwe type enemy gebruikt het veld enemy. Het type objective markeert een gebied voor bezoek of bezorging. Beide typen ondersteunen de bestaande visuele velden, inclusief een apart contactgebied. Een objective zonder eigen beeld kan onzichtbaar zijn. Geef het een beeld of tekst als de speler de plek moet herkennen.

## Vijanden

| Instelling | Gedrag |
|---|---|
| behavior.move | stand, walk (rechts), patrol (heen en weer), chase, flee, route of guard. Guard reageert op nabijheid en blijft rond de start. Chase en flee staan stil buiten detectiebereik. |
| speed / range | 0–400 px/s, 8–1500 px. Range begrenst patrol en guard. |
| detect / reaction / waitNear | 10–1500 px in twee dimensies, 0–10 s aaneengesloten detectie, optioneel wachten tot detectie. |
| route / wait | 2–32 punten binnen de wereld, in volgorde en met terugkeer naar punt één. Wachttijd 0–30 s op elk punt. |
| flight / jump / jumpNear | Verticale vliegamplitude 0–250 px of sprongbeginsnelheid 100–700 px/s. JumpNear koppelt springen aan detectie. |
| shoot | Projectielsnelheid 30–600 px/s. Richting aim, left, right of horizontal. Aanval single of spread. |
| teleport / hide / interval | Teleport kiest achtereenvolgens uit 2–16 punten. Een bezet punt wordt overgeslagen. Hide maakt tijdelijk onzichtbaar en contactloos. Interval 0,2–60 s. |
| vulnerableFor | Aan het begin van iedere aanvalscyclus een beperkt kwetsbaar tijdvenster. Zonder waarde is er geen venster. |
| hp / damage / hitDelay | 1–100 HP, 0–3 hartjes schade, 0,1–10 s bescherming na een treffer. Kogels gebruiken dezelfde schade. |
| accepts / weakSpot | Toegestane aanvallen stomp, throw, power (ster) en event. De zwakke plek is een rechthoek binnen het lichaam. Gebruik x, y, w, h als fracties van 0 tot 1. Een event omzeilt de positie en tijdvensters, maar respecteert hitDelay en accepts. |

Kies één basisbeweging. Route vereist routepunten en sluit teleporteren, springen en vliegen uit. Vliegen en springen sluiten elkaar uit. Hide en kwetsbaarheid moeten korter zijn dan het interval. Een muur kan een route blokkeren. Dit is geen routezoeker en de controle bewijst niet dat een opstelling speelbaar is.

## Eindbaas

Gebruik boss: true voor een balk boven het personage. Met bar kun je de balk ook bij een gewone vijand aanzetten. Intro verschijnt eenmaal bij detectie. Music bevat tempo en noten van de chiptune. Na de overwinning keert de normale levelmuziek terug. Aanvallen volgen dezelfde bouwstenen als andere vijanden. Phases bevat maximaal acht regels met een strikt dalende at-fractie en een volledig behavior-blok. De laatste toepasselijke fase geldt. Defeated bevat maximaal 32 acties. De score voor een verslagen vijand blijft 200 punten, één keer per poging. Extra beloningen gebruiken bestaande vaste puntwaarden.

## Doelen en gebeurtenissen

Een doel bestaat uit label en condition. De tabel geeft de velden binnen condition.

| type | Velden en betekenis |
|---|---|
| coins / kills | count. Minimaal aantal munten of verslagen vijanden. |
| items | ids van geplaatste munten, bonusobjecten, hartjes, sleutels of geheimen. |
| enemies | ids van specifieke vijanden of bazen. |
| switches | ids van schakelaars of drukplaten die tijdens de poging actief zijn geweest. |
| people | ids van NPC’s waarvan de interactie is voltooid. Een bevrijding bouw je met een deur en een NPC-interactie. |
| keys | ids van sleutels die zijn verworven. Een ingeleverde sleutel blijft meetellen. |
| visit | ids van objective-gebieden die de speler moet raken. |
| deliver | object is het ID van een kist. to is het ID van een objective-gebied. Zet de kist los in het gebied. |
| time | seconds. De voorwaarde geldt zolang de speelklok binnen die tijd blijft. |

Goals op het level moeten allemaal kloppen. Requirements per finish voegen voorwaarden toe voor die specifieke uitgang. Uitgangen werken als alternatieven. Een voltooide uitgang kent de finishbonus één keer toe en gebruikt het bestaande record per level-ID. Houd afteltijden haalbaar vanaf checkpoints. Pauze stopt de klok. Levensverlies laat de poging, verzamelde voortgang en vijand-HP bestaan. Een volledige herstart begint een nieuwe poging.

Events zijn regels met uniek id, een lijst when met doelen en een lijst actions. Zodra alle voorwaarden kloppen, voert het systeem de acties eenmaal uit. Voorbeeld: bezoek een objective-gebied om een NPC via talk zijn eerste zin te laten tonen. Talk kent geen beloning toe. Met enable maak je een voorbereide vijand actief. Een bestaande deuractie of show kan een route vrijgeven. Damage richt één treffer aan bij een vijand met event-kwetsbaarheid. Background geeft de basisachtergrond een kleurlaag. Music start een nieuwe reeks noten. Volledig de afbeeldingslagen wisselen of muziekbestanden per baas laden is niet geïmplementeerd.

De publicatie bevat de demonstratie De Kristalwerkplaats. De vier oude levelbestanden blijven intact. De tests controleren elk bewegingsgedrag, een reeks combinaties, de finishblokkade, drie doelen, checkpoint en levensverlies, alle treffers van het eindbaasgevecht en enkelvoudige score. De gerichte gevechtstest plaatst de speler bij de testpunten en gebruikt de echte spelstappen en botsingen.
