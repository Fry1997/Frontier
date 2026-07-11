// entities/schedule — NPC routines (§2.2): time-of-day → goal/place.
// Pure functions; entities/npc.js derives the live activity each tick.

import { NPC_DEFS } from '../content/npcs.js';

// Which schedule entry covers this minute (entries may wrap midnight).
export function entryAt(def, minute) {
  for (const e of def.schedule) {
    if (e.from <= e.to ? (minute >= e.from && minute < e.to) : (minute >= e.from || minute < e.to)) {
      return e;
    }
  }
  return def.schedule[def.schedule.length - 1];
}

// Resolve a schedule "place" to a world pixel position.
export function placePos(rt, def, place) {
  const T = 32;
  if (place === 'stall') {
    const key = Object.keys(rt.state.world.objects).find(k => rt.state.world.objects[k].type === 'stall');
    if (key) {
      const [tx, ty] = key.split(',').map(Number);
      // beside the counter, not in front of it — customers face the cart
      // to TRADE and face him to TALK, without the two overlapping
      return { x: (tx + 1) * T + 16, y: (ty + 1) * T + 8 };
    }
  }
  const home = NPC_DEFS[def.id].home;
  return { x: home.tx * T + 16, y: home.ty * T + 16 };
}
