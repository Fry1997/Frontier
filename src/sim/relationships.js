// sim/relationships — per-NPC value, tier, memory (§3 Relationship, §5).
// NPCs like (or don't) the player based on accumulated history: talking,
// trading, later gifts and events. Memory facts live on the NPC (schema);
// the relationship record lives in state.relationships keyed by npcId.

export const TIERS = [
  { name: 'stranger', at: 0 },
  { name: 'acquaintance', at: 10 },
  { name: 'friend', at: 30 },
];

export function tierFor(value) {
  let t = TIERS[0].name;
  for (const tier of TIERS) if (value >= tier.at) t = tier.name;
  return t;
}

export function get(state, npcId) {
  return (state.relationships[npcId] ||= { value: 0, tier: 'stranger', flags: {} });
}

export function addValue(state, npcId, amount, bus) {
  const rel = get(state, npcId);
  rel.value = Math.max(0, rel.value + amount);
  const newTier = tierFor(rel.value);
  if (newTier !== rel.tier) {
    rel.tier = newTier;
    if (bus) bus.emit('relationship:tier', { npcId, tier: newTier });
  }
  return rel;
}

// Memory facts: [{ type, subjectId, day }] on the NPC (schema §3).
export function remember(npc, type, day, subjectId = null) {
  npc.memory.push({ type, subjectId, day });
  if (npc.memory.length > 40) npc.memory.shift(); // NPCs forget the distant past
}

export function recalls(npc, type, day = null) {
  return npc.memory.some(m => m.type === type && (day === null || m.day === day));
}
