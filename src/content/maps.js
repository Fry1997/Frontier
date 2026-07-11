// content/maps — hand-authored base maps (§4: saves store baseMapId + tile
// deltas, so the map can be edited later without breaking old saves).
//
// Row characters:
//   .  grass        d  dirt         r  rock        w  water
//   T  tree (obj)   B  boulder (obj)   b  bush (obj)
//   s  stick drop   o  stone drop
// Terrain under object/drop chars is grass.

export const MAPS = {
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
  },
};

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
      if (ch === 'T') objects[k] = { type: 'tree', hp: 3 };
      if (ch === 'B') objects[k] = { type: 'boulder' };
      if (ch === 'b') objects[k] = { type: 'bush' };
      if (ch === 's') drops.push({ kind: 'stick', x: x * T + 16, y: y * T + 20 });
      if (ch === 'o') drops.push({ kind: 'stone', x: x * T + 16, y: y * T + 20 });
    }
  }
  return { objects, drops };
}
