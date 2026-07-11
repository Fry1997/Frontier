// sim/quests — advances the onboarding chain. Quest predicates read state
// through a small query facade so content stays declarative. Checked on a
// short interval; side effects (waking the needs meters, the finale) are
// announced on the bus and handled by whoever cares (fx, ui, audio).

import { QUESTS } from '../content/quests.js';
import * as inv from './inventory.js';
import * as needs from './needs.js';

const CHECK_EVERY = 0.2; // seconds

export function createQuests(rt) {
  const lastQ = QUESTS.length - 1;
  let checkT = 0;

  function query() {
    const { state } = rt;
    return {
      count: id => inv.count(state, id),
      total: id => state.totals[id] || 0,
      flag: k => !!state.flags[k],
      hasTool: t => inv.hasTool(state, t),
    };
  }

  function check() {
    const { state, bus } = rt;
    const q = query();
    let advanced = false;
    while (state.quest.stage < lastQ && QUESTS[state.quest.stage].done(q)) {
      state.quest.stage++;
      advanced = true;
      if (state.quest.stage === 4 && !state.flags.metersOn) {
        needs.enableMeters(state);
        bus.emit('fx:float', { str: 'YOU FEEL HUNGRY...', x: state.player.x, y: state.player.y - 60, kind: 'accent' });
      }
      if (state.quest.stage === lastQ) bus.emit('quest:finale', {});
    }
    if (advanced) {
      bus.emit('quest:advanced', { stage: state.quest.stage });
      bus.emit('ui:update', {});
    }
  }

  function update(dt) {
    checkT -= dt;
    if (checkT <= 0) { checkT = CHECK_EVERY; check(); }
  }

  return { update, check, questText: stage => QUESTS[Math.min(stage, lastQ)].text, lastStage: lastQ };
}
