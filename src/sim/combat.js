// sim/combat — venture-layer combat (§5). Wolf AI (prowl → chase → bite),
// the player's sword swing, knockback, loot, and defeat. Design pillars
// enforced here: enemies hurt, they never kill — at 0 hearts you're driven
// home, bruised and a few coins lighter. Merlin's support is a ward that
// sometimes turns a bite aside at friend bond (§5 Merlin: buffs your
// actions, never solos).

import { ENEMIES } from '../content/enemies.js';
import { ITEMS } from '../content/items.js';
import * as companion from './companion.js';
import * as progression from './progression.js';

const T = 32;
const WARD_CHANCE = 0.35;

// Max hearts grow with the path (warden node).
export function maxHp(state) {
  return 6 + (progression.has(state, 'warden') ? 2 : 0);
}

function wardChance(state) {
  return WARD_CHANCE + (progression.has(state, 'mystic') ? 0.2 : 0);
}

export function update(rt, dt) {
  if (!rt.venture) return;
  const { state, bus, tiles } = rt;
  const p = state.player;
  for (const e of rt.venture.enemies) {
    if (!e.alive) continue;
    const def = ENEMIES[e.def];
    if (e.hurtT > 0) e.hurtT -= dt;
    if (e.biteCd > 0) e.biteCd -= dt;
    const pd = Math.hypot(p.x - e.x, p.y - e.y);

    if (pd < def.aggroRadius) {
      // chase
      const a = Math.atan2(p.y - e.y, p.x - e.x);
      e.vx = Math.cos(a) * def.speed;
      e.vy = Math.sin(a) * def.speed;
      e.state = 'chase';
      if (pd < def.biteRange && e.biteCd <= 0) {
        e.biteCd = def.biteCooldown;
        bite(rt, e, def);
      }
    } else if (e.state !== 'prowl' || e.t <= 0) {
      // prowl: lazy wander
      e.state = 'prowl';
      e.t = 1.5 + Math.random() * 2.5;
      const a = Math.random() * Math.PI * 2;
      const drift = Math.random() < 0.6 ? 30 : 0;
      e.vx = Math.cos(a) * drift;
      e.vy = Math.sin(a) * drift;
    }
    e.t -= dt;
    if (e.vx || e.vy) {
      e.animT += dt * 8;
      const nx = e.x + e.vx * dt, ny = e.y + e.vy * dt;
      if (!tiles.blockedPx(nx, e.y)) e.x = nx; else e.vx *= -1;
      if (!tiles.blockedPx(e.x, ny)) e.y = ny; else e.vy *= -1;
      if (e.vx !== 0) e.face = e.vx > 0 ? 1 : -1;
    }
  }
}

function bite(rt, e, def) {
  const { state, bus } = rt;
  // Merlin's ward: at friend bond he travels with you in spirit if not in step
  if (companion.bond(state).tier === 'friend' && rt.rng.chance(wardChance(state))) {
    bus.emit('combat:warded', { x: state.player.x, y: state.player.y });
    return;
  }
  state.player.hp = Math.max(0, state.player.hp - def.damage);
  bus.emit('player:hurt', { hp: state.player.hp, x: state.player.x, y: state.player.y });
  // knockback away from the wolf (skip if it would push into a wall)
  const a = Math.atan2(state.player.y - e.y, state.player.x - e.x);
  const kx = state.player.x + Math.cos(a) * 18, ky = state.player.y + Math.sin(a) * 18;
  if (!rt.tiles.blockedPx(kx, ky)) { state.player.x = kx; state.player.y = ky; }
  if (state.player.hp <= 0) {
    bus.emit('player:downed', {});
    rt.ventureApi.exit({ downed: true });
  }
}

// The wolf (if any) in striking reach of the player's facing point.
export function attackTarget(rt, px, py) {
  if (!rt.venture) return null;
  for (const e of rt.venture.enemies) {
    if (e.alive && Math.hypot(e.x - px, e.y - py) < 28) return e;
  }
  return null;
}

export function strike(rt, e) {
  const { state, bus } = rt;
  const def = ENEMIES[e.def];
  e.hp -= ITEMS[state.player.equipped.weapon]?.damage || 1;
  e.hurtT = 0.25;
  bus.emit('enemy:hit', { x: e.x, y: e.y });
  // knockback
  const a = Math.atan2(e.y - state.player.y, e.x - state.player.x);
  const kx = e.x + Math.cos(a) * 22, ky = e.y + Math.sin(a) * 22;
  if (!rt.tiles.blockedPx(kx, ky)) { e.x = kx; e.y = ky; }
  if (e.hp <= 0) {
    e.alive = false;
    const n = def.loot.min + rt.rng.int(def.loot.max - def.loot.min + 1);
    for (let i = 0; i < n; i++) {
      rt.world().drops.push({ kind: def.loot.itemId, x: e.x, y: e.y, pop: true });
    }
    bus.emit('enemy:killed', { x: e.x, y: e.y });
  }
}

// Sleeping heals: a night in your own bed mends a heart or two.
export function attach(rt) {
  rt.bus.on('player:slept', () => {
    rt.state.player.hp = Math.min(maxHp(rt.state), rt.state.player.hp + 2);
  });
}
