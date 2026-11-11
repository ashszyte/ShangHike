// Shang Hike — app logic (views, sessions, rewards, 3D world hookup).
(function () {
  const D = window.HSK_DATA;
  const W = {};
  D.forEach(l => l.words.forEach(w => { W[w.id] = w; }));
  const G = window.SH_GRAMMAR || [];
  const GID = {}; G.forEach(g => { GID[g.id] = g; });
  Store.load();
  const S = () => Store.s;

  // ---- migrate older saves ----
  (function migrate() {
    const h = S().hiker;
    if (h) {
      if (['a', 'b', 'c'].includes(h.base)) h.base = { a: 'short', b: 'pony', c: 'bun' }[h.base];
      if (h.hair == null) h.hair = 0;
      if (!h.jacket) h.jacket = 'cobalt';
    }
    S().grammarDone = S().grammarDone || {};
    Store.save();
  })();

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const view = $('#view');
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const ICON = {
    speak: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    mic: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="10" r="3" fill="currentColor"/><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    check: `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  };

  // ---------- Progress helpers ----------
  const lv = l => D[l - 1];
  const lkey = (l, n) => `${l}-${n}`;
  const lessonState = (l, n) => { const v = S().lessonsDone[lkey(l, n)]; return v ? (v === 'skip' ? 'skip' : 'done') : null; };
  const levelUnlocked = l => S().unlockedLevels.includes(l);
  function lessonStatus(l, n) {
    const st = lessonState(l, n);
    if (st) return st;
    if (!levelUnlocked(l)) return 'locked';
    if (n === 1 || lessonState(l, n - 1)) return 'current';
    return 'locked';
  }
  function descentState(l) {
    if (S().descended[l]) return 'done';
    return levelUnlocked(l) && lv(l).lessons.every(L => lessonState(l, L.n)) ? 'ready' : 'locked';
  }
  const lessonWords = (l, n) => lv(l).lessons[n - 1].words.map(id => W[id]);
  const learnedCount = ids => ids.filter(id => Store.isLearned(id)).length;
  function currentLesson() {
    for (let l = 3; l >= 1; l--) {
      if (!levelUnlocked(l)) continue;
      const L = lv(l).lessons.find(x => lessonStatus(l, x.n) === 'current');
      if (L) return { l, n: L.n };
      if (descentState(l) === 'ready') return { l, descent: true };
    }
    return null;
  }
  function hikerAt() {
    const l = Math.max(...S().unlockedLevels);
    const n = lv(l).lessons.length;
    let k = 0;
    while (k < n && lessonState(l, k + 1)) k++;
    if (k === 0) return l > 1 && S().descended[l - 1] ? { l: l - 1, node: 'camp' } : { l, node: -1 };
    if (k === n) return S().descended[l] ? { l, node: 'camp' } : { l, node: 'summit' };
    return { l, node: k - 1 };
  }
  function weekInfo() {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      return { key: Store.dayKey(d.getTime()), label: 'MTWTFSS'[i], today: i === dow };
    });
    return { days, active: days.filter(d => S().activeDays.includes(d.key)).length, goal: S().settings.weeklyGoal };
  }
  const grammarFor = (l, n) => G.filter(g => g.lv === l && g.ls === n);

  // ---------- 3D world ----------
  const canvas = $('#world'), labelsEl = $('#labels');
  let world = null;
  const DEFAULT_HIKER = { base: 'short', skin: 0, hair: 0, jacket: 'cobalt' };
  function startWorld() {
    if (world || !window.World) return;
    try {
      if (window.World.init(canvas, D.map(l => l.lessons.length))) {
        world = window.World;
        world.setHiker(S().hiker || DEFAULT_HIKER, S().equipped);
        route();
      }
    } catch (e) { console.warn('3D unavailable', e); }
  }
  window.addEventListener('world-loaded', startWorld);
  function hikerPic(size, eq, h) {
    h = h || S().hiker || DEFAULT_HIKER; eq = eq || S().equipped;
    if (world) {
      try { const url = world.portrait(h, eq, 240, 300); if (url) return `<img class="hiker-img" src="${url}" width="${size}" height="${Math.round(size * 1.25)}" alt="">`; } catch (e) { /* fall back */ }
    }
    const base2d = { short: 'a', long: 'b', pony: 'b', bun: 'c' }[h.base] || 'a';
    return Art.hiker({ base: base2d, skin: Math.min(2, h.skin || 0) }, eq, { size });
  }
  function worldProgress(prevAt) {
    return {
      levels: [1, 2, 3].map(l => ({ unlocked: levelUnlocked(l), status: lv(l).lessons.map(L => lessonStatus(l, L.n)), descent: descentState(l) })),
      at: hikerAt(), prevAt
    };
  }

  // ---------- UI helpers ----------
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.className = 'show';
    clearTimeout(t._h); t._h = setTimeout(() => { t.className = ''; }, 2600);
  }
  const modal = $('#modal');
  function openModal(html, onMount) {
    modal.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
    modal.hidden = false;
    document.body.classList.add('noscroll');
    onMount && onMount(modal.firstElementChild);
    const f = modal.querySelector('[data-autofocus]') || modal.querySelector('button');
    f && f.focus();
  }
  function closeModal() { modal.hidden = true; modal.innerHTML = ''; document.body.classList.remove('noscroll'); if (modal._onClose) { const f = modal._onClose; modal._onClose = null; f(); } }
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  const clean = t => String(t).replace(/[（）()]/g, '');
  function say(text) { Audio2.speak(clean(text), S().settings.rate); }
  const pyHTML = py => `<span class="py">${Pinyin.toneHTML(py)}</span>`;

  function renderTabs(active, hidden) {
    const tabs = $('#tabs');
    if (hidden) { tabs.hidden = true; return; }
    tabs.hidden = false;
    const due = Store.dueIds().length;
    const item = (href, key, label, icon, badge) => `<a href="${href}" class="${active === key ? 'on' : ''}" ${active === key ? 'aria-current="page"' : ''}>
      ${icon}<span>${label}</span>${badge ? `<b class="badge">${badge > 99 ? '99+' : badge}</b>` : ''}</a>`;
    tabs.innerHTML =
      item('#/', 'home', 'Mountain', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M2 20 L9 7 L13 13 L16 9 L22 20Z" fill="currentColor"/></svg>`) +
      item('#/cards', 'cards', 'Flashcards', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="6" width="14" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12" fill="none" stroke="currentColor" stroke-width="2"/></svg>`, due) +
      item('#/grammar', 'grammar', 'Grammar', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 4h10l4 4v12H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 12h8M8 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`) +
      item('#/hiker', 'hiker', 'Hiker', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="7" r="4" fill="currentColor"/><path d="M4 21c0-5 4-8 8-8s8 3 8 8" fill="currentColor"/></svg>`) +
      item('#/settings', 'settings', 'Settings', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`);
  }

  // ---------- Router ----------
  let cleanup = null;
  function route() {
    if (cleanup) { const c = cleanup; cleanup = null; c(); }
    modal._onClose = null; closeModal();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    document.body.classList.remove('map-mode');
    if (world) world.setMode('off');
    const h = location.hash.replace(/^#\/?/, '');
    const p = h.split('/').filter(Boolean);
    if (!S().hiker && p[0] !== 'welcome') { location.hash = '#/welcome'; return; }
    const num = i => parseInt(p[i], 10);
    window.scrollTo(0, 0);
    switch (p[0]) {
      case 'welcome': return viewWelcome();
      case 'lesson': return viewLesson(num(1), num(2));
      case 'learn': return viewLearn(num(1), num(2));
      case 'cards':
        if (p[1] === 'due') return viewCards('due');
        if (p[1] === 'weak') return viewCards('weak');
        if (p[1] === 'all') return viewCards('all');
        if (p[1] === 'lesson') return viewCards('lesson', num(2), num(3));
        return viewCardsHub();
      case 'weak': return viewWeak();
      case 'review': return viewCards('due');
      case 'grammar': return p[1] ? viewGrammarPoint(decodeURIComponent(p[1])) : viewGrammar();
      case 'descent': return viewDescent(num(1));
      case 'hiker': return viewHiker();
      case 'settings': return viewSettings();
      case 'level': S().viewLevel = num(1); Store.save(); return viewHome();
      default: return viewHome();
    }
  }
  window.addEventListener('hashchange', route);

  // ---------- Welcome / hiker creator ----------
  const STYLES = [['short', 'Short'], ['long', 'Long'], ['pony', 'Ponytail'], ['bun', 'Bun']];
  const SKIN_CSS = ['#F5D3B5', '#E2B48F', '#C48B62', '#8E5E3F'];
  const HAIR_CSS = ['#241C1F', '#3B2A20', '#6E3B22'];
  const JACKET_CSS = { cobalt: '#2F5DA8', sage: '#5E8F82', ivory: '#EDE6D6', red: '#B8283C' };
  function creatorHTML(h) {
    return `<div class="stage3d" id="stage3d">${world ? '' : hikerPic(150, {}, h)}</div>
      <p class="fine center">${world ? 'Drag to turn your hiker around.' : ''}</p>
      <div class="opt-group"><span class="opt-label">Hair</span><div class="pick-row" role="radiogroup" aria-label="Hair style">${STYLES.map(([k, label]) => `<button class="pick ${h.base === k ? 'on' : ''}" data-base="${k}" role="radio" aria-checked="${h.base === k}">${hikerPic(46, {}, Object.assign({}, h, { base: k }))}<span>${label}</span></button>`).join('')}</div></div>
      <div class="opt-group"><span class="opt-label">Skin</span><div class="pick-row swatches" role="radiogroup" aria-label="Skin tone">${SKIN_CSS.map((c, i) => `<button class="swatch ${h.skin === i ? 'on' : ''}" style="background:${c}" data-skin="${i}" role="radio" aria-checked="${h.skin === i}" aria-label="Skin tone ${i + 1}"></button>`).join('')}</div></div>
      <div class="opt-group"><span class="opt-label">Hair color</span><div class="pick-row swatches" role="radiogroup" aria-label="Hair color">${HAIR_CSS.map((c, i) => `<button class="swatch ${h.hair === i ? 'on' : ''}" style="background:${c}" data-hair="${i}" role="radio" aria-checked="${h.hair === i}" aria-label="Hair color ${i + 1}"></button>`).join('')}</div></div>
      <div class="opt-group"><span class="opt-label">Jacket</span><div class="pick-row swatches" role="radiogroup" aria-label="Jacket color">${Object.entries(JACKET_CSS).map(([k, c]) => `<button class="swatch ${h.jacket === k ? 'on' : ''}" style="background:${c}" data-jacket="${k}" role="radio" aria-checked="${h.jacket === k}" aria-label="${k} jacket"></button>`).join('')}</div></div>`;
  }
  function wireCreator(h, onChange) {
    const set = (k, v) => { h[k] = v; onChange(); };
    $$('[data-base]').forEach(b => b.onclick = () => set('base', b.dataset.base));
    $$('[data-skin]').forEach(b => b.onclick = () => set('skin', +b.dataset.skin));
    $$('[data-hair]').forEach(b => b.onclick = () => set('hair', +b.dataset.hair));
    $$('[data-jacket]').forEach(b => b.onclick = () => set('jacket', b.dataset.jacket));
  }
  function startStudio(h, eq) {
    if (!world) return;
    world.setHiker(h, eq);
    const el = $('#stage3d');
    if (el) world.setMode('studio', { el });
  }

  function viewWelcome() {
    renderTabs(null, true);
    const draft = Object.assign({}, DEFAULT_HIKER, { name: '' });
    let step = 0;
    const paint = () => {
      if (world) world.setMode('off');
      if (step === 0) {
        view.innerHTML = `<section class="welcome">
          <div class="brand-big"><span class="seal">上</span><h1>Shang Hike</h1></div>
          <p class="lede">Climb the new HSK, one peak at a time.<br><em>It's only up from here.</em></p>
          <ul class="how">
            <li><b>HSK 1, 2 and 3 are three mountains,</b> each higher than the last. Every textbook lesson is a checkpoint on the trail.</li>
            <li><b>Learn the words, then flashcards.</b> Cards come back right before you'd forget them; the ones you don't know go to your Weak words deck.</li>
            <li><b>Plant a flag at every checkpoint</b> and collect a Chinese food card. The teahouse waits at each summit.</li>
            <li><b>At the top, descend:</b> review the whole mountain to reach base camp and the next, higher peak.</li>
          </ul>
          <button class="btn primary big" id="go">Create your hiker</button>
          <p class="fine">Your progress is saved in this browser. No account needed.</p>
        </section>`;
        $('#go').onclick = () => { step = 1; paint(); };
      } else if (step === 1) {
        view.innerHTML = `<section class="welcome creator"><h2>Who's hiking?</h2>${creatorHTML(draft)}
          <label class="field">Name (optional)<input id="nm" maxlength="20" value="${esc(draft.name)}" placeholder="e.g. 小龙"></label>
          <button class="btn primary big" id="next">Next</button></section>`;
        wireCreator(draft, () => { draft.name = $('#nm').value; paint(); });
        startStudio(draft, {});
        $('#next').onclick = () => { draft.name = $('#nm').value.trim(); step = 2; paint(); };
      } else {
        view.innerHTML = `<section class="welcome">
          <h2>Where do you start?</h2>
          <div class="choice-list">
            <button class="choice" data-start="1-1"><b>From the trailhead</b><span>HSK 1, Lesson 1</span></button>
            <button class="choice" data-start="pick"><b>I already know some</b><span>Pick a level and lesson to start from</span></button>
          </div>
          <div id="pickbox" hidden>${placementPicker()}<button class="btn primary big" id="startpick">Start here</button></div>
        </section>`;
        const finish = (l, n) => {
          S().hiker = { base: draft.base, skin: draft.skin, hair: draft.hair, jacket: draft.jacket, name: draft.name };
          applyPlacement(l, n);
          S().mapAt = null;
          Store.save();
          if (world) world.setHiker(S().hiker, S().equipped);
          location.hash = '#/';
        };
        $('[data-start="1-1"]').onclick = () => finish(1, 1);
        $('[data-start="pick"]').onclick = () => { $('#pickbox').hidden = false; wirePlacement(); };
        $('#startpick').onclick = () => finish(+$('#pl-l').value, +$('#pl-n').value);
      }
    };
    paint();
  }
  function placementPicker() {
    return `<div class="placement"><label class="field">Level<select id="pl-l">${[1, 2, 3].map(l => `<option value="${l}">HSK ${l}</option>`).join('')}</select></label>
      <label class="field">Lesson<select id="pl-n"></select></label></div>`;
  }
  function wirePlacement(preset) {
    const ls = $('#pl-l'), ns = $('#pl-n');
    const fill = () => { ns.innerHTML = lv(+ls.value).lessons.map(L => `<option value="${L.n}">${L.n}. ${esc(L.en)}</option>`).join(''); };
    if (preset) ls.value = preset.l;
    fill();
    if (preset) ns.value = preset.n;
    ls.onchange = fill;
  }
  function applyPlacement(l, n) {
    for (let a = 1; a <= l; a++) {
      if (!S().unlockedLevels.includes(a)) S().unlockedLevels.push(a);
      const last = a < l ? lv(a).lessons.length : n - 1;
      for (let k = 1; k <= last; k++) if (!S().lessonsDone[lkey(a, k)]) S().lessonsDone[lkey(a, k)] = 'skip';
      if (a < l && !S().descended[a]) S().descended[a] = { skip: true, at: Date.now() };
    }
    S().viewLevel = null;
  }

  // ---------- Home / Mountain ----------
  function homeCTA() {
    const due = Store.dueIds().length;
    const cur = currentLesson();
    if (due >= 5) return { label: 'Start today\'s climb', sub: `${due} flashcards due first`, href: '#/cards/due' };
    if (cur && cur.descent) return { label: 'Start the descent', sub: `Review all of HSK ${cur.l} to reach base camp`, href: `#/descent/${cur.l}` };
    if (cur) { const Ls = lv(cur.l).lessons[cur.n - 1]; return { label: 'Start today\'s climb', sub: `HSK ${cur.l} · Checkpoint ${cur.n}: ${Ls.en}`, href: `#/lesson/${cur.l}/${cur.n}` }; }
    if (due) return { label: 'Review flashcards', sub: `${due} due`, href: '#/cards/due' };
    return { label: 'Practice weak words', sub: 'You\'ve climbed everything. Keep it fresh.', href: '#/cards/weak' };
  }
  function onPick(x) {
    if (x.descent) {
      const st = descentState(x.level);
      if (st === 'locked') return toast(levelUnlocked(x.level) ? 'Reach the summit first' : `HSK ${x.level} is still locked`);
      location.hash = `#/descent/${x.level}`; return;
    }
    const st = lessonStatus(x.level, x.lesson);
    if (st === 'locked') return toast(levelUnlocked(x.level) ? `Plant flag ${x.lesson - 1} first` : `Descend HSK ${x.level - 1} to unlock this mountain`);
    location.hash = `#/lesson/${x.level}/${x.lesson}`;
  }
  function viewHome() {
    renderTabs('home');
    if (!world) return viewHomeFlat();
    document.body.classList.add('map-mode');
    const prev = S().mapAt;
    const prog = worldProgress(prev);
    world.setHiker(S().hiker, S().equipped);
    world.setMode('map', { labelsEl, onPick });
    world.setProgress(prog);
    const moved = prev && JSON.stringify(prev) !== JSON.stringify(prog.at);
    S().mapAt = prog.at; Store.save();
    const focus = S().viewLevel || prog.at.l;
    world.focus(focus, !moved);
    const wk = weekInfo();
    const cta = homeCTA();
    const due = Store.dueIds().length, weak = Store.weakIds().length;
    const name = S().hiker && S().hiker.name ? `, ${esc(S().hiker.name)}` : '';
    view.innerHTML = `<div class="map-ui">
      <header class="map-top">
        <div class="brand-pill"><span class="seal sm">上</span><span>Shang Hike</span></div>
        <div class="week glass" title="Days you studied this week">${wk.days.map(d => `<i class="${S().activeDays.includes(d.key) ? 'on' : ''} ${d.today ? 'today' : ''}" aria-label="${d.label}">${d.label}</i>`).join('')}</div>
      </header>
      <nav class="map-levels glass" aria-label="Mountains">
        ${[1, 2, 3].map(l => `<button data-focus="${l}" class="${focus === l ? 'on' : ''}">${levelUnlocked(l) ? '' : ICON.lock}HSK ${l}</button>`).join('')}
        <button data-focus="all" class="${focus === 'all' ? 'on' : ''}">All</button>
        <button data-focus="hiker" class="me" aria-label="Find my hiker">${ICON.pin}</button>
      </nav>
      <section class="map-sheet glass">
        <div class="sheet-row">
          <div><b>Hi${name}!</b><small>${wk.active}/${wk.goal} days this week${wk.active >= wk.goal ? ' · goal reached' : ''}</small></div>
          <div class="chips"><a class="chip" href="#/cards/due"><b>${due}</b> due</a><a class="chip" href="#/cards/weak"><b>${weak}</b> weak</a></div>
        </div>
        <a class="btn primary big cta" href="${cta.href}"><span>${cta.label}</span><small>${esc(cta.sub)}</small></a>
      </section>
    </div>`;
    const setIns = () => { const t = $('.map-levels'), sh = $('.map-sheet'); if (t && sh) world.setInsets(t.getBoundingClientRect().bottom, window.innerHeight - sh.getBoundingClientRect().top); };
    setIns();
    window.addEventListener('resize', setIns);
    cleanup = () => { window.removeEventListener('resize', setIns); world.setInsets(0, 0); };
    $$('[data-focus]').forEach(b => b.onclick = () => {
      const f = b.dataset.focus;
      const v = f === 'all' || f === 'hiker' ? f : +f;
      if (f !== 'hiker') { S().viewLevel = v === prog.at.l ? null : v; Store.save(); }
      world.focus(v);
      $$('[data-focus]').forEach(x => x.classList.toggle('on', x === b && f !== 'hiker'));
    });
  }
  // fallback without WebGL
  function viewHomeFlat() {
    const L = S().viewLevel || hikerAt().l;
    const cta = homeCTA();
    view.innerHTML = `<header class="top"><div class="brand"><span class="seal sm">上</span><span>Shang Hike</span></div></header>
      <a class="btn primary big cta" href="${cta.href}"><span>${cta.label}</span><small>${esc(cta.sub)}</small></a>
      <nav class="level-tabs" aria-label="Mountains">${[1, 2, 3].map(l => `<a href="#/level/${l}" class="${l === L ? 'on' : ''} ${levelUnlocked(l) ? '' : 'locked'}">${levelUnlocked(l) ? '' : ICON.lock} HSK ${l}</a>`).join('')}</nav>
      <section class="map-wrap"><div class="map-scroll" id="mapscroll">${Art.mountain(L, lv(L).lessons, n => lessonStatus(L, n), s => hikerPic(s), descentState(L))}</div></section>
      <p class="fine center">3D view isn't available in this browser.</p>`;
    $$('.mountain .peak').forEach(g => g.addEventListener('click', () => onPick(g.dataset.descent ? { level: L, descent: true } : { level: L, lesson: +g.dataset.lesson })));
  }

  // ---------- Lesson page ----------
  function viewLesson(l, n) {
    renderTabs('home');
    const Ls = lv(l) && lv(l).lessons[n - 1];
    if (!Ls) { location.hash = '#/'; return; }
    if (lessonStatus(l, n) === 'locked') { toast(`Plant flag ${n - 1} first`); location.hash = '#/'; return; }
    const words = lessonWords(l, n);
    const learned = learnedCount(words.map(w => w.id));
    const food = SH_FOODS[l][n - 1];
    const hasFood = S().foods.includes(lkey(l, n));
    const gps = grammarFor(l, n);
    const summit = n === lv(l).lessons.length;
    view.innerHTML = `<a class="back" href="#/">← Back to the mountain</a>
      <header class="lesson-head">
        <p class="kicker">HSK ${l} · Checkpoint ${n}${summit ? ' · Summit' : ''}</p>
        <h1 class="zh">${esc(Ls.zh)}</h1>
        <p class="en">${esc(Ls.en)}</p>
      </header>
      <div class="progress"><div style="width:${Math.round((learned / words.length) * 100)}%"></div></div>
      <p class="fine">${learned} of ${words.length} words learned${learned === words.length ? ' · flag planted' : ''}</p>
      <ol class="steps">
        <li class="${learned === words.length ? 'done' : 'now'}"><div><b>1. Learn the words</b><span>Meet each word, then a quick check.</span></div>
          <a class="btn ${learned < words.length ? 'primary' : ''}" href="#/learn/${l}/${n}">${learned === 0 ? 'Start' : learned < words.length ? 'Continue' : 'Again'}</a></li>
        <li class="${learned ? 'now' : 'later'}"><div><b>2. Flashcards</b><span>When you feel ready. Don't-knows go to Weak words.</span></div>
          ${learned ? `<a class="btn ${learned === words.length ? 'primary' : ''}" href="#/cards/lesson/${l}/${n}">Flashcards</a>` : `<span class="btn ghost-sm">${ICON.lock}</span>`}</li>
        ${gps.length ? `<li class="now"><div><b>3. Grammar</b><span>${gps.length} point${gps.length > 1 ? 's' : ''} on this trail.</span></div><a class="btn" href="#gram">See below</a></li>` : ''}
      </ol>
      <section class="teahouse-box ${hasFood ? '' : 'locked'}" ${hasFood ? 'role="button" tabindex="0"' : ''}>
        ${Art.plate(food.hz[0], 64, !hasFood)}
        <div>${hasFood ? `<p class="kicker">${summit ? 'Summit teahouse' : 'Checkpoint snack'}</p><p><b class="zh">${food.hz}</b> ${pyHTML(food.py)}</p><p class="fine">${esc(food.en)} · ${esc(food.region)}</p>` : `<p class="kicker">${summit ? 'Summit teahouse' : 'Checkpoint snack'}</p><p>Learn every word here to plant your flag and collect this food card.</p>`}</div>
      </section>
      ${gps.length ? `<h2 class="section-title" id="gram">Grammar</h2><div class="g-list">${gps.map(grammarCard).join('')}</div>` : ''}
      <h2 class="section-title">Words</h2>
      <ul class="word-list">${words.map(w => wordRow(w)).join('')}</ul>`;
    if (hasFood) $('.teahouse-box').onclick = () => showFood(l, n);
    const gl = $('[href="#gram"]'); if (gl) gl.onclick = e => { e.preventDefault(); $('#gram').scrollIntoView({ behavior: 'smooth' }); };
    wireWordRows();
  }
  function wordRow(w) {
    const c = S().cards[w.id];
    const st = !c ? 'new' : c.weak ? 'weak' : 'ok';
    const label = { new: 'New', weak: 'Weak', ok: 'Learned' }[st];
    return `<li class="word-row">
      <span class="st ${st}" title="${label}" aria-label="${label}"></span>
      <div class="w-main"><span class="hz">${esc(w.hz)}</span>${pyHTML(w.py)}${w.x ? '<span class="tag" title="Beyond the HSK syllabus for this level">bonus</span>' : ''}</div>
      <div class="w-en"><span class="pos">${esc(w.pos)}</span> ${esc(w.en)}</div>
      <div class="w-btns"><button class="icon-btn" data-say="${w.id}" aria-label="Play ${esc(w.hz)}">${ICON.speak}</button><button class="icon-btn" data-tone="${w.id}" aria-label="Tone practice for ${esc(w.hz)}">${ICON.mic}</button></div>
    </li>`;
  }
  function wireWordRows(root = view) {
    $$('[data-say]', root).forEach(b => b.onclick = e => { e.stopPropagation(); say(W[b.dataset.say].hz); });
    $$('[data-say-text]', root).forEach(b => b.onclick = e => { e.stopPropagation(); say(b.dataset.sayText); });
    $$('[data-tone]', root).forEach(b => b.onclick = e => { e.stopPropagation(); tonePractice(W[b.dataset.tone]); });
  }

  // ---------- Quiz questions ----------
  function distractors(w, field, count, pool) {
    const same = pool.filter(x => x.id !== w.id && x.ls === w.ls && x.lv === w.lv);
    const others = shuffle(pool.filter(x => x.id !== w.id));
    const keyOf = x => (field === 'en' ? x.en : x.hz);
    const sound = x => Pinyin.stripTones(x.py).replace(/\s/g, '');
    const seen = new Set([keyOf(w)]), sounds = new Set([sound(w)]);
    const out = [];
    for (const x of [...shuffle(same), ...others]) {
      if (seen.has(keyOf(x))) continue;
      if (field === 'hz' && sounds.has(sound(x))) continue;
      seen.add(keyOf(x)); sounds.add(sound(x));
      out.push(x);
      if (out.length >= count) break;
    }
    return out;
  }
  function makeQuestion(w, type, pool) {
    if (type === 'tones') {
      const opts = new Set([Pinyin.normalize(w.py)]);
      for (let i = 0; i < 20 && opts.size < 4; i++) { const v = Pinyin.toneVariant(w.py); if (v) opts.add(Pinyin.normalize(v)); }
      if (opts.size < 3) type = 'meaning';
      else return { w, type, prompt: 'Which tones are right?', options: shuffle([...opts]).map(o => ({ html: pyHTML(o), correct: o === Pinyin.normalize(w.py) })) };
    }
    if (type === 'meaning') {
      const ds = distractors(w, 'en', 3, pool);
      return { w, type, prompt: 'What does it mean?', options: shuffle([w, ...ds]).map(x => ({ html: esc(x.en), correct: x.id === w.id })) };
    }
    const ds = distractors(w, 'hz', 3, pool);
    return {
      w, type, prompt: type === 'listen' ? 'Which word did you hear?' : 'Which word matches?',
      options: shuffle([w, ...ds]).map(x => ({ html: `<span class="hz">${esc(x.hz)}</span>`, correct: x.id === w.id }))
    };
  }
  function questionHTML(q, idx, total) {
    const w = q.w;
    let body;
    if (q.type === 'meaning') body = `<div class="q-word"><span class="hz xl">${esc(w.hz)}</span><button class="icon-btn" data-say="${w.id}" aria-label="Play">${ICON.speak}</button></div>`;
    else if (q.type === 'tones') body = `<div class="q-word"><span class="hz xl">${esc(w.hz)}</span><button class="icon-btn" data-say="${w.id}" aria-label="Play">${ICON.speak}</button></div><p class="fine center">${esc(w.en)}</p>`;
    else if (q.type === 'listen') body = `<div class="q-word"><button class="listen-btn" data-say="${w.id}" aria-label="Play the word again">${ICON.speak}<span>Play again</span></button></div>`;
    else body = `<div class="q-word"><p class="q-en">${esc(w.en)}</p></div>`;
    return `<div class="q">
      <p class="kicker">${q.prompt}${total ? ` · ${idx + 1}/${total}` : ''}</p>
      ${body}
      <div class="options">${q.options.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd>${o.html}</button>`).join('')}</div>
      <div class="q-feedback" aria-live="polite"></div>
    </div>`;
  }
  function askQuestion(container, q, idx, total) {
    return new Promise(resolve => {
      container.innerHTML = questionHTML(q, idx, total);
      wireWordRows(container);
      if (q.type === 'listen' || (S().settings.autoplay && q.type !== 'hanzi')) setTimeout(() => say(q.w.hz), 150);
      let answered = false;
      const key1 = e => { if (/^[1-4]$/.test(e.key) && modal.hidden) choose(+e.key - 1); };
      const choose = i => {
        if (answered || !q.options[i]) return;
        answered = true;
        document.removeEventListener('keydown', key1);
        const ok = q.options[i].correct;
        $$('.opt', container).forEach((b, k) => {
          b.disabled = true;
          if (q.options[k].correct) b.classList.add('right');
          else if (k === i) b.classList.add('wrong');
        });
        const w = q.w;
        $('.q-feedback', container).innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Nice!' : 'Not quite.'}</b>
          <span class="hz">${esc(w.hz)}</span> ${pyHTML(w.py)} <span class="fine">${esc(w.en)}</span></div>
          <button class="btn primary" id="cont">Continue</button>`;
        if (!ok || q.type === 'hanzi') say(w.hz);
        const btn = $('#cont', container);
        btn.focus();
        const key2 = e => { if (e.key === 'Enter' && document.activeElement !== btn) { e.preventDefault(); done(); } };
        const done = () => { document.removeEventListener('keydown', key2); resolve(ok); };
        btn.onclick = done;
        setTimeout(() => document.addEventListener('keydown', key2), 50);
        cleanup = () => document.removeEventListener('keydown', key2);
      };
      document.addEventListener('keydown', key1);
      $$('.opt', container).forEach(b => b.onclick = () => choose(+b.dataset.i));
      cleanup = () => document.removeEventListener('keydown', key1);
    });
  }

  // ---------- Learn session ----------
  function introCard(w) {
    return `<article class="card intro">
      <p class="kicker">New word${w.x ? ' · bonus' : ''}</p>
      <div class="hz xxl">${esc(w.hz)}</div>
      <div class="py lg">${Pinyin.toneHTML(w.py)}</div>
      <p class="meaning"><span class="pos">${esc(w.pos)}</span> ${esc(w.en)}</p>
      <div class="card-btns">
        <button class="btn" data-say="${w.id}">${ICON.speak} Listen</button>
        <button class="btn" data-tone="${w.id}">${ICON.mic} Tone practice</button>
      </div>
    </article>`;
  }
  async function viewLearn(l, n) {
    renderTabs(null, true);
    const Ls = lv(l) && lv(l).lessons[n - 1];
    if (!Ls || lessonStatus(l, n) === 'locked') { location.hash = '#/'; return; }
    const pool = lv(l).words;
    const total = Ls.words.length;
    let todo = Ls.words.filter(id => !Store.isLearned(id)).map(id => W[id]);
    if (!todo.length) todo = Ls.words.map(id => W[id]); // practicing again
    const partial = {}; // id -> 0.4 after intro
    const progress = () => {
      let p = 0;
      Ls.words.forEach(id => { p += Store.isLearned(id) && !(id in partial) ? 1 : (partial[id] || 0); });
      return Math.min(1, p / total);
    };
    const shell = () => {
      const pr = progress();
      if (!$('#stage')) {
        view.innerHTML = `<header class="session-top"><a class="x" href="#/lesson/${l}/${n}" aria-label="Close">✕</a>
          <div class="progress"><div id="lbar"></div></div><span class="count" id="lcount"></span></header>
          <div id="stage" class="stage"></div>`;
      }
      $('#lbar').style.width = `${pr * 100}%`;
      $('#lcount').textContent = `${Math.round(pr * total)}/${total}`;
      return $('#stage');
    };
    const myRoute = location.hash;
    const alive = () => location.hash === myRoute;
    const reviewing = learnedCount(Ls.words) === total;
    if (reviewing) Ls.words.forEach(id => { partial[id] = 0; });
    while (todo.length && alive()) {
      const batch = todo.slice(0, 5);
      for (let i = 0; i < batch.length && alive(); i++) {
        partial[batch[i].id] = 0.4;
        const stage = shell();
        stage.innerHTML = introCard(batch[i]) + `<button class="btn primary big" id="nx">${i < batch.length - 1 ? 'Next word' : 'Quick check'}</button>`;
        wireWordRows(stage);
        if (S().settings.autoplay) setTimeout(() => say(batch[i].hz), 200);
        $('#nx').focus();
        await new Promise(res => { $('#nx').onclick = res; cleanup = res; });
      }
      if (!alive()) return;
      const firstTry = {};
      let queue = batch.map((w, i) => ({ w, type: ['meaning', 'listen', 'hanzi', 'tones'][i % 4] }));
      let k = 0;
      while (queue.length && alive()) {
        const item = queue.shift();
        const stage = shell();
        const ok = await askQuestion(stage, makeQuestion(item.w, item.type, pool), k, 0);
        k++;
        const id = item.w.id;
        if (!(id in firstTry)) firstTry[id] = ok;
        if (ok) {
          if (!reviewing || !Store.isLearned(id)) Store.learn(id, firstTry[id]);
          else if (!firstTry[id]) Store.grade(id, 0);
          delete partial[id];
          if (reviewing) partial[id] = 1;
        } else {
          if (reviewing && Store.isLearned(id)) Store.grade(id, 0);
          queue.splice(Math.min(2, queue.length), 0, { w: item.w, type: item.type === 'tones' ? 'meaning' : item.type });
        }
        shell();
      }
      if (!alive()) return;
      todo = todo.slice(batch.length);
      const tc = Store.todayCounter();
      if (todo.length && !reviewing && tc.newLearned >= S().settings.newPerDay) {
        const stage = shell();
        stage.innerHTML = `<section class="done-box"><div>${hikerPic(110)}</div><h2>Today's goal reached</h2>
          <p>You've learned ${tc.newLearned} new words today. Try the flashcards for them, or keep climbing.</p>
          <div class="actions"><a class="btn primary" href="#/cards/lesson/${l}/${n}">Flashcards</a><button class="btn" id="more">Keep climbing</button></div></section>`;
        const goOn = await new Promise(res => { $('#more').onclick = () => res(true); cleanup = () => res(false); });
        if (!goOn || !alive()) return;
      }
    }
    if (alive()) finishLesson(l, n);
  }

  function finishLesson(l, n) {
    const key = lkey(l, n);
    const wasDone = lessonState(l, n) === 'done';
    S().lessonsDone[key] = Date.now();
    const rewards = [];
    if (!S().foods.includes(key)) { S().foods.push(key); rewards.push({ kind: 'food', l, n }); }
    SH_GEAR.filter(g => g.level === l && g.at === n && !S().gear.includes(g.id)).forEach(g => { S().gear.push(g.id); rewards.push({ kind: 'gear', g }); });
    Store.save();
    const summit = n === lv(l).lessons.length;
    if (wasDone && !rewards.length) {
      openModal(`<div class="reward-art">${hikerPic(100)}</div><h2>Words refreshed</h2><p>Want to test yourself with flashcards?</p>
        <div class="actions"><a class="btn primary" href="#/cards/lesson/${l}/${n}">Flashcards</a><a class="btn" href="#/">Back to the mountain</a></div>`);
      return;
    }
    S().viewLevel = null; Store.save();
    location.hash = '#/';
    setTimeout(() => showRewards(rewards, summit ? `Summit of HSK ${l}!` : `Flag ${n} planted!`,
      summit ? 'The teahouse is yours. Next: the descent — review the whole mountain to reach base camp.' : `Try the flashcards for checkpoint ${n} when you're ready.`, { l, n }), 900);
  }
  function showRewards(list, title, sub, ctx) {
    if (!list.length) { toast(title); return; }
    const r = list[0];
    const rest = list.slice(1);
    const next = () => (rest.length ? showRewards(rest, title, sub, ctx) : closeModal());
    if (r.kind === 'food') {
      const f = SH_FOODS[r.l][r.n - 1];
      const summit = r.n === lv(r.l).lessons.length;
      openModal(`<p class="kicker">${esc(title)}</p>
        <div class="reward-art">${Art.teahouse(56)}</div>
        <h2>${summit ? 'Welcome to the summit teahouse' : 'A snack at the checkpoint'}</h2>
        ${foodCardHTML(f)}
        ${sub ? `<p class="fine">${esc(sub)}</p>` : ''}
        <div class="actions">${rest.length ? '' : `<a class="btn" href="#/cards/lesson/${r.l}/${r.n}">Flashcards</a>`}<button class="btn primary" id="ok">${rest.length ? 'Next' : 'Back to the trail'}</button></div>`, el => {
        $('#ok', el).onclick = next;
        wireWordRows(el);
      });
    } else {
      const g = r.g;
      const eq = Object.assign({}, S().equipped, { [g.slot]: g.id });
      openModal(`<p class="kicker">New gear unlocked</p>
        <div class="reward-art">${hikerPic(120, eq)}</div>
        <h2><span class="zh">${g.hz}</span> ${pyHTML(g.py)} <button class="icon-btn" data-say-text="${esc(g.hz)}" aria-label="Play">${ICON.speak}</button></h2>
        <p><b>${esc(g.en)}</b></p><p class="fine">${esc(g.fact)}</p>
        <div class="actions"><button class="btn primary" id="eq">Wear it</button><button class="btn" id="ok">Later</button></div>`, el => {
        wireWordRows(el);
        $('#eq', el).onclick = () => {
          S().equipped[g.slot] = g.id; Store.save();
          if (world) world.setHiker(S().hiker, S().equipped);
          next();
        };
        $('#ok', el).onclick = next;
      });
    }
  }
  function foodCardHTML(f) {
    return `<div class="food-card">${Art.plate(f.hz[0], 84)}
      <div><p class="food-hz"><span class="zh">${f.hz}</span> <button class="icon-btn" data-say-text="${esc(f.hz)}" aria-label="Play">${ICON.speak}</button></p>
      <p>${pyHTML(f.py)} · <b>${esc(f.en)}</b></p><p class="fine">${esc(f.region)}</p><p>${esc(f.fact)}</p></div></div>`;
  }
  function showFood(l, n) {
    const f = SH_FOODS[l][n - 1];
    openModal(`<p class="kicker">HSK ${l} · Checkpoint ${n}</p>${foodCardHTML(f)}<button class="btn primary" id="ok">Close</button>`, el => {
      $('#ok', el).onclick = closeModal;
      wireWordRows(el);
    });
  }

  // ---------- Flashcards ----------
  function viewCardsHub() {
    renderTabs('cards');
    const due = Store.dueIds().length, weak = Store.weakIds().length;
    const learnedAll = Object.keys(S().cards).length;
    const lessons = [];
    [1, 2, 3].forEach(l => lv(l).lessons.forEach(L => { const c = learnedCount(L.words); if (c) lessons.push({ l, n: L.n, c, t: L.words.length, en: L.en }); }));
    view.innerHTML = `<header class="page-head"><h1>Flashcards</h1>
      <p>See the character, decide if you know it, then flip. "Don't know" sends a word to your Weak words deck.</p></header>
      <div class="hub">
        <a class="hub-card ${due ? 'hot' : ''}" href="#/cards/due"><b>${due}</b><span>Due today</span><small>Cards you're about to forget</small></a>
        <a class="hub-card" href="#/cards/weak"><b>${weak}</b><span>Weak words</span><small>Don't-knows and misses</small></a>
        <a class="hub-card" href="#/cards/all"><b>${learnedAll}</b><span>Shuffle all</span><small>20 random learned words</small></a>
      </div>
      ${weak ? `<a class="link-row" href="#/weak">See the weak words list →</a>` : ''}
      <h2 class="section-title">By checkpoint</h2>
      ${lessons.length ? `<ul class="lesson-list">${lessons.map(x => `<li><a href="#/cards/lesson/${x.l}/${x.n}"><span class="ln">${x.l}·${x.n}</span><span class="lt">${esc(x.en)}</span><span class="lc">${x.c}/${x.t}</span></a></li>`).join('')}</ul>`
        : `<p class="fine">Learn the words at your first checkpoint to unlock its flashcards.</p>`}`;
  }
  function viewCards(mode, l, n) {
    renderTabs('cards', true);
    let ids, backHref = '#/cards', title = 'Flashcards';
    if (mode === 'due') { ids = Store.dueIds(); title = 'Due today'; }
    else if (mode === 'weak') { ids = shuffle(Store.weakIds()); title = 'Weak words'; }
    else if (mode === 'all') { ids = shuffle(Object.keys(S().cards)).slice(0, 20); title = 'Shuffle'; }
    else {
      if (!lv(l) || !lv(l).lessons[n - 1]) { location.hash = '#/'; return; }
      ids = shuffle(lv(l).lessons[n - 1].words.filter(id => Store.isLearned(id)));
      title = `Checkpoint ${l}·${n}`; backHref = `#/lesson/${l}/${n}`;
    }
    if (!ids.length) {
      renderTabs('cards');
      const cur = currentLesson();
      view.innerHTML = `<section class="done-box"><div>${hikerPic(110)}</div>
        <h2>${mode === 'weak' ? 'No weak words right now' : mode === 'due' ? 'Nothing due right now' : 'No learned words yet'}</h2>
        <p>${mode === 'weak' ? 'Words you mark "Don\'t know", or miss in a quiz, will gather here.' : 'Cards come back on the day you are about to forget them.'}</p>
        <div class="actions">${cur && !cur.descent ? `<a class="btn primary" href="#/lesson/${cur.l}/${cur.n}">Go to checkpoint ${cur.n}</a>` : ''}<a class="btn" href="#/cards">All flashcards</a></div></section>`;
      return;
    }
    const queue = ids.slice();
    const startCount = queue.length;
    let done = 0, known = 0;
    const missed = new Set();
    const myRoute = location.hash;
    const bar = () => { const b = $('#cbar'); if (b) b.style.width = `${(done / (done + queue.length)) * 100}%`; const c = $('#ccount'); if (c) c.textContent = `${queue.length} left`; };
    view.innerHTML = `<header class="session-top"><a class="x" href="${backHref}" aria-label="Close">✕</a>
      <div class="progress"><div id="cbar"></div></div><span class="count" id="ccount"></span></header>
      <p class="kicker center">${esc(title)}</p><div id="cstage"></div>`;
    const show = () => {
      if (location.hash !== myRoute) return;
      bar();
      if (!queue.length) return summary();
      const w = W[queue[0]];
      const stage = $('#cstage');
      stage.innerHTML = `<div class="flip" id="flip"><div class="flip-inner">
          <article class="card face front"><div class="hz xxl">${esc(w.hz)}</div>
            ${S().settings.pinyinOnFront ? `<div class="py lg">${Pinyin.toneHTML(w.py)}</div>` : ''}
            <p class="tap-hint">Do you know this word?</p></article>
          <article class="card face back"><div class="verdict" id="verdict"></div>
            <div class="hz xl">${esc(w.hz)}</div>
            <div class="py lg">${Pinyin.toneHTML(w.py)}</div>
            <p class="meaning"><span class="pos">${esc(w.pos)}</span> ${esc(w.en)}</p>
            <p class="fine">HSK ${w.lv} · Checkpoint ${w.ls}</p>
            <div class="card-btns"><button class="btn" data-say="${w.id}">${ICON.speak} Listen</button><button class="btn" data-tone="${w.id}">${ICON.mic} Tones</button></div>
          </article></div></div>
        <div class="answer-row" id="ans">
          <button class="btn big dk" data-k="0">Don't know</button>
          <button class="btn big primary kn" data-k="1">I know it</button>
        </div>
        <div class="answer-row" id="nextrow" hidden>
          <button class="btn linkish" id="oops" hidden>Oops, I got it wrong</button>
          <button class="btn big primary" id="nxt">Next</button>
        </div>
        <p class="fine center keys">Keys: ← don't know · → know · Enter next</p>`;
      wireWordRows(stage);
      let answered = false, grade = null;
      const answer = k => {
        if (answered) return;
        answered = true;
        grade = k ? 2 : 0;
        $('#flip').classList.add('flipped');
        $('#verdict').innerHTML = k ? `<span class="ok">${ICON.check} You said you know it</span>` : `<span class="no">Added to Weak words</span>`;
        $('#ans').hidden = true; $('#nextrow').hidden = false;
        $('#oops').hidden = !k;
        if (S().settings.autoplay) say(w.hz);
        $('#nxt').focus();
      };
      const next = () => {
        Store.grade(w.id, grade);
        queue.shift(); done++;
        if (grade === 2) known++; else { missed.add(w.id); queue.splice(Math.min(4, queue.length), 0, w.id); }
        show();
      };
      $$('#ans [data-k]').forEach(b => b.onclick = () => answer(+b.dataset.k));
      $('#oops').onclick = () => { grade = 0; $('#verdict').innerHTML = `<span class="no">Okay — added to Weak words</span>`; $('#oops').hidden = true; };
      $('#nxt').onclick = next;
      const key = e => {
        if (!modal.hidden) return;
        if (!answered && (e.key === 'ArrowLeft' || e.key === '1')) { e.preventDefault(); answer(0); }
        else if (!answered && (e.key === 'ArrowRight' || e.key === '2')) { e.preventDefault(); answer(1); }
        else if (answered && (e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.id !== 'oops') { e.preventDefault(); document.removeEventListener('keydown', key); next(); }
      };
      document.addEventListener('keydown', key);
      cleanup = () => document.removeEventListener('keydown', key);
    };
    const summary = () => {
      renderTabs('cards');
      const weakNow = Store.weakIds().length;
      const cur = currentLesson();
      view.innerHTML = `<section class="done-box"><div>${hikerPic(110)}</div>
        <h2>Deck done</h2>
        <p class="big-score">${known}/${startCount}</p>
        <p>known on the first try${missed.size ? ` · ${missed.size} went to Weak words` : ''}.</p>
        <div class="actions">${missed.size ? `<a class="btn" href="#/cards/weak">Practice weak words (${weakNow})</a>` : ''}
          ${cur && !cur.descent ? `<a class="btn primary" href="#/lesson/${cur.l}/${cur.n}">Continue climbing</a>` : `<a class="btn primary" href="#/">Back to the mountain</a>`}</div></section>`;
      if (world && known === startCount) world.cheer();
    };
    show();
  }
  function viewWeak() {
    renderTabs('cards');
    const words = Store.weakIds().map(id => W[id]).filter(Boolean).sort((a, b) => a.lv - b.lv || a.ls - b.ls);
    view.innerHTML = `<a class="back" href="#/cards">← Flashcards</a><header class="page-head"><h1>Weak words</h1>
      <p>Words you said you don't know, or missed in a quiz. They leave this list after you know them twice in a row.</p></header>
      ${words.length ? `<a class="btn primary big" href="#/cards/weak">Practice ${words.length} weak word${words.length > 1 ? 's' : ''}</a>
      <ul class="word-list">${words.map(wordRow).join('')}</ul>` : `<section class="done-box"><div>${hikerPic(100)}</div><p>Nothing here yet — nice and steady.</p></section>`}`;
    wireWordRows();
  }

  // ---------- Grammar ----------
  function grammarCard(g) {
    const done = S().grammarDone[g.id];
    return `<a class="g-card ${done ? 'done' : ''}" href="#/grammar/${encodeURIComponent(g.id)}">
      <span class="g-check">${done ? ICON.check : ''}</span>
      <span class="g-main"><b>${esc(g.title)}</b><span class="g-pattern zh">${esc(g.pattern)}</span></span></a>`;
  }
  function viewGrammar() {
    renderTabs('grammar');
    const L = S().grammarLevel || Math.max(...S().unlockedLevels);
    const items = G.filter(g => g.lv === L);
    const doneN = items.filter(g => S().grammarDone[g.id]).length;
    const byLesson = {};
    items.forEach(g => { (byLesson[g.ls] = byLesson[g.ls] || []).push(g); });
    view.innerHTML = `<header class="page-head"><h1>Grammar</h1><p>Short explanations, examples you can listen to, and a one-question check for each point.</p></header>
      <nav class="level-tabs" aria-label="Level">${[1, 2, 3].map(l => `<button data-gl="${l}" class="${l === L ? 'on' : ''}">HSK ${l}</button>`).join('')}</nav>
      <div class="progress"><div style="width:${items.length ? (doneN / items.length) * 100 : 0}%"></div></div>
      <p class="fine">${doneN} of ${items.length} points checked</p>
      ${Object.keys(byLesson).map(n => { const Ls = lv(L).lessons[n - 1]; return `<h3 class="sub">Checkpoint ${n} · <span class="zh">${esc(Ls.zh)}</span></h3><div class="g-list">${byLesson[n].map(grammarCard).join('')}</div>`; }).join('')}`;
    $$('[data-gl]').forEach(b => b.onclick = () => { S().grammarLevel = +b.dataset.gl; Store.save(); viewGrammar(); });
  }
  function viewGrammarPoint(id) {
    renderTabs('grammar');
    const g = GID[id];
    if (!g) { location.hash = '#/grammar'; return; }
    const list = G.filter(x => x.lv === g.lv);
    const i = list.indexOf(g);
    const prev = list[i - 1], next = list[i + 1];
    const q = g.quiz;
    view.innerHTML = `<a class="back" href="#/grammar">← Grammar</a>
      <p class="kicker">HSK ${g.lv} · Checkpoint ${g.ls}</p>
      <h1>${esc(g.title)}</h1>
      <div class="pattern zh">${esc(g.pattern)}</div>
      <div class="explain">${g.explain.map(p => `<p>${esc(p)}</p>`).join('')}</div>
      <h2 class="section-title">Examples</h2>
      <ul class="ex-list">${g.examples.map(e => `<li><button class="icon-btn" data-say-text="${esc(e.zh)}" aria-label="Play">${ICON.speak}</button>
        <div><p class="zh ex-zh">${esc(e.zh)}</p><p class="ex-py">${Pinyin.toneHTML(e.py)}</p><p class="fine">${esc(e.en)}</p></div></li>`).join('')}</ul>
      ${q ? `<h2 class="section-title">Quick check</h2><div class="q gq"><p class="q-prompt">${esc(q.q)}</p>
        <div class="options">${q.options.map((o, k) => `<button class="opt" data-k="${k}"><kbd>${k + 1}</kbd><span class="zh">${esc(o)}</span></button>`).join('')}</div>
        <div class="q-feedback" aria-live="polite"></div></div>` : ''}
      <div class="pager">${prev ? `<a class="btn" href="#/grammar/${encodeURIComponent(prev.id)}">← Previous</a>` : '<span></span>'}${next ? `<a class="btn" href="#/grammar/${encodeURIComponent(next.id)}">Next →</a>` : ''}</div>`;
    wireWordRows();
    if (q) $$('.gq .opt').forEach(b => b.onclick = () => {
      const k = +b.dataset.k;
      $$('.gq .opt').forEach((x, j) => { x.disabled = true; if (j === q.answer) x.classList.add('right'); else if (j === k) x.classList.add('wrong'); });
      const ok = k === q.answer;
      if (ok) { S().grammarDone[g.id] = Date.now(); Store.markActive(); Store.save(); }
      $('.gq .q-feedback').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Right!' : 'Not quite.'}</b> ${esc(q.why || '')}</div>${ok ? '' : '<button class="btn" id="retry">Try again</button>'}`;
      const r = $('#retry'); if (r) r.onclick = () => viewGrammarPoint(id);
    });
  }

  // ---------- Descent ----------
  async function viewDescent(l) {
    renderTabs(null, true);
    if (!lv(l)) { location.hash = '#/'; return; }
    const st = descentState(l);
    if (st === 'locked') { toast('Reach the summit first'); location.hash = '#/'; return; }
    const pool = lv(l).words;
    const N = Math.min(40, pool.length);
    view.innerHTML = `<header class="session-top"><a class="x" href="#/" aria-label="Close">✕</a><span class="count">Descent · HSK ${l}</span></header>
      <section class="done-box"><div>${hikerPic(110)}</div><h2>The descent</h2>
      <p>${N} questions from all of HSK ${l}: meanings, listening, characters and tones. Get <b>80%</b> to reach base camp${l < 3 ? ` and open the HSK ${l + 1} mountain` : ''}.</p>
      <p class="fine">Anything you miss goes to your Weak words deck. Exam-format mock tests come in a later version.</p>
      <button class="btn primary big" id="begin">Begin descent</button></section>`;
    await new Promise(res => { $('#begin').onclick = res; cleanup = () => res(); });
    const myRoute = location.hash;
    if (location.hash !== myRoute) return;
    const qs = shuffle(pool).slice(0, N).map((w, i) => ({ w, type: ['meaning', 'listen', 'hanzi', 'tones'][i % 4] }));
    let score = 0;
    const missed = [];
    view.innerHTML = `<header class="session-top"><a class="x" href="#/" aria-label="Close">✕</a>
      <div class="progress descent"><div id="dbar"></div></div><span class="count" id="dcount"></span></header><div id="stage" class="stage"></div>`;
    for (let i = 0; i < qs.length; i++) {
      if (location.hash !== myRoute) return;
      $('#dbar').style.width = `${(i / qs.length) * 100}%`; $('#dcount').textContent = `${i + 1}/${qs.length}`;
      const ok = await askQuestion($('#stage'), makeQuestion(qs[i].w, qs[i].type, pool), i, qs.length);
      if (ok) score++; else { missed.push(qs[i].w); if (Store.isLearned(qs[i].w.id)) Store.grade(qs[i].w.id, 0); else Store.learn(qs[i].w.id, false); }
    }
    const pct = Math.round((score / qs.length) * 100);
    const pass = pct >= 80;
    const rewards = [];
    if (pass) {
      const prevBest = S().descended[l] && S().descended[l].score;
      S().descended[l] = { score: Math.max(pct, prevBest || 0), at: Date.now() };
      if (l < 3 && !S().unlockedLevels.includes(l + 1)) S().unlockedLevels.push(l + 1);
      SH_GEAR.filter(g => g.level === l && g.at === 'descent' && !S().gear.includes(g.id)).forEach(g => { S().gear.push(g.id); rewards.push({ kind: 'gear', g }); });
      Store.save();
    }
    renderTabs('home');
    view.innerHTML = `<section class="done-box"><div>${hikerPic(110)}</div>
      <h2>${pass ? (l < 3 ? 'Base camp reached!' : 'You descended the last mountain!') : 'Almost there'}</h2>
      <p class="big-score">${pct}%</p>
      <p>${pass ? (l < 3 ? `The HSK ${l + 1} mountain is open. It's only up from here.` : 'You have climbed all of HSK 1–3. 了不起！') : 'You need 80% to reach base camp. Practice your weak words and try again.'}</p>
      ${missed.length ? `<details><summary>${missed.length} word${missed.length > 1 ? 's' : ''} to work on</summary><ul class="word-list">${missed.map(wordRow).join('')}</ul></details>` : ''}
      <div class="actions">${pass ? `<a class="btn primary" href="#/">Watch your hiker descend</a>` : `<a class="btn primary" href="#/cards/weak">Practice weak words</a><a class="btn" href="#/descent/${l}">Try again</a>`}</div></section>`;
    wireWordRows();
    if (rewards.length) setTimeout(() => showRewards(rewards, 'Descent complete', ''), 300);
  }

  // ---------- Tone practice ----------
  function tonePractice(w) {
    const syls = Pinyin.syllables(w.py).filter(Boolean);
    const tones = syls.map(s => s.tone);
    const spoken = Audio2.sandhi(tones);
    const drawSyls = syls.map((s, i) => ({ text: s.text, tone: spoken[i] }));
    const changed = spoken.some((t, i) => t !== tones[i]);
    let mode = 'shadow', busy = false;
    const text = clean(w.hz);
    const names = { 1: 'high and level', 2: 'rising', 3: 'low dipping', 4: 'falling', 5: 'light' };
    openModal(`<div class="tone-box">
      <div class="tone-tabs" role="tablist"><button role="tab" data-m="shadow" class="on">1 · Shadow</button><button role="tab" data-m="solo">2 · On your own</button></div>
      <div class="hz xl center">${esc(w.hz)}</div>
      <div class="py lg center tone-py">${Pinyin.toneHTML(w.py)}</div>
      ${changed ? `<p class="fine center sandhi">Two 3rd tones in a row: say the first one as a 2nd tone.</p>` : ''}
      <canvas id="tc" class="tone-canvas" aria-label="Pitch chart"></canvas>
      <div class="tone-result" aria-live="polite"></div>
      <p class="tone-msg" aria-live="polite"></p>
      <div class="actions"><button class="btn" id="tlisten">${ICON.speak} Listen</button><button class="btn primary" id="trec">${ICON.mic} Record</button></div>
      <p class="fine">Colored lines show each tone's shape; your voice is drawn in navy. The check is approximate and gets better after a few tries as it learns your normal pitch.</p>
      <button class="btn ghost" id="tclose">Done</button></div>`, el => {
      const cv = $('#tc', el), msg = $('.tone-msg', el), res = $('.tone-result', el), pyEl = $('.tone-py', el);
      const paint = pts => Art.drawTones(cv, drawSyls, pts);
      const setMode = m => {
        mode = m;
        $$('[data-m]', el).forEach(b => b.classList.toggle('on', b.dataset.m === m));
        pyEl.style.visibility = m === 'solo' ? 'hidden' : 'visible';
        cv.style.visibility = m === 'solo' ? 'hidden' : 'visible';
        $('#tlisten', el).hidden = m === 'solo';
        res.innerHTML = '';
        msg.textContent = m === 'shadow' ? 'Listen, then record yourself copying the voice.' : 'Say it from memory, then compare.';
        paint(null);
      };
      $$('[data-m]', el).forEach(b => b.onclick = () => setMode(b.dataset.m));
      $('#tlisten', el).onclick = () => say(text);
      $('#tclose', el).onclick = closeModal;
      $('#trec', el).onclick = async () => {
        if (busy) return;
        busy = true;
        const btn = $('#trec', el);
        btn.classList.add('rec'); btn.innerHTML = `${ICON.mic} Listening…`;
        msg.textContent = 'Speak now'; res.innerHTML = '';
        const ref = S().settings.voiceRef;
        try {
          const track = await Audio2.record({ maxMs: 2200 + syls.length * 700 }, (tr, phase) => {
            if (phase === 'hearing') msg.textContent = 'Hearing you…';
            if (mode === 'shadow') { const c = Audio2.contour(tr, ref); if (c) paint(c); }
          });
          const pts = Audio2.contour(track, ref);
          pyEl.style.visibility = 'visible'; cv.style.visibility = 'visible';
          paint(pts);
          S().stats.toneTries += 1; Store.markActive();
          if (!pts) msg.textContent = 'I couldn\'t hear a clear voice. Try again a little closer to the mic, in a quiet spot.';
          else {
            const med = pts.map(p => p.f).sort((a, b) => a - b)[Math.floor(pts.length / 2)];
            const tries = S().stats.toneTries;
            const j = Audio2.judgeWord(pts, tones, !!ref && tries > 2);
            S().settings.voiceRef = ref ? ref * 0.8 + med * 0.2 : med;
            if (j) {
              res.innerHTML = j.map((r, i) => {
                const exp = r.expected;
                if (exp === 5) return `<span class="tr neutral"><b>${esc(syls[i].text)}</b><small>light tone</small></span>`;
                const ok = r.got && r.got.tone === exp;
                return `<span class="tr ${ok ? 'ok' : r.got && !r.got.sure ? 'meh' : 'no'}"><b>${esc(syls[i].text)}</b><small>${ok ? '✓ ' + names[exp] : r.got ? `heard ${names[r.got.tone]}` : '?'}</small></span>`;
              }).join('');
              const good = j.filter(r => r.expected !== 5 && r.got && r.got.tone === r.expected).length;
              const need = j.filter(r => r.expected !== 5).length;
              msg.innerHTML = good === need ? '<b class="ok">Nice — the tones match.</b>' : syls.length > 1 ? 'Compare your navy line with the colored shapes. Multi-syllable words are split evenly, so the check is rougher.' : `Aim for <b>${names[spoken[0]]}</b>.`;
            }
          }
          Store.save();
        } catch (err) {
          msg.textContent = err && err.message === 'nomic' ? 'This browser can\'t use the microphone.' : 'Microphone blocked. Allow mic access for this site (click the mic icon in the address bar), then try again.';
        }
        btn.classList.remove('rec'); btn.innerHTML = `${ICON.mic} Record again`;
        busy = false;
      };
      setTimeout(() => setMode('shadow'), 30);
      if (S().settings.autoplay) say(text);
    });
  }

  // ---------- Hiker & collection ----------
  function viewHiker() {
    renderTabs('hiker');
    const h = S().hiker;
    const slots = { head: 'Head', neck: 'Neck', body: 'Body', hand: 'Hand', hip: 'Hip', back: 'Back', feet: 'Feet', charm: 'Charm', charm2: 'Charm' };
    const where = g => `HSK ${g.level} · ${g.at === 'descent' ? 'descent' : `checkpoint ${g.at}`}`;
    const foodsTotal = [1, 2, 3].reduce((s, l) => s + SH_FOODS[l].length, 0);
    view.innerHTML = `<header class="page-head"><h1>${h.name ? esc(h.name) : 'Your hiker'}</h1></header>
      <section class="creator">${creatorHTML(h)}</section>
      <h2 class="section-title">Gear <span class="fine">${S().gear.length}/${SH_GEAR.length}</span></h2>
      <p class="fine">Unlocked at big checkpoints and descents. Tap to wear or take off.</p>
      <div class="gear-grid">${SH_GEAR.map(g => {
        const have = S().gear.includes(g.id), on = S().equipped[g.slot] === g.id;
        return `<button class="gear ${have ? '' : 'locked'} ${on ? 'on' : ''}" data-gear="${g.id}" ${have ? '' : 'aria-disabled="true"'}>
          <span class="zh">${have ? g.hz : '？'}</span><b>${have ? esc(g.en) : 'Locked'}</b><small>${have ? (on ? 'Wearing' : slots[g.slot]) : where(g)}</small></button>`;
      }).join('')}</div>
      <h2 class="section-title">Food cards <span class="fine">${S().foods.length}/${foodsTotal}</span></h2>
      ${[1, 2, 3].map(l => `<h3 class="sub">HSK ${l}</h3><div class="food-grid">${SH_FOODS[l].map((f, i) => {
        const have = S().foods.includes(lkey(l, i + 1));
        return `<button class="food ${have ? '' : 'locked'}" data-food="${l}-${i + 1}" aria-label="${have ? esc(f.en) : `Locked: checkpoint ${i + 1}`}">${Art.plate(f.hz[0], 56, !have)}<small>${have ? esc(f.hz) : `${i + 1}`}</small></button>`;
      }).join('')}</div>`).join('')}`;
    wireCreator(h, () => { Store.save(); const y = window.scrollY; viewHiker(); window.scrollTo(0, y); });
    startStudio(h, S().equipped);
    $$('[data-gear]').forEach(b => b.onclick = () => {
      const g = SH_GEAR.find(x => x.id === b.dataset.gear);
      if (!S().gear.includes(g.id)) { toast(`Unlocks at ${where(g)}`); return; }
      if (S().equipped[g.slot] === g.id) delete S().equipped[g.slot];
      else S().equipped[g.slot] = g.id;
      Store.save();
      const y = window.scrollY; viewHiker(); window.scrollTo(0, y);
      if (world) world.wave();
      toast(`${S().equipped[g.slot] === g.id ? 'Wearing' : 'Took off'}: ${g.hz} ${g.en}`);
    });
    $$('[data-food]').forEach(b => b.onclick = () => {
      const [l, n] = b.dataset.food.split('-').map(Number);
      if (!S().foods.includes(lkey(l, n))) { toast(`Plant flag ${n} on HSK ${l} to collect this card`); return; }
      showFood(l, n);
    });
  }

  // ---------- Settings ----------
  function viewSettings() {
    renderTabs('settings');
    const st = S().settings;
    const stats = S().stats;
    const learned = Object.keys(S().cards).length;
    const dev = Audio2.hasDeviceVoice();
    view.innerHTML = `<header class="page-head"><h1>Settings</h1></header>
      <section class="settings">
        <div class="stat-row"><div><b>${learned}</b><span>words learned</span></div><div><b>${stats.reviews}</b><span>flashcards</span></div><div><b>${Object.keys(S().grammarDone).length}</b><span>grammar</span></div><div><b>${stats.toneTries}</b><span>tone tries</span></div></div>
        <h2 class="section-title">Audio</h2>
        <label class="field">Voice
          <select id="s-src"><option value="auto">Automatic</option><option value="device">This device's Chinese voice</option><option value="online">Online voice</option></select></label>
        <p class="fine">${dev ? 'A Chinese voice is installed on this device.' : 'No Chinese voice is installed on this device (common on Firefox), so the online voice is used. It needs an internet connection.'}</p>
        <label class="field">Voice speed <output>${st.rate.toFixed(2)}×</output><input type="range" min="0.5" max="1.2" step="0.05" id="s-rate" value="${st.rate}"></label>
        <button class="btn" id="s-test">${ICON.speak} Test: 你好，欢迎！</button>
        <label class="toggle"><input type="checkbox" id="s-auto" ${st.autoplay ? 'checked' : ''}> Play audio automatically</label>
        <h2 class="section-title">Study</h2>
        <label class="field">New words per day <output>${st.newPerDay}</output><input type="range" min="5" max="30" step="1" id="s-new" value="${st.newPerDay}"></label>
        <label class="field">Weekly goal (days) <output>${st.weeklyGoal}</output><input type="range" min="1" max="7" step="1" id="s-goal" value="${st.weeklyGoal}"></label>
        <label class="toggle"><input type="checkbox" id="s-pyf" ${st.pinyinOnFront ? 'checked' : ''}> Show pinyin on the front of flashcards</label>
        <button class="btn" id="s-vref">Reset my voice pitch for tone practice</button>
        <h2 class="section-title">Starting point</h2>
        <p class="fine">Skip ahead if you already know earlier checkpoints. Skipped ones stay open — learn them any time to collect their food cards.</p>
        ${placementPicker()}
        <button class="btn" id="s-place">Start me here</button>
        <h2 class="section-title">Your progress file</h2>
        <p class="fine">Progress lives in this browser only. Download it to keep a backup or move to another device.</p>
        <div class="actions"><button class="btn" id="s-export">Download progress</button><label class="btn file">Load progress<input type="file" id="s-import" accept="application/json,.json" hidden></label></div>
        <button class="btn danger" id="s-reset">Reset everything</button>
        <h2 class="section-title">About</h2>
        <p class="fine">Shang Hike (上 Hike) — 上 means "up", and it's the 上 in 上海. Vocabulary follows the lesson word lists of the <i>New HSK Course</i> textbooks for levels 1–3 (HSK 3.0). English glosses, grammar notes, food and gear notes were written for this site. 3D by three.js. Made by Alea with Claude.</p>
      </section>`;
    $('#s-src').value = st.voiceSource || 'auto';
    $('#s-src').onchange = e => { st.voiceSource = e.target.value; Store.save(); };
    const bindRange = (id, key, fmt) => { const r = $(id); r.oninput = () => { st[key] = +r.value; r.previousElementSibling.textContent = fmt ? fmt(st[key]) : st[key]; Store.save(); }; };
    bindRange('#s-new', 'newPerDay'); bindRange('#s-goal', 'weeklyGoal'); bindRange('#s-rate', 'rate', v => `${v.toFixed(2)}×`);
    $('#s-test').onclick = () => say('你好，欢迎！');
    $('#s-auto').onchange = e => { st.autoplay = e.target.checked; Store.save(); };
    $('#s-pyf').onchange = e => { st.pinyinOnFront = e.target.checked; Store.save(); };
    $('#s-vref').onclick = () => { st.voiceRef = null; Store.save(); toast('Voice pitch reset'); };
    const c = currentLesson();
    wirePlacement(c && !c.descent ? c : { l: 1, n: 1 });
    $('#s-place').onclick = () => {
      const l = +$('#pl-l').value, n = +$('#pl-n').value;
      openModal(`<h2>Start at HSK ${l}, checkpoint ${n}?</h2><p>Earlier checkpoints will be marked as passed. Your learned words and rewards stay as they are.</p>
        <div class="actions"><button class="btn primary" id="y">Yes, move me</button><button class="btn" id="n">Cancel</button></div>`, el => {
        $('#y', el).onclick = () => { applyPlacement(l, n); S().mapAt = null; Store.save(); closeModal(); location.hash = '#/'; };
        $('#n', el).onclick = closeModal;
      });
    };
    $('#s-export').onclick = () => {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `shanghike-progress-${Store.dayKey()}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $('#s-import').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { try { Store.importJSON(rd.result); toast('Progress loaded'); location.hash = '#/'; location.reload(); } catch (err) { toast('That file isn\'t a Shang Hike progress file'); } };
      rd.readAsText(f);
    };
    $('#s-reset').onclick = () => openModal(`<h2>Reset everything?</h2><p>This deletes your hiker, words, cards and rewards in this browser. It can't be undone.</p>
      <div class="actions"><button class="btn danger" id="y">Delete my progress</button><button class="btn" id="n">Cancel</button></div>`, el => {
      $('#y', el).onclick = () => { Store.reset(); closeModal(); location.hash = '#/welcome'; };
      $('#n', el).onclick = closeModal;
    });
  }

  route();
  if (window.World) startWorld();
})();
