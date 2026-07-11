// content/quests — the onboarding quest chain (data; predicates read a small
// query facade `q` built by sim/quests.js, never raw module internals).

export const QUESTS = [
  { text: 'GATHER A STICK AND A STONE', done: q => q.count('stick') >= 1 && q.count('stone') >= 1 },
  { text: 'TAP CRAFT: MAKE A STONE AXE', done: q => q.hasTool('axe') },
  { text: 'CHOP A TREE. GET 3 WOOD', done: q => q.total('wood') >= 3 },
  { text: 'CRAFT + PLACE A CAMPFIRE', done: q => q.flag('fire') },
  { text: 'HUNT A RABBIT', done: q => q.total('meatRaw') >= 1 },
  { text: 'COOK THE MEAT AT YOUR FIRE', done: q => q.total('meatCk') >= 1 },
  { text: 'EAT: TAP THE ACTION BUTTON', done: q => q.flag('ate') },
  { text: 'DRINK FROM THE POND', done: q => q.flag('drank') },
  { text: 'BUILD A SHELTER', done: q => q.flag('shelterBuilt') },
  { text: 'STEP INSIDE. MAKE IT HOME', done: q => q.flag('home') },
  { text: 'HOME', done: () => false },
];
