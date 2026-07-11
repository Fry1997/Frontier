// render/hud — the canvas HUD: clock/resource chips, quest banner, need
// meters, placement hint. Pure read of state; draws nothing into the world.

import * as timeSys from '../world/time.js';
import * as needsSys from '../sim/needs.js';
import * as inv from '../sim/inventory.js';

export function createHud(rt) {
  let stageFlash = 0;
  rt.bus.on('quest:advanced', () => { stageFlash = 1; });

  function update(dt) {
    if (stageFlash > 0) stageFlash -= dt;
  }

  function draw(ctx, VW, VH, gt) {
    const { state } = rt;
    const p = rt.view.pal;
    const sp = rt.view.sprites;
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // clock + resource chips (wrap before the top-right DOM buttons)
    let x = 5, cyy = 5;
    const dayIcon = timeSys.isDaytime(state) ? 'sun' : 'moon';
    const chips = [
      [dayIcon, timeSys.clockLabel(state)],
      ['stick', inv.count(state, 'stick')],
      ['stone', inv.count(state, 'stone')],
      ['wood', inv.count(state, 'wood')],
    ];
    if (inv.count(state, 'meatRaw') > 0) chips.push(['meatRaw', inv.count(state, 'meatRaw')]);
    if (inv.count(state, 'meatCk') > 0) chips.push(['meatCk', inv.count(state, 'meatCk')]);
    for (const k of ['turnip', 'pumpkin', 'turnipSeed', 'pumpkinSeed']) {
      if (inv.count(state, k) > 0) chips.push([k, inv.count(state, k)]);
    }
    if (state.economy.currency > 0) chips.push(['coin', state.economy.currency]);
    if (inv.hasTool(state, 'axe')) chips.push(['axe', -1]);
    if (inv.has(state, 'hoe')) chips.push(['hoe', -1]);
    for (const [k, n] of chips) {
      const str = n === -1 ? '' : String(n);
      const tw = str.length * 8;
      if (x > 5 && x + 24 + tw > VW - 96) { x = 5; cyy += 24; }
      chipBg(ctx, p, x, cyy, 24 + tw);
      ctx.drawImage(sp.icons[k], x + (n === -1 ? 4 : 3), cyy + 2);
      if (str) { ctx.fillStyle = p.ui.text; ctx.fillText(str, x + 21, cyy + 6); }
      x += 30 + tw;
    }
    let hudY = cyy + 30;

    // quest banner
    const quests = rt.quests;
    if (state.settings.hints && state.quest.stage <= quests.lastStage) {
      const txt = quests.questText(state.quest.stage);
      const maxW = VW - 24;
      const words = txt.split(' ');
      const lines = [];
      let cur = '';
      for (const wd of words) {
        const tt = cur ? cur + ' ' + wd : wd;
        if (ctx.measureText(tt).width > maxW - 20 && cur) { lines.push(cur); cur = wd; }
        else cur = tt;
      }
      if (cur) lines.push(cur);
      const lw = Math.max.apply(null, lines.map(l => ctx.measureText(l).width));
      const w = lw + 20, bh = lines.length * 12 + 8;
      const bx = Math.round((VW - w) / 2), by = hudY;
      const fl = stageFlash > 0 ? Math.sin(stageFlash * 20) * 1 : 0;
      const last = state.quest.stage === quests.lastStage;
      ctx.fillStyle = p.ui.bg;
      ctx.fillRect(bx, by - fl, w, bh);
      ctx.strokeStyle = stageFlash > 0 ? p.ui.accent : p.ui.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(bx + 0.5, by + 0.5 - fl, w - 1, bh - 1);
      ctx.fillStyle = last ? p.ui.accent : p.ui.text;
      ctx.textAlign = 'center';
      lines.forEach((l, i) => ctx.fillText(l, Math.round(VW / 2), by + 5 - fl + i * 12));
      ctx.textAlign = 'left';
      hudY = by + bh + 8;
    }

    // meters
    const needs = state.player.needs;
    if (state.flags.metersOn) {
      meter(ctx, p, sp, gt, 5, hudY + 4, 'hunger', needs.hunger, p.ui.accent);
      meter(ctx, p, sp, gt, 5, hudY + 18, 'thirst', needs.thirst, p.water);
    }

    // weak hint
    if (needsSys.isWeak(state) && Math.floor(gt) % 6 < 3) {
      ctx.textAlign = 'center';
      ctx.fillStyle = p.ui.bad;
      ctx.fillText(needs.hunger < needsSys.WEAK_AT ? 'SO HUNGRY... (SLOWER)' : 'SO THIRSTY... (SLOWER)', Math.round(VW / 2), hudY + 40);
      ctx.textAlign = 'left';
    }

    if (rt.session.placing) {
      ctx.textAlign = 'center';
      ctx.fillStyle = p.ui.text;
      ctx.fillText('WALK TO AIM THE SPOT', Math.round(VW / 2), VH - 16);
      ctx.textAlign = 'left';
    }
  }

  function chipBg(ctx, p, x, y, w) {
    ctx.fillStyle = p.ui.bg;
    ctx.fillRect(x + 1, y, w - 2, 20);
    ctx.fillRect(x, y + 1, w, 18);
    ctx.fillStyle = p.ui.border;
    ctx.fillRect(x + 1, y, w - 2, 1);
    ctx.fillRect(x + 1, y + 19, w - 2, 1);
    ctx.fillRect(x, y + 1, 1, 18);
    ctx.fillRect(x + w - 1, y + 1, 1, 18);
    ctx.fillStyle = p.ui.text;
  }

  function meter(ctx, p, sp, gt, x, y, kind, v, col) {
    ctx.drawImage(sp.icons[kind], x, y - 3);
    const w = 44;
    ctx.fillStyle = p.ui.bg;
    ctx.fillRect(x + 18, y, w, 8);
    ctx.strokeStyle = v < 0.15 && Math.floor(gt * 2) % 2 ? p.ui.bad : p.ui.border;
    ctx.strokeRect(x + 18.5, y + 0.5, w - 1, 7);
    ctx.fillStyle = col;
    ctx.fillRect(x + 20, y + 2, Math.round((w - 4) * v), 4);
  }

  return { draw, update };
}
