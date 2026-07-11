// sim/crafting — the generic craft/place flow (§5). Reads content/recipes;
// knows nothing about specific recipes. Placement ("placing") is transient
// UI-adjacent state and lives in session, not GameState — costs are only
// paid on confirm, so a reload mid-placement loses nothing.

import { RECIPES } from '../content/recipes.js';
import { ITEMS } from '../content/items.js';
import { isUnlocked, okey } from '../core/state.js';
import * as inv from './inventory.js';

const T = 32;

export function availableRecipes(state) {
  return RECIPES.filter(r => isUnlocked(state, r.requiresUnlock));
}

export function recipeDone(state, r) {
  return !!(r.once && r.out && inv.has(state, r.out.itemId));
}

export function canCraft(state, r) {
  return !recipeDone(state, r) && inv.canAfford(state, r.costs);
}

export function craftItem(rt, id) {
  const { state, bus, session } = rt;
  const r = RECIPES.find(q => q.id === id);
  if (!r || recipeDone(state, r)) return;
  if (!inv.canAfford(state, r.costs)) { bus.emit('action:denied', {}); return; }

  if (r.place) {
    session.placing = { id: r.id, w: r.place.w, h: r.place.h };
    session.craftOpen = false;
    bus.emit('ui:click', {});
    bus.emit('ui:update', {});
    return;
  }

  inv.spend(state, r.costs);
  if (r.out) inv.add(state, r.out.itemId, r.out.qty);
  if (r.equips) state.player.equipped[r.equips] = ITEMS[r.out.itemId].tool;
  session.craftOpen = false;
  bus.emit('craft:crafted', { id: r.id, name: r.name, x: state.player.x, y: state.player.y });
  bus.emit('ui:update', {});
}

// --- placement ---

export function placeAnchor(rt) {
  const { session, state } = rt;
  const p = state.player;
  const DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
  const [dx, dy] = DIRV[p.dir];
  const fx = Math.floor(p.x / T) + dx, fy = Math.floor(p.y / T) + dy;
  const placing = session.placing;
  if (!placing || placing.w === 1) return [fx, fy];
  if (p.dir === 'down') return [fx - 2, fy];
  if (p.dir === 'up') return [fx - 2, fy - 3];
  if (p.dir === 'left') return [fx - 4, fy - 1];
  return [fx, fy - 1];
}

export function placeValid(rt) {
  const { session, state, tiles } = rt;
  const placing = session.placing;
  if (!placing) return false;
  const r = RECIPES.find(q => q.id === placing.id);
  const [ax, ay] = placeAnchor(rt);
  if (ax < 1 || ay < 1 || ax + placing.w > tiles.W - 1 || ay + placing.h > tiles.H - 1) return false;
  const ptx = Math.floor(state.player.x / T), pty = Math.floor(state.player.y / T);
  for (let dy = 0; dy < placing.h; dy++) {
    for (let dx = 0; dx < placing.w; dx++) {
      const tx = ax + dx, ty = ay + dy;
      const g = tiles.tileAt(tx, ty);
      if (!r.place.ground.includes(g === 'X' ? 'X' : g[0])) return false;
      if (state.world.objects[okey(tx, ty)]) return false;
      if (tx === ptx && ty === pty) return false;
      for (const d of state.world.drops) {
        if (Math.floor(d.x / T) === tx && Math.floor(d.y / T) === ty) return false;
      }
    }
  }
  return true;
}

export function confirmPlace(rt) {
  const { state, bus, session } = rt;
  const r = RECIPES.find(q => q.id === session.placing.id);
  if (!placeValid(rt) || !inv.canAfford(state, r.costs)) { bus.emit('action:denied', {}); return; }
  inv.spend(state, r.costs);
  const [ax, ay] = placeAnchor(rt);
  if (r.place.object === 'fire') {
    state.world.objects[okey(ax, ay)] = { type: 'fire', lit: true };
    state.flags.fire = true;
    bus.emit('object:placed', { type: 'fire', tx: ax, ty: ay });
  } else if (r.place.object === 'site') {
    // A construction site: sim/building animates it into a shelter.
    state.world.objects[okey(ax + 2, ay + 1)] = { type: 'site', builds: r.id, t: 0, ax, ay };
    bus.emit('object:placed', { type: 'site', tx: ax, ty: ay });
  }
  session.placing = null;
  bus.emit('ui:update', {});
}

export function cancelPlace(rt) {
  rt.session.placing = null;
  rt.bus.emit('ui:click', {});
  rt.bus.emit('ui:update', {});
}
