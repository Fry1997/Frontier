// world/resources — resource renewal (§5: Resources + renewal). New in Phase 1.
//
// - Felled trees leave stumps that regrow: stump → sapling → tree over ~2–3
//   days, tracked in state.world.resourceTimers as { "tx,ty": regrowAtDay }
//   (schema §3). The stump becomes a sapling one day before regrowAtDay and
//   a full tree on regrowAtDay.
// - Sticks and stones ambiently respawn near trees / boulders, capped per map,
//   so the world never runs dry. Spawns are zone-weighted (§5 Tiles/biomes):
//   sticks prefer forest-zone trees, stones prefer rock-zone boulders — the
//   source object type and preferred zone are content data (RESOURCE_SOURCES).
// Emits 'resource:regrown' and 'resource:spawned' on the bus.

import { okey } from '../core/state.js';
import { RESOURCE_SOURCES, OBJECT_DEFS } from '../content/objects.js';

const T = 32;
const REGROW_MIN_DAYS = 2, REGROW_MAX_DAYS = 3;
const DEFAULT_CAPS = { stick: 5, stone: 4 };
const SPAWN_PERIOD = 90;  // seconds (= game minutes) between ambient spawn attempts
const SPAWN_CHANCE = 0.55;

export function createResources(rt) {
  const { bus } = rt;

  // When a tree falls, schedule its regrowth.
  bus.on('tree:felled', ({ tx, ty }) => {
    const days = rt.rng.int(REGROW_MAX_DAYS - REGROW_MIN_DAYS + 1) + REGROW_MIN_DAYS;
    rt.state.world.resourceTimers[okey(tx, ty)] = rt.state.time.day + days;
  });

  let checkT = 0;
  const spawnT = { stick: SPAWN_PERIOD * 0.4, stone: SPAWN_PERIOD * 0.8 };

  function update(dt) {
    checkT -= dt;
    if (checkT <= 0) {
      checkT = 1; // regrow checks are cheap; once a game-minute is plenty
      checkRegrowth();
    }
    for (const kind of ['stick', 'stone']) {
      spawnT[kind] -= dt;
      if (spawnT[kind] <= 0) {
        spawnT[kind] = SPAWN_PERIOD * (0.75 + rt.rng.next() * 0.5);
        if (rt.rng.chance(SPAWN_CHANCE)) trySpawn(kind);
      }
    }
  }

  function checkRegrowth() {
    const { state } = rt;
    const timers = state.world.resourceTimers;
    for (const key of Object.keys(timers)) {
      const regrowAt = timers[key];
      const o = state.world.objects[key];
      if (!o || (o.type !== 'stump' && o.type !== 'sapling')) { delete timers[key]; continue; }
      if (o.type === 'stump' && state.time.day >= regrowAt - 1) {
        state.world.objects[key] = { type: 'sapling' };
        bus.emit('resource:regrown', { key, stage: 'sapling' });
      } else if (o.type === 'sapling' && state.time.day >= regrowAt) {
        // Don't close a tree around anyone standing on the tile — retry later.
        const [tx, ty] = key.split(',').map(Number);
        if (occupied(tx, ty)) continue;
        state.world.objects[key] = { type: 'tree', hp: OBJECT_DEFS.tree.hp };
        delete timers[key];
        bus.emit('resource:regrown', { key, stage: 'tree', tx, ty });
      }
    }
  }

  // Feet-box overlap, not center-tile equality — a tree closing around a
  // toe wedges the player just as badly as one on their center.
  function occupied(tx, ty) {
    const p = rt.state.player;
    return !(p.x + 7 < tx * T || p.x - 7 >= (tx + 1) * T || p.y + 5 < ty * T || p.y - 4 >= (ty + 1) * T);
  }

  function trySpawn(kind) {
    const { state, tiles, rng } = rt;
    const caps = tiles.map.resourceCaps || DEFAULT_CAPS;
    const onGround = state.world.drops.filter(d => d.kind === kind).length;
    if (onGround >= caps[kind]) return;
    // Spawn beside a matching source object, preferring its home zone
    // (sticks under forest trees, stones by rock-zone boulders).
    const src = RESOURCE_SOURCES[kind];
    let sources = Object.keys(state.world.objects).filter(k => state.world.objects[k].type === src.objectType);
    const zoned = sources.filter(k => {
      const [sx, sy] = k.split(',').map(Number);
      return tiles.zoneAt(sx, sy) === src.zone;
    });
    if (zoned.length && rng.chance(0.75)) sources = zoned;
    if (!sources.length) return;
    for (let tries = 0; tries < 8; tries++) {
      const [sx, sy] = rng.pick(sources).split(',').map(Number);
      const tx = sx + rng.int(3) - 1, ty = sy + rng.int(3) - 1;
      if (tiles.blockedTile(tx, ty)) continue;
      if (state.world.drops.some(d => Math.floor(d.x / T) === tx && Math.floor(d.y / T) === ty)) continue;
      const drop = { kind, x: tx * T + 10 + rng.int(12), y: ty * T + 14 + rng.int(10) };
      state.world.drops.push(drop);
      bus.emit('resource:spawned', { kind, x: drop.x, y: drop.y });
      return;
    }
  }

  return { update };
}
