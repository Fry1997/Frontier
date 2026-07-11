// entities/rabbits — ambient critters (the pre-NPC wildlife layer).
// Rabbits are transient: they are NOT saved; a fresh warren spawns from the
// map's spawn points on every game start/load. Killing one drops raw meat
// into the world (which IS state).

import { MAPS } from '../content/maps.js';

const T = 32;

export function createRabbits(rt) {
  const map = MAPS[rt.state.world.baseMapId];
  const spawns = map.rabbitSpawns;
  const list = [];
  for (let i = 0; i < map.rabbitCount; i++) {
    const [sx, sy] = spawns[i % spawns.length];
    list.push(mk(sx * T + 16, sy * T + 16));
  }

  function mk(x, y) {
    return { x, y, vx: 0, vy: 0, state: 'sit', t: 1 + Math.random() * 2, hopT: 0, face: 1, alive: true, rt: 0 };
  }

  function kill(r) {
    if (!r.alive) return;
    r.alive = false;
    r.rt = 24;
    rt.state.world.drops.push({ kind: 'meatRaw', x: r.x, y: r.y, pop: true });
    rt.bus.emit('rabbit:killed', { x: r.x, y: r.y });
  }

  function respawn(r) {
    const p = rt.state.player;
    for (let tries = 0; tries < 10; tries++) {
      const s = spawns[Math.floor(Math.random() * spawns.length)];
      const x = s[0] * T + 16, y = s[1] * T + 16;
      if (Math.hypot(x - p.x, y - p.y) > 160 && !rt.tiles.blockedPx(x, y)) {
        r.x = x; r.y = y; r.alive = true; r.state = 'sit'; r.t = 1;
        rt.bus.emit('rabbit:spawned', { x, y });
        return;
      }
    }
    r.rt = 5;
  }

  function update(dt) {
    const p = rt.state.player;
    for (const r of list) {
      if (!r.alive) { r.rt -= dt; if (r.rt <= 0) respawn(r); continue; }
      const pd = Math.hypot(p.x - r.x, p.y - r.y);
      if (pd < 78 && r.state !== 'flee') {
        r.state = 'flee'; r.t = 0;
        if (Math.random() < 0.6) rt.bus.emit('rabbit:startled', {});
      }
      if (r.state === 'sit') {
        r.t -= dt;
        if (r.t <= 0) {
          const a = Math.random() * Math.PI * 2;
          r.vx = Math.cos(a) * 42; r.vy = Math.sin(a) * 42;
          r.state = 'hop'; r.t = 0.5 + Math.random() * 0.7;
        }
      } else {
        if (r.state === 'flee') {
          if (pd > 150) { r.state = 'sit'; r.t = 1 + Math.random() * 2; r.vx = 0; r.vy = 0; }
          else { const a = Math.atan2(r.y - p.y, r.x - p.x); r.vx = Math.cos(a) * 96; r.vy = Math.sin(a) * 96; }
        } else {
          r.t -= dt;
          if (r.t <= 0) { r.state = 'sit'; r.t = 0.8 + Math.random() * 2.2; r.vx = 0; r.vy = 0; }
        }
        r.hopT += dt * 9;
        const nx = r.x + r.vx * dt, ny = r.y + r.vy * dt;
        if (!rt.tiles.blockedPx(nx, r.y)) r.x = nx; else r.vx *= -1;
        if (!rt.tiles.blockedPx(r.x, ny)) r.y = ny; else r.vy *= -1;
        if (r.vx !== 0) r.face = r.vx > 0 ? 1 : -1;
      }
    }
  }

  return { list, update, kill };
}
