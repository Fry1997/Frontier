// sim/dragon — the dragon (§5): a neighbour, not a boss. Lives in a cave
// deep in the Darkwood. Meeting it opens the dragon-forge; feeding it every
// few days yields DRAGON-FIRE, the arcane fuel for higher-tier crafting.
// The bond is a relationship record like any neighbour's — because that's
// what the dragon is.

import * as inv from './inventory.js';
import * as rel from './relationships.js';

const FEED_COST = 2;          // cooked food per offering
const FEED_COOLDOWN_DAYS = 3; // it hunts for itself in between
const FOODS = ['meatCk', 'pumpkin', 'turnip'];

function foodCount(state) {
  return FOODS.reduce((n, id) => n + inv.count(state, id), 0);
}

function canOffer(state) {
  const r = rel.get(state, 'dragon');
  const last = r.flags.lastGiftDay || -99;
  return state.time.day >= last + FEED_COOLDOWN_DAYS && foodCount(state) >= FEED_COST;
}

// What the action button reads at the cave mouth.
export function actionFor(rt) {
  const { state } = rt;
  if (!state.flags.dragonMet) return { k: 'dragon', label: 'ENTER' };
  if (canOffer(state)) return { k: 'dragon', label: 'OFFER FOOD' };
  return { k: 'dragon', label: 'VISIT' };
}

export function visit(rt) {
  const { state, bus } = rt;
  if (!state.flags.dragonMet) {
    state.flags.dragonMet = true;
    rel.get(state, 'dragon').flags.metPlayer = true;
    bus.emit('dragon:met', {});
    bus.emit('event:aftermath', {
      text: 'THE DARK OF THE CAVE BREATHES. TWO GOLD EYES OPEN, EACH THE SIZE OF A SHIELD. "SMALL THING," IT RUMBLES, "YOU SMELL OF WOODSMOKE AND STUBBORNNESS. I LIKE THAT. BRING ME COOKED MEAT SOMETIME — AND I WILL SHARE MY FIRE."',
    });
    bus.emit('ui:update', {});
    return;
  }
  if (canOffer(state)) {
    let left = FEED_COST;
    for (const id of FOODS) {
      while (left > 0 && inv.remove(state, id, 1)) left--;
    }
    const r = rel.addValue(state, 'dragon', 3, bus);
    r.flags.lastGiftDay = state.time.day;
    inv.add(state, 'dragonfire', 1, bus);
    bus.emit('dragon:gift', { day: state.time.day });
    bus.emit('event:aftermath', {
      text: 'THE DRAGON SWALLOWS YOUR OFFERING WHOLE, CONSIDERS, AND BREATHES A THIN RIBBON OF FLAME INTO YOUR OUTSTRETCHED FLASK. IT CURLS THERE, ALIVE. "FEED THE FORGE," IT SAYS. "AND COME BACK."',
    });
    bus.emit('ui:update', {});
    return;
  }
  bus.emit('event:aftermath', {
    text: 'THE DRAGON IS A MOUNTAIN OF SLOW BREATHING. ONE EYE OPENS A SLIVER. "LATER, SMALL THING. BRING FOOD, AND GIVE ME A FEW DAYS BETWEEN COURSES."',
  });
}
