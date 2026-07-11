// core/rng — seedable RNG (§8: keep determinism possible for a future
// procedural world / reproducible events). Sim systems use this; purely
// visual effects may keep using Math.random.

export function createRng(seed) {
  let s = seed >>> 0;
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  return {
    next,
    int: n => Math.floor(next() * n),
    range: (a, b) => a + next() * (b - a),
    chance: p => next() < p,
    pick: arr => arr[Math.floor(next() * arr.length)],
  };
}
