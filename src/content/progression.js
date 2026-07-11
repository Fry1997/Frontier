// content/progression — the node graph (§3 ProgressionNode, §5 Progression).
// DESIGN FORK RESOLVED: one unified tree ("The Path"), not three — the
// handover leans toward fewer, richer. Skill-flavoured, tech-capped,
// arcane-tinged nodes all live on the same path; points come from deeds
// (XP over the bus), so progression IS playing the game.

export const XP_PER_POINT = 20;

// What deeds are worth (sim/progression listens on the bus).
export const XP_AWARDS = {
  'tree:felled': 1,
  'farm:harvested': 2,
  'shop:sold': 1,
  'structure:built': 5,
  'structure:upgraded': 5,
  'event:resolved': 3,
  'enemy:killed': 4,
  'dragon:gift': 5,
  'relationship:tier': 3,
};

export const NODES = [
  { id: 'forester',  tree: 'path', name: 'FORESTER',  desc: '+1 WOOD FROM EVERY TREE',   cost: 1, prereqs: [] },
  { id: 'harvester', tree: 'path', name: 'HARVESTER', desc: '+1 CROP FROM EVERY HARVEST', cost: 1, prereqs: [] },
  { id: 'warden',    tree: 'path', name: 'WARDEN',    desc: '+2 MAX HEARTS',              cost: 2, prereqs: ['forester'] },
  { id: 'mystic',    tree: 'path', name: 'MYSTIC',    desc: "MERLIN'S WARD TURNS MORE ASIDE", cost: 2, prereqs: ['harvester'] },
];
