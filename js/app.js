// Shang Hike — app logic (views, sessions, rewards).
(function () {
  const D = window.HSK_DATA;
  const W = {};
  D.forEach(l => l.words.forEach(w => { W[w.id] = w; }));
  Store.load();
  const S = () => Store.s;

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const view = $('#view');
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const speakIcon = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  const micIcon = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  const lockIcon = `<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2" fill="none"/></svg>`;

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
    return lv(l).lessons.every(L => lessonState(l, L.n)) ? 'ready' : 'locked';
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
  function homeLevel() {
    if (S().viewLevel && levelUnlocked(S().viewLevel)) return S().viewLevel;
    const c = currentLesson();
    return c ? c.l : Math.max(...S().unlockedLevels);
  }
  function hikerSvg(size) { return Art.hiker(S().hiker, S().equipped, { size }); }

  function weekInfo() {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      return { key: Store.dayKey(d.getTime()), label: 'MTWTFSS'[i], today: i === dow };
    });
    const active = days.filter(d => S().activeDays.includes(d.key)).length;
    return { days, active, goal: S().settings.weeklyGoal };
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
  function closeModal() { modal.hidden = true; modal.innerHTML = ''; document.body.classList.remove('noscroll'); }
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  let warnedVoice = false;
  function say(text) {
    if (!Audio2.available()) { if (!warnedVoice) { warnedVoice = true; toast('No Chinese voice found on this device — see Settings'); } return; }
    Audio2.speak(text, S().settings.rate);
  }
  const pyHTML = py => `<span class="py">${Pinyin.toneHTML(py)}</span>`;

  function renderTabs(active, hidden) {
    const tabs = $('#tabs');
    if (hidden) { tabs.hidden = true; return; }
    tabs.hidden = false;
    const due = Store.dueIds().length, weak = Store.weakIds().length;
    const item = (href, key, label, icon, badge) => `<a href="${href}" class="${active === key ? 'on' : ''}" ${active === key ? 'aria-current="page"' : ''}>
      ${icon}<span>${label}</span>${badge ? `<b class="badge">${badge > 99 ? '99+' : badge}</b>` : ''}</a>`;
    tabs.innerHTML =
      item('#/', 'home', 'Mountain', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M2 20 L9 7 L13 13 L16 9 L22 20Z" fill="currentColor"/></svg>`) +
      item('#/review', 'review', 'Review', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3" y="6" width="14" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12" fill="none" stroke="currentColor" stroke-width="2"/></svg>`, due) +
      item('#/weak', 'weak', 'Weak words', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3 L22 20 H2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4M12 17v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`, weak) +
      item('#/hiker', 'hiker', 'Hiker', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="7" r="4" fill="currentColor"/><path d="M4 21c0-5 4-8 8-8s8 3 8 8" fill="currentColor"/></svg>`) +
      item('#/settings', 'settings', 'Settings', `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`);
  }

  // ---------- Router ----------
  let cleanup = null;
  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    closeModal();
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    const h = location.hash.replace(/^#\/?/, '');
    const p = h.split('/').filter(Boolean);
    if (!S().hiker && p[0] !== 'welcome') { location.hash = '#/welcome'; return; }
    const num = i => parseInt(p[i], 10);
    window.scrollTo(0, 0);
    switch (p[0]) {
      case 'welcome': return viewWelcome();
      case 'lesson': return viewLesson(num(1), num(2));
      case 'learn': return viewLearn(num(1), num(2));
      case 'review': return p[1] === 'lesson' ? viewCards('lesson', num(2), num(3)) : viewCards('due');
      case 'weak': return p[1] === 'practice' ? viewCards('weak') : viewWeak();
      case 'descent': return viewDescent(num(1));
      case 'hiker': return viewHiker();
      case 'settings': return viewSettings();
      case 'level': S().viewLevel = num(1); Store.save(); return viewHome();
      default: return viewHome();
    }
  }
  window.addEventListener('hashchange', route);

  // ---------- Welcome ----------
  function viewWelcome() {
    renderTabs(null, true);
    const draft = { base: 'a', skin: 0, name: '' };
    let step = 0;
    const paint = () => {
      if (step === 0) {
        view.innerHTML = `<section class="welcome">
          <div class="brand-big"><span class="seal">上</span><h1>Shang Hike</h1></div>
          <p class="lede">Climb the new HSK, one peak at a time.<br><em>It's only up from here.</em></p>
          <ul class="how">
            <li><b>Each HSK level is a mountain.</b> Every textbook lesson is a peak on the trail.</li>
            <li><b>Flashcards come back right before you'd forget them.</b> Words you miss go to your Weak words deck.</li>
            <li><b>Reach a peak, visit its teahouse</b> and collect a Chinese food card. Big peaks unlock gear for your hiker.</li>
            <li><b>At the summit, descend:</b> review the whole mountain to unlock the next one.</li>
          </ul>
          <button class="btn primary big" id="go">Choose your hiker</button>
          <p class="fine">Your progress is saved in this browser only. No account needed.</p>
        </section>`;
        $('#go').onclick = () => { step = 1; paint(); };
      } else if (step === 1) {
        view.innerHTML = `<section class="welcome">
          <h2>Who's hiking?</h2>
          <div class="hiker-stage">${Art.hiker(draft, {}, { size: 150 })}</div>
          <div class="pick-row" role="radiogroup" aria-label="Hiker">${['a', 'b', 'c'].map((b, i) => `<button class="pick ${draft.base === b ? 'on' : ''}" data-base="${b}" role="radio" aria-checked="${draft.base === b}">${Art.hiker({ base: b, skin: draft.skin }, {}, { size: 54 })}<span>Hiker ${'ABC'[i]}</span></button>`).join('')}</div>
          <div class="pick-row skins" role="radiogroup" aria-label="Skin tone">${[0, 1, 2].map(s => `<button class="swatch s${s} ${draft.skin === s ? 'on' : ''}" data-skin="${s}" role="radio" aria-checked="${draft.skin === s}" aria-label="Skin tone ${s + 1}"></button>`).join('')}</div>
          <label class="field">Name (optional)<input id="nm" maxlength="20" value="${esc(draft.name)}" placeholder="e.g. 小龙"></label>
          <button class="btn primary big" id="next">Next</button>
        </section>`;
        $$('[data-base]').forEach(b => b.onclick = () => { draft.base = b.dataset.base; draft.name = $('#nm').value; paint(); });
        $$('[data-skin]').forEach(b => b.onclick = () => { draft.skin = +b.dataset.skin; draft.name = $('#nm').value; paint(); });
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
          S().hiker = { base: draft.base, skin: draft.skin, name: draft.name };
          applyPlacement(l, n);
          Store.save();
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
    S().viewLevel = l;
  }

  // ---------- Home / Mountain ----------
  function viewHome() {
    renderTabs('home');
    const L = homeLevel();
    const due = Store.dueIds().length, weak = Store.weakIds().length;
    const wk = weekInfo();
    const cur = currentLesson();
    let cta = '', ctaSub = '';
    if (due) { cta = 'Start today\'s climb'; ctaSub = `${due} review${due > 1 ? 's' : ''} waiting, then new words`; }
    else if (cur && cur.descent) { cta = 'Start the descent'; ctaSub = `Review all of HSK ${cur.l} to unlock the next mountain`; }
    else if (cur) { const Ls = lv(cur.l).lessons[cur.n - 1]; cta = 'Start today\'s climb'; ctaSub = `HSK ${cur.l} · Lesson ${cur.n}: ${Ls.en}`; }
    else { cta = 'Practice weak words'; ctaSub = 'You\'ve climbed everything. Keep it fresh.'; }
    const name = S().hiker && S().hiker.name ? `, ${esc(S().hiker.name)}` : '';
    const locked = !levelUnlocked(L);
    const words = lv(L).words.map(w => w.id);
    view.innerHTML = `<header class="top">
        <div class="brand"><span class="seal sm">上</span><span>Shang Hike</span></div>
        <div class="week" title="Days you studied this week">
          ${wk.days.map(d => `<i class="${S().activeDays.includes(d.key) ? 'on' : ''} ${d.today ? 'today' : ''}" aria-label="${d.label}">${d.label}</i>`).join('')}
        </div>
      </header>
      <section class="hello">
        <div>
          <h1>Hi${name}!</h1>
          <p>${wk.active} of ${wk.goal} days this week${wk.active >= wk.goal ? ' — goal reached 🎉' : '. Rest days are part of hiking.'}</p>
        </div>
        <div class="hello-hiker">${hikerSvg(64)}</div>
      </section>
      <button class="btn primary big cta" id="climb"><span>${cta}</span><small>${esc(ctaSub)}</small></button>
      <div class="chips">
        <a class="chip" href="#/review"><b>${due}</b> due</a>
        <a class="chip" href="#/weak"><b>${weak}</b> weak</a>
        <span class="chip"><b>${learnedCount(words)}</b>/${words.length} HSK ${L} words</span>
      </div>
      <nav class="level-tabs" aria-label="Mountains">${[1, 2, 3].map(l => `<a href="#/level/${l}" class="${l === L ? 'on' : ''} ${levelUnlocked(l) ? '' : 'locked'}">${levelUnlocked(l) ? '' : lockIcon} HSK ${l}</a>`).join('')}</nav>
      <section class="map-wrap ${locked ? 'is-locked' : ''}">
        ${locked ? `<div class="map-lock"><p>${lockIcon} Descend HSK ${L - 1} to unlock this mountain.</p><p class="fine">Already know HSK ${L - 1}? Set your starting point in <a href="#/settings">Settings</a>.</p></div>` : ''}
        <div class="map-scroll" id="mapscroll">${Art.mountain(L, lv(L).lessons, n => lessonStatus(L, n), hikerSvg, descentState(L))}</div>
      </section>`;
    $('#climb').onclick = () => {
      if (due) location.hash = '#/review';
      else if (cur && cur.descent) location.hash = `#/descent/${cur.l}`;
      else if (cur) location.hash = `#/learn/${cur.l}/${cur.n}`;
      else location.hash = '#/weak';
    };
    const svg = $('.mountain');
    const go = g => {
      if (g.dataset.descent) {
        const st = descentState(L);
        if (st === 'locked') return toast('Reach the summit first');
        location.hash = `#/descent/${L}`; return;
      }
      const n = +g.dataset.lesson;
      if (lessonStatus(L, n) === 'locked') return toast(`Finish Lesson ${n - 1} first`);
      location.hash = `#/lesson/${L}/${n}`;
    };
    $$('.peak', svg).forEach(g => {
      g.addEventListener('click', () => go(g));
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(g); } });
    });
    // scroll so the hiker is in view
    requestAnimationFrame(() => {
      const target = $('.map-hiker', svg) || $('.peak.current', svg);
      const sc = $('#mapscroll');
      if (target && sc) {
        const r = target.getBoundingClientRect(), sr = sc.getBoundingClientRect();
        sc.scrollTop += r.top - sr.top - sr.height / 2;
      } else if (sc) sc.scrollTop = sc.scrollHeight;
    });
  }

  // ---------- Lesson page ----------
  function viewLesson(l, n) {
    renderTabs('home');
    const Ls = lv(l) && lv(l).lessons[n - 1];
    if (!Ls) { location.hash = '#/'; return; }
    const st = lessonStatus(l, n);
    if (st === 'locked') { toast(`Finish Lesson ${n - 1} first`); location.hash = '#/'; return; }
    const words = lessonWords(l, n);
    const learned = learnedCount(words.map(w => w.id));
    const food = SH_FOODS[l][n - 1];
    const hasFood = S().foods.includes(lkey(l, n));
    view.innerHTML = `<a class="back" href="#/level/${l}">← HSK ${l} mountain</a>
      <header class="lesson-head">
        <p class="kicker">HSK ${l} · Lesson ${n}${n === lv(l).lessons.length ? ' · Summit' : ''}</p>
        <h1 class="zh">${esc(Ls.zh)}</h1>
        <p class="en">${esc(Ls.en)}</p>
        ${Ls.grammar ? `<p class="grammar"><b>Grammar on this trail:</b> ${esc(Ls.grammar)}</p>` : ''}
      </header>
      <div class="progress"><div style="width:${Math.round((learned / words.length) * 100)}%"></div></div>
      <p class="fine">${learned} of ${words.length} words learned</p>
      <div class="actions">
        ${learned < words.length ? `<a class="btn primary" href="#/learn/${l}/${n}">${learned ? 'Keep learning' : 'Learn these words'}</a>` : `<a class="btn primary" href="#/review/lesson/${l}/${n}">Review this lesson</a>`}
        ${learned > 0 && learned < words.length ? `<a class="btn" href="#/review/lesson/${l}/${n}">Review learned words</a>` : ''}
      </div>
      <section class="teahouse-box ${hasFood ? '' : 'locked'}">
        ${Art.plate(food.hz[0], 64, !hasFood)}
        <div>${hasFood ? `<p class="kicker">Teahouse card</p><p><b class="zh">${food.hz}</b> ${pyHTML(food.py)}</p><p class="fine">${esc(food.en)} · ${esc(food.region)}</p>` : `<p class="kicker">Teahouse</p><p>Learn every word in this lesson to reach the teahouse at this peak.</p>`}</div>
      </section>
      <h2 class="section-title">Words</h2>
      <ul class="word-list">${words.map(w => wordRow(w)).join('')}</ul>`;
    if (hasFood) $('.teahouse-box').onclick = () => showFood(l, n);
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
      <div class="w-btns"><button class="icon-btn" data-say="${w.id}" aria-label="Play ${esc(w.hz)}">${speakIcon}</button><button class="icon-btn" data-tone="${w.id}" aria-label="Tone practice for ${esc(w.hz)}">${micIcon}</button></div>
    </li>`;
  }
  function wireWordRows(root = view) {
    $$('[data-say]', root).forEach(b => b.onclick = e => { e.stopPropagation(); say(W[b.dataset.say].hz.replace(/[（）()]/g, '')); });
    $$('[data-tone]', root).forEach(b => b.onclick = e => { e.stopPropagation(); tonePractice(W[b.dataset.tone]); });
  }

  // ---------- Questions ----------
  function distractors(w, field, count, pool) {
    const same = pool.filter(x => x.id !== w.id && x.ls === w.ls && x.lv === w.lv);
    const others = shuffle(pool.filter(x => x.id !== w.id));
    const seen = new Set([field === 'en' ? w.en : field === 'hz' ? w.hz : Pinyin.stripTones(w.py)]);
    if (field === 'hz') seen.add('py:' + Pinyin.stripTones(w.py).replace(/\s/g, ''));
    const out = [];
    for (const x of [...shuffle(same), ...others]) {
      const key = field === 'en' ? x.en : x.hz;
      if (seen.has(key)) continue;
      if (field === 'hz' && seen.has('py:' + Pinyin.stripTones(x.py).replace(/\s/g, ''))) continue; // avoid homophones
      seen.add(key);
      if (field === 'hz') seen.add('py:' + Pinyin.stripTones(x.py).replace(/\s/g, ''));
      out.push(x);
      if (out.length >= count) break;
    }
    return out;
  }
  function makeQuestion(w, type, pool) {
    const voice = Audio2.available();
    if (type === 'listen' && !voice) type = 'hanzi';
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
    if (q.type === 'meaning') body = `<div class="q-word"><span class="hz xl">${esc(w.hz)}</span><button class="icon-btn" data-say="${w.id}" aria-label="Play">${speakIcon}</button></div>`;
    else if (q.type === 'tones') body = `<div class="q-word"><span class="hz xl">${esc(w.hz)}</span><button class="icon-btn" data-say="${w.id}" aria-label="Play">${speakIcon}</button></div><p class="fine">${esc(w.en)}</p>`;
    else if (q.type === 'listen') body = `<div class="q-word"><button class="listen-btn" data-say="${w.id}" aria-label="Play the word again">${speakIcon}<span>Play again</span></button></div>`;
    else body = `<div class="q-word"><p class="q-en">${esc(w.en)}</p></div>`;
    return `<div class="q">
      <p class="kicker">${q.prompt}${total ? ` · ${idx + 1}/${total}` : ''}</p>
      ${body}
      <div class="options">${q.options.map((o, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd>${o.html}</button>`).join('')}</div>
      <div class="q-feedback" aria-live="polite"></div>
    </div>`;
  }
  // Mount a question; resolves with true/false once answered and continued.
  function askQuestion(container, q, idx, total) {
    return new Promise(resolve => {
      container.innerHTML = questionHTML(q, idx, total);
      wireWordRows(container);
      if (q.type === 'listen' || (S().settings.autoplay && q.type !== 'hanzi')) setTimeout(() => say(q.w.hz.replace(/[（）()]/g, '')), 150);
      let answered = false;
      const choose = i => {
        if (answered) return;
        answered = true;
        const ok = q.options[i].correct;
        $$('.opt', container).forEach((b, k) => {
          b.disabled = true;
          if (q.options[k].correct) b.classList.add('right');
          else if (k === i) b.classList.add('wrong');
        });
        const w = q.w;
        $('.q-feedback', container).innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? 'Nice!' : 'Not quite.'}</b>
          <span class="hz">${esc(w.hz)}</span> ${pyHTML(w.py)} <span class="fine">${esc(w.en)}</span></div>
          <button class="btn primary" id="cont" data-autofocus>Continue</button>`;
        if (!ok || q.type === 'hanzi') say(w.hz.replace(/[（）()]/g, ''));
        const btn = $('#cont', container);
        btn.focus();
        const done = () => { document.removeEventListener('keydown', key2); resolve(ok); };
        btn.onclick = done;
        const key2 = e => { if (e.key === 'Enter' && document.activeElement !== btn) { e.preventDefault(); done(); } };
        setTimeout(() => document.addEventListener('keydown', key2), 50);
        document.removeEventListener('keydown', key1);
      };
      const key1 = e => { if (/^[1-4]$/.test(e.key) && modal.hidden) choose(+e.key - 1); };
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
        <button class="btn" data-say="${w.id}">${speakIcon} Listen</button>
        <button class="btn" data-tone="${w.id}">${micIcon} Tone practice</button>
      </div>
    </article>`;
  }
  async function viewLearn(l, n) {
    renderTabs(null, true);
    const Ls = lv(l) && lv(l).lessons[n - 1];
    if (!Ls || lessonStatus(l, n) === 'locked') { location.hash = '#/'; return; }
    const pool = lv(l).words;
    let todo = Ls.words.filter(id => !Store.isLearned(id)).map(id => W[id]);
    const total = Ls.words.length;
    const shell = () => {
      const learned = learnedCount(Ls.words);
      view.innerHTML = `<header class="session-top"><a class="x" href="#/lesson/${l}/${n}" aria-label="Close">✕</a>
        <div class="progress"><div style="width:${(learned / total) * 100}%"></div></div><span class="count">${learned}/${total}</span></header>
        <div id="stage" class="stage"></div>`;
      return $('#stage');
    };
    if (!todo.length) { finishLesson(l, n); return; }
    const myRoute = location.hash;
    const alive = () => location.hash === myRoute;
    while (todo.length && alive()) {
      const batch = todo.slice(0, 5);
      // introduce
      for (let i = 0; i < batch.length && alive(); i++) {
        const stage = shell();
        stage.innerHTML = introCard(batch[i]) + `<button class="btn primary big" id="nx" data-autofocus>${i < batch.length - 1 ? 'Next word' : 'Quick check'}</button>`;
        wireWordRows(stage);
        if (S().settings.autoplay) setTimeout(() => say(batch[i].hz.replace(/[（）()]/g, '')), 200);
        $('#nx').focus();
        await new Promise(res => {
          $('#nx').onclick = res;
          cleanup = res;
        });
      }
      if (!alive()) return;
      // quiz the batch
      const firstTry = {};
      let queue = batch.map((w, i) => ({ w, type: ['meaning', 'listen', 'hanzi', 'tones'][i % 4] }));
      let k = 0;
      while (queue.length && alive()) {
        const item = queue.shift();
        const stage = shell();
        const ok = await askQuestion(stage, makeQuestion(item.w, item.type, pool), k, 0);
        k++;
        if (!(item.w.id in firstTry)) firstTry[item.w.id] = ok;
        if (!ok) queue.splice(Math.min(2, queue.length), 0, { w: item.w, type: item.type === 'tones' ? 'meaning' : item.type });
      }
      if (!alive()) return;
      batch.forEach(w => Store.learn(w.id, firstTry[w.id] !== false));
      todo = todo.slice(batch.length);
      const tc = Store.todayCounter();
      if (todo.length && tc.newLearned >= S().settings.newPerDay) {
        const stage = shell();
        stage.innerHTML = `<section class="done-box"><div>${hikerSvg(110)}</div><h2>Today's goal reached</h2>
          <p>You've learned ${tc.newLearned} new words today. They'll come back for review tomorrow.</p>
          <div class="actions"><a class="btn primary" href="#/">Rest here</a><button class="btn" id="more">Keep climbing</button></div></section>`;
        const goOn = await new Promise(res => { $('#more').onclick = () => res(true); cleanup = () => res(false); });
        if (!goOn || !alive()) return;
      }
    }
    if (alive() && !todo.length) finishLesson(l, n);
  }

  function finishLesson(l, n) {
    const key = lkey(l, n);
    const already = lessonState(l, n) === 'done';
    S().lessonsDone[key] = Date.now();
    const rewards = [];
    if (!S().foods.includes(key)) { S().foods.push(key); rewards.push({ kind: 'food', l, n }); }
    SH_GEAR.filter(g => g.level === l && g.at === n && !S().gear.includes(g.id)).forEach(g => { S().gear.push(g.id); rewards.push({ kind: 'gear', g }); });
    Store.save();
    const summit = n === lv(l).lessons.length;
    location.hash = `#/level/${l}`;
    setTimeout(() => {
      if (!rewards.length && already) return;
      showRewards(rewards, summit ? `You reached the summit of HSK ${l}!` : `Peak ${n} reached!`, summit ? 'Next: the descent. Review the whole mountain to unlock the next one.' : '');
    }, 250);
  }

  function showRewards(list, title, sub) {
    if (!list.length) { toast(title); return; }
    const r = list[0];
    const rest = list.slice(1);
    const next = () => (rest.length ? showRewards(rest, title, sub) : closeModal());
    if (r.kind === 'food') {
      const f = SH_FOODS[r.l][r.n - 1];
      openModal(`<p class="kicker">${esc(title)}</p>
        <div class="reward-art">${Art.teahouse(60)}</div>
        <h2>Welcome to the teahouse</h2>
        <p class="fine">They saved you something to eat:</p>
        ${foodCardHTML(f)}
        ${sub ? `<p class="fine">${esc(sub)}</p>` : ''}
        <button class="btn primary big" id="ok" data-autofocus>${rest.length ? 'Next' : 'Back to the trail'}</button>`, el => {
        $('#ok', el).onclick = next;
        $$('[data-say-text]', el).forEach(b => b.onclick = () => say(b.dataset.sayText));
      });
    } else {
      const g = r.g;
      openModal(`<p class="kicker">New gear unlocked</p>
        <div class="reward-art">${Art.hiker(S().hiker, Object.assign({}, S().equipped, { [g.slot]: g.id }), { size: 120 })}</div>
        <h2><span class="zh">${g.hz}</span> ${pyHTML(g.py)}</h2>
        <p><b>${esc(g.en)}</b></p><p class="fine">${esc(g.fact)}</p>
        <div class="actions"><button class="btn primary" id="eq" data-autofocus>Wear it</button><button class="btn" id="ok">Later</button></div>`, el => {
        $('#eq', el).onclick = () => {
          S().equipped[g.slot] = g.id; Store.save();
          if (rest.length) next(); else { closeModal(); route(); }
        };
        $('#ok', el).onclick = next;
      });
    }
  }
  function foodCardHTML(f) {
    return `<div class="food-card">${Art.plate(f.hz[0], 84)}
      <div><p class="food-hz"><span class="zh">${f.hz}</span> <button class="icon-btn" data-say-text="${esc(f.hz)}" aria-label="Play">${speakIcon}</button></p>
      <p>${pyHTML(f.py)} · <b>${esc(f.en)}</b></p><p class="fine">${esc(f.region)}</p><p>${esc(f.fact)}</p></div></div>`;
  }
  function showFood(l, n) {
    const f = SH_FOODS[l][n - 1];
    openModal(`<p class="kicker">HSK ${l} · Lesson ${n} teahouse</p>${foodCardHTML(f)}<button class="btn primary" id="ok" data-autofocus>Close</button>`, el => {
      $('#ok', el).onclick = closeModal;
      $$('[data-say-text]', el).forEach(b => b.onclick = () => say(b.dataset.sayText));
    });
  }

  // ---------- Flashcards (due / lesson / weak) ----------
  function viewCards(mode, l, n) {
    renderTabs(mode === 'due' ? 'review' : mode === 'weak' ? 'weak' : 'home', true);
    let ids;
    let backHref = '#/';
    let title = 'Review';
    if (mode === 'due') { ids = Store.dueIds(); title = 'Today\'s review'; }
    else if (mode === 'weak') { ids = shuffle(Store.weakIds()); title = 'Weak words'; backHref = '#/weak'; }
    else {
      if (!lv(l) || !lv(l).lessons[n - 1]) { location.hash = '#/'; return; }
      ids = shuffle(lv(l).lessons[n - 1].words.filter(id => Store.isLearned(id)));
      title = `Lesson ${n} review`; backHref = `#/lesson/${l}/${n}`;
    }
    if (!ids.length) {
      renderTabs(mode === 'due' ? 'review' : 'weak');
      const cur = currentLesson();
      view.innerHTML = `<section class="done-box"><div>${hikerSvg(110)}</div>
        <h2>${mode === 'weak' ? 'No weak words right now' : 'Nothing to review right now'}</h2>
        <p>${mode === 'weak' ? 'Words you mark "Again" or "Hard", or miss in a quiz, will gather here.' : 'Cards come back on the day you are about to forget them.'}</p>
        <div class="actions">${cur ? `<a class="btn primary" href="${cur.descent ? `#/descent/${cur.l}` : `#/learn/${cur.l}/${cur.n}`}">${cur.descent ? 'Start the descent' : 'Learn new words'}</a>` : ''}<a class="btn" href="#/">Back to the mountain</a></div></section>`;
      return;
    }
    const queue = ids.slice();
    let done = 0, right = 0;
    const totalStart = queue.length;
    const myRoute = location.hash;
    const show = () => {
      if (location.hash !== myRoute) return;
      if (!queue.length) return summary();
      const w = W[queue[0]];
      let flipped = false;
      const c = S().cards[w.id];
      const prev = c ? previewIntervals(c) : ['10m', '1d', '1d', '3d'];
      view.innerHTML = `<header class="session-top"><a class="x" href="${backHref}" aria-label="Close">✕</a>
          <div class="progress"><div style="width:${(done / (done + queue.length)) * 100}%"></div></div><span class="count">${queue.length} left</span></header>
        <p class="kicker center">${esc(title)}</p>
        <article class="card flash" id="card" tabindex="0" aria-live="polite">
          <div class="hz xxl">${esc(w.hz)}</div>
          ${S().settings.pinyinOnFront ? `<div class="py lg">${Pinyin.toneHTML(w.py)}</div>` : ''}
          <div class="card-back" hidden>
            ${S().settings.pinyinOnFront ? '' : `<div class="py lg">${Pinyin.toneHTML(w.py)}</div>`}
            <p class="meaning"><span class="pos">${esc(w.pos)}</span> ${esc(w.en)}</p>
            <p class="fine">HSK ${w.lv} · Lesson ${w.ls}</p>
            <div class="card-btns"><button class="btn" data-say="${w.id}">${speakIcon} Listen</button><button class="btn" data-tone="${w.id}">${micIcon} Tone practice</button></div>
          </div>
          <p class="tap-hint">Tap to flip · Space</p>
        </article>
        <div class="grade" hidden>
          <button class="g g0" data-g="0"><b>Again</b><small>${prev[0]}</small></button>
          <button class="g g1" data-g="1"><b>Hard</b><small>${prev[1]}</small></button>
          <button class="g g2" data-g="2"><b>Good</b><small>${prev[2]}</small></button>
          <button class="g g3" data-g="3"><b>Easy</b><small>${prev[3]}</small></button>
        </div>`;
      wireWordRows(view);
      const card = $('#card');
      const flip = () => {
        if (flipped) return;
        flipped = true;
        $('.card-back', card).hidden = false; $('.tap-hint', card).hidden = true; $('.grade').hidden = false;
        card.classList.add('flipped');
        if (S().settings.autoplay) say(w.hz.replace(/[（）()]/g, ''));
      };
      card.onclick = e => { if (!e.target.closest('button')) flip(); };
      const gradeIt = g => {
        Store.grade(w.id, g);
        queue.shift();
        done++;
        if (g >= 2) right++;
        if (g === 0) queue.splice(Math.min(3, queue.length), 0, w.id);
        show();
      };
      $$('.g').forEach(b => b.onclick = () => gradeIt(+b.dataset.g));
      const key = e => {
        if (!modal.hidden) return;
        if ((e.key === ' ' || e.key === 'Enter') && !flipped) { e.preventDefault(); flip(); }
        else if (flipped && /^[1-4]$/.test(e.key)) { document.removeEventListener('keydown', key); gradeIt(+e.key - 1); }
      };
      document.addEventListener('keydown', key);
      cleanup = () => document.removeEventListener('keydown', key);
      card.focus();
    };
    const summary = () => {
      renderTabs(mode === 'due' ? 'review' : mode === 'weak' ? 'weak' : 'home');
      const cur = currentLesson();
      const weakNow = Store.weakIds().length;
      view.innerHTML = `<section class="done-box"><div>${hikerSvg(110)}</div>
        <h2>Review done</h2>
        <p>${totalStart} card${totalStart > 1 ? 's' : ''} · ${Math.round((right / Math.max(1, done)) * 100)}% remembered on the first look or after.</p>
        ${weakNow ? `<p class="fine">${weakNow} word${weakNow > 1 ? 's are' : ' is'} in your Weak words deck.</p>` : ''}
        <div class="actions">${mode === 'due' && cur && !cur.descent ? `<a class="btn primary" href="#/learn/${cur.l}/${cur.n}">Continue climbing: Lesson ${cur.n}</a>` : ''}
        ${mode === 'due' && cur && cur.descent ? `<a class="btn primary" href="#/descent/${cur.l}">Start the descent</a>` : ''}
        <a class="btn" href="#/">Back to the mountain</a></div></section>`;
    };
    show();
  }
  function previewIntervals(c) {
    const fmt = d => (d < 1 ? '10m' : d < 30 ? `${Math.round(d)}d` : `${Math.round(d / 30)}mo`);
    const good = c.reps === 0 ? 1 : c.reps === 1 ? 3 : c.interval * c.ease;
    const easy = c.reps === 0 ? 3 : c.reps === 1 ? 6 : c.interval * c.ease * 1.3;
    return ['10m', fmt(Math.max(1, (c.interval || 1) * 1.2)), fmt(good), fmt(easy)];
  }

  // ---------- Weak words ----------
  function viewWeak() {
    renderTabs('weak');
    const ids = Store.weakIds();
    const words = ids.map(id => W[id]).sort((a, b) => a.lv - b.lv || a.ls - b.ls);
    view.innerHTML = `<header class="page-head"><h1>Weak words</h1>
      <p>Words you marked <b>Again</b> or <b>Hard</b>, or missed in a quiz. They leave this deck after you get them right twice in a row (or tap <b>Easy</b>).</p></header>
      ${words.length ? `<a class="btn primary big" href="#/weak/practice">Practice ${words.length} weak word${words.length > 1 ? 's' : ''}</a>
      <ul class="word-list">${words.map(wordRow).join('')}</ul>` :
        `<section class="done-box"><div>${hikerSvg(100)}</div><p>Nothing here yet — nice and steady.</p></section>`}`;
    wireWordRows();
  }

  // ---------- Descent ----------
  async function viewDescent(l) {
    renderTabs(null, true);
    if (!lv(l)) { location.hash = '#/'; return; }
    const st = descentState(l);
    if (st === 'locked') { toast('Reach the summit first'); location.hash = `#/level/${l}`; return; }
    const pool = lv(l).words;
    const N = Math.min(40, pool.length);
    view.innerHTML = `<header class="session-top"><a class="x" href="#/level/${l}" aria-label="Close">✕</a><span class="count">Descent · HSK ${l}</span></header>
      <section class="done-box"><div>${hikerSvg(110)}</div><h2>The descent</h2>
      <p>${N} questions from all of HSK ${l}: meanings, listening, characters and tones. Get <b>80%</b> to reach base camp${l < 3 ? ` and unlock the HSK ${l + 1} mountain` : ''}.</p>
      <p class="fine">Anything you miss goes to your Weak words deck. An exam-format mock test is coming in a later version.</p>
      <button class="btn primary big" id="begin" data-autofocus>Begin descent</button></section>`;
    await new Promise(res => { $('#begin').onclick = res; });
    const myRoute = location.hash;
    const qs = shuffle(pool).slice(0, N).map((w, i) => ({ w, type: ['meaning', 'listen', 'hanzi', 'tones'][i % 4] }));
    let score = 0;
    const missed = [];
    for (let i = 0; i < qs.length; i++) {
      if (location.hash !== myRoute) return;
      view.innerHTML = `<header class="session-top"><a class="x" href="#/level/${l}" aria-label="Close">✕</a>
        <div class="progress descent"><div style="width:${(i / qs.length) * 100}%"></div></div><span class="count">${i + 1}/${qs.length}</span></header><div id="stage" class="stage"></div>`;
      const ok = await askQuestion($('#stage'), makeQuestion(qs[i].w, qs[i].type, pool), i, qs.length);
      if (ok) score++; else { missed.push(qs[i].w); Store.grade(qs[i].w.id, 0); }
    }
    const pct = Math.round((score / qs.length) * 100);
    const pass = pct >= 80;
    let rewards = [];
    if (pass) {
      const prevBest = S().descended[l] && S().descended[l].score;
      S().descended[l] = { score: Math.max(pct, prevBest || 0), at: Date.now() };
      if (l < 3 && !S().unlockedLevels.includes(l + 1)) S().unlockedLevels.push(l + 1);
      SH_GEAR.filter(g => g.level === l && g.at === 'descent' && !S().gear.includes(g.id)).forEach(g => { S().gear.push(g.id); rewards.push({ kind: 'gear', g }); });
      if (l < 3) S().viewLevel = l + 1;
      Store.save();
    }
    renderTabs('home');
    view.innerHTML = `<section class="done-box"><div>${hikerSvg(110)}</div>
      <h2>${pass ? (l < 3 ? 'Base camp reached!' : 'You descended the last mountain!') : 'Almost there'}</h2>
      <p class="big-score">${pct}%</p>
      <p>${pass ? (l < 3 ? `The HSK ${l + 1} mountain is now open.` : 'You have climbed all of HSK 1–3. 了不起！') : 'You need 80% to reach base camp. Practice your weak words and try again.'}</p>
      ${missed.length ? `<details><summary>${missed.length} word${missed.length > 1 ? 's' : ''} to work on</summary><ul class="word-list">${missed.map(wordRow).join('')}</ul></details>` : ''}
      <div class="actions">${pass ? `<a class="btn primary" href="#/level/${Math.min(3, l + 1)}">${l < 3 ? `Go to HSK ${l + 1}` : 'Back to the mountain'}</a>` : `<a class="btn primary" href="#/weak/practice">Practice weak words</a><a class="btn" href="#/descent/${l}">Try again</a>`}</div></section>`;
    wireWordRows();
    if (rewards.length) setTimeout(() => showRewards(rewards, 'Descent complete', ''), 300);
  }

  // ---------- Tone practice ----------
  function tonePractice(w) {
    const syls = Pinyin.syllables(w.py).filter(Boolean);
    const single = syls.length === 1;
    let mode = 'shadow';
    let busy = false;
    const text = w.hz.replace(/[（）()]/g, '');
    openModal(`<div class="tone-box">
      <div class="tone-tabs" role="tablist"><button role="tab" data-m="shadow" class="on">1 · Shadow</button><button role="tab" data-m="solo">2 · On your own</button></div>
      <div class="hz xl center">${esc(w.hz)}</div>
      <div class="py lg center tone-py">${Pinyin.toneHTML(w.py)}</div>
      <canvas id="tc" class="tone-canvas" aria-label="Pitch chart"></canvas>
      <p class="tone-msg" aria-live="polite"></p>
      <div class="actions"><button class="btn" id="tlisten">${speakIcon} Listen</button><button class="btn primary" id="trec">${micIcon} Record</button></div>
      <p class="fine">The colored lines show each tone's shape. Your voice is drawn in navy. Tone checking is approximate — use it as a mirror, not a judge.</p>
      <button class="btn ghost" id="tclose">Done</button></div>`, el => {
      const canvas = $('#tc', el), msg = $('.tone-msg', el), pyEl = $('.tone-py', el);
      const paint = pts => Art.drawTones(canvas, syls, pts);
      const setMode = m => {
        mode = m;
        $$('[data-m]', el).forEach(b => b.classList.toggle('on', b.dataset.m === m));
        pyEl.style.visibility = m === 'solo' ? 'hidden' : 'visible';
        canvas.style.visibility = m === 'solo' ? 'hidden' : 'visible';
        $('#tlisten', el).hidden = m === 'solo';
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
        btn.classList.add('rec'); btn.innerHTML = `${micIcon} Recording…`;
        msg.textContent = 'Speak now';
        const ms = 1300 + syls.length * 550;
        try {
          const track = await Audio2.record(ms, tr => {
            if (mode === 'shadow') { const c = Audio2.contour(tr); if (c) paint(c); }
          });
          const pts = Audio2.contour(track);
          pyEl.style.visibility = 'visible';
          canvas.style.visibility = 'visible';
          paint(pts);
          S().stats.toneTries += 1; Store.markActive(); Store.save();
          if (!pts) msg.textContent = 'I couldn\'t hear a clear voice. Try again a bit closer to the mic.';
          else if (single && syls[0].tone !== 5) {
            const g = Audio2.guessTone(pts);
            const names = { 1: 'high and level', 2: 'rising', 3: 'dipping', 4: 'falling' };
            if (g && g.tone === syls[0].tone) msg.innerHTML = `<b class="ok">Sounds like tone ${g.tone} — ${names[g.tone]}. Nice!</b>`;
            else if (g) msg.innerHTML = `Sounded more like tone ${g.tone} (${g.note}). Aim for tone ${syls[0].tone}: <b>${names[syls[0].tone]}</b>.`;
          } else msg.textContent = 'Compare your navy line with the colored shapes.';
        } catch (err) {
          msg.textContent = err && err.message === 'nomic' ? 'This browser can\'t use the microphone.' : 'Microphone blocked. Allow mic access for this site in your browser settings, then try again.';
        }
        btn.classList.remove('rec'); btn.innerHTML = `${micIcon} Record again`;
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
    const where = g => `HSK ${g.level} · ${g.at === 'descent' ? 'descent' : `Lesson ${g.at}`}`;
    const foodsTotal = [1, 2, 3].reduce((s, l) => s + SH_FOODS[l].length, 0);
    view.innerHTML = `<header class="page-head"><h1>${h.name ? esc(h.name) : 'Your hiker'}</h1></header>
      <section class="hiker-panel">
        <div class="hiker-stage">${hikerSvg(150)}</div>
        <div class="hiker-controls">
          <div class="pick-row" aria-label="Hiker">${['a', 'b', 'c'].map((b, i) => `<button class="pick ${h.base === b ? 'on' : ''}" data-base="${b}" aria-pressed="${h.base === b}">${Art.hiker({ base: b, skin: h.skin }, {}, { size: 44 })}<span>${'ABC'[i]}</span></button>`).join('')}</div>
          <div class="pick-row skins">${[0, 1, 2].map(s => `<button class="swatch s${s} ${h.skin === s ? 'on' : ''}" data-skin="${s}" aria-label="Skin tone ${s + 1}" aria-pressed="${h.skin === s}"></button>`).join('')}</div>
        </div>
      </section>
      <h2 class="section-title">Gear <span class="fine">${S().gear.length}/${SH_GEAR.length}</span></h2>
      <p class="fine">Unlock gear at big peaks and descents. Tap to wear or take off.</p>
      <div class="gear-grid">${SH_GEAR.map(g => {
        const have = S().gear.includes(g.id), on = S().equipped[g.slot] === g.id;
        return `<button class="gear ${have ? '' : 'locked'} ${on ? 'on' : ''}" data-gear="${g.id}" ${have ? '' : 'aria-disabled="true"'}>
          <span class="zh">${have ? g.hz : '？'}</span><b>${have ? esc(g.en) : 'Locked'}</b><small>${have ? (on ? 'Wearing' : slots[g.slot]) : where(g)}</small></button>`;
      }).join('')}</div>
      <h2 class="section-title">Teahouse cards <span class="fine">${S().foods.length}/${foodsTotal}</span></h2>
      ${[1, 2, 3].map(l => `<h3 class="sub">HSK ${l}</h3><div class="food-grid">${SH_FOODS[l].map((f, i) => {
        const have = S().foods.includes(lkey(l, i + 1));
        return `<button class="food ${have ? '' : 'locked'}" data-food="${l}-${i + 1}" aria-label="${have ? esc(f.en) : `Locked: Lesson ${i + 1}`}">${Art.plate(f.hz[0], 56, !have)}<small>${have ? esc(f.hz) : `L${i + 1}`}</small></button>`;
      }).join('')}</div>`).join('')}`;
    $$('[data-base]').forEach(b => b.onclick = () => { S().hiker.base = b.dataset.base; Store.save(); viewHiker(); });
    $$('[data-skin]').forEach(b => b.onclick = () => { S().hiker.skin = +b.dataset.skin; Store.save(); viewHiker(); });
    $$('[data-gear]').forEach(b => b.onclick = () => {
      const g = SH_GEAR.find(x => x.id === b.dataset.gear);
      if (!S().gear.includes(g.id)) { toast(`Unlocks at ${where(g)}`); return; }
      if (S().equipped[g.slot] === g.id) delete S().equipped[g.slot];
      else S().equipped[g.slot] = g.id;
      Store.save(); viewHiker();
      openGearInfo(g);
    });
    $$('[data-food]').forEach(b => b.onclick = () => {
      const [l, n] = b.dataset.food.split('-').map(Number);
      if (!S().foods.includes(lkey(l, n))) { toast(`Finish HSK ${l} Lesson ${n} to collect this card`); return; }
      showFood(l, n);
    });
  }
  function openGearInfo(g) {
    const on = S().equipped[g.slot] === g.id;
    toast(`${on ? 'Wearing' : 'Took off'}: ${g.hz} ${g.en}`);
  }

  // ---------- Settings ----------
  function viewSettings() {
    renderTabs('settings');
    const st = S().settings;
    const voice = Audio2.available();
    const stats = S().stats;
    const learned = Object.keys(S().cards).length;
    view.innerHTML = `<header class="page-head"><h1>Settings</h1></header>
      <section class="settings">
        <div class="stat-row"><div><b>${learned}</b><span>words learned</span></div><div><b>${stats.reviews}</b><span>reviews</span></div><div><b>${stats.reviews ? Math.round((stats.correct / stats.reviews) * 100) : 0}%</b><span>remembered</span></div><div><b>${stats.toneTries}</b><span>tone tries</span></div></div>
        <label class="field">New words per day <output>${st.newPerDay}</output><input type="range" min="5" max="30" step="1" id="s-new" value="${st.newPerDay}"></label>
        <label class="field">Weekly goal (days) <output>${st.weeklyGoal}</output><input type="range" min="1" max="7" step="1" id="s-goal" value="${st.weeklyGoal}"></label>
        <label class="field">Voice speed <output>${st.rate.toFixed(2)}×</output><input type="range" min="0.5" max="1.2" step="0.05" id="s-rate" value="${st.rate}"></label>
        <p class="fine">${voice ? 'Using your device\'s built-in Chinese voice.' : 'No Chinese voice found on this device. On Windows, add Chinese (Simplified) speech in language settings; on Android, install Google Speech Services.'}</p>
        <button class="btn" id="s-test">${speakIcon} Test voice: 你好，欢迎！</button>
        <label class="toggle"><input type="checkbox" id="s-auto" ${st.autoplay ? 'checked' : ''}> Play audio automatically</label>
        <label class="toggle"><input type="checkbox" id="s-pyf" ${st.pinyinOnFront ? 'checked' : ''}> Show pinyin on the front of flashcards</label>
        <h2 class="section-title">Starting point</h2>
        <p class="fine">Skip ahead if you already know earlier lessons. Skipped lessons stay open — learn them any time to collect their teahouse cards.</p>
        ${placementPicker()}
        <button class="btn" id="s-place">Start me here</button>
        <h2 class="section-title">Your progress file</h2>
        <p class="fine">Progress lives in this browser only. Download it to keep a backup or move to another device.</p>
        <div class="actions"><button class="btn" id="s-export">Download progress</button><label class="btn file">Load progress<input type="file" id="s-import" accept="application/json,.json" hidden></label></div>
        <button class="btn danger" id="s-reset">Reset everything</button>
        <h2 class="section-title">About</h2>
        <p class="fine">Shang Hike (上 Hike) — 上 means "up", and it's the 上 in 上海. Vocabulary follows the lesson word lists of the <i>New HSK Course</i> textbooks for levels 1–3 (HSK 3.0); English glosses, food and gear notes were written for this site. Audio uses your browser's speech voice. Made by Alea with Claude.</p>
      </section>`;
    const bindRange = (id, key, fmt) => { const r = $(id); r.oninput = () => { st[key] = +r.value; r.previousElementSibling.textContent = fmt ? fmt(st[key]) : st[key]; Store.save(); }; };
    bindRange('#s-new', 'newPerDay'); bindRange('#s-goal', 'weeklyGoal'); bindRange('#s-rate', 'rate', v => `${v.toFixed(2)}×`);
    $('#s-test').onclick = () => say('你好，欢迎！');
    $('#s-auto').onchange = e => { st.autoplay = e.target.checked; Store.save(); };
    $('#s-pyf').onchange = e => { st.pinyinOnFront = e.target.checked; Store.save(); };
    const c = currentLesson();
    wirePlacement(c && !c.descent ? c : { l: 1, n: 1 });
    $('#s-place').onclick = () => {
      const l = +$('#pl-l').value, n = +$('#pl-n').value;
      openModal(`<h2>Start at HSK ${l}, Lesson ${n}?</h2><p>Earlier lessons will be marked as passed. Your learned words and rewards stay as they are.</p>
        <div class="actions"><button class="btn primary" id="y" data-autofocus>Yes, move me</button><button class="btn" id="n">Cancel</button></div>`, el => {
        $('#y', el).onclick = () => { applyPlacement(l, n); Store.save(); closeModal(); location.hash = `#/level/${l}`; };
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
      rd.onload = () => { try { Store.importJSON(rd.result); toast('Progress loaded'); location.hash = '#/'; } catch (err) { toast('That file isn\'t a Shang Hike progress file'); } };
      rd.readAsText(f);
    };
    $('#s-reset').onclick = () => openModal(`<h2>Reset everything?</h2><p>This deletes your hiker, words, cards and rewards in this browser. It can't be undone.</p>
      <div class="actions"><button class="btn danger" id="y">Delete my progress</button><button class="btn" id="n" data-autofocus>Cancel</button></div>`, el => {
      $('#y', el).onclick = () => { Store.reset(); closeModal(); location.hash = '#/welcome'; };
      $('#n', el).onclick = closeModal;
    });
  }

  route();
})();
