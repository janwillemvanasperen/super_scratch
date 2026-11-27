# Vaste spelregels

| Toets  | Actie                                            |
| ------ | ------------------------------------------------ |
| ← →    | Lopen, ook sturen in de lucht                    |
| Spatie | Springen; eerder loslaten maakt de sprong korter |
| ↑      | Deur of geheime doorgang gebruiken               |
| ↓      | Nabije kist oppakken / neerzetten                |
| Escape | Pauze                                            |

Een level begint met 3 levens, 3 hartjes, 0 munten, 0 score en een nieuwe timer. Schade kost één hartje; daarna 1,5 seconde knipperende onkwetsbaarheid. Op nul hartjes verlies je een leven en krijg je drie hartjes terug bij het checkpoint. Een afgrond kost direct een leven. Na drie verloren levens volgt Game Over. Opnieuw beginnen maakt een volledig nieuwe poging.

Munten, verslagen vijanden, geheimen, bonusvoorwerpen en sleutels worden binnen de poging niet opnieuw aangeboden na een verloren leven. Geopende deuren blijven open; checkpoint blijft actief. Verstreken tijd en score blijven behouden. Power-ups vervallen bij levensverlies. Kisten en vallende stenen worden teruggezet zodat essentiële objecten niet verloren gaan. Afgeschoten projectielen worden verwijderd.

| Actie             | Punten |
| ----------------- | -----: |
| Munt              |    100 |
| Vijand verslagen  |    200 |
| Geheim gevonden   |    500 |
| Bonusvoorwerp     |    500 |
| Finish            |   1000 |
| Hartje bij finish |    100 |
| Leven bij finish  |    250 |
| Tijd              | 0–1000 |

Tijdbonus = `round(1000 * clamp(1 - speeltijd / (2 * streeftijd), 0, 1))`. De streeftijd levert dus 500 punten op; tweemaal de streeftijd levert nul op. Finishpunten worden maximaal één keer toegekend. Alle tellingen gebruiken unieke object-ID's. Munten/vijanden zijn geen finishvereiste; een afsluitende deur kan wel een sleutel vereisen.

Lopen: 245 px/s; versnelling 1900 px/s²; zwaartekracht 1250 px/s²; sprongimpuls 510 px/s; maximale val 850 px/s. Coyote time 100 ms, sprongbuffer 130 ms. Normale volle sprong: circa 104 px hoog en 200 px ver. Ontwerp verplichte sprongen met marge, bij voorkeur maximaal 160–180 px.

Spring op wandelende, achtervolgende, springende, vliegende of schietende vijanden om ze uit te schakelen. Een vaste stekelwachter (`sentry`) is gevaarlijk van boven; onkwetsbaarheid kan ook die vijand verslaan. Schild vangt één treffer op; onkwetsbaarheid voorkomt alle contactschade maar geen afgrondverlies. Turbo = 1,45× snelheid; hoge sprong = 1,27× impuls. Power-upduur is per object instelbaar en zichtbaar in de HUD.

Pauze en een verloren browserfocus stoppen de simulatie en timer. Voltooien stopt de timer. Records zijn onafhankelijk: hoogste score, snelste succesvolle tijd, meeste munten, voltooid en geheim ontdekt. Opslag is per browser én website-origin. Blokkeren of wissen van browseropslag kan records verwijderen; de game blijft in-memory werken en meldt opslagproblemen.
