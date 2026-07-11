// content/dialogue — data-driven lines keyed by npc + relationship tier
// (§5: dialogue keyed by tier + memory + arc state). `meet` plays on the
// very first conversation; after that, lines come from the current tier.

export const DIALOGUE = {
  maro: {
    meet: [
      "NEW FACE! I'M MARO. THE CART'S MINE — BEST PRICES IN... WELL, THE ONLY PRICES.",
    ],
    stranger: [
      'FINE MORNING FOR TRADE.',
      'TURNIP SEEDS. CHEAP. YOUR SOIL IS BEGGING.',
      'I HEAR THE ROCKS EAST SIDE ARE FULL OF GOOD STONE.',
    ],
    acquaintance: [
      'AH, MY BEST CUSTOMER!',
      'THE ROAD GETS LONELY. GOOD TO SEE A CAMP GROWING HERE.',
      'PUMPKINS SELL HIGH. JUST SAYING.',
    ],
    friend: [
      'FOR YOU? I SHOULD START A FRIENDS DISCOUNT. SHOULD.',
      'YOU KNOW, I ALMOST SETTLED DOWN ONCE. PLACE LIKE THIS, MAYBE.',
    ],
  },
  merlin: {
    meet: [
      'AN OLD MAN LOOKS UP FROM THE MOSS. "AH. THERE YOU ARE, ARTHUR. NO — DON\'T ASK HOW I KNOW. I\'M MERLIN. I\'LL BE STAYING."',
    ],
    stranger: [
      '"THE WOOD REMEMBERS EVERY AXE. BE POLITE TO IT."',
      '"MAGIC? MAGIC IS JUST PATIENCE WITH BETTER MANNERS."',
      '"KEEP TALKING TO ME. THE BOND MATTERS MORE THAN YOU KNOW."',
    ],
    acquaintance: [
      '"YOU\'VE NOTICED MY LITTLE LIGHT, THEN? YOU\'RE WELCOME. THE DARK IS RUDER THAN IT USED TO BE."',
      '"THE EMBERS SPOKE OF A DRAGON, WEST OF EVERYTHING. LATER. YOU\'RE NOT READY."',
      '"A KEEP, ONE DAY. STONE ON STONE. I\'VE SEEN IT."',
    ],
    friend: [
      '"WALK WITH ME AND THE ROAD WILL CARRY YOU QUICKER. OLD TRICK. GOOD TRICK."',
      '"WHEN THE RAIDERS COME — AND THEY WILL — I\'LL BE BESIDE YOU. NOT INSTEAD OF YOU. BESIDE YOU."',
    ],
  },
  wren: {
    meet: [
      "OH! DIDN'T SEE YOU. I'M WREN — JUST PASSING THROUGH. PROBABLY.",
    ],
    stranger: [
      'THE FOREST PATHS SHIFT WHEN YOU DON\'T LOOK. I SWEAR IT.',
      'I WALK EVERYWHERE. IT\'S CHEAPER THAN THINKING.',
      'SAW A LIGHT IN THE HILLS LAST NIGHT. TOO BIG FOR A CAMPFIRE.',
    ],
    acquaintance: [
      'YOU AGAIN! GOOD. I WAS RUNNING OUT OF TREES TO TALK TO.',
      'YOUR LITTLE HOME LOOKS WARM. I NOTICE THESE THINGS.',
      'SOMEDAY I\'LL TELL YOU WHY I KEEP MOVING. NOT TODAY.',
    ],
    friend: [
      'I CIRCLE BACK HERE MORE THAN ANYWHERE. YOUR FAULT, PROBABLY.',
      'IF I EVER STOP WANDERING... SAVE ME A PATCH OF DIRT, YEAH?',
    ],
  },
};
