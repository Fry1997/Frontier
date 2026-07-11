// sim/building — structures (§3 Structure, §5 Building). Owns construction
// sites, the shelter build-out (floor tiles as deltas + wall/door objects),
// and structure queries. Roof fade / chimney smoke are visual and live in
// render/fx keyed by structure id.

import { okey } from '../core/state.js';

const T = 32;

// One-time bus wiring (called at boot; reads rt.state at event time).
export function attach(rt) {
  rt.bus.on('craft:effect', ({ effect }) => {
    if (effect === 'upgradeShelter') upgradeShelter(rt);
  });
}

// Tier upgrade-in-place (design fork resolved: the home levels up where it
// stands — Structure.tier drives visuals and, later, room/furniture caps).
export function upgradeShelter(rt) {
  const { state, bus } = rt;
  const sh = state.structures.find(s => s.type === 'shelter' && s.tier < 2);
  if (!sh) return;
  sh.tier = 2;
  bus.emit('structure:upgraded', { id: sh.id, tier: sh.tier, ax: sh.ax, ay: sh.ay });
}

export function update(rt, dt) {
  const { state, bus } = rt;
  for (const key of Object.keys(state.world.objects)) {
    const o = state.world.objects[key];
    if (o.type !== 'site') continue;
    const was = o.t;
    o.t += dt;
    if (Math.floor(was / 0.55) !== Math.floor(o.t / 0.55)) {
      bus.emit('build:progress', { tx: o.ax, ty: o.ay });
    }
    if (o.t >= 1.8) buildShelter(rt, key, o);
  }
  // Being inside your shelter makes it home.
  if (!state.flags.home && state.flags.shelterBuilt && playerInside(state)) {
    state.flags.home = true;
  }
}

function buildShelter(rt, siteKey, site) {
  const { state, tiles, bus } = rt;
  const { ax, ay } = site;
  delete state.world.objects[siteKey];

  // Floor becomes tile deltas; walls/door become world objects.
  for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 5; dx++) tiles.setTile(ax + dx, ay + dy, 'f');
  for (let dx = 0; dx < 5; dx++) {
    state.world.objects[okey(ax + dx, ay)] = { type: 'wall', kind: 'n', face: true, w: dx === 0, e: dx === 4 };
    if (dx === 2) state.world.objects[okey(ax + dx, ay + 3)] = { type: 'door' };
    else state.world.objects[okey(ax + dx, ay + 3)] = { type: 'wall', kind: 's', face: true, w: dx === 0, e: dx === 4 };
  }
  for (let dy = 1; dy < 3; dy++) {
    state.world.objects[okey(ax, ay + dy)] = { type: 'wall', kind: 'w', w: true };
    state.world.objects[okey(ax + 4, ay + dy)] = { type: 'wall', kind: 'e', e: true };
  }

  const id = 'shelter-' + (state.structures.length + 1);
  state.structures.push({
    id, type: 'shelter', ax, ay, tier: 1,
    rooms: [{ x: ax + 1, y: ay + 1, w: 3, h: 2 }], // interior bounds — furniture placement checks these
    furniture: [], ownerId: 'player',
  });
  state.flags.shelterBuilt = true;

  // Eject the player if a wall appeared under their feet.
  const p = state.player;
  const ptx = Math.floor(p.x / T), pty = Math.floor(p.y / T);
  const inFoot = ptx >= ax && ptx <= ax + 4 && pty >= ay && pty <= ay + 3;
  const inRoom = ptx >= ax + 1 && ptx <= ax + 3 && pty >= ay + 1 && pty <= ay + 2;
  const inDoor = ptx === ax + 2 && pty === ay + 3;
  if (inFoot && !inRoom && !inDoor) { p.x = (ax + 2) * T + 16; p.y = (ay + 3) * T + 20; }
  // The center tile can be clear while the feet box still overlaps a new
  // wall (standing flush against the footprint) — nudge free, or fall back
  // to the doorway.
  if (tiles.blockedPx(p.x, p.y)) {
    const nudges = [[0, -8], [0, -16], [8, 0], [-8, 0], [0, 8], [16, 0], [-16, 0], [0, 16]];
    const spot = nudges.find(([dx, dy]) => !tiles.blockedPx(p.x + dx, p.y + dy));
    if (spot) { p.x += spot[0]; p.y += spot[1]; }
    else { p.x = (ax + 2) * T + 16; p.y = (ay + 3) * T + 20; }
  }

  bus.emit('structure:built', { id, type: 'shelter', ax, ay });
  bus.emit('ui:update', {});
}

export function playerInside(state) {
  const ptx = Math.floor(state.player.x / T), pty = Math.floor(state.player.y / T);
  for (const sh of state.structures) {
    if (ptx >= sh.ax + 1 && ptx <= sh.ax + 3 && pty >= sh.ay + 1 && pty <= sh.ay + 2) return sh;
  }
  return null;
}

// Player is under (or in the doorway of) a shelter's roof — used for roof fade.
export function nearRoof(state, sh) {
  const ptx = Math.floor(state.player.x / T), pty = Math.floor(state.player.y / T);
  return (ptx >= sh.ax + 1 && ptx <= sh.ax + 3 && pty >= sh.ay + 1 && pty <= sh.ay + 2)
    || (ptx === sh.ax + 2 && pty === sh.ay + 3);
}
