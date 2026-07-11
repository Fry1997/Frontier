// sim/inventory — item stacks (§3 Inventory). Slots are ItemStack[]:
// { itemId, qty }. Containers (chests) arrive in Phase 3 but the shape
// exists now. All mutation goes through these helpers so totals and the
// 'item:gained' event stay consistent.

import { ITEMS } from '../content/items.js';

export function count(state, itemId) {
  const s = state.inventory.slots.find(s => s.itemId === itemId);
  return s ? s.qty : 0;
}

export function has(state, itemId, qty = 1) {
  return count(state, itemId) >= qty;
}

export function canAfford(state, costs) {
  return costs.every(c => count(state, c.itemId) >= c.qty);
}

export function add(state, itemId, qty, bus, at) {
  let s = state.inventory.slots.find(s => s.itemId === itemId);
  if (!s) { s = { itemId, qty: 0 }; state.inventory.slots.push(s); }
  s.qty += qty;
  if (state.totals[itemId] !== undefined) state.totals[itemId] += qty;
  if (bus) bus.emit('item:gained', { itemId, qty, item: ITEMS[itemId], x: at?.x, y: at?.y });
}

export function remove(state, itemId, qty) {
  const s = state.inventory.slots.find(s => s.itemId === itemId);
  if (!s || s.qty < qty) return false;
  s.qty -= qty;
  if (s.qty <= 0) state.inventory.slots.splice(state.inventory.slots.indexOf(s), 1);
  return true;
}

export function spend(state, costs) {
  if (!canAfford(state, costs)) return false;
  for (const c of costs) remove(state, c.itemId, c.qty);
  return true;
}

export function hasTool(state, tool) {
  return state.player.equipped.tool === tool;
}
