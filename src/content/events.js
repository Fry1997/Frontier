// content/events — declarative event definitions (§3 EventDef, §5 Events &
// issues). Weighted defs roll on day rollover; triggers and choice
// requirements read a small query facade `q`, and choice effects run
// against an effect facade `fx` (sim/events.js builds both). This system +
// the NPCs is the main non-repetition engine of the game.
//
// Shape: { id, title, body, trigger(q), weight, expiresDays, cooldownDays,
//          choices: [{ id, label, require?(q), apply(fx, q) }] }

export const EVENTS = [
  {
    id: 'maro-short',
    title: "MARO'S STORES RUN LOW",
    body: 'MARO WAVES YOU OVER. "SUPPLY CART\'S LATE. I\'M OUT OF FOOD TO SELL — AND NEARLY OUT TO EAT. COULD YOU SPARE SOME?"',
    trigger: q => q.met('maro'),
    weight: 0.3,
    expiresDays: 2,
    cooldownDays: 6,
    choices: [
      {
        id: 'give',
        label: 'GIVE 3 FOOD',
        require: q => q.foodCount() >= 3,
        apply: fx => { fx.takeFood(3); fx.addRel('maro', 6); fx.say('"I WON\'T FORGET THIS. TRULY."'); },
      },
      {
        id: 'sell',
        label: 'SELL AT A PREMIUM (+12c)',
        require: q => q.foodCount() >= 3,
        apply: fx => { fx.takeFood(3); fx.addCoins(12); fx.addRel('maro', 2); fx.say('"STEEP. BUT FAIR, I SUPPOSE."'); },
      },
      {
        id: 'ignore',
        label: 'NOT MY PROBLEM',
        apply: fx => { fx.addRel('maro', -1); fx.say('MARO NODS SLOWLY AND TURNS AWAY.'); },
      },
    ],
  },
  {
    id: 'camp-dispute',
    title: 'A QUARREL BY THE CART',
    body: 'MARO AND WREN ARE ARGUING — WREN KEEPS CAMPING IN FRONT OF THE CART, AND MARO SAYS SHE\'S SCARING OFF TRADE. BOTH LOOK AT YOU.',
    trigger: q => q.met('maro') && q.met('wren') && q.day >= 3,
    weight: 0.25,
    expiresDays: 2,
    cooldownDays: 8,
    choices: [
      {
        id: 'maro',
        label: 'SIDE WITH MARO',
        apply: fx => { fx.addRel('maro', 4); fx.addRel('wren', -3); fx.say('WREN SHRUGS AND DRAGS HER BEDROLL EAST.'); },
      },
      {
        id: 'wren',
        label: 'SIDE WITH WREN',
        apply: fx => { fx.addRel('wren', 4); fx.addRel('maro', -3); fx.say('"HMPH. TRADE\'S SLOW ANYWAY," MARO MUTTERS.'); },
      },
      {
        id: 'mediate',
        label: 'SUGGEST A SPOT FOR BOTH',
        require: q => q.rel('maro') >= 4 && q.rel('wren') >= 4,
        apply: fx => { fx.addRel('maro', 2); fx.addRel('wren', 2); fx.say('A GRUMBLED TRUCE. THEY BOTH OWE YOU ONE.'); },
      },
    ],
  },
  {
    // The first landmark encounter (§5: the cloaked traveller — fortune OR
    // trouble). Threats hurt or steal, never annihilate.
    id: 'cloaked-traveller',
    title: 'A CLOAKED FIGURE AT YOUR FIRE',
    body: 'YOU WAKE TO A STRANGER WARMING THEIR HANDS AT YOUR FIRE. THEY DON\'T LOOK UP. "SIT. I\'LL READ THE EMBERS FOR YOU — IF YOU DARE."',
    trigger: q => q.day >= 4 && q.flag('fire'),
    weight: 0.2,
    expiresDays: 1,
    cooldownDays: 10,
    choices: [
      {
        id: 'listen',
        label: 'HEAR THE FORTUNE',
        apply: (fx, q) => {
          if (q.chance(0.7)) {
            fx.addCoins(8);
            fx.say('"THE EMBERS LIKE YOU." THEY PRESS COINS INTO YOUR PALM AND ARE GONE.');
          } else {
            fx.addCoins(-2);
            fx.say('WHEN THEY LEAVE, YOUR POUCH IS LIGHTER. TROUBLE, THEN.');
          }
        },
      },
      {
        id: 'refuse',
        label: 'TURN THEM AWAY',
        apply: fx => { fx.say('THEY RISE WITHOUT A WORD. THE FIRE BURNS A LITTLE COLDER.'); },
      },
    ],
  },
];
