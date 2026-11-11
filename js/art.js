// SVG / canvas art: the hiker, the mountain, teahouses, food plates and tone charts.
(function () {
  const SKIN = ['#F5D3B5', '#D9A57B', '#9C6B4A'];
  const HAIR = '#1F1A1C';

  function hiker(h, eq, opts = {}) {
    h = h || { base: 'a', skin: 0 };
    eq = eq || {};
    const skin = SKIN[h.skin || 0];
    const id = 'h' + Math.random().toString(36).slice(2, 7);
    const shirt = '#2F5DA8';
    const parts = [];
    parts.push(`<ellipse cx="60" cy="144" rx="30" ry="5" fill="#14274E" opacity=".12"/>`);
    // back: backpack
    if (eq.back === 'panda') {
      parts.push(`<circle cx="38" cy="58" r="7" fill="#1F1A1C"/><circle cx="82" cy="58" r="7" fill="#1F1A1C"/>
        <rect x="30" y="60" width="60" height="50" rx="20" fill="#FBFAF6" stroke="#1F1A1C" stroke-width="2"/>`);
    } else {
      parts.push(`<rect x="33" y="62" width="54" height="46" rx="12" fill="#1F3A6B"/>`);
    }
    // legs & shoes
    parts.push(`<rect x="47" y="106" width="11" height="28" rx="4" fill="#26324D"/><rect x="62" y="106" width="11" height="28" rx="4" fill="#26324D"/>`);
    if (eq.feet === 'shoes') {
      parts.push(`<path d="M43 133 h17 v6 h-19 a3 3 0 0 1 2 -6z" fill="#1F1A1C"/><path d="M60 133 h17 a3 3 0 0 1 2 6 h-19z" fill="#1F1A1C"/>
        <rect x="41" y="138" width="19" height="2.5" fill="#F6F4EE"/><rect x="60" y="138" width="19" height="2.5" fill="#F6F4EE"/>`);
    } else {
      parts.push(`<rect x="42" y="132" width="18" height="8" rx="4" fill="#F6F4EE" stroke="#C9D6EC"/><rect x="60" y="132" width="18" height="8" rx="4" fill="#F6F4EE" stroke="#C9D6EC"/>`);
    }
    // arms
    const sleeve = eq.body === 'jacket' ? '#A3162A' : shirt;
    parts.push(`<rect x="31" y="68" width="11" height="34" rx="5" fill="${sleeve}"/><rect x="78" y="68" width="11" height="34" rx="5" fill="${sleeve}"/>
      <circle cx="36.5" cy="104" r="5" fill="${skin}"/><circle cx="83.5" cy="104" r="5" fill="${skin}"/>`);
    // body
    if (eq.body === 'jacket') {
      parts.push(`<rect x="39" y="64" width="42" height="48" rx="10" fill="#A3162A"/>
        <rect x="52" y="62" width="16" height="6" rx="2" fill="#7E0F20"/>
        <line x1="60" y1="68" x2="60" y2="110" stroke="#7E0F20" stroke-width="1.5"/>
        ${[76, 86, 96].map(y => `<path d="M54 ${y} h12" stroke="#F3D9A4" stroke-width="2" stroke-linecap="round"/><circle cx="60" cy="${y}" r="1.8" fill="#F3D9A4"/>`).join('')}`);
    } else {
      parts.push(`<rect x="39" y="64" width="42" height="48" rx="10" fill="${shirt}"/>
        <path d="M52 64 l8 8 l8 -8" fill="none" stroke="#C9D6EC" stroke-width="2"/>
        <rect x="41" y="66" width="5" height="40" rx="2" fill="#14274E" opacity=".55"/><rect x="74" y="66" width="5" height="40" rx="2" fill="#14274E" opacity=".55"/>`);
    }
    // hip gourd
    if (eq.hip === 'gourd') {
      parts.push(`<g transform="translate(30 98)"><circle cx="0" cy="12" r="7" fill="#D9A35B" stroke="#8C5E22"/><circle cx="0" cy="2" r="4.5" fill="#D9A35B" stroke="#8C5E22"/>
        <rect x="-1.5" y="-4" width="3" height="3" fill="#8C5E22"/><path d="M-4 6 h8" stroke="#C8102E" stroke-width="2"/></g>`);
    }
    // scarf
    if (eq.neck === 'scarf') {
      parts.push(`<defs><pattern id="${id}p" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#FBFAF6"/><circle cx="3" cy="3" r="1.4" fill="#2F5DA8"/></pattern></defs>
        <rect x="44" y="60" width="32" height="9" rx="4" fill="url(#${id}p)" stroke="#2F5DA8"/>
        <path d="M66 66 l5 18 l-7 -1 z" fill="url(#${id}p)" stroke="#2F5DA8"/>`);
    }
    // charms
    if (eq.charm === 'knot') {
      parts.push(`<g transform="translate(47 80)"><path d="M0 -6 l6 6 l-6 6 l-6 -6z" fill="#C8102E"/><path d="M0 -3 l3 3 l-3 3 l-3 -3z" fill="none" stroke="#F3D9A4"/>
        <path d="M-1.5 6 v8 M1.5 6 v8 M0 6 v9" stroke="#C8102E" stroke-width="1.2"/></g>`);
    } else if (eq.charm === 'mask') {
      parts.push(`<g transform="translate(47 82)"><circle r="6.5" fill="#FBFAF6" stroke="#1F1A1C"/><path d="M-6.5 0 a6.5 6.5 0 0 1 13 0z" fill="#C8102E"/>
        <circle cx="-2.3" cy="1" r="1.2" fill="#1F1A1C"/><circle cx="2.3" cy="1" r="1.2" fill="#1F1A1C"/></g>`);
    }
    if (eq.charm2 === 'seal') {
      parts.push(`<g transform="translate(72 84)"><rect x="-6" y="-6" width="12" height="12" rx="2" fill="#C8102E"/><text x="0" y="3.6" text-anchor="middle" font-size="9" font-weight="700" fill="#FBFAF6" font-family="serif">上</text></g>`);
    }
    // head
    parts.push(`<circle cx="60" cy="40" r="21" fill="${skin}"/>`);
    // hair
    if (h.base === 'b') {
      parts.push(`<path d="M38 42 C36 18 84 14 82 42 C80 30 70 24 60 24 C50 24 40 30 38 42z" fill="${HAIR}"/>
        <path d="M80 34 C92 40 92 62 84 70 C86 58 84 46 78 40z" fill="${HAIR}"/><circle cx="81" cy="34" r="3" fill="#C8102E"/>`);
    } else if (h.base === 'c') {
      parts.push(`<circle cx="60" cy="17" r="8" fill="${HAIR}"/><rect x="55" y="13" width="10" height="2" fill="#C8102E"/>
        <path d="M38 42 C37 20 83 20 82 42 C78 32 70 27 60 27 C50 27 42 32 38 42z" fill="${HAIR}"/>`);
    } else {
      parts.push(`<path d="M38 40 C38 18 82 16 82 40 C76 30 66 26 56 30 C50 32 44 34 38 40z" fill="${HAIR}"/>`);
    }
    // face
    parts.push(`<circle cx="52.5" cy="42" r="2.1" fill="#1F1A1C"/><circle cx="67.5" cy="42" r="2.1" fill="#1F1A1C"/>
      <path d="M55 49 q5 4 10 0" fill="none" stroke="#1F1A1C" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="48" cy="48" r="2.6" fill="#E88B8B" opacity=".45"/><circle cx="72" cy="48" r="2.6" fill="#E88B8B" opacity=".45"/>`);
    // hat
    if (eq.head === 'hat') {
      parts.push(`<path d="M22 32 L60 8 L98 32 Q60 40 22 32z" fill="#D9B36C" stroke="#9C7A3A" stroke-width="1.2"/>
        <path d="M41 24 Q60 30 79 24 M32 28 Q60 35 88 28" fill="none" stroke="#9C7A3A" stroke-width=".8"/>`);
    }
    // hand item (right hand)
    if (eq.hand === 'stick') {
      parts.push(`<line x1="88" y1="78" x2="92" y2="142" stroke="#8C6A2E" stroke-width="3.5" stroke-linecap="round"/>
        ${[92, 108, 124].map(y => `<line x1="87" y1="${y}" x2="93" y2="${y - 0.5}" stroke="#5E4519" stroke-width="1.5"/>`).join('')}<circle cx="83.5" cy="104" r="5" fill="${skin}"/>`);
    } else if (eq.hand === 'fan') {
      parts.push(`<g transform="translate(86 100) rotate(-20)"><path d="M0 0 L-14 -20 A24 24 0 0 1 14 -20 Z" fill="#FBFAF6" stroke="#2F5DA8" stroke-width="1.2"/>
        <path d="M0 0 L-7 -22 M0 0 L0 -24 M0 0 L7 -22" stroke="#C9D6EC"/><path d="M-9 -15 q5 -5 9 0 q4 -4 8 0" fill="none" stroke="#2F5DA8" stroke-width="1.2"/></g><circle cx="83.5" cy="104" r="5" fill="${skin}"/>`);
    } else if (eq.hand === 'lantern') {
      parts.push(`<line x1="84" y1="104" x2="84" y2="112" stroke="#5E4519" stroke-width="1.5"/>
        <rect x="79" y="111" width="10" height="2.5" fill="#E2B04A"/><ellipse cx="84" cy="121" rx="9" ry="9" fill="#C8102E"/>
        <path d="M84 112 v18 M78 114 q-2 7 0 14 M90 114 q2 7 0 14" stroke="#9E0C23" fill="none"/><rect x="79" y="129" width="10" height="2.5" fill="#E2B04A"/>
        <path d="M84 131.5 v6" stroke="#E2B04A" stroke-width="2"/><circle cx="83.5" cy="104" r="5" fill="${skin}"/>`);
    }
    const size = opts.size || 120;
    return `<svg class="hiker" viewBox="0 0 120 150" width="${size}" height="${size * 1.25}" role="img" aria-label="Your hiker">${parts.join('')}</svg>`;
  }

  function teahouse(size = 26) {
    return `<svg viewBox="0 0 40 34" width="${size}" height="${size * 0.85}" aria-hidden="true">
      <path d="M2 12 Q20 2 38 12 Q30 11 20 8 Q10 11 2 12z" fill="#C8102E"/>
      <rect x="7" y="12" width="26" height="18" fill="#FBFAF6" stroke="#14274E" stroke-width="1.5"/>
      <rect x="16" y="18" width="8" height="12" fill="#14274E"/><circle cx="11" cy="17" r="2" fill="#E2B04A"/><circle cx="29" cy="17" r="2" fill="#E2B04A"/></svg>`;
  }

  function plate(ch, size = 120, locked = false) {
    const rim = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return `<circle cx="${60 + Math.cos(a) * 50}" cy="${60 + Math.sin(a) * 50}" r="2.6" fill="${locked ? '#C9D6EC' : '#2F5DA8'}"/>`;
    }).join('');
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">
      <circle cx="60" cy="60" r="57" fill="#FBFAF6" stroke="${locked ? '#C9D6EC' : '#14274E'}" stroke-width="2"/>
      <circle cx="60" cy="60" r="44" fill="none" stroke="${locked ? '#E3E9F3' : '#C9D6EC'}" stroke-width="1.5"/>${rim}
      ${locked ? `<text x="60" y="70" text-anchor="middle" font-size="30" fill="#C9D6EC" font-family="serif">?</text>` :
        `<rect x="38" y="38" width="44" height="44" rx="6" fill="#C8102E"/><text x="60" y="71" text-anchor="middle" font-size="30" font-weight="700" fill="#FBFAF6" font-family="'Noto Serif SC','Songti SC',serif">${ch}</text>`}
    </svg>`;
  }

  // ---- Mountain ----
  function rand(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

  function mountain(level, lessons, status, hikerSvgFn, descentState) {
    const n = lessons.length;
    const step = 82;
    const H = 230 + (n - 1) * step + 120;
    const W = 400;
    const r = rand(level * 101 + 7);
    const apexY = 230 + (n - 1) * step + 120 - 140 - (n - 1) * step - 70;
    const spreadAt = y => 16 + Math.pow(Math.max(0, (y - apexY) / (H - apexY)), 0.8) * 270;
    const pts = lessons.map((L, i) => {
      const y = H - 140 - i * step;
      const amp = Math.min(96, spreadAt(y) * 0.55);
      const x = i === n - 1 ? 200 : 200 + Math.sin(i * 1.15 + level) * amp;
      return { x, y, L };
    });
    const apex = { x: 200, y: apexY };
    // mountain silhouette with rugged edges
    const left = [], right = [];
    const segs = 16;
    for (let i = 1; i <= segs; i++) {
      const t = i / segs;
      const y = apex.y + (H - apex.y) * t;
      const spread = spreadAt(y);
      left.push(`${(200 - spread - r() * 14).toFixed(1)},${y.toFixed(1)}`);
      right.unshift(`${(200 + spread + r() * 14).toFixed(1)},${y.toFixed(1)}`);
    }
    const body = `${apex.x},${apex.y} ${left.join(' ')} ${right.join(' ')}`;
    // snow cap (top ~12%)
    const capY = apex.y + (H - apex.y) * 0.12;
    const capSpread = spreadAt(capY);
    let cap = `${apex.x},${apex.y} ${(200 - capSpread).toFixed(1)},${capY.toFixed(1)}`;
    for (let i = 1; i < 8; i++) {
      const x = 200 - capSpread + (i / 8) * capSpread * 2;
      cap += ` ${x.toFixed(1)},${(capY + (i % 2 ? 12 + r() * 10 : -4)).toFixed(1)}`;
    }
    cap += ` ${(200 + capSpread).toFixed(1)},${capY.toFixed(1)}`;
    // far ranges
    const far = `<path d="M-20 ${H * 0.55} L60 ${H * 0.3} L130 ${H * 0.5} L170 ${H * 0.42} L260 ${H * 0.62} L330 ${H * 0.36} L420 ${H * 0.52} L420 ${H} L-20 ${H}Z" fill="#C9D6EC" opacity=".7"/>`;
    // trees near the bottom
    let trees = '';
    for (let i = 0; i < 26; i++) {
      const x = r() * W, y = H - 30 - r() * 120, s = 8 + r() * 10;
      trees += `<path d="M${x} ${y - s * 2} L${x - s} ${y} L${x + s} ${y}Z" fill="#0E1B36" opacity="${0.55 + r() * 0.35}"/>`;
    }
    // rocks mid
    let rocks = '';
    for (let i = 0; i < 12; i++) {
      const x = 120 + r() * 160, y = apex.y + (H - apex.y) * (0.3 + r() * 0.35);
      rocks += `<path d="M${x} ${y} l8 -6 l9 6z" fill="#2F4A7E" opacity=".7"/>`;
    }
    // clouds
    const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" opacity=".92"><path d="M0 10 q0 -10 12 -10 q4 -8 14 -4 q10 -6 16 4 q10 0 10 10z" fill="#FBFAF6"/><path d="M8 8 q6 -6 12 0 M28 6 q5 -5 10 0" stroke="#C9D6EC" fill="none" stroke-width="1.5"/></g>`;
    const clouds = cloud(20, H * 0.25, 1.1) + cloud(300, H * 0.45, 0.9) + cloud(40, H * 0.7, 0.8);
    // trail
    let trail = `M${pts[0].x} ${pts[0].y + 60} L${pts[0].x} ${pts[0].y}`;
    let doneTrail = '';
    let lastDone = -1;
    pts.forEach((p, i) => { if (status(p.L.n) === 'done' || status(p.L.n) === 'skip') lastDone = i; });
    for (let i = 1; i < n; i++) {
      const a = pts[i - 1], b = pts[i];
      const c = ` Q${(a.x + b.x) / 2 + (i % 2 ? 40 : -40)} ${(a.y + b.y) / 2} ${b.x} ${b.y}`;
      trail += c;
    }
    if (lastDone >= 0) {
      doneTrail = `M${pts[0].x} ${pts[0].y + 60} L${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i <= Math.min(lastDone + 1, n - 1); i++) {
        const a = pts[i - 1], b = pts[i];
        doneTrail += ` Q${(a.x + b.x) / 2 + (i % 2 ? 40 : -40)} ${(a.y + b.y) / 2} ${b.x} ${b.y}`;
      }
    }
    // descent trail on the right
    const desc = `M${apex.x + 8} ${pts[n - 1].y} C 330 ${pts[n - 1].y + 60}, 380 ${H * 0.55}, 352 ${H - 62}`;
    // markers
    const markers = pts.map((p, i) => {
      const st = status(p.L.n);
      const isSummit = i === n - 1;
      const cls = `peak ${st}${isSummit ? ' summit' : ''}`;
      const side = p.x > 200 ? -40 : 40;
      const house = st === 'done' ? `<g transform="translate(${p.x + side - 13} ${p.y - 30})">${teahouse(26)}</g>` : '';
      return `<g class="${cls}" data-lesson="${p.L.n}" tabindex="0" role="button" aria-label="Lesson ${p.L.n}: ${p.L.en} (${st})">
        ${house}
        <circle class="hit" cx="${p.x}" cy="${p.y}" r="26" fill="transparent"/>
        ${st === 'current' ? `<circle class="pulse" cx="${p.x}" cy="${p.y}" r="22"/>` : ''}
        <circle class="dot" cx="${p.x}" cy="${p.y}" r="${isSummit ? 21 : 17}"/>
        <text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${p.L.n}</text>
      </g>`;
    }).join('');
    // flag on summit
    const flag = `<g transform="translate(${apex.x - 2} ${apex.y - 6})"><line x1="0" y1="0" x2="0" y2="-34" stroke="#14274E" stroke-width="2.5"/><path d="M0 -34 h24 l-5 7 l5 7 h-24z" fill="#C8102E"/><text x="10" y="-22" text-anchor="middle" font-size="10" font-weight="700" fill="#FBFAF6" font-family="serif">上</text></g>`;
    // hiker
    let hikerG = '';
    const cur = pts.find(p => status(p.L.n) === 'current');
    if (descentState === 'ready' || descentState === 'done') {
      const y = descentState === 'done' ? H - 120 : pts[n - 1].y - 92;
      const x = descentState === 'done' ? 318 : apex.x + 16;
      hikerG = `<g class="map-hiker" transform="translate(${x} ${y})">${hikerSvgFn(48)}</g>`;
    } else if (cur) {
      hikerG = `<g class="map-hiker" transform="translate(${cur.x + (cur.x > 200 ? -66 : 20)} ${cur.y - 70})">${hikerSvgFn(46)}</g>`;
    }
    const dCls = descentState === 'done' ? 'done' : descentState === 'ready' ? 'current' : 'locked';
    const descent = `<path d="${desc}" class="descent-trail ${dCls}"/>
      <g class="peak descent ${dCls}" data-descent="1" tabindex="0" role="button" aria-label="Descent: review everything">
        <circle class="hit" cx="352" cy="${H - 62}" r="26" fill="transparent"/>
        ${dCls === 'current' ? `<circle class="pulse" cx="352" cy="${H - 62}" r="22"/>` : ''}
        <circle class="dot" cx="352" cy="${H - 62}" r="18"/>
        <text x="352" y="${H - 57}" text-anchor="middle" class="d">下</text>
      </g>
      <text x="352" y="${H - 30}" text-anchor="middle" class="map-label">Descent</text>`;
    return `<svg class="mountain" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax meet" role="img" aria-label="HSK ${level} mountain">
      <defs><linearGradient id="mg${level}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F4A7E"/><stop offset="1" stop-color="#14274E"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="#EEF2F8"/>
      ${far}${clouds}
      <polygon points="${body}" fill="url(#mg${level})"/>
      <polygon points="${cap}" fill="#FBFAF6"/>
      ${rocks}${trees}
      <path d="${trail}" class="trail-under"/>
      <path d="${trail}" class="trail"/>
      ${doneTrail ? `<path d="${doneTrail}" class="trail done"/>` : ''}
      ${descent}
      ${flag}${markers}${hikerG}
      <text x="${pts[0].x}" y="${pts[0].y + 78}" text-anchor="middle" class="map-label">Trailhead</text>
    </svg>`;
  }

  // ---- Tone chart (canvas) ----
  const CHAO = { 1: [5, 5], 2: [3, 5], 3: [2, 1, 4], 4: [5, 1], 5: [3, 3] };
  function drawTones(canvas, syls, userPts) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 320, h = canvas.clientHeight || 160;
    canvas.width = w * dpr; canvas.height = h * dpr;
    const g = canvas.getContext('2d');
    g.scale(dpr, dpr);
    g.clearRect(0, 0, w, h);
    const pad = 14;
    const yOf = v => h - pad - ((v - 1) / 4) * (h - pad * 2);
    g.strokeStyle = '#E3E9F3'; g.lineWidth = 1;
    for (let v = 1; v <= 5; v++) { g.beginPath(); g.moveTo(pad, yOf(v)); g.lineTo(w - pad, yOf(v)); g.stroke(); }
    const list = syls.filter(Boolean);
    const segW = (w - pad * 2) / Math.max(1, list.length);
    const colors = { 1: '#3A6FD8', 2: '#2E9E6B', 3: '#C98A12', 4: '#C8102E', 5: '#8A93A6' };
    list.forEach((s, i) => {
      const c = CHAO[s.tone] || CHAO[5];
      const x0 = pad + i * segW + segW * 0.12, x1 = pad + (i + 1) * segW - segW * 0.12;
      g.strokeStyle = colors[s.tone]; g.globalAlpha = userPts ? 0.35 : 0.9;
      g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath();
      const xm = s.tone === 5 ? x0 + (x1 - x0) * 0.35 : x1;
      c.forEach((v, k) => {
        const x = x0 + (xm - x0) * (k / (c.length - 1));
        k ? g.lineTo(x, yOf(v)) : g.moveTo(x, yOf(v));
      });
      g.stroke();
      g.globalAlpha = 1;
      g.fillStyle = '#14274E'; g.font = '600 12px system-ui, sans-serif'; g.textAlign = 'center';
      g.fillText(s.text, (x0 + x1) / 2, h - 2);
    });
    if (userPts && userPts.length > 1) {
      const t0 = userPts[0].t, t1 = userPts[userPts.length - 1].t || t0 + 1;
      g.strokeStyle = '#14274E'; g.lineWidth = 3.5; g.globalAlpha = 1;
      g.beginPath();
      userPts.forEach((p, k) => {
        const x = pad + ((p.t - t0) / (t1 - t0 || 1)) * (w - pad * 2);
        const v = Math.max(1, Math.min(5, 3 + p.st / 2.6));
        k ? g.lineTo(x, yOf(v)) : g.moveTo(x, yOf(v));
      });
      g.stroke();
    }
  }

  window.Art = { hiker, teahouse, plate, mountain, drawTones };
})();
