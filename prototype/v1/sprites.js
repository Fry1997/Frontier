// Frontier — palettes + procedural pixel-art sprite generation (32px tiles)

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
    skin: '#f0c9a2', skinLo: '#d8a87e', hair: '#6e4a2f', tunic: '#96693c', tunicLo: '#7d5530', sleeve: '#e6d3a7', pants: '#6b5a44', boots: '#4a3627', belt: '#3f2c20', buckle: '#e8a33d',
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
    skin: '#f0c9a2', skinLo: '#d8a87e', hair: '#6e4a2f', tunic: '#96693c', tunicLo: '#7d5530', sleeve: '#e6d3a7', pants: '#6b5a44', boots: '#4a3627', belt: '#3f2c20', buckle: '#e8a33d',
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
    skin: '#eec49e', skinLo: '#d3a179', hair: '#6e4a2f', tunic: '#96693c', tunicLo: '#7d5530', sleeve: '#e0cda3', pants: '#66564a', boots: '#463527', belt: '#3a2a22', buckle: '#e8a33d',
    fur: '#cdb69c', furLo: '#a89078', furHi: '#e4d7c2', earPink: '#d495a0',
    meatRaw: '#d3717d', meatRawLo: '#b25a66', meatBone: '#ece4d4', meatCk: '#a5693c', meatCkLo: '#855230',
    fire1: '#e0602a', fire2: '#f7ab3d', fire3: '#ffe396', ember: '#ffcb66', smoke: '#a29aae',
    thatch: '#bd9749', thatchLo: '#9a7838', frame: '#6e4830',
    ambient: 'rgba(88,70,140,0.16)', glow: '255,175,95',
    ui: { bg: 'rgba(36,26,46,0.85)', border: '#efe0c4', text: '#f5eddc', accent: '#f0ad4a', good: '#7fbf7a', bad: '#dd6f63' },
  },
};

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
  // f: -1 unlit, 0..2 lit
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
function pShelter(p, stage) {
  // stage: 0 = frame (mid-build look, used for ghost too), 1 = finished
  const c = mk(72, 62, ({ R, P }) => {
    R(6, 34, 60, 22, '#000'); // silhouette base to outline
    R(6, 34, 60, 22, p.frame);
    for (let y = 36; y < 56; y += 5) R(6, y, 60, 1, p.trunkLo);
    for (let x = 10; x < 66; x += 8) P(x, 38, p.trunkLo);
    // door
    R(29, 32, 14, 24, p.outline);
    R(30, 33, 12, 23, '#3a2620');
    R(28, 30, 2, 26, p.trunk); R(42, 30, 2, 26, p.trunk);
    // roof
    for (let y = 0; y < 32; y++) {
      const hw = 4 + y; // widening
      R(36 - hw, 4 + y, hw * 2, 1, stage ? p.thatch : p.frame);
    }
    if (stage) {
      for (let y = 6; y < 34; y += 4) {
        const hw = 2 + y;
        R(36 - hw + 2, y + 1, hw * 2 - 4, 1, p.thatchLo);
      }
      speck(P, rng(7), 14, 12, 44, 20, p.thatchLo, 24);
      speck(P, rng(8), 20, 6, 32, 16, '#e0c070', 12);
      R(30, 0, 12, 4, p.trunk); R(30, 0, 12, 1, p.trunkLo);
    } else {
      for (let y = 4; y < 34; y += 6) { const hw = 4 + y; R(36 - hw, 4 + y, 2, 2, p.trunk); R(34 + hw - 2, 4 + y, 2, 2, p.trunk); }
    }
    // eave shadow
    R(8, 34, 56, 2, p.trunkLo);
    // window
    if (stage) { R(52, 40, 8, 8, p.outline); R(53, 41, 6, 6, '#4a3220'); P(55, 43, p.ember); }
  });
  return outline(c, p.outline);
}

/* ---------- Arthur ---------- */
function arthurFrame(p, dir, pose, f) {
  // dir: 'down' | 'up' | 'right'  (left = mirrored right)
  // pose: 'idle' | 'walk' | 'act'
  const c = mk(32, 48, ({ R, P }) => {
    let bob = 0, dl = 0, dr = 0, lean = 0;
    if (pose === 'walk') {
      const ph = [[-2, 0, -1], [0, 0, 0], [0, -2, -1], [0, 0, 0]][f];
      dl = ph[0]; dr = ph[1]; bob = ph[2];
    }
    if (pose === 'act') { bob = f === 0 ? -1 : 1; lean = f === 0 ? -1 : 2; }
    const hy = 3 + bob, by = 16 + bob;
    if (dir === 'right') {
      // legs (scissor)
      const fw = pose === 'walk' ? (f === 0 ? 2 : f === 2 ? -2 : 0) : 0;
      R(11 - fw, 31, 5, 10, p.pants); R(11 - fw, 40, 5, 5, p.boots); R(11 - fw + 3, 40, 2, 1, p.skinLo);
      R(16 + fw, 31, 5, 10, p.pants); R(16 + fw, 40, 5, 5, p.boots);
      // body
      R(10 + lean, by, 12, 15, p.tunic);
      R(10 + lean, by, 3, 15, p.tunicLo);
      R(10 + lean, by + 11, 12, 2, p.belt); P(18 + lean, by + 11, p.buckle);
      R(10 + lean, by, 12, 4, p.sleeve);
      // arm
      if (pose === 'act') {
        if (f === 0) { R(18 + lean, by - 6, 3, 9, p.sleeve); R(18 + lean, by - 8, 3, 3, p.skin); axe(R, P, p, 20 + lean, hy - 4, 0); }
        else { R(19 + lean, by + 4, 8, 3, p.sleeve); R(26 + lean, by + 4, 3, 3, p.skin); axe(R, P, p, 26 + lean, by + 2, 1); }
      } else {
        const sw = pose === 'walk' ? (f === 0 ? 2 : f === 2 ? -2 : 0) : 0;
        R(17 + sw, by + 3, 3, 8, p.sleeve); R(17 + sw, by + 10, 3, 3, p.skin);
      }
      // head profile
      R(9 + lean, hy, 14, 13, p.skin);
      R(8 + lean, hy, 9, 13, p.hair);
      R(8 + lean, hy - 1, 15, 4, p.hair);
      P(23 + lean, hy + 3, p.hair);
      P(19 + lean, hy + 8, p.outline); // eye
      P(23 + lean, hy + 9, p.skinLo); // nose
      P(20 + lean, hy + 11, p.skinLo); // mouth
    } else {
      const back = dir === 'up';
      // legs
      R(10, 31 + dl, 5, 10 - dl, p.pants);
      R(10, 40 + dl, 5, 5, p.boots);
      R(17, 31 + dr, 5, 10 - dr, p.pants);
      R(17, 40 + dr, 5, 5, p.boots);
      // body
      R(9, by, 14, 15, p.tunic);
      R(9, by, 2, 15, p.tunicLo); R(21, by, 2, 15, p.tunicLo);
      R(9, by + 11, 14, 2, p.belt); P(15, by + 11, p.buckle); P(16, by + 11, p.buckle);
      R(9, by, 14, 3, p.sleeve);
      if (back) { R(12, by + 2, 8, 7, p.boots); R(12, by + 2, 8, 2, p.belt); P(13, by + 4, p.buckle); }
      else { P(15, by, p.skin); P(16, by, p.skin); P(15, by + 1, p.skinLo); P(16, by + 1, p.skinLo); }
      // arms
      const swL = pose === 'walk' ? (f === 0 ? 1 : f === 2 ? -1 : 0) : 0;
      if (pose === 'act' && !back) {
        if (f === 0) { R(23, by - 7, 3, 10, p.sleeve); R(23, by - 9, 3, 3, p.skin); axe(R, P, p, 22, hy - 6, 0); R(6, by + 2 + swL, 3, 9, p.sleeve); R(6, by + 10, 3, 3, p.skin); }
        else { R(23, by + 6, 3, 8, p.sleeve); R(23, by + 12, 3, 3, p.skin); axe(R, P, p, 21, by + 10, 2); R(6, by + 2, 3, 9, p.sleeve); R(6, by + 10, 3, 3, p.skin); }
      } else {
        R(6, by + 2 + swL, 3, 9, p.sleeve); R(6, by + 10 + swL, 3, 3, p.skin);
        R(23, by + 2 - swL, 3, 9, p.sleeve); R(23, by + 10 - swL, 3, 3, p.skin);
      }
      // head
      R(9, hy, 14, 13, p.skin);
      R(8, hy - 1, 16, 6, p.hair);
      if (back) { R(9, hy, 14, 13, p.hair); R(9, hy + 10, 14, 3, p.skin); speck(P, rng(2), 10, hy + 1, 12, 9, '#7d5636', 6); }
      else {
        P(9, hy + 5, p.hair); P(10, hy + 5, p.hair); P(22, hy + 5, p.hair); P(21, hy + 5, p.hair); P(15, hy + 5, p.hair); P(16, hy + 5, p.hair);
        P(12, hy + 8, p.outline); P(19, hy + 8, p.outline); // eyes
        P(12, hy + 9, p.skinLo); P(19, hy + 9, p.skinLo);
        R(15, hy + 11, 2, 1, p.skinLo); // mouth
        P(8, hy + 8, p.skin); P(23, hy + 8, p.skin); // ears
      }
    }
  });
  return outline(c, p.outline);
}
function axe(R, P, p, x, y, rot) {
  // tiny axe: handle + stone head. rot: 0 up, 1 side, 2 down-front
  if (rot === 0) { R(x, y, 2, 8, p.trunk); R(x - 2, y - 3, 6, 4, p.stoneI); R(x - 2, y - 3, 6, 1, p.stoneIHi); }
  else if (rot === 1) { R(x, y, 7, 2, p.trunk); R(x + 5, y - 2, 4, 6, p.stoneI); R(x + 5, y - 2, 1, 6, p.stoneIHi); }
  else { R(x, y, 2, 7, p.trunk); R(x - 2, y + 5, 6, 4, p.stoneI); R(x - 2, y + 5, 6, 1, p.stoneIHi); }
}

/* ---------- rabbit ---------- */
function rabbitFrame(p, kind) {
  // kind: 'sit0','sit1','hop0','hop1'
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
  });
  return outline(c, p.outline);
}

/* ---------- build all ---------- */
export function buildSprites(p) {
  const arthur = {};
  for (const dir of ['down', 'up', 'right']) {
    arthur[dir] = {
      idle: arthurFrame(p, dir, 'idle', 0),
      walk: [0, 1, 2, 3].map(f => arthurFrame(p, dir, 'walk', f)),
      act: [0, 1].map(f => arthurFrame(p, dir, 'act', f)),
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
  for (const k of ['stick', 'stone', 'wood', 'axe', 'meatRaw', 'meatCk', 'hunger', 'thirst', 'hammer', 'fire', 'home']) icons[k] = icon(p, k);
  return {
    tiles: {
      grass: [tGrass(p, 1), tGrass(p, 2), tGrass(p, 5)],
      dirt: tDirt(p), rock: tRock(p),
      water: [tWater(p, 0), tWater(p, 1)],
    },
    props: {
      tree: pTree(p), stump: pStump(p), boulder: pBoulder(p), bush: pBush(p),
      stick: pStick(p), stone: pStone(p), wood: pWood(p),
      meatRaw: pMeat(p, false), meatCk: pMeat(p, true),
      fireUnlit: pCampfire(p, -1), fire: [pCampfire(p, 0), pCampfire(p, 1), pCampfire(p, 2)],
      shelterFrame: pShelter(p, 0), shelter: pShelter(p, 1),
    },
    arthur, rabbit: rab, icons,
  };
}

export function iconURL(sp, k) { return sp.icons[k].toDataURL(); }

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
