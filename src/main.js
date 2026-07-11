// main — composition root. Builds the runtime (state + module instances),
// wires the bus, and runs the fixed update order (§2.4):
//   input → time → world/resources → player → critters → sim → fx → ui
// Render runs after. No game logic lives here — only wiring.

import { createBus } from './core/bus.js';
import { createRng } from './core/rng.js';
import { createState } from './core/state.js';
import { createLoop } from './core/loop.js';
import { createTileMap } from './world/tiles.js';
import * as timeSys from './world/time.js';
import { createResources } from './world/resources.js';
import * as playerSys from './entities/player.js';
import { createRabbits } from './entities/rabbits.js';
import { createNpcs } from './entities/npc.js';
import { NPC_DEFS } from './content/npcs.js';
import * as crafting from './sim/crafting.js';
import * as building from './sim/building.js';
import * as needs from './sim/needs.js';
import { createQuests } from './sim/quests.js';
import * as inventory from './sim/inventory.js';
import * as farming from './sim/farming.js';
import * as economy from './sim/economy.js';
import { createEvents } from './sim/events.js';
import * as combat from './sim/combat.js';
import * as progression from './sim/progression.js';
import { createVenture } from './world/venture.js';
import * as saveio from './io/save.js';
import { createInput } from './io/input.js';
import { createRenderer } from './render/render.js';
import { createFx } from './render/fx.js';
import { createHud } from './render/hud.js';
import { createUI } from './ui/ui.js';
import { SFX, attachAudio } from './audio/sfx.js';
import { PALETTES, HAIRS, buildSprites, buildVillager } from './assets/sprites.js';

const wrap = document.getElementById('wrap');
const ui = createUI(wrap);
const bus = createBus();

// --- settings (persist independently of the world save) ---
const stored = saveio.loadSettings();
let palKey = PALETTES[stored.palette] ? stored.palette : 'meadow';
let hairKey = HAIRS.some(h => h.key === stored.hair) ? stored.hair : 'scruff';

const spCache = {};
const getSprites = (pk, hk) => (spCache[pk + ':' + hk] ||= buildSprites(PALETTES[pk], hk));

const sfx = attachAudio(bus, new SFX());
sfx.setMuted(!!stored.muted);

// --- the runtime: everything systems need, one seam ---
const rt = {
  state: null,
  bus,
  rng: createRng((Math.random() * 0x7fffffff) | 0),
  session: null, // transient, never saved
  tiles: null,
  rabbits: null,
  input: null,
  fx: null,
  hud: null,
  quests: null,
  els: ui.els,
  view: {
    palKey, hairKey,
    get pal() { return PALETTES[this.palKey]; },
    sprites: getSprites(palKey, hairKey),
    villagers: {},
  },
};

const villagerCache = {};
function refreshVillagers() {
  for (const def of Object.values(NPC_DEFS)) {
    rt.view.villagers[def.id] = (villagerCache[rt.view.palKey + ':' + def.id] ||= buildVillager(PALETTES[rt.view.palKey], def.look));
  }
}
refreshVillagers();

rt.input = createInput({ bus, els: ui.els, isActive: () => rt.session?.phase === 'game' });
rt.fx = createFx(rt);
rt.hud = createHud(rt);
rt.venture = null; // active expedition (transient, never saved)
rt.world = () => rt.venture ? rt.venture.world : rt.state.world; // the active world
rt.ventureApi = createVenture(rt);
building.attach(rt); // bus-wired effects (e.g. the tier upgrade)
farming.attach(rt);  // crop growth on day rollover
combat.attach(rt);   // sleep heals
progression.attach(rt); // deeds feed the path (XP → points)
const renderer = createRenderer(rt);

function freshSession() {
  return {
    phase: 'title',
    gt: 0,
    craftOpen: false,
    chestOpen: null, // containerId while a chest panel is open
    shopOpen: null,  // shopId while a shop panel is open
    eventOpen: null, // defId while an issue panel is open
    pathOpen: false, // progression panel
    venturing: false,
    placing: null,
    player: { animT: 0, actT: 0, cookT: 0, moving: false, swingCb: null },
  };
}
rt.session = freshSession();

let resources = null, autosave = null;

function attachState(state) {
  rt.venture = null; // any expedition dies with its session
  rt.state = state;
  rt.rng = createRng(state.seed ^ (state.time.day * 2654435761));
  rt.tiles = createTileMap(state);
  rt.rabbits = createRabbits(rt);
  rt.npcs = createNpcs(rt);
  rt.events = createEvents(rt);
  rt.quests = createQuests(rt);
  resources = createResources(rt);
  if (autosave) autosave.detach();
  autosave = saveio.attach(rt);
  rt.fx.reset();
  // settings ride along inside the save; the UI prefs win
  state.settings.palette = rt.view.palKey;
  state.settings.hair = rt.view.hairKey;
  state.settings.muted = sfx.muted;
}

function persistSettings() {
  saveio.saveSettings({ palette: rt.view.palKey, hair: rt.view.hairKey, muted: sfx.muted });
  if (rt.state) {
    rt.state.settings.palette = rt.view.palKey;
    rt.state.settings.hair = rt.view.hairKey;
    rt.state.settings.muted = sfx.muted;
  }
}

function setPalette(k) {
  if (!PALETTES[k]) return;
  rt.view.palKey = k;
  rt.view.sprites = getSprites(k, rt.view.hairKey);
  refreshVillagers();
  persistSettings();
  bus.emit('ui:update', {});
}

function setHair(k) {
  if (!HAIRS.some(h => h.key === k)) return;
  rt.view.hairKey = k;
  rt.view.sprites = getSprites(rt.view.palKey, k);
  persistSettings();
  bus.emit('ui:update', {});
}

// --- ui handlers ---
ui.wire(rt, {
  onStart({ fresh }) {
    sfx.ensure();
    let state = null;
    if (!fresh) state = saveio.load();
    if (!state) {
      saveio.clearSave();
      state = createState({ settings: { palette: rt.view.palKey, hair: rt.view.hairKey, muted: sfx.muted } });
    } else {
      // a loaded world remembers its own look unless the title changed it
      if (PALETTES[state.settings.palette]) setPalette(state.settings.palette);
      if (HAIRS.some(h => h.key === state.settings.hair)) setHair(state.settings.hair);
    }
    attachState(state);
    rt.session = freshSession();
    rt.session.phase = 'game';
    ui.hideTitle();
    sfx.quest();
    bus.emit('ui:update', {});
  },
  onAction() { sfx.ensure(); playerSys.doAction(rt); },
  onCraftToggle() {
    sfx.ensure();
    if (rt.session.placing) { crafting.cancelPlace(rt); return; }
    if (rt.session.venturing) {
      bus.emit('action:denied', {});
      bus.emit('fx:float', { str: 'NOT OUT HERE', x: rt.state.player.x, y: rt.state.player.y - 56, kind: 'text' });
      return;
    }
    rt.session.craftOpen = !rt.session.craftOpen;
    bus.emit('ui:click', {});
    bus.emit('ui:update', {});
  },
  onCraft(id) { crafting.craftItem(rt, id); },
  onCancelPlace() { crafting.cancelPlace(rt); },
  onChestMove(itemId, toContainer) {
    if (!rt.session.chestOpen) return;
    if (inventory.transfer(rt.state, rt.session.chestOpen, itemId, toContainer)) {
      bus.emit('ui:click', {});
      bus.emit('ui:update', {});
    }
  },
  onChestClose() {
    rt.session.chestOpen = null;
    bus.emit('ui:click', {});
    bus.emit('ui:update', {});
  },
  onShopBuy(itemId) { if (rt.session.shopOpen) economy.buy(rt, rt.session.shopOpen, itemId); },
  onShopSell(itemId) { if (rt.session.shopOpen) economy.sell(rt, rt.session.shopOpen, itemId); },
  onShopClose() {
    rt.session.shopOpen = null;
    bus.emit('ui:click', {});
    bus.emit('ui:update', {});
  },
  onEventOpen() {
    const first = rt.state.events.active[0];
    if (!first) return;
    rt.session.eventOpen = first.defId;
    bus.emit('ui:click', {});
    bus.emit('ui:update', {});
  },
  onEventChoice(defId, choiceId) {
    if (rt.events.resolve(defId, choiceId)) {
      rt.session.eventOpen = null;
      bus.emit('ui:update', {});
    }
  },
  onEventClose() {
    rt.session.eventOpen = null;
    bus.emit('ui:click', {});
    bus.emit('ui:update', {});
  },
  onPathToggle() {
    rt.session.pathOpen = !rt.session.pathOpen;
    bus.emit('ui:click', {});
    bus.emit('ui:update', {});
  },
  onPathUnlock(nodeId) { progression.unlock(rt, nodeId); },
  onCyclePalette() {
    const ks = Object.keys(PALETTES);
    setPalette(ks[(ks.indexOf(rt.view.palKey) + 1) % ks.length]);
    bus.emit('ui:click', {});
  },
  onPickPalette(k) { setPalette(k); },
  onPickHair(k) { setHair(k); },
  onToggleSound() {
    sfx.setMuted(!sfx.muted);
    persistSettings();
    if (!sfx.muted) { sfx.ensure(); sfx.ui(); }
    bus.emit('ui:update', {});
  },
});

// --- keyboard intents ---
bus.on('input:action', () => { sfx.ensure(); playerSys.doAction(rt); });
bus.on('input:craftToggle', () => {
  if (rt.session.placing) { crafting.cancelPlace(rt); return; }
  if (rt.session.venturing) { bus.emit('action:denied', {}); return; }
  rt.session.craftOpen = !rt.session.craftOpen;
  bus.emit('ui:update', {});
});
bus.on('input:cancel', () => {
  if (rt.session.placing) crafting.cancelPlace(rt);
  else if (rt.session.chestOpen) { rt.session.chestOpen = null; bus.emit('ui:update', {}); }
  else if (rt.session.shopOpen) { rt.session.shopOpen = null; bus.emit('ui:update', {}); }
  else if (rt.session.eventOpen) { rt.session.eventOpen = null; bus.emit('ui:update', {}); }
  else if (rt.session.pathOpen) { rt.session.pathOpen = false; bus.emit('ui:update', {}); }
  else if (rt.session.craftOpen) { rt.session.craftOpen = false; bus.emit('ui:update', {}); }
});
bus.on('input:palette', () => {
  const ks = Object.keys(PALETTES);
  setPalette(ks[(ks.indexOf(rt.view.palKey) + 1) % ks.length]);
});
bus.on('input:mute', () => {
  sfx.setMuted(!sfx.muted);
  persistSettings();
  bus.emit('ui:update', {});
});

// --- the loop: fixed update order ---
const loop = createLoop({
  update(dt) {
    rt.session.gt += dt;
    if (rt.session.phase !== 'game' || !rt.state) return;
    timeSys.update(rt.state, dt, bus);   // time
    playerSys.update(rt, dt);            // player (+ drops pickup)
    if (rt.session.venturing) {
      combat.update(rt, dt);             // the wilds: enemies
    } else {
      resources.update(dt);              // world / resource renewal
      rt.npcs.update(dt);                // people: schedules → activity → movement
      rt.rabbits.update(dt);             // critters
      building.update(rt, dt);           // sim: construction sites, home flag
      rt.quests.update(dt);              // sim: quest chain
    }
    needs.update(rt.state, dt);          // sim: needs decay (everywhere)
    autosave.update(dt);                 // io: periodic save
    rt.fx.update(dt);                    // transient visuals
    rt.hud.update(dt);
    ui.tick();                           // action button label
  },
  render: renderer.render,
});

ui.showTitle({ hasSave: saveio.hasSave() });
loop.start();

// dev/testing hook (used by the smoke test; not part of the module contract)
window.__frontier = rt;
