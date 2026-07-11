// content/maps — hand-authored base maps (§4: saves store baseMapId + tile
// deltas, so the map can be edited later without breaking old saves).
//
// Row characters:
//   .  grass        d  dirt         r  rock        w  water
//   T  tree (obj)   B  boulder (obj)   b  bush (obj)
//   s  stick drop   o  stone drop
// Terrain under object/drop chars is grass.

import { OBJECT_DEFS } from './objects.js';

export const MAPS = {
  // Phase 2: the larger world. Zones tag regions (forest/rock/lake/meadow)
  // for spawn distribution (§5 Tiles/biomes) — resources, and later NPCs,
  // crops and events, read them. Drafted with tooling, validated for
  // connectivity (every drop reachable, 225 choppable trees, drinkable
  // lake edge, clear 5x4 shelter room near camp), then frozen here as a
  // hand-authored artifact.
  'greenwood': {
    id: 'greenwood',
    name: 'GREENWOOD',
    w: 44,
    h: 34,
    rows: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTT.TTTTTTTTTTTT..................T',
      'TTTTTT.TT.TTTTT.T..TTTT.T.......rrrrrr..r..T',
      'T.T..TTT........T....T.TT....rrrrrrBrrrrrr.T',
      'TT...T.T.TT..TT.......TTT....rrBrrrrrrrrrrrT',
      'TT........TT.TT..T..T.......rrrrrorrrrrBrrrT',
      'TTT.TT.......T...T.....TT...rrrrrrrrrrrrrrrT',
      'TTT.......TTT.T......T.T....rrrrrBrrrrorrrrT',
      'T.TT.T...............TTTT...rrorrrrrrBrrrrrT',
      'TT....Ts...T....T....s.......rBrrrrrrrrrBrrT',
      'TTTT..T...T....T.T..T...T....rrrrrrrrrrrrrrT',
      'T...........s...s........b.....rrrrBrrrrrr.T',
      'T.......b......................o.rrrrrr....T',
      'T..............b...........................T',
      'T.................s.dddddd.T...............T',
      'T...........b....T.dddddddd........T....T..T',
      'T..................dddddddd..............T.T',
      'T...............o..dddddddd............TT..T',
      'T.............T.....dddddd.o...............T',
      'T.......................s......T....b......T',
      'T..........................................T',
      'T......ww...............b...T.........T.T..T',
      'T...wwwwwww...........................T..T.T',
      'T...wwwwwwwww..TT..........................T',
      'T..wwwwwwwwwwwT..T....T.......b......s.....T',
      'T.wwwwwwwwwwww...T.......................b.T',
      'T.wwwwwwwwwwww......b...........TT.........T',
      'T.wwwwwwwwwwww.s...T...........T...........T',
      'T.wwwwwwwwwwww...T...........s...T.........T',
      'T..wwwwwwwwww......TT.o.TT.............T...T',
      'T..wwwwwwwwww..............TT........T..T..T',
      'T....wwwwwww............................T..T',
      'T..........................................T',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    playerStart: { x: 22.5, y: 16.5 },
    rabbitSpawns: [[16, 20], [28, 23], [34, 17], [24, 27], [38, 27], [12, 17]],
    rabbitCount: 5,
    // zone rects checked in order; anything unmatched is 'meadow'
    zones: [
      { name: 'forest', rect: [1, 1, 26, 12] },
      { name: 'rock', rect: [28, 2, 15, 11] },
      { name: 'lake', rect: [1, 21, 14, 12] },
    ],
    resourceCaps: { stick: 8, stone: 6 },
  },

  // The original prototype map — kept so old saves keep working (§4:
  // saves reference baseMapId).
  'meadow-vale': {
    id: 'meadow-vale',
    name: 'MEADOW VALE',
    w: 26,
    h: 20,
    rows: [
      'TTTTTbTTTTTTTbTTTTTTBTTTTT',
      'T......T........rrrrrr...T',
      'Tb..s.......T...rrrBrror.T',
      'T...........o...rrrrrrB..T',
      'T..T....T.........rroBr..T',
      'T.....s.......T....rr....T',
      'T.T.....o......s........bT',
      'T..........dddd......T...T',
      'T....s....dddddd..o......T',
      'T..o......dddddd.....b...T',
      'T.........ddddd....T.....T',
      'T.T....s.....d......s....T',
      'T............o...........T',
      'Tww.......T.........T....T',
      'Twwww..........o.........T',
      'Twwwww....s..........b...T',
      'Twwwww.......T...........T',
      'Twwww...o................T',
      'Tww.............b......s.T',
      'TTTTTTTTTbTTTTTTTTTBTTTTTT',
    ],
    playerStart: { x: 12.5, y: 9.6 }, // in tiles
    rabbitSpawns: [[22, 13], [18, 16], [23, 6], [6, 11], [21, 15]],
    rabbitCount: 3,
    zones: [
      { name: 'lake', rect: [1, 13, 5, 6] },
      { name: 'rock', rect: [16, 1, 8, 5] },
    ],
    resourceCaps: { stick: 5, stone: 4 },
  },
};

// Which zone a tile belongs to; 'meadow' when nothing matches.
export function zoneAt(map, tx, ty) {
  for (const z of map.zones || []) {
    const [x, y, w, h] = z.rect;
    if (tx >= x && ty >= y && tx < x + w && ty < y + h) return z.name;
  }
  return 'meadow';
}

const T = 32;

// Base terrain for a tile, ignoring objects/drops. 'g0'..'g2' are grass
// variants chosen by a fixed hash so the base map is stable.
export function baseTerrain(map, tx, ty) {
  const ch = (map.rows[ty] || '')[tx] || '.';
  if (ch === 'd') return 'd';
  if (ch === 'r') return 'r';
  if (ch === 'w') return 'w';
  return 'g' + ((tx * 7 + ty * 13) % 3);
}

// The objects and ground drops a fresh world starts with.
export function initialWorldObjects(map) {
  const objects = {}, drops = [];
  for (let y = 0; y < map.h; y++) {
    for (let x = 0; x < map.w; x++) {
      const ch = (map.rows[y] || '')[x] || '.';
      const k = x + ',' + y;
      if (ch === 'T') objects[k] = { type: 'tree', hp: OBJECT_DEFS.tree.hp };
      if (ch === 'B') objects[k] = { type: 'boulder' };
      if (ch === 'b') objects[k] = { type: 'bush' };
      if (ch === 's') drops.push({ kind: 'stick', x: x * T + 16, y: y * T + 20 });
      if (ch === 'o') drops.push({ kind: 'stone', x: x * T + 16, y: y * T + 20 });
    }
  }
  return { objects, drops };
}
