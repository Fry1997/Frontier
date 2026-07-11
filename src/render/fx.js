// render/fx — transient visual-only state (§2.1): particles, floating text,
// fireflies, roof-fade and chimney timers. Never saved. Spawns in reaction
// to bus events; ambient effects (fire smoke, cook sizzle) read state each
// tick. Mutates nothing in GameState.

import * as timeSys from '../world/time.js';
import * as building from '../sim/building.js';
import { ITEMS } from '../content/items.js';

const T = 32;

export function createFx(rt) {
  const parts = [], floats = [];
  let fireflies = [], finaleT = 0;
  const roofFx = {}; // structureId -> { roofA, smk }

  const pal = () => rt.view.pal;

  function burst(x, y, cols, n, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, spd = (opts.spd || 40) * (0.4 + Math.random() * 0.8);
      parts.push({
        x, y,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - (opts.up || 20),
        t: 0, life: (opts.life || 0.6) * (0.7 + Math.random() * 0.6),
        col: cols[i % cols.length], sz: opts.sz || 2, grav: opts.grav ?? 90, flut: opts.flut || 0,
      });
    }
  }

  function float(str, x, y, col) {
    floats.push({ str, x, y, t: 0, col: col || pal().ui.text });
  }

  const kindCol = kind => ({
    accent: pal().ui.accent, good: pal().ui.good, bad: pal().ui.bad,
    water: pal().waterHi, text: pal().ui.text,
  }[kind] || pal().ui.text);

  // --- event-driven spawns ---
  const { bus } = rt;
  bus.on('fx:float', ({ str, x, y, kind }) => float(str, x, y, kindCol(kind)));
  bus.on('item:gained', ({ itemId, qty, x, y }) => {
    if (x !== undefined) float('+' + qty + ' ' + (ITEMS[itemId]?.label || itemId.toUpperCase()), x, y - 26);
  });
  bus.on('drop:collected', ({ x, y }) => burst(x, y - 4, [pal().ui.text], 3, { up: 30, sz: 1, life: 0.35 }));
  bus.on('tree:hit', ({ tx, ty }) => {
    const p = pal();
    burst(tx * T + 16, ty * T - 8, [p.canopy, p.canopyHi, p.canopyLo], 6, { up: 10, grav: 60, flut: 1, life: 0.9 });
  });
  bus.on('tree:felled', ({ tx, ty }) => {
    const p = pal();
    burst(tx * T + 16, ty * T, [p.canopy, p.canopyLo, p.trunk], 14, { up: 30, flut: 1, life: 1 });
  });
  bus.on('resource:regrown', ({ stage, tx, ty }) => {
    if (stage === 'tree') burst(tx * T + 16, ty * T + 8, [pal().canopyHi, pal().canopy], 8, { up: 25, flut: 1, life: 0.8 });
  });
  bus.on('rabbit:killed', ({ x, y }) => {
    const p = pal();
    burst(x, y - 6, [p.smoke, p.furHi, p.fur], 10, { up: 30, life: 0.7 });
  });
  bus.on('rabbit:spawned', ({ x, y }) => burst(x, y - 6, [pal().smoke], 6, { up: 20, life: 0.5 }));
  bus.on('player:drank', ({ tx, ty }) => {
    const p = pal();
    burst(tx * T + 16, ty * T + 10, [p.waterHi, p.foam], 7, { up: 45, grav: 160, sz: 1 });
    float('AHH', rt.state.player.x, rt.state.player.y - 56, p.waterHi);
  });
  bus.on('player:ate', ({ x, y }) => float('YUM!', x, y - 56, pal().ui.good));
  bus.on('cook:done', ({ x, y }) => float('+1 COOKED MEAT', x, y - 56, pal().ui.good));
  bus.on('craft:crafted', ({ name, x, y }) => {
    const p = pal();
    float(name + '!', x, y - 56, p.ui.accent);
    burst(x, y - 30, [p.ui.accent, p.stoneIHi, p.woodRing], 10, { up: 50 });
  });
  bus.on('object:placed', ({ type, tx, ty }) => {
    const p = pal();
    if (type === 'fire') burst(tx * T + 16, ty * T + 16, [p.smoke, p.dirtLo], 8, { up: 30 });
    else burst(tx * T + 80, ty * T + 40, [p.dirtLo, p.trunkLo], 10, { up: 30 });
  });
  bus.on('build:progress', ({ tx, ty }) => {
    const p = pal();
    if (Math.random() < 0.8) burst(tx * T + 40 + Math.random() * 80, ty * T + 20 + Math.random() * 60, [p.dirtLo, p.woodRing], 1, { up: 20, sz: 1, life: 0.4 });
  });
  bus.on('structure:built', ({ ax, ay }) => {
    const p = pal();
    burst(ax * T + 80, ay * T + 30, [p.thatch, p.thatchLo, p.woodRing], 18, { up: 45, life: 0.9 });
  });
  bus.on('quest:finale', () => {
    finaleT = 9;
    const p = rt.state.player;
    for (let i = 0; i < 14; i++) {
      fireflies.push({ x: p.x + (Math.random() - 0.5) * 300, y: p.y + (Math.random() - 0.5) * 200, a: Math.random() * 6.3, s: 8 + Math.random() * 12 });
    }
  });

  function update(dt) {
    const { state } = rt;
    const p = pal();
    const nightA = timeSys.nightAmt(state);
    const sp = rt.session.player;

    // ambient: campfire smoke
    for (const key of Object.keys(state.world.objects)) {
      const o = state.world.objects[key];
      if (o.type === 'fire' && o.lit && Math.random() < dt * 1.6) {
        const [otx, oty] = key.split(',').map(Number);
        parts.push({ x: otx * T + 14 + Math.random() * 5, y: oty * T + 4, vx: (Math.random() - 0.5) * 6, vy: -14, t: 0, life: 1.5, col: p.smoke, sz: 2, grav: -4, flut: 1 });
      }
    }

    // ambient: cook sizzle at the player's hands
    if (sp.cookT > 0 && Math.random() < dt * 8) {
      const DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
      burst(state.player.x + DIRV[state.player.dir][0] * 20, state.player.y - 10, [p.ember, p.fire2], 1, { up: 40, grav: -10, sz: 1, life: 0.5 });
    }

    // shelters: roof fade + chimney smoke
    for (const sh of state.structures) {
      const fx = (roofFx[sh.id] ||= { roofA: 1, smk: 2 });
      const target = building.nearRoof(state, sh) ? 0.06 : 1;
      fx.roofA += (target - fx.roofA) * Math.min(1, dt * 7);
      fx.smk -= dt;
      if (fx.smk <= 0) {
        fx.smk = 1.4 + Math.random() * 1.2;
        parts.push({ x: (sh.ax + 4) * T + 13 + Math.random() * 6, y: sh.ay * T - 22, vx: (Math.random() - 0.5) * 5, vy: -11, t: 0, life: 2.2, col: p.smoke, sz: 2, grav: -3, flut: 1 });
      }
    }

    // fireflies
    const pl = state.player;
    if (nightA > 0.5 && fireflies.length < 16 && Math.random() < dt * 1.5) {
      const a = Math.random() * Math.PI * 2, d2 = 60 + Math.random() * 160;
      fireflies.push({ x: pl.x + Math.cos(a) * d2, y: pl.y + Math.sin(a) * d2, a: Math.random() * 6.3, s: 8 + Math.random() * 12 });
    }
    if (nightA < 0.15 && finaleT <= 0 && fireflies.length) fireflies.length = 0;
    if (finaleT > 0) finaleT -= dt;
    for (const ff of fireflies) {
      ff.a += dt * 0.8;
      ff.x += Math.cos(ff.a) * ff.s * dt;
      ff.y += Math.sin(ff.a * 1.3) * ff.s * dt * 0.6;
    }

    // particles + floats
    for (let i = parts.length - 1; i >= 0; i--) {
      const pt = parts[i];
      pt.t += dt;
      if (pt.t > pt.life) { parts.splice(i, 1); continue; }
      pt.vy += pt.grav * dt;
      pt.x += pt.vx * dt + (pt.flut ? Math.sin(pt.t * 10) * 20 * dt : 0);
      pt.y += pt.vy * dt;
    }
    for (let i = floats.length - 1; i >= 0; i--) {
      const f = floats[i];
      f.t += dt;
      f.y -= 18 * dt;
      if (f.t > 1.4) floats.splice(i, 1);
    }
  }

  return {
    parts, floats,
    get fireflies() { return fireflies; },
    get finaleT() { return finaleT; },
    roofFx, update, burst,
    // used by render for the fire-glow ember trickle
    pushPart: pt => parts.push(pt),
    reset() { parts.length = 0; floats.length = 0; fireflies = []; finaleT = 0; for (const k of Object.keys(roofFx)) delete roofFx[k]; },
  };
}
