// sim/farming — plots, crops, growth, watering (§5 Farming). Plots live in
// state.farm (schema §3: { id, tx, ty, cropId, plantedDay, stage, watered,
// healthy }); they are walkable, so they are NOT world objects. Growth
// happens on day rollover: a plot advances a stage only if it was watered,
// and withers (healthy=false) out of season. Gentle by design — a withered
// crop is cleared and replanted, nothing worse. Emits farm:* events and
// crop:withered (the Phase 6 event-system hook from the handover).

import { CROPS, cropForSeed } from '../content/crops.js';
import { okey } from '../core/state.js';
import * as inv from './inventory.js';
import * as progression from './progression.js';

const T = 32;

export function plotAt(state, tx, ty) {
  return state.farm.find(p => p.tx === tx && p.ty === ty) || null;
}

// Tillable: a dirt tile with nothing on it — farmland grows out of the camp
// clearing (and any dirt you uncover later).
export function canTill(rt, tx, ty) {
  const { state, tiles } = rt;
  if (tiles.tileAt(tx, ty) !== 'd') return false;
  if (state.world.objects[okey(tx, ty)]) return false;
  if (plotAt(state, tx, ty)) return false;
  for (const d of state.world.drops) {
    if (Math.floor(d.x / T) === tx && Math.floor(d.y / T) === ty) return false;
  }
  return true;
}

export function till(rt, tx, ty) {
  const { state, bus } = rt;
  if (!canTill(rt, tx, ty)) return;
  state.farm.push({ id: 'plot-' + (state.farm.length + 1), tx, ty, cropId: null, plantedDay: 0, stage: 0, watered: false, healthy: true });
  bus.emit('farm:tilled', { tx, ty });
  bus.emit('ui:update', {});
}

// The first seed type in the pack decides what gets planted.
export function seedInPack(state) {
  const s = state.inventory.slots.find(s => cropForSeed(s.itemId));
  return s ? s.itemId : null;
}

export function plant(rt, plot) {
  const { state, bus } = rt;
  const seedId = seedInPack(state);
  if (!seedId || plot.cropId) return;
  const crop = cropForSeed(seedId);
  inv.remove(state, seedId, 1);
  plot.cropId = crop.id;
  plot.plantedDay = state.time.day;
  plot.stage = 0;
  plot.watered = false;
  plot.healthy = true;
  bus.emit('farm:planted', { tx: plot.tx, ty: plot.ty, cropId: crop.id });
  bus.emit('ui:update', {});
}

export function water(rt, plot) {
  if (plot.watered) return;
  plot.watered = true;
  rt.bus.emit('farm:watered', { tx: plot.tx, ty: plot.ty });
}

export function isGrown(plot) {
  return !!plot.cropId && plot.healthy && plot.stage >= CROPS[plot.cropId].growDays;
}

export function harvest(rt, plot) {
  const { state, bus, rng } = rt;
  if (!isGrown(plot)) return;
  const crop = CROPS[plot.cropId];
  const qty = crop.yield.qty + (progression.has(state, 'harvester') ? 1 : 0);
  inv.add(state, crop.yield.itemId, qty, bus, { x: plot.tx * T + 16, y: plot.ty * T + 8 });
  if (rng.chance(crop.bonusSeedChance)) inv.add(state, crop.seedItem, 1, bus);
  plot.cropId = null;
  plot.stage = 0;
  plot.watered = false;
  plot.healthy = true;
  bus.emit('farm:harvested', { tx: plot.tx, ty: plot.ty, cropId: crop.id });
  bus.emit('ui:update', {});
}

export function clear(rt, plot) {
  plot.cropId = null;
  plot.stage = 0;
  plot.healthy = true;
  plot.watered = false;
  rt.bus.emit('farm:cleared', { tx: plot.tx, ty: plot.ty });
  rt.bus.emit('ui:update', {});
}

// One-time bus wiring: growth on day rollover.
export function attach(rt) {
  rt.bus.on('time:dayStart', () => {
    const { state, bus } = rt;
    for (const plot of state.farm) {
      if (!plot.cropId || !plot.healthy) { plot.watered = false; continue; }
      const crop = CROPS[plot.cropId];
      if (!crop.seasons.includes(state.time.season)) {
        plot.healthy = false;
        bus.emit('crop:withered', { tx: plot.tx, ty: plot.ty, cropId: plot.cropId }); // Phase 6 event hook
        continue;
      }
      if (plot.watered && plot.stage < crop.growDays) plot.stage++;
      plot.watered = false;
    }
  });
}
