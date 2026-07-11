// ui/ui — the DOM shell: title screen, in-game buttons, craft panel, home
// banner. Replaces the x-dc component host from the prototype with plain DOM.
// Reads state + session; all game mutations go through the handlers wired in
// main.js. Re-renders on 'ui:update'.

import { PALETTES, HAIRS, makePortrait, makeThumb } from '../assets/sprites.js';
import { RECIPES } from '../content/recipes.js';
import * as crafting from '../sim/crafting.js';
import * as inv from '../sim/inventory.js';
import * as player from '../entities/player.js';

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

export function createUI(wrap) {
  // --- static skeleton ---
  const canvas = el('canvas');
  canvas.id = 'game';
  wrap.appendChild(canvas);

  const joyZone = el('div', 'joy-zone');
  const joyBase = el('div', 'joy-base');
  const joyKnob = el('div', 'joy-knob');
  joyBase.appendChild(joyKnob);
  joyZone.appendChild(joyBase);
  wrap.appendChild(joyZone);

  const topbar = el('div', 'topbar hidden');
  const sndBtn = el('button', 'chip-btn', 'SND ON');
  const palBtn = el('button', 'chip-btn accent', 'STYLE');
  topbar.append(sndBtn, palBtn);
  wrap.appendChild(topbar);

  const controls = el('div', 'controls hidden');
  const cancelBtn = el('button', 'cancel-btn hidden', 'CANCEL');
  const craftBtn = el('button', 'craft-btn', 'CRAFT');
  const actionBtn = el('button', 'action-btn');
  const actionText = el('span', '', '...');
  actionBtn.appendChild(actionText);
  controls.append(cancelBtn, craftBtn, actionBtn);
  wrap.appendChild(controls);

  const craftPanel = el('div', 'craft-panel hidden');
  wrap.appendChild(craftPanel);

  const homeBanner = el('div', 'home-banner hidden', `
    <div class="home-title">HOME.</div>
    <div class="home-sub">THE CAMP IS YOURS.<br>PHASE 1 COMPLETE.</div>
    <button class="primary-btn" data-act="dismiss">KEEP PLAYING</button>`);
  wrap.appendChild(homeBanner);

  const title = el('div', 'title-screen');
  wrap.appendChild(title);

  const els = { wrap, canvas, joyZone, joyBase, joyKnob, actionBtn, actionText };

  let rt = null, H = null;
  let thumbsCache = null;
  let lastLabel = '', lastEnabled = null;

  function wire(runtime, handlers) {
    rt = runtime;
    H = handlers;
    sndBtn.addEventListener('pointerdown', () => H.onToggleSound());
    palBtn.addEventListener('pointerdown', () => H.onCyclePalette());
    craftBtn.addEventListener('pointerdown', () => H.onCraftToggle());
    cancelBtn.addEventListener('pointerdown', () => H.onCancelPlace());
    actionBtn.addEventListener('pointerdown', e => { e.preventDefault(); H.onAction(); });
    homeBanner.querySelector('[data-act=dismiss]').addEventListener('pointerdown', () => {
      homeBanner.classList.add('hidden');
    });
    rt.bus.on('ui:update', update);
    rt.bus.on('quest:finale', () => setTimeout(() => homeBanner.classList.remove('hidden'), 2400));
    update();
  }

  // --- title screen ---
  function renderTitle({ hasSave }) {
    const s = rt.view;
    if (!thumbsCache) {
      thumbsCache = Object.keys(PALETTES).map(k => ({ key: k, name: PALETTES[k].name, url: makeThumb(k) }));
    }
    title.innerHTML = `
      <div class="t-logo">FRONTIER</div>
      <div class="t-sub">A SETTLEMENT-SURVIVAL GAME<br>PHASE 1 — FOUNDATION</div>
      <div class="t-label">CHOOSE ARTHUR</div>
      <div class="t-row" data-row="hairs"></div>
      <div class="t-label">CHOOSE YOUR WORLD</div>
      <div class="t-row" data-row="thumbs"></div>
      <div class="t-actions"></div>
      <div class="t-hint">MOVE: LEFT THUMB OR WASD &middot; ACT: BUTTON OR E<br>CRAFT: C &middot; SOUND: M</div>`;

    const hairRow = title.querySelector('[data-row=hairs]');
    for (const h of HAIRS) {
      const b = el('button', 'pick-card' + (h.key === s.hairKey ? ' picked' : ''));
      b.innerHTML = `<img width="56" height="84" alt=""><span>${h.name}</span>`;
      b.querySelector('img').src = makePortrait(PALETTES[s.palKey], h.key);
      b.addEventListener('pointerdown', () => { H.onPickHair(h.key); renderTitle({ hasSave }); });
      hairRow.appendChild(b);
    }
    const thumbRow = title.querySelector('[data-row=thumbs]');
    for (const t of thumbsCache) {
      const b = el('button', 'pick-card' + (t.key === s.palKey ? ' picked' : ''));
      b.innerHTML = `<img width="140" height="84" alt=""><span>${t.name}</span>`;
      b.querySelector('img').src = t.url;
      b.addEventListener('pointerdown', () => { H.onPickPalette(t.key); renderTitle({ hasSave }); });
      thumbRow.appendChild(b);
    }
    const actions = title.querySelector('.t-actions');
    if (hasSave) {
      const cont = el('button', 'primary-btn pulse', 'CONTINUE');
      cont.addEventListener('pointerdown', () => H.onStart({ fresh: false }));
      const fresh = el('button', 'ghost-btn', 'NEW CAMP');
      fresh.addEventListener('pointerdown', () => {
        if (confirm('Start a new camp? Your saved world will be erased.')) H.onStart({ fresh: true });
      });
      actions.append(cont, fresh);
    } else {
      const start = el('button', 'primary-btn pulse', 'START');
      start.addEventListener('pointerdown', () => H.onStart({ fresh: true }));
      actions.append(start);
    }
  }

  function showTitle(opts) { renderTitle(opts); title.classList.remove('hidden'); }
  function hideTitle() { title.classList.add('hidden'); }

  // --- craft panel ---
  function renderCraft() {
    const { state } = rt;
    const sp = rt.view.sprites;
    craftPanel.innerHTML = `<div class="cp-head"><span>CRAFTING</span><button class="cp-close">X</button></div><div class="cp-list"></div>`;
    craftPanel.querySelector('.cp-close').addEventListener('pointerdown', () => H.onCraftToggle());
    const list = craftPanel.querySelector('.cp-list');
    for (const r of crafting.availableRecipes(state)) {
      const done = crafting.recipeDone(state, r);
      const can = crafting.canCraft(state, r);
      const row = el('div', 'cp-row');
      const costs = r.costs.map(c => {
        const ok = inv.count(state, c.itemId) >= c.qty;
        return `<span class="cp-cost"><img src="${sp.icons[r.icon === c.itemId ? c.itemId : c.itemId].toDataURL()}" width="14" height="14"><span style="color:${ok ? '#8fd06a' : '#e0705f'}">${c.qty}</span></span>`;
      }).join('');
      row.innerHTML = `
        <img class="cp-icon" src="${sp.icons[r.icon].toDataURL()}" width="32" height="32">
        <div class="cp-mid">
          <span class="cp-name">${r.name}</span>
          <span class="cp-desc">${r.desc}</span>
          <div class="cp-costs">${costs}</div>
        </div>
        <button class="cp-make ${done ? 'done' : can ? 'can' : ''}">${done ? 'OWNED' : can ? 'MAKE' : 'NEED'}</button>`;
      row.querySelector('.cp-make').addEventListener('pointerdown', () => H.onCraft(r.id));
      list.appendChild(row);
    }
  }

  // --- reactive update (visibility + craft panel) ---
  function update() {
    if (!rt) return;
    const { session, state } = rt;
    const inGame = session.phase === 'game';
    topbar.classList.toggle('hidden', !inGame);
    controls.classList.toggle('hidden', !inGame);
    craftPanel.classList.toggle('hidden', !inGame || !session.craftOpen);
    if (inGame && session.craftOpen) renderCraft();
    cancelBtn.classList.toggle('hidden', !session.placing);
    craftBtn.classList.toggle('hidden', !!session.placing);
    if (state) {
      sndBtn.textContent = state.settings.muted ? 'SND OFF' : 'SND ON';
      palBtn.textContent = rt.view.pal.name;
      const pulse = state.quest.stage === 1 && !inv.hasTool(state, 'axe');
      craftBtn.classList.toggle('pulse', pulse);
    }
  }

  // --- per-frame action button refresh ---
  function tick() {
    if (!rt || rt.session.phase !== 'game') return;
    const c = player.actionCtx(rt);
    const en = c.k !== 'none';
    if (c.label !== lastLabel) { actionText.textContent = c.label; lastLabel = c.label; }
    if (en !== lastEnabled) {
      actionBtn.style.opacity = en ? '1' : '0.45';
      actionBtn.style.borderColor = en ? rt.view.pal.ui.accent : rt.view.pal.ui.border;
      lastEnabled = en;
    }
  }

  return { els, wire, update, tick, showTitle, hideTitle };
}
