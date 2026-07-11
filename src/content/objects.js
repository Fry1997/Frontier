// content/objects — declarative world-object definitions (§2.3, Phase 2).
// Systems read properties from here instead of hardcoding type lists:
// tiles.js reads `passable` for collision; resources.js reads `source`
// to know what each ambient resource respawns beside. `sprite` is the
// asset id (design↔code pipeline) — drawing offsets stay in the renderer.

export const OBJECT_DEFS = {
  tree:    { id: 'tree',    sprite: 'tree',    passable: false, tags: ['flora'], choppable: true, hp: 3 },
  sapling: { id: 'sapling', sprite: 'sapling', passable: true,  tags: ['flora'] },
  stump:   { id: 'stump',   sprite: 'stump',   passable: true,  tags: ['flora'] },
  boulder: { id: 'boulder', sprite: 'boulder', passable: false, tags: ['mineral'] },
  bush:    { id: 'bush',    sprite: 'bush',    passable: false, tags: ['flora'] },
  fire:    { id: 'fire',    sprite: 'fire',    passable: false, tags: ['station'] },
  site:    { id: 'site',    sprite: 'shelterFrame', passable: false, tags: ['construction'] },
  wall:    { id: 'wall',    sprite: 'wall',    passable: false, tags: ['structure'] },
  door:    { id: 'door',    sprite: 'door',    passable: true,  tags: ['structure'] },
};

export const isPassable = type => !!OBJECT_DEFS[type]?.passable;

// What ambient resources respawn beside (world/resources.js).
export const RESOURCE_SOURCES = {
  stick: { objectType: 'tree', zone: 'forest' },
  stone: { objectType: 'boulder', zone: 'rock' },
};
