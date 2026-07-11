// Frontier — game engine (Layers 1–3 vertical slice)
import { PALETTES, buildSprites, makeThumb } from './sprites.js';
import { SFX } from './sfx.js';

const T = 32;
const MAP = [
  'TTTTTbTTTTTTTbTTTTTTBTTTTT',
  'T......T........rrrrrr...T',
  'Tb..s.......T...rrrBrror.T',
  'T...........o...rrrrrrB..T',
  'T..T....T.........rroBr..T',
  'T.....s.......T....rr....T',
  'T.T.....o......s........bT',
  'T..........dddd......T...T',
  'T....s....dddddd..o......T',
  'T..o......dddddd.....b...T',
  'T.........ddddd....T.....T',
  'T.T....s.....d......s....T',
  'T............o...........T',
  'Tww.......T.........T....T',
  'Twwww..........o.........T',
  'Twwwww....s..........b...T',
  'Twwwww.......T...........T',
  'Twwww...o................T',
  'Tww.............b......s.T',
  'TTTTTTTTTbTTTTTTTTTBTTTTTT',
];
const MW = 26, MH = 20;

const RECIPE_DEFS = [
  { id: 'axe', name: 'STONE AXE', icon: 'axe', costs: [['stick', 1], ['stone', 1]], once: true, desc: 'CHOPS TREES' },
  { id: 'fire', name: 'CAMPFIRE', icon: 'fire', costs: [['wood', 3], ['stone', 2]], place: true, desc: 'COOK + WARMTH' },
  { id: 'shelter', name: 'SHELTER', icon: 'home', costs: [['wood', 6], ['stick', 4]], place: true, desc: 'MAKE IT HOME' },
];

const QUESTS = [
  { text: 'GATHER A STICK AND A STONE', done: g => g.inv.stick >= 1 && g.inv.stone >= 1 },
  { text: 'TAP CRAFT: MAKE A STONE AXE', done: g => g.inv.axe },
  { text: 'CHOP A TREE. GET 3 WOOD', done: g => g.tot.wood >= 3 },
  { text: 'CRAFT + PLACE A CAMPFIRE', done: g => g.flags.fire },
  { text: 'HUNT A RABBIT', done: g => g.tot.meatRaw >= 1 },
  { text: 'COOK THE MEAT AT YOUR FIRE', done: g => g.tot.meatCk >= 1 },
  { text: 'EAT: TAP THE ACTION BUTTON', done: g => g.flags.ate },
  { text: 'DRINK FROM THE POND', done: g => g.flags.drank },
  { text: 'BUILD A SHELTER. MAKE IT HOME', done: g => g.flags.shelter },
  { text: 'HOME', done: () => false },
];

export function createGame(cfg) {
  const els = cfg.els, onUi = cfg.onUi;
  const store = (() => { try { return JSON.parse(localStorage.getItem('frontier.settings') || '{}'); } catch (e) { return {}; } })();
  let palKey = store.palette || cfg.props.palette || 'meadow';
  if (!PALETTES[palKey]) palKey = 'meadow';
  const sfx = new SFX();
  sfx.setMuted(store.muted ?? !(cfg.props.sfx ?? true));
  let hints = cfg.props.showHints ?? true;

  const spCache = {};
  const getSprites = k => (spCache[k] ||= buildSprites(PALETTES[k]));
  let pal = PALETTES[palKey], sp = getSprites(palKey);

  // ---- world ----
  const ground = [], objects = new Map(), drops = [], rabbits = [], parts = [], floats = [];
  const okey = (x, y) => x + ',' + y;
  for (let y = 0; y < MH; y++) {
    ground.push([]);
    for (let x = 0; x < MW; x++) {
      const ch = (MAP[y] || '')[x] || '.';
      let gr = 'g' + ((x * 7 + y * 13) % 3);
      if (ch === 'd') gr = 'd'; else if (ch === 'r') gr = 'r'; else if (ch === 'w') gr = 'w';
      ground[y].push(gr);
      if (ch === 'T') objects.set(okey(x, y), { type: 'tree', hp: 3, shake: 0 });
      if (ch === 'B') objects.set(okey(x, y), { type: 'boulder' });
      if (ch === 'b') objects.set(okey(x, y), { type: 'bush' });
      if (ch === 's') drops.push(mkDrop('stick', x * T + 16, y * T + 20));
      if (ch === 'o') drops.push(mkDrop('stone', x * T + 16, y * T + 20));
    }
  }
  function mkDrop(kind, x, y, pop) {
    return { kind, x, y, t: Math.random() * 9, vx: pop ? (Math.random() - 0.5) * 60 : 0, vy: pop ? -60 - Math.random() * 40 : 0, z: pop ? 14 : 0 };
  }
  const RSPAWN = [[22, 13], [18, 16], [23, 6], [6, 11], [21, 15]];
  for (let i = 0; i < 3; i++) rabbits.push(mkRabbit(RSPAWN[i][0] * T + 16, RSPAWN[i][1] * T + 16));
  function mkRabbit(x, y) { return { x, y, vx: 0, vy: 0, state: 'sit', t: 1 + Math.random() * 2, hopT: 0, face: 1, alive: true, rt: 0 }; }

  const player = { x: 12.5 * T, y: 9.6 * T, dir: 'down', moving: false, animT: 0, actT: 0, actKind: null, cookT: 0 };
  const inv = { stick: 0, stone: 0, wood: 0, meatRaw: 0, meatCk: 0, axe: false };
  const tot = { stick: 0, stone: 0, wood: 0, meatRaw: 0, meatCk: 0 };
  const flags = { fire: false, ate: false, drank: false, shelter: false };
  const G = { inv, tot, flags };
  let stage = 0, stageFlash = 0, metersOn = false, hunger = 1, thirst = 1;
  let placing = null, duskT = 0, homeAt = 0, fireflies = [];
  let phase = 'title', muted = sfx.muted;

  // ---- canvas ----
  const cv = els.canvas, ctx = cv.getContext('2d');
  let scale = 3, VW = 320, VH = 240, raf = 0, last = 0, gt = 0;
  function resize() {
    const w = els.wrap.clientWidth || innerWidth, h = els.wrap.clientHeight || innerHeight;
    scale = Math.max(2, Math.round(Math.min(w, h) / 200));
    VW = Math.ceil(w / scale); VH = Math.ceil(h / scale);
    cv.width = VW; cv.height = VH;
    cv.style.width = VW * scale + 'px'; cv.style.height = VH * scale + 'px';
    ctx.imageSmoothingEnabled = false;
  }
  resize();
  const onRz = () => resize();
  addEventListener('resize', onRz);

  // ---- input ----
  const keys = {};
  let joy = { id: null, bx: 0, by: 0, vx: 0, vy: 0 };
  const kd = e => {
    if (e.repeat) return;
    keys[e.key.toLowerCase()] = true;
    const k = e.key.toLowerCase();
    if (phase !== 'game') return;
    if (k === 'e' || k === ' ' || k === 'enter') { e.preventDefault(); action(); }
    if (k === 'c') toggleCraft();
    if (k === 'escape') { if (placing) cancelPlace(); else setCraft(false); }
    if (k === 'p') cyclePalette();
    if (k === 'm') toggleSound();
  };
  const ku = e => { keys[e.key.toLowerCase()] = false; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);

  const jz = els.joyZone;
  const jpd = e => {
    if (phase !== 'game' || joy.id !== null) return;
    joy.id = e.pointerId; joy.bx = e.clientX; joy.by = e.clientY; joy.vx = 0; joy.vy = 0;
    jz.setPointerCapture(e.pointerId);
    positionJoy(e.clientX, e.clientY, 0, 0, true);
  };
  const jpm = e => {
    if (e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.bx, dy = e.clientY - joy.by;
    const m = Math.hypot(dx, dy);
    if (m > 40) { dx = dx / m * 40; dy = dy / m * 40; }
    joy.vx = dx / 40; joy.vy = dy / 40;
    positionJoy(joy.bx, joy.by, dx, dy, true);
  };
  const jpu = e => {
    if (e.pointerId !== joy.id) return;
    joy.id = null; joy.vx = 0; joy.vy = 0;
    positionJoy(0, 0, 0, 0, false);
  };
  function positionJoy(x, y, dx, dy, show) {
    const b = els.joyBase, k = els.joyKnob;
    if (!b || !k) return;
    b.style.display = show ? 'block' : 'none';
    if (show) {
      const r = els.wrap.getBoundingClientRect();
      b.style.left = (x - r.left - 48) + 'px'; b.style.top = (y - r.top - 48) + 'px';
      k.style.transform = `translate(${dx}px,${dy}px)`;
    }
  }
  jz.addEventListener('pointerdown', jpd);
  jz.addEventListener('pointermove', jpm);
  jz.addEventListener('pointerup', jpu);
  jz.addEventListener('pointercancel', jpu);

  // ---- helpers ----
  const tileAt = (tx, ty) => (tx < 0 || ty < 0 || tx >= MW || ty >= MH) ? 'X' : ground[ty][tx];
  const isLand = g => g !== 'w' && g !== 'X';
  function blockedTile(tx, ty) {
    const g = tileAt(tx, ty);
    if (g === 'X' || g === 'w') return true;
    const o = objects.get(okey(tx, ty));
    if (o && o.type !== 'stump') return true;
    return false;
  }
  function blockedPx(x, y) {
    for (const [ox, oy] of [[-6, -3], [6, -3], [-6, 4], [6, 4]])
      if (blockedTile(Math.floor((x + ox) / T), Math.floor((y + oy) / T))) return true;
    return false;
  }
  const DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
  function faceTile() {
    const [dx, dy] = DIRV[player.dir];
    return [Math.floor(player.x / T) + dx, Math.floor(player.y / T) + dy];
  }
  function facePoint() { const [dx, dy] = DIRV[player.dir]; return [player.x + dx * 24, player.y + dy * 22]; }
  function addFloat(str, x, y, col) { floats.push({ str, x, y, t: 0, col: col || pal.ui.text }); }
  function burst(x, y, cols, n, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, spd = (opts.spd || 40) * (0.4 + Math.random() * 0.8);
      parts.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - (opts.up || 20), t: 0, life: (opts.life || 0.6) * (0.7 + Math.random() * 0.6), col: cols[i % cols.length], sz: opts.sz || 2, grav: opts.grav ?? 90, flut: opts.flut || 0 });
    }
  }

  // ---- inventory / quests ----
  function gain(kind, n, x, y) {
    inv[kind] += n; tot[kind] += n;
    addFloat('+' + n + ' ' + LABEL[kind], x, y - 26, pal.ui.text);
    pushUi();
  }
  const LABEL = { stick: 'STICK', stone: 'STONE', wood: 'WOOD', meatRaw: 'RAW MEAT', meatCk: 'COOKED', };
  function checkQuest() {
    let adv = false;
    while (stage < QUESTS.length - 1 && QUESTS[stage].done(G)) {
      stage++; adv = true;
      if (stage === 4 && !metersOn) { metersOn = true; hunger = 0.62; thirst = 0.55; addFloat('YOU FEEL HUNGRY...', player.x, player.y - 60, pal.ui.accent); }
      if (stage === 9) startFinale();
    }
    if (adv) { stageFlash = 1; sfx.quest(); pushUi(); }
  }
  function startFinale() {
    homeAt = gt; sfx.home();
    for (let i = 0; i < 14; i++) fireflies.push({ x: player.x + (Math.random() - 0.5) * 300, y: player.y + (Math.random() - 0.5) * 200, a: Math.random() * 6.3, s: 8 + Math.random() * 12 });
    setTimeout(() => { if (!dead) onUi({ homeShown: true }); }, 2600);
  }

  // ---- crafting ----
  function canAfford(costs) { return costs.every(([k, n]) => inv[k] >= n); }
  function recipeState() {
    return RECIPE_DEFS.map(r => ({
      id: r.id, name: r.name, desc: r.desc,
      icon: sp.icons[r.icon].toDataURL(),
      costs: r.costs.map(([k, n]) => ({ icon: sp.icons[k === 'meatCk' ? 'meatCk' : k].toDataURL(), n, have: inv[k], ok: inv[k] >= n })),
      can: canAfford(r.costs) && !(r.once && inv.axe),
      done: r.once && inv.axe,
    }));
  }
  function craftItem(id) {
    const r = RECIPE_DEFS.find(q => q.id === id);
    if (!r) return;
    if (r.once && inv.axe) return;
    if (!canAfford(r.costs)) { sfx.denied(); return; }
    if (r.place) {
      placing = { id: r.id, w: r.id === 'shelter' ? 2 : 1 };
      setCraft(false); sfx.ui(); pushUi();
      return;
    }
    r.costs.forEach(([k, n]) => inv[k] -= n);
    inv.axe = true; sfx.craft();
    addFloat('STONE AXE!', player.x, player.y - 56, pal.ui.accent);
    burst(player.x, player.y - 30, [pal.ui.accent, pal.stoneIHi, pal.woodRing], 10, { up: 50 });
    setCraft(false); checkQuest(); pushUi();
  }
  function placeValid() {
    if (!placing) return false;
    const [fx, fy] = faceTile();
    for (let i = 0; i < placing.w; i++) {
      const g = tileAt(fx + i, fy);
      if (!(g === 'd' || g[0] === 'g' || (placing.id === 'fire' && g === 'r'))) return false;
      if (objects.get(okey(fx + i, fy))) return false;
      for (const d of drops) if (Math.floor(d.x / T) === fx + i && Math.floor(d.y / T) === fy) return false;
    }
    return true;
  }
  function confirmPlace() {
    const r = RECIPE_DEFS.find(q => q.id === placing.id);
    if (!placeValid() || !canAfford(r.costs)) { sfx.denied(); return; }
    r.costs.forEach(([k, n]) => inv[k] -= n);
    const [fx, fy] = faceTile();
    if (placing.id === 'fire') {
      objects.set(okey(fx, fy), { type: 'fire', lit: true });
      flags.fire = true;
      burst(fx * T + 16, fy * T + 16, [pal.smoke, pal.dirtLo], 8, { up: 30 });
    } else {
      objects.set(okey(fx, fy), { type: 'shelter', buildT: 0, w: 2 });
      objects.set(okey(fx + 1, fy), { type: 'shelterPart', anchor: [fx, fy] });
      burst(fx * T + 32, fy * T + 16, [pal.dirtLo, pal.trunkLo], 10, { up: 30 });
    }
    sfx.place(); placing = null;
    checkQuest(); pushUi();
  }
  function cancelPlace() { placing = null; sfx.ui(); pushUi(); }

  // ---- action ----
  function actionCtx() {
    if (placing) return placeValid() ? { k: 'place', label: 'PLACE' } : { k: 'blocked', label: 'CAN\'T' };
    if (player.cookT > 0) return { k: 'none', label: '...' };
    // rabbit hunt
    if (inv.axe) {
      const [px, py] = facePoint();
      for (const r of rabbits) if (r.alive && Math.hypot(r.x - px, r.y - py) < 26) return { k: 'hunt', label: 'HUNT', r };
    }
    const [fx, fy] = faceTile();
    const o = objects.get(okey(fx, fy));
    if (o && o.type === 'tree') return inv.axe ? { k: 'chop', label: 'CHOP', o, fx, fy } : { k: 'noaxe', label: 'NEED AXE' };
    if (o && (o.type === 'fire') && inv.meatRaw > 0) return { k: 'cook', label: 'COOK' };
    if (tileAt(fx, fy) === 'w' && thirst < 0.98) return { k: 'drink', label: 'DRINK', fx, fy };
    if (inv.meatCk > 0 && hunger < 0.98 && metersOn) return { k: 'eat', label: 'EAT' };
    // stand-near fire cook (facing not required)
    if (inv.meatRaw > 0 && nearFire()) return { k: 'cook', label: 'COOK' };
    return { k: 'none', label: '...' };
  }
  function nearFire() {
    const tx = Math.floor(player.x / T), ty = Math.floor(player.y / T);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const o = objects.get(okey(tx + dx, ty + dy));
      if (o && o.type === 'fire' && o.lit) return true;
    }
    return false;
  }
  function action() {
    sfx.ensure();
    const c = actionCtx();
    if (c.k === 'place') return confirmPlace();
    if (c.k === 'blocked') { sfx.denied(); return; }
    if (c.k === 'noaxe') { sfx.denied(); addFloat('NEED AN AXE!', player.x, player.y - 56, pal.ui.bad); return; }
    if (c.k === 'chop') { swing(() => hitTree(c.o, c.fx, c.fy)); return; }
    if (c.k === 'hunt') { swing(() => hitRabbit(c.r)); return; }
    if (c.k === 'drink') {
      thirst = Math.min(1, thirst + 0.5); flags.drank = true; sfx.drink();
      burst(c.fx * T + 16, c.fy * T + 10, [pal.waterHi, pal.foam], 7, { up: 45, grav: 160, sz: 1 });
      addFloat('AHH', player.x, player.y - 56, pal.waterHi);
      checkQuest(); return;
    }
    if (c.k === 'cook') {
      player.cookT = 1.3; sfx.cook(); return;
    }
    if (c.k === 'eat') {
      inv.meatCk--; hunger = Math.min(1, hunger + 0.55); flags.ate = true; sfx.eat();
      addFloat('YUM!', player.x, player.y - 56, pal.ui.good);
      checkQuest(); pushUi(); return;
    }
    sfx.ui();
  }
  let swingCb = null;
  function swing(cb) {
    if (player.actT > 0) return;
    player.actT = 0.34; swingCb = cb;
  }
  function hitTree(o, fx, fy) {
    o.hp--; o.shake = 0.25; sfx.chop();
    burst(fx * T + 16, fy * T - 8, [pal.canopy, pal.canopyHi, pal.canopyLo], 6, { up: 10, grav: 60, flut: 1, life: 0.9 });
    if (o.hp <= 0) {
      objects.set(okey(fx, fy), { type: 'stump' });
      sfx.treeFall();
      burst(fx * T + 16, fy * T, [pal.canopy, pal.canopyLo, pal.trunk], 14, { up: 30, flut: 1, life: 1 });
      const n = 2 + (Math.random() > 0.5 ? 1 : 0);
      for (let i = 0; i < n; i++) drops.push(mkDrop('wood', fx * T + 16, fy * T + 12, true));
    }
  }
  function hitRabbit(r) {
    if (!r.alive) return;
    r.alive = false; r.rt = 24; sfx.squeak(); sfx.poof();
    burst(r.x, r.y - 6, [pal.smoke, pal.furHi, pal.fur], 10, { up: 30, life: 0.7 });
    drops.push(mkDrop('meatRaw', r.x, r.y, true));
  }

  // ---- ui push ----
  let craftOpen = false;
  function setCraft(v) { if (craftOpen === v) return; craftOpen = v; pushUi(); }
  function toggleCraft() { sfx.ensure(); if (placing) { cancelPlace(); return; } craftOpen = !craftOpen; sfx.ui(); pushUi(); }
  function pushUi() {
    onUi({
      phase, paletteKey: palKey, paletteName: pal.name, muted,
      craftOpen, placing: placing ? placing.id : null,
      recipes: recipeState(),
      craftPulse: stage === 1 && !inv.axe,
    });
  }
  function saveSettings() { try { localStorage.setItem('frontier.settings', JSON.stringify({ palette: palKey, muted })); } catch (e) {} }

  // ---- update ----
  function update(dt) {
    gt += dt;
    if (phase !== 'game') return;
    // movement
    let mx = (keys['a'] || keys['arrowleft'] ? -1 : 0) + (keys['d'] || keys['arrowright'] ? 1 : 0) + joy.vx;
    let my = (keys['w'] || keys['arrowup'] ? -1 : 0) + (keys['s'] || keys['arrowdown'] ? 1 : 0) + joy.vy;
    const m = Math.hypot(mx, my);
    const weak = metersOn && (hunger < 0.15 || thirst < 0.15);
    const spd = (weak ? 68 : 104) * (player.cookT > 0 ? 0 : 1) * Math.min(1, m);
    if (m > 0.15 && player.actT <= 0) {
      mx /= m; my /= m;
      const nx = player.x + mx * spd * dt, ny = player.y + my * spd * dt;
      if (!blockedPx(nx, player.y)) player.x = nx;
      if (!blockedPx(player.x, ny)) player.y = ny;
      player.dir = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? 'right' : 'left') : (my > 0 ? 'down' : 'up');
      player.moving = spd > 1;
      player.animT += dt * (weak ? 5 : 7.5);
    } else player.moving = false;
    if (player.actT > 0) {
      const was = player.actT;
      player.actT -= dt;
      if (was > 0.17 && player.actT <= 0.17 && swingCb) { swingCb(); swingCb = null; }
    }
    if (player.cookT > 0) {
      player.cookT -= dt;
      if (Math.random() < dt * 8) burst(player.x + (DIRV[player.dir][0] * 20), player.y - 10, [pal.ember, pal.fire2], 1, { up: 40, grav: -10, sz: 1, life: 0.5 });
      if (player.cookT <= 0 && inv.meatRaw > 0) {
        inv.meatRaw--; inv.meatCk++; tot.meatCk++;
        addFloat('+1 COOKED MEAT', player.x, player.y - 56, pal.ui.good);
        sfx.craft(); checkQuest(); pushUi();
      }
    }
    // meters
    if (metersOn) {
      hunger = Math.max(0, hunger - dt * 0.0042);
      thirst = Math.max(0, thirst - dt * 0.0056);
    }
    // drops
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]; d.t += dt;
      if (d.z > 0 || d.vy !== 0) {
        d.x += d.vx * dt;
        d.vy += 300 * dt; d.z -= d.vy * dt;
        if (d.z <= 0) { d.z = 0; d.vy = 0; d.vx = 0; }
      }
      if (d.t > 0.35 && Math.hypot(d.x - player.x, d.y - player.y) < 16) {
        gain(d.kind, 1, d.x, d.y);
        sfx.pickup();
        burst(d.x, d.y - 4, [pal.ui.text], 3, { up: 30, sz: 1, life: 0.35 });
        drops.splice(i, 1);
        checkQuest();
      }
    }
    // rabbits
    for (const r of rabbits) {
      if (!r.alive) { r.rt -= dt; if (r.rt <= 0) respawnRabbit(r); continue; }
      const pd = Math.hypot(player.x - r.x, player.y - r.y);
      if (pd < 78 && r.state !== 'flee') { r.state = 'flee'; r.t = 0; if (Math.random() < 0.6) sfx.squeak(); }
      if (r.state === 'sit') {
        r.t -= dt;
        if (r.t <= 0) {
          const a = Math.random() * Math.PI * 2;
          r.vx = Math.cos(a) * 42; r.vy = Math.sin(a) * 42;
          r.state = 'hop'; r.t = 0.5 + Math.random() * 0.7;
        }
      } else {
        if (r.state === 'flee') {
          if (pd > 150) { r.state = 'sit'; r.t = 1 + Math.random() * 2; r.vx = 0; r.vy = 0; }
          else { const a = Math.atan2(r.y - player.y, r.x - player.x); r.vx = Math.cos(a) * 96; r.vy = Math.sin(a) * 96; }
        } else {
          r.t -= dt;
          if (r.t <= 0) { r.state = 'sit'; r.t = 0.8 + Math.random() * 2.2; r.vx = 0; r.vy = 0; }
        }
        r.hopT += dt * 9;
        const nx = r.x + r.vx * dt, ny = r.y + r.vy * dt;
        if (!blockedPx(nx, r.y)) r.x = nx; else r.vx *= -1;
        if (!blockedPx(r.x, ny)) r.y = ny; else r.vy *= -1;
        if (r.vx !== 0) r.face = r.vx > 0 ? 1 : -1;
      }
    }
    // objects anim
    for (const [k, o] of objects) {
      if (o.shake > 0) o.shake -= dt;
      if (o.type === 'fire' && o.lit && Math.random() < dt * 1.6) {
        const [otx, oty] = k.split(',').map(Number);
        parts.push({ x: otx * T + 14 + Math.random() * 5, y: oty * T + 4, vx: (Math.random() - 0.5) * 6, vy: -14, t: 0, life: 1.5, col: pal.smoke, sz: 2, grav: -4, flut: 1 });
      }
      if (o.type === 'shelter' && o.buildT !== undefined && o.buildT < 1.8) {
        const was = o.buildT;
        o.buildT += dt;
        if (Math.floor(was / 0.55) !== Math.floor(o.buildT / 0.55)) { sfx.chop(); }
        if (o.buildT >= 1.8) {
          const [otx, oty] = k.split(',').map(Number);
          delete o.buildT; flags.shelter = true; sfx.place();
          burst(otx * T + 32, oty * T + 8, [pal.thatch, pal.thatchLo, pal.woodRing], 16, { up: 40, life: 0.9 });
          checkQuest();
        }
      }
    }
    // finale dusk
    if (stage >= 9) duskT = Math.min(1, duskT + dt / 6);
    // particles + floats
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.t += dt;
      if (p.t > p.life) { parts.splice(i, 1); continue; }
      p.vy += p.grav * dt;
      p.x += p.vx * dt + (p.flut ? Math.sin(p.t * 10) * 20 * dt : 0);
      p.y += p.vy * dt;
    }
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i]; f.t += dt; f.y -= 18 * dt;
      if (f.t > 1.4) floats.splice(i, 1);
    }
    for (const ff of fireflies) { ff.a += dt * 0.8; ff.x += Math.cos(ff.a) * ff.s * dt; ff.y += Math.sin(ff.a * 1.3) * ff.s * dt * 0.6; }
    if (stageFlash > 0) stageFlash -= dt;
    // action label
    updateActionBtn();
  }
  function respawnRabbit(r) {
    for (let tries = 0; tries < 10; tries++) {
      const s = RSPAWN[Math.floor(Math.random() * RSPAWN.length)];
      const x = s[0] * T + 16, y = s[1] * T + 16;
      if (Math.hypot(x - player.x, y - player.y) > 160) {
        r.x = x; r.y = y; r.alive = true; r.state = 'sit'; r.t = 1;
        burst(x, y - 6, [pal.smoke], 6, { up: 20, life: 0.5 });
        return;
      }
    }
    r.rt = 5;
  }
  let lastLabel = '', lastEnabled = null;
  function updateActionBtn() {
    const c = actionCtx();
    const en = c.k !== 'none';
    if (c.label !== lastLabel && els.actionText) { els.actionText.textContent = c.label; lastLabel = c.label; }
    if (en !== lastEnabled && els.actionBtn) {
      els.actionBtn.style.opacity = en ? '1' : '0.45';
      els.actionBtn.style.borderColor = en ? pal.ui.accent : pal.ui.border;
      lastEnabled = en;
    }
  }

  // ---- render ----
  function render() {
    const p = pal;
    ctx.fillStyle = '#171019'; ctx.fillRect(0, 0, VW, VH);
    const mapW = MW * T, mapH = MH * T;
    let cx = Math.round(player.x - VW / 2), cy = Math.round(player.y - VH / 2 - 8);
    cx = mapW <= VW ? -((VW - mapW) >> 1) : Math.max(0, Math.min(mapW - VW, cx));
    cy = mapH <= VH ? -((VH - mapH) >> 1) : Math.max(0, Math.min(mapH - VH, cy));
    ctx.save(); ctx.translate(-cx, -cy);
    const wf = Math.floor(gt / 0.55) % 2, ff = Math.floor(gt / 0.13) % 3;
    const x0 = Math.max(0, Math.floor(cx / T)), y0 = Math.max(0, Math.floor(cy / T));
    const x1 = Math.min(MW - 1, Math.ceil((cx + VW) / T)), y1 = Math.min(MH - 1, Math.ceil((cy + VH) / T));
    // ground
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const g = ground[ty][tx], X = tx * T, Y = ty * T;
      if (g[0] === 'g') ctx.drawImage(sp.tiles.grass[+g[1]], X, Y);
      else if (g === 'd') ctx.drawImage(sp.tiles.dirt, X, Y);
      else if (g === 'r') ctx.drawImage(sp.tiles.rock, X, Y);
      else if (g === 'w') {
        ctx.drawImage(sp.tiles.water[wf], X, Y);
        // shores
        const L = isLand(tileAt(tx - 1, ty)), R2 = isLand(tileAt(tx + 1, ty)), U = isLand(tileAt(tx, ty - 1)), D = isLand(tileAt(tx, ty + 1));
        ctx.fillStyle = p.sand;
        if (U) { ctx.fillRect(X, Y, T, 3); ctx.fillStyle = p.foam; ctx.fillRect(X + (wf ? 2 : 0), Y + 3, T - 2, 1); ctx.fillStyle = p.sand; }
        if (D) { ctx.fillRect(X, Y + T - 3, T, 3); ctx.fillStyle = p.sandLo; ctx.fillRect(X, Y + T - 4, T, 1); ctx.fillStyle = p.sand; }
        if (L) { ctx.fillRect(X, Y, 3, T); ctx.fillStyle = p.foam; ctx.fillRect(X + 3, Y + (wf ? 1 : 0), 1, T - 1); ctx.fillStyle = p.sand; }
        if (R2) { ctx.fillRect(X + T - 3, Y, 3, T); ctx.fillStyle = p.foam; ctx.fillRect(X + T - 4, Y + (wf ? 1 : 0), 1, T - 1); ctx.fillStyle = p.sand; }
      }
      // grass lips over dirt/rock
      if (g === 'd' || g === 'r') {
        ctx.fillStyle = p.grass;
        if (tileAt(tx, ty - 1)[0] === 'g') { ctx.fillRect(X, Y, T, 2); ctx.fillStyle = p.grassLo; for (let i = 0; i < 8; i++) ctx.fillRect(X + i * 4 + ((tx + ty) % 2), Y + 2, 2, 1); ctx.fillStyle = p.grass; }
        if (tileAt(tx, ty + 1)[0] === 'g') ctx.fillRect(X, Y + T - 2, T, 2);
        if (tileAt(tx - 1, ty)[0] === 'g') ctx.fillRect(X, Y, 2, T);
        if (tileAt(tx + 1, ty)[0] === 'g') ctx.fillRect(X + T - 2, Y, 2, T);
      }
    }
    // placement highlight
    if (placing) {
      const [fx, fy] = faceTile();
      const ok = placeValid();
      const pulse = 0.5 + Math.sin(gt * 6) * 0.2;
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = ok ? p.ui.good : p.ui.bad;
      ctx.fillRect(fx * T, fy * T, T * placing.w, T);
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = ok ? p.ui.good : p.ui.bad;
      ctx.lineWidth = 2;
      ctx.strokeRect(fx * T + 1, fy * T + 1, T * placing.w - 2, T - 2);
      ctx.globalAlpha = 1;
    }
    // entities sorted by feet y
    const ents = [];
    for (const [k, o] of objects) {
      const [tx, ty] = k.split(',').map(Number);
      if (tx < x0 - 1 || tx > x1 + 1 || ty < y0 - 2 || ty > y1 + 1) continue;
      ents.push({ y: ty * T + T - (o.type === 'stump' ? 8 : 0), draw: () => drawObj(o, tx, ty, ff) });
    }
    for (const d of drops) ents.push({ y: d.y, draw: () => drawDrop(d) });
    for (const r of rabbits) if (r.alive) ents.push({ y: r.y + 8, draw: () => drawRabbit(r) });
    ents.push({ y: player.y, draw: drawPlayer });
    if (placing) {
      const [fx, fy] = faceTile();
      ents.push({ y: fy * T + T - 1, draw: () => { ctx.globalAlpha = 0.5; ctx.drawImage(placing.id === 'fire' ? sp.props.fireUnlit : sp.props.shelterFrame, fx * T - (placing.id === 'fire' ? 2 : 4), fy * T + T - (placing.id === 'fire' ? 30 : 58)); ctx.globalAlpha = 1; } });
    }
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) e.draw();
    // particles
    for (const pt of parts) {
      ctx.globalAlpha = Math.max(0, 1 - pt.t / pt.life);
      ctx.fillStyle = pt.col;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.sz, pt.sz);
    }
    ctx.globalAlpha = 1;
    // ambient + dusk
    if (p.ambient) { ctx.fillStyle = p.ambient; ctx.fillRect(cx, cy, VW, VH); }
    if (duskT > 0) { ctx.fillStyle = `rgba(34,26,74,${0.34 * duskT})`; ctx.fillRect(cx, cy, VW, VH); }
    // fire glow
    for (const [k, o] of objects) {
      if (o.type !== 'fire' || !o.lit) continue;
      const [tx, ty] = k.split(',').map(Number);
      const gx = tx * T + 16, gy = ty * T + 14;
      const rr = 54 + Math.sin(gt * 7) * 3;
      const grd = ctx.createRadialGradient(gx, gy, 4, gx, gy, rr);
      const a = 0.16 + duskT * 0.22;
      grd.addColorStop(0, `rgba(${p.glow},${a})`);
      grd.addColorStop(1, `rgba(${p.glow},0)`);
      ctx.fillStyle = grd; ctx.fillRect(gx - rr, gy - rr, rr * 2, rr * 2);
      if (Math.random() < 0.12) parts.push({ x: gx + (Math.random() - 0.5) * 8, y: gy - 8, vx: (Math.random() - 0.5) * 8, vy: -22, t: 0, life: 0.9, col: p.ember, sz: 1, grav: -6, flut: 1 });
    }
    // fireflies
    if (duskT > 0.2) for (const ffy of fireflies) {
      const bl = (Math.sin(gt * 3 + ffy.a * 7) + 1) / 2;
      if (bl > 0.35) {
        ctx.globalAlpha = bl * duskT;
        ctx.fillStyle = p.ember;
        ctx.fillRect(Math.round(ffy.x), Math.round(ffy.y), 2, 2);
        ctx.globalAlpha = bl * duskT * 0.3;
        ctx.fillRect(Math.round(ffy.x) - 1, Math.round(ffy.y) - 1, 4, 4);
      }
    }
    ctx.globalAlpha = 1;
    // floats
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    for (const f of floats) {
      ctx.globalAlpha = Math.max(0, 1.2 - f.t);
      ctx.fillStyle = p.outline;
      ctx.fillText(f.str, Math.round(f.x) + 1, Math.round(f.y) + 1);
      ctx.fillStyle = f.col;
      ctx.fillText(f.str, Math.round(f.x), Math.round(f.y));
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    if (phase === 'game') drawHUD();
  }
  function drawObj(o, tx, ty, ff) {
    const X = tx * T, Y = ty * T;
    const sh = o.shake > 0 ? Math.round(Math.sin(o.shake * 60) * 1.5) : 0;
    shadow(X + 16, Y + T - 3, o.type === 'tree' ? 13 : 10);
    if (o.type === 'tree') ctx.drawImage(sp.props.tree, X - 8 + sh, Y - 30);
    else if (o.type === 'stump') ctx.drawImage(sp.props.stump, X, Y + 8);
    else if (o.type === 'boulder') ctx.drawImage(sp.props.boulder, X + 1, Y + 6);
    else if (o.type === 'bush') ctx.drawImage(sp.props.bush, X + 1, Y + 8);
    else if (o.type === 'fire') ctx.drawImage(o.lit ? sp.props.fire[ff] : sp.props.fireUnlit, X - 2, Y + 2);
    else if (o.type === 'shelter') {
      if (o.buildT !== undefined) {
        const st = o.buildT / 1.8;
        ctx.drawImage(sp.props.shelterFrame, X - 4, Y + T - 58);
        if (Math.random() < 0.3) burst(X + 32 + (Math.random() - 0.5) * 40, Y + 10 + Math.random() * 20, [pal.dirtLo, pal.woodRing], 1, { up: 20, sz: 1, life: 0.4 });
        ctx.fillStyle = pal.ui.bg; ctx.fillRect(X + 12, Y - 34, 40, 6);
        ctx.fillStyle = pal.ui.accent; ctx.fillRect(X + 13, Y - 33, Math.round(38 * st), 4);
      } else ctx.drawImage(sp.props.shelter, X - 4, Y + T - 58);
    }
  }
  function drawDrop(d) {
    const bob = d.z > 0 ? -d.z : Math.sin(d.t * 3) * 1.5;
    const img = sp.props[d.kind];
    shadow(d.x, d.y + 3, 6);
    ctx.drawImage(img, Math.round(d.x - img.width / 2), Math.round(d.y - img.height + 2 + bob));
    if ((d.t % 2.2) < 0.35) {
      const ph = Math.floor((d.t % 2.2) / 0.12) % 3;
      ctx.fillStyle = ph === 1 ? '#ffffff' : pal.ui.accent;
      const sx = Math.round(d.x + 7), sy = Math.round(d.y - img.height - 2 + bob);
      ctx.fillRect(sx, sy - 1, 1, 3); ctx.fillRect(sx - 1, sy, 3, 1);
    }
  }
  function drawRabbit(r) {
    shadow(r.x, r.y + 7, 7);
    const hopping = r.state !== 'sit';
    const set = hopping ? (r.face > 0 ? sp.rabbit.hop : sp.rabbit.hopL) : (r.face > 0 ? sp.rabbit.sit : sp.rabbit.sitL);
    const fr = hopping ? Math.floor(r.hopT) % 2 : (Math.floor(gt * 1.5 + r.x) % 6 === 0 ? 1 : 0);
    const hz = hopping ? Math.abs(Math.sin(r.hopT * Math.PI * 0.5)) * 4 : 0;
    ctx.drawImage(set[fr], Math.round(r.x - 10), Math.round(r.y - 12 - hz));
  }
  function drawPlayer() {
    shadow(player.x, player.y + 2, 9);
    const a = sp.arthur[player.dir];
    let img;
    if (player.actT > 0) img = a.act[player.actT > 0.17 ? 0 : 1];
    else if (player.moving) img = a.walk[Math.floor(player.animT) % 4];
    else img = a.idle;
    ctx.drawImage(img, Math.round(player.x - 16), Math.round(player.y - 44));
    if (player.cookT > 0) {
      ctx.fillStyle = pal.ui.bg; ctx.fillRect(Math.round(player.x - 14), Math.round(player.y - 54), 28, 5);
      ctx.fillStyle = pal.ui.accent; ctx.fillRect(Math.round(player.x - 13), Math.round(player.y - 53), Math.round(26 * (1 - player.cookT / 1.3)), 3);
    }
  }
  function shadow(x, y, r) {
    ctx.globalAlpha = 0.16; ctx.fillStyle = pal.outline;
    ctx.fillRect(Math.round(x - r), Math.round(y - 2), r * 2, 4);
    ctx.fillRect(Math.round(x - r + 2), Math.round(y - 3), r * 2 - 4, 6);
    ctx.globalAlpha = 1;
  }
  function drawHUD() {
    const p = pal;
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    // resource chips (wrap before the top-right DOM buttons)
    let x = 5, cyy = 5;
    const chips = [['stick', inv.stick], ['stone', inv.stone], ['wood', inv.wood]];
    if (inv.meatRaw > 0) chips.push(['meatRaw', inv.meatRaw]);
    if (inv.meatCk > 0) chips.push(['meatCk', inv.meatCk]);
    if (inv.axe) chips.push(['axe', -1]);
    for (const [k, n] of chips) {
      const tw = n < 0 ? 0 : String(n).length * 8;
      if (x > 5 && x + 24 + tw > VW - 96) { x = 5; cyy += 24; }
      chipBg(x, cyy, 24 + tw);
      ctx.drawImage(sp.icons[k], x + (n < 0 ? 4 : 3), cyy + 2);
      if (n >= 0) { ctx.fillStyle = p.ui.text; ctx.fillText(String(n), x + 21, cyy + 6); }
      x += 30 + tw;
    }
    let hudY = cyy + 30;
    // quest banner (below chips, clear of the top-right DOM buttons)
    if (hints && stage < QUESTS.length) {
      const txt = stage === 9 ? 'HOME' : QUESTS[stage].text;
      ctx.font = '8px "Press Start 2P", monospace';
      const maxW = VW - 24;
      const words = txt.split(' ');
      const lines = [];
      let cur = '';
      for (const wd of words) {
        const t = cur ? cur + ' ' + wd : wd;
        if (ctx.measureText(t).width > maxW - 20 && cur) { lines.push(cur); cur = wd; }
        else cur = t;
      }
      if (cur) lines.push(cur);
      const lw = Math.max.apply(null, lines.map(l => ctx.measureText(l).width));
      const w = lw + 20, bh = lines.length * 12 + 8;
      const bx = Math.round((VW - w) / 2), by = hudY;
      const fl = stageFlash > 0 ? Math.sin(stageFlash * 20) * 1 : 0;
      ctx.fillStyle = p.ui.bg;
      ctx.fillRect(bx, by - fl, w, bh);
      ctx.strokeStyle = stageFlash > 0 ? p.ui.accent : p.ui.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5 - fl, w - 1, bh - 1);
      ctx.fillStyle = stage === 9 ? p.ui.accent : p.ui.text;
      ctx.textAlign = 'center';
      lines.forEach((l, i) => ctx.fillText(l, Math.round(VW / 2), by + 5 - fl + i * 12));
      ctx.textAlign = 'left';
      hudY = by + bh + 8;
    }
    // meters
    if (metersOn) {
      meter(5, hudY + 4, 'hunger', hunger, p.ui.accent);
      meter(5, hudY + 18, 'thirst', thirst, p.water);
    }
    // weak hint
    if (metersOn && (hunger < 0.15 || thirst < 0.15) && Math.floor(gt) % 6 < 3) {
      ctx.textAlign = 'center';
      ctx.fillStyle = p.ui.bad;
      ctx.fillText(hunger < 0.15 ? 'SO HUNGRY... (SLOWER)' : 'SO THIRSTY... (SLOWER)', Math.round(VW / 2), hudY + 40);
      ctx.textAlign = 'left';
    }
    if (placing) {
      ctx.textAlign = 'center';
      ctx.fillStyle = p.ui.text;
      const msg = 'WALK TO AIM THE SPOT';
      ctx.fillText(msg, Math.round(VW / 2), VH - 16);
      ctx.textAlign = 'left';
    }
  }
  function chipBg(x, y, w) {
    ctx.fillStyle = pal.ui.bg;
    ctx.fillRect(x + 1, y, w - 2, 20); ctx.fillRect(x, y + 1, w, 18);
    ctx.fillStyle = pal.ui.border;
    ctx.fillRect(x + 1, y, w - 2, 1); ctx.fillRect(x + 1, y + 19, w - 2, 1);
    ctx.fillRect(x, y + 1, 1, 18); ctx.fillRect(x + w - 1, y + 1, 1, 18);
    ctx.fillStyle = pal.ui.text;
  }
  function meter(x, y, kind, v, col) {
    ctx.drawImage(sp.icons[kind], x, y - 3);
    const w = 44;
    ctx.fillStyle = pal.ui.bg; ctx.fillRect(x + 18, y, w, 8);
    ctx.strokeStyle = v < 0.15 && Math.floor(gt * 2) % 2 ? pal.ui.bad : pal.ui.border;
    ctx.strokeRect(x + 18.5, y + 0.5, w - 1, 7);
    ctx.fillStyle = col;
    ctx.fillRect(x + 20, y + 2, Math.round((w - 4) * v), 4);
  }

  // ---- loop ----
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    update(dt);
    render();
  }
  raf = requestAnimationFrame(frame);

  // ---- api ----
  let dead = false;
  const handle = {
    start(k) {
      if (k && PALETTES[k]) { palKey = k; pal = PALETTES[palKey]; sp = getSprites(palKey); }
      phase = 'game'; sfx.ensure(); sfx.quest(); saveSettings(); pushUi();
    },
    action() { if (phase === 'game') action(); },
    toggleCraft, craftItem, cancelPlace,
    cyclePalette,
    setPalette(k) { if (!PALETTES[k]) return; palKey = k; pal = PALETTES[palKey]; sp = getSprites(palKey); saveSettings(); pushUi(); },
    toggleSound,
    setHints(v) { hints = !!v; },
    setMuted(v) { muted = !!v; sfx.setMuted(muted); saveSettings(); pushUi(); },
    dismissHome() { onUi({ homeShown: false }); },
    thumbs: () => Object.keys(PALETTES).map(k => ({ key: k, name: PALETTES[k].name, url: makeThumb(k) })),
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      removeEventListener('resize', onRz);
      removeEventListener('keydown', kd); removeEventListener('keyup', ku);
      jz.removeEventListener('pointerdown', jpd);
      jz.removeEventListener('pointermove', jpm);
      jz.removeEventListener('pointerup', jpu);
      jz.removeEventListener('pointercancel', jpu);
      try { sfx.ctx && sfx.ctx.close(); } catch (e) {}
    },
  };
  function cyclePalette() {
    const ks = Object.keys(PALETTES);
    handle.setPalette(ks[(ks.indexOf(palKey) + 1) % ks.length]);
    sfx.ui();
  }
  function toggleSound() {
    muted = !muted; sfx.setMuted(muted); saveSettings();
    if (!muted) { sfx.ensure(); sfx.ui(); }
    pushUi();
  }
  pushUi();
  return handle;
}
