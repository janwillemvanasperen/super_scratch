# Eigen beelden en geluid — V2.1

Deze uitbreiding verandert het uiterlijk, niet de vaste spelregels. De oude JSON-bestanden blijven geldig. Zie `src/assets/schema.ts` voor alle grenzen. Werkende voorbeelden: `public/levels/midnight-city.json` en `deep-sea-treasure.json`. Beide zijn herkenbaar gemarkeerde, verwijderbare demo's; hun makers zijn geen verzonnen studenten.

## Bestanden en verwijzingen

Bewaar bestanden in `public/assets/<level-id>/`. Het JSON-pad begint bij `assets/`, zonder `public/` of eerste slash. Gebruik letters, cijfers, `_` en `-` in mapnamen. Geen externe URL's, `..`, SVG, HTML of scripts. Asset-ID's bevatten letters, cijfers, `_` en `-`.

```json
{
  "assets": {
    "robot": {
      "type": "sheet",
      "src": "assets/duo-01/robot.png",
      "frameWidth": 48,
      "frameHeight": 48,
      "frameCount": 8
    },
    "vloer": {"type": "image", "src": "assets/duo-01/vloer.png"},
    "lied": {"type": "audio", "src": "assets/duo-01/lied.ogg"}
  }
}
```

Dit is een aanvulling op een volledig level, geen zelfstandig geldig level. Alle nieuwe top-level velden (`assets`, `styles`, `background`, `presentation`, `audio`, `demo`) zijn optioneel. De oude `palette`, `music`, makerskleuren en personagekleur blijven verplicht als terugval.

| Assettype | Velden en grenzen |
|---|---|
| `image` | `src`: PNG, WebP of JPEG. Transparantie: gebruik PNG/WebP. |
| `sheet` | Dezelfde beeldformaten; `frameWidth`/`frameHeight`: gehele getallen 1–4096; `frameCount`: 1–512; `margin`/`spacing`: 0–128, standaard 0. Alle frames staan op een regelmatig raster. Nummering vanaf 0, links naar rechts, daarna volgende rij. |
| `audio` | MP3, OGG of WAV. De browser moet de gebruikte codec kunnen decoderen. |

Maximale beelddimensie 8192 pixels per zijde en maximaal 16.777.216 pixels totaal. Offline validatie weigert bestanden boven 20 MB en pakketten boven 64 MB. Dit zijn bovengrenzen, geen aanbevelingen. Advies: sprites 16–64 pixels, achtergronden circa 512×270 of 960×540, hooguit enkele MB per level en 2–4 achtergrondlagen. Houd grote lege vlakken transparant en vermijd tientallen schermvullende voorgrondlagen.

## Beeld los van gedrag

`character.visual` geeft de speler een beeld. `styles.<kind>` geeft alle objecten van dat type een beeld; `objects[].visual` vervangt dit voor één object. Alle 33 bestaande typen werken via dezelfde renderer. Ook `styles.projectile` is mogelijk; projectielen zijn nog steeds alleen van een schutter afkomstig.

```json
{
  "character": {
    "name": "Nova",
    "color": "#ffffff",
    "hitbox": {"width":22,"height":30,"offsetX":13,"offsetY":18},
    "visual": {
      "asset":"robot", "fit":"native", "scale":1,
      "animations": {
        "idle":{"frames":[0,1],"fps":2},
        "walk":{"frames":[2,0,3,1],"fps":10},
        "jump":{"frames":[4]}, "fall":{"frames":[5]},
        "hurt":{"frames":[6,0],"fps":10},
        "victory":{"frames":[7,1],"fps":4}
      }
    }
  },
  "styles": {
    "ground":{"asset":"vloer","mode":"tile"}
  }
}
```

| Visualveld | Betekenis / standaard |
|---|---|
| `asset` | Verwijst naar een image/sheet-ID. |
| `frame` | Stilstaand frame, standaard 0. |
| `mode` | `sprite` (standaard) of `tile`. Tile herhaalt één geselecteerd textureframe over het vlak. Geen automatische Tiled-mapimport of autotiling. |
| `fit` | `body` (standaard): objectbeeld volgt opgegeven object-w/h; spelerbeeld volgt hitbox-w/h. `native`: oorspronkelijke frameafmetingen. |
| `scale` | 0,1–16; standaard 1. Bij tile de grootte van het herhaalde patroon, niet de botsing. |
| `offsetX`, `offsetY` | Beeldverschuiving, -2000–2000 pixels; standaard 0. |
| `flipX`, `flipY` | Spiegelen; standaard false. Speler/vijandrichting wordt gecombineerd met flipX. |
| `rotation` | -360–360 graden, rond de linkerbovenhoek; standaard 0. |
| `alpha` | 0–1; standaard 1. |
| `depth` | -100–100 bovenop de basisdiepte; standaard 0. |
| `tint` | Optionele #RRGGBB-kleurtint. Zonder tint blijven oorspronkelijke beeldkleuren behouden. |
| `animations` | Namen met `frames`, `fps` (0,1–60, standaard 8) en `repeat` (-1 oneindig, 0 één keer, tot 100 extra herhalingen). |
| `animation` | Optionele standaardanimatie voor decor/items/lagen of als gevraagde toestand ontbreekt. Anders `idle`, anders stilstaand frame. |

Automatische spelerstaten: `idle`, `walk`, `jump`, `fall`, `hurt`, `victory`. Vijanden: `idle`, `walk`, `fly`, `jump`, `fall`, `attack` (schutter tijdens schot), `defeat` (maximaal 3 seconden). Deur: `open`; checkpoint: `active`. Andere namen kunnen worden gebruikt als vaste decoranimatie met `animation`; een nieuwe gameplay-trigger voor een extra spelerstaat vraagt code. Een ontbrekende clip gebruikt de standaardclip of het stilstaande frame. Bij een ontbrekend beeld/ongeldig frame verschijnt de bestaande basisvorm.

Teken een leesbaar contactvlak: transparante pixels botsen niet afzonderlijk. De botsing is altijd een rechthoek. Objecten kunnen een `hitbox` hebben met `width` 4–8000, `height` 4–800 en optionele `offsetX/Y` -1000–1000. Zonder hitbox gebruiken objecten w/h, de speler 22×30. Offset wordt gerekend vanaf de startpositie van het beeld. Tijdens bewegen/respawn blijft dezelfde botsingsgrootte gelden. Schaal, spiegelen, rotatie en beeldanimaties veranderen nooit automatisch de hitbox. Bij een speler met zeer grote hitbox moet de route opnieuw worden ontworpen en getest; de sprongkracht blijft gelijk. Voor een andere vorm met dezelfde besturing: behoud 22×30 en teken daaromheen.

Een obstakel mag niet onzichtbaar groter zijn dan het bedoelde zichtbare gevaar. Gebruik bij grond en muren standaard `fit:body`, schaal 1, offset 0 en een herhaalbare textuur. Gebruik aparte hitboxes alleen bewust. De validator bewijst niet dat kunst en botsing overeenkomen.

## Achtergrond en decoratie

```json
{
  "background": {
    "color":"#10243a",
    "layers":[
      {"id":"ver","visual":{"asset":"hemel"},"width":1024,"height":540,"parallax":0.15},
      {"id":"voor","visual":{"asset":"planten","alpha":0.8},"width":1024,"height":540,"parallax":1.1,"foreground":true}
    ],
    "light":{"color":"#214861","alpha":0.08}
  }
}
```

Hier moeten `hemel` en `planten` nog als assets worden gedefinieerd. Maximaal 24 lagen, ieder met uniek `id`, `visual`, breedte 64–50000 en hoogte 64–4000. `x/y` standaard 0. `repeatX` standaard true, `repeatY` false. `parallax` -2–2 (standaard 0,2): 0 blijft stil ten opzichte van het scherm, 1 beweegt met de wereld. `scrollX/Y` -500–500 pixels/seconde (standaard 0) geeft zelfstandige beweging. `foreground` standaard false. `light` is één kleurvlak over het spel, alpha 0–0,85; geen dynamische lampen of schaduwen. Binnen/buiten is een keuze van de tekeningen, geen extra spelmechaniek. `legacy:true` behoudt de oude lucht/wolken/heuvels achter de lagen. Zonder achtergrondconfiguratie blijft die oude achtergrond actief; ook de heuvels herhalen nu over lange werelden.

Afbeeldingen horen aan de herhaalranden aan te sluiten. `visual.animations` animeert sheetframes. Gebruik hiervoor `fit:body`, schaal 1, geen rotatie of offset: anders kan de opgegeven herhaalmaat gaten veroorzaken. Als alle geconfigureerde achtergrondbeelden ontbreken, gebruikt het spel de oude achtergrond.

Decoratie blijft type `decoration`, standaard zonder botsing. Met `visual` kan iedere eigen afbeelding worden geplaatst. `depth:-50` staat achter de speler; `depth:50` ervoor. Basisdiepten: achtergrond -500, basiswereld 90, eigen objecten 100, speler 110, voorgrondlagen 250, lichtkleur 400. Tekst werkt zoals voorheen. Optionele `motion`:

```json
{"axis":"y","distance":24,"period":5,"phase":0}
```

Een vloeiende heen-en-weerbeweging: afstand 0–1500 aan elke kant, periode 0,5–60 seconden, beginfase 0–360 graden. Alleen decoratie gebruikt `motion`. `solid:true` maakt decoratie massief; gebruik dit voorzichtig en test bewegende massieve decoratie zoals ieder platform. Het is geen nieuwe routeplanner.

## Makers, kaarten en intro

`makers[].avatarAsset` verwijst naar een losse afbeelding; de kleuravatar blijft terugval. Geef precies twee echte makers op bij studentenlevels. `presentation.card`, `.story` en `.completion` verwijzen naar losse afbeeldingen. Advies: 16:9, hoofdonderwerp in het midden; uitsnedes kunnen per kaart verschillen. De korte `presentation.intro` bevat `asset`, `duration` 0,5–8 seconden (standaard 3) en optioneel één `animation`. Dit is een afbeelding of spritesheet, geen video of interactief verhaal. Overslaan is mogelijk; de speeltijd begint pas na de intro. Foutieve intro wordt overgeslagen.

## Audio

```json
{
  "audio": {
    "music":"lied", "loop":true, "musicVolume":0.65, "effectsVolume":0.9,
    "effects":{"coin":"ping","finish":"hoera"}
  }
}
```

Alle ID's moeten audio-assets zijn. `loop` standaard true; beide levelvolumes 0–1, standaard 1. Deze worden vermenigvuldigd met de afzonderlijke gebruikersregelaars. Effectnamen: `jump`, `coin`, `hurt`, `enemy`, `heart`, `power`, `door`, `checkpoint`, `life`, `over`, `finish`, `secret`. Niet alle losse itemsoorten hebben een eigen audio-event: sleutel en bonus gebruiken bijvoorbeeld `coin`.

Muziek/effecten laden bij starten van het level. Tot een bestand is gedecodeerd klinkt de bestaande chiptune. Een 404, netwerkfout, decodefout of timeout laat die terugval beschikbaar. Stoppen annuleert downloads en bronnen; een laat antwoord kan het oude level niet opnieuw starten. Pauze stopt lopende effecten en bewaart de muziekpositie; hervatten begint daar weer. Na een finish stopt de muziek en mag het finishgeluid uitspelen. Een herstart begint de muziek opnieuw. De browser vereist een gebruikersactie voordat geluid speelt. De demo's gebruiken originele WAV-bestanden; MP3/OGG zijn ondersteund maar codecs verschillen per browser.

## Laden, valideren en toevoegen

Alle level-JSON wordt bij het menu geladen. Kaartafbeeldingen en avatars laden op verzoek via HTML-afbeeldingen (lazy). De Phaser-assets van een wereld laden pas bij starten van dat level, maximaal vier tegelijk. Een scène deelt geen mutabele asset- of spelstatus met een andere poging. Bij verlaten verdwijnen scèneobjecten, texturen, audio, toetsen en listeners. Laden van een level wacht op beelden met een timeout van 10 seconden; audio blokkeert de start niet.

`npm run validate:levels` controleert leveldata, assetverwijzingen, bestanden, signaturen, beeldafmetingen, sheetindeling en animatieframes. Voor PNG controleert het script ook decompressie; JPEG/WebP/audio-signaturen vervangen geen volledige browserdecode. De browser blijft daarom op fouten voorbereid. Een ongeldige levelstructuur wordt overgeslagen; een geldig level met ontbrekende assetverwijzing kan met terugval blijven spelen. Offline validatie moet vóór publicatie wel volledig slagen.

Voor tien duo's: tien unieke level-ID's, tien JSON-bestanden, tien assetmappen. Voeg uitsluitend bestandsnamen aan het register toe. Voor nieuwe beelden, audio en bestaande bouwstenen is geen wijziging in GameScene nodig. Vercel maakt bij iedere Git-publicatie wel een nieuwe sitebuild. Nieuwe spelmechanieken blijven gedeelde, vertrouwde code die afzonderlijk moet worden nagekeken en op alle relevante levels getest.

De demo's verwijderen: haal alleen `midnight-city.json` en `deep-sea-treasure.json` uit het register. Ze verdwijnen dan uit het menu. Hun bestanden mogen voor voorbeelden bewaard blijven. Oude records beïnvloeden andere level-ID's niet.
