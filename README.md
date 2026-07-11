# Frontier

A cozy medieval settlement-survival game, built as a self-contained web app (plain Canvas 2D, vanilla ES modules, no build step).

**Play it:** serve the repo root with any static server and open `index.html`:

```sh
npx serve .        # or: python3 -m http.server
```

Move with WASD / left-thumb joystick, act with **E** / the action button, craft with **C**.

## Status — Phase 5 complete (The people)

New in Phase 5:

- **NPCs** (`state.npcs`, schema §3) — a content-defined cast (`src/content/npcs.js`): **Maro** the trader (resident, staffs his cart from day 1) and **Wren** the traveller (wanders in from day 2, gone by night). Arrivals are ensured on day rollover — works for fresh games, loads, and old saves alike.
- **Schedules & routines** (`src/entities/schedule.js`) — minute-range → goal/place entries drive each NPC's live `activity` (tend / wander / rest / away); agents walk to their posts. **The cart trades only while Maro is tending — CLOSED at night.**
- **Relationships & memory** (`src/sim/relationships.js`) — TALK grants +2 once per day; tiers stranger → acquaintance → friend; memory facts (`met`, `talked`) recorded on the NPC, capped so they forget the distant past.
- **Dialogue** (`src/content/dialogue.js`) — data-driven lines keyed by tier, with a first-meeting line; shown in a tap-to-close panel with name + tier.
- Villager sprites are colour-swapped procedural placeholders under `npc.<id>` asset ids.

## Phase 4 (Farming + economy)

New in Phase 4:

- **Farming** — craft a stone hoe, **TILL** dirt tiles into plots (`state.farm`, schema `Plot`), **PLANT** seeds, **WATER** daily, **HARVEST** when grown. Growth ticks on day rollover only if the plot was watered; out-of-season crops **wither** (gently — CLEAR and replant). `crop:withered` is emitted on the bus, ready to become a Phase 6 event. Crops are content (`src/content/crops.js`): turnip (2 days) and pumpkin (4 days, summer/autumn only).
- **Economy** — `economy.currency` plus the first shop: a **trader's cart** parked near the camp (`content/shops.js`; `npcId: null` until Phase 5 staffs it). TRADE opens a buy/sell panel — the cart sells seeds and cooked food, and buys crops, food, wood, and stone at each item's content value. Coin chip in the HUD.
- **EAT generalized** — cooked meat first, then crops; food restores are item data.
- **Save v3** — migration injects the trader's cart into older greenwood saves.

## Phase 3 (Building depth)

New in Phase 3:

- **Storage** — craftable chests own a container (`inventory.containers`); facing one offers OPEN and a two-column transfer panel (pack ↔ stored). Contents persist in the save.
- **Furniture + rooms** — shelters now record their interior room bounds; beds and tables place only on floor tiles inside a room and are recorded on the structure (`Structure.furniture`). Facing the bed offers **SLEEP** — skips to next morning through the real day-rollover path (autosave, season, regrowth all consistent).
- **Walls** — craftable freestanding wall segments for fencing land.
- **Tier upgrade** — the *upgrade-in-place vs. separate castle* fork is resolved as upgrade-in-place: the TIMBER HOME recipe raises `Structure.tier` to 2 and swaps in a shingled roof. Craft recipes can gate on flags (`requiresFlag`) and carry effects handled over the bus.
- **Save v2** — first real migration: v1 saves get room bounds backfilled onto existing shelters.
- **Fixed a wedge bug family** (found by a verification probe): placement validity, shelter wall construction, and tree regrowth all used the player's *center tile*; the feet collision box could overlap a newly-created blocking object and trap the player. All three now test feet-box overlap, and shelter construction nudges the player free if needed.

## Phase 2 (Bigger world + content-data layer)

New in Phase 2:

- **Greenwood** (`src/content/maps.js`) — a 44×34 hand-authored map (~2.9× the prototype): dense NW forest with carved paths, NE rocky outcrop, SW lake, central meadow camp. Validated for connectivity (every starter drop reachable, 225 choppable trees, drinkable lake edge, clear shelter room by the camp). New camps start here; the original `meadow-vale` stays in content so old saves keep loading (saves reference `baseMapId`).
- **Zone tags** — maps carry `zones` rects (forest/rock/lake/meadow) with a `zoneAt` helper; ambient resource respawns are zone-weighted (sticks prefer forest trees, stones prefer rock-zone boulders), with per-map `resourceCaps`.
- **Objects as content** (`src/content/objects.js`) — passability, choppability, hp, and resource-source mappings are data; collision and the action resolver read them instead of hardcoding type lists.

## Phase 1 (Foundation refactor + persistence)

The prototype's single ~930-line engine was split into the module architecture from
[`docs/technical-handover.md`](docs/technical-handover.md) (§2), plus the two Phase-1 features:

- **`GameState` single source of truth** (`src/core/state.js`) — everything mutable and save-worthy in one object; transient visuals (particles, floats, camera, animation timers) live outside it and are never saved.
- **Event bus** (`src/core/bus.js`) — systems communicate through GameState + events only. Audio, fx, autosave, and UI are all bus subscribers; no system reaches into another's internals.
- **Fixed update order** — defined once in `src/main.js`: input → time → resources → player → critters → sim → io → fx → ui, render after.
- **Save/load with versioning + migrations** (`src/io/save.js`) — JSON in `localStorage`; the world saves as *base map id + tile deltas* so saves stay small and survive map edits; autosaves on craft/place/build/quest/day-rollover, every 30s, and on tab hide. The title screen offers **CONTINUE** / **NEW CAMP**.
- **Resource renewal** (`src/world/resources.js`) — stumps regrow (stump → sapling → tree over 2–3 days) via `resourceTimers`, and sticks/stones ambiently respawn near trees/boulders, capped.
- **Content as data** (`src/content/`) — items, recipes, maps, and quests are declarative definitions; the systems that consume them are generic.

Gameplay is the full Layers 1–3 slice from the prototype: gather, craft a stone axe, chop, hunt, cook, drink, place a campfire, build a shelter, make it HOME — with gentle hunger/thirst, day/night, three palette themes, and four hairstyles.

## Layout

```
index.html          host page (styles + <div id="wrap">)
src/
  main.js           composition root: wiring + the fixed update order
  core/             bus, seedable rng, GameState schema, rAF loop
  content/          DATA: items, recipes, maps, quests
  world/            tiles (base map + deltas), time/seasons, resource renewal
  entities/         player (movement + context-action resolver), rabbits
  sim/              inventory, crafting, building, needs, quests
  io/               save/load + migrations, input (keyboard + touch joystick)
  render/           canvas renderer, HUD, transient fx pools
  ui/               DOM shell: title, craft panel, buttons, banners
  audio/            WebAudio synth + event→sound map
  assets/           procedural sprites (placeholders keyed by asset id)
docs/               technical handover + design↔code pipeline contract
prototype/          the original monolith prototype, archived for reference
```

## The two rules (§6 of the handover)

1. **One system per module.** Modules communicate only through `GameState` and the event bus.
2. **Content is data, not code.** Adding an item/recipe/crop/event is a data entry that touches no logic.

## Next phases

Phase 3 — building depth · Phase 4 — farming + economy ·
Phase 5 — NPCs · Phase 6 — living world events · Phase 7 — Merlin · Phase 8 — venture & combat ·
Phase 9 — the dragon · Phase 10 — progression trees. See `docs/technical-handover.md` §7.
