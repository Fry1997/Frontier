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
  return RECIPES.filter(r =>
    isUnlocked(state, r.requiresUnlock) &&
    (!r.requiresFlag || state.flags[r.requiresFlag]));
}

export function recipeDone(state, r) {
  if (r.done) return r.done(state);
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
  if (r.equips) state.player.equipped[r.equips] = ITEMS[r.out.itemId][r.equips]; // e.g. tool:'axe', weapon:'sword'
  if (r.effect) bus.emit('craft:effect', { effect: r.effect }); // e.g. building handles 'upgradeShelter'
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

// The player's feet collision box is x±6, y−3..y+4 (see tiles.blockedPx).
// Placement must reject any tile that box overlaps — not just the center
// tile — or a new blocking object materializes under the player's toes and
// wedges them (+1px margin for safety).
function overlapsPlayer(state, tx, ty) {
  const p = state.player;
  return !(p.x + 7 < tx * T || p.x - 7 >= (tx + 1) * T || p.y + 5 < ty * T || p.y - 4 >= (ty + 1) * T);
}

export function placeValid(rt) {
  const { session, state, tiles } = rt;
  const placing = session.placing;
  if (!placing) return false;
  const r = RECIPES.find(q => q.id === placing.id);
  const [ax, ay] = placeAnchor(rt);
  if (ax < 1 || ay < 1 || ax + placing.w > tiles.W - 1 || ay + placing.h > tiles.H - 1) return false;
  for (let dy = 0; dy < placing.h; dy++) {
    for (let dx = 0; dx < placing.w; dx++) {
      const tx = ax + dx, ty = ay + dy;
      const g = tiles.tileAt(tx, ty);
      if (!r.place.ground.includes(g === 'X' ? 'X' : g[0])) return false;
      if (state.world.objects[okey(tx, ty)]) return false;
      if (overlapsPlayer(state, tx, ty)) return false;
      // furniture must sit inside a structure's room bounds
      if (r.place.room && !inRoom(state, tx, ty)) return false;
      for (const d of state.world.drops) {
        if (Math.floor(d.x / T) === tx && Math.floor(d.y / T) === ty) return false;
      }
    }
  }
  return true;
}

function inRoom(state, tx, ty) {
  for (const sh of state.structures) {
    for (const room of sh.rooms || []) {
      if (tx >= room.x && ty >= room.y && tx < room.x + room.w && ty < room.y + room.h) return sh;
    }
  }
  return null;
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
  } else if (r.place.object === 'site') {
    // A construction site: sim/building animates it into a shelter.
    state.world.objects[okey(ax + 2, ay + 1)] = { type: 'site', builds: r.id, t: 0, ax, ay };
  } else if (r.place.object === 'chest') {
    const id = 'chest-' + (Object.keys(state.inventory.containers).length + 1);
    state.world.objects[okey(ax, ay)] = { type: 'chest', containerId: id };
    state.inventory.containers[id] = [];
  } else if (r.place.object === 'wall') {
    state.world.objects[okey(ax, ay)] = { type: 'wall', kind: 'n', face: true, w: true, e: true, built: true };
  } else {
    // furniture (bed/table): a world object, also recorded on its structure
    state.world.objects[okey(ax, ay)] = { type: r.place.object };
    const sh = inRoom(state, ax, ay);
    if (sh) sh.furniture.push({ id: r.place.object + '-' + (sh.furniture.length + 1), type: r.place.object, tx: ax, ty: ay });
  }
  bus.emit('object:placed', { type: r.place.object, tx: ax, ty: ay });
  session.placing = null;
  bus.emit('ui:update', {});
}

export function cancelPlace(rt) {
  rt.session.placing = null;
  rt.bus.emit('ui:click', {});
  rt.bus.emit('ui:update', {});
}
