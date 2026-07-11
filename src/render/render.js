// render/render — camera + all world drawing. A pure read of state (§2.5):
// systems mutate, the renderer only reads and draws. The single exception to
// "no writes" is pushing glow embers into the fx pool (visual-only state).

import * as timeSys from '../world/time.js';
import * as crafting from '../sim/crafting.js';
import * as building from '../sim/building.js';
import { okey } from '../core/state.js';

const T = 32;

export function createRenderer(rt) {
  const cv = rt.els.canvas, ctx = cv.getContext('2d');
  let scale = 3, VW = 320, VH = 240;

  function resize() {
    const w = rt.els.wrap.clientWidth || innerWidth, h = rt.els.wrap.clientHeight || innerHeight;
    scale = Math.max(2, Math.round(Math.min(w, h) / 200));
    VW = Math.ceil(w / scale);
    VH = Math.ceil(h / scale);
    cv.width = VW; cv.height = VH;
    cv.style.width = VW * scale + 'px';
    cv.style.height = VH * scale + 'px';
    ctx.imageSmoothingEnabled = false;
  }
  resize();
  addEventListener('resize', resize);

  function render() {
    const { state, session, tiles, fx } = rt;
    const p = rt.view.pal, sp = rt.view.sprites;
    const gt = session.gt;
    ctx.fillStyle = '#171019';
    ctx.fillRect(0, 0, VW, VH);
    if (!state || session.phase !== 'game') return;

    const player = state.player;
    const MW = tiles.W, MH = tiles.H;
    const mapW = MW * T, mapH = MH * T;
    let cx = Math.round(player.x - VW / 2), cy = Math.round(player.y - VH / 2 - 8);
    cx = mapW <= VW ? -((VW - mapW) >> 1) : Math.max(0, Math.min(mapW - VW, cx));
    cy = mapH <= VH ? -((VH - mapH) >> 1) : Math.max(0, Math.min(mapH - VH, cy));
    ctx.save();
    ctx.translate(-cx, -cy);
    const wf = Math.floor(gt / 0.55) % 2, ff = Math.floor(gt / 0.13) % 3;
    const nightA = timeSys.nightAmt(state);
    const warmA = timeSys.warmAmt(state);
    const x0 = Math.max(0, Math.floor(cx / T)), y0 = Math.max(0, Math.floor(cy / T));
    const x1 = Math.min(MW - 1, Math.ceil((cx + VW) / T)), y1 = Math.min(MH - 1, Math.ceil((cy + VH) / T));

    // ground
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const g = tiles.grid[ty][tx], X = tx * T, Y = ty * T;
      if (g[0] === 'g') ctx.drawImage(sp.tiles.grass[+g[1]], X, Y);
      else if (g === 'd') ctx.drawImage(sp.tiles.dirt, X, Y);
      else if (g === 'r') ctx.drawImage(sp.tiles.rock, X, Y);
      else if (g === 'f') ctx.drawImage(sp.tiles.floor, X, Y);
      else if (g === 'w') {
        ctx.drawImage(sp.tiles.water[wf], X, Y);
        const L = tiles.isLand(tiles.tileAt(tx - 1, ty)), R2 = tiles.isLand(tiles.tileAt(tx + 1, ty));
        const U = tiles.isLand(tiles.tileAt(tx, ty - 1)), D = tiles.isLand(tiles.tileAt(tx, ty + 1));
        ctx.fillStyle = p.sand;
        if (U) { ctx.fillRect(X, Y, T, 3); ctx.fillStyle = p.foam; ctx.fillRect(X + (wf ? 2 : 0), Y + 3, T - 2, 1); ctx.fillStyle = p.sand; }
        if (D) { ctx.fillRect(X, Y + T - 3, T, 3); ctx.fillStyle = p.sandLo; ctx.fillRect(X, Y + T - 4, T, 1); ctx.fillStyle = p.sand; }
        if (L) { ctx.fillRect(X, Y, 3, T); ctx.fillStyle = p.foam; ctx.fillRect(X + 3, Y + (wf ? 1 : 0), 1, T - 1); ctx.fillStyle = p.sand; }
        if (R2) { ctx.fillRect(X + T - 3, Y, 3, T); ctx.fillStyle = p.foam; ctx.fillRect(X + T - 4, Y + (wf ? 1 : 0), 1, T - 1); ctx.fillStyle = p.sand; }
      }
      if (g === 'd' || g === 'r') {
        ctx.fillStyle = p.grass;
        if (tiles.tileAt(tx, ty - 1)[0] === 'g') { ctx.fillRect(X, Y, T, 2); ctx.fillStyle = p.grassLo; for (let i = 0; i < 8; i++) ctx.fillRect(X + i * 4 + ((tx + ty) % 2), Y + 2, 2, 1); ctx.fillStyle = p.grass; }
        if (tiles.tileAt(tx, ty + 1)[0] === 'g') ctx.fillRect(X, Y + T - 2, T, 2);
        if (tiles.tileAt(tx - 1, ty)[0] === 'g') ctx.fillRect(X, Y, 2, T);
        if (tiles.tileAt(tx + 1, ty)[0] === 'g') ctx.fillRect(X + T - 2, Y, 2, T);
      }
    }

    // farm plots: tilled soil overlays (crops draw as y-sorted entities)
    for (const plot of state.farm) {
      if (plot.tx < x0 || plot.tx > x1 || plot.ty < y0 || plot.ty > y1) continue;
      ctx.drawImage(plot.watered ? sp.props.soilWet : sp.props.soil, plot.tx * T, plot.ty * T);
    }

    // placement highlight
    if (session.placing) {
      const [ax, ay] = crafting.placeAnchor(rt);
      const ok = crafting.placeValid(rt);
      const pulse = 0.5 + Math.sin(gt * 6) * 0.2;
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = ok ? p.ui.good : p.ui.bad;
      ctx.fillRect(ax * T, ay * T, T * session.placing.w, T * session.placing.h);
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = ok ? p.ui.good : p.ui.bad;
      ctx.lineWidth = 2;
      ctx.strokeRect(ax * T + 1, ay * T + 1, T * session.placing.w - 2, T * session.placing.h - 2);
      if (session.placing.id === 'shelter') {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = p.ui.accent;
        ctx.fillRect((ax + 2) * T + 8, (ay + 3) * T + T - 6, 16, 4);
      }
      ctx.globalAlpha = 1;
    }

    // entities sorted by feet y
    const ents = [];
    for (const key of Object.keys(state.world.objects)) {
      const o = state.world.objects[key];
      const [tx, ty] = key.split(',').map(Number);
      if (tx < x0 - 1 || tx > x1 + 1 || ty < y0 - 2 || ty > y1 + 1) continue;
      ents.push({ y: ty * T + T - (o.type === 'stump' ? 8 : 0), draw: () => drawObj(o, tx, ty, ff) });
    }
    for (const plot of state.farm) {
      if (!plot.cropId && plot.healthy) continue;
      ents.push({ y: plot.ty * T + T - 6, draw: () => drawCrop(plot) });
    }
    for (const d of state.world.drops) ents.push({ y: d.y, draw: () => drawDrop(d, gt) });
    for (const r of rt.rabbits.list) if (r.alive) ents.push({ y: r.y + 8, draw: () => drawRabbit(r, gt) });
    for (const npc of state.npcs) {
      if (npc.activity === 'away') continue;
      ents.push({ y: npc.y, draw: () => drawNpc(npc) });
    }
    ents.push({ y: player.y, draw: drawPlayer });
    if (session.placing) {
      const [ax, ay] = crafting.placeAnchor(rt);
      if (session.placing.id === 'fire') {
        ents.push({ y: ay * T + T - 1, draw: () => { ctx.globalAlpha = 0.5; ctx.drawImage(sp.props.fireUnlit, ax * T - 2, ay * T + 2); ctx.globalAlpha = 1; } });
      } else {
        ents.push({ y: (ay + 3) * T + T - 1, draw: () => { ctx.globalAlpha = 0.45; ctx.drawImage(sp.props.shelterFrame, ax * T + 22, ay * T + 14, 116, 100); ctx.globalAlpha = 1; } });
      }
    }
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) e.draw();

    // roofs (fade when inside)
    for (const sh of state.structures) {
      const rf = fx.roofFx[sh.id];
      const a = rf ? rf.roofA : 1;
      if (a < 0.02) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(sh.tier >= 2 ? sp.props.roofT2 : sp.props.roof, sh.ax * T - 6, sh.ay * T - 24);
      ctx.globalAlpha = 1;
    }

    // particles
    for (const pt of fx.parts) {
      ctx.globalAlpha = Math.max(0, 1 - pt.t / pt.life);
      ctx.fillStyle = pt.col;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.sz, pt.sz);
    }
    ctx.globalAlpha = 1;

    // ambient + time-of-day tints
    if (p.ambient) { ctx.fillStyle = p.ambient; ctx.fillRect(cx, cy, VW, VH); }
    if (warmA > 0.01) { ctx.fillStyle = `rgba(255,150,60,${warmA})`; ctx.fillRect(cx, cy, VW, VH); }
    if (nightA > 0.01) { ctx.fillStyle = `rgba(26,22,64,${0.48 * nightA})`; ctx.fillRect(cx, cy, VW, VH); }

    // fire glow
    for (const key of Object.keys(state.world.objects)) {
      const o = state.world.objects[key];
      if (o.type !== 'fire' || !o.lit) continue;
      const [tx, ty] = key.split(',').map(Number);
      const gx = tx * T + 16, gy = ty * T + 14;
      const rr = 54 + Math.sin(gt * 7) * 3 + nightA * 14;
      const grd = ctx.createRadialGradient(gx, gy, 4, gx, gy, rr);
      const a = 0.15 + nightA * 0.3;
      grd.addColorStop(0, `rgba(${p.glow},${a})`);
      grd.addColorStop(1, `rgba(${p.glow},0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(gx - rr, gy - rr, rr * 2, rr * 2);
      if (Math.random() < 0.12) fx.pushPart({ x: gx + (Math.random() - 0.5) * 8, y: gy - 8, vx: (Math.random() - 0.5) * 8, vy: -22, t: 0, life: 0.9, col: p.ember, sz: 1, grav: -6, flut: 1 });
    }

    // cozy room light when inside at night
    const inSh = building.playerInside(state);
    if (inSh && nightA > 0.05) {
      const gx = (inSh.ax + 2.5) * T, gy = (inSh.ay + 2) * T;
      const grd = ctx.createRadialGradient(gx, gy, 8, gx, gy, 84);
      grd.addColorStop(0, `rgba(${p.glow},${0.24 * nightA})`);
      grd.addColorStop(1, `rgba(${p.glow},0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(gx - 84, gy - 84, 168, 168);
    }

    // fireflies
    const ffA = Math.max(nightA, Math.min(1, fx.finaleT / 3));
    if (ffA > 0.2) for (const ffy of fx.fireflies) {
      const bl = (Math.sin(gt * 3 + ffy.a * 7) + 1) / 2;
      if (bl > 0.35) {
        ctx.globalAlpha = bl * ffA;
        ctx.fillStyle = p.ember;
        ctx.fillRect(Math.round(ffy.x), Math.round(ffy.y), 2, 2);
        ctx.globalAlpha = bl * ffA * 0.3;
        ctx.fillRect(Math.round(ffy.x) - 1, Math.round(ffy.y) - 1, 4, 4);
      }
    }
    ctx.globalAlpha = 1;

    // floats
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    for (const f of fx.floats) {
      ctx.globalAlpha = Math.max(0, 1.2 - f.t);
      ctx.fillStyle = p.outline;
      ctx.fillText(f.str, Math.round(f.x) + 1, Math.round(f.y) + 1);
      ctx.fillStyle = f.col;
      ctx.fillText(f.str, Math.round(f.x), Math.round(f.y));
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    rt.hud.draw(ctx, VW, VH, gt);

    function drawObj(o, tx, ty, ff2) {
      const X = tx * T, Y = ty * T;
      const sh = o.shake > 0 ? Math.round(Math.sin(o.shake * 60) * 1.5) : 0;
      if (['tree', 'sapling', 'stump', 'boulder', 'bush', 'fire'].includes(o.type)) shadow(X + 16, Y + T - 3, o.type === 'tree' ? 13 : 10);
      if (o.type === 'tree') ctx.drawImage(sp.props.tree, X - 8 + sh, Y - 30);
      else if (o.type === 'sapling') ctx.drawImage(sp.props.sapling, X + 6, Y + 4);
      else if (o.type === 'stump') ctx.drawImage(sp.props.stump, X, Y + 8);
      else if (o.type === 'boulder') ctx.drawImage(sp.props.boulder, X + 1, Y + 6);
      else if (o.type === 'bush') ctx.drawImage(sp.props.bush, X + 1, Y + 8);
      else if (o.type === 'fire') ctx.drawImage(o.lit ? sp.props.fire[ff2] : sp.props.fireUnlit, X - 2, Y + 2);
      else if (o.type === 'wall') {
        if (o.face) ctx.drawImage(sp.props.wallFace, X, Y - 14);
        if (o.w) ctx.drawImage(sp.props.wallW, X, Y - 14);
        if (o.e) ctx.drawImage(sp.props.wallE, X + 24, Y - 14);
      }
      else if (o.type === 'door') ctx.drawImage(sp.props.door, X, Y - 14);
      else if (o.type === 'chest') { shadow(X + 16, Y + T - 4, 10); ctx.drawImage(sp.props.chest, X + 3, Y + 8); }
      else if (o.type === 'stall') { shadow(X + 16, Y + T - 2, 15); ctx.drawImage(sp.props.stall, X - 16, Y - 26); }
      else if (o.type === 'bed') ctx.drawImage(sp.props.bed, X + 2, Y - 10);
      else if (o.type === 'table') ctx.drawImage(sp.props.table, X + 2, Y + 4);
      else if (o.type === 'site') {
        const st = o.t / 1.8;
        ctx.drawImage(sp.props.shelterFrame, o.ax * T + 22, o.ay * T + 14, 116, 100);
        ctx.fillStyle = p.ui.bg; ctx.fillRect(o.ax * T + 56, o.ay * T - 6, 48, 7);
        ctx.strokeStyle = p.ui.border; ctx.strokeRect(o.ax * T + 56.5, o.ay * T - 5.5, 47, 6);
        ctx.fillStyle = p.ui.accent; ctx.fillRect(o.ax * T + 58, o.ay * T - 4, Math.round(44 * st), 3);
      }
    }

    function drawCrop(plot) {
      const X = plot.tx * T, Y = plot.ty * T;
      if (!plot.healthy) { ctx.drawImage(sp.props.cropWithered, X + 4, Y - 2); return; }
      const frames = sp.crops[plot.cropId];
      if (!frames) return;
      const img = frames[Math.min(plot.stage, frames.length - 1)];
      ctx.drawImage(img, X + 4, Y - 2);
    }

    function drawDrop(d, gt2) {
      const t = d.t || 0;
      const bob = (d.z || 0) > 0 ? -d.z : Math.sin(t * 3) * 1.5;
      const img = sp.props[d.kind];
      shadow(d.x, d.y + 3, 6);
      ctx.drawImage(img, Math.round(d.x - img.width / 2), Math.round(d.y - img.height + 2 + bob));
      if ((t % 2.2) < 0.35) {
        const ph = Math.floor((t % 2.2) / 0.12) % 3;
        ctx.fillStyle = ph === 1 ? '#ffffff' : p.ui.accent;
        const sx = Math.round(d.x + 7), sy = Math.round(d.y - img.height - 2 + bob);
        ctx.fillRect(sx, sy - 1, 1, 3);
        ctx.fillRect(sx - 1, sy, 3, 1);
      }
    }

    function drawRabbit(r, gt2) {
      shadow(r.x, r.y + 7, 7);
      const hopping = r.state !== 'sit';
      const set = hopping ? (r.face > 0 ? sp.rabbit.hop : sp.rabbit.hopL) : (r.face > 0 ? sp.rabbit.sit : sp.rabbit.sitL);
      const fr = hopping ? Math.floor(r.hopT) % 2 : (Math.floor(gt2 * 1.5 + r.x) % 6 === 0 ? 1 : 0);
      const hz = hopping ? Math.abs(Math.sin(r.hopT * Math.PI * 0.5)) * 4 : 0;
      ctx.drawImage(set[fr], Math.round(r.x - 10), Math.round(r.y - 12 - hz));
    }

    function drawNpc(npc) {
      const v = rt.view.villagers?.[npc.id];
      if (!v) return;
      const m = rt.npcs.mv[npc.id] || { dir: 'down', moving: false, animT: 0 };
      shadow(npc.x, npc.y + 2, 9);
      const set = v[m.dir] || v.down;
      const img = m.moving ? set.walk[Math.floor(m.animT) % 4] : set.idle;
      ctx.drawImage(img, Math.round(npc.x - 16), Math.round(npc.y - 44));
      // name tag when the player is close
      if (Math.hypot(npc.x - player.x, npc.y - player.y) < 70) {
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = p.outline;
        ctx.fillText(npc.name, Math.round(npc.x) + 1, Math.round(npc.y) - 51);
        ctx.fillStyle = p.ui.text;
        ctx.fillText(npc.name, Math.round(npc.x), Math.round(npc.y) - 52);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      }
    }

    function drawPlayer() {
      const spl = session.player;
      shadow(player.x, player.y + 2, 9);
      const a = sp.arthur[player.dir];
      let img;
      if (spl.actT > 0) img = a.act[spl.actT > 0.17 ? 0 : 1];
      else if (spl.moving) img = a.walk[Math.floor(spl.animT) % 4];
      else img = a.idle;
      ctx.drawImage(img, Math.round(player.x - 16), Math.round(player.y - 44));
      if (spl.cookT > 0) {
        ctx.fillStyle = p.ui.bg;
        ctx.fillRect(Math.round(player.x - 14), Math.round(player.y - 54), 28, 5);
        ctx.fillStyle = p.ui.accent;
        ctx.fillRect(Math.round(player.x - 13), Math.round(player.y - 53), Math.round(26 * (1 - spl.cookT / 1.3)), 3);
      }
    }

    function shadow(x, y, r) {
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = p.outline;
      ctx.fillRect(Math.round(x - r), Math.round(y - 2), r * 2, 4);
      ctx.fillRect(Math.round(x - r + 2), Math.round(y - 3), r * 2 - 4, 6);
      ctx.globalAlpha = 1;
    }
  }

  return { render, resize };
}
