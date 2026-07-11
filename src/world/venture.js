// world/venture — expeditions into the wilds (§5: the venture layer).
// A venture is a TRANSIENT trip: the expedition map's objects, drops, and
// enemies regenerate fresh every time you take the trail; only what you
// carry (and your bruises) comes home. Nothing venture-side is saved —
// autosaves during a trip record your home position instead.
//
// While a venture is active, rt.tiles and rt.world() point at the
// expedition world; settlement-only systems are paused by the main loop.

import { MAPS, initialWorldObjects } from '../content/maps.js';
import { createTileMap } from './tiles.js';
import { ENEMIES } from '../content/enemies.js';

const T = 32;

export function createVenture(rt) {
  function enter(mapId = 'darkwood') {
    if (rt.venture) return;
    const map = MAPS[mapId];
    const { objects, drops } = initialWorldObjects(map);
    const world = { baseMapId: mapId, tileDeltas: {}, objects, drops, resourceTimers: {} };
    const tiles = createTileMap({ world });
    const wdef = ENEMIES.wolf;
    const enemies = (map.enemySpawns || []).map(([tx, ty], i) => ({
      id: 'wolf-' + i, def: 'wolf',
      x: tx * T + 16, y: ty * T + 16,
      hp: wdef.hp, alive: true,
      state: 'prowl', t: 1 + Math.random() * 2,
      vx: 0, vy: 0, face: 1, animT: 0,
      biteCd: 0, hurtT: 0,
    }));
    rt.venture = {
      mapId, world, tiles, enemies,
      homePos: { x: rt.state.player.x, y: rt.state.player.y },
      homeTiles: rt.tiles,
    };
    rt.tiles = tiles;
    rt.session.venturing = true;
    rt.session.craftOpen = false;
    rt.state.player.x = map.playerStart.x * T;
    rt.state.player.y = map.playerStart.y * T;
    rt.bus.emit('venture:entered', { mapId });
    rt.bus.emit('ui:update', {});
  }

  function exit({ downed = false } = {}) {
    if (!rt.venture) return;
    const { homePos, homeTiles } = rt.venture;
    rt.tiles = homeTiles;
    rt.state.player.x = homePos.x;
    rt.state.player.y = homePos.y;
    rt.venture = null;
    rt.session.venturing = false;
    if (downed) {
      // hurt and lighter, never dead — you wake back at the trailhead
      rt.state.player.hp = 2;
      const lost = Math.min(rt.state.economy.currency, 4);
      rt.state.economy.currency -= lost;
      rt.bus.emit('venture:downed', { lost });
    }
    rt.bus.emit('venture:exited', { downed });
    rt.bus.emit('ui:update', {});
  }

  return { enter, exit };
}
