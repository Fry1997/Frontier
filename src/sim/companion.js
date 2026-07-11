// sim/companion — Merlin's force-multiplier behaviours (§5 Merlin).
// The bond IS the progression: relationship tier gates what he does for
// you. He buffs Arthur's actions; he never solos anything (design pillar).
//
//   acquaintance → LIGHT: a soft glow around him at night
//   friend       → HASTEN: Arthur walks ~12% faster while Merlin is near

import * as rel from './relationships.js';

const NEAR_PX = 90;
export const HASTEN_MULT = 1.12;

export function merlin(state) {
  return state.npcs.find(n => n.id === 'merlin') || null;
}

export function bond(state) {
  return rel.get(state, 'merlin');
}

export function isNear(state) {
  const m = merlin(state);
  if (!m || m.activity === 'away') return false;
  return Math.hypot(m.x - state.player.x, m.y - state.player.y) < NEAR_PX;
}

// Which auras are live right now.
export function auras(state) {
  const m = merlin(state);
  if (!m) return { light: false, hasten: false, near: false };
  const tier = bond(state).tier;
  const near = isNear(state);
  return {
    near,
    light: near && (tier === 'acquaintance' || tier === 'friend'),
    hasten: near && tier === 'friend',
  };
}

export function speedMult(state) {
  return auras(state).hasten ? HASTEN_MULT : 1;
}
