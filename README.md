# Frontier

A cozy medieval settlement-survival game, built as a self-contained web app (plain Canvas 2D, vanilla ES modules, no build step).

**Play it:** serve the repo root with any static server and open `index.html`:

```sh
npx serve .        # or: python3 -m http.server
```

Move with WASD / left-thumb joystick, act with **E** / the action button, craft with **C**.

## Status — Phase 1 complete (Foundation refactor + persistence)

The prototype's single ~930-line engine has been split into the module architecture from
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

Phase 2 — bigger world + zone tags · Phase 3 — building depth · Phase 4 — farming + economy ·
Phase 5 — NPCs · Phase 6 — living world events · Phase 7 — Merlin · Phase 8 — venture & combat ·
Phase 9 — the dragon · Phase 10 — progression trees. See `docs/technical-handover.md` §7.
