// sim/economy — currency, shops, buy/sell (§5 Economy). Shops are content
// (content/shops.js); this module is the generic trade logic. The shop's
// stock list prices what you can buy; anything in your pack whose item def
// carries a tag the shop buys can be sold at its content `value`.

import { SHOPS } from '../content/shops.js';
import { ITEMS } from '../content/items.js';
import * as inv from './inventory.js';

export function getShop(shopId) {
  return SHOPS[shopId] || null;
}

export function sellables(state, shop) {
  return state.inventory.slots.filter(s => {
    const def = ITEMS[s.itemId];
    return def && def.value > 0 && def.tags.some(t => shop.buysTags.includes(t));
  });
}

export function buy(rt, shopId, itemId) {
  const { state, bus } = rt;
  const shop = getShop(shopId);
  const line = shop?.stock.find(l => l.itemId === itemId);
  if (!line) return false;
  if (state.economy.currency < line.price) { bus.emit('action:denied', {}); return false; }
  state.economy.currency -= line.price;
  inv.add(state, itemId, 1);
  bus.emit('shop:bought', { shopId, itemId, price: line.price });
  bus.emit('ui:update', {});
  return true;
}

export function sell(rt, shopId, itemId) {
  const { state, bus } = rt;
  const shop = getShop(shopId);
  const def = ITEMS[itemId];
  if (!shop || !def || !def.tags.some(t => shop.buysTags.includes(t))) return false;
  if (!inv.remove(state, itemId, 1)) return false;
  state.economy.currency += def.value;
  bus.emit('shop:sold', { shopId, itemId, price: def.value });
  bus.emit('ui:update', {});
  return true;
}
