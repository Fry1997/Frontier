// sim/progression — XP from deeds, points, node unlocks (§5 Progression).
// Generic: reads content/progression, applies nothing itself — systems ask
// `has(state, nodeId)` where a node's effect lives (chop yield, harvest
// yield, max hearts, ward chance).

import { NODES, XP_AWARDS, XP_PER_POINT } from '../content/progression.js';

export function skill(state) {
  const s = state.progression.skill;
  s.xp ??= 0; // added post-v1; guarded rather than migrated
  return s;
}

export function has(state, nodeId) {
  return state.progression.skill.unlocked.includes(nodeId);
}

export function canUnlock(state, node) {
  const s = skill(state);
  return !has(state, node.id) &&
    s.points >= node.cost &&
    node.prereqs.every(p => has(state, p));
}

export function unlock(rt, nodeId) {
  const { state, bus } = rt;
  const node = NODES.find(n => n.id === nodeId);
  if (!node || !canUnlock(state, node)) { bus.emit('action:denied', {}); return false; }
  const s = skill(state);
  s.points -= node.cost;
  s.unlocked.push(node.id);
  if (node.id === 'warden') state.player.hp += 2; // the new hearts arrive full
  bus.emit('progression:unlocked', { nodeId: node.id, name: node.name });
  bus.emit('ui:update', {});
  return true;
}

// One-time bus wiring: deeds feed the path.
export function attach(rt) {
  for (const [event, amount] of Object.entries(XP_AWARDS)) {
    rt.bus.on(event, () => {
      if (!rt.state) return;
      const s = skill(rt.state);
      s.xp += amount;
      while (s.xp >= XP_PER_POINT) {
        s.xp -= XP_PER_POINT;
        s.points += 1;
        rt.bus.emit('progression:point', { points: s.points });
        rt.bus.emit('fx:float', { str: 'THE PATH OPENS (+1)', x: rt.state.player.x, y: rt.state.player.y - 64, kind: 'accent' });
      }
    });
  }
}
