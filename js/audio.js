// Pronunciation (device voice or online voice) and microphone pitch tracking for tone practice.
(function () {
  // ---------------- Speaking ----------------
  let voice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const vs = speechSynthesis.getVoices() || [];
    const zh = vs.filter(v => /^(zh|cmn)([-_](CN|Hans|SG))?$/i.test(v.lang) || /^zh[-_]CN/i.test(v.lang));
    const zhAny = zh.length ? zh : vs.filter(v => /^zh|^cmn/i.test(v.lang) && !/HK|TW|yue/i.test(v.lang));
    voice = zhAny.find(v => /(Xiaoxiao|Yunxi|Tingting|Huihui|Google|Microsoft)/i.test(v.name)) || zhAny[0] || null;
    return voice;
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) { speechSynthesis.onvoiceschanged = pickVoice; }
  }
  const hasDeviceVoice = () => 'speechSynthesis' in window && !!(voice || pickVoice());

  function setting(k, d) { try { return window.Store && Store.s && Store.s.settings[k] != null ? Store.s.settings[k] : d; } catch (e) { return d; } }

  function speakDevice(text, rate) {
    return new Promise(resolve => {
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        if (voice) u.voice = voice;
        u.rate = rate;
        let done = false;
        const fin = ok => { if (!done) { done = true; resolve(ok); } };
        u.onend = () => fin(true);
        u.onerror = () => fin(false);
        // Chrome sometimes drops a speak() that immediately follows cancel()
        setTimeout(() => speechSynthesis.speak(u), 30);
        setTimeout(() => fin(true), 7000);
      } catch (e) { resolve(false); }
    });
  }

  // Online voice: used when the device has no Chinese voice (common on Firefox and on Windows without the Chinese speech pack).
  const ONLINE = [
    t => `https://dict.youdao.com/dictvoice?le=zh&type=2&audio=${encodeURIComponent(t)}`,
    t => `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-CN&q=${encodeURIComponent(t)}`
  ];
  const cache = new Map();
  let current = null;
  function speakOnline(text, rate) {
    return new Promise(resolve => {
      if (current) { try { current.pause(); } catch (e) { /* ignore */ } }
      let i = 0;
      const tryNext = () => {
        if (i >= ONLINE.length) return resolve(false);
        const key = i + '|' + text;
        let a = cache.get(key);
        if (!a) { a = new window.Audio(ONLINE[i](text)); a.preload = 'auto'; cache.set(key, a); }
        i++;
        current = a;
        try { a.playbackRate = Math.max(0.6, Math.min(1.2, rate + 0.15)); } catch (e) { /* ignore */ }
        a.currentTime = 0;
        a.onended = () => resolve(true);
        a.onerror = () => { cache.delete(key); tryNext(); };
        const p = a.play();
        if (p && p.catch) p.catch(err => { if (err && err.name === 'NotAllowedError') resolve(false); else { cache.delete(key); tryNext(); } });
      };
      tryNext();
    });
  }

  function source() {
    const s = setting('voiceSource', 'auto');
    if (s === 'device') return hasDeviceVoice() ? 'device' : 'online';
    if (s === 'online') return 'online';
    return hasDeviceVoice() ? 'device' : 'online';
  }
  function speak(text, rate) {
    rate = rate || setting('rate', 0.8);
    return source() === 'device' ? speakDevice(text, rate) : speakOnline(text, rate);
  }
  const available = () => true;

  // ---------------- Pitch tracking (YIN) ----------------
  function yin(buf, sr, minF = 70, maxF = 480) {
    const n = buf.length;
    const tMin = Math.floor(sr / maxF), tMax = Math.min(Math.floor(sr / minF), Math.floor(n / 2));
    const W = n - tMax;
    const d = new Float32Array(tMax + 1);
    for (let tau = 1; tau <= tMax; tau++) {
      let s = 0;
      for (let i = 0; i < W; i++) { const x = buf[i] - buf[i + tau]; s += x * x; }
      d[tau] = s;
    }
    // cumulative mean normalized difference
    let run = 0;
    const cm = new Float32Array(tMax + 1); cm[0] = 1;
    for (let tau = 1; tau <= tMax; tau++) { run += d[tau]; cm[tau] = d[tau] * tau / (run || 1); }
    let tau = -1;
    for (let t = tMin; t <= tMax; t++) {
      if (cm[t] < 0.15) { while (t + 1 <= tMax && cm[t + 1] < cm[t]) t++; tau = t; break; }
    }
    if (tau < 0) {
      // fall back to global minimum if it's reasonably periodic
      let best = 1, bt = -1;
      for (let t = tMin; t <= tMax; t++) if (cm[t] < best) { best = cm[t]; bt = t; }
      if (best > 0.3) return { f: -1, conf: 0 };
      tau = bt;
    }
    const a = cm[tau - 1] || cm[tau], b = cm[tau], c = cm[tau + 1] || cm[tau];
    const den = a - 2 * b + c;
    const shift = den ? (a - c) / (2 * den) : 0;
    return { f: sr / (tau + (Math.abs(shift) < 1 ? shift : 0)), conf: 1 - b };
  }

  let ctx = null;
  // Records until you've spoken and then paused, or maxMs. onFrame(track, phase) for live drawing.
  async function record(opts, onFrame) {
    const maxMs = (opts && opts.maxMs) || 4000;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('nomic');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } });
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') await ctx.resume();
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    src.connect(an);
    const raw = new Float32Array(an.fftSize);
    const half = new Float32Array(an.fftSize / 2);
    const sr = ctx.sampleRate / 2;
    const track = [];
    const t0 = performance.now();
    let noise = 0, noiseN = 0, voicedAt = -1, lastVoice = -1;
    return new Promise(resolve => {
      const finish = () => {
        stream.getTracks().forEach(tr => tr.stop());
        try { src.disconnect(); } catch (e) { /* ignore */ }
        resolve(track);
      };
      const tick = () => {
        const t = performance.now() - t0;
        an.getFloatTimeDomainData(raw);
        let rms = 0;
        for (let i = 0; i < half.length; i++) { const v = (raw[2 * i] + raw[2 * i + 1]) / 2; half[i] = v; rms += v * v; }
        rms = Math.sqrt(rms / half.length);
        if (t < 180) { noise += rms; noiseN++; }
        const floor = noiseN ? noise / noiseN : 0.003;
        const thr = Math.max(0.006, floor * 2.5);
        let f = -1;
        if (rms > thr) { const r = yin(half, sr); if (r.conf > 0.75) f = r.f; }
        track.push({ t, f, rms });
        if (f > 0) { if (voicedAt < 0) voicedAt = t; lastVoice = t; }
        onFrame && onFrame(track, voicedAt < 0 ? 'waiting' : 'hearing');
        const spokeEnough = voicedAt >= 0 && lastVoice - voicedAt > 180;
        if (t > maxMs || (spokeEnough && t - lastVoice > 480) || (voicedAt < 0 && t > maxMs)) finish();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // Turn a raw track into a smoothed contour in semitones relative to `ref` Hz (or the utterance median).
  function contour(track, ref) {
    const v = track.filter(p => p.f > 0);
    if (v.length < 5) return null;
    const med = v.map(p => p.f).sort((a, b) => a - b)[Math.floor(v.length / 2)];
    // octave error correction
    const fixed = v.map(p => {
      let f = p.f;
      if (f > med * 1.75) f /= 2;
      else if (f < med * 0.58) f *= 2;
      return { t: p.t, f };
    });
    // keep the longest mostly-continuous voiced stretch (gaps < 120ms)
    let best = [], cur = [fixed[0]];
    for (let i = 1; i < fixed.length; i++) {
      if (fixed[i].t - fixed[i - 1].t < 120) cur.push(fixed[i]);
      else { if (cur.length > best.length) best = cur; cur = [fixed[i]]; }
    }
    if (cur.length > best.length) best = cur;
    if (best.length < 5) return null;
    // median filter (5)
    const mf = best.map((p, i) => {
      const w = best.slice(Math.max(0, i - 2), i + 3).map(q => q.f).sort((a, b) => a - b);
      return { t: p.t, f: w[Math.floor(w.length / 2)] };
    });
    const base = ref || med;
    const pts = mf.map(p => ({ t: p.t, st: 12 * Math.log2(p.f / base), f: p.f }));
    // light moving average
    return pts.map((p, i) => {
      const w = pts.slice(Math.max(0, i - 1), i + 2);
      return { t: p.t, f: p.f, st: w.reduce((s, q) => s + q.st, 0) / w.length };
    });
  }

  // Classify one syllable's contour. `rel` = semitones of the contour relative to the speaker's usual pitch (if known).
  function guessTone(pts, opts = {}) {
    if (!pts || pts.length < 5) return null;
    const n = pts.length;
    const a = Math.floor(n * 0.1), b = Math.ceil(n * 0.92);
    const seg = pts.slice(a, Math.max(a + 4, b));
    const m = seg.length;
    const xs = seg.map((p, i) => i / (m - 1));
    const ys = seg.map(p => p.st);
    // quadratic least squares
    let S0 = m, S1 = 0, S2 = 0, S3 = 0, S4 = 0, T0 = 0, T1 = 0, T2 = 0;
    for (let i = 0; i < m; i++) { const x = xs[i], y = ys[i]; S1 += x; S2 += x * x; S3 += x * x * x; S4 += x ** 4; T0 += y; T1 += x * y; T2 += x * x * y; }
    const det = (M) => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
    const A = [[S4, S3, S2], [S3, S2, S1], [S2, S1, S0]];
    const D = det(A) || 1e-9;
    const qa = det([[T2, S3, S2], [T1, S2, S1], [T0, S1, S0]]) / D;
    const qb = det([[S4, T2, S2], [S3, T1, S1], [S2, T0, S0]]) / D;
    const qc = det([[S4, S3, T2], [S3, S2, T1], [S2, S1, T0]]) / D;
    const f = x => qa * x * x + qb * x + qc;
    const start = f(0), end = f(1);
    let minX = 0, minY = start;
    for (let k = 1; k <= 20; k++) { const x = k / 20, y = f(x); if (y < minY) { minY = y; minX = x; } }
    const hi = Math.max(...ys), lo = Math.min(...ys);
    const range = hi - lo;
    const rise = end - start;
    const hasRef = !!opts.hasRef; // contour is relative to the speaker's usual pitch
    const level = hasRef ? ys.reduce((q, y) => q + y, 0) / m : null;
    let tone, sure = true, note;
    if (minX > 0.18 && minX < 0.85 && start - minY > 1.2 && end - minY > 1.6) { tone = 3; note = 'dipping'; }
    else if (rise >= 2.3) { tone = 2; note = 'rising'; }
    else if (rise <= -3) {
      if (hasRef && start < 0.5 && end < -3) { tone = 3; note = 'low and falling'; }
      else { tone = 4; note = 'falling'; }
    }
    else if (range < 2.6 && Math.abs(rise) < 2) {
      if (level != null && level < -2.5) { tone = 3; note = 'low'; sure = false; }
      else { tone = 1; note = 'level'; }
    }
    else { tone = rise > 0 ? 2 : 4; note = rise > 0 ? 'slightly rising' : 'slightly falling'; sure = false; }
    return { tone, note, sure, rise, range };
  }

  // Expected tones after common tone changes: 3+3 → 2+3, 一/不 rules are already written in the textbook pinyin.
  function sandhi(tones) {
    const out = tones.slice();
    for (let i = out.length - 2; i >= 0; i--) if (out[i] === 3 && out[i + 1] === 3) out[i] = 2;
    return out;
  }

  // Split a word contour into syllables by time and judge each.
  function judgeWord(pts, tones, hasRef) {
    if (!pts) return null;
    const exp = sandhi(tones);
    const n = exp.length;
    if (n === 1) { const g = guessTone(pts, { hasRef }); return g ? [{ expected: exp[0], got: g }] : null; }
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = t0 + ((t1 - t0) * i) / n, b = t0 + ((t1 - t0) * (i + 1)) / n;
      const part = pts.filter(p => p.t >= a && p.t <= b);
      out.push({ expected: exp[i], got: exp[i] === 5 ? { tone: 5, note: 'neutral', sure: false } : guessTone(part, { hasRef }) });
    }
    return out;
  }

  window.Audio2 = { speak, available, hasDeviceVoice, source, record, contour, guessTone, judgeWord, sandhi, yin };
})();
