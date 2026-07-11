// sim/needs — hunger/thirst. HARD DESIGN PILLAR (enforced here): needs are
// gentle — they nudge (slower movement), they never kill. Meters switch on
// partway through the quest chain and decay slowly from then on.

const HUNGER_DECAY = 0.0042; // per second
const THIRST_DECAY = 0.0056;
export const WEAK_AT = 0.15;

export function update(state, dt) {
  if (!state.flags.metersOn) return;
  const n = state.player.needs;
  n.hunger = Math.max(0, n.hunger - dt * HUNGER_DECAY);
  n.thirst = Math.max(0, n.thirst - dt * THIRST_DECAY);
}

export function isWeak(state) {
  const n = state.player.needs;
  return state.flags.metersOn && (n.hunger < WEAK_AT || n.thirst < WEAK_AT);
}

// Called once when the quest chain wakes the meters up.
export function enableMeters(state) {
  state.flags.metersOn = true;
  state.player.needs.hunger = 0.62;
  state.player.needs.thirst = 0.55;
}

export function eat(state, restore) {
  state.player.needs.hunger = Math.min(1, state.player.needs.hunger + restore);
  state.flags.ate = true;
}

export function drink(state) {
  state.player.needs.thirst = Math.min(1, state.player.needs.thirst + 0.5);
  state.flags.drank = true;
}
