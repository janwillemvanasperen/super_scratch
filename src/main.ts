import { makeZone, zones, type Card } from './playground/zones';
import Phaser from 'phaser';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';
import '@fontsource/press-start-2p/latin-400.css';
import './style.css';
import { loadLevels } from './levels/registry';
import type { Level } from './levels/schema';
import { Records } from './storage/records';
import { AudioEngine } from './audio/audio';
import { GameScene } from './scenes/GameScene';
import type { Run } from './core/rules';
import { assetUrl, imageAsset } from './assets/catalog';
import { startVisualIntro } from './assets/intro';
const root = document.querySelector<HTMLDivElement>('#app')!;
const audio = new AudioEngine(),
  records = new Records();
let levels: Level[] = [],
  game: Phaser.Game | null = null,
  scene: GameScene | null = null,
  current: Level | null = null,
  errors: string[] = [];
let practiceId: string | undefined;
let stopIntro: (() => void) | undefined;
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const fmt = (n: number) => n.toLocaleString('nl-NL');
const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function button(label: string, action: string, cls = '') {
  return `<button class="${cls}" data-action="${action}">${label}</button>`;
}
function avatar(color: string, src?: string) {
  return `<span class="avatar" style="--avatar:${color}"><i></i>${src ? `<img data-fallback src="${esc(src)}" alt="" loading="lazy">` : ''}</span>`;
}
function makers(l: Level) {
  return `<div class="makers">${l.makers.map((m) => `${avatar(m.avatar, imageAsset(l, m.avatarAsset)?.type === 'image' ? assetUrl(imageAsset(l, m.avatarAsset)!.src) : undefined)}<span>${esc(m.name)}</span>`).join('')}</div>`;
}
function art(
  l?: Level,
  large = false,
  kind: 'card' | 'story' | 'completion' = large ? 'story' : 'card',
) {
  const fallback = standardArt(l, large),
    asset = l ? imageAsset(l, l.presentation?.[kind]) : undefined;
  if (!asset || asset.type !== 'image') return fallback;
  return (
    '<div class="asset-figure ' +
    (large ? 'large' : '') +
    '">' +
    fallback +
    '<img data-fallback src="' +
    esc(assetUrl(asset.src)) +
    '" alt="' +
    esc(l!.name) +
    '" loading="lazy" decoding="async"></div>'
  );
}
function standardArt(l?: Level, large = false) {
  return `<div class="world-art ${large ? 'large' : ''}" style="--sky:${l?.palette.sky || '#bce8e5'};--far:${l?.palette.far || '#7fc7bb'};--near:${l?.palette.near || '#41988b'};--accent:${l?.palette.accent || '#f9ce72'}"><div class="sun"></div><div class="cloud one"></div><div class="cloud two"></div><div class="mountains far"></div><div class="mountains near"></div><div class="ruin"></div><div class="island a"></div><div class="island b"></div><div class="coin c1">✦</div><div class="coin c2">✦</div><div class="coin c3">✦</div><div class="pixel-hero"><i></i></div><div class="flag"></div><div class="flowers">▪ ▪ ▪</div><div class="soil"></div>${large ? `<div class="world-tag"><span class="live-dot"></span> ${l?.tutorial ? 'OEFENWERELD' : 'WERELD 01'} <b>${esc(l?.name || 'THE FIRST ADVENTURE')}</b></div>` : ''}</div>`;
}
function shell(content: string, active = '') {
  audio.start();
  root.innerHTML = `<div class="shell"><header><a href="#" class="brand" data-action="home"><span class="brand-icon">S<span>✦</span></span><span>SUPER SCRATCH<small>GROTE IDEEËN. KLEINE PIXELS.</small></span></a><nav>${button('Ontdek de levels', 'levels', active === 'levels' ? 'nav-active' : '')}${button('Hoe speel je?', 'tutorial')}${button('♫', 'sound', 'sound-toggle')}</nav></header>${content}<footer><span><b>SCRATCH</b> <span class="divider">/</span> MBO UTRECHT</span><span>Gemaakt om te spelen. Ontworpen om te maken.</span><span class="footer-status"><i></i> PLAYER ONE, READY?</span></footer></div>`;
  bind();
}
function clean() {
  stopIntro?.();
  stopIntro = undefined;
  window.scrollTo(0, 0);
  audio.stop();
  if (game) {
    game.destroy(true);
    game = null;
    scene = null;
  }
  current = null;
  practiceId = undefined;
}
function home() {
  clean();
  shell(
    `<main class="home"><div class="hero-copy"><div class="eyebrow"><span></span> EEN NIEUW AVONTUUR BEGINT BIJ JOU</div><h1>SUPER<br><span>SCRATCH</span><em>Jouw wereld. Jouw avontuur.</em></h1><p>Spring in een wereld vol verrassingen.<br>Verzamel munten, ontdek geheimen en speel<br class="desktop"> de levels van de makers van morgen.</p><div class="hero-buttons">${button('Spelen <span>→</span>', 'levels', 'primary')}${button('Eerst even oefenen', 'tutorial', 'secondary')}${button('Super Scratch Playground', 'playground', 'secondary')}</div><div class="hero-meta"><span><b>01</b> SPEEL</span><span><b>02</b> ONTDEK</span><span><b>03</b> MAAK</span></div></div><div class="hero-world">${art(undefined, true)}<div class="floating-label">+100 <span>ELK IDEE TELT</span></div><span class="corner-label">100% ORIGINEEL · 8-BIT AVONTUUR</span></div></main><section class="home-bottom"><div><span class="tiny">KLAAR VOOR DE VOLGENDE SPRONG?</span><h2>Kleine pixels. Eindeloze mogelijkheden.</h2></div><div class="quick-links">${button('<span>♜</span> Mijn records <b>↗</b>', 'records')}${button('<span>☷</span> Instellingen <b>↗</b>', 'settings')}${button('<span>✦</span> Over Super Scratch <b>↗</b>', 'about')}</div></section>`,
  );
}
function levelMenu(query = '', difficulty = 'Alle') {
  clean();
  const shown = levels.filter(
    (l) =>
      !l.tutorial &&
      l.name.toLowerCase().includes(query.toLowerCase()) &&
      (difficulty === 'Alle' || l.difficulty === difficulty),
  );
  shell(
    `<main class="page"><div class="eyebrow">KIES JE VOLGENDE AVONTUUR</div><div class="page-heading"><div><h1>Een wereld aan <span>ideeën.</span></h1><p>Elk level een eigen verhaal. Welke ontdek jij vandaag?</p></div>${button('↗ Speel de tutorial', 'tutorial', 'secondary')}</div><div class="filters"><input id="search" type="search" aria-label="Zoek een level" placeholder="Zoek een level…" value="${esc(query)}"><select id="difficulty" aria-label="Moeilijkheid">${['Alle', 'Easy', 'Medium', 'Hard'].map((d) => `<option ${d === difficulty ? 'selected' : ''}>${d}</option>`).join('')}</select><span>${shown.length} ${shown.length === 1 ? 'wereld' : 'werelden'} om te ontdekken</span></div><div class="level-grid">${
      shown
        .map((l) => {
          const r = records.data[l.id];
          return `<article class="level-card">${art(l)}<div class="card-body"><div class="card-meta"><span class="badge">${l.difficulty}</span><span>${r?.completed ? '✓ Voltooid' : 'NOG TE ONTDEKKEN'}</span></div><h2>${esc(l.name)}</h2>${l.demo ? '<p class="demo-label">VOORBEELDLEVEL</p>' : ''}${makers(l)}<div class="card-record"><span>Persoonlijk record</span><b>${r ? fmt(r.score) : '—'} <small>PTS</small></b></div>${button('Ontdek dit level <span>→</span>', `intro:${l.id}`, 'primary')}</div></article>`;
        })
        .join('') || '<p>Geen levels gevonden. Probeer een andere zoekterm.</p>'
    }</div>${errors.length ? '<p class="notice">Een of meer levelbestanden zijn ongeldig en zijn overgeslagen. Zie de browserconsole voor details.</p>' : ''}<p class="storage-note">⌁ Records blijven bewaard in deze browser. Geen account nodig.${records.available ? '' : ' Opslag is niet beschikbaar; records gelden alleen tijdens deze sessie.'}</p></main>`,
    'levels',
  );
  let timer: ReturnType<typeof setTimeout>;
  document.querySelector('#search')?.addEventListener('input', (e) => {
    clearTimeout(timer);
    const input = e.target as HTMLInputElement;
    timer = setTimeout(() => {
      const pos = input.selectionStart;
      levelMenu(input.value, (document.querySelector('#difficulty') as HTMLSelectElement).value);
      const next = document.querySelector<HTMLInputElement>('#search')!;
      next.focus();
      try {
        next.setSelectionRange(pos, pos);
      } catch {}
    }, 200);
  });
  document
    .querySelector('#difficulty')
    ?.addEventListener('change', (e) =>
      levelMenu(
        (document.querySelector('#search') as HTMLInputElement).value,
        (e.target as HTMLSelectElement).value,
      ),
    );
}
function intro(l: Level) {
  clean();
  current = l;
  shell(
    `<main class="page intro"><div>${button('← Alle levels', 'levels', 'back')}${art(l, true)}</div><div class="story"><div class="eyebrow">${l.tutorial ? 'DE EERSTE STAPPEN' : 'HET AVONTUUR WACHT'} <span class="badge">${l.difficulty}</span></div><h1>${esc(l.name)}</h1>${makers(l)}<p>${esc(l.story)}</p><div class="mission"><span>JOUW MISSIE</span><p>${esc(l.goal)}</p></div><p class="instructions">${esc(l.instructions || '← → lopen · Spatie springen · ↑ interactie · ↓ oppakken')}</p>${button('Start level <span>→</span>', `start:${l.id}`, 'primary')}<small>Je speelt als ${esc(l.character.name)} · Richttijd ${l.targetTime} seconden</small></div></main>`,
  );
}
function launch(l: Level) {
  if (!l.presentation?.intro) {
    play(l);
    return;
  }
  clean();
  current = l;
  shell(
    '<main class="page intro-player"><div class="eyebrow">' +
      esc(l.name) +
      '</div><canvas id="visual-intro" aria-label="Visuele levelintroductie"></canvas>' +
      button('Overslaan →', 'play-now:' + l.id, 'primary') +
      '</main>',
  );
  stopIntro = startVisualIntro(document.querySelector<HTMLCanvasElement>('#visual-intro')!, l, () =>
    play(l),
  );
}
function cardDetails(cards: readonly Card[]) {
  return cards
    .map(
      ([name, effect, choice, combo, limit, idea]) =>
        '<details class="building-card"><summary>' +
        esc(name) +
        '</summary><p>' +
        esc(effect) +
        '</p><dl>' +
        [
          ['Jouw keuze', choice],
          ['Combineer met', combo],
          ['Let op', limit],
          ['Ontwerpidee', idea],
        ]
          .map(([label, text]) => '<div><dt>' + label + '</dt><dd>' + esc(text) + '</dd></div>')
          .join('') +
        '</dl></details>',
    )
    .join('');
}
function playground() {
  clean();
  shell(
    `<main class="page playground"><div class="page-heading"><div><h1>Super Scratch <span>Playground</span></h1><p>Kies een oefenzone. Probeer de bouwstenen uit en ontdek wat je ermee kunt maken.</p><p>Onbeperkte levens · Geen tijdslimiet · Geen records</p></div>${button('← Startscherm', 'home', 'secondary')} </div><div class="practice-grid">${zones.map((z, i) => `<article class="practice-card"><small>Zone ${i + 1}</small><h2>${esc(z.title)}</h2><p>${esc(z.instruction)}</p>${button('Start oefenzone →', 'zone:' + z.id, 'primary')}<div class="building-list">${cardDetails(z.cards)}</div></article>`).join('')} </div></main>`,
  );
}
function openZone(id: string) {
  const zone = zones.find((z) => z.id === id);
  if (zone) play(makeZone(zone), id);
}
function play(l: Level, zoneId?: string) {
  if (current?.id === l.id) scene?.mechanic?.event({ type: 'restart' });
  clean();
  current = l;
  practiceId = zoneId;
  const zone = zones.find((z) => z.id === zoneId);
  const practiceActions = zone
    ? button('Herstart zone', 'zone:' + zone.id, 'secondary') +
      button('← Playground', 'playground', 'text-button')
    : '';
  root.innerHTML = `<div class="play-shell"><div class="play-top"><a class="brand" href="#" data-action="home">SUPER SCRATCH</a><span>${esc(l.name)}</span>${practiceActions}${button('Ⅱ Pauze', 'pause')}</div><div class="game-wrap"><div id="hud" aria-live="off"></div><div id="game"></div><div id="hint">De wereld wordt geladen…</div><div id="overlay"></div></div><div class="controls"><span><kbd>←</kbd><kbd>→</kbd> Lopen</span><span><kbd>SPATIE</kbd> Springen</span><span><kbd>↑</kbd> Interactie${l.objects.some((o) => o.ladder || o.water) ? ' / klimmen / zwemmen' : ''}</span><span><kbd>↓</kbd> Oppakken${l.objects.some((o) => o.carry?.throwable) ? ' · ↓ + Spatie: gooien' : ''}</span><span><kbd>ESC</kbd> Pauze</span></div>${zone ? `<section class="practice-reference"><h2>Bouwstenen in deze zone</h2><p>${esc(zone.instruction)}</p>${cardDetails(zone.cards)}</section>` : ''}</div>`;
  bind();
  scene = new GameScene(l, audio, {
    hud: updateHud,
    pause: pause,
    finish: zone
      ? () =>
          overlay('<h1>Gelukt!</h1><p>Je hebt deze demonstratie afgerond.</p>' + practiceActions)
      : finish,
    over: () =>
      overlay(
        '<div class="eyebrow">ELK AVONTUUR HEEFT EEN NIEUW BEGIN</div><h1>Game over.</h1><p>Haal even adem. Je volgende poging wacht.</p>' +
          button('Opnieuw proberen', `start:${l.id}`, 'primary') +
          button('Naar de levels', 'levels', 'secondary'),
      ),
  });
  scene.practice = !!zone;
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 960,
    height: 540,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: l.palette.sky,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [scene],
    audio: { noAudio: true },
    banner: false,
    loader: { maxParallelDownloads: 4 },
  });
}
function updateHud(
  run: Run,
  powers: Record<string, number>,
  message: string,
  oxygen?: { remaining: number; total: number },
  objectives?: string[],
) {
  const el = document.querySelector('#hud');
  if (!el) return;
  el.innerHTML = `<div><span class="hud-label">GEZONDHEID</span><b class="hearts">${'♥'.repeat(run.hearts)}<span>${'♡'.repeat(3 - run.hearts)}</span></b></div><div><span class="hud-label">LEVENS</span><b>${practiceId ? '∞' : '× ' + run.lives}</b></div><div><span class="hud-label">MUNTEN</span><b class="gold">● ${String(run.coins).padStart(2, '0')}</b></div><div><span class="hud-label">SCORE</span><b>${String(run.score).padStart(6, '0')}</b></div>${practiceId ? '' : `<div><span class="hud-label">TIJD</span><b>${time(run.seconds)}</b></div>`}<div class="power-hud">${run.keys.size ? '⚿ ' : ''}${Object.entries(
    powers,
  )
    .map(
      ([key, t]) =>
        `${({ shield: 'Schild', jump: 'Sprong', speed: 'Turbo', invincible: 'Ster' } as Record<string, string>)[key]} ${Math.ceil(t)}s`,
    )
    .join(
      ' · ',
    )}${oxygen ? '<span class="oxygen">Zuurstof ' + Math.ceil(oxygen.remaining) + 's <meter min="0" max="' + oxygen.total + '" value="' + oxygen.remaining + '" aria-label="Zuurstof"></meter></span>' : ''}</div>`;
  if (objectives?.length)
    el.insertAdjacentHTML(
      'beforeend',
      '<div class="objective-hud">' +
        objectives.map((text) => '<span>' + esc(text) + '</span>').join('') +
        '</div>',
    );
  document.querySelector('#hint')!.textContent = message;
}
function overlay(html: string) {
  document.querySelector('#overlay')!.innerHTML =
    `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true">${html}</section></div>`;
  bind();
  (document.querySelector('#overlay button') as HTMLButtonElement)?.focus();
}
function pause() {
  if (!scene || scene.paused) return;
  scene.setPaused(true);
  overlay(
    `<div class="eyebrow">EVEN OP ADEM KOMEN</div><h1>Op pauze.</h1><p>Jouw avontuur loopt niet weg.</p>${button('Verder spelen →', 'resume', 'primary')}${button('Instellingen', 'game-settings', 'secondary')}${practiceId ? button('Herstart zone', 'zone:' + practiceId, 'secondary') + button('← Playground', 'playground', 'text-button') : button('Opnieuw beginnen', `start:${current!.id}`, 'secondary') + button('Naar het levelmenu', 'levels', 'text-button')}`,
  );
}
function settings(inGame = false) {
  const content = `<div class="eyebrow">MAAK HET JOUW AVONTUUR</div><h1>Instellingen</h1><label class="setting">Achtergrondmuziek <input id="music" type="checkbox" ${audio.music ? 'checked' : ''}></label><label class="setting">Geluidseffecten <input id="sfx" type="checkbox" ${audio.sfx ? 'checked' : ''}></label><label class="setting">Volume muziek <input id="musicVolume" type="range" min="0" max="1" step=".01" value="${audio.musicVolume}" aria-label="Volume muziek"></label><label class="setting">Volume effecten <input id="effectsVolume" type="range" min="0" max="1" step=".01" value="${audio.effectsVolume}" aria-label="Volume effecten"></label><p>← → lopen · Spatie springen · ↑ interactie<br>↓ voorwerp oppakken of neerzetten · Escape pauzeren</p>${button(inGame ? 'Verder spelen' : 'Terug naar start', inGame ? 'resume' : 'home', 'primary')}`;
  if (inGame) overlay(content);
  else {
    clean();
    shell(`<main class="page narrow">${content}</main>`);
  }
  for (const key of ['music', 'sfx', 'musicVolume', 'effectsVolume'] as const)
    document.querySelector(`#${key}`)!.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      if (key === 'musicVolume' || key === 'effectsVolume') audio[key] = Number(input.value);
      else audio[key] = input.checked;
      audio.save();
      // Volume changes update the existing playback; do not restart loaded music.
    });
}
function finish(run: Run) {
  const l = current!,
    isNew = records.save(l.id, run);
  const extraRewards = l.objects.some((o) => o.chest || o.npc || o.trigger || o.portal?.secret);
  overlay(
    `<div class="completion-art">${l.presentation?.completion ? art(l, false, 'completion') : ''}</div><div class="confetti">✦ · ✧ · ✦ · ✧</div><div class="eyebrow">${isNew ? 'NIEUW PERSOONLIJK RECORD!' : 'AVONTUUR VOLTOOID!'}</div><h1>Goed gespeeld.</h1><div class="big-score">${fmt(run.score)} <small>PTS</small></div><div class="result-grid"><span>Munten<b>${run.coins}${extraRewards ? '' : ' / ' + l.objects.filter((o) => o.kind === 'coin').length}</b></span><span>Speeltijd<b>${time(run.seconds)}</b></span><span>Vijanden<b>${run.kills}</b></span><span>Geheimen<b>${run.secrets}${extraRewards ? '' : ' / ' + l.objects.filter((o) => o.kind === 'secret').length}</b></span><span>Hartjes<b>${'♥'.repeat(run.hearts)}</b></span><span>Levens<b>${run.lives}</b></span></div>${!records.available ? '<p>Let op: je browser kan dit record niet blijvend opslaan.</p>' : ''}${button('Opnieuw spelen', `start:${l.id}`, 'primary')}${button('Een ander level spelen', `next:${l.id}`, 'secondary')}${button('Terug naar het levelmenu', 'levels', 'text-button')}`,
  );
}
function showRecords() {
  clean();
  shell(
    `<main class="page narrow"><div class="eyebrow">JOUW PERSOONLIJKE BESTE</div><h1>Mijn records</h1><p>Records zijn gekoppeld aan deze browser en dit apparaat.</p>${levels
      .map((l) => {
        const r = records.data[l.id];
        return `<div class="record-row"><div><h2>${esc(l.name)}</h2><p>${r ? `${time(r.time)} · ${r.coins} munten · ${r.secret ? 'Geheim ontdekt' : 'Geheim nog te ontdekken'}` : 'Nog geen succesvolle poging'}</p></div><b>${r ? fmt(r.score) : '—'}</b>${button('Spelen', `intro:${l.id}`, 'secondary')}</div>`;
      })
      .join('')}${button('Terug naar start', 'home', 'primary')}</main>`,
  );
}
function about() {
  clean();
  shell(
    `<main class="page narrow"><div class="eyebrow">VAN IDEE NAAR PIXEL</div><h1>Iedereen kan<br><span>werelden maken.</span></h1><p>Super Scratch is een platformgame voor Scratch, de opleiding Marketing & Communicatie van MBO Utrecht. Studenten ontwerpen in duo’s een eigen wereld met prompts, schetsen en ideeën.</p><p>De basis bevat een tutorial en een voorbeeldavontuur. Nieuwe studentenlevels verschijnen hier zodra ze zijn toegevoegd en getest. Er zijn geen verzonnen studenten of lege levelkaarten.</p><p>Alle personages, pixelbeelden en chiptunes zijn origineel. De tekstvermelding Scratch / MBO Utrecht en de kleuren zijn tijdelijke huisstijlelementen; dit is geen officieel logo.</p>${button('Ontdek de levels', 'levels', 'primary')}</main>`,
  );
}
function bind() {
  document.querySelectorAll<HTMLImageElement>('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => img.remove(), { once: true });
    if (img.complete && img.naturalWidth === 0) img.remove();
  });
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((el) => {
    el.onclick = (e) => {
      e.preventDefault();
      audio.unlock();
      const [action, id] = el.dataset.action!.split(':');
      const l = levels.find((l) => l.id === id);
      if (action === 'home') {
        home();
        audio.start();
      } else if (action === 'levels') levelMenu();
      else if (action === 'playground') playground();
      else if (action === 'zone' && id) openZone(id);
      else if (action === 'tutorial') {
        const tutorial = levels.find((l) => l.tutorial);
        if (tutorial) intro(tutorial);
      } else if (action === 'intro' && l) intro(l);
      else if (action === 'start' && l) launch(l);
      else if (action === 'play-now' && l) play(l);
      else if (action === 'records') showRecords();
      else if (action === 'settings') settings();
      else if (action === 'about') about();
      else if (action === 'pause') pause();
      else if (action === 'resume') {
        document.querySelector('#overlay')!.innerHTML = '';
        scene?.setPaused(false);
        document.querySelector('canvas')?.focus();
      } else if (action === 'game-settings') settings(true);
      else if (action === 'next') {
        const candidates = levels.filter((x) => !x.tutorial && x.id !== id);
        if (candidates[0]) intro(candidates[0]);
        else levelMenu();
      } else if (action === 'sound') {
        audio.music = !audio.music;
        audio.save();
        el.textContent = audio.music ? '♫' : '♪ Uit';
        audio.refresh();
      }
    };
  });
}
root.innerHTML =
  '<div class="loading"><span>✦</span><h1>SUPER SCRATCH</h1><p>Je avontuur wordt klaargezet…</p></div>';
loadLevels()
  .then((result) => {
    levels = result.levels;
    errors = result.errors;
    if (errors.length) console.warn('Overgeslagen levels:', errors);
    home();
  })
  .catch((e) => {
    root.innerHTML = `<div class="loading"><h1>Even geen verbinding</h1><p>${esc(String(e))}</p><button onclick="location.reload()">Opnieuw laden</button></div>`;
  });
