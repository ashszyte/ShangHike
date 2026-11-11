// Progress storage (this browser only) + spaced repetition scheduling.
(function () {
  const KEY = 'shanghike.v1';
  const DAY = 86400000;

  const defaults = () => ({
    created: Date.now(),
    hiker: null,                 // {base:'a'|'b'|'c', skin:0-2, name:''}
    equipped: {},                // slot -> gear id
    gear: [],                    // unlocked gear ids
    foods: [],                   // unlocked food keys "level-lesson"
    cards: {},                   // word id -> srs state
    lessonsDone: {},             // "level-lesson" -> timestamp
    descended: {},               // level -> {score, at}
    unlockedLevels: [1],
    activeDays: [],              // 'YYYY-MM-DD'
    stats: { reviews: 0, correct: 0, toneTries: 0 },
    settings: { newPerDay: 10, rate: 0.8, autoplay: true, pinyinOnFront: false, weeklyGoal: 4, voiceSource: 'auto', voiceRef: null },
    today: { date: '', newLearned: 0 },
    seenIntro: false,
    grammarDone: {},
    mapAt: null
  });

  let state;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      state = raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
      state.settings = Object.assign(defaults().settings, state.settings || {});
    } catch (e) { state = defaults(); }
    return state;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
  }
  function dayKey(t = Date.now()) {
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function markActive() {
    const k = dayKey();
    if (!state.activeDays.includes(k)) state.activeDays.push(k);
    if (state.activeDays.length > 400) state.activeDays = state.activeDays.slice(-400);
  }
  function todayCounter() {
    const k = dayKey();
    if (state.today.date !== k) state.today = { date: k, newLearned: 0 };
    return state.today;
  }

  // ---- SRS (SM-2 style, gentle) ----
  function newCard() { return { reps: 0, interval: 0, ease: 2.5, due: 0, lapses: 0, weak: false, good: 0, last: 0 }; }

  // grade: 0 again, 1 hard, 2 good, 3 easy
  function grade(id, g) {
    const c = state.cards[id] || newCard();
    const now = Date.now();
    if (g === 0) {
      c.lapses += 1; c.reps = 0; c.interval = 0; c.ease = Math.max(1.3, c.ease - 0.2);
      c.due = now + 10 * 60000; c.weak = true; c.good = 0;
    } else if (g === 1) {
      c.interval = Math.max(1, Math.round((c.interval || 1) * 1.2));
      c.ease = Math.max(1.3, c.ease - 0.15); c.reps += 1; c.weak = true; c.good = 0;
      c.due = now + c.interval * DAY;
    } else {
      if (c.reps === 0) c.interval = g === 3 ? 3 : 1;
      else if (c.reps === 1) c.interval = g === 3 ? 6 : 3;
      else c.interval = Math.round(c.interval * c.ease * (g === 3 ? 1.3 : 1));
      if (g === 3) c.ease += 0.15;
      c.reps += 1; c.good += 1;
      if (g === 3 || c.good >= 2) c.weak = false;
      c.due = now + c.interval * DAY;
    }
    c.last = now;
    state.cards[id] = c;
    state.stats.reviews += 1;
    if (g >= 2) state.stats.correct += 1;
    markActive();
    save();
    return c;
  }
  // First time a word is learned in a lesson.
  function learn(id, correctFirstTry) {
    const c = state.cards[id] || newCard();
    c.reps = 1; c.interval = 1; c.due = Date.now() + DAY; c.last = Date.now();
    c.weak = !correctFirstTry; c.good = correctFirstTry ? 1 : 0;
    state.cards[id] = c;
    todayCounter().newLearned += 1;
    markActive();
    save();
  }
  function dueIds(limit = 80) {
    const now = Date.now();
    return Object.entries(state.cards)
      .filter(([, c]) => c.reps > 0 || c.lapses > 0)
      .filter(([, c]) => c.due <= now)
      .sort((a, b) => a[1].due - b[1].due)
      .slice(0, limit).map(([id]) => id);
  }
  function weakIds() {
    return Object.entries(state.cards).filter(([, c]) => c.weak).map(([id]) => id);
  }
  function isLearned(id) { return !!state.cards[id]; }

  function exportJSON() { return JSON.stringify(state); }
  function importJSON(txt) {
    const obj = JSON.parse(txt);
    if (!obj || typeof obj !== 'object' || !obj.cards) throw new Error('Not a Shang Hike progress file');
    state = Object.assign(defaults(), obj);
    save();
  }
  function reset() { state = defaults(); save(); }

  window.Store = {
    load, save, get s() { return state; }, dayKey, markActive, todayCounter,
    grade, learn, dueIds, weakIds, isLearned, exportJSON, importJSON, reset
  };
})();
