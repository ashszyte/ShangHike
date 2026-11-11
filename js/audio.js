// Pronunciation with the browser's built-in Chinese voice, plus microphone pitch tracking for tone practice.
(function () {
  let voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const vs = speechSynthesis.getVoices();
    const zh = vs.filter(v => /^zh(-|_)?(CN|Hans)?/i.test(v.lang) || /chinese|mandarin|普通话|中文/i.test(v.name));
    const pref = zh.find(v => /CN/i.test(v.lang) && /(Tingting|Xiaoxiao|Yunxi|Google|Microsoft)/i.test(v.name))
      || zh.find(v => /CN/i.test(v.lang)) || zh[0] || null;
    voice = pref;
    return voice;
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  function available() { return 'speechSynthesis' in window && !!(voice || pickVoice()); }

  function speak(text, rate) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) return resolve(false);
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      if (voice || pickVoice()) u.voice = voice;
      u.rate = rate || (window.Store && Store.s ? Store.s.settings.rate : 0.8);
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      speechSynthesis.speak(u);
      setTimeout(() => resolve(true), 6000);
    });
  }

  // ---------- Pitch tracking ----------
  // Autocorrelation pitch detector on short frames. Returns Hz or -1 when unvoiced.
  function detectPitch(buf, sampleRate) {
    const n = buf.length;
    let rms = 0;
    for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / n);
    if (rms < 0.012) return -1;
    const minLag = Math.floor(sampleRate / 500), maxLag = Math.floor(sampleRate / 70);
    let bestLag = -1, best = 0;
    const corr = new Float32Array(maxLag + 2);
    for (let lag = minLag; lag <= maxLag; lag++) {
      let s = 0, e1 = 0, e2 = 0;
      for (let i = 0; i < n - lag; i++) { s += buf[i] * buf[i + lag]; e1 += buf[i] * buf[i]; e2 += buf[i + lag] * buf[i + lag]; }
      const c = s / Math.sqrt(e1 * e2 + 1e-9);
      corr[lag] = c;
      if (c > best) { best = c; bestLag = lag; }
    }
    if (best < 0.75 || bestLag < 0) return -1;
    // parabolic interpolation
    const a = corr[bestLag - 1] || best, b = best, c = corr[bestLag + 1] || best;
    const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
    return sampleRate / (bestLag + (isFinite(shift) ? shift : 0));
  }

  let ctx = null;
  async function record(ms, onFrame) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nomic');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    src.connect(an);
    const buf = new Float32Array(an.fftSize);
    const half = new Float32Array(an.fftSize / 2);
    const track = [];
    const t0 = performance.now();
    return new Promise(resolve => {
      const tick = () => {
        const t = performance.now() - t0;
        an.getFloatTimeDomainData(buf);
        for (let i = 0; i < half.length; i++) half[i] = (buf[2 * i] + buf[2 * i + 1]) / 2; // downsample to keep it light on phones
        const f = detectPitch(half, ctx.sampleRate / 2);
        track.push({ t, f });
        onFrame && onFrame(track);
        if (t < ms) requestAnimationFrame(tick);
        else {
          stream.getTracks().forEach(tr => tr.stop());
          src.disconnect();
          resolve(track);
        }
      };
      requestAnimationFrame(tick);
    });
  }

  // Clean a pitch track into semitones relative to the speaker's median; keep the voiced stretch.
  function contour(track) {
    const voiced = track.filter(p => p.f > 0);
    if (voiced.length < 6) return null;
    // median filter on Hz to drop octave jumps
    const fs = voiced.map(p => p.f);
    const med = fs.slice().sort((a, b) => a - b)[Math.floor(fs.length / 2)];
    const pts = voiced
      .filter(p => p.f > med * 0.6 && p.f < med * 1.7)
      .map(p => ({ t: p.t, st: 12 * Math.log2(p.f / med) }));
    if (pts.length < 6) return null;
    // smooth
    const sm = pts.map((p, i) => {
      const w = pts.slice(Math.max(0, i - 2), i + 3);
      return { t: p.t, st: w.reduce((s, q) => s + q.st, 0) / w.length };
    });
    return sm;
  }

  // Rough tone guess for ONE syllable. Returns {tone, note}.
  function guessTone(pts) {
    if (!pts || pts.length < 6) return null;
    const n = pts.length;
    const seg = k => pts.slice(Math.floor(n * k), Math.max(Math.floor(n * k) + 1, Math.floor(n * (k + 0.25))));
    const avg = a => a.reduce((s, p) => s + p.st, 0) / a.length;
    const start = avg(seg(0)), mid = avg(seg(0.375)), end = avg(seg(0.75));
    const minI = pts.reduce((bi, p, i) => (p.st < pts[bi].st ? i : bi), 0);
    const range = Math.max(...pts.map(p => p.st)) - Math.min(...pts.map(p => p.st));
    const rise = end - start;
    if (range < 2.2) return { tone: 1, note: 'level' };
    if (minI > n * 0.25 && minI < n * 0.8 && start - pts[minI].st > 1 && end - pts[minI].st > 1.2) return { tone: 3, note: 'dipping' };
    if (rise > 1.8) return { tone: 2, note: 'rising' };
    if (rise < -2.5) return { tone: 4, note: 'falling' };
    if (mid < start && mid < end) return { tone: 3, note: 'dipping' };
    return { tone: rise > 0 ? 2 : 4, note: rise > 0 ? 'slightly rising' : 'slightly falling' };
  }

  window.Audio2 = { speak, available, record, contour, guessTone };
})();
