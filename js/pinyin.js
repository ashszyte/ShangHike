// Pinyin helpers: split a pinyin string into syllables and read their tones.
(function () {
  const MARKS = {
    'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
    'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
    'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
    'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
    'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
    'ǖ': ['ü', 1], 'ǘ': ['ü', 2], 'ǚ': ['ü', 3], 'ǜ': ['ü', 4]
  };
  const INITIALS = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w', ''];
  const FINALS = ['a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng', 'ong', 'er', 'i', 'ia', 'ie', 'iao', 'iu', 'ian', 'in', 'iang', 'ing', 'iong', 'u', 'ua', 'uo', 'uai', 'ui', 'uan', 'un', 'uang', 'ueng', 'ü', 'üe', 'üan', 'ün', 'ue', 'r'];
  const SYL = new Set();
  INITIALS.forEach(i => FINALS.forEach(f => {
    if (f === 'r' && i !== '') return;
    SYL.add(i + f);
  }));
  SYL.add('r'); // erhua tail, e.g. wánr

  function plain(s) {
    let out = '', tones = [];
    for (const ch of s) {
      if (MARKS[ch]) { out += MARKS[ch][0]; tones.push(MARKS[ch][1]); }
      else out += ch;
    }
    return { out, tones };
  }

  // Returns [{text, tone}] syllables. tone 5 = neutral. Erhua 'r' is attached to the previous syllable.
  function syllables(py) {
    const words = py.split(/[\s\-·()（）]+/).filter(Boolean);
    const result = [];
    for (const w0 of words) {
      const mm = w0.match(/^([^A-Za-zÀ-ɏ]*)(.*?)([^A-Za-zÀ-ɏ]*)$/);
      const lead = mm ? mm[1] : '', trail = mm ? mm[3] : '';
      const core = mm ? mm[2] : w0;
      const startLen = result.length;
      const parts = core.split(/['’]/);
      parts.forEach((part, pi) => {
        const chars = Array.from(part);
        const low = chars.map(c => c.toLowerCase());
        const base = low.map(c => (MARKS[c] ? MARKS[c][0] : c)).join('');
        const n = base.length;
        // dp[i] = best split of base[i:]
        const memo = new Map();
        const go = (i) => {
          if (i === n) return [];
          if (memo.has(i)) return memo.get(i);
          let best = null;
          for (let j = Math.min(n, i + 6); j > i; j--) {
            const s = base.slice(i, j);
            if (!SYL.has(s)) continue;
            if (i > 0 && /^[aoe]/.test(s)) continue; // pinyin needs an apostrophe there
            if (s === 'r' && (i === 0 || j !== n)) continue;
            const rest = go(j);
            if (rest) { best = [[i, j], ...rest]; break; }
          }
          memo.set(i, best);
          return best;
        };
        const split = go(0) || [[0, n]];
        split.forEach(([a, b]) => {
          const text = chars.slice(a, b).join('');
          const { tones } = plain(text.toLowerCase());
          if (text.toLowerCase() === 'r' && result.length) {
            result[result.length - 1].text += text;
          } else {
            result.push({ text, tone: tones[0] || 5 });
          }
        });
      });
      if (result.length > startLen) {
        if (lead) result[startLen].text = lead + result[startLen].text;
        if (trail) result[result.length - 1].text += trail;
      } else if (lead + trail) result.push({ text: lead + trail, tone: 5 });
      result.push(null); // word gap
    }
    if (result[result.length - 1] === null) result.pop();
    return result;
  }

  function toneHTML(py) {
    return syllables(py).map(s => s ? `<span class="t${s.tone}">${s.text}</span>` : ' ').join('');
  }

  function stripTones(py) { return plain(py).out; }

  const V = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', 'ü': 'ǖǘǚǜ' };
  function mark(s, tone) {
    if (tone === 5) return s;
    const low = s.toLowerCase();
    let idx = -1;
    if (low.includes('a')) idx = low.indexOf('a');
    else if (low.includes('e')) idx = low.indexOf('e');
    else if (low.includes('ou')) idx = low.indexOf('o');
    else for (let k = low.length - 1; k >= 0; k--) if ('iouü'.includes(low[k])) { idx = k; break; }
    if (idx < 0) return s;
    return s.slice(0, idx) + V[low[idx]][tone - 1] + s.slice(idx + 1);
  }
  function join(syls) {
    let out = '', first = true;
    syls.forEach(s => {
      if (!s) { out += ' '; first = true; return; }
      out += (!first && /^[aoeāáǎàēéěèōóǒò]/i.test(s.text) ? "'" : '') + s.text;
      first = false;
    });
    return out;
  }
  // A version of the pinyin with one or two tones changed (for "which tones?" questions).
  function toneVariant(py, rnd = Math.random) {
    const syls = syllables(py);
    const real = syls.map((s, i) => (s ? i : -1)).filter(i => i >= 0);
    for (let tries = 0; tries < 12; tries++) {
      const copy = syls.map(s => (s ? { ...s } : null));
      const k = real[Math.floor(rnd() * real.length)];
      let t = 1 + Math.floor(rnd() * 4);
      if (t === copy[k].tone) t = (t % 4) + 1;
      copy[k].tone = t;
      copy[k].text = mark(stripTones(copy[k].text), t);
      if (real.length > 2 && rnd() < 0.4) {
        const k2 = real[Math.floor(rnd() * real.length)];
        if (k2 !== k) { const t2 = 1 + Math.floor(rnd() * 4); copy[k2].tone = t2; copy[k2].text = mark(stripTones(copy[k2].text), t2); }
      }
      const out = join(copy);
      if (out !== py) return out;
    }
    return null;
  }

  function normalize(py) { return join(syllables(py)); }

  window.Pinyin = { syllables, toneHTML, stripTones, toneVariant, mark, normalize };
})();
