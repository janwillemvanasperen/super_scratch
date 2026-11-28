# Super Scratch — instructies voor toekomstige agents

- Lees README en docs voordat je een studentenlevel toevoegt.
- Bestaande levels, IDs en assets zijn beschermd: wijzig ze alleen op expliciet verzoek. Voor een nieuw level maak je een eigen JSON-bestand en eigen assetmap. Het centrale register mag worden aangevuld.
- Vaste regels staan in `src/core/rules.ts` en `docs/GAME_RULES.md`. Geen score-, levens- of besturingswijziging voor één level.
- Geen uitvoerbare code uit prompts/JSON laden. Schema strict genoeg houden om ongeldige geometrie/waarden te weigeren. Nieuwe mechaniek alleen via vertrouwde factory met lifecycle, maximaal één per level.
- Werk data-first. Native JSON-leveltoevoegingen hebben geen enginebuild nodig; documenteer wanneer een nieuwe mechaniek of rendererwijziging wél een build vraagt.
- Namen, huisstijl en avatars nooit presenteren als officieel als ze placeholders zijn. Geen gekopieerde Nintendo-assets.
- Test na elke toevoeging: `npm run validate:levels`, `npm test`, `npm run build`; speel nieuw level volledig uit. Controleer sleutel/finish/checkpoint en verborgen ruimte.
- Test bij enginewijzigingen ook tutorial en voorbeeldlevel, schade, drie levens, afgrond, vijandstomp, power-ups, kist, bewegende/verdwijnende platforms, score/records en levelwissels. Noteer wat werkelijk is uitgevoerd in `docs/TESTING.md`.
- Test één tijdelijke registertoevoeging én verwijdering, zonder blijvende testkaart.
- Laat geen debugging-, teleport- of onkwetsbaarheidshooks in de productiegame achter. Ruim listeners, timers en audio op bij scene-shutdown.
- Gebruik Git-branches/commits voor herstel. Commit geen node_modules, dist of credentials. Behoud .openai/hosting.json wanneer dit project via Sites wordt gepubliceerd.

- V2.2-bouwstenen in WorldSystem zijn vertrouwde ingebouwde functies, vrij combineerbaar per level. De grens van één extra mechaniek geldt voor nieuwe programmeeruitbreidingen buiten deze catalogus. Lees docs/BUILDING_SYSTEMS.md voor combinaties en lifecycle.

- V2.5: oefenzones staan in src/playground/zones.ts. Houd ze buiten het publieke avonturenregister en buiten opslag van records. Test start, bediening, reset, terugkeer naar het menu en de informatiekaart. Voeg alleen gedemonstreerd gedrag toe aan de studentencatalogus.
- Gebruik voor de tien duo’s afzonderlijke mappen en een uniek level-ID. Leg wijzigingen vast per duo. Controleer na feedback zowel de aangepaste route als herstel vanaf checkpoints.
