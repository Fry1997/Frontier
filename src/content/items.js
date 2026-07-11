// content/items — declarative item definitions (§2.3: content is data, not code).
// `icon` and `sprite` are asset ids resolved by assets/sprites.js — the
// design↔code pipeline contract keys hand-made art to these same ids.

export const ITEMS = {
  stick:   { id: 'stick',   name: 'STICK',       label: 'STICK',    icon: 'stick',   sprite: 'stick',   stackMax: 99, kind: 'material', tags: ['wood'],          value: 1 },
  stone:   { id: 'stone',   name: 'STONE',       label: 'STONE',    icon: 'stone',   sprite: 'stone',   stackMax: 99, kind: 'material', tags: ['mineral'],       value: 1 },
  wood:    { id: 'wood',    name: 'WOOD',        label: 'WOOD',     icon: 'wood',    sprite: 'wood',    stackMax: 99, kind: 'material', tags: ['wood'],          value: 2 },
  meatRaw: { id: 'meatRaw', name: 'RAW MEAT',    label: 'RAW MEAT', icon: 'meatRaw', sprite: 'meatRaw', stackMax: 99, kind: 'food',     tags: ['meat', 'raw'],   value: 3 },
  meatCk:  { id: 'meatCk',  name: 'COOKED MEAT', label: 'COOKED',   icon: 'meatCk',  sprite: 'meatCk',  stackMax: 99, kind: 'food',     tags: ['meat', 'cooked'], value: 5, restores: { hunger: 0.55 } },
  axe:     { id: 'axe',     name: 'STONE AXE',   label: 'AXE',      icon: 'axe',     sprite: 'axe',     stackMax: 1,  kind: 'tool',     tags: ['tool'],          value: 5, tool: 'axe' },
};
