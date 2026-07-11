// core/state — the single source of truth (§2.1, §3 of the technical handover).
//
// Everything mutable and save-worthy lives in this one GameState object.
// Systems read and write it; no system keeps hidden persistent state.
// Transient visual-only state (particles, floats, camera, cached sprites,
// per-frame animation timers) lives OUTSIDE GameState and is never saved —
// see the `session` object created in main.js and the pools in render/fx.js.
//
// This file is the written schema contract between modules. Fields that are
// stubs for later phases (npcs, farm, economy, progression, ...) are created
// here from day one so the save format and the hooks exist early (§7).

import { MAPS, initialWorldObjects } from '../content/maps.js';

export const SAVE_VERSION = 3;

export const DAY_START_MINUTE = 8 * 60; // the first morning begins at 08:00

export function createState({ seed, baseMapId = 'greenwood', settings = {} } = {}) {
  const map = MAPS[baseMapId];
  const { objects, drops } = initialWorldObjects(map);
  return {
    version: SAVE_VERSION,
    seed: seed ?? ((Math.random() * 0x7fffffff) | 0),

    // 1 real second = 1 game minute. minute is minute-of-day [0..1440).
    time: { minute: DAY_START_MINUTE, day: 1, season: 'spring', year: 1 },

    player: {
      x: map.playerStart.x * 32,
      y: map.playerStart.y * 32,
      dir: 'down',
      needs: { hunger: 1, thirst: 1 },
      skills: {},
      equipped: { weapon: null, tool: null },
    },

    inventory: {
      slots: [],       // ItemStack[]: { itemId, qty }
      containers: {},  // { [containerId]: ItemStack[] } — chests/storage (Phase 3)
    },

    world: {
      baseMapId,
      tileDeltas: {},      // { "tx,ty": tileType } — only tiles changed from base
      objects,             // { "tx,ty": WorldObject } — trees/stumps/rocks/fires/walls/...
      drops,               // [{ kind, x, y, ... }] — ground pickups
      resourceTimers: {},  // { "tx,ty": regrowAtDay } — stump→tree, node respawn
    },

    structures: [],  // [{ id, type, ax, ay, tier, rooms, furniture, ownerId }]
    farm: [],        // Plot[] (Phase 4)
    npcs: [],        // NPC[] (Phase 5)
    relationships: {},
    economy: { currency: 0, shops: [] },
    progression: {
      skill: { unlocked: [], points: 0 },
      tech: { unlocked: [], points: 0 },
      arcane: { unlocked: [], points: 0 },
    },
    unlocks: [],     // recipe/building/ability ids unlocked (gating hook, wired now)
    events: { active: [], history: [] },

    quest: { stage: 0 }, // the onboarding chain
    totals: { stick: 0, stone: 0, wood: 0, meatRaw: 0, meatCk: 0 }, // lifetime tallies (quest predicates)
    flags: { fire: false, ate: false, drank: false, shelterBuilt: false, home: false, metersOn: false },

    settings: {
      palette: settings.palette || 'meadow',
      hair: settings.hair || 'scruff',
      muted: !!settings.muted,
      hints: settings.hints ?? true,
    },
  };
}

// Unlock gating hook (§7: wire progression/unlocks early even though the
// trees come in Phase 10). Content with no `requiresUnlock` is always open.
export function isUnlocked(state, id) {
  return !id || state.unlocks.includes(id);
}

export const okey = (tx, ty) => tx + ',' + ty;
