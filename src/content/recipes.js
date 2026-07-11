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
];
