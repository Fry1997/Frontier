// entities/player — movement + collision, facing, and the context-action
// resolver (actionCtx: the single "what does the button do here" function).
// Persistent player fields live in state.player; per-frame animation and
// action timers live in session.player (transient, never saved).

import { okey } from '../core/state.js';
import { ITEMS } from '../content/items.js';
import { OBJECT_DEFS } from '../content/objects.js';
import * as inv from '../sim/inventory.js';
import * as needs from '../sim/needs.js';
import * as crafting from '../sim/crafting.js';
import * as farming from '../sim/farming.js';
import * as timeSys from '../world/time.js';

const T = 32;
const DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
const COOK_TIME = 1.3;

export function faceTile(state) {
  const [dx, dy] = DIRV[state.player.dir];
  return [Math.floor(state.player.x / T) + dx, Math.floor(state.player.y / T) + dy];
}

export function facePoint(state) {
  const [dx, dy] = DIRV[state.player.dir];
  return [state.player.x + dx * 24, state.player.y + dy * 22];
}

// Best edible in the pack (cooked meat first, then crops).
function findFood(state) {
  for (const id of ['meatCk', 'turnip', 'pumpkin']) {
    if (ITEMS[id].restores && inv.count(state, id) > 0) return id;
  }
  return null;
}

export function nearFire(state) {
  const tx = Math.floor(state.player.x / T), ty = Math.floor(state.player.y / T);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const o = state.world.objects[okey(tx + dx, ty + dy)];
    if (o && o.type === 'fire' && o.lit) return true;
  }
  return false;
}

// The context-action resolver: what the single action button means right now.
export function actionCtx(rt) {
  const { state, session } = rt;
  const sp = session.player;
  if (session.placing) {
    return crafting.placeValid(rt) ? { k: 'place', label: 'PLACE' } : { k: 'blocked', label: "CAN'T" };
  }
  if (sp.cookT > 0) return { k: 'none', label: '...' };
  if (inv.hasTool(state, 'axe')) {
    const [px, py] = facePoint(state);
    for (const r of rt.rabbits.list) {
      if (r.alive && Math.hypot(r.x - px, r.y - py) < 26) return { k: 'hunt', label: 'HUNT', r };
    }
  }
  const [fx, fy] = faceTile(state);
  const o = state.world.objects[okey(fx, fy)];
  if (o && OBJECT_DEFS[o.type]?.choppable) {
    return inv.hasTool(state, 'axe') ? { k: 'chop', label: 'CHOP', o, fx, fy } : { k: 'noaxe', label: 'NEED AXE' };
  }
  if (o && o.type === 'fire' && inv.count(state, 'meatRaw') > 0) return { k: 'cook', label: 'COOK' };
  if (o && o.type === 'chest') return { k: 'chest', label: 'OPEN', containerId: o.containerId };
  if (o && o.type === 'bed') return { k: 'sleep', label: 'SLEEP' };
  if (o && OBJECT_DEFS[o.type]?.shopId) return { k: 'shop', label: 'TRADE', shopId: OBJECT_DEFS[o.type].shopId };
  // farming verbs on the faced tile
  const plot = farming.plotAt(state, fx, fy);
  if (plot) {
    if (!plot.healthy) return { k: 'farmClear', label: 'CLEAR', plot };
    if (farming.isGrown(plot)) return { k: 'farmHarvest', label: 'HARVEST', plot };
    if (!plot.cropId && farming.seedInPack(state)) return { k: 'farmPlant', label: 'PLANT', plot };
    if (plot.cropId && !plot.watered) return { k: 'farmWater', label: 'WATER', plot };
  } else if (inv.has(state, 'hoe') && farming.canTill(rt, fx, fy)) {
    return { k: 'farmTill', label: 'TILL', fx, fy };
  }
  if (rt.tiles.tileAt(fx, fy) === 'w' && state.player.needs.thirst < 0.98) return { k: 'drink', label: 'DRINK', fx, fy };
  const food = findFood(state);
  if (food && state.player.needs.hunger < 0.98 && state.flags.metersOn) return { k: 'eat', label: 'EAT', food };
  if (inv.count(state, 'meatRaw') > 0 && nearFire(state)) return { k: 'cook', label: 'COOK' };
  return { k: 'none', label: '...' };
}

export function doAction(rt) {
  const { state, bus, session } = rt;
  const c = actionCtx(rt);
  if (c.k === 'place') return crafting.confirmPlace(rt);
  if (c.k === 'blocked') { bus.emit('action:denied', {}); return; }
  if (c.k === 'noaxe') {
    bus.emit('action:denied', {});
    bus.emit('fx:float', { str: 'NEED AN AXE!', x: state.player.x, y: state.player.y - 56, kind: 'bad' });
    return;
  }
  if (c.k === 'chop') { swing(session, () => hitTree(rt, c.o, c.fx, c.fy)); return; }
  if (c.k === 'hunt') { swing(session, () => rt.rabbits.kill(c.r)); return; }
  if (c.k === 'drink') {
    needs.drink(state);
    bus.emit('player:drank', { tx: c.fx, ty: c.fy, x: state.player.x, y: state.player.y });
    return;
  }
  if (c.k === 'cook') {
    session.player.cookT = COOK_TIME;
    bus.emit('cook:start', {});
    return;
  }
  if (c.k === 'chest') {
    session.chestOpen = c.containerId;
    session.craftOpen = false;
    bus.emit('ui:click', {});
    bus.emit('ui:update', {});
    return;
  }
  if (c.k === 'sleep') {
    timeSys.sleep(state, bus);
    bus.emit('fx:float', { str: 'A NEW DAY', x: state.player.x, y: state.player.y - 56, kind: 'accent' });
    return;
  }
  if (c.k === 'shop') {
    session.shopOpen = c.shopId;
    session.craftOpen = false;
    bus.emit('ui:click', {});
    bus.emit('ui:update', {});
    return;
  }
  if (c.k === 'farmTill') { swing(session, () => farming.till(rt, c.fx, c.fy)); return; }
  if (c.k === 'farmPlant') { farming.plant(rt, c.plot); return; }
  if (c.k === 'farmWater') { farming.water(rt, c.plot); return; }
  if (c.k === 'farmHarvest') { farming.harvest(rt, c.plot); return; }
  if (c.k === 'farmClear') { farming.clear(rt, c.plot); return; }
  if (c.k === 'eat') {
    inv.remove(state, c.food, 1);
    needs.eat(state, ITEMS[c.food].restores.hunger);
    bus.emit('player:ate', { x: state.player.x, y: state.player.y });
    bus.emit('ui:update', {});
    return;
  }
  bus.emit('ui:click', {});
}

function swing(session, cb) {
  const sp = session.player;
  if (sp.actT > 0) return;
  sp.actT = 0.34;
  sp.swingCb = cb;
}

function hitTree(rt, o, fx, fy) {
  const { state, bus, rng } = rt;
  o.hp--;
  o.shake = 0.25;
  bus.emit('tree:hit', { tx: fx, ty: fy });
  if (o.hp <= 0) {
    state.world.objects[okey(fx, fy)] = { type: 'stump' };
    bus.emit('tree:felled', { tx: fx, ty: fy });
    const n = 2 + (rng.chance(0.5) ? 1 : 0);
    for (let i = 0; i < n; i++) {
      state.world.drops.push({ kind: 'wood', x: fx * T + 16, y: fy * T + 12, pop: true });
    }
  }
}

export function update(rt, dt) {
  const { state, bus, session, input, tiles } = rt;
  const p = state.player;
  const sp = session.player;

  // movement
  const [ax, ay] = input.axes();
  let mx = ax, my = ay;
  const m = Math.hypot(mx, my);
  const weak = needs.isWeak(state);
  const spd = (weak ? 68 : 104) * (sp.cookT > 0 ? 0 : 1) * Math.min(1, m);
  if (m > 0.15 && sp.actT <= 0) {
    mx /= m; my /= m;
    const nx = p.x + mx * spd * dt, ny = p.y + my * spd * dt;
    if (!tiles.blockedPx(nx, p.y)) p.x = nx;
    if (!tiles.blockedPx(p.x, ny)) p.y = ny;
    p.dir = Math.abs(mx) > Math.abs(my) ? (mx > 0 ? 'right' : 'left') : (my > 0 ? 'down' : 'up');
    sp.moving = spd > 1;
    sp.animT += dt * (weak ? 5 : 7.5);
  } else sp.moving = false;

  // swing (the hit lands partway through the animation)
  if (sp.actT > 0) {
    const was = sp.actT;
    sp.actT -= dt;
    if (was > 0.17 && sp.actT <= 0.17 && sp.swingCb) { sp.swingCb(); sp.swingCb = null; }
  }

  // cooking
  if (sp.cookT > 0) {
    sp.cookT -= dt;
    if (sp.cookT <= 0 && inv.count(state, 'meatRaw') > 0) {
      inv.remove(state, 'meatRaw', 1);
      inv.add(state, 'meatCk', 1);
      bus.emit('cook:done', { x: p.x, y: p.y });
      bus.emit('ui:update', {});
    }
  }

  // drops: physics + pickup
  const drops = state.world.drops;
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    if (d.pop) { d.vx = (Math.random() - 0.5) * 60; d.vy = -60 - Math.random() * 40; d.z = 14; delete d.pop; }
    d.t = (d.t || 0) + dt;
    if ((d.z || 0) > 0 || (d.vy || 0) !== 0) {
      d.x += (d.vx || 0) * dt;
      d.vy = (d.vy || 0) + 300 * dt;
      d.z = (d.z || 0) - d.vy * dt;
      if (d.z <= 0) { d.z = 0; d.vy = 0; d.vx = 0; }
    }
    if (d.t > 0.35 && Math.hypot(d.x - p.x, d.y - p.y) < 16) {
      drops.splice(i, 1);
      inv.add(state, d.kind, 1, bus, { x: d.x, y: d.y });
      bus.emit('drop:collected', { x: d.x, y: d.y });
      bus.emit('ui:update', {});
    }
  }

  // object shake decay (visual field on world objects; stripped from saves)
  for (const key of Object.keys(state.world.objects)) {
    const o = state.world.objects[key];
    if (o.shake > 0) o.shake -= dt;
  }
}
