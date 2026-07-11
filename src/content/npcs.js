// content/npcs — the cast (§3 NPC, §5 NPCs & society). Declarative: who
// they are, what they look like (colour overrides on the villager sprite),
// when they arrive, and their daily routine. Schedules map minute-of-day
// ranges to a goal + place; entities/schedule.js derives the live activity.
//
// kinds: resident (lives here), traveller (comes and goes), landmark
// (arc-driven quest characters — Phase 6+).

export const NPC_DEFS = {
  maro: {
    id: 'maro',
    name: 'MARO',
    kind: 'resident',
    look: { tunic: '#5b7ea6', tunicLo: '#48688c', hair: '#3a3a44', hairLo: '#26262e', hairHi: '#55555f', hairstyle: 'swept' },
    arrivesDay: 1,           // here from the start — he owns the cart
    home: { tx: 30, ty: 16 }, // beside the stall
    schedule: [
      { from: 8 * 60, to: 18 * 60, goal: 'tend', place: 'stall' },
      { from: 18 * 60, to: 21 * 60, goal: 'wander', place: 'home' },
      { from: 21 * 60, to: 8 * 60, goal: 'rest', place: 'home' },
    ],
    lines: 'maro',
  },
  wren: {
    id: 'wren',
    name: 'WREN',
    kind: 'traveller',
    look: { tunic: '#8a5a74', tunicLo: '#6e4560', hair: '#b06a3a', hairLo: '#8a4f28', hairHi: '#cc8a55', hairstyle: 'hood' },
    arrivesDay: 2,           // wanders in once you've survived a night
    home: { tx: 36, ty: 21 },
    schedule: [
      { from: 9 * 60, to: 19 * 60, goal: 'wander', place: 'home' },
      { from: 19 * 60, to: 9 * 60, goal: 'away', place: 'home' }, // gone by night
    ],
    lines: 'wren',
  },
};
