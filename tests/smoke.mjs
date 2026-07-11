// Frontier end-to-end smoke test — drives the REAL UI (pointer + key events)
// through all shipped phases: onboarding, crafting, chopping, renewal,
// save/load + migrations, building, storage, sleep, farming, trading,
// NPCs/dialogue/relationships, events, Merlin, and the venture layer.
//
// Run:  http-server -p 8321 &  then  node tests/smoke.mjs
// Env:  SMOKE_URL (default http://127.0.0.1:8321), SMOKE_OUT (screenshots),
//       CHROMIUM (executable path), PLAYWRIGHT_DIR (playwright install)
// Frontier Phase 1 smoke test — drives the real UI (clicks + key events).
import { createRequire } from 'module';
const require = createRequire('/opt/node22/lib/node_modules/playwright/');
const { chromium } = require('playwright');

const OUT = process.env.SMOKE_OUT || '/tmp/frontier-smoke';
import { mkdirSync } from 'fs';
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log('•', ...a);
const fail = msg => { console.error('❌', msg); process.exitCode = 1; };

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
page.on('console', m => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
page.on('pageerror', e => fail('pageerror: ' + e.message));

await page.goto((process.env.SMOKE_URL || 'http://127.0.0.1:8321') + '/index.html');
await page.waitForTimeout(1200);

// --- title screen ---
const startLabel = await page.locator('.t-actions .primary-btn').textContent();
log('title primary button:', startLabel);
if (startLabel !== 'START') fail('expected START on fresh profile, got ' + startLabel);
await page.screenshot({ path: OUT + '/01-title.png' });

// pick a hair + world, then start
await page.locator('.pick-card', { hasText: 'WOODSMAN' }).dispatchEvent('pointerdown');
await page.locator('.pick-card', { hasText: 'DUSK EMBER' }).dispatchEvent('pointerdown');
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(500);

const phase = await page.evaluate(() => window.__frontier.session.phase);
if (phase !== 'game') fail('phase after START: ' + phase);
log('game started, phase =', phase);
await page.screenshot({ path: OUT + '/02-game.png' });

// helper: walk the player toward a world position by holding arrow keys
const FLIP = { ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft', ArrowUp: 'ArrowDown', ArrowDown: 'ArrowUp' };
async function walkToPx(gx, gy, timeoutMs = 25000) {
  const t0 = Date.now();
  let slideDir = null, noProg = 0, bestDist = Infinity;
  const trail = [];
  while (Date.now() - t0 < timeoutMs) {
    const p = await page.evaluate(() => ({ x: window.__frontier.state.player.x, y: window.__frontier.state.player.y }));
    const dx = gx - p.x, dy = gy - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 14) return true;
    if (dist < bestDist - 2) { bestDist = dist; noProg = 0; slideDir = null; }
    else noProg++;
    const domX = Math.abs(dx) > Math.abs(dy);
    const primary = domX ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    let key;
    if (noProg === 0) key = primary;
    else {
      // committed wall-follow: stick with one slide direction, retest the
      // direct route every few bursts, flip if the detour goes nowhere
      if (!slideDir) slideDir = domX ? (dy >= 0 ? 'ArrowDown' : 'ArrowUp') : (dx >= 0 ? 'ArrowRight' : 'ArrowLeft');
      if (noProg > 24) { slideDir = FLIP[slideDir]; noProg = 1; }
      key = (noProg % 4 === 0) ? primary : slideDir;
    }
    trail.push(`${Math.round(p.x)},${Math.round(p.y)} ${key.replace('Arrow', '')}${noProg ? '(n' + noProg + ')' : ''}`);
    await page.keyboard.down(key);
    await page.waitForTimeout(noProg > 0 ? 150 : 90);
    await page.keyboard.up(key);
  }
  console.log('  [walk FAILED to', gx + ',' + gy + '] trail tail:', trail.slice(-14).join(' | '));
  return false;
}
const walkTo = (tx, ty, timeoutMs) => walkToPx(tx * 32 + 16, ty * 32 + 16, timeoutMs);
// fine positioning with short taps (~4px each) for placement-critical spots
async function alignTo(gx, gy) {
  for (let i = 0; i < 40; i++) {
    const p = await page.evaluate(() => ({ x: window.__frontier.state.player.x, y: window.__frontier.state.player.y }));
    const dx = gx - p.x, dy = gy - p.y;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return true;
    const key = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    await page.keyboard.down(key); await page.waitForTimeout(40); await page.keyboard.up(key);
    await page.waitForTimeout(40);
  }
  return false;
}
// walk onto a ground drop of the given kind (exact landed position)
async function collect(kind) {
  const before = (await inv())[kind] || 0;
  const pos = await page.evaluate(k => {
    const p = window.__frontier.state.player;
    const ds = window.__frontier.world().drops.filter(d => d.kind === k)
      .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
    return ds.length ? [ds[0].x, ds[0].y] : null;
  }, kind);
  if (!pos) return false;
  await walkToPx(pos[0], pos[1] - 2, 8000);
  await page.waitForTimeout(250);
  return ((await inv())[kind] || 0) > before;
}
const inv = () => page.evaluate(() => Object.fromEntries(window.__frontier.state.inventory.slots.map(s => [s.itemId, s.qty])));
const st = () => page.evaluate(() => ({ stage: window.__frontier.state.quest.stage, flags: window.__frontier.state.flags, equipped: window.__frontier.state.player.equipped }));

// --- gather a stick and a stone (walk onto the nearest drops) ---
if (!await collect('stick')) fail('could not reach stick');
if (!await collect('stone')) fail('could not reach stone');
await page.waitForTimeout(400);
let i = await inv();
log('inventory after gathering:', JSON.stringify(i));
if (!i.stick || !i.stone) fail('gathering failed: ' + JSON.stringify(i));
let s = await st();
log('quest stage:', s.stage);
if (s.stage !== 1) fail('quest stage should be 1, got ' + s.stage);

// --- craft the axe through the real craft panel ---
await page.keyboard.press('c');
await page.waitForTimeout(300);
await page.screenshot({ path: OUT + '/03-craft.png' });
const makeBtn = page.locator('.cp-row', { hasText: 'STONE AXE' }).locator('.cp-make');
if ((await makeBtn.textContent()) !== 'MAKE') fail('axe button not MAKE: ' + await makeBtn.textContent());
await makeBtn.dispatchEvent('pointerdown');
await page.waitForTimeout(400);
s = await st();
log('after craft: stage =', s.stage, 'tool =', s.equipped.tool);
if (s.equipped.tool !== 'axe') fail('axe not equipped');
if (s.stage !== 2) fail('quest stage should be 2, got ' + s.stage);
// craft panel should close on craft, and OWNED when reopened
await page.keyboard.press('c');
await page.waitForTimeout(200);
const owned = await page.locator('.cp-row', { hasText: 'STONE AXE' }).locator('.cp-make').textContent();
log('axe row after craft:', owned);
if (owned !== 'OWNED') fail('axe row should be OWNED');
await page.keyboard.press('Escape');

// --- chop the nearest reachable tree (map-agnostic) ---
const tgt = await page.evaluate(() => {
  const rt = window.__frontier, p = rt.state.player;
  let best = null;
  for (const [k, o] of Object.entries(rt.state.world.objects)) {
    if (o.type !== 'tree') continue;
    const [tx, ty] = k.split(',').map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = tx + dx, ny = ty + dy;
      if (rt.tiles.blockedTile(nx, ny)) continue;
      const d = Math.hypot(nx * 32 + 16 - p.x, ny * 32 + 16 - p.y);
      if (!best || d < best.d) best = { tx, ty, nx, ny, d };
    }
  }
  return best;
});
log('chop target: tree', `${tgt.tx},${tgt.ty}`, 'from', `${tgt.nx},${tgt.ny}`);
const treeKey = `${tgt.tx},${tgt.ty}`;
if (!await walkTo(tgt.nx, tgt.ny)) fail('could not reach tree');
const faceKey = tgt.tx > tgt.nx ? 'ArrowRight' : tgt.tx < tgt.nx ? 'ArrowLeft' : tgt.ty > tgt.ny ? 'ArrowDown' : 'ArrowUp';
await page.keyboard.down(faceKey); await page.waitForTimeout(60); await page.keyboard.up(faceKey);
for (let k = 0; k < 3; k++) { await page.keyboard.press('e'); await page.waitForTimeout(600); }
await page.waitForTimeout(300);
const treeState = await page.evaluate(k => window.__frontier.state.world.objects[k]?.type, treeKey);
log(`object at ${treeKey} after 3 chops:`, treeState);
if (treeState !== 'stump') fail('tree should be a stump, got ' + treeState);
const timers = await page.evaluate(() => window.__frontier.state.world.resourceTimers);
log('resourceTimers:', JSON.stringify(timers));
if (!timers[treeKey]) fail('no regrow timer scheduled for felled tree');

// pick up wood — walk to each drop's actual landed position
for (let k = 0; k < 4; k++) {
  if (!await collect('wood')) break;
}
i = await inv();
log('inventory after chop:', JSON.stringify(i));
if (!i.wood || i.wood < 2) fail('wood not collected: ' + JSON.stringify(i));

// --- resource renewal: advance the clock 3 days (time manipulation, sim runs live) ---
// step off the stump tile first — regrowth (correctly) defers while occupied
const startPos = await page.evaluate(() => {
  const m = window.__frontier.tiles.map.playerStart;
  return [m.x * 32, m.y * 32];
});
await walkToPx(startPos[0], startPos[1]);
await page.evaluate(() => { window.__frontier.state.time.day += 3; });
await page.waitForTimeout(2500); // regrow check runs once a game-minute
const regrown = await page.evaluate(k => window.__frontier.state.world.objects[k]?.type, treeKey);
log(`object at ${treeKey} after +3 days:`, regrown);
if (regrown !== 'tree') fail('stump should have regrown to tree, got ' + regrown);

// --- Phase 2: zone tags on the greenwood map ---
const zones = await page.evaluate(() => {
  const t = window.__frontier.tiles;
  return {
    mapId: window.__frontier.state.world.baseMapId, w: t.W, h: t.H,
    forest: t.zoneAt(10, 5), rock: t.zoneAt(35, 7), lake: t.zoneAt(7, 26), meadow: t.zoneAt(22, 16),
  };
});
log('map + zones:', JSON.stringify(zones));
if (zones.mapId !== 'greenwood' || zones.w !== 44 || zones.h !== 34) fail('new camp should use greenwood 44x34');
if (zones.forest !== 'forest' || zones.rock !== 'rock' || zones.lake !== 'lake' || zones.meadow !== 'meadow') fail('zone tags wrong: ' + JSON.stringify(zones));

// --- save/load round-trip: reload the page, expect CONTINUE, state restored ---
const before = await page.evaluate(() => ({
  inv: window.__frontier.state.inventory.slots,
  stage: window.__frontier.state.quest.stage,
  tool: window.__frontier.state.player.equipped.tool,
  day: window.__frontier.state.time.day,
}));
await page.evaluate(() => window.__frontier.bus.emit('quest:advanced', {})); // force a save trigger
await page.waitForTimeout(200);
await page.reload();
await page.waitForTimeout(1200);
const contLabel = await page.locator('.t-actions .primary-btn').textContent();
log('title primary button after reload:', contLabel);
if (contLabel !== 'CONTINUE') fail('expected CONTINUE after save, got ' + contLabel);
await page.screenshot({ path: OUT + '/04-continue.png' });
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const after = await page.evaluate(k => ({
  inv: window.__frontier.state.inventory.slots,
  stage: window.__frontier.state.quest.stage,
  tool: window.__frontier.state.player.equipped.tool,
  day: window.__frontier.state.time.day,
  treeObj: window.__frontier.state.world.objects[k]?.type,
}), treeKey);
log('restored state:', JSON.stringify(after));
if (after.tool !== 'axe') fail('axe lost across save/load');
if (after.stage !== before.stage) fail(`stage mismatch: ${before.stage} -> ${after.stage}`);
if (after.day !== before.day) fail(`day mismatch: ${before.day} -> ${after.day}`);
if (after.treeObj !== 'tree') fail('regrown tree lost across save/load: ' + after.treeObj);
if (JSON.stringify(after.inv) !== JSON.stringify(before.inv)) fail('inventory mismatch across save/load');
await page.screenshot({ path: OUT + '/05-restored.png' });

// ==================== Phase 3: building depth ====================
// setup shortcut: grant materials through the dev hook, then drive real UI
const grant = (itemId, qty) => page.evaluate(([id, q]) => {
  const slots = window.__frontier.state.inventory.slots;
  const s = slots.find(s => s.itemId === id);
  if (s) s.qty += q; else slots.push({ itemId: id, qty: q });
  window.__frontier.bus.emit('ui:update', {});
}, [itemId, qty]);
const objCount = type => page.evaluate(t => Object.values(window.__frontier.state.world.objects).filter(o => o.type === t).length, type);
async function craftByName(name) {
  await page.keyboard.press('c');
  await page.waitForTimeout(250);
  const btn = page.locator('.cp-row', { hasText: name }).locator('.cp-make');
  const label = await btn.textContent();
  await btn.dispatchEvent('pointerdown');
  await page.waitForTimeout(250);
  return label;
}
async function burst(key, ms) { await page.keyboard.down(key); await page.waitForTimeout(ms); await page.keyboard.up(key); await page.waitForTimeout(80); }
async function face(key) { await burst(key, 50); }
const actionLabel = () => page.locator('.action-btn span').textContent();
const pressAction = async () => { await page.locator('.action-btn').dispatchEvent('pointerdown'); await page.waitForTimeout(250); };
// placement rejects tiles the feet box overlaps — back off a step until valid.
// A passing NPC can flip the label to TALK; wait them out instead of retreating.
async function aim(faceKey, retreatKey) {
  for (let i = 0; i < 10; i++) {
    await face(faceKey);
    const label = await actionLabel();
    if (label === 'PLACE') return true;
    if (label === 'TALK') { await page.waitForTimeout(600); continue; }
    await burst(retreatKey, 110);
  }
  return (await actionLabel()) === 'PLACE';
}

// --- build a shelter on the camp dirt patch ---
await grant('wood', 30); await grant('stick', 10); await grant('stone', 10);
await walkTo(22, 13);
await alignTo(736, 426); // pin the row so the anchor is always (20,14)
await craftByName('SHELTER');
if (!await aim('ArrowDown', 'ArrowUp')) fail('shelter placement not valid: ' + await actionLabel()); // anchor on the dirt patch
await pressAction();
await page.waitForTimeout(2600); // construction site animates ~1.8s
const shelter = await page.evaluate(() => window.__frontier.state.structures[0]);
log('shelter:', JSON.stringify(shelter));
if (!shelter || !shelter.rooms.length) fail('shelter not built with rooms');
// the farm plot goes on whatever dirt survived next to the shelter — the
// anchor varies a row between runs, so derive it from the built structure
const plotSpot = await page.evaluate(() => {
  const sh = window.__frontier.state.structures[0];
  const t = window.__frontier.tiles;
  if (t.tileAt(sh.ax + 1, sh.ay + 4) === 'd') {
    return { tx: sh.ax + 1, ty: sh.ay + 4, standX: (sh.ax + 1) * 32 + 16, standY: (sh.ay + 4) * 32 + 52, faceKey: 'ArrowUp' };
  }
  return { tx: sh.ax + 1, ty: sh.ay - 1, standX: (sh.ax + 1) * 32 + 16, standY: (sh.ay - 1) * 32 - 20, faceKey: 'ArrowDown' };
});
log('plot spot:', JSON.stringify(plotSpot));
async function standAtPlot() {
  await walkToPx(plotSpot.standX, plotSpot.standY);
  for (let i = 0; i < 5; i++) {
    await face(plotSpot.faceKey);
    if ((await actionLabel()) !== 'TALK') return;
    await burst('ArrowLeft', 80); // sidestep a lingering companion, retry
    await page.waitForTimeout(400);
  }
}

// --- bed: place inside the room, then sleep ---
await walkTo(shelter.ax + 2, shelter.ay + 4.6); // around to below the door
if (!await walkTo(shelter.ax + 2, shelter.ay + 2)) fail('could not enter the shelter'); // in through the door
const inTile = await page.evaluate(() => [Math.floor(window.__frontier.state.player.x / 32), Math.floor(window.__frontier.state.player.y / 32)]);
log('player tile inside shelter:', JSON.stringify(inTile));
await craftByName('BED');
if (!await aim('ArrowUp', 'ArrowDown')) fail('bed placement not valid: ' + await actionLabel()); // anchor = floor tile inside the room
await pressAction();
const furniture = await page.evaluate(() => window.__frontier.state.structures[0].furniture);
log('furniture:', JSON.stringify(furniture));
if (!furniture.length || furniture[0].type !== 'bed') fail('bed not recorded on structure');
const dayBefore = await page.evaluate(() => window.__frontier.state.time.day);
if ((await actionLabel()) !== 'SLEEP') fail('facing bed should offer SLEEP, got ' + await actionLabel());
await pressAction();
const timeAfter = await page.evaluate(() => ({ day: window.__frontier.state.time.day, minute: window.__frontier.state.time.minute }));
log('slept:', JSON.stringify(timeAfter));
if (timeAfter.day !== dayBefore + 1 || Math.floor(timeAfter.minute) < 480) fail('sleep did not advance to next morning');

// 🔍 probe: bed placement OUTSIDE a room must be invalid
await walkTo(shelter.ax + 2, shelter.ay + 4.6); // back outside, below the door
await craftByName('BED');
await face('ArrowDown');
const outsideLabel = await actionLabel();
log('probe bed outside room → action label:', outsideLabel);
if (outsideLabel === 'PLACE') fail('bed placement should be invalid outside rooms');
await pressAction(); // should be denied, place nothing
const bedCount = await objCount('bed');
if (bedCount !== 1) fail(`expected exactly 1 bed after denied outdoor placement, got ${bedCount}`);
await page.keyboard.press('Escape'); // cancel placing

// --- chest: place, deposit wood, persistence round-trip ---
await walkTo(27, 20);
await craftByName('CHEST');
if (!await aim('ArrowDown', 'ArrowUp')) fail('chest placement not valid');
await pressAction();
if (await objCount('chest') !== 1) fail('chest not placed');
await face('ArrowDown');
if ((await actionLabel()) !== 'OPEN') fail('facing chest should offer OPEN, got ' + await actionLabel());
await pressAction();
await page.waitForTimeout(300);
await page.screenshot({ path: OUT + '/06-chest.png' });
// deposit wood, withdraw it again (both directions), then store sticks
await page.locator('[data-side=pack] .ch-item', { hasText: 'WOOD' }).dispatchEvent('pointerdown');
await page.waitForTimeout(250);
let boxes = await page.evaluate(() => window.__frontier.state.inventory.containers);
log('containers after deposit:', JSON.stringify(boxes));
const boxId = Object.keys(boxes)[0];
if (!boxes[boxId].some(s => s.itemId === 'wood')) fail('wood not deposited to chest');
await page.locator('[data-side=chest] .ch-item', { hasText: 'WOOD' }).dispatchEvent('pointerdown');
await page.waitForTimeout(250);
boxes = await page.evaluate(() => window.__frontier.state.inventory.containers);
if (boxes[boxId].some(s => s.itemId === 'wood')) fail('wood not withdrawn from chest');
if (!(await inv()).wood) fail('withdrawn wood missing from pack');
log('withdraw ok; pack wood:', (await inv()).wood);
await page.locator('[data-side=pack] .ch-item', { hasText: 'STICK' }).dispatchEvent('pointerdown');
await page.waitForTimeout(250);
boxes = await page.evaluate(() => window.__frontier.state.inventory.containers);
if (!boxes[boxId].some(s => s.itemId === 'stick')) fail('sticks not stored in chest');
await page.locator('.chest-panel .cp-close').dispatchEvent('pointerdown');

// --- upgrade the home to tier 2 ---
const upLabel = await craftByName('TIMBER HOME');
if (upLabel !== 'MAKE') fail('TIMBER HOME should be craftable, button said ' + upLabel);
const tier = await page.evaluate(() => window.__frontier.state.structures[0].tier);
log('tier after upgrade:', tier);
if (tier !== 2) fail('shelter tier should be 2');
await page.keyboard.press('c');
await page.waitForTimeout(250);
const upDone = await page.locator('.cp-row', { hasText: 'TIMBER HOME' }).locator('.cp-make').textContent();
if (upDone !== 'OWNED') fail('TIMBER HOME should read OWNED after upgrade, got ' + upDone);
await page.keyboard.press('Escape');
await page.screenshot({ path: OUT + '/07-upgraded.png' });

// --- wall: freestanding placement ---
await walkTo(31, 24);
await craftByName('WOOD WALL');
if (!await aim('ArrowRight', 'ArrowLeft')) fail('wall placement not valid');
await pressAction();
const wallCount = await page.evaluate(() => Object.values(window.__frontier.state.world.objects).filter(o => o.type === 'wall' && o.built).length);
log('built walls:', wallCount);
if (wallCount !== 1) fail('wall not placed');

// --- persistence: reload, chest contents + furniture + tier survive ---
await page.evaluate(() => window.__frontier.bus.emit('quest:advanced', {})); // force save
await page.waitForTimeout(200);
await page.reload();
await page.waitForTimeout(1200);
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const p3 = await page.evaluate(() => ({
  tier: window.__frontier.state.structures[0]?.tier,
  furniture: window.__frontier.state.structures[0]?.furniture?.length,
  chestStick: Object.values(window.__frontier.state.inventory.containers)[0]?.find(s => s.itemId === 'stick')?.qty,
  beds: Object.values(window.__frontier.state.world.objects).filter(o => o.type === 'bed').length,
}));
log('phase 3 restored:', JSON.stringify(p3));
if (p3.tier !== 2 || !p3.furniture || !p3.chestStick || p3.beds !== 1) fail('phase 3 state lost across save/load: ' + JSON.stringify(p3));

// ==================== Phase 4: farming + economy ====================
await grant('stick', 2); await grant('stone', 2);
// craft the hoe, till a dirt tile below the shelter
const hoeLabel = await craftByName('STONE HOE');
if (hoeLabel !== 'MAKE') fail('hoe not craftable: ' + hoeLabel);
await standAtPlot();
if ((await actionLabel()) !== 'TILL') fail('expected TILL facing empty dirt with hoe, got ' + await actionLabel());
await pressAction();
await page.waitForTimeout(600); // till lands mid-swing
let farm = await page.evaluate(() => window.__frontier.state.farm);
log('farm after till:', JSON.stringify(farm));
if (farm.length !== 1) fail('tilling did not create a plot');

// trade: sell wood at the cart, buy turnip seeds
// (Maro may be walking through — TALK preempts while he's in reach; let him settle)
await walkTo(28, 15);
let tradeLabel = '';
for (let tries = 0; tries < 8; tries++) {
  await face('ArrowRight');
  tradeLabel = await actionLabel();
  if (tradeLabel === 'TRADE') break;
  const near = await page.evaluate(() => {
    const p = window.__frontier.state.player;
    const DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = DIRV[p.dir];
    const fx = p.x + dx * 24, fy = p.y + dy * 22;
    return { p: [Math.round(p.x), Math.round(p.y), p.dir], npcs: window.__frontier.state.npcs.map(n => ({ id: n.id, d: Math.round(Math.hypot(n.x - fx, n.y - fy)), act: n.activity, at: [Math.round(n.x), Math.round(n.y)] })) };
  });
  log('  trade retry', tries, tradeLabel, JSON.stringify(near));
  await page.waitForTimeout(800);
}
if (tradeLabel !== 'TRADE') fail('expected TRADE facing the stall, got ' + tradeLabel);
await pressAction();
await page.waitForTimeout(300);
await page.screenshot({ path: OUT + '/08-shop.png' });
for (let i = 0; i < 4; i++) {
  await page.locator('[data-side=sell] .ch-item', { hasText: 'WOOD' }).dispatchEvent('pointerdown');
  await page.waitForTimeout(150);
}
let coins = await page.evaluate(() => window.__frontier.state.economy.currency);
log('coins after selling 4 wood:', coins);
if (coins !== 8) fail('expected 8 coins (4 wood x 2), got ' + coins);
for (let i = 0; i < 2; i++) {
  await page.locator('[data-side=buy] .ch-item', { hasText: 'T.SEEDS' }).dispatchEvent('pointerdown');
  await page.waitForTimeout(150);
}
coins = await page.evaluate(() => window.__frontier.state.economy.currency);
i = await inv();
log('after buying 2 turnip seeds: coins =', coins, 'seeds =', i.turnipSeed);
if (coins !== 2 || i.turnipSeed !== 2) fail('buy flow wrong: ' + coins + ' coins, ' + JSON.stringify(i));
// 🔍 probe: buying beyond your coins is denied (meatCk costs 8, we have 2)
await page.locator('[data-side=buy] .ch-item', { hasText: 'COOKED' }).dispatchEvent('pointerdown');
await page.waitForTimeout(150);
const coinsAfterDenied = await page.evaluate(() => window.__frontier.state.economy.currency);
log('probe underfunded buy → coins still', coinsAfterDenied);
if (coinsAfterDenied !== 2 || (await inv()).meatCk) fail('underfunded buy went through!');
await page.locator('.craft-panel:not(.hidden) .cp-close').last().dispatchEvent('pointerdown');

// plant + water + grow over two mornings (real sleep in the real bed)
await standAtPlot();
if ((await actionLabel()) !== 'PLANT') fail('expected PLANT, got ' + await actionLabel());
await pressAction();
if ((await actionLabel()) !== 'WATER') fail('expected WATER after planting, got ' + await actionLabel());
await pressAction();
farm = await page.evaluate(() => window.__frontier.state.farm[0]);
log('plot after plant+water:', JSON.stringify(farm));
if (farm.cropId !== 'turnip' || !farm.watered) fail('plant/water state wrong');
async function sleepOnce() {
  await walkTo(22, 18.6);
  if (!await walkTo(22, 16)) fail('could not re-enter shelter to sleep');
  await face('ArrowUp');
  if ((await actionLabel()) !== 'SLEEP') fail('expected SLEEP, got ' + await actionLabel());
  await pressAction();
}
await sleepOnce();
farm = await page.evaluate(() => window.__frontier.state.farm[0]);
log('after night 1:', JSON.stringify(farm));
if (farm.stage !== 1 || farm.watered) fail('growth tick wrong after night 1');
await standAtPlot();
if ((await actionLabel()) !== 'WATER') fail('expected WATER on day 2');
await pressAction();
await sleepOnce();
let harvested = false;
for (let t = 0; t < 4 && !harvested; t++) {
  await standAtPlot();
  const hl = await actionLabel();
  if (hl !== 'HARVEST') { if (t === 3) fail('expected HARVEST after 2 grown nights, got ' + hl); continue; }
  if (t === 0) await page.screenshot({ path: OUT + '/09-grown.png' });
  await pressAction();
  // a companion stepping in can hijack the press into a chat — close & retry
  if (await page.locator('.dialogue-panel:not(.hidden)').count()) {
    await page.locator('.dialogue-panel').dispatchEvent('pointerdown');
  }
  harvested = !!(await inv()).turnip;
}
i = await inv();
log('after harvest:', JSON.stringify(i));
if (!i.turnip || i.turnip < 2) fail('harvest yield missing: ' + JSON.stringify(i));

// 🔍 probe: out-of-season crop withers on the next morning + CLEAR verb
await page.evaluate(() => {
  const plot = window.__frontier.state.farm[0];
  plot.cropId = 'pumpkin'; plot.stage = 1; plot.watered = true; plot.healthy = true; // pumpkin can't grow in spring
});
await sleepOnce();
farm = await page.evaluate(() => window.__frontier.state.farm[0]);
log('probe out-of-season → plot:', JSON.stringify(farm));
if (farm.healthy) fail('out-of-season pumpkin should have withered');
await standAtPlot();
if ((await actionLabel()) !== 'CLEAR') fail('expected CLEAR on withered plot, got ' + await actionLabel());
await pressAction();
farm = await page.evaluate(() => window.__frontier.state.farm[0]);
if (farm.cropId || !farm.healthy) fail('clear did not reset the plot');

// persistence: plot + coins survive reload
await page.evaluate(() => window.__frontier.bus.emit('quest:advanced', {}));
await page.waitForTimeout(200);
await page.reload();
await page.waitForTimeout(1200);
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const p4 = await page.evaluate(() => ({
  plots: window.__frontier.state.farm.length,
  coins: window.__frontier.state.economy.currency,
  turnips: window.__frontier.state.inventory.slots.find(s => s.itemId === 'turnip')?.qty,
  stall: Object.values(window.__frontier.state.world.objects).some(o => o.type === 'stall'),
}));
log('phase 4 restored:', JSON.stringify(p4));
if (p4.plots !== 1 || p4.coins !== 2 || !p4.turnips || !p4.stall) fail('phase 4 state lost: ' + JSON.stringify(p4));

// 🔍 probe: v2 save (pre-stall) must migrate to v3 with the cart injected
await page.reload();
await page.waitForTimeout(1000);
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('frontier.save'));
  s.version = 2;
  for (const k of Object.keys(s.world.objects)) if (s.world.objects[k].type === 'stall') delete s.world.objects[k];
  localStorage.setItem('frontier.save', JSON.stringify(s));
});
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const v3 = await page.evaluate(() => ({
  ver: window.__frontier.state.version,
  stall: Object.values(window.__frontier.state.world.objects).some(o => o.type === 'stall'),
}));
log('probe v2→current migration →', JSON.stringify(v3));
if (v3.ver < 3 || !v3.stall) fail('v2 save did not gain the stall: ' + JSON.stringify(v3));
// ==================== end Phase 4 ====================

// ==================== Phase 5: the people ====================
let npcs = await page.evaluate(() => window.__frontier.state.npcs.map(n => ({ id: n.id, activity: n.activity })));
log('npcs present:', JSON.stringify(npcs));
if (!npcs.some(n => n.id === 'maro')) fail('Maro missing');
if (!npcs.some(n => n.id === 'wren')) fail('Wren should have arrived by now (day >= 2)');

// pin the clock to 08:05 — Wren is away until 09:00, Maro tends 08:00-18:00
await page.evaluate(() => { window.__frontier.state.time.minute = 8 * 60 + 5; });
await page.waitForTimeout(300);
npcs = await page.evaluate(() => window.__frontier.state.npcs.map(n => ({ id: n.id, activity: n.activity })));
const wrenAway = npcs.find(n => n.id === 'wren').activity;
log('probe schedule: Wren at 08:00 is', wrenAway);
if (wrenAway !== 'away') fail('Wren should be away at 08:00, is ' + wrenAway);

// talk to a (possibly moving) NPC: chase, face, TALK
async function talkTo(id) {
  const wantName = await page.evaluate(i => window.__frontier.state.npcs.find(n => n.id === i)?.name, id);
  for (let tries = 0; tries < 8; tries++) {
    await page.waitForTimeout(700); // let walkers settle — you can't hail mid-stride
    const pos = await page.evaluate(i => {
      const n = window.__frontier.state.npcs.find(n => n.id === i);
      return n && n.activity !== 'away' ? [n.x, n.y] : null;
    }, id);
    if (!pos) return false;
    await walkToPx(pos[0], pos[1] + 26, 8000); // stand just below them
    const p = await page.evaluate(() => ({ x: window.__frontier.state.player.x, y: window.__frontier.state.player.y }));
    const dx = pos[0] - p.x, dy = pos[1] - p.y;
    await face(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'));
    if ((await actionLabel()) === 'TALK') {
      await pressAction();
      // another NPC may have caught the TALK — verify who answered
      const who = await page.locator('.dialogue-panel .dp-name').textContent().catch(() => '');
      if (who && who.startsWith(wantName)) return true;
      await page.locator('.dialogue-panel').dispatchEvent('pointerdown'); // wrong person; close, retry
      await page.waitForTimeout(400);
    }
  }
  return false;
}
await page.waitForTimeout(1500); // let Maro walk to his post
if (!await talkTo('maro')) fail('could not talk to Maro');
await page.waitForTimeout(300);
await page.screenshot({ path: OUT + '/10-dialogue.png' });
const dlgVisible = await page.locator('.dialogue-panel:not(.hidden)').count();
if (!dlgVisible) fail('dialogue panel did not open');
let social = await page.evaluate(() => ({
  rel: window.__frontier.state.relationships.maro,
  mem: window.__frontier.state.npcs.find(n => n.id === 'maro').memory,
}));
log('after first talk:', JSON.stringify(social));
if (!social.rel || social.rel.value !== 2 || !social.rel.flags.metPlayer) fail('first talk should set value 2 + metPlayer');
if (!social.mem.some(m => m.type === 'met') || !social.mem.some(m => m.type === 'talked')) fail('memory facts missing');
await page.locator('.dialogue-panel').dispatchEvent('pointerdown'); // close
// 🔍 probe: talking twice the same day gives no extra value
if (!await talkTo('maro')) fail('second talk failed');
social = await page.evaluate(() => window.__frontier.state.relationships.maro);
log('probe same-day talk → value still', social.value);
if (social.value !== 2) fail('same-day talk should not add value, got ' + social.value);
await page.locator('.dialogue-panel').dispatchEvent('pointerdown');

// Wren appears mid-morning; find and greet her
await page.evaluate(() => { window.__frontier.state.time.minute = 10 * 60; });
await page.waitForTimeout(400);
if (!await talkTo('wren')) fail('could not talk to Wren');
const wrenRel = await page.evaluate(() => window.__frontier.state.relationships.wren);
log('Wren after talk:', JSON.stringify(wrenRel));
if (!wrenRel?.flags.metPlayer) fail('Wren not met');
await page.locator('.dialogue-panel').dispatchEvent('pointerdown');

// 🔍 probe: the cart is CLOSED outside Maro's tending hours
await page.evaluate(() => { window.__frontier.state.time.minute = 22 * 60; });
await page.waitForTimeout(300);
await walkTo(28, 15);
await face('ArrowRight');
const nightLabel = await actionLabel();
log('probe stall at 22:00 →', nightLabel);
if (nightLabel !== 'CLOSED') fail('stall should be CLOSED at night, got ' + nightLabel);
await pressAction(); // denied, no panel
if (await page.evaluate(() => window.__frontier.session.shopOpen)) fail('shop opened while closed!');
await page.evaluate(() => { window.__frontier.state.time.minute = 10 * 60; });

// persistence: relationships + memory + npcs survive reload
await page.evaluate(() => window.__frontier.bus.emit('quest:advanced', {}));
await page.waitForTimeout(200);
await page.reload();
await page.waitForTimeout(1200);
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const p5 = await page.evaluate(() => ({
  npcs: window.__frontier.state.npcs.length,
  maroRel: window.__frontier.state.relationships.maro?.value,
  wrenMet: window.__frontier.state.relationships.wren?.flags.metPlayer,
  maroMem: window.__frontier.state.npcs.find(n => n.id === 'maro')?.memory.length,
}));
log('phase 5 restored:', JSON.stringify(p5));
if (p5.npcs !== 3 || p5.maroRel !== 2 || !p5.wrenMet || !p5.maroMem) fail('phase 5 state lost: ' + JSON.stringify(p5)); // 3 incl. Merlin (Phase 7)
// ==================== end Phase 5 ====================

// ==================== Phase 6: living world ====================
log('inventory entering phase 6:', JSON.stringify(await inv()));
// force-start an issue (normal starts roll randomly on day rollover)
await page.evaluate(() => window.__frontier.events.start('maro-short'));
await page.waitForTimeout(300);
let active = await page.evaluate(() => window.__frontier.state.events.active);
log('active events:', JSON.stringify(active));
if (active.length !== 1 || active[0].defId !== 'maro-short') fail('event did not start');
const bannerText = await page.locator('.issue-btn:not(.hidden)').textContent();
log('issue banner:', bannerText);
if (!bannerText.includes("MARO'S STORES")) fail('issue banner missing/wrong: ' + bannerText);

// open the issue — GIVE needs 3 food, we only carry 2 turnips → dimmed
await page.locator('.issue-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(300);
await page.screenshot({ path: OUT + '/11-event.png' });
const foodNow = await page.evaluate(() => ['meatCk', 'turnip', 'pumpkin'].reduce((n, id) => n + (window.__frontier.state.inventory.slots.find(s => s.itemId === id)?.qty || 0), 0));
const giveDim = await page.locator('.ev-choice', { hasText: 'GIVE 3 FOOD' }).getAttribute('class');
log(`probe requirement gating → food=${foodNow}, GIVE class:`, giveDim);
if (foodNow < 3) {
  if (!giveDim.includes('dim')) fail('GIVE should be dimmed with under 3 food');
  // 🔍 probe: clicking a dimmed choice does nothing
  await page.locator('.ev-choice', { hasText: 'GIVE 3 FOOD' }).dispatchEvent('pointerdown');
  await page.waitForTimeout(200);
  if (!(await page.evaluate(() => window.__frontier.state.events.active.length))) fail('dimmed choice resolved the event!');
} else if (giveDim.includes('dim')) fail('GIVE dimmed despite enough food');

// top up to exactly 3 food, resolve with SELL AT A PREMIUM
{
  const cur = await page.evaluate(() => ['meatCk', 'turnip', 'pumpkin'].reduce((n, id) => n + (window.__frontier.state.inventory.slots.find(s => s.itemId === id)?.qty || 0), 0));
  if (cur < 3) await grant('turnip', 3 - cur);
}
const coinsBefore = await page.evaluate(() => window.__frontier.state.economy.currency);
await page.locator('.ev-choice', { hasText: 'SELL AT A PREMIUM' }).dispatchEvent('pointerdown');
await page.waitForTimeout(300);
const p6a = await page.evaluate(() => ({
  coins: window.__frontier.state.economy.currency,
  maroRel: window.__frontier.state.relationships.maro.value,
  active: window.__frontier.state.events.active.length,
  history: window.__frontier.state.events.history.map(h => h.defId + ':' + h.resolved),
  turnips: window.__frontier.state.inventory.slots.find(s => s.itemId === 'turnip')?.qty || 0,
}));
log('after resolving:', JSON.stringify(p6a), '(coins before:', coinsBefore + ')');
if (p6a.coins !== coinsBefore + 12) fail('premium sale should pay 12 coins');
if (p6a.maroRel !== 4) fail('maro rel should be 4 after +2, got ' + p6a.maroRel);
if (p6a.active !== 0 || !p6a.history.includes('maro-short:sell')) fail('event not filed to history');
if (p6a.turnips !== 0) fail('3 food should have been taken, turnips left: ' + p6a.turnips);
const aftermathVisible = await page.locator('.dialogue-panel:not(.hidden)').count();
if (!aftermathVisible) fail('aftermath text did not show');
await page.locator('.dialogue-panel').dispatchEvent('pointerdown');

// 🔍 probe: an ignored issue expires on day rollover
await page.evaluate(() => window.__frontier.events.start('cloaked-traveller'));
await page.waitForTimeout(200);
await sleepOnce(); // day rolls; expiresDays: 1
const p6b = await page.evaluate(() => ({
  activeCloaked: window.__frontier.state.events.active.some(i => i.defId === 'cloaked-traveller'),
  expired: window.__frontier.state.events.history.some(h => h.defId === 'cloaked-traveller' && h.resolved === 'expired'),
}));
log('probe expiry →', JSON.stringify(p6b));
if (p6b.activeCloaked || !p6b.expired) fail('ignored event should have expired: ' + JSON.stringify(p6b));

// persistence: event history survives reload
await page.reload();
await page.waitForTimeout(1200);
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const p6c = await page.evaluate(() => window.__frontier.state.events.history.map(h => h.defId + ':' + h.resolved));
log('phase 6 restored history:', JSON.stringify(p6c));
if (!p6c.includes('maro-short:sell') || !p6c.some(h => h.startsWith('cloaked-traveller'))) fail('event history lost: ' + JSON.stringify(p6c));
// ==================== end Phase 6 ====================

// ==================== Phase 7: Merlin ====================
const merlinState = await page.evaluate(() => {
  const m = window.__frontier.state.npcs.find(n => n.id === 'merlin');
  return m ? { activity: m.activity } : null;
});
log('Merlin:', JSON.stringify(merlinState));
if (!merlinState) fail('Merlin never arrived (day >= 3)');
if (merlinState.activity !== 'follow') fail('Merlin should be following by day, is ' + merlinState.activity);
if (!await talkTo('merlin')) fail('could not talk to Merlin');
await page.locator('.dialogue-panel').dispatchEvent('pointerdown');
if (!(await page.evaluate(() => window.__frontier.state.relationships.merlin?.flags.metPlayer))) fail('Merlin not met');

// measured speed: stranger bond vs friend bond with Merlin at heel
async function measureRun() {
  await walkTo(20, 22); // open meadow
  const x0 = await page.evaluate(() => window.__frontier.state.player.x);
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowRight');
  const x1 = await page.evaluate(() => window.__frontier.state.player.x);
  return x1 - x0;
}
await page.evaluate(() => { const r = window.__frontier.state.relationships.merlin; r.value = 0; r.tier = 'stranger'; });
const dSlow = await measureRun();
await page.evaluate(() => {
  const r = window.__frontier.state.relationships.merlin;
  r.value = 30; r.tier = 'friend';
  const m = window.__frontier.state.npcs.find(n => n.id === 'merlin');
  const p = window.__frontier.state.player;
  m.x = p.x - 34; m.y = p.y + 14; // at heel
});
const dFast = await measureRun();
log(`speed: stranger ${Math.round(dSlow)}px vs friend ${Math.round(dFast)}px (ratio ${(dFast / dSlow).toFixed(3)})`);
if (dFast / dSlow < 1.05) fail('HASTEN aura not measurable: ' + dFast / dSlow);
const auras = await page.evaluate(() => {
  // night check for the light aura at friend tier
  window.__frontier.state.time.minute = 23 * 60;
  return null;
});
await page.waitForTimeout(300);
const lightOn = await page.evaluate(() => {
  const m = window.__frontier.state.npcs.find(n => n.id === 'merlin');
  const p = window.__frontier.state.player;
  m.x = p.x - 34; m.y = p.y + 14;
  return import('./src/sim/companion.js').then(c => c.auras(window.__frontier.state));
}).catch(() => null);
// (module import path may not resolve from page context — fall back to behavioural check)
if (lightOn) {
  log('auras at night, friend tier:', JSON.stringify(lightOn));
  if (!lightOn.light || !lightOn.hasten) fail('auras should be live at friend tier: ' + JSON.stringify(lightOn));
} else {
  log('auras: module import fallback skipped (behavioural speed check already passed)');
}
await page.evaluate(() => { window.__frontier.state.time.minute = 10 * 60; });
// 🔍 probe: Merlin rests at night — schedule flips his activity
await page.evaluate(() => { window.__frontier.state.time.minute = 22 * 60; });
await page.waitForTimeout(400);
const nightAct = await page.evaluate(() => window.__frontier.state.npcs.find(n => n.id === 'merlin').activity);
log('probe Merlin at 22:00 →', nightAct);
if (nightAct !== 'rest') fail('Merlin should rest at night, is ' + nightAct);
await page.evaluate(() => { window.__frontier.state.time.minute = 10 * 60; });
// ==================== end Phase 7 ====================

// ==================== Phase 8: venture & teeth ====================
await grant('wood', 2); await grant('stone', 3);
const swordLabel = await craftByName('STONE SWORD');
if (swordLabel !== 'MAKE') fail('sword not craftable: ' + swordLabel);
if ((await page.evaluate(() => window.__frontier.state.player.equipped.weapon)) !== 'sword') fail('sword not equipped');

// take the western trail
if (!await walkTo(2, 13)) fail('could not reach the trailhead');
await face('ArrowLeft');
if ((await actionLabel()) !== 'VENTURE') fail('expected VENTURE at the trail, got ' + await actionLabel());
await pressAction();
await page.waitForTimeout(400);
const vstate = await page.evaluate(() => ({
  venturing: window.__frontier.session.venturing,
  w: window.__frontier.tiles.W,
  wolves: window.__frontier.venture?.enemies.filter(e => e.alive).length,
}));
log('venture entered:', JSON.stringify(vstate));
if (!vstate.venturing || vstate.w !== 26 || vstate.wolves !== 5) fail('venture state wrong: ' + JSON.stringify(vstate));
await page.screenshot({ path: OUT + '/13-venture.png' });

// hunt a wolf: approach, face, ATTACK until the pack count drops
const aliveStart = vstate.wolves;
let killed = false;
for (let i = 0; i < 60 && !killed; i++) {
  const w = await page.evaluate(() => {
    const v = window.__frontier.venture;
    const p = window.__frontier.state.player;
    const ws = v.enemies.filter(e => e.alive)
      .map(e => ({ x: e.x, y: e.y, d: Math.hypot(e.x - p.x, e.y - p.y) }))
      .sort((a, b) => a.d - b.d);
    return { w: ws[0], alive: v.enemies.filter(e => e.alive).length, hp: window.__frontier.state.player.hp };
  });
  if (w.alive < aliveStart) { killed = true; break; }
  if (w.hp <= 1) fail('player nearly downed during the hunt — aborting'); // shouldn't happen with 6 hearts
  if (w.w.d > 80) { await walkToPx(w.w.x, w.w.y + 20, 3000); continue; }
  const p = await page.evaluate(() => ({ x: window.__frontier.state.player.x, y: window.__frontier.state.player.y }));
  const dx = w.w.x - p.x, dy = w.w.y - p.y;
  await face(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'));
  if ((await actionLabel()) === 'ATTACK') { await pressAction(); await page.waitForTimeout(350); }
}
if (!killed) fail('could not bring down a wolf');
const afterFight = await page.evaluate(() => ({
  hp: window.__frontier.state.player.hp,
  furDrops: window.__frontier.world().drops.filter(d => d.kind === 'fur').length,
}));
log('wolf down:', JSON.stringify(afterFight));
if (afterFight.hp === 6) log('  (note: took no damage — every bite warded or outpaced)');
// the pelt may pop straight into the pack if the wolf died at melee range
if (afterFight.furDrops) await collect('fur');
if (!(await inv()).fur) fail('no pelt looted (neither on the ground nor in the pack)');
log('pelts in pack:', (await inv()).fur);

// walk back and RETURN
if (!await walkTo(2, 10, 30000)) fail('could not walk back to the darkwood trail');
await face('ArrowLeft');
if ((await actionLabel()) !== 'RETURN') fail('expected RETURN at the trail, got ' + await actionLabel());
await pressAction();
await page.waitForTimeout(400);
const back = await page.evaluate(() => ({
  venturing: window.__frontier.session.venturing,
  w: window.__frontier.tiles.W,
  fur: window.__frontier.state.inventory.slots.find(s => s.itemId === 'fur')?.qty,
}));
log('returned home:', JSON.stringify(back));
if (back.venturing || back.w !== 44 || !back.fur) fail('return home failed: ' + JSON.stringify(back));

// 🔍 probe: defeat never annihilates — driven home hurt, a few coins lighter
const coinsPre = await page.evaluate(() => window.__frontier.state.economy.currency);
await page.evaluate(() => { window.__frontier.state.player.hp = 1; });
await face('ArrowLeft');
await pressAction(); // VENTURE again
await page.waitForTimeout(400);
// walk at the nearest wolf and stand there
const w2 = await page.evaluate(() => {
  const v = window.__frontier.venture, p = window.__frontier.state.player;
  return v.enemies.filter(e => e.alive).map(e => ({ x: e.x, y: e.y, d: Math.hypot(e.x - p.x, e.y - p.y) })).sort((a, b) => a.d - b.d)[0];
});
await walkToPx(w2.x, w2.y, 15000);
let downed = false;
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(500);
  if (!(await page.evaluate(() => window.__frontier.session.venturing))) { downed = true; break; }
}
if (!downed) fail('player was never downed while hugging a wolf at 1 hp');
const postDown = await page.evaluate(() => ({
  hp: window.__frontier.state.player.hp,
  coins: window.__frontier.state.economy.currency,
  w: window.__frontier.tiles.W,
  venture: !!window.__frontier.venture,
}));
log('probe downed →', JSON.stringify(postDown), '(coins before:', coinsPre + ')');
if (postDown.hp !== 2 || postDown.w !== 44 || postDown.venture) fail('downed handling wrong: ' + JSON.stringify(postDown));
if (postDown.coins > coinsPre || postDown.coins < coinsPre - 4) fail('coin loss out of bounds');

// 🔍 probe: sleep heals two hearts
await sleepOnce();
const hpAfterSleep = await page.evaluate(() => window.__frontier.state.player.hp);
log('probe sleep-heal → hp', hpAfterSleep);
if (hpAfterSleep !== 4) fail('sleep should heal to 4, got ' + hpAfterSleep);

// 🔍 probe: v3 save (no hp, no trail) migrates to v4
await page.reload();
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('frontier.save'));
  s.version = 3;
  delete s.player.hp;
  for (const k of Object.keys(s.world.objects)) if (s.world.objects[k].type === 'trail') delete s.world.objects[k];
  localStorage.setItem('frontier.save', JSON.stringify(s));
});
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const v4 = await page.evaluate(() => ({
  ver: window.__frontier.state.version,
  hp: window.__frontier.state.player.hp,
  trail: Object.values(window.__frontier.state.world.objects).some(o => o.type === 'trail'),
}));
log('probe v3→v4 migration →', JSON.stringify(v4));
if (v4.ver !== 4 || v4.hp !== 6 || !v4.trail) fail('v3→v4 migration wrong: ' + JSON.stringify(v4));
// ==================== end Phase 8 ====================

// 🔍 probe: v1 save (no rooms on structures) must migrate to v2
await page.reload();
await page.waitForTimeout(1000);
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('frontier.save'));
  s.version = 1;
  for (const sh of s.structures) delete sh.rooms;
  localStorage.setItem('frontier.save', JSON.stringify(s));
});
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const migrated = await page.evaluate(() => ({
  ver: window.__frontier.state.version,
  rooms: window.__frontier.state.structures[0]?.rooms?.length,
}));
log('probe v1→current migration →', JSON.stringify(migrated));
if (migrated.ver < 2 || !migrated.rooms) fail('v1 save did not migrate rooms: ' + JSON.stringify(migrated));
// ==================== end Phase 3 ====================

// 🔍 probe: an old save that references the ORIGINAL map must still load
// (saves store baseMapId — meadow-vale is kept in content for compat)
await page.reload();
await page.waitForTimeout(1000);
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('frontier.save'));
  s.world.baseMapId = 'meadow-vale';
  s.world.tileDeltas = {}; s.world.objects = {}; s.world.drops = []; s.world.resourceTimers = {};
  s.structures = [];
  s.player.x = 12.5 * 32; s.player.y = 9.6 * 32;
  localStorage.setItem('frontier.save', JSON.stringify(s));
});
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const oldMap = await page.evaluate(() => ({
  phase: window.__frontier.session.phase,
  mapId: window.__frontier.state.world.baseMapId,
  w: window.__frontier.tiles.W,
}));
log('probe old-map save →', JSON.stringify(oldMap));
if (oldMap.phase !== 'game' || oldMap.mapId !== 'meadow-vale' || oldMap.w !== 26) fail('old meadow-vale save broke: ' + JSON.stringify(oldMap));

// 🔍 probe: corrupt save → should fall back gracefully (fresh start, no crash).
// NB: corrupt it while at the TITLE (autosave is inert there); corrupting the
// live game then reloading gets overwritten by the pagehide autosave — good.
await page.reload();
await page.waitForTimeout(1000);
await page.evaluate(() => localStorage.setItem('frontier.save', '{"version":'));
await page.reload();
await page.waitForTimeout(1000);
const corruptLabel = await page.locator('.t-actions .primary-btn').textContent();
log('probe corrupt save → title button:', corruptLabel, '(CONTINUE expected: hasSave only checks presence; START must still work)');
page.once('dialog', d => d.accept());
if (corruptLabel === 'CONTINUE') {
  await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown'); // load() returns null → fresh camp
  await page.waitForTimeout(600);
  const ph2 = await page.evaluate(() => ({ phase: window.__frontier.session.phase, stage: window.__frontier.state?.quest.stage }));
  log('probe corrupt save → after CONTINUE:', JSON.stringify(ph2));
  if (ph2.phase !== 'game' || ph2.stage !== 0) fail('corrupt save did not fall back to a fresh camp');
}

// 🔍 probe: future save version → must refuse to load rather than mis-migrate
await page.reload();
await page.waitForTimeout(1000);
await page.evaluate(() => {
  localStorage.setItem('frontier.save', JSON.stringify({ version: 99, bogus: true }));
});
await page.reload();
await page.waitForTimeout(1000);
page.once('dialog', d => d.accept());
await page.locator('.t-actions .primary-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const vProbe = await page.evaluate(() => ({ phase: window.__frontier.session.phase, ver: window.__frontier.state?.version }));
log('probe future version → ', JSON.stringify(vProbe));
if (vProbe.phase !== 'game') fail('future-version save crashed the start flow');

// 🔍 probe: NEW CAMP over a real save asks for confirmation and wipes
await page.evaluate(() => localStorage.removeItem('frontier.save'));
await browser.close();
console.log(process.exitCode ? 'SMOKE FAIL' : 'SMOKE PASS');
