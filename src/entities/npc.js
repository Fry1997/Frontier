// entities/npc — NPC agents (§5: arrivals, routines, activity). Persistent
// NPC records live in state.npcs (schema §3); this module spawns arrivals,
// walks agents to their scheduled places, and handles TALK.
//
// Movement is simple axis-walk with obstacle sliding — enough for the camp;
// pathfinding can land later without changing the seams.

import { NPC_DEFS } from '../content/npcs.js';
import { DIALOGUE } from '../content/dialogue.js';
import * as schedule from './schedule.js';
import * as rel from '../sim/relationships.js';

const T = 32;
const SPEED = 58;
const FOLLOW_SPEED = 96; // companions keep pace

export function createNpcs(rt) {
  // Arrivals: make sure everyone whose day has come exists in state —
  // covers fresh games, loads, and old saves without a migration.
  function ensureArrivals() {
    const { state, bus } = rt;
    for (const def of Object.values(NPC_DEFS)) {
      if (state.time.day < def.arrivesDay) continue;
      if (state.npcs.some(n => n.id === def.id)) continue;
      const pos = schedule.placePos(rt, def, 'home');
      state.npcs.push({
        id: def.id,
        name: def.name,
        kind: def.kind,
        home: { ...def.home },
        x: pos.x,
        y: pos.y,
        schedule: def.schedule,
        activity: 'wander',
        memory: [],
        arc: null,
      });
      bus.emit('npc:arrived', { id: def.id, name: def.name });
    }
  }
  ensureArrivals();
  rt.bus.on('time:dayStart', ensureArrivals);

  // transient per-NPC movement state (never saved)
  const mv = {}; // id -> { tx, ty, pause, slide }

  function isAway(npc) {
    return npc.activity === 'away';
  }

  function update(dt) {
    const { state, tiles } = rt;
    for (const npc of state.npcs) {
      const def = NPC_DEFS[npc.id];
      if (!def) continue;
      const entry = schedule.entryAt(def, state.time.minute);
      npc.activity = entry.goal;
      if (entry.goal === 'away') continue; // off the map

      const m = (mv[npc.id] ||= { tx: npc.x, ty: npc.y, pause: 0, slide: 0, animT: 0, moving: false, dir: 'down' });

      // pick a target
      const anchor = schedule.placePos(rt, def, entry.place);
      if (entry.goal === 'follow') {
        // heel position: far enough behind that only facing him starts a
        // conversation (keeps TALK from shadowing other context actions)
        m.tx = state.player.x - 34;
        m.ty = state.player.y + 14;
      } else if (entry.goal === 'wander') {
        m.pause -= dt;
        if (m.pause <= 0) {
          m.pause = 2 + Math.random() * 4;
          const a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 70;
          m.tx = anchor.x + Math.cos(a) * d;
          m.ty = anchor.y + Math.sin(a) * d;
        }
      } else {
        m.tx = anchor.x;
        m.ty = anchor.y;
      }

      // walk toward the target with axis slide
      const dx = m.tx - npc.x, dy = m.ty - npc.y;
      const dist = Math.hypot(dx, dy);
      const speed = entry.goal === 'follow' ? FOLLOW_SPEED : SPEED;
      m.moving = false;
      if (dist > (entry.goal === 'follow' ? 20 : 6)) {
        const vx = (dx / dist) * speed * dt, vy = (dy / dist) * speed * dt;
        let moved = false;
        if (!tiles.blockedPx(npc.x + vx, npc.y)) { npc.x += vx; moved = true; }
        if (!tiles.blockedPx(npc.x, npc.y + vy)) { npc.y += vy; moved = true; }
        if (!moved) { m.pause = 0.3; m.tx = npc.x; m.ty = npc.y; } // give up; re-pick soon
        else {
          m.moving = true;
          m.animT += dt * 6.5;
          m.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
        }
      }
    }
  }

  // The NPC (if any) close enough to the player's facing point to talk to.
  function talkTarget(px, py) {
    for (const npc of rt.state.npcs) {
      if (isAway(npc)) continue;
      if (Math.hypot(npc.x - px, npc.y - py) < 30) return npc;
    }
    return null;
  }

  // Is this NPC currently at their scheduled post (used for shop hours)?
  function onDuty(npcId, goal) {
    const npc = rt.state.npcs.find(n => n.id === npcId);
    if (!npc) return false;
    const def = NPC_DEFS[npc.id];
    return schedule.entryAt(def, rt.state.time.minute).goal === goal;
  }

  function talk(npc) {
    const { state, bus } = rt;
    const def = NPC_DEFS[npc.id];
    const r = rel.get(state, npc.id);
    const lines = DIALOGUE[def.lines];
    let pool;
    if (!r.flags.metPlayer) {
      r.flags.metPlayer = true;
      pool = lines.meet;
      rel.remember(npc, 'met', state.time.day);
    } else {
      pool = lines[r.tier] || lines.stranger;
    }
    // company counts once a day
    if (!rel.recalls(npc, 'talked', state.time.day)) {
      rel.remember(npc, 'talked', state.time.day);
      rel.addValue(state, npc.id, 2, bus);
    }
    const line = pool[Math.floor(Math.random() * pool.length)];
    bus.emit('npc:talked', { id: npc.id, name: npc.name, line, tier: rel.get(state, npc.id).tier });
    bus.emit('ui:update', {});
  }

  return { update, talkTarget, talk, onDuty, isAway, mv };
}
