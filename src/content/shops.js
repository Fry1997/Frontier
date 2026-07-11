// content/shops — shop definitions (§3 Shop). The first shop is a wandering
// trader's cart parked near the camp; `npcId` is null until Phase 5 gives
// it an owner with a schedule. Prices are in coins; selling pays each
// item's content `value`, buying costs the listed price.

export const SHOPS = {
  'wandering-cart': {
    id: 'wandering-cart',
    name: "MARO'S CART",
    npcId: 'maro', // staffed since Phase 5 — trades only while he's tending
    stock: [
      { itemId: 'turnipSeed', price: 3 },
      { itemId: 'pumpkinSeed', price: 5 },
      { itemId: 'meatCk', price: 8 },
    ],
    buysTags: ['crop', 'food', 'wood', 'mineral', 'pelt'], // raw materials, produce, and whatever the wilds yield
  },
};
