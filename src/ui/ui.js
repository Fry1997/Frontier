// ui/ui — the DOM shell: title screen, in-game buttons, craft panel, home
// banner. Replaces the x-dc component host from the prototype with plain DOM.
// Reads state + session; all game mutations go through the handlers wired in
// main.js. Re-renders on 'ui:update'.

import { PALETTES, HAIRS, makePortrait, makeThumb } from '../assets/sprites.js';
import { ITEMS } from '../content/items.js';
import * as crafting from '../sim/crafting.js';
import * as economy from '../sim/economy.js';
import * as progression from '../sim/progression.js';
import { NODES, XP_PER_POINT } from '../content/progression.js';
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
  const pathBtn = el('button', 'chip-btn', 'PATH');
  const sndBtn = el('button', 'chip-btn', 'SND ON');
  const palBtn = el('button', 'chip-btn accent', 'STYLE');
  topbar.append(pathBtn, sndBtn, palBtn);
  wrap.appendChild(topbar);

  const pathPanel = el('div', 'craft-panel hidden');
  wrap.appendChild(pathPanel);

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

  const chestPanel = el('div', 'craft-panel chest-panel hidden');
  wrap.appendChild(chestPanel);

  const shopPanel = el('div', 'craft-panel chest-panel hidden');
  wrap.appendChild(shopPanel);

  const dialoguePanel = el('div', 'dialogue-panel hidden');
  wrap.appendChild(dialoguePanel);

  const issueBtn = el('button', 'issue-btn hidden');
  wrap.appendChild(issueBtn);

  const eventPanel = el('div', 'craft-panel event-panel hidden');
  wrap.appendChild(eventPanel);

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
    pathBtn.addEventListener('pointerdown', () => H.onPathToggle());
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
    rt.bus.on('npc:talked', ({ name, line, tier }) => {
      dialoguePanel.innerHTML = `
        <div class="dp-name">${name}<span class="dp-tier">${tier.toUpperCase()}</span></div>
        <div class="dp-line">${line}</div>
        <div class="dp-hint">TAP TO CLOSE</div>`;
      dialoguePanel.classList.remove('hidden');
    });
    dialoguePanel.addEventListener('pointerdown', () => dialoguePanel.classList.add('hidden'));
    issueBtn.addEventListener('pointerdown', () => H.onEventOpen());
    rt.bus.on('event:aftermath', ({ text }) => {
      dialoguePanel.innerHTML = `
        <div class="dp-name">AFTERMATH</div>
        <div class="dp-line">${text}</div>
        <div class="dp-hint">TAP TO CLOSE</div>`;
      dialoguePanel.classList.remove('hidden');
    });
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

  // --- chest panel: two columns, tap a stack to move it across ---
  function renderChest() {
    const { state, session } = rt;
    const sp = rt.view.sprites;
    const box = state.inventory.containers[session.chestOpen] || [];
    chestPanel.innerHTML = `
      <div class="cp-head"><span>CHEST</span><button class="cp-close">X</button></div>
      <div class="ch-cols">
        <div class="ch-col"><div class="ch-title">YOUR PACK</div><div class="ch-list" data-side="pack"></div></div>
        <div class="ch-col"><div class="ch-title">STORED</div><div class="ch-list" data-side="chest"></div></div>
      </div>
      <div class="ch-hint">TAP A STACK TO MOVE IT</div>`;
    chestPanel.querySelector('.cp-close').addEventListener('pointerdown', () => H.onChestClose());
    const fill = (side, list) => {
      const host = chestPanel.querySelector(`[data-side=${side}]`);
      if (!list.length) host.appendChild(el('div', 'ch-empty', side === 'pack' ? 'NOTHING TO STOW' : 'EMPTY'));
      for (const s of list) {
        const item = ITEMS[s.itemId];
        const row = el('button', 'ch-item');
        row.innerHTML = `<img src="${sp.icons[item.icon].toDataURL()}" width="16" height="16"><span>${item.label}</span><b>${s.qty}</b>`;
        row.addEventListener('pointerdown', () => H.onChestMove(s.itemId, side === 'pack'));
        host.appendChild(row);
      }
    };
    fill('pack', state.inventory.slots);
    fill('chest', box);
  }

  // --- shop panel: buy column (stock) / sell column (matching pack items) ---
  function renderShop() {
    const { state, session } = rt;
    const sp = rt.view.sprites;
    const shop = economy.getShop(session.shopOpen);
    if (!shop) return;
    shopPanel.innerHTML = `
      <div class="cp-head"><span>${shop.name} &nbsp;·&nbsp; <img src="${sp.icons.coin.toDataURL()}" width="12" height="12" style="image-rendering:pixelated;vertical-align:-2px"> ${state.economy.currency}</span><button class="cp-close">X</button></div>
      <div class="ch-cols">
        <div class="ch-col"><div class="ch-title">BUY</div><div class="ch-list" data-side="buy"></div></div>
        <div class="ch-col"><div class="ch-title">SELL</div><div class="ch-list" data-side="sell"></div></div>
      </div>
      <div class="ch-hint">TAP TO TRADE ONE</div>`;
    shopPanel.querySelector('.cp-close').addEventListener('pointerdown', () => H.onShopClose());
    const buyHost = shopPanel.querySelector('[data-side=buy]');
    for (const line of shop.stock) {
      const item = ITEMS[line.itemId];
      const can = state.economy.currency >= line.price;
      const row = el('button', 'ch-item' + (can ? '' : ' dim'));
      row.innerHTML = `<img src="${sp.icons[item.icon].toDataURL()}" width="16" height="16"><span>${item.label}</span><b>${line.price}c</b>`;
      row.addEventListener('pointerdown', () => H.onShopBuy(line.itemId));
      buyHost.appendChild(row);
    }
    const sellHost = shopPanel.querySelector('[data-side=sell]');
    const goods = economy.sellables(state, shop);
    if (!goods.length) sellHost.appendChild(el('div', 'ch-empty', 'NOTHING THEY WANT'));
    for (const s of goods) {
      const item = ITEMS[s.itemId];
      const row = el('button', 'ch-item');
      row.innerHTML = `<img src="${sp.icons[item.icon].toDataURL()}" width="16" height="16"><span>${item.label} ×${s.qty}</span><b>+${item.value}c</b>`;
      row.addEventListener('pointerdown', () => H.onShopSell(s.itemId));
      sellHost.appendChild(row);
    }
  }

  // --- event panel: title, body, resolution choices ---
  function renderEvent() {
    const { state, session } = rt;
    const def = rt.events.defFor(session.eventOpen);
    if (!def || !state.events.active.some(i => i.defId === def.id)) {
      session.eventOpen = null;
      eventPanel.classList.add('hidden');
      return;
    }
    const q = rt.events.query();
    eventPanel.innerHTML = `
      <div class="cp-head"><span>${def.title}</span><button class="cp-close">X</button></div>
      <div class="ev-body">${def.body}</div>
      <div class="ev-choices"></div>`;
    eventPanel.querySelector('.cp-close').addEventListener('pointerdown', () => H.onEventClose());
    const host = eventPanel.querySelector('.ev-choices');
    for (const c of def.choices) {
      const ok = !c.require || c.require(q);
      const b = el('button', 'ev-choice' + (ok ? '' : ' dim'), c.label);
      b.addEventListener('pointerdown', () => { if (ok) H.onEventChoice(def.id, c.id); });
      host.appendChild(b);
    }
  }

  // --- the path (progression) panel ---
  function renderPath() {
    const { state } = rt;
    const s = progression.skill(state);
    pathPanel.innerHTML = `
      <div class="cp-head"><span>THE PATH &nbsp;·&nbsp; ${s.points} POINT${s.points === 1 ? '' : 'S'} <span class="dp-tier">${s.xp}/${XP_PER_POINT} XP</span></span><button class="cp-close">X</button></div>
      <div class="cp-list" data-list="nodes"></div>
      <div class="ch-hint">DEEDS EARN XP · XP OPENS THE PATH</div>`;
    pathPanel.querySelector('.cp-close').addEventListener('pointerdown', () => H.onPathToggle());
    const host = pathPanel.querySelector('[data-list=nodes]');
    for (const node of NODES) {
      const owned = progression.has(state, node.id);
      const can = progression.canUnlock(state, node);
      const prereqNames = node.prereqs.map(p => NODES.find(n => n.id === p)?.name).join(', ');
      const row = el('div', 'cp-row');
      row.innerHTML = `
        <div class="cp-mid">
          <span class="cp-name">${node.name}</span>
          <span class="cp-desc">${node.desc}${prereqNames ? ' · AFTER ' + prereqNames : ''}</span>
        </div>
        <button class="cp-make ${owned ? 'done' : can ? 'can' : ''}">${owned ? 'WALKED' : can ? node.cost + ' PT' : 'LOCKED'}</button>`;
      row.querySelector('.cp-make').addEventListener('pointerdown', () => { if (can) H.onPathUnlock(node.id); });
      host.appendChild(row);
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
    chestPanel.classList.toggle('hidden', !inGame || !session.chestOpen);
    if (inGame && session.chestOpen) renderChest();
    shopPanel.classList.toggle('hidden', !inGame || !session.shopOpen);
    if (inGame && session.shopOpen) renderShop();
    pathPanel.classList.toggle('hidden', !inGame || !session.pathOpen);
    if (inGame && session.pathOpen) renderPath();
    if (state) {
      const pts = progression.skill(state).points;
      pathBtn.textContent = pts > 0 ? `PATH (${pts})` : 'PATH';
      pathBtn.classList.toggle('pulse', pts > 0);
    }
    const issues = inGame && state ? state.events.active : [];
    issueBtn.classList.toggle('hidden', !issues.length || !!session.eventOpen);
    if (issues.length) {
      const def = rt.events.defFor(issues[0].defId);
      issueBtn.textContent = '! ' + (def ? def.title : 'SOMETHING STIRS');
      issueBtn.classList.add('pulse');
    }
    eventPanel.classList.toggle('hidden', !inGame || !session.eventOpen);
    if (inGame && session.eventOpen) renderEvent();
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
