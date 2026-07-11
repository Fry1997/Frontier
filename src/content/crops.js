// content/crops — declarative crop definitions (§2.3). Growth is stages
// 0..growDays; a plot advances one stage per day IF it was watered and the
// season suits. Wrong season withers the crop (healthy=false) — gently:
// you clear it and replant, nothing punishes you further.

export const CROPS = {
  turnip: {
    id: 'turnip',
    name: 'TURNIP',
    seedItem: 'turnipSeed',
    growDays: 2,
    seasons: ['spring', 'summer', 'autumn'],
    yield: { itemId: 'turnip', qty: 2 },
    bonusSeedChance: 0.5, // harvest sometimes returns a seed
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'PUMPKIN',
    seedItem: 'pumpkinSeed',
    growDays: 4,
    seasons: ['summer', 'autumn'],
    yield: { itemId: 'pumpkin', qty: 1 },
    bonusSeedChance: 0.35,
  },
};

export const cropForSeed = seedItemId =>
  Object.values(CROPS).find(c => c.seedItem === seedItemId) || null;
