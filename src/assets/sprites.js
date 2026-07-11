// assets/sprites — palettes + procedural pixel-art sprite generation (32px tiles).
// Procedural now; the design↔code pipeline swaps in hand-made sheets later by
// asset id (see docs/design-code-pipeline-contract.md) — every sprite here is
// the placeholder for the matching assetId.

export const PALETTES = {
  meadow: {
    name: 'SPRING MEADOW',
    outline: '#2b1c26',
    grass: '#79b356', grassLo: '#68a049', grassHi: '#90c56b', blade: '#a7d67e', bladeLo: '#578f40', flower: '#f2e9c9', flower2: '#e8a33d',
    dirt: '#c69a62', dirtLo: '#b0854e', dirtSpot: '#a1774a',
    water: '#4d9ad0', waterDeep: '#3f81b5', waterHi: '#8fd0ee', foam: '#e9f4f6', sand: '#e3c98d', sandLo: '#c9ac72',
    rock: '#a8a49b', rockLo: '#8d897f', rockHi: '#c6c1b3', moss: '#6aa049',
    trunk: '#8a5a37', trunkLo: '#6d452a', canopy: '#4f9c58', canopyLo: '#3b7f47', canopyHi: '#74c26e', accent: '#e8788a',
    woodLog: '#a06a40', woodRing: '#d8b078',
    stoneI: '#9b968c', stoneIHi: '#c4bfb2',
    skin: '#f0c9a2', skinLo: '#d8a87e', cheek: '#e8a58a',
    hair: '#6e4a2f', hairLo: '#523620', hairHi: '#8a6743', stubble: '#5c4630',
    tunic: '#96693c', tunicLo: '#7d5530', sleeve: '#e6d3a7', pants: '#6b5a44', boots: '#4a3627', belt: '#3f2c20', buckle: '#e8a33d',
    fur: '#d9c1a3', furLo: '#b79c7d', furHi: '#efe2cc', earPink: '#e8a0a0',
    meatRaw: '#e07a7a', meatRawLo: '#c25f66', meatBone: '#f4ecda', meatCk: '#b0703c', meatCkLo: '#8f5730',
    fire1: '#d95f2b', fire2: '#f0a13c', fire3: '#f7dc8e', ember: '#f7c15e', smoke: '#b8b0a4',
    thatch: '#c9a24f', thatchLo: '#a7813c', frame: '#7a4f30',
    ambient: null, glow: '255,190,110',
    ui: { bg: 'rgba(43,28,38,0.82)', border: '#f2e3c2', text: '#f7efdb', accent: '#e8a33d', good: '#8fd06a', bad: '#e0705f' },
  },
  harvest: {
    name: 'GOLDEN HARVEST',
    outline: '#33201d',
    grass: '#a3ac57', grassLo: '#8e9a49', grassHi: '#bcc46d', blade: '#d0d47e', bladeLo: '#78873e', flower: '#f4e2b8', flower2: '#d96b34',
    dirt: '#c08b52', dirtLo: '#a97744', dirtSpot: '#976a3e',
    water: '#4e8ba8', waterDeep: '#3f7390', waterHi: '#8cc4d6', foam: '#eef3ec', sand: '#e0be82', sandLo: '#c4a269',
    rock: '#ada08c', rockLo: '#918572', rockHi: '#cbbda3', moss: '#8e9a49',
    trunk: '#7d5231', trunkLo: '#613e25', canopy: '#c07a30', canopyLo: '#9c5d26', canopyHi: '#e0a044', accent: '#d94f3d',
    woodLog: '#96633a', woodRing: '#d6ab6e',
    stoneI: '#a29782', stoneIHi: '#cbc0a8',
    skin: '#f0c9a2', skinLo: '#d8a87e', cheek: '#e8a58a',
    hair: '#6e4a2f', hairLo: '#523620', hairHi: '#8a6743', stubble: '#5c4630',
    tunic: '#96693c', tunicLo: '#7d5530', sleeve: '#e6d3a7', pants: '#6b5a44', boots: '#4a3627', belt: '#3f2c20', buckle: '#e8a33d',
    fur: '#d9c1a3', furLo: '#b79c7d', furHi: '#efe2cc', earPink: '#e8a0a0',
    meatRaw: '#e07a7a', meatRawLo: '#c25f66', meatBone: '#f4ecda', meatCk: '#b0703c', meatCkLo: '#8f5730',
    fire1: '#d95f2b', fire2: '#f0a13c', fire3: '#f7dc8e', ember: '#f7c15e', smoke: '#c2b6a2',
    thatch: '#c9a24f', thatchLo: '#a7813c', frame: '#7a4f30',
    ambient: 'rgba(255,170,70,0.07)', glow: '255,180,90',
    ui: { bg: 'rgba(51,32,29,0.82)', border: '#f2e3c2', text: '#f7efdb', accent: '#e8a33d', good: '#a8c85e', bad: '#e0705f' },
  },
  dusk: {
    name: 'DUSK EMBER',
    outline: '#241a2e',
    grass: '#5c8a6d', grassLo: '#4d775d', grassHi: '#6f9d7d', blade: '#84b18c', bladeLo: '#3f6650', flower: '#e6d8f0', flower2: '#c987d9',
    dirt: '#8f6b55', dirtLo: '#7a5946', dirtSpot: '#6c4e3e',
    water: '#3a6a8f', waterDeep: '#2f5674', waterHi: '#6f9fc0', foam: '#d7e6ec', sand: '#c2a377', sandLo: '#a68a61',
    rock: '#8b8492', rockLo: '#716b7d', rockHi: '#aca4b4', moss: '#4d775d',
    trunk: '#6e4a34', trunkLo: '#563828', canopy: '#35705a', canopyLo: '#285a48', canopyHi: '#4d8c6c', accent: '#d9a05f',
    woodLog: '#8a5c3c', woodRing: '#c49c6a',
    stoneI: '#8f8898', stoneIHi: '#b6adc0',
    skin: '#eec49e', skinLo: '#d3a179', cheek: '#dd9a85',
    hair: '#6e4a2f', hairLo: '#523620', hairHi: '#8a6743', stubble: '#5c4630',
    tunic: '#96693c', tunicLo: '#7d5530', sleeve: '#e0cda3', pants: '#66564a', boots: '#463527', belt: '#3a2a22', buckle: '#e8a33d',
    fur: '#cdb69c', furLo: '#a89078', furHi: '#e4d7c2', earPink: '#d495a0',
    meatRaw: '#d3717d', meatRawLo: '#b25a66', meatBone: '#ece4d4', meatCk: '#a5693c', meatCkLo: '#855230',
    fire1: '#e0602a', fire2: '#f7ab3d', fire3: '#ffe396', ember: '#ffcb66', smoke: '#a29aae',
    thatch: '#bd9749', thatchLo: '#9a7838', frame: '#6e4830',
    ambient: 'rgba(88,70,140,0.16)', glow: '255,175,95',
    ui: { bg: 'rgba(36,26,46,0.85)', border: '#efe0c4', text: '#f5eddc', accent: '#f0ad4a', good: '#7fbf7a', bad: '#dd6f63' },
  },
};

export const HAIRS = [
  { key: 'scruff', name: 'SCRUFF' },
  { key: 'swept', name: 'SWEPT' },
  { key: 'wild', name: 'WOODSMAN' },
  { key: 'hood', name: 'HOODED' },
];

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function mk(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const R = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); };
  const P = (x, y, col) => R(x, y, 1, 1, col);
  fn({ g, R, P, W: w, H: h });
  return c;
}
function blob(R, rnd, cx, cy, rx, ry, col) {
  for (let y = -ry; y <= ry; y++) {
    const t = y / ry;
    let hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - t * t)));
    if (hw <= 0) continue;
    hw += Math.round((rnd() - 0.5) * 2.2);
    if (hw > 0) R(cx - hw, cy + y, hw * 2, 1, col);
  }
}
function speck(P, rnd, x, y, w, h, col, n) {
  for (let i = 0; i < n; i++) P(x + Math.floor(rnd() * w), y + Math.floor(rnd() * h), col);
}
function dith(P, x, y, w, h, col, off = 0) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if ((i + j + off) % 2 === 0) P(x + i, y + j, col);
}
function outline(c, col) {
  const g = c.getContext('2d');
  const im = g.getImageData(0, 0, c.width, c.height);
  const d = im.data, W = c.width, H = c.height;
  const solid = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) solid[i] = d[i * 4 + 3] > 40 ? 1 : 0;
  g.fillStyle = col;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (solid[y * W + x]) continue;
    const n = (x > 0 && solid[y * W + x - 1]) || (x < W - 1 && solid[y * W + x + 1]) || (y > 0 && solid[(y - 1) * W + x]) || (y < H - 1 && solid[(y + 1) * W + x]);
    if (n) g.fillRect(x, y, 1, 1);
  }
  return c;
}
function mirror(c) {
  const m = document.createElement('canvas'); m.width = c.width; m.height = c.height;
  const g = m.getContext('2d'); g.imageSmoothingEnabled = false;
  g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0);
  return m;
}

/* ---------- tiles ---------- */
function tGrass(p, seed) {
  return mk(32, 32, ({ R, P }) => {
    const rnd = rng(seed);
    R(0, 0, 32, 32, p.grass);
    speck(P, rnd, 0, 0, 32, 32, p.grassLo, 26);
    speck(P, rnd, 0, 0, 32, 32, p.grassHi, 12);
    const tufts = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < tufts; i++) {
      const x = 2 + Math.floor(rnd() * 27), y = 3 + Math.floor(rnd() * 26);
      P(x, y, p.bladeLo); P(x, y - 1, p.blade); P(x + 2, y, p.bladeLo); P(x + 2, y - 1, p.blade); P(x + 1, y - 2, p.blade);
    }
    if (seed % 3 === 2 && rnd() > 0.35) {
      const x = 4 + Math.floor(rnd() * 24), y = 4 + Math.floor(rnd() * 24);
      P(x, y, p.flower); P(x + 1, y, p.flower); P(x, y + 1, p.flower); P(x + 1, y + 1, p.flower2);
    }
  });
}
function tDirt(p) {
  return mk(32, 32, ({ R, P }) => {
    const rnd = rng(77);
    R(0, 0, 32, 32, p.dirt);
    speck(P, rnd, 0, 0, 32, 32, p.dirtLo, 24);
    speck(P, rnd, 0, 0, 32, 32, p.dirtSpot, 10);
    for (let i = 0; i < 4; i++) { const x = 3 + Math.floor(rnd() * 26), y = 3 + Math.floor(rnd() * 26); R(x, y, 2, 1, p.dirtSpot); P(x, y - 1, p.dirtLo); }
  });
}
function tRock(p) {
  return mk(32, 32, ({ R, P }) => {
    const rnd = rng(31);
    R(0, 0, 32, 32, p.rock);
    speck(P, rnd, 0, 0, 32, 32, p.rockLo, 20);
    speck(P, rnd, 0, 0, 32, 32, p.rockHi, 12);
    for (let i = 0; i < 3; i++) {
      let x = 3 + Math.floor(rnd() * 24), y = 3 + Math.floor(rnd() * 24);
      for (let j = 0; j < 5; j++) { P(x, y, p.rockLo); x += rnd() > 0.5 ? 1 : 0; y += 1; }
    }
    speck(P, rnd, 0, 20, 32, 12, p.moss, 5);
  });
}
function tWater(p, f) {
  return mk(32, 32, ({ R, P }) => {
    const rnd = rng(9 + f);
    R(0, 0, 32, 32, p.water);
    speck(P, rnd, 0, 0, 32, 32, p.waterDeep, 20);
    const o = f * 3;
    for (const [wx, wy] of [[4, 7], [18, 12], [9, 21], [24, 26], [14, 2]]) {
      const x = (wx + o) % 28, y = wy;
      R(x, y, 4, 1, p.waterHi); P(x + 4, y + 1, p.waterHi);
    }
    if (f === 1) { P(27, 6, p.foam); P(6, 27, p.foam); }
  });
}
function tFloor(p) {
  return mk(32, 32, ({ R, P }) => {
    const rnd = rng(88);
    R(0, 0, 32, 32, p.woodLog);
    for (const y of [7, 15, 23, 31]) R(0, y, 32, 1, p.trunkLo);
    // staggered plank joints
    P(10, 0, p.trunkLo); P(10, 1, p.trunkLo); P(10, 2, p.trunkLo);
    P(24, 8, p.trunkLo); P(24, 9, p.trunkLo); P(24, 10, p.trunkLo);
    P(6, 16, p.trunkLo); P(6, 17, p.trunkLo);
    P(18, 24, p.trunkLo); P(18, 25, p.trunkLo);
    for (const y of [0, 8, 16, 24]) R(0, y, 32, 1, p.woodRing);
    speck(P, rnd, 0, 0, 32, 32, p.trunkLo, 8);
    speck(P, rnd, 0, 0, 32, 32, p.woodRing, 6);
    P(11, 3, p.dirtSpot); P(25, 12, p.dirtSpot); P(7, 19, p.dirtSpot);
  });
}

/* ---------- shelter room parts ---------- */
function wWallFace(p) {
  return mk(32, 46, ({ R, P }) => {
    const rnd = rng(55);
    R(0, 0, 32, 46, p.trunk);
    R(0, 0, 32, 3, p.woodRing);
    for (let i = 0; i < 6; i++) {
      const y = 3 + i * 7;
      R(0, y + 6, 32, 1, p.trunkLo);
      R(0, y, 32, 1, 'rgba(255,255,255,0.10)');
    }
    for (let i = 0; i < 5; i++) { const x = 2 + Math.floor(rnd() * 28), y = 5 + Math.floor(rnd() * 36); P(x, y, p.trunkLo); P(x + 1, y, p.trunkLo); }
    R(0, 44, 32, 2, p.trunkLo);
  });
}
function wWallSide(p, east) {
  return mk(8, 46, ({ R, P }) => {
    R(0, 0, 8, 46, p.trunk);
    R(east ? 6 : 0, 0, 2, 46, p.trunkLo);
    R(east ? 0 : 6, 0, 1, 46, p.woodRing);
    R(0, 0, 8, 3, p.woodRing);
    for (const y of [12, 24, 36]) R(0, y, 8, 1, p.trunkLo);
    R(0, 44, 8, 2, p.trunkLo);
  });
}
function wDoor(p) {
  return mk(32, 46, ({ R, P }) => {
    R(4, 4, 24, 42, '#231721');
    dith(P, 5, 6, 6, 38, '#2e1f2a');
    R(0, 0, 4, 46, p.trunk); R(3, 0, 1, 46, p.trunkLo);
    R(28, 0, 4, 46, p.trunk); R(28, 0, 1, 46, p.woodRing);
    R(0, 0, 32, 5, p.trunk); R(0, 0, 32, 2, p.woodRing);
    R(4, 42, 24, 4, p.woodRing); R(4, 42, 24, 1, p.trunkLo);
  });
}
function pRoof(p) {
  const c = mk(172, 116, ({ R, P, g }) => {
    const rnd = rng(66);
    // chimney (pokes above ridge, right of center)
    R(132, 0, 18, 22, p.stoneI);
    R(130, 0, 22, 4, p.stoneIHi);
    R(136, 2, 10, 2, p.outline);
    speck(P, rnd, 132, 4, 18, 18, p.rockLo, 8);
    // roof body
    R(4, 14, 164, 98, p.thatch);
    R(0, 18, 172, 90, p.thatch);
    // ridge cap
    R(0, 18, 172, 8, p.frame);
    R(0, 18, 172, 2, p.woodRing);
    R(4, 14, 164, 4, p.frame);
    // thatch rows
    for (let y = 30; y < 108; y += 7) {
      R(0, y, 172, 1, p.thatchLo);
      for (let x = ((y / 7) % 2) * 4; x < 172; x += 9) { P(x, y - 2, p.thatchLo); P(x, y - 3, p.thatchLo); }
    }
    speck(P, rnd, 4, 26, 164, 78, '#e0c070', 40);
    speck(P, rnd, 4, 26, 164, 78, p.thatchLo, 30);
    // side shading
    dith(P, 0, 18, 5, 90, p.thatchLo);
    dith(P, 167, 18, 5, 90, p.thatchLo, 1);
    // eave shadow + ragged bottom edge
    R(0, 104, 172, 4, p.thatchLo);
    for (let x = 0; x < 172; x += 3) { P(x, 108, p.thatchLo); if (x % 6 === 0) P(x + 1, 109, p.thatchLo); }
    R(0, 106, 172, 1, p.frame);
  });
  return outline(c, p.outline);
}

/* ---------- props ---------- */
function pTree(p) {
  const c = mk(48, 62, ({ R, P }) => {
    const rnd = rng(5);
    R(20, 36, 8, 22, p.trunk);
    R(17, 54, 14, 4, p.trunk);
    R(20, 36, 2, 20, p.trunkLo);
    for (let y = 40; y < 56; y += 5) P(25, y, p.trunkLo);
    R(18, 36, 12, 2, p.canopyLo);
    blob(R, rnd, 24, 26, 21, 14, p.canopyLo);
    blob(R, rnd, 23, 21, 17, 12, p.canopy);
    blob(R, rnd, 27, 14, 11, 8, p.canopy);
    speck(P, rng(12), 8, 8, 22, 14, p.canopyHi, 26);
    speck(P, rng(13), 26, 22, 16, 12, p.canopyLo, 14);
    dith(P, 12, 30, 24, 6, p.canopyLo, 1);
    for (const [ax, ay] of [[13, 18], [30, 10], [34, 24], [20, 27]]) { P(ax, ay, p.accent); P(ax + 1, ay, p.accent); }
  });
  return outline(c, p.outline);
}
function pSapling(p) {
  const c = mk(20, 26, ({ R, P }) => {
    const rnd = rng(8);
    R(9, 16, 2, 8, p.trunk);
    P(9, 23, p.trunkLo);
    blob(R, rnd, 10, 11, 6, 5, p.canopyLo);
    blob(R, rnd, 10, 9, 4, 4, p.canopy);
    speck(P, rng(9), 6, 5, 8, 6, p.canopyHi, 6);
    P(7, 14, p.accent);
  });
  return outline(c, p.outline);
}
function pStump(p) {
  const c = mk(32, 22, ({ R, P, g }) => {
    R(8, 8, 16, 10, p.trunk);
    R(8, 8, 3, 10, p.trunkLo);
    R(6, 16, 20, 4, p.trunk);
    g.fillStyle = p.woodRing; g.fillRect(8, 4, 16, 8);
    R(11, 6, 10, 4, p.trunkLo); R(13, 7, 6, 2, p.woodRing); P(15, 8, p.trunkLo);
  });
  return outline(c, p.outline);
}
function pBoulder(p) {
  const c = mk(30, 24, ({ R, P }) => {
    const rnd = rng(21);
    blob(R, rnd, 15, 13, 13, 9, p.rock);
    blob(R, rnd, 12, 10, 8, 5, p.rockHi);
    speck(P, rnd, 4, 10, 22, 12, p.rockLo, 14);
    P(18, 8, p.rockLo); P(19, 9, p.rockLo); P(19, 10, p.rockLo); P(20, 11, p.rockLo);
    speck(P, rnd, 3, 18, 24, 5, p.moss, 6);
  });
  return outline(c, p.outline);
}
function pBush(p) {
  const c = mk(30, 22, ({ R, P }) => {
    const rnd = rng(41);
    blob(R, rnd, 15, 14, 13, 7, p.canopyLo);
    blob(R, rnd, 14, 10, 10, 6, p.canopy);
    speck(P, rng(42), 5, 4, 16, 8, p.canopyHi, 12);
    for (const [ax, ay] of [[8, 12], [17, 8], [22, 13]]) P(ax, ay, p.accent);
  });
  return outline(c, p.outline);
}
function pStick(p) {
  const c = mk(18, 12, ({ R, P }) => {
    for (let i = 0; i < 10; i++) R(3 + i, 8 - Math.floor(i * 0.5), 2, 2, p.trunk);
    R(8, 3, 2, 2, p.trunk); P(9, 2, p.trunk);
    for (let i = 0; i < 5; i++) P(4 + i * 2, 8 - i, p.woodRing);
  });
  return outline(c, p.outline);
}
function pStone(p) {
  const c = mk(14, 10, ({ R, P }) => {
    R(2, 3, 8, 5, p.stoneI); R(3, 2, 6, 1, p.stoneI);
    R(3, 3, 3, 1, p.stoneIHi); P(2, 4, p.stoneIHi);
    R(9, 5, 3, 3, p.stoneI); P(9, 4, p.stoneIHi);
  });
  return outline(c, p.outline);
}
function pWood(p) {
  const c = mk(26, 16, ({ R, P }) => {
    R(4, 8, 18, 5, p.woodLog); R(4, 8, 18, 1, p.woodRing);
    R(2, 8, 3, 5, p.woodRing); P(3, 10, p.trunkLo);
    R(8, 3, 16, 5, p.woodLog); R(8, 3, 16, 1, p.woodRing);
    R(21, 3, 3, 5, p.woodRing); P(22, 5, p.trunkLo);
    P(12, 10, p.trunkLo); P(17, 5, p.trunkLo);
  });
  return outline(c, p.outline);
}
function pMeat(p, cooked) {
  const body = cooked ? p.meatCk : p.meatRaw, lo = cooked ? p.meatCkLo : p.meatRawLo;
  const c = mk(16, 14, ({ R, P }) => {
    const rnd = rng(3);
    blob(R, rnd, 7, 7, 5, 4, body);
    dith(P, 4, 8, 7, 3, lo);
    R(11, 5, 2, 2, p.meatBone); R(12, 4, 2, 2, p.meatBone); R(11, 7, 2, 1, p.meatBone);
    P(4, 5, cooked ? p.ember : '#f2b9b9');
    if (cooked) { P(6, 4, lo); P(8, 6, lo); }
  });
  return outline(c, p.outline);
}
function pCampfire(p, f) {
  const c = mk(36, 32, ({ R, P }) => {
    const rnd = rng(60);
    for (const [sx, sy] of [[3, 23], [10, 26], [19, 27], [27, 25], [31, 21], [7, 20], [24, 20]]) {
      R(sx, sy, 5, 4, p.stoneI); R(sx + 1, sy, 3, 1, p.stoneIHi);
    }
    for (let i = 0; i < 12; i++) R(9 + i, 24 - Math.floor(i * 0.33), 2, 3, p.trunk);
    for (let i = 0; i < 12; i++) R(14 + i, 20 + Math.floor(i * 0.33), 2, 3, p.trunkLo);
    if (f >= 0) {
      const fl = [[9, 7], [10, 9], [8, 8]][f];
      blob(R, rng(70 + f), 17, 15, fl[0], fl[1], p.fire1);
      blob(R, rng(80 + f), 17 + (f - 1), 16, Math.max(2, fl[0] - 3), fl[1] - 3, p.fire2);
      blob(R, rng(90 + f), 17, 18, Math.max(1, fl[0] - 6), Math.max(1, fl[1] - 6), p.fire3);
      P(13 + f * 3, 4 - f, p.ember); P(22 - f * 2, 6 + f, p.ember);
    } else {
      speck(P, rnd, 12, 16, 12, 6, p.rockLo, 6);
    }
  });
  return outline(c, p.outline);
}
function pShelterFrame(p) {
  const c = mk(72, 62, ({ R, P }) => {
    R(6, 34, 60, 22, p.frame);
    for (let y = 36; y < 56; y += 5) R(6, y, 60, 1, p.trunkLo);
    for (let x = 10; x < 66; x += 8) P(x, 38, p.trunkLo);
    R(29, 32, 14, 24, p.outline);
    R(30, 33, 12, 23, '#3a2620');
    R(28, 30, 2, 26, p.trunk); R(42, 30, 2, 26, p.trunk);
    for (let y = 0; y < 32; y++) {
      const hw = 4 + y;
      R(36 - hw, 4 + y, hw * 2, 1, p.frame);
    }
    for (let y = 4; y < 34; y += 6) { const hw = 4 + y; R(36 - hw, 4 + y, 2, 2, p.trunk); R(34 + hw - 2, 4 + y, 2, 2, p.trunk); }
    R(8, 34, 56, 2, p.trunkLo);
  });
  return outline(c, p.outline);
}

/* ---------- furniture (Phase 3) ---------- */
function pChest(p) {
  const c = mk(26, 22, ({ R, P }) => {
    R(2, 8, 22, 12, p.woodLog);
    R(2, 8, 22, 2, p.woodRing);
    R(2, 4, 22, 5, p.trunk);
    R(3, 3, 20, 2, p.woodRing);
    R(2, 12, 22, 1, p.trunkLo);        // lid seam
    R(11, 10, 4, 5, p.stoneI);         // clasp
    R(12, 11, 2, 2, p.outline);
    R(4, 8, 2, 12, p.trunkLo); R(20, 8, 2, 12, p.trunkLo); // bands
    P(3, 5, 'rgba(255,255,255,0.12)'); P(21, 5, p.trunkLo);
  });
  return outline(c, p.outline);
}
function pBed(p) {
  const c = mk(28, 42, ({ R, P }) => {
    R(2, 2, 24, 6, p.trunk);           // headboard
    R(2, 2, 24, 2, p.woodRing);
    R(4, 7, 20, 7, p.foam);            // pillow
    R(5, 8, 18, 3, '#ffffff');
    R(3, 13, 22, 24, p.tunic);         // blanket
    R(3, 13, 22, 3, p.tunicLo);
    for (let y = 18; y < 36; y += 5) R(3, y, 22, 1, p.tunicLo);
    R(3, 35, 22, 4, p.trunk);          // footboard
    R(3, 35, 22, 1, p.woodRing);
    P(6, 16, p.sleeve); P(20, 22, p.sleeve); P(10, 28, p.sleeve);
  });
  return outline(c, p.outline);
}
function pTable(p) {
  const c = mk(28, 26, ({ R, P }) => {
    R(2, 6, 24, 10, p.woodLog);
    R(2, 6, 24, 2, p.woodRing);
    R(2, 14, 24, 2, p.trunkLo);
    R(4, 16, 3, 8, p.trunk); R(21, 16, 3, 8, p.trunk);
    P(5, 23, p.trunkLo); P(22, 23, p.trunkLo);
    P(8, 9, p.trunkLo); P(17, 11, p.trunkLo); P(13, 8, p.woodRing);
  });
  return outline(c, p.outline);
}
// Tier-2 roof: timber shingles over the same footprint (structure upgrades
// in place — the roof is the tell).
function pRoofT2(p) {
  const c = mk(172, 116, ({ R, P }) => {
    const rnd = rng(67);
    R(130, 0, 22, 22, p.stoneI);
    R(128, 0, 26, 4, p.stoneIHi);
    R(135, 2, 12, 2, p.outline);
    speck(P, rnd, 130, 4, 22, 18, p.rockLo, 10);
    R(4, 14, 164, 98, p.trunk);
    R(0, 18, 172, 90, p.trunk);
    R(0, 18, 172, 8, p.woodRing);
    R(0, 18, 172, 2, p.stoneIHi);
    R(4, 14, 164, 4, p.woodRing);
    for (let y = 30; y < 108; y += 8) {
      R(0, y, 172, 2, p.trunkLo);
      for (let x = ((y / 8) % 2) * 5; x < 172; x += 10) { R(x, y - 5, 1, 5, p.trunkLo); }
    }
    speck(P, rnd, 4, 26, 164, 78, p.woodRing, 34);
    speck(P, rnd, 4, 26, 164, 78, p.trunkLo, 26);
    dith(P, 0, 18, 5, 90, p.trunkLo);
    dith(P, 167, 18, 5, 90, p.trunkLo, 1);
    R(0, 104, 172, 4, p.trunkLo);
    for (let x = 0; x < 172; x += 3) { P(x, 108, p.trunkLo); if (x % 6 === 0) P(x + 1, 109, p.trunkLo); }
    R(0, 106, 172, 1, p.woodRing);
  });
  return outline(c, p.outline);
}

/* ---------- farming + economy (Phase 4) ---------- */
function pSoil(p, wet) {
  return mk(32, 32, ({ R, P }) => {
    const rnd = rng(wet ? 91 : 90);
    const base = wet ? p.trunkLo : p.dirtLo;
    const lo = wet ? '#3d2a1e' : p.dirtSpot;
    R(2, 2, 28, 28, base);
    P(2, 2, 'rgba(0,0,0,0)'); P(29, 2, 'rgba(0,0,0,0)'); P(2, 29, 'rgba(0,0,0,0)'); P(29, 29, 'rgba(0,0,0,0)');
    for (const y of [6, 12, 18, 24]) { R(3, y, 26, 2, lo); }
    speck(P, rnd, 3, 3, 26, 26, lo, wet ? 20 : 12);
    R(2, 2, 28, 1, lo); R(2, 29, 28, 1, lo); R(2, 2, 1, 28, lo); R(29, 2, 1, 28, lo);
  });
}
function pCropStage(p, crop, stage, stages) {
  const c = mk(24, 26, ({ R, P }) => {
    const rnd = rng(100 + stage);
    const t = stage / Math.max(1, stages - 1);
    if (stage === 0) {
      // sprout
      R(11, 18, 2, 4, p.canopyLo);
      P(9, 17, p.canopyHi); P(10, 16, p.canopy); P(13, 16, p.canopy); P(14, 17, p.canopyHi);
      return;
    }
    if (t < 1) {
      // growing greens
      const h = 6 + Math.round(t * 8);
      blob(R, rnd, 12, 22 - Math.round(h / 2), 5 + Math.round(t * 3), Math.round(h / 2), p.canopy);
      speck(P, rng(7 + stage), 6, 12, 12, 8, p.canopyHi, 5);
      R(11, 20, 2, 3, p.canopyLo);
      return;
    }
    // mature
    if (crop === 'turnip') {
      R(9, 15, 6, 5, '#efe6da'); P(8, 16, '#efe6da'); P(15, 16, '#efe6da');
      R(10, 20, 4, 2, '#d8c8b8');
      P(11, 13, p.canopy); P(13, 13, p.canopy); R(10, 10, 4, 4, p.canopy);
      P(9, 11, p.canopyHi); P(14, 10, p.canopyHi);
    } else {
      blob(R, rng(55), 12, 17, 7, 5, p.fire2);
      R(9, 13, 6, 2, p.fire1); R(11, 11, 2, 3, p.trunkLo);
      P(8, 15, p.fire3); P(9, 16, p.fire3);
      P(15, 13, p.canopy); P(16, 14, p.canopy);
    }
  });
  return outline(c, p.outline);
}
function pCropWithered(p) {
  const c = mk(24, 26, ({ R, P }) => {
    R(11, 16, 2, 6, p.rockLo);
    P(9, 15, p.rockLo); P(8, 14, p.smoke); P(14, 14, p.rockLo); P(15, 13, p.smoke);
    P(10, 12, p.smoke); P(13, 11, p.smoke);
  });
  return outline(c, p.outline);
}
function pStall(p) {
  const c = mk(64, 58, ({ R, P }) => {
    const rnd = rng(77);
    // wheels
    R(6, 44, 10, 10, p.trunkLo); R(8, 46, 6, 6, p.trunk); P(10, 48, p.outline); P(11, 48, p.outline);
    R(48, 44, 10, 10, p.trunkLo); R(50, 46, 6, 6, p.trunk); P(52, 48, p.outline); P(53, 48, p.outline);
    // cart body / counter
    R(4, 30, 56, 18, p.woodLog);
    R(4, 30, 56, 3, p.woodRing);
    for (const y of [36, 42]) R(4, y, 56, 1, p.trunkLo);
    speck(P, rnd, 6, 33, 52, 13, p.trunkLo, 10);
    // goods on the counter
    R(10, 26, 6, 5, p.fire2); P(11, 25, p.trunkLo);            // pumpkin
    R(20, 27, 5, 4, '#efe6da'); P(22, 26, p.canopy);           // turnip
    R(30, 27, 8, 4, p.meatCk); R(31, 26, 6, 1, p.meatCkLo);    // food
    R(44, 26, 7, 5, p.stoneI); P(46, 25, p.stoneIHi);          // wares
    // posts + striped awning
    R(4, 6, 3, 26, p.trunk); R(57, 6, 3, 26, p.trunk);
    R(0, 2, 64, 8, p.thatch);
    for (let x = 0; x < 64; x += 12) R(x, 2, 6, 8, p.accent);
    R(0, 8, 64, 3, p.thatchLo);
    for (let x = 2; x < 64; x += 8) P(x, 11, p.thatchLo);
  });
  return outline(c, p.outline);
}

/* ---------- venture (Phase 8) ---------- */
function pWolf(p, f) {
  const c = mk(28, 20, ({ R, P }) => {
    const rnd = rng(30 + f);
    const legUp = f === 1 ? 1 : 0;
    // body
    blob(R, rnd, 12, 10, 9, 5, p.rockLo);
    R(6, 6, 12, 4, p.rock);
    // head (facing right)
    R(18, 5, 7, 6, p.rockLo);
    R(23, 7, 4, 3, p.rock);            // snout
    P(26, 8, p.outline);               // nose
    P(21, 6, p.ember);                 // eye
    R(18, 3, 2, 3, p.rockLo); R(22, 3, 2, 3, p.rockLo); // ears
    P(18, 4, p.earPink ?? p.rock);
    // legs
    R(7, 14 + legUp, 2, 5 - legUp, p.rockLo);
    R(11, 14 - legUp, 2, 5 + legUp, p.rockLo);
    R(15, 14 + legUp, 2, 5 - legUp, p.rockLo);
    R(18, 14 - legUp, 2, 5 + legUp, p.rockLo);
    // tail
    R(3, 6, 4, 3, p.rockLo); P(2, 5, p.rock);
    speck(P, rnd, 6, 6, 14, 6, p.rockHi, 6);
  });
  return outline(c, p.outline);
}
function pFur(p) {
  const c = mk(16, 12, ({ R, P }) => {
    blob(R, rng(31), 8, 6, 6, 4, p.fur);
    dith(P, 4, 6, 8, 4, p.furLo);
    P(4, 3, p.furHi); P(9, 3, p.furHi); P(12, 7, p.furLo);
  });
  return outline(c, p.outline);
}
function pTrail(p) {
  const c = mk(30, 40, ({ R, P }) => {
    const rnd = rng(44);
    // signpost
    R(13, 8, 4, 28, p.trunk);
    R(13, 34, 4, 2, p.trunkLo);
    R(6, 10, 18, 7, p.woodLog);
    R(6, 10, 18, 2, p.woodRing);
    P(22, 13, p.trunkLo); P(8, 14, p.trunkLo);
    // arrow cut
    R(24, 11, 3, 5, p.woodLog); P(26, 13, p.woodRing);
    // worn path pebbles at the base
    for (const [x, y] of [[4, 36], [10, 38], [18, 37], [24, 38]]) { P(x, y, p.rockLo); P(x + 1, y, p.rockHi); }
    speck(P, rnd, 7, 11, 16, 5, p.trunkLo, 5);
  });
  return outline(c, p.outline);
}

/* ---------- the dragon (Phase 9) ---------- */
function pCave(p) {
  const c = mk(56, 46, ({ R, P }) => {
    const rnd = rng(50);
    blob(R, rnd, 28, 26, 26, 18, p.rock);
    blob(R, rng(51), 26, 20, 20, 12, p.rockHi);
    speck(P, rnd, 6, 10, 44, 30, p.rockLo, 24);
    // the mouth
    blob(R, rng(52), 28, 34, 12, 10, p.outline);
    R(18, 30, 20, 14, '#0d080f');
    P(24, 36, '#2a1b30'); P(31, 34, '#2a1b30');
    // two embers deep inside
    P(25, 37, p.ember); P(31, 37, p.ember);
    // scorched grass at the entrance
    speck(P, rnd, 14, 42, 28, 4, p.outline, 8);
  });
  return outline(c, p.outline);
}
function pForge(p) {
  const c = mk(64, 62, ({ R, P }) => {
    const rnd = rng(53);
    // stone body
    R(6, 18, 52, 40, p.stoneI);
    R(4, 54, 56, 6, p.rockLo);
    speck(P, rnd, 8, 20, 48, 34, p.rockLo, 26);
    speck(P, rnd, 8, 20, 48, 34, p.stoneIHi, 14);
    // chimney
    R(40, 2, 14, 18, p.stoneI);
    R(38, 2, 18, 4, p.stoneIHi);
    R(43, 4, 8, 2, p.outline);
    // fire mouth
    R(14, 34, 22, 20, p.outline);
    R(16, 36, 18, 16, '#1a0d12');
    blob(R, rng(54), 25, 47, 8, 6, p.fire1);
    blob(R, rng(55), 25, 48, 5, 4, p.fire2);
    P(24, 44, p.fire3); P(27, 45, p.fire3);
    // anvil ledge
    R(40, 40, 16, 6, p.rockLo);
    R(42, 34, 12, 6, p.stoneIHi);
    R(46, 32, 6, 3, p.outline);
  });
  return outline(c, p.outline);
}

/* ---------- Arthur ---------- */
function headFront(R, P, p, hy, hair) {
  // base face
  R(9, hy + 2, 14, 11, p.skin);
  P(8, hy + 7, p.skin); P(8, hy + 8, p.skinLo);
  P(23, hy + 7, p.skin); P(23, hy + 8, p.skinLo);
  R(11, hy + 6, 3, 1, p.hairLo); R(18, hy + 6, 3, 1, p.hairLo);
  P(12, hy + 8, p.outline); P(19, hy + 8, p.outline);
  P(12, hy + 9, p.skinLo); P(19, hy + 9, p.skinLo);
  P(16, hy + 9, p.skinLo);
  R(14, hy + 11, 4, 1, p.skinLo);
  P(11, hy + 9, p.cheek); P(20, hy + 9, p.cheek);
  P(10, hy + 12, p.skinLo); P(21, hy + 12, p.skinLo);
  if (hair === 'scruff') {
    R(8, hy - 1, 16, 5, p.hair);
    for (let x = 8; x < 24; x++) if (x % 3 !== 0) P(x, hy + 4, p.hair);
    P(9, hy + 5, p.hair); P(14, hy + 5, p.hair); P(20, hy + 5, p.hair); P(22, hy + 5, p.hair);
    P(10, hy - 2, p.hair); P(15, hy - 3, p.hair); P(16, hy - 2, p.hair); P(20, hy - 2, p.hair); P(13, hy - 2, p.hairHi);
    R(11, hy - 1, 4, 1, p.hairHi); P(18, hy - 1, p.hairHi); P(21, hy, p.hairLo);
    R(8, hy + 4, 1, 4, p.hair); R(23, hy + 4, 1, 4, p.hair);
    P(11, hy + 12, p.stubble); P(13, hy + 12, p.stubble); P(15, hy + 12, p.stubble); P(17, hy + 12, p.stubble); P(19, hy + 12, p.stubble);
    P(10, hy + 11, p.stubble); P(21, hy + 11, p.stubble);
  } else if (hair === 'swept') {
    R(8, hy - 1, 16, 4, p.hair);
    R(8, hy + 3, 10, 1, p.hair); R(8, hy + 4, 6, 1, p.hair); R(8, hy + 5, 3, 1, p.hair);
    P(23, hy + 3, p.hair);
    R(12, hy - 1, 6, 1, p.hairHi); P(10, hy, p.hairHi); P(11, hy, p.hairHi);
    P(19, hy, p.hairLo); P(19, hy + 1, p.hairLo);
    P(8, hy + 4, p.hair); P(23, hy + 4, p.hair);
    P(15, hy - 2, p.hair); P(16, hy - 2, p.hair);
  } else if (hair === 'wild') {
    R(7, hy - 2, 18, 6, p.hair);
    R(7, hy + 3, 2, 8, p.hair); R(23, hy + 3, 2, 8, p.hair);
    P(9, hy - 3, p.hair); P(13, hy - 4, p.hair); P(14, hy - 3, p.hair); P(18, hy - 3, p.hair); P(21, hy - 2, p.hair);
    R(11, hy - 2, 4, 1, p.hairHi); P(17, hy - 2, p.hairHi); P(8, hy + 5, p.hairLo); P(24, hy + 6, p.hairLo);
    // beard
    R(10, hy + 10, 12, 4, p.hair);
    R(12, hy + 10, 8, 1, p.hairLo);
    P(15, hy + 11, p.skinLo); P(16, hy + 11, p.skinLo);
    P(11, hy + 14, p.hair); P(13, hy + 15, p.hair); P(16, hy + 15, p.hair); P(18, hy + 15, p.hair); P(20, hy + 14, p.hair);
    P(12, hy + 13, p.hairHi); P(19, hy + 12, p.hairHi);
  } else if (hair === 'hood') {
    R(7, hy - 2, 18, 6, p.tunic);
    R(7, hy + 3, 3, 10, p.tunic); R(22, hy + 3, 3, 10, p.tunic);
    P(15, hy - 3, p.tunic); P(16, hy - 3, p.tunicLo);
    R(9, hy + 3, 14, 1, p.sleeve);
    R(9, hy + 4, 1, 8, p.sleeve); R(22, hy + 4, 1, 8, p.sleeve);
    R(10, hy + 4, 12, 1, p.tunicLo);
    R(8, hy - 1, 15, 1, 'rgba(255,255,255,0.10)');
    R(8, hy + 13, 16, 2, p.tunic);
    P(7, hy + 13, p.tunic); P(24, hy + 13, p.tunic);
  }
}
function headBack(R, P, p, hy, hair) {
  R(9, hy + 2, 14, 11, p.skin);
  if (hair === 'scruff') {
    R(8, hy - 1, 16, 12, p.hair);
    for (let x = 8; x < 24; x++) if (x % 2 === 0) P(x, hy + 11, p.hair);
    R(13, hy + 11, 6, 2, p.skin);
    P(10, hy - 2, p.hair); P(15, hy - 3, p.hair); P(20, hy - 2, p.hair);
    R(11, hy, 5, 1, p.hairHi); P(19, hy + 1, p.hairHi);
    speck(P, rng(2), 9, hy + 2, 14, 8, p.hairLo, 7);
  } else if (hair === 'swept') {
    R(8, hy - 1, 16, 12, p.hair);
    R(13, hy + 11, 6, 2, p.skin);
    R(15, hy - 1, 1, 5, p.hairLo);
    R(10, hy, 4, 1, p.hairHi); R(18, hy, 3, 1, p.hairHi);
    P(15, hy - 2, p.hair); P(16, hy - 2, p.hair);
  } else if (hair === 'wild') {
    R(7, hy - 2, 18, 15, p.hair);
    P(9, hy - 3, p.hair); P(13, hy - 4, p.hair); P(18, hy - 3, p.hair);
    P(8, hy + 13, p.hair); P(11, hy + 14, p.hair); P(15, hy + 14, p.hair); P(19, hy + 14, p.hair); P(23, hy + 13, p.hair);
    R(11, hy - 1, 4, 1, p.hairHi); P(18, hy - 1, p.hairHi);
    speck(P, rng(3), 8, hy + 1, 16, 11, p.hairLo, 9);
  } else if (hair === 'hood') {
    R(7, hy - 2, 18, 14, p.tunic);
    R(15, hy, 1, 10, p.tunicLo);
    P(15, hy - 3, p.tunic); P(16, hy - 3, p.tunicLo);
    R(8, hy - 1, 15, 1, 'rgba(255,255,255,0.10)');
    R(8, hy + 12, 16, 3, p.tunic);
    speck(P, rng(4), 8, hy + 2, 16, 9, p.tunicLo, 6);
  }
}
function headSide(R, P, p, hy, xo, hair) {
  // base profile face (facing right)
  R(10 + xo, hy + 2, 13, 11, p.skin);
  P(19 + xo, hy + 8, p.outline);
  P(19 + xo, hy + 9, p.skinLo);
  P(23 + xo, hy + 9, p.skin); P(23 + xo, hy + 10, p.skinLo);
  P(21 + xo, hy + 11, p.skinLo); P(20 + xo, hy + 11, p.skinLo);
  P(18 + xo, hy + 10, p.cheek);
  R(17 + xo, hy + 6, 3, 1, p.hairLo);
  if (hair !== 'wild' && hair !== 'hood') { R(14 + xo, hy + 7, 2, 3, p.skin); P(14 + xo, hy + 8, p.skinLo); }
  if (hair === 'scruff') {
    R(8 + xo, hy - 1, 15, 4, p.hair);
    R(8 + xo, hy + 3, 5, 9, p.hair);
    P(13 + xo, hy + 3, p.hair); P(13 + xo, hy + 4, p.hair);
    P(20 + xo, hy + 3, p.hair); P(21 + xo, hy + 3, p.hair);
    P(11 + xo, hy - 2, p.hair); P(16 + xo, hy - 3, p.hair); P(19 + xo, hy - 2, p.hair);
    P(8 + xo, hy + 12, p.hair);
    R(12 + xo, hy, 4, 1, p.hairHi);
    P(16 + xo, hy + 5, p.hair); P(16 + xo, hy + 6, p.hair);
    P(19 + xo, hy + 12, p.stubble); P(21 + xo, hy + 12, p.stubble); P(22 + xo, hy + 11, p.stubble); P(17 + xo, hy + 12, p.stubble);
  } else if (hair === 'swept') {
    R(8 + xo, hy - 1, 15, 4, p.hair);
    R(18 + xo, hy + 3, 5, 1, p.hair); R(20 + xo, hy + 4, 3, 1, p.hair);
    R(8 + xo, hy + 3, 4, 7, p.hair);
    P(12 + xo, hy + 3, p.hair); P(12 + xo, hy + 4, p.hair);
    R(11 + xo, hy, 5, 1, p.hairHi); P(9 + xo, hy + 1, p.hairHi);
    P(8 + xo, hy + 10, p.hairLo);
  } else if (hair === 'wild') {
    R(7 + xo, hy - 2, 16, 5, p.hair);
    R(7 + xo, hy + 3, 9, 13, p.hair);
    P(17 + xo, hy - 2, p.hair); P(20 + xo, hy - 2, p.hair); P(11 + xo, hy - 3, p.hair);
    P(7 + xo, hy + 16, p.hair); P(10 + xo, hy + 16, p.hair); P(13 + xo, hy + 16, p.hair);
    // beard along jaw
    R(16 + xo, hy + 10, 6, 4, p.hair);
    P(22 + xo, hy + 10, p.hair); P(17 + xo, hy + 14, p.hair); P(20 + xo, hy + 14, p.hair);
    R(18 + xo, hy + 10, 4, 1, p.hairLo);
    R(11 + xo, hy - 1, 4, 1, p.hairHi); P(9 + xo, hy + 6, p.hairHi);
    speck(P, rng(5), 8 + xo, hy + 4, 8, 10, p.hairLo, 6);
  } else if (hair === 'hood') {
    R(7 + xo, hy - 2, 17, 5, p.tunic);
    R(7 + xo, hy + 3, 9, 11, p.tunic);
    R(16 + xo, hy + 12, 8, 2, p.tunic);
    R(16 + xo, hy + 3, 8, 1, p.sleeve);
    R(16 + xo, hy + 4, 1, 8, p.sleeve);
    P(23 + xo, hy + 3, p.tunic);
    P(6 + xo, hy + 2, p.tunicLo); P(6 + xo, hy + 3, p.tunic);
    R(8 + xo, hy - 1, 14, 1, 'rgba(255,255,255,0.10)');
    R(8 + xo, hy + 13, 14, 2, p.tunic);
    speck(P, rng(6), 8 + xo, hy + 4, 8, 9, p.tunicLo, 5);
  }
}
function arthurFrame(p, dir, pose, f, hair) {
  const c = mk(32, 48, ({ R, P }) => {
    let bob = 0, dl = 0, dr = 0, lean = 0;
    if (pose === 'walk') {
      const ph = [[-2, 0, -1], [0, 0, 0], [0, -2, -1], [0, 0, 0]][f];
      dl = ph[0]; dr = ph[1]; bob = ph[2];
    }
    if (pose === 'act') { bob = f === 0 ? -1 : 1; lean = f === 0 ? -1 : 2; }
    const hy = 3 + bob, by = 16 + bob;
    if (dir === 'right') {
      const fw = pose === 'walk' ? (f === 0 ? 2 : f === 2 ? -2 : 0) : 0;
      R(11 - fw, 31, 5, 10, p.pants); R(11 - fw, 40, 5, 5, p.boots); R(11 - fw + 3, 40, 2, 1, p.skinLo);
      R(16 + fw, 31, 5, 10, p.pants); R(16 + fw, 40, 5, 5, p.boots);
      R(10 + lean, by, 12, 15, p.tunic);
      R(10 + lean, by, 3, 15, p.tunicLo);
      R(10 + lean, by + 11, 12, 2, p.belt); P(18 + lean, by + 11, p.buckle);
      R(10 + lean, by, 12, 4, p.sleeve);
      if (pose === 'act') {
        if (f === 0) { R(18 + lean, by - 6, 3, 9, p.sleeve); R(18 + lean, by - 8, 3, 3, p.skin); axe(R, P, p, 20 + lean, hy - 4, 0); }
        else { R(19 + lean, by + 4, 8, 3, p.sleeve); R(26 + lean, by + 4, 3, 3, p.skin); axe(R, P, p, 26 + lean, by + 2, 1); }
      } else {
        const sw = pose === 'walk' ? (f === 0 ? 2 : f === 2 ? -2 : 0) : 0;
        R(17 + sw, by + 3, 3, 8, p.sleeve); R(17 + sw, by + 10, 3, 3, p.skin);
      }
      headSide(R, P, p, hy, lean, hair);
    } else {
      const back = dir === 'up';
      R(10, 31 + dl, 5, 10 - dl, p.pants);
      R(10, 40 + dl, 5, 5, p.boots);
      R(17, 31 + dr, 5, 10 - dr, p.pants);
      R(17, 40 + dr, 5, 5, p.boots);
      R(9, by, 14, 15, p.tunic);
      R(9, by, 2, 15, p.tunicLo); R(21, by, 2, 15, p.tunicLo);
      R(9, by + 11, 14, 2, p.belt); P(15, by + 11, p.buckle); P(16, by + 11, p.buckle);
      R(9, by, 14, 3, p.sleeve);
      if (back) { R(12, by + 2, 8, 7, p.boots); R(12, by + 2, 8, 2, p.belt); P(13, by + 4, p.buckle); }
      else { P(15, by, p.skin); P(16, by, p.skin); P(15, by + 1, p.skinLo); P(16, by + 1, p.skinLo); }
      const swL = pose === 'walk' ? (f === 0 ? 1 : f === 2 ? -1 : 0) : 0;
      if (pose === 'act' && !back) {
        if (f === 0) { R(23, by - 7, 3, 10, p.sleeve); R(23, by - 9, 3, 3, p.skin); axe(R, P, p, 22, hy - 6, 0); R(6, by + 2 + swL, 3, 9, p.sleeve); R(6, by + 10, 3, 3, p.skin); }
        else { R(23, by + 6, 3, 8, p.sleeve); R(23, by + 12, 3, 3, p.skin); axe(R, P, p, 21, by + 10, 2); R(6, by + 2, 3, 9, p.sleeve); R(6, by + 10, 3, 3, p.skin); }
      } else {
        R(6, by + 2 + swL, 3, 9, p.sleeve); R(6, by + 10 + swL, 3, 3, p.skin);
        R(23, by + 2 - swL, 3, 9, p.sleeve); R(23, by + 10 - swL, 3, 3, p.skin);
      }
      if (back) headBack(R, P, p, hy, hair);
      else headFront(R, P, p, hy, hair);
    }
  });
  return outline(c, p.outline);
}
function axe(R, P, p, x, y, rot) {
  if (rot === 0) { R(x, y, 2, 8, p.trunk); R(x - 2, y - 3, 6, 4, p.stoneI); R(x - 2, y - 3, 6, 1, p.stoneIHi); }
  else if (rot === 1) { R(x, y, 7, 2, p.trunk); R(x + 5, y - 2, 4, 6, p.stoneI); R(x + 5, y - 2, 1, 6, p.stoneIHi); }
  else { R(x, y, 2, 7, p.trunk); R(x - 2, y + 5, 6, 4, p.stoneI); R(x - 2, y + 5, 6, 1, p.stoneIHi); }
}

/* ---------- rabbit ---------- */
function rabbitFrame(p, kind) {
  const c = mk(20, 18, ({ R, P }) => {
    const rnd = rng(15);
    if (kind.startsWith('sit')) {
      blob(R, rnd, 9, 12, 6, 4, p.fur);
      R(11, 5, 6, 6, p.fur);
      const tw = kind === 'sit1' ? 1 : 0;
      R(12, 1 + tw, 2, 5 - tw, p.fur); P(12, 2 + tw, p.earPink);
      R(15, 1, 2, 5, p.fur); P(15, 2, p.earPink);
      P(15, 7, p.outline);
      P(17, 8, p.earPink);
      R(3, 10, 2, 2, p.furHi);
      R(6, 15, 5, 1, p.furLo);
      dith(P, 5, 12, 6, 3, p.furLo);
    } else {
      const st = kind === 'hop1' ? 1 : 0;
      blob(R, rnd, 9, 11 - st, 8, 3 + st, p.fur);
      R(13, 4, 6, 6, p.fur);
      R(13, 1, 2, 4, p.fur); R(16, 2, 2, 3, p.fur); P(13, 2, p.earPink);
      P(17, 6, p.outline);
      R(2, 10, 2, 2, p.furHi);
      R(15, 11, 3, 2, p.fur); R(3, 12 + st, 4, 2, p.fur);
      dith(P, 5, 10, 6, 3, p.furLo);
    }
  });
  return outline(c, p.outline);
}

/* ---------- icons 16x16 ---------- */
function icon(p, kind) {
  const c = mk(16, 16, ({ R, P }) => {
    if (kind === 'stick') { for (let i = 0; i < 8; i++) R(3 + i, 11 - i, 2, 2, p.trunk); P(7, 6, p.trunk); P(8, 5, p.trunk); for (let i = 0; i < 4; i++) P(4 + i * 2, 10 - i * 2, p.woodRing); }
    if (kind === 'stone') { R(3, 6, 8, 6, p.stoneI); R(4, 5, 6, 1, p.stoneI); R(4, 6, 4, 2, p.stoneIHi); R(10, 9, 3, 3, p.stoneI); }
    if (kind === 'wood') { R(2, 9, 12, 4, p.woodLog); R(2, 9, 12, 1, p.woodRing); R(1, 9, 2, 4, p.woodRing); R(4, 4, 11, 4, p.woodLog); R(4, 4, 11, 1, p.woodRing); R(12, 4, 2, 4, p.woodRing); }
    if (kind === 'axe') { for (let i = 0; i < 9; i++) R(3 + i, 12 - i, 2, 2, p.trunk); R(9, 1, 6, 5, p.stoneI); R(9, 1, 6, 1, p.stoneIHi); R(9, 5, 4, 2, p.stoneI); }
    if (kind === 'meatRaw' || kind === 'meatCk') {
      const b = kind === 'meatCk' ? p.meatCk : p.meatRaw, lo = kind === 'meatCk' ? p.meatCkLo : p.meatRawLo;
      R(2, 5, 9, 7, b); R(3, 4, 7, 1, b); R(3, 9, 7, 3, lo); R(11, 6, 2, 2, p.meatBone); R(13, 5, 2, 2, p.meatBone); R(11, 9, 2, 2, p.meatBone);
    }
    if (kind === 'hunger') { R(3, 3, 7, 6, p.meatCk); R(4, 8, 5, 2, p.meatCkLo); R(9, 9, 2, 2, p.meatBone); R(11, 11, 3, 2, p.meatBone); P(4, 4, p.ember); }
    if (kind === 'thirst') { P(7, 2, p.waterHi); R(6, 4, 3, 2, p.water); R(5, 6, 7, 4, p.water); R(6, 10, 5, 2, p.waterDeep); P(6, 6, p.waterHi); P(6, 7, p.waterHi); }
    if (kind === 'hammer') { R(7, 6, 2, 8, p.trunk); R(4, 2, 8, 4, p.stoneI); R(4, 2, 8, 1, p.stoneIHi); }
    if (kind === 'fire') { R(6, 8, 5, 5, p.fire1); R(7, 6, 3, 5, p.fire2); P(8, 9, p.fire3); P(8, 10, p.fire3); P(5, 12, p.trunk); R(4, 13, 9, 2, p.trunk); }
    if (kind === 'home') { R(4, 8, 9, 6, p.frame); for (let i = 0; i < 5; i++) R(8 - i, 3 + i, 2 + i * 2, 1, p.thatch); R(7, 10, 3, 4, p.outline); }
    if (kind === 'chest') { R(3, 7, 10, 6, p.woodLog); R(3, 4, 10, 4, p.trunk); R(3, 4, 10, 1, p.woodRing); R(7, 8, 2, 3, p.stoneI); R(4, 7, 1, 6, p.trunkLo); R(11, 7, 1, 6, p.trunkLo); }
    if (kind === 'wall') { R(3, 4, 10, 10, p.trunk); R(3, 4, 10, 2, p.woodRing); for (const y of [8, 11] ) R(3, y, 10, 1, p.trunkLo); }
    if (kind === 'bed') { R(3, 3, 10, 3, p.trunk); R(4, 6, 8, 3, p.foam); R(3, 9, 10, 5, p.tunic); R(3, 9, 10, 1, p.tunicLo); }
    if (kind === 'table') { R(2, 6, 12, 4, p.woodLog); R(2, 6, 12, 1, p.woodRing); R(3, 10, 2, 4, p.trunk); R(11, 10, 2, 4, p.trunk); }
    if (kind === 'hoe') { for (let i = 0; i < 9; i++) R(3 + i, 12 - i, 2, 2, p.trunk); R(9, 2, 6, 3, p.stoneI); R(9, 2, 2, 5, p.stoneI); R(9, 2, 6, 1, p.stoneIHi); }
    if (kind === 'coin') { R(5, 4, 6, 8, p.buckle); R(4, 5, 8, 6, p.buckle); R(6, 5, 2, 2, '#fff3c4'); R(6, 10, 4, 1, p.meatCkLo); P(10, 6, p.meatCkLo); }
    if (kind === 'turnip') { R(5, 8, 6, 5, '#efe6da'); P(4, 9, '#efe6da'); P(11, 9, '#efe6da'); R(6, 13, 4, 1, '#d8c8b8'); R(6, 4, 4, 4, p.canopy); P(5, 5, p.canopyHi); }
    if (kind === 'pumpkin') { R(4, 7, 8, 6, p.fire2); R(3, 8, 10, 4, p.fire2); R(7, 4, 2, 3, p.trunkLo); P(5, 8, p.fire3); P(5, 9, p.fire3); P(10, 6, p.canopy); }
    if (kind === 'turnipSeed') { P(5, 6, '#efe6da'); P(8, 5, '#efe6da'); P(11, 7, '#efe6da'); P(6, 9, '#e3d6c2'); P(9, 10, '#e3d6c2'); R(4, 12, 8, 1, p.dirtLo); }
    if (kind === 'pumpkinSeed') { P(5, 6, p.fire3); P(8, 5, p.fire3); P(11, 7, p.fire3); P(6, 9, p.ember); P(9, 10, p.ember); R(4, 12, 8, 1, p.dirtLo); }
    if (kind === 'sword') { for (let i = 0; i < 7; i++) P(4 + i, 11 - i, p.stoneIHi); for (let i = 0; i < 7; i++) P(5 + i, 11 - i, p.stoneI); R(3, 10, 3, 3, p.trunk); P(2, 13, p.trunkLo); R(5, 8, 1, 5, p.trunkLo); }
    if (kind === 'fur') { blob(R, rng(3), 8, 8, 5, 4, p.fur); dith(P, 5, 8, 7, 3, p.furLo); P(5, 4, p.furHi); P(10, 5, p.furHi); P(12, 9, p.furLo); }
    if (kind === 'heart') { R(4, 5, 3, 3, p.meatRaw); R(9, 5, 3, 3, p.meatRaw); R(3, 7, 10, 3, p.meatRaw); R(5, 10, 6, 2, p.meatRaw); R(7, 12, 2, 1, p.meatRawLo); P(5, 6, '#ffffff'); R(4, 10, 8, 1, p.meatRawLo); }
    if (kind === 'dragonfire') { R(6, 3, 4, 2, p.stoneIHi); R(5, 5, 6, 8, 'rgba(160,200,220,0.5)'); R(6, 7, 4, 5, p.fire1); R(7, 8, 2, 3, p.fire2); P(7, 6, p.fire3); R(5, 13, 6, 1, p.stoneI); }
    if (kind === 'flameSword') { for (let i = 0; i < 7; i++) P(4 + i, 11 - i, p.fire3); for (let i = 0; i < 7; i++) P(5 + i, 11 - i, p.fire2); P(10, 4, p.fire1); R(3, 10, 3, 3, p.trunk); P(2, 13, p.trunkLo); }
    if (kind === 'forge') { R(3, 6, 10, 8, p.stoneI); R(3, 6, 10, 1, p.stoneIHi); R(9, 2, 3, 5, p.stoneI); R(5, 9, 5, 4, p.outline); P(7, 11, p.fire2); P(6, 12, p.fire1); }
    if (kind === 'sun') {
      R(6, 6, 5, 5, p.fire3); R(7, 5, 3, 1, p.fire3); R(7, 11, 3, 1, p.fire3);
      P(5, 6, p.fire3); P(11, 6, p.fire3); P(5, 10, p.fire3); P(11, 10, p.fire3);
      P(8, 2, p.ember); P(8, 14, p.ember); P(2, 8, p.ember); P(14, 8, p.ember);
      P(4, 4, p.ember); P(12, 4, p.ember); P(4, 12, p.ember); P(12, 12, p.ember);
      P(7, 6, '#ffffff');
    }
    if (kind === 'moon') {
      R(6, 3, 4, 1, p.foam); R(5, 4, 3, 1, p.foam); R(4, 5, 3, 2, p.foam);
      R(4, 7, 3, 3, p.foam); R(5, 10, 3, 1, p.foam); R(6, 11, 4, 1, p.foam);
      P(9, 4, p.foam); P(9, 10, p.foam);
      P(12, 4, p.ember); P(13, 9, p.foam);
    }
  });
  return outline(c, p.outline);
}

/* ---------- build all ---------- */
export function buildSprites(p, hair = 'scruff') {
  const arthur = {};
  for (const dir of ['down', 'up', 'right']) {
    arthur[dir] = {
      idle: arthurFrame(p, dir, 'idle', 0, hair),
      walk: [0, 1, 2, 3].map(f => arthurFrame(p, dir, 'walk', f, hair)),
      act: [0, 1].map(f => arthurFrame(p, dir, 'act', f, hair)),
    };
  }
  arthur.left = {
    idle: mirror(arthur.right.idle),
    walk: arthur.right.walk.map(mirror),
    act: arthur.right.act.map(mirror),
  };
  const rab = {
    sit: [rabbitFrame(p, 'sit0'), rabbitFrame(p, 'sit1')],
    hop: [rabbitFrame(p, 'hop0'), rabbitFrame(p, 'hop1')],
  };
  rab.sitL = rab.sit.map(mirror); rab.hopL = rab.hop.map(mirror);
  const icons = {};
  for (const k of ['stick', 'stone', 'wood', 'axe', 'meatRaw', 'meatCk', 'hunger', 'thirst', 'hammer', 'fire', 'home', 'sun', 'moon', 'chest', 'wall', 'bed', 'table', 'hoe', 'coin', 'turnip', 'pumpkin', 'turnipSeed', 'pumpkinSeed', 'sword', 'fur', 'heart', 'dragonfire', 'flameSword', 'forge']) icons[k] = icon(p, k);
  return {
    tiles: {
      grass: [tGrass(p, 1), tGrass(p, 2), tGrass(p, 5)],
      dirt: tDirt(p), rock: tRock(p), floor: tFloor(p),
      water: [tWater(p, 0), tWater(p, 1)],
    },
    props: {
      tree: pTree(p), sapling: pSapling(p), stump: pStump(p), boulder: pBoulder(p), bush: pBush(p),
      stick: pStick(p), stone: pStone(p), wood: pWood(p),
      meatRaw: pMeat(p, false), meatCk: pMeat(p, true),
      fireUnlit: pCampfire(p, -1), fire: [pCampfire(p, 0), pCampfire(p, 1), pCampfire(p, 2)],
      shelterFrame: pShelterFrame(p),
      roof: pRoof(p), roofT2: pRoofT2(p), wallFace: wWallFace(p), wallW: wWallSide(p, false), wallE: wWallSide(p, true), door: wDoor(p),
      chest: pChest(p), bed: pBed(p), table: pTable(p),
      stall: pStall(p),
      soil: pSoil(p, false), soilWet: pSoil(p, true),
      cropWithered: pCropWithered(p),
      trail: pTrail(p),
      fur: pFur(p),
      cave: pCave(p), forge: pForge(p),
      dragonfire: pFur(p), flameSword: pFur(p), // ground-drop stand-ins (rarely dropped)
    },
    wolf: (() => {
      const r = [pWolf(p, 0), pWolf(p, 1)];
      return { r, l: r.map(mirror) };
    })(),
    crops: {
      turnip: [0, 1, 2].map(s => pCropStage(p, 'turnip', s, 3)),
      pumpkin: [0, 1, 2, 3, 4].map(s => pCropStage(p, 'pumpkin', s, 5)),
    },
    arthur, rabbit: rab, icons,
  };
}

// Villager sprites (Phase 5): the Arthur frame generator with per-NPC
// colour overrides — placeholders under npc.<id> asset ids until hand-made
// character sheets arrive.
export function buildVillager(p, look) {
  const p2 = { ...p, ...look };
  const v = {};
  for (const dir of ['down', 'up', 'right']) {
    v[dir] = {
      idle: arthurFrame(p2, dir, 'idle', 0, look.hairstyle),
      walk: [0, 1, 2, 3].map(f => arthurFrame(p2, dir, 'walk', f, look.hairstyle)),
    };
  }
  v.left = { idle: mirror(v.right.idle), walk: v.right.walk.map(mirror) };
  return v;
}

export function makePortrait(p, hair) {
  return arthurFrame(p, 'down', 'idle', 0, hair).toDataURL();
}

export function makeThumb(key) {
  const p = PALETTES[key];
  const sp = buildSprites(p);
  const c = document.createElement('canvas'); c.width = 160; c.height = 96;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  for (let ty = 0; ty < 3; ty++) for (let tx = 0; tx < 5; tx++) g.drawImage(sp.tiles.grass[(tx + ty * 2) % 3], tx * 32, ty * 32);
  g.drawImage(sp.tiles.water[0], 0, 64); g.drawImage(sp.tiles.water[1], 32, 64);
  g.fillStyle = p.sand; g.fillRect(0, 62, 64, 3);
  g.drawImage(sp.tiles.dirt, 96, 32);
  g.drawImage(sp.props.tree, 4, -6);
  g.drawImage(sp.props.fire[1], 108, 30);
  g.drawImage(sp.props.bush, 126, 68);
  g.drawImage(sp.arthur.down.idle, 64, 22);
  if (p.ambient) { g.fillStyle = p.ambient; g.fillRect(0, 0, 160, 96); }
  return c.toDataURL();
}
