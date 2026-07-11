// content/recipes — declarative recipe definitions (§2.3).
// Shape (schema §3): { id, out:{itemId,qty}, costs:[{itemId,qty}], place?, ... }
// `place` recipes enter the ghost-preview placement flow instead of granting
// an item. `once` recipes can only be made while you don't own the output.
// `requiresUnlock` is the progression gate hook (unused until Phase 10).

export const RECIPES = [
  {
    id: 'axe',
    name: 'STONE AXE',
    desc: 'CHOPS TREES',
    icon: 'axe',
    out: { itemId: 'axe', qty: 1 },
    costs: [{ itemId: 'stick', qty: 1 }, { itemId: 'stone', qty: 1 }],
    once: true,
    equips: 'tool',
  },
  {
    id: 'hoe',
    name: 'STONE HOE',
    desc: 'TILLS THE EARTH',
    icon: 'hoe',
    out: { itemId: 'hoe', qty: 1 },
    costs: [{ itemId: 'stick', qty: 1 }, { itemId: 'stone', qty: 1 }],
    once: true,
  },
  {
    id: 'fire',
    name: 'CAMPFIRE',
    desc: 'COOK + WARMTH',
    icon: 'fire',
    costs: [{ itemId: 'wood', qty: 3 }, { itemId: 'stone', qty: 2 }],
    place: { w: 1, h: 1, object: 'fire', ground: ['g', 'd', 'r'] },
  },
  {
    id: 'shelter',
    name: 'SHELTER',
    desc: 'A ROOM OF YOUR OWN',
    icon: 'home',
    costs: [{ itemId: 'wood', qty: 6 }, { itemId: 'stick', qty: 4 }],
    place: { w: 5, h: 4, object: 'site', ground: ['g', 'd'] },
  },

  // --- Phase 3: building depth ---
  {
    id: 'chest',
    name: 'CHEST',
    desc: 'STORES YOUR GOODS',
    icon: 'chest',
    costs: [{ itemId: 'wood', qty: 4 }, { itemId: 'stick', qty: 1 }],
    place: { w: 1, h: 1, object: 'chest', ground: ['g', 'd', 'f'] },
  },
  {
    id: 'wall',
    name: 'WOOD WALL',
    desc: 'FENCE OFF YOUR LAND',
    icon: 'wall',
    costs: [{ itemId: 'wood', qty: 2 }],
    place: { w: 1, h: 1, object: 'wall', ground: ['g', 'd'] },
  },
  {
    id: 'bed',
    name: 'BED',
    desc: 'SLEEP TO MORNING',
    icon: 'bed',
    costs: [{ itemId: 'wood', qty: 4 }, { itemId: 'stick', qty: 2 }],
    place: { w: 1, h: 1, object: 'bed', ground: ['f'], room: true },
    requiresFlag: 'shelterBuilt',
  },
  {
    id: 'table',
    name: 'TABLE',
    desc: 'A TOUCH OF HOME',
    icon: 'table',
    costs: [{ itemId: 'wood', qty: 3 }],
    place: { w: 1, h: 1, object: 'table', ground: ['f'], room: true },
    requiresFlag: 'shelterBuilt',
  },
  {
    id: 'homeUpgrade',
    name: 'TIMBER HOME',
    desc: 'UPGRADE YOUR SHELTER',
    icon: 'home',
    costs: [{ itemId: 'wood', qty: 12 }, { itemId: 'stone', qty: 6 }],
    effect: 'upgradeShelter',
    requiresFlag: 'shelterBuilt',
    done: state => state.structures.length > 0 && state.structures.every(s => s.tier >= 2),
  },
];
