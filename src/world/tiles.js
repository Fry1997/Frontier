// world/tiles — the tile grid: base map + saved deltas (§4), collision checks.
// The derived grid is a cache rebuilt from (baseMapId, tileDeltas) whenever a
// state is attached; setTile writes the delta AND the cache so saves stay
// small and the renderer stays fast.

import { MAPS, baseTerrain } from '../content/maps.js';
import { okey } from '../core/state.js';

const T = 32;

export function createTileMap(state) {
  const map = MAPS[state.world.baseMapId];
  const W = map.w, H = map.h;
  const grid = [];
  for (let y = 0; y < H; y++) {
    grid.push([]);
    for (let x = 0; x < W; x++) {
      grid[y].push(state.world.tileDeltas[okey(x, y)] || baseTerrain(map, x, y));
    }
  }

  const tileAt = (tx, ty) => (tx < 0 || ty < 0 || tx >= W || ty >= H) ? 'X' : grid[ty][tx];
  const isLand = g => g !== 'w' && g !== 'X';

  // Object types the player can walk over.
  const PASSABLE = new Set(['stump', 'door', 'sapling']);

  function blockedTile(tx, ty) {
    const g = tileAt(tx, ty);
    if (g === 'X' || g === 'w') return true;
    const o = state.world.objects[okey(tx, ty)];
    if (o && !PASSABLE.has(o.type)) return true;
    return false;
  }

  // Feet-box collision, same footprint as the prototype.
  function blockedPx(x, y) {
    for (const [ox, oy] of [[-6, -3], [6, -3], [-6, 4], [6, 4]]) {
      if (blockedTile(Math.floor((x + ox) / T), Math.floor((y + oy) / T))) return true;
    }
    return false;
  }

  function setTile(tx, ty, type) {
    if (tx < 0 || ty < 0 || tx >= W || ty >= H) return;
    grid[ty][tx] = type;
    if (baseTerrain(map, tx, ty) === type) delete state.world.tileDeltas[okey(tx, ty)];
    else state.world.tileDeltas[okey(tx, ty)] = type;
  }

  return { map, W, H, grid, tileAt, isLand, blockedTile, blockedPx, setTile };
}
