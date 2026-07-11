// content/enemies — declarative enemy definitions (Phase 8). The pillar
// (§5 Combat & threats): threats hurt or steal, they never annihilate.

export const ENEMIES = {
  wolf: {
    id: 'wolf',
    name: 'WOLF',
    hp: 3,
    speed: 74,
    aggroRadius: 120,
    biteRange: 24,
    biteCooldown: 1.1,
    damage: 1,
    loot: { itemId: 'fur', min: 1, max: 2 },
  },
};
