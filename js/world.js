// Shang Hike 3D world: a low-poly mountain range (HSK 1–3), checkpoints, teahouses, camps and an idle-animated hiker.
import * as THREE from './vendor/three.module.min.js';

const PAL = {
  navy: 0x14274E, navy2: 0x1F3A6B, cobalt: 0x2F5DA8, mist: 0xC9D6EC, porcelain: 0xF6F4EE, seal: 0xC8102E,
  gold: 0xE2B04A, skyTop: 0x9FB8E0, skyLow: 0xEAF0F8, fog: 0xDCE5F2,
  snow: 0xF4F2EC, snow2: 0xE3E9F2, rock: 0x4A6189, rock2: 0x3B5A92, rock3: 0x5B7096, slate: 0x6E819F,
  forest: 0x3F7468, forest2: 0x4C8274, meadow: 0x84AE9C, meadow2: 0x93BAA6, sand: 0xE3D7B8, water: 0x8FB0DA,
  trail: 0xEADBB4, trailDone: 0xF0C55C
};
const SKINS = [0xF5D3B5, 0xE2B48F, 0xC48B62, 0x8E5E3F];
const HAIRS = [0x241C1F, 0x3B2A20, 0x6E3B22];
const JACKETS = { cobalt: [0x2F5DA8, 0x24497F], sage: [0x5E8F82, 0x4A7368], ivory: [0xEDE6D6, 0xC9BEA5], red: [0xB8283C, 0x8E1D2E] };

// ---------------- noise / terrain ----------------
function hash(x, z) { const h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return h - Math.floor(h); }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); f *= 2.03; a *= 0.5; } return s / 0.94; }

const MTN = [
  { c: [-64, 14], H: 22, R: 40, phiStart: -0.35, amp: 1.0, seed: 3.1 },
  { c: [0, -18], H: 36, R: 50, phiStart: -0.85, amp: 1.05, seed: 7.7 },
  { c: [70, -50], H: 56, R: 62, phiStart: -0.9, amp: 1.1, seed: 12.9 }
];
const SHOULDERS = [
  [-84, -6, 11, 16], [-46, -10, 9, 13], [-24, -44, 18, 22], [26, -52, 20, 24], [30, -8, 12, 16],
  [44, -86, 30, 28], [104, -70, 28, 26], [96, -16, 14, 18], [-100, 26, 7, 14], [-6, 22, 4, 12]
];
let KNOLLS = []; // [x,z,h,s]
const LAKE = { x: -30, z: 46, r: 15 };

function mtnProfile(m, x, z) {
  const dx = x - m.c[0], dz = z - m.c[1];
  const d = Math.sqrt(dx * dx + dz * dz);
  const t = d / m.R;
  if (t >= 1.3) return 0;
  let base = t < 1 ? m.H * Math.pow(1 - t, 1.45) : 0;
  const n = fbm(x * 0.07 + m.seed, z * 0.07 - m.seed);
  const mult = 1 + (0.7 + 0.6 * n - 1) * Math.min(1, t * 2.4);
  return base * mult;
}
function height(x, z) {
  let h = 1.6 * fbm(x * 0.025 + 40, z * 0.025) - 0.5;
  for (const m of MTN) h = Math.max(h, h * 0.35 + mtnProfile(m, x, z));
  for (const s of SHOULDERS) {
    const d = Math.hypot(x - s[0], z - s[1]);
    if (d < s[3]) h = Math.max(h, s[2] * Math.pow(1 - d / s[3], 1.6) * (0.8 + 0.4 * fbm(x * 0.1, z * 0.1)));
  }
  for (const k of KNOLLS) {
    const d2 = (x - k[0]) ** 2 + (z - k[1]) ** 2;
    if (d2 < 9 * k[3] * k[3]) h += k[2] * Math.exp(-d2 / (2 * k[3] * k[3]));
  }
  const dl = Math.hypot(x - LAKE.x, z - LAKE.z);
  if (dl < LAKE.r * 1.4) h -= 3 * Math.max(0, 1 - dl / (LAKE.r * 1.4)) ** 0.8;
  return h;
}

// Checkpoint layout per mountain (polar around the mountain's centre, facing the camera side).
function layout(counts) {
  KNOLLS = [];
  const out = MTN.map((m, L) => {
    const n = counts[L];
    const nodes = [];
    const polar = (r, phi) => [m.c[0] + r * Math.sin(phi), m.c[1] + r * Math.cos(phi)];
    const head = { r: m.R * 0.98, phi: m.phiStart };
    for (let i = 0; i < n; i++) {
      const u = (i + 1) / n;
      const r = i === n - 1 ? 0 : m.R * 0.86 * Math.pow(1 - u, 0.8) + 1.5;
      const phi = i === n - 1 ? 0 : m.phiStart * (1 - u) + m.amp * (1 - u * 0.6) * Math.sin(i * 1.3 + L * 0.9 + 0.6);
      nodes.push({ r, phi });
    }
    nodes.forEach((p, i) => { if (i < n - 1) { const [x, z] = polar(p.r, p.phi); KNOLLS.push([x, z, 1.5 + 0.6 * hash(i, L), 2.3]); } });
    return { m, head, nodes, polar };
  });
  return out;
}

// ---------------- materials ----------------
const matCache = new Map();
function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, opts)));
  return matCache.get(key);
}
const flat = (c, o = {}) => mat(c, Object.assign({ flatShading: true }, o));

function textTexture(text, fg, bg, size = 128, font = 'bold 84px "Noto Serif SC","Songti SC",serif') {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, size, size);
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, size / 2, size / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function porcelainTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#2F5DA8';
  for (let y = 0; y < 64; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < 64; x += 16) { g.beginPath(); g.arc(x + 4, y + 8, 3.2, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 1); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------- hiker ----------------
function buildHiker(h, eq) {
  h = Object.assign({ base: 'short', skin: 0, hair: 0, jacket: 'cobalt' }, h || {});
  eq = eq || {};
  const skin = mat(SKINS[h.skin] || SKINS[0], { roughness: 0.7 });
  const hairM = mat(HAIRS[h.hair] || HAIRS[0], { roughness: 0.6 });
  const tang = eq.body === 'jacket';
  const jc = tang ? [0xA3162A, 0x7E0F20] : (JACKETS[h.jacket] || JACKETS.cobalt);
  const jacket = mat(jc[0]), jacketDark = mat(jc[1]);
  const pants = mat(0x2A3550), dark = mat(0x1F1A1C), white = mat(0xFBFAF6), gold = mat(PAL.gold, { roughness: 0.4, metalness: 0.3 });
  const root = new THREE.Group();
  const P = {};
  const add = (parent, geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; parent.add(o); return o; };

  // legs
  P.legs = [];
  [-1, 1].forEach(s => {
    const leg = new THREE.Group(); leg.position.set(0.12 * s, 0.8, 0); root.add(leg);
    add(leg, new THREE.CapsuleGeometry(0.105, 0.4, 4, 10), pants, 0, -0.3, 0);
    const shoeM = eq.feet === 'shoes' ? dark : mat(0x6B4A2E);
    const shoe = add(leg, new THREE.CapsuleGeometry(0.085, 0.16, 4, 10), shoeM, 0, -0.71, 0.05);
    shoe.rotation.x = Math.PI / 2; shoe.scale.set(1.05, 1, 0.75);
    const sole = add(leg, new THREE.BoxGeometry(0.17, 0.035, 0.34), eq.feet === 'shoes' ? white : mat(0x2B2421), 0, -0.785, 0.05);
    sole.castShadow = false;
    P.legs.push(leg);
  });

  // torso
  const torso = new THREE.Group(); torso.position.y = 0.8; root.add(torso); P.torso = torso;
  const body = add(torso, new THREE.CapsuleGeometry(0.25, 0.34, 6, 16), jacket, 0, 0.38, 0);
  body.scale.set(1, 1, 0.82);
  // hem / belt
  add(torso, new THREE.CylinderGeometry(0.255, 0.26, 0.09, 16), jacketDark, 0, 0.12, 0).scale.set(1, 1, 0.82);
  // yoke across the shoulders (two-tone jacket)
  const yoke = add(torso, new THREE.SphereGeometry(0.262, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.32), jacketDark, 0, 0.5, 0);
  yoke.scale.set(1, 1, 0.84);
  if (tang) {
    for (let i = 0; i < 4; i++) add(torso, new THREE.SphereGeometry(0.025, 8, 6), gold, 0, 0.58 - i * 0.12, 0.208);
    add(torso, new THREE.CylinderGeometry(0.14, 0.15, 0.08, 16, 1, true), gold, 0, 0.74, 0);
  } else {
    add(torso, new THREE.BoxGeometry(0.018, 0.5, 0.02), mat(0xE8E2D2), 0, 0.38, 0.205); // zip
    [-1, 1].forEach(s => add(torso, new THREE.BoxGeometry(0.11, 0.09, 0.03), jacketDark, 0.12 * s, 0.46, 0.19)); // pockets
    const collar = add(torso, new THREE.TorusGeometry(0.13, 0.045, 8, 16), jacketDark, 0, 0.72, 0);
    collar.rotation.x = Math.PI / 2;
  }
  // backpack
  if (eq.back === 'panda') {
    const pk = add(torso, new THREE.SphereGeometry(0.24, 16, 12), white, 0, 0.42, -0.28); pk.scale.set(1, 1.15, 0.7);
    [-1, 1].forEach(s => add(torso, new THREE.SphereGeometry(0.07, 10, 8), dark, 0.16 * s, 0.68, -0.28));
    [-1, 1].forEach(s => { const e = add(torso, new THREE.SphereGeometry(0.05, 8, 6), dark, 0.08 * s, 0.46, -0.45); e.scale.set(1, 1.3, 0.5); });
  } else {
    const pk = add(torso, new THREE.BoxGeometry(0.4, 0.48, 0.22), flat(0x1F3A6B), 0, 0.4, -0.29);
    add(torso, new THREE.BoxGeometry(0.3, 0.16, 0.06), flat(0x2A4A80), 0, 0.28, -0.42);
    const roll = add(torso, new THREE.CylinderGeometry(0.085, 0.085, 0.46, 12), mat(0xB8283C), 0, 0.7, -0.3);
    roll.rotation.z = Math.PI / 2;
    pk.receiveShadow = true;
  }
  [-1, 1].forEach(s => { const st = add(torso, new THREE.BoxGeometry(0.04, 0.3, 0.03), flat(0x1F3A6B), 0.175 * s, 0.52, 0.17); st.rotation.x = -0.25; }); // straps
  if (eq.charm === 'knot') {
    const k = add(torso, new THREE.OctahedronGeometry(0.06, 0), mat(PAL.seal), -0.13, 0.36, 0.23); k.scale.set(1, 1, 0.4);
    add(torso, new THREE.CylinderGeometry(0.012, 0.02, 0.1, 6), mat(PAL.seal), -0.13, 0.26, 0.23);
  } else if (eq.charm === 'mask') {
    const d = add(torso, new THREE.CircleGeometry(0.06, 16), white, 0.13, 0.36, 0.225);
    const r = add(torso, new THREE.CircleGeometry(0.06, 16, 0, Math.PI), mat(PAL.seal), 0.13, 0.362, 0.227); d.castShadow = r.castShadow = false;
  }
  if (eq.charm2 === 'seal') {
    const s = add(torso, new THREE.BoxGeometry(0.1, 0.1, 0.03), new THREE.MeshStandardMaterial({ map: textTexture('上', '#FBFAF6', '#C8102E') }), 0.15, 0.13, 0.22);
    s.rotation.z = 0.1;
  }
  if (eq.hip === 'gourd') {
    const g = new THREE.Group(); g.position.set(-0.27, 0.12, 0.06); torso.add(g);
    add(g, new THREE.SphereGeometry(0.075, 10, 8), mat(0xD9A35B), 0, -0.05, 0);
    add(g, new THREE.SphereGeometry(0.05, 10, 8), mat(0xD9A35B), 0, 0.05, 0);
    add(g, new THREE.TorusGeometry(0.04, 0.01, 6, 12), mat(PAL.seal), 0, 0.01, 0).rotation.x = Math.PI / 2;
    P.gourd = g;
  }
  if (eq.neck === 'scarf') {
    const tex = porcelainTexture();
    const sc = add(torso, new THREE.TorusGeometry(0.15, 0.06, 8, 18), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), 0, 0.71, 0.01);
    sc.rotation.x = Math.PI / 2;
    const tail = add(torso, new THREE.BoxGeometry(0.09, 0.26, 0.03), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), 0.09, 0.56, 0.2);
    tail.rotation.z = -0.15;
  }

  // arms
  P.arms = [];
  [-1, 1].forEach(s => {
    const arm = new THREE.Group(); arm.position.set(0.31 * s, 0.66, 0); torso.add(arm);
    const up = add(arm, new THREE.CapsuleGeometry(0.075, 0.36, 4, 10), jacket, 0, -0.2, 0);
    up.rotation.z = 0.08 * s;
    add(arm, new THREE.CylinderGeometry(0.08, 0.08, 0.05, 10), jacketDark, 0.03 * s, -0.4, 0);
    const hand = new THREE.Group(); hand.position.set(0.035 * s, -0.47, 0); arm.add(hand);
    add(hand, new THREE.SphereGeometry(0.075, 12, 10), skin, 0, 0, 0);
    arm.rotation.z = 0.1 * s;
    P.arms.push(arm);
    if (s === 1) P.hand = hand;
  });
  if (eq.hand === 'stick') {
    const st = new THREE.Group(); P.hand.add(st);
    add(st, new THREE.CylinderGeometry(0.025, 0.03, 1.6, 8), mat(0xA8964A), 0, -0.25, 0.05);
    for (let i = 0; i < 5; i++) add(st, new THREE.TorusGeometry(0.03, 0.008, 6, 10), mat(0x7A6A2E), 0, 0.45 - i * 0.34, 0.05).rotation.x = Math.PI / 2;
    P.stick = st;
  } else if (eq.hand === 'fan') {
    const f = new THREE.Group(); f.position.set(0, 0.02, 0.06); P.hand.add(f);
    const leaf = add(f, new THREE.CircleGeometry(0.3, 16, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0xFBFAF6, side: THREE.DoubleSide, roughness: 0.9 }), 0, 0.02, 0);
    add(f, new THREE.RingGeometry(0.24, 0.3, 16, 1, 0, Math.PI), new THREE.MeshStandardMaterial({ color: PAL.cobalt, side: THREE.DoubleSide }), 0, 0.02, 0.002);
    f.rotation.set(-0.3, 0, 0.6);
    leaf.castShadow = true;
    P.fan = f;
  } else if (eq.hand === 'lantern') {
    const l = new THREE.Group(); l.position.set(0, -0.05, 0.05); P.hand.add(l);
    add(l, new THREE.CylinderGeometry(0.006, 0.006, 0.18, 4), dark, 0, -0.09, 0);
    const ball = add(l, new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshStandardMaterial({ color: PAL.seal, emissive: 0xC8102E, emissiveIntensity: 0.55, roughness: 0.6 }), 0, -0.3, 0);
    ball.scale.set(1, 0.85, 1);
    add(l, new THREE.CylinderGeometry(0.07, 0.07, 0.035, 10), gold, 0, -0.19, 0);
    add(l, new THREE.CylinderGeometry(0.07, 0.07, 0.035, 10), gold, 0, -0.41, 0);
    add(l, new THREE.CylinderGeometry(0.01, 0.02, 0.12, 6), gold, 0, -0.49, 0);
    P.lantern = l;
  }

  // head
  const head = new THREE.Group(); torso.add(head);
  head.position.set(0, 1.0, 0.01);
  P.head = head;
  add(head, new THREE.SphereGeometry(0.31, 24, 18), skin, 0, 0, 0);
  [-1, 1].forEach(s => add(head, new THREE.SphereGeometry(0.06, 10, 8), skin, 0.3 * s, -0.02, 0));
  P.eyes = [];
  [-1, 1].forEach(s => {
    const e = add(head, new THREE.SphereGeometry(0.038, 10, 8), dark, 0.105 * s, 0.01, 0.275); e.castShadow = false;
    add(e, new THREE.SphereGeometry(0.012, 6, 6), white, 0.012, 0.014, 0.03).castShadow = false;
    P.eyes.push(e);
    const ch = add(head, new THREE.CircleGeometry(0.045, 14), new THREE.MeshBasicMaterial({ color: 0xE88B8B, transparent: true, opacity: 0.55 }), 0.17 * s, -0.08, 0.262);
    ch.rotation.y = 0.5 * s; ch.castShadow = false;
  });
  const smile = add(head, new THREE.TorusGeometry(0.05, 0.012, 6, 14, Math.PI), dark, 0, -0.1, 0.29);
  smile.rotation.z = Math.PI; smile.castShadow = false;
  // hair
  const hair = new THREE.Group(); head.add(hair); P.hair = hair;
  const cap = add(hair, new THREE.SphereGeometry(0.325, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM, 0, 0.0, -0.015);
  cap.rotation.x = -0.32;
  // fringe
  for (let i = -2; i <= 2; i++) {
    const f = add(hair, new THREE.SphereGeometry(0.075, 10, 8), hairM, i * 0.075, 0.2 - Math.abs(i) * 0.02, 0.23 - Math.abs(i) * 0.035);
    f.scale.set(1.1, 0.7, 0.8);
  }
  if (h.base === 'long') {
    const back = add(hair, new THREE.CapsuleGeometry(0.27, 0.36, 6, 14), hairM, 0, -0.3, -0.1); back.scale.set(1.08, 1, 0.55);
    [-1, 1].forEach(s => { const lock = add(hair, new THREE.CapsuleGeometry(0.075, 0.42, 4, 10), hairM, 0.27 * s, -0.27, 0.06); lock.rotation.z = 0.08 * s; });
    P.longHair = back;
  } else if (h.base === 'pony') {
    add(hair, new THREE.SphereGeometry(0.05, 8, 6), mat(PAL.seal), 0, 0.14, -0.31);
    const pony = new THREE.Group(); pony.position.set(0, 0.14, -0.33); hair.add(pony);
    const tail = add(pony, new THREE.CapsuleGeometry(0.085, 0.38, 4, 10), hairM, 0, -0.24, -0.05);
    tail.rotation.x = 0.3; P.pony = pony;
  } else if (h.base === 'bun') {
    add(hair, new THREE.SphereGeometry(0.14, 14, 10), hairM, 0, 0.3, -0.1);
    const pin = add(hair, new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), gold, 0, 0.32, -0.1); pin.rotation.z = 1.2;
    add(hair, new THREE.SphereGeometry(0.03, 8, 6), mat(PAL.seal), 0.17, 0.38, -0.1);
  } else {
    const tuft = add(hair, new THREE.ConeGeometry(0.06, 0.14, 6), hairM, 0.05, 0.33, 0.02); tuft.rotation.z = -0.4;
    [-1, 1].forEach(s => add(hair, new THREE.BoxGeometry(0.05, 0.12, 0.08), hairM, 0.29 * s, 0.03, 0.06));
  }
  if (eq.head === 'hat') {
    const hat = add(head, new THREE.ConeGeometry(0.62, 0.3, 20, 1), flat(0xD9B36C), 0, 0.33, 0);
    add(head, new THREE.TorusGeometry(0.34, 0.012, 6, 24), mat(0x9C7A3A), 0, 0.28, 0).rotation.x = Math.PI / 2;
    add(head, new THREE.SphereGeometry(0.03, 6, 6), mat(0x9C7A3A), 0, 0.49, 0);
    hat.rotation.y = 0.2;
    if (P.pony) P.pony.position.y -= 0.04;
  }
  root.traverse(o => { if (o.isMesh) o.receiveShadow = false; });
  root.userData.P = P;
  root.userData.state = { mode: 'idle', action: null, actionT: 0, nextAction: 4 + Math.random() * 4, blinkT: 2 };
  return root;
}

function animateHiker(hk, t, dt) {
  const P = hk.userData.P, st = hk.userData.state;
  const breathe = Math.sin(t * 1.9);
  // reset
  P.torso.rotation.set(0, 0, 0); P.torso.position.y = 0.8; P.torso.scale.set(1, 1, 1);
  P.head.rotation.set(0, 0, 0);
  P.arms[0].rotation.set(0, 0, -0.1); P.arms[1].rotation.set(0, 0, 0.1);
  P.legs[0].rotation.set(0, 0, 0); P.legs[1].rotation.set(0, 0, 0);
  if (st.mode === 'walk') {
    const w = Math.sin(t * 9);
    P.legs[0].rotation.x = 0.6 * w; P.legs[1].rotation.x = -0.6 * w;
    P.arms[0].rotation.x = -0.5 * w; P.arms[1].rotation.x = 0.5 * w;
    P.torso.position.y = 0.8 + Math.abs(Math.cos(t * 9)) * 0.05;
    P.torso.rotation.x = 0.08;
    P.head.rotation.x = -0.05;
  } else {
    P.torso.scale.y = 1 + breathe * 0.012;
    P.torso.rotation.z = Math.sin(t * 0.8) * 0.025;
    P.head.rotation.y = Math.sin(t * 0.33) * 0.38 + Math.sin(t * 0.91) * 0.08;
    P.head.rotation.x = Math.sin(t * 0.6) * 0.05;
    P.arms[0].rotation.x = Math.sin(t * 1.9) * 0.05; P.arms[1].rotation.x = -Math.sin(t * 1.9) * 0.05;
    // occasional actions
    st.nextAction -= dt;
    if (!st.action && st.nextAction <= 0) {
      const acts = ['wave', 'stretch', 'look', 'hop'];
      st.action = acts[Math.floor(Math.random() * acts.length)]; st.actionT = 0;
    }
    if (st.forced) { st.action = st.forced; st.actionT = 0; st.forced = null; }
    if (st.action) {
      st.actionT += dt;
      const a = st.actionT;
      const env = x => Math.sin(Math.min(1, x) * Math.PI);
      if (st.action === 'wave') {
        const k = env(a / 2.2);
        P.arms[1].rotation.z = 0.1 + k * 2.5;
        P.arms[1].rotation.x = -k * 0.2 + Math.sin(a * 10) * 0.25 * k;
        P.head.rotation.y *= 1 - k; P.head.rotation.z = -0.1 * k;
        if (a > 2.2) st.action = null;
      } else if (st.action === 'stretch') {
        const k = env(a / 2);
        P.arms[0].rotation.z = -0.1 - k * 2.7; P.arms[1].rotation.z = 0.1 + k * 2.7;
        P.torso.scale.y = 1 + k * 0.03; P.head.rotation.x = -0.25 * k;
        if (a > 2) st.action = null;
      } else if (st.action === 'look') {
        const k = env(a / 3);
        P.head.rotation.x = -0.45 * k; P.head.rotation.y = 0.3 * Math.sin(a * 1.5) * k;
        P.arms[0].rotation.z = -0.1 - k * 0.3;
        if (a > 3) st.action = null;
      } else if (st.action === 'hop' || st.action === 'cheer') {
        const dur = st.action === 'cheer' ? 1.6 : 0.9;
        const k = env(a / dur);
        const jump = Math.abs(Math.sin((a / dur) * Math.PI * (st.action === 'cheer' ? 2 : 1)));
        P.torso.position.y = 0.8 + jump * 0.25;
        P.legs.forEach(l => { l.position.y = 0.8 + jump * 0.25; l.rotation.x = -jump * 0.3; });
        if (st.action === 'cheer') { P.arms[0].rotation.z = -0.1 - k * 2.8; P.arms[1].rotation.z = 0.1 + k * 2.8; }
        if (a > dur) { st.action = null; P.legs.forEach(l => { l.position.y = 0.8; }); }
      }
      if (!st.action) st.nextAction = 6 + Math.random() * 6;
    }
    if (!st.action || (st.action !== 'hop' && st.action !== 'cheer')) P.legs.forEach(l => { l.position.y = 0.8; });
  }
  // blink
  st.blinkT -= dt;
  const blink = st.blinkT < 0.12 && st.blinkT > 0 ? 0.1 : 1;
  P.eyes.forEach(e => { e.scale.y = blink; });
  if (st.blinkT <= 0) st.blinkT = 2.5 + Math.random() * 3;
  // secondary motion
  if (P.pony) P.pony.rotation.x = 0.12 * Math.sin(t * 2.2) + (st.mode === 'walk' ? 0.2 * Math.sin(t * 9) : 0);
  if (P.pony) P.pony.rotation.z = 0.15 * Math.sin(t * 1.3);
  if (P.longHair) P.longHair.rotation.x = 0.04 * Math.sin(t * 1.7);
  if (P.lantern) P.lantern.rotation.z = 0.25 * Math.sin(t * 1.6);
  if (P.fan) P.fan.rotation.z = 0.6 + 0.35 * Math.sin(t * 3);
  if (P.gourd) P.gourd.rotation.z = 0.15 * Math.sin(t * 2);
  if (P.stick) P.stick.rotation.x = st.mode === 'walk' ? 0.3 * Math.sin(t * 9) : 0;
}

// ---------------- props ----------------
function pine(scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 5), flat(0x6B4A2E)); trunk.position.y = 0.4; g.add(trunk);
  const c1 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.6, 6), flat(0x2E5E57)); c1.position.y = 1.4; g.add(c1);
  const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.3, 6), flat(0x376B62)); c2.position.y = 2.2; g.add(c2);
  g.scale.setScalar(scale);
  return g;
}
function teahouse() {
  const g = new THREE.Group();
  const add = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; };
  add(new THREE.CylinderGeometry(2.9, 3.2, 0.6, 8), flat(0x8A93A6), 0, 0.3, 0);
  add(new THREE.BoxGeometry(3.2, 1.9, 2.4), flat(0xF6F4EE), 0, 1.55, 0);
  add(new THREE.BoxGeometry(0.8, 1.3, 0.1), flat(0x14274E), 0, 1.25, 1.22);
  [-1.35, -0.6, 0.6, 1.35].forEach(x => add(new THREE.CylinderGeometry(0.11, 0.11, 2.0, 8), flat(0xA3162A), x, 1.6, 1.3));
  const sign = add(new THREE.BoxGeometry(0.75, 0.55, 0.06), new THREE.MeshStandardMaterial({ map: textTexture('茶', '#E2B04A', '#A3162A') }), 0, 2.25, 1.27);
  sign.castShadow = false;
  const roof1 = add(new THREE.ConeGeometry(3.3, 1.25, 4, 1), flat(0x1F2D4D), 0, 3.05, 0); roof1.rotation.y = Math.PI / 4; roof1.scale.set(1.12, 1, 0.92);
  add(new THREE.BoxGeometry(1.7, 0.75, 1.3), flat(0xF6F4EE), 0, 3.6, 0);
  const roof2 = add(new THREE.ConeGeometry(1.9, 1.05, 4, 1), flat(0x1F2D4D), 0, 4.35, 0); roof2.rotation.y = Math.PI / 4;
  add(new THREE.SphereGeometry(0.16, 8, 6), mat(PAL.gold, { metalness: 0.4, roughness: 0.4 }), 0, 4.95, 0);
  // eave tips (upturned)
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([a, b]) => { const t = add(new THREE.ConeGeometry(0.12, 0.45, 4), flat(0x1F2D4D), a * 2.25, 2.62, b * 1.85); t.rotation.z = -a * 0.9; });
  const lanterns = [];
  [-1.05, 1.05].forEach(x => {
    const l = add(new THREE.SphereGeometry(0.2, 10, 8), new THREE.MeshStandardMaterial({ color: PAL.seal, emissive: 0xC8102E, emissiveIntensity: 0.7 }), x, 2.3, 1.45);
    l.scale.set(1, 0.85, 1); lanterns.push(l);
  });
  // chimney smoke puffs
  const smoke = [];
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.6, flatShading: true }));
    s.userData.phase = i / 6; g.add(s); smoke.push(s);
  }
  g.userData = { lanterns, smoke };
  return g;
}
function camp() {
  const g = new THREE.Group();
  const tent = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), flat(PAL.cobalt)); tent.position.set(-1.4, 0.9, -0.6); tent.rotation.y = Math.PI / 4; tent.castShadow = true; g.add(tent);
  const door = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 3), flat(0xF6F4EE)); door.position.set(-1.0, 0.55, 0.2); door.rotation.y = 0.6; g.add(door);
  for (let i = 0; i < 3; i++) { const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.9, 6), flat(0x6B4A2E)); lg.rotation.set(Math.PI / 2, i * 2.1, 0); lg.position.set(1, 0.12, 0.5); g.add(lg); }
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0xF2A33A, emissive: 0xF28C28, emissiveIntensity: 1, flatShading: true }));
  flame.position.set(1, 0.5, 0.5); g.add(flame);
  const light = new THREE.PointLight(0xFFA040, 6, 9, 1.8); light.position.set(1, 1.2, 0.5); g.add(light);
  [[2.3, 0.5], [1, 1.9]].forEach(([x, z]) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.9, 6), flat(0x7A5A3A)); s.rotation.z = Math.PI / 2; s.rotation.y = x > 2 ? 1.4 : 0; s.position.set(x, 0.25, z); s.castShadow = true; g.add(s); });
  g.userData = { flame, light };
  return g;
}
function cairn() {
  const g = new THREE.Group();
  [[0.5, 0.18], [0.38, 0.5], [0.26, 0.78]].forEach(([r, y], i) => {
    const s = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), flat(i % 2 ? 0x8A93A6 : 0x737D93)); s.position.y = y; s.scale.y = 0.6; s.rotation.y = i; s.castShadow = true; g.add(s);
  });
  return g;
}
function flag(n) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), flat(0x5B4A3A)); pole.position.y = 1.3; pole.castShadow = true; g.add(pole);
  const geo = new THREE.PlaneGeometry(1.25, 0.8, 10, 4);
  geo.translate(0.625, 0, 0);
  const tex = textTexture(String(n), '#FBFAF6', '#C8102E', 128, 'bold 70px system-ui, sans-serif');
  const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }));
  cloth.position.set(0.05, 2.15, 0); cloth.castShadow = true; g.add(cloth);
  g.userData = { cloth, base: geo.attributes.position.array.slice() };
  return g;
}

// ---------------- the world ----------------
const W = {
  ready: false, renderer: null, canvas: null, mode: 'off', t: 0,
  map: null, studio: null, cam: null, clock: new THREE.Clock()
};

function makeSky() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#8FAAD8'); gr.addColorStop(0.55, '#C9D6EC'); gr.addColorStop(1, '#EEF2F8');
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function buildMap(counts) {
  const scene = new THREE.Scene();
  scene.background = makeSky();
  scene.fog = new THREE.Fog(PAL.fog, 90, 340);
  const hemi = new THREE.HemisphereLight(0xEEF3FB, 0x4D5D7C, 1.25); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xFFF0DA, 2.1);
  sun.position.set(-50, 90, 60); sun.castShadow = true;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  const sc = sun.shadow.camera; sc.left = -45; sc.right = 45; sc.top = 45; sc.bottom = -45; sc.near = 1; sc.far = 260;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
  scene.add(sun); scene.add(sun.target);

  const lay = layout(counts);

  // terrain
  const SX = 320, SZ = 240, NX = 170, NZ = 128;
  const geo = new THREE.PlaneGeometry(SX, SZ, NX, NZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -25);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + (hash(i, 1) - 0.5) * 0.6, z = pos.getZ(i) + (hash(i, 2) - 0.5) * 0.6;
    pos.setX(i, x); pos.setZ(i, z); pos.setY(i, height(x, z));
  }
  const tg = geo.toNonIndexed();
  tg.computeVertexNormals();
  const tp = tg.attributes.position, tn = tg.attributes.normal;
  const cols = new Float32Array(tp.count * 3);
  const col = new THREE.Color();
  for (let f = 0; f < tp.count; f += 3) {
    const y = (tp.getY(f) + tp.getY(f + 1) + tp.getY(f + 2)) / 3;
    const cx = (tp.getX(f) + tp.getX(f + 1) + tp.getX(f + 2)) / 3, cz = (tp.getZ(f) + tp.getZ(f + 1) + tp.getZ(f + 2)) / 3;
    const ny = (tn.getY(f) + tn.getY(f + 1) + tn.getY(f + 2)) / 3;
    const j = hash(f, 7);
    const snowLine = 24 + fbm(cx * 0.05, cz * 0.05) * 6;
    let c;
    if (y > snowLine && ny > 0.45) c = j > 0.5 ? PAL.snow : PAL.snow2;
    else if (ny < 0.6 && y > 2) c = j > 0.66 ? PAL.rock : j > 0.33 ? PAL.rock2 : PAL.rock3;
    else if (y > 15) c = j > 0.5 ? PAL.slate : PAL.rock3;
    else if (y > 3.5) c = j > 0.5 ? PAL.forest : PAL.forest2;
    else if (Math.hypot(cx - LAKE.x, cz - LAKE.z) < LAKE.r * 1.12) c = PAL.sand;
    else c = j > 0.5 ? PAL.meadow : PAL.meadow2;
    col.setHex(c);
    for (let k = 0; k < 3; k++) { cols[(f + k) * 3] = col.r; cols[(f + k) * 3 + 1] = col.g; cols[(f + k) * 3 + 2] = col.b; }
  }
  tg.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const terrain = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  terrain.receiveShadow = true;
  scene.add(terrain);

  // lake
  const lake = new THREE.Mesh(new THREE.CircleGeometry(LAKE.r * 1.25, 28), new THREE.MeshStandardMaterial({ color: 0x7FA6DD, emissive: 0x2F5DA8, emissiveIntensity: 0.25, roughness: 0.3, transparent: true, opacity: 0.94 }));
  lake.rotation.x = -Math.PI / 2; lake.position.set(LAKE.x, -0.2, LAKE.z); lake.receiveShadow = true; scene.add(lake);

  // distant ranges
  [[-250, 0x9FB3D6, 26, 1.0], [-300, 0xB3C4E2, 34, 1.2]].forEach(([z, c, hgt, s]) => {
    for (let i = 0; i < 10; i++) {
      const x = -270 + i * 60 + hash(i, z) * 30;
      const hh = hgt + hash(i, i) * 14;
      const m = new THREE.Mesh(new THREE.ConeGeometry(30 * s + hash(z, i) * 14, hh, 5 + (i % 3)), flat(c));
      m.position.set(x, hh / 2 - 4, z + hash(i, 3) * 30); m.rotation.y = hash(i, 9) * 3; scene.add(m);
    }
  });

  // trails
  const trails = lay.map((L, li) => {
    const samples = []; const nodeIdx = [];
    const pts = [L.head, ...L.nodes];
    for (let k = 0; k < pts.length; k++) {
      if (k > 0) {
        const a = pts[k - 1], b = pts[k];
        const steps = 16;
        for (let s = 1; s <= steps; s++) {
          const u = s / steps;
          const r = a.r + (b.r - a.r) * u, phi = a.phi + (b.phi - a.phi) * u;
          const [x, z] = L.polar(r, phi);
          samples.push(new THREE.Vector3(x, height(x, z), z));
        }
      } else { const [x, z] = L.polar(pts[0].r, pts[0].phi); samples.push(new THREE.Vector3(x, height(x, z), z)); }
      nodeIdx.push(samples.length - 1);
    }
    return { samples, nodeIdx };
  });
  // camps between mountains and after the last one
  const campPos = [[-30, -2], [36, -30], [118, -8]].map(([x, z]) => new THREE.Vector3(x, height(x, z), z));
  const descents = lay.map((L, li) => {
    const summit = trails[li].samples[trails[li].samples.length - 1];
    const target = campPos[li];
    const samples = [summit.clone()];
    const n = 70;
    const ang0 = Math.atan2(target.x - L.m.c[0], target.z - L.m.c[1]);
    for (let s = 1; s <= n; s++) {
      const u = s / n;
      // curve outward on the far side before reaching camp
      const phi = ang0 + 0.55 * Math.sin(u * Math.PI);
      const r = L.m.R * 0.95 * Math.min(1, u * 1.05);
      let [x, z] = L.polar(r, phi);
      const blend = Math.max(0, (u - 0.75) / 0.25);
      x = x * (1 - blend) + target.x * blend; z = z * (1 - blend) + target.z * blend;
      samples.push(new THREE.Vector3(x, height(x, z), z));
    }
    return { samples };
  });

  function ribbon(samples, width, color, lift, opts = {}) {
    const verts = [], idx = [];
    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const q = samples[Math.min(samples.length - 1, i + 1)], o = samples[Math.max(0, i - 1)];
      const dx = q.x - o.x, dz = q.z - o.z; const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len, nz = dx / len;
      for (const s of [-1, 1]) {
        const x = p.x + nx * width * 0.5 * s, z = p.z + nz * width * 0.5 * s;
        verts.push(x, Math.max(height(x, z), p.y) + lift, z);
      }
      if (i > 0) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }, opts));
    const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; return mesh;
  }
  trails.forEach(T => scene.add(ribbon(T.samples, 1.1, PAL.trail, 0.12)));
  descents.forEach(D => scene.add(ribbon(D.samples, 0.9, 0xD8CCAA, 0.1, { transparent: true, opacity: 0.85 })));
  const doneRibbons = [null, null, null];

  // trees (instanced)
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const near = (x, z, list, d) => list.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < d * d);
  const allTrail = trails.flatMap(t => t.samples).concat(descents.flatMap(d => d.samples)).filter((_, i) => i % 3 === 0);
  const treeSpots = [];
  for (let i = 0; i < 2600 && treeSpots.length < 520; i++) {
    const x = -150 + rnd() * 300, z = -120 + rnd() * 190;
    const y = height(x, z);
    if (y < 0.6 || y > 19) continue;
    const e = 0.6, dy = Math.abs(height(x + e, z) - height(x - e, z)) + Math.abs(height(x, z + e) - height(x, z - e));
    if (dy > 2.2) continue;
    if (near(x, z, allTrail, 2.6) || near(x, z, campPos, 5) || Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r * 1.3) continue;
    treeSpots.push([x, y, z, 0.8 + rnd() * 0.9, rnd() * 6]);
  }
  const proto = pine();
  proto.children.forEach(part => {
    const im = new THREE.InstancedMesh(part.geometry, part.material, treeSpots.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    treeSpots.forEach(([x, y, z, sc, r], i) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r); s.setScalar(sc);
      p.set(x, y - 0.1 + part.position.y * sc, z);
      m4.compose(p, q, s); im.setMatrixAt(i, m4);
    });
    im.castShadow = true; im.receiveShadow = true; scene.add(im);
  });
  // rocks
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rocks = new THREE.InstancedMesh(rockGeo, flat(0x6F7C96), 160);
  { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(); let k = 0;
    for (let i = 0; i < 1500 && k < 160; i++) {
      const x = -150 + rnd() * 300, z = -120 + rnd() * 190, y = height(x, z);
      if (y < 1 || near(x, z, allTrail, 2)) continue;
      q.setFromEuler(new THREE.Euler(rnd(), rnd() * 6, rnd())); const sc = 0.4 + rnd() * 1.1; s.set(sc, sc * 0.6, sc);
      p.set(x, y, z); m4.compose(p, q, s); rocks.setMatrixAt(k++, m4);
    }
    rocks.count = k; rocks.castShadow = true; rocks.receiveShadow = true; scene.add(rocks); }

  // teahouses on summits, camps
  const teahouses = trails.map((T, li) => {
    const s = T.samples[T.samples.length - 1];
    const th = teahouse(); th.position.copy(s); th.position.y -= 0.35; th.rotation.y = -0.15 + li * 0.15;
    th.scale.setScalar(0.9 + li * 0.15); scene.add(th); return th;
  });
  const camps = campPos.map((p, i) => { const c = camp(); c.position.copy(p); c.rotation.y = -0.6 + i * 0.4; scene.add(c); return c; });

  // checkpoints
  const cps = trails.map((T, li) => T.nodeIdx.slice(1).map((si, k) => {
    const n = T.nodeIdx.length - 1;
    const s = T.samples[si];
    const g = new THREE.Group(); g.position.copy(s);
    const off = new THREE.Vector3(1.4, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), k);
    const isSummit = k === n - 1;
    const c = cairn(); c.position.copy(isSummit ? new THREE.Vector3(2.6, 0, 2.4) : off); g.add(c);
    const f = flag(k + 1); f.position.copy(c.position); f.visible = false; g.add(f);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.08, 6, 24), new THREE.MeshBasicMaterial({ color: PAL.seal, transparent: true, opacity: 0.85 }));
    ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.25, 0); ring.visible = false; g.add(ring);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 1; hit.userData = { level: li + 1, lesson: k + 1 }; g.add(hit);
    scene.add(g);
    return { g, cairn: c, flag: f, ring, hit, pos: s, label: s.clone().add(new THREE.Vector3(0, isSummit ? 8 : 6.4, 0)) };
  }));

  // clouds
  const clouds = [];
  for (let i = 0; i < 12; i++) {
    const g = new THREE.Group();
    const parts = 3 + Math.floor(hash(i, 4) * 3);
    for (let k = 0; k < parts; k++) {
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(2.5 + hash(i, k) * 2.5, 0), new THREE.MeshStandardMaterial({ color: 0xFFFFFF, flatShading: true, transparent: true, opacity: 0.93, roughness: 1 }));
      s.position.set(k * 3 - parts * 1.5, hash(k, i) * 1.5, hash(i + k, 2) * 2); s.scale.y = 0.6; g.add(s);
    }
    g.position.set(-160 + hash(i, 5) * 320, 26 + hash(i, 6) * 40, -110 + hash(i, 8) * 130);
    g.userData.speed = 0.6 + hash(i, 9) * 1.2;
    scene.add(g); clouds.push(g);
  }
  // birds
  const birds = [];
  for (let i = 0; i < 7; i++) {
    const g = new THREE.Group();
    const wingGeo = new THREE.BufferGeometry(); wingGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0.9, 0, -0.25, 0, 0, -0.5], 3)); wingGeo.computeVertexNormals();
    const m = new THREE.MeshBasicMaterial({ color: 0x1F2D4D, side: THREE.DoubleSide });
    const l = new THREE.Mesh(wingGeo, m), r = new THREE.Mesh(wingGeo, m); r.scale.x = -1;
    g.add(l); g.add(r); g.userData = { l, r, phase: i * 0.9, rad: 14 + i * 3, h: 38 + (i % 3) * 6, cx: i < 4 ? 0 : 70, cz: i < 4 ? -18 : -50 };
    scene.add(g); birds.push(g);
  }

  return { scene, sun, terrain, lay, trails, descents, campPos, teahouses, camps, cps, clouds, birds, doneRibbons, ribbon, lake };
}

function buildStudio() {
  const scene = new THREE.Scene();
  const hemi = new THREE.HemisphereLight(0xF2F5FB, 0x5A6A88, 1.5); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xFFF2DE, 2.2); key.position.set(3, 6, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1 }); scene.add(key);
  const rim = new THREE.DirectionalLight(0xC9D6EC, 1.2); rim.position.set(-4, 3, -4); scene.add(rim);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.1, 0.25, 9), flat(0x8A93A6)); base.position.y = -0.125; base.receiveShadow = true; scene.add(base);
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.95, 0.06, 9), flat(PAL.meadow)); grass.position.y = 0.02; grass.receiveShadow = true; scene.add(grass);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  cam.position.set(0, 1.35, 6.2); cam.lookAt(0, 1.05, 0);
  return { scene, cam, hiker: null, yaw: 0, yawV: 0 };
}

// ---------------- camera control ----------------
function makeCamCtl(camera) {
  return {
    camera, target: new THREE.Vector3(), goalTarget: new THREE.Vector3(),
    az: 0, el: 0.32, dist: 60, goalAz: 0, goalEl: 0.32, goalDist: 60,
    update(dt) {
      const k = 1 - Math.exp(-dt * 3.2);
      this.target.lerp(this.goalTarget, k);
      this.az += (this.goalAz - this.az) * k; this.el += (this.goalEl - this.el) * k; this.dist += (this.goalDist - this.dist) * k;
      const x = this.target.x + this.dist * Math.cos(this.el) * Math.sin(this.az);
      const y = this.target.y + this.dist * Math.sin(this.el);
      const z = this.target.z + this.dist * Math.cos(this.el) * Math.cos(this.az);
      this.camera.position.set(x, Math.max(y, height(x, z) + 3), z);
      this.camera.lookAt(this.target);
    }
  };
}

// ---------------- public API ----------------
const API = {
  get ready() { return W.ready; },
  init(canvas, counts) {
    try {
      const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
      r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
      W.renderer = r; W.canvas = canvas;
    } catch (e) { return false; }
    W.counts = counts;
    W.map = buildMap(counts);
    W.studio = buildStudio();
    W.cam = new THREE.PerspectiveCamera(42, 1, 0.5, 900);
    W.ctl = makeCamCtl(W.cam);
    W.ray = new THREE.Raycaster();
    bindInput(canvas);
    window.addEventListener('resize', resize);
    resize();
    W.ready = true;
    requestAnimationFrame(loop);
    return true;
  },
  // mode: 'map' | 'studio' | 'off'
  setMode(mode, o = {}) {
    W.mode = mode;
    W.canvas.classList.toggle('map', mode === 'map');
    W.canvas.classList.toggle('on', mode !== 'off');
    if (mode === 'studio') {
      const el = o.el; W.studioEl = el; W.studio.yaw = W.studio.yaw || 0;
      let px = null;
      el.onpointerdown = e => { px = e.clientX; try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } };
      el.onpointermove = e => { if (px != null) { W.studio.yaw += (e.clientX - px) * 0.012; px = e.clientX; } };
      el.onpointerup = el.onpointercancel = () => { px = null; };
      el.onclick = () => { if (W.studio.hiker) W.studio.hiker.userData.state.forced = 'wave'; };
    }
    if (mode === 'map') { W.labelsEl = o.labelsEl; W.onPick = o.onPick; buildLabels(); }
    else if (W.labelsEl) { W.labelsEl.innerHTML = ''; W.labelsEl = null; W.labels = null; }
    resize();
  },
  setHiker(h, eq) {
    const key = JSON.stringify([h, eq]);
    if (W.hikerKey === key) return;
    W.hikerKey = key;
    const replace = (holder, scale) => {
      const old = holder.hiker; const nh = buildHiker(h, eq); nh.scale.setScalar(scale);
      if (old) { nh.position.copy(old.position); nh.rotation.copy(old.rotation); old.parent.remove(old); }
      return nh;
    };
    W.mapHiker = replace({ hiker: W.mapHiker }, 2.4); W.map.scene.add(W.mapHiker);
    W.studio.hiker = replace(W.studio, 1); W.studio.scene.add(W.studio.hiker);
  },
  // progress: {levels:[{unlocked, status:[...], descent}], at:{l, node|'summit'|'camp'}, prevAt}
  setProgress(p) {
    W.progress = p;
    const M = W.map;
    p.levels.forEach((lv, li) => {
      M.cps[li].forEach((cp, k) => {
        const st = lv.status[k];
        const reached = st === 'done' || st === 'skip';
        const summit = k === M.cps[li].length - 1;
        cp.flag.visible = reached; cp.cairn.visible = !reached || summit;
        cp.ring.visible = st === 'current';
        cp.status = st;
      });
      const th = M.teahouses[li];
      th.userData.lanterns.forEach(l => { l.material.emissiveIntensity = lv.status[lv.status.length - 1] === 'done' || lv.status[lv.status.length - 1] === 'skip' ? 0.9 : 0.25; });
      // completed trail ribbon
      if (M.doneRibbons[li]) { M.scene.remove(M.doneRibbons[li]); M.doneRibbons[li] = null; }
      let last = -1;
      lv.status.forEach((s, k) => { if (s === 'done' || s === 'skip') last = k; else if (last === k - 1) { /* contiguous */ } });
      let cont = -1; for (let k = 0; k < lv.status.length; k++) { if (lv.status[k] === 'done' || lv.status[k] === 'skip') cont = k; else break; }
      if (cont >= 0) {
        const T = M.trails[li];
        const pts = T.samples.slice(0, T.nodeIdx[cont + 1] + 1);
        if (pts.length > 1) { M.doneRibbons[li] = M.ribbon(pts, 0.7, PAL.trailDone, 0.16); M.scene.add(M.doneRibbons[li]); }
      }
    });
    placeHiker(p.at, p.prevAt);
    if (W.labelsEl) buildLabels();
  },
  focus(target, instant) {
    const C = W.ctl;
    const portrait = W.cam.aspect < 1;
    if (target === 'all') {
      if (portrait) { C.goalTarget.set(8, 18, -22); C.goalDist = 205; C.goalEl = 0.34; C.goalAz = -0.78; }
      else { C.goalTarget.set(6, 16, -24); C.goalDist = 165; C.goalEl = 0.3; C.goalAz = -0.12; }
    }
    else if (target === 'hiker') { const p = W.mapHiker.position; C.goalTarget.set(p.x, p.y + 2.2, p.z); C.goalDist = 13; C.goalEl = 0.22; }
    else {
      const li = target - 1, m = MTN[li];
      const hp = W.mapHiker.position;
      const onThis = W.progress && W.progress.at && W.progress.at.l === target;
      if (onThis) {
        const summit = W.map.trails[li].samples.at(-1);
        C.goalTarget.copy(hp).lerp(summit, 0.25); C.goalTarget.y += 2;
        C.goalDist = 32 + m.H * 0.95; C.goalEl = 0.26; C.goalAz = Math.atan2(hp.x - m.c[0], hp.z - m.c[1]) * 0.55;
      } else {
        C.goalTarget.set(m.c[0], m.H * 0.45, m.c[1]); C.goalDist = m.R * 1.9 + 20; C.goalEl = 0.22; C.goalAz = -0.15;
      }
    }
    W.focusLevel = target;
    if (instant) { C.target.copy(C.goalTarget); C.az = C.goalAz; C.el = C.goalEl; C.dist = C.goalDist; }
    // keep shadows sharp around where we look
    const s = W.map.sun; s.target.position.copy(C.goalTarget); s.position.copy(C.goalTarget).add(new THREE.Vector3(-50, 90, 60));
    const ext = target === 'all' ? 140 : 55; Object.assign(s.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext }); s.shadow.camera.updateProjectionMatrix();
  },
  setInsets(top, bottom) { W.insets = { top, bottom }; resize(); },
  cheer() { if (W.mapHiker) W.mapHiker.userData.state.forced = 'cheer'; if (W.studio.hiker) W.studio.hiker.userData.state.forced = 'cheer'; },
  wave() { if (W.studio.hiker) W.studio.hiker.userData.state.forced = 'wave'; },
  portrait(h, eq, w = 240, hgt = 300) {
    if (!W.ready) return null;
    const key = JSON.stringify([h, eq, w, hgt]);
    W.portraits = W.portraits || new Map();
    if (W.portraits.has(key)) return W.portraits.get(key);
    const r = W.renderer;
    const hk = buildHiker(h, eq); hk.rotation.y = -0.35;
    const S = W.studio; const prev = S.hiker; if (prev) prev.visible = false;
    S.scene.add(hk);
    animateHiker(hk, 0.5, 0.016);
    const rt = new THREE.WebGLRenderTarget(w, hgt, { samples: 4, colorSpace: THREE.SRGBColorSpace });
    const cam = new THREE.PerspectiveCamera(28, w / hgt, 0.1, 50); cam.position.set(0, 1.25, 6.4); cam.lookAt(0, 1.02, 0);
    r.setRenderTarget(rt); r.setClearColor(0x000000, 0); r.clear(); r.render(S.scene, cam);
    const buf = new Uint8Array(w * hgt * 4); r.readRenderTargetPixels(rt, 0, 0, w, hgt, buf); r.setRenderTarget(null);
    S.scene.remove(hk); if (prev) prev.visible = true; rt.dispose();
    const c = document.createElement('canvas'); c.width = w; c.height = hgt;
    const g = c.getContext('2d'); const img = g.createImageData(w, hgt);
    for (let y = 0; y < hgt; y++) img.data.set(buf.subarray((hgt - 1 - y) * w * 4, (hgt - y) * w * 4), y * w * 4);
    g.putImageData(img, 0, 0);
    const url = c.toDataURL('image/png');
    W.portraits.set(key, url);
    return url;
  }
};
function mtnFor(p) { let best = MTN[0], bd = 1e9; MTN.forEach(m => { const d = Math.hypot(p.x - m.c[0], p.z - m.c[1]); if (d < bd) { bd = d; best = m; } }); return best; }

function posFor(at) {
  if (!at) return null;
  const M = W.map, li = at.l - 1;
  if (at.node === 'camp') return { p: M.campPos[li].clone().add(new THREE.Vector3(0.5, 0, 2.2)), face: M.campPos[li] };
  const T = M.trails[li];
  if (at.node === 'summit') { const s = T.samples.at(-1); const th = M.teahouses[li]; return { p: s.clone().add(new THREE.Vector3(-1.2, 0, 4.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), th.rotation.y)), face: null }; }
  const si = T.nodeIdx[at.node + 1];
  const nextS = T.samples[Math.min(T.samples.length - 1, si + 3)];
  return { p: T.samples[si].clone(), face: nextS, si };
}
function pathBetween(a, b) {
  if (!a || !b) return null;
  const M = W.map;
  if (a.l === b.l && typeof a.node === 'number' && typeof b.node === 'number' && b.node > a.node && b.node - a.node <= 3) {
    const T = M.trails[a.l - 1]; return T.samples.slice(T.nodeIdx[a.node + 1], T.nodeIdx[b.node + 1] + 1);
  }
  if (a.l === b.l && typeof a.node === 'number' && b.node === 'summit') {
    const T = M.trails[a.l - 1]; return T.samples.slice(T.nodeIdx[a.node + 1]);
  }
  if (a.l === b.l && a.node === 'summit' && b.node === 'camp') return M.descents[a.l - 1].samples;
  return null;
}
function groundAt(p) { return height(p.x, p.z); }
function placeHiker(at, prevAt) {
  const hk = W.mapHiker; if (!hk) return;
  const dest = posFor(at); if (!dest) return;
  let path = prevAt && JSON.stringify(prevAt) !== JSON.stringify(at) ? pathBetween(prevAt, at) : null;
  if (path && path.length > 2) { // keep walks short: only the last ~40 units
    let d = 0, k = path.length - 1;
    while (k > 0 && d < 40) { d += path[k].distanceTo(path[k - 1]); k--; }
    path = path.slice(k);
  }
  hk.userData.walk = null;
  if (path && path.length > 1) {
    hk.userData.walk = { path: path.map(p => p.clone()).concat([dest.p]), i: 0, f: 0, face: dest.face };
    hk.position.copy(path[0]);
    hk.userData.state.mode = 'walk';
  } else {
    hk.position.copy(dest.p); hk.position.y = groundAt(dest.p);
    faceToward(hk, dest.face || W.cam.position, true);
    hk.userData.state.mode = 'idle';
  }
}
function faceToward(obj, p, instant) {
  if (!p) return;
  const a = Math.atan2(p.x - obj.position.x, p.z - obj.position.z);
  if (instant) obj.rotation.y = a; else { let d = a - obj.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); obj.rotation.y += d * 0.15; }
}

// ---------------- labels ----------------
function buildLabels() {
  if (!W.labelsEl || !W.progress) return;
  const el = W.labelsEl; el.innerHTML = '';
  W.labels = [];
  W.progress.levels.forEach((lv, li) => {
    W.map.cps[li].forEach((cp, k) => {
      const b = document.createElement('button');
      const st = lv.status[k];
      const summit = k === W.map.cps[li].length - 1;
      b.className = `cp ${st}${summit ? ' summit' : ''}`;
      b.innerHTML = summit ? `<span class="n">${k + 1}</span><span class="t">${lv.unlocked ? 'Teahouse' : 'HSK ' + (li + 1)}</span>` : `<span class="n">${k + 1}</span>`;
      b.setAttribute('aria-label', `HSK ${li + 1} lesson ${k + 1}${summit ? ' (summit teahouse)' : ''}: ${st}`);
      b.onclick = () => W.onPick && W.onPick({ level: li + 1, lesson: k + 1 });
      el.appendChild(b);
      W.labels.push({ b, pos: cp.label, li });
    });
    const d = document.createElement('button');
    d.className = `cp camp ${lv.descent}`; d.innerHTML = `<span class="n">下</span><span class="t">${li < 2 ? 'Base camp' : 'Finish'}</span>`;
    d.setAttribute('aria-label', `HSK ${li + 1} descent: ${lv.descent}`);
    d.onclick = () => W.onPick && W.onPick({ level: li + 1, descent: true });
    el.appendChild(d);
    W.labels.push({ b: d, pos: W.map.campPos[li].clone().add(new THREE.Vector3(0, 4.5, 0)), li });
  });
}
const v3 = new THREE.Vector3();
function updateLabels() {
  if (!W.labels) return;
  const w = W.canvas.clientWidth, h = W.canvas.clientHeight;
  const focus = W.focusLevel;
  W.labels.forEach(L => {
    v3.copy(L.pos).project(W.cam);
    const behind = v3.z > 1;
    const dist = W.cam.position.distanceTo(L.pos);
    const show = !behind && (focus === 'all' ? L.b.classList.contains('summit') || L.b.classList.contains('camp') : (L.li === focus - 1 || L.b.classList.contains('summit'))) && dist < 260;
    L.b.style.display = show ? '' : 'none';
    if (show) {
      const x = (v3.x * 0.5 + 0.5) * w, y = (-v3.y * 0.5 + 0.5) * h;
      L.b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%) scale(${Math.max(0.7, Math.min(1.1, 60 / dist)).toFixed(2)})`;
      L.b.style.zIndex = String(1000 - Math.round(dist));
    }
  });
}

// ---------------- input ----------------
function bindInput(canvas) {
  let down = null, pinch = null, moved = 0;
  const pts = new Map();
  canvas.addEventListener('pointerdown', e => {
    if (W.mode === 'off') return;
    canvas.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { down = { x: e.clientX, y: e.clientY }; moved = 0; }
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: W.ctl.goalDist }; }
  });
  canvas.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    const prev = pts.get(e.pointerId); const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved += Math.abs(dx) + Math.abs(dy);
    if (W.mode === 'studio') { W.studio.yaw += dx * 0.012; return; }
    if (pts.size === 2 && pinch) {
      const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      W.ctl.goalDist = Math.max(10, Math.min(220, pinch.dist * pinch.d / d)); return;
    }
    if (pts.size === 1 && W.mode === 'map') {
      W.ctl.goalAz -= dx * 0.005; W.ctl.goalEl = Math.max(0.06, Math.min(1.0, W.ctl.goalEl + dy * 0.003));
      W.ctl.az = W.ctl.goalAz; W.ctl.el = W.ctl.goalEl;
    }
  });
  const up = e => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (W.mode === 'map' && down && moved < 8 && pts.size === 0) pick(e);
    if (pts.size === 0) down = null;
  };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', e => { pts.delete(e.pointerId); pinch = null; down = null; });
  canvas.addEventListener('wheel', e => {
    if (W.mode !== 'map') return;
    e.preventDefault();
    W.ctl.goalDist = Math.max(10, Math.min(220, W.ctl.goalDist * (1 + Math.sign(e.deltaY) * 0.12)));
  }, { passive: false });
}
function pick(e) {
  const r = W.canvas.getBoundingClientRect();
  const m = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  W.ray.setFromCamera(m, W.cam);
  const hits = W.ray.intersectObjects(W.map.cps.flat().map(c => c.hit), false);
  if (hits.length && W.onPick) W.onPick(hits[0].object.userData);
}

// ---------------- loop ----------------
function resize() {
  if (!W.renderer) return;
  const w = window.innerWidth, h = window.innerHeight;
  W.renderer.setSize(w, h, false);
  W.cam.aspect = w / h;
  const ins = W.insets && W.mode === 'map' ? W.insets : null;
  if (ins) W.cam.setViewOffset(w, h, 0, (ins.bottom - ins.top) / 2, w, h); else W.cam.clearViewOffset();
  W.cam.updateProjectionMatrix();
}
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, W.clock.getDelta());
  if (W.mode === 'off' || document.hidden) return;
  W.t += dt;
  const t = W.t, r = W.renderer;
  if (W.mode === 'map') {
    const M = W.map;
    // hiker
    const hk = W.mapHiker;
    if (hk) {
      const wk = hk.userData.walk;
      if (wk) {
        const speed = 7 * dt;
        let remain = speed;
        while (remain > 0 && wk.i < wk.path.length - 1) {
          const a = wk.path[wk.i], b = wk.path[wk.i + 1];
          const seg = a.distanceTo(b) || 0.0001;
          const left = seg * (1 - wk.f);
          if (remain >= left) { remain -= left; wk.i++; wk.f = 0; } else { wk.f += remain / seg; remain = 0; }
        }
        if (wk.i >= wk.path.length - 1) {
          hk.position.copy(wk.path.at(-1)); hk.userData.walk = null; hk.userData.state.mode = 'idle'; hk.userData.state.forced = 'cheer';
          faceToward(hk, W.cam.position, true);
        } else {
          const a = wk.path[wk.i], b = wk.path[wk.i + 1];
          hk.userData.facing = 'walk';
          hk.position.lerpVectors(a, b, wk.f);
          faceToward(hk, b, false);
          W.ctl.goalTarget.set(hk.position.x, hk.position.y + 3, hk.position.z);
        }
        hk.position.y = groundAt(hk.position);
      }
      if (!hk.userData.walk) faceToward(hk, W.cam.position, false);
      animateHiker(hk, t, dt);
    }
    // flags wave
    M.cps.forEach(list => list.forEach(cp => {
      if (cp.flag.visible) {
        const { cloth, base } = cp.flag.userData; const p = cloth.geometry.attributes.position;
        for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, Math.sin(x * 5 - t * 6 + cp.pos.x) * 0.12 * x); }
        p.needsUpdate = true;
      }
      if (cp.ring.visible) { const s = 1 + 0.25 * ((t * 0.8) % 1); cp.ring.scale.setScalar(s); cp.ring.material.opacity = 0.9 * (1 - ((t * 0.8) % 1)); }
    }));
    M.teahouses.forEach((th, i) => {
      th.userData.smoke.forEach(s => {
        const ph = (t * 0.25 + s.userData.phase) % 1;
        s.position.set(0.9 + Math.sin(ph * 6 + i) * 0.4, 4.3 + ph * 5, -0.6); s.scale.setScalar(0.5 + ph * 1.6); s.material.opacity = 0.55 * (1 - ph);
      });
      th.userData.lanterns.forEach((l, k) => { l.rotation.z = Math.sin(t * 1.5 + k) * 0.12; });
    });
    M.camps.forEach((c, i) => { const f = c.userData.flame; f.scale.set(1 + 0.12 * Math.sin(t * 13 + i), 1 + 0.2 * Math.sin(t * 9 + i * 2), 1); c.userData.light.intensity = 5 + Math.sin(t * 11 + i) * 1.4; });
    M.clouds.forEach(c => { c.position.x += c.userData.speed * dt; if (c.position.x > 180) c.position.x = -180; });
    M.birds.forEach(b => {
      const u = b.userData; const a = t * 0.25 + u.phase;
      b.position.set(u.cx + Math.cos(a) * u.rad, u.h + Math.sin(t * 0.7 + u.phase) * 2, u.cz + Math.sin(a) * u.rad);
      b.rotation.y = -a; const fl = Math.sin(t * 8 + u.phase) * 0.6; u.l.rotation.z = fl; u.r.rotation.z = -fl;
    });
    M.lake.material.emissiveIntensity = 0.25 + Math.sin(t * 0.6) * 0.04;
    W.ctl.update(dt);
    r.setScissorTest(false);
    r.setViewport(0, 0, W.canvas.clientWidth, W.canvas.clientHeight);
    r.render(M.scene, W.cam);
    updateLabels();
  } else if (W.mode === 'studio' && W.studioEl && W.studio.hiker) {
    const S = W.studio;
    const rect = W.studioEl.getBoundingClientRect();
    r.setScissorTest(false);
    r.setClearColor(0x000000, 0); r.clear();
    if (rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0) {
      const H = W.canvas.clientHeight;
      S.yawV = S.yaw; S.hiker.rotation.y = S.yaw + Math.sin(t * 0.3) * 0.12;
      animateHiker(S.hiker, t, dt);
      S.cam.aspect = rect.width / rect.height; S.cam.updateProjectionMatrix();
      r.setScissorTest(true);
      r.setScissor(rect.left, H - rect.bottom, rect.width, rect.height);
      r.setViewport(rect.left, H - rect.bottom, rect.width, rect.height);
      r.render(S.scene, S.cam);
      r.setScissorTest(false);
    }
  }
}

window.World = API;
window.dispatchEvent(new Event('world-loaded'));
