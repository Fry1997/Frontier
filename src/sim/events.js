// sim/events — triggers, effects, resolvable issues (§5). Rolls weighted
// EventDefs on day rollover; active instances live in state.events.active
// (schema EventInstance: { defId, startedDay, data, resolved }) and expire
// if ignored. Resolutions run a choice's effects and file the instance
// into state.events.history.

import { EVENTS } from '../content/events.js';
import { ITEMS } from '../content/items.js';
import * as inv from './inventory.js';
import * as rel from './relationships.js';

const FOODS = ['meatCk', 'turnip', 'pumpkin'];

export function createEvents(rt) {
  function query() {
    const { state } = rt;
    return {
      day: state.time.day,
      season: state.time.season,
      flag: k => !!state.flags[k],
      count: id => inv.count(state, id),
      foodCount: () => FOODS.reduce((n, id) => n + inv.count(state, id), 0),
      rel: npcId => state.relationships[npcId]?.value || 0,
      met: npcId => !!state.relationships[npcId]?.flags.metPlayer,
      chance: p => rt.rng.chance(p),
    };
  }

  function effects() {
    const { state, bus } = rt;
    return {
      addCoins: n => { state.economy.currency = Math.max(0, state.economy.currency + n); },
      addRel: (npcId, n) => rel.addValue(state, npcId, n, bus),
      giveItem: (id, qty) => inv.add(state, id, qty, bus),
      takeItem: (id, qty) => inv.remove(state, id, qty),
      takeFood: n => {
        let left = n;
        for (const id of FOODS) {
          while (left > 0 && inv.remove(state, id, 1)) left--;
        }
      },
      say: str => bus.emit('event:aftermath', { text: str }),
      float: (str, kind) => bus.emit('fx:float', { str, x: state.player.x, y: state.player.y - 56, kind }),
    };
  }

  const lastFired = {}; // defId -> day (cooldowns; derived from history on load)
  for (const h of rt.state.events.history) {
    lastFired[h.defId] = Math.max(lastFired[h.defId] || 0, h.endedDay || 0);
  }

  function rollDay() {
    const { state, bus } = rt;
    // expire stale issues
    for (let i = state.events.active.length - 1; i >= 0; i--) {
      const inst = state.events.active[i];
      const def = EVENTS.find(e => e.id === inst.defId);
      if (def && state.time.day >= inst.startedDay + def.expiresDays) {
        state.events.active.splice(i, 1);
        state.events.history.push({ defId: inst.defId, startedDay: inst.startedDay, endedDay: state.time.day, resolved: 'expired' });
        bus.emit('event:expired', { defId: inst.defId });
      }
    }
    // at most one new issue a day — the world nudges, it doesn't pile on
    if (state.events.active.length >= 2) return;
    const q = query();
    for (const def of EVENTS) {
      if (state.events.active.some(i => i.defId === def.id)) continue;
      if (lastFired[def.id] && state.time.day < lastFired[def.id] + (def.cooldownDays || 4)) continue;
      if (!def.trigger(q)) continue;
      if (!rt.rng.chance(def.weight)) continue;
      start(def.id);
      break;
    }
  }

  function start(defId) {
    const def = EVENTS.find(e => e.id === defId);
    if (!def) return;
    rt.state.events.active.push({ defId, startedDay: rt.state.time.day, data: {}, resolved: null });
    rt.bus.emit('event:started', { defId, title: def.title });
    rt.bus.emit('ui:update', {});
  }

  function resolve(defId, choiceId) {
    const { state, bus } = rt;
    const idx = state.events.active.findIndex(i => i.defId === defId);
    if (idx < 0) return false;
    const def = EVENTS.find(e => e.id === defId);
    const choice = def.choices.find(c => c.id === choiceId);
    if (!choice) return false;
    const q = query();
    if (choice.require && !choice.require(q)) { bus.emit('action:denied', {}); return false; }
    choice.apply(effects(), q);
    state.events.active.splice(idx, 1);
    state.events.history.push({ defId, startedDay: state.time.day, endedDay: state.time.day, resolved: choiceId });
    lastFired[defId] = state.time.day;
    bus.emit('event:resolved', { defId, choiceId });
    bus.emit('ui:update', {});
    return true;
  }

  rt.bus.on('time:dayStart', rollDay);

  return {
    resolve,
    start, // exposed for tests/debug — normal starts come from rollDay
    defFor: defId => EVENTS.find(e => e.id === defId),
    query,
  };
}
