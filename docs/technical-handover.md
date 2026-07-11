# Frontier — Technical Handover & Full-Scope Architecture

*Everything a developer or an AI coding agent needs to take Frontier from the current prototype to full scope. This is the **how**; pair it with the vision and design briefs for the **why/what**. Architecture first, then the data model, then per-system specs, then a phased build order where every phase ships on its own.*

---

## 0. How to use this

- **Build in the Phase order (§7).** Each phase is independently playable and testable. Later phases assume the state object and module structure introduced in Phase 1 — don't build them out of order.
- **Two rules keep an AI-assisted build from collapsing (§6):** (1) one system per module, systems talk only through shared state + events; (2) content is *data*, not code. Follow these and each piece stays small enough for an AI to build in isolation without breaking the rest.
- **Feed the AI one module and its interfaces at a time** — never the whole game at once. Keep the data schema (§3) as the written contract between modules.

---

## 1. Current state — what you're extending

**Delivery:** a self-contained HTML component (a lightweight `x-dc` component framework) hosting three vanilla files:
- `engine.js` (~930 lines) — the game, plain Canvas 2D. A `createGame(cfg)` factory returns a `handle` API (`start`, `action`, `craftItem`, `setPalette`, `destroy`, etc.). A `requestAnimationFrame` loop runs `update(dt)` then `render()`.
- `sprites.js` — **procedural** pixel art. Sprites are drawn in code from a palette and cached per palette+hair. (No image files — this is why there are 3 themes for free, and why the character has a beauty ceiling.)
- `sfx.js` — a tiny WebAudio synth.

**Internal state today** is loose variables and objects: `ground[][]` (tile grid), `objects` (a `Map` keyed `"tx,ty"` for trees/rocks/fires/walls), `drops[]`, `rabbits[]`, `player`, `inv`, `tot`, `flags`, `worldMin`, `shelters[]`. Time runs at **1 real second = 1 game minute**. Tiles are **32px** (`T = 32`).

**Built (Layers 1–3):** movement + collision, gather sticks/stones, craft stone axe, chop trees→wood, hunt rabbits→raw meat, cook→cooked meat, drink, place campfire + shelter, gentle hunger/thirst, day/night cycle, a quest chain to a "HOME" ending, and heavy game-feel. **Only settings persist — the world does not.**

**The honest architectural fact:** it's a single ~930-line file with state and systems interleaved. Perfect for the slice; it will not hold 40 systems. **Phase 1 is a refactor before it's a feature.**

---

## 2. Target architecture

### 2.1 Single source of truth — the `GameState` object
Everything mutable and save-worthy lives in one `GameState` object. Systems read and write it; **no system keeps hidden persistent state.** This is what makes both saving (§4) and multi-system coherence possible. Transient visual-only state (particles, floating text, cached sprites, camera) lives *outside* GameState and is never saved.

### 2.2 Module split — one responsibility each
Break the monolith into modules with clear boundaries:

| Module | Owns |
|---|---|
| `core/loop` | the rAF loop, fixed update order, dt |
| `core/state` | GameState shape, creation, defaults |
| `core/bus` | the event bus (§2.4) |
| `world/tiles` | tile grid, biomes, base map + deltas |
| `world/time` | minute/day/season/year, day-night, weather |
| `world/resources` | nodes, gathering, **renewal/regrow** |
| `entities/player` | position, facing, the context-action resolver |
| `entities/npc` | NPC agents, spawning/arrivals, activity |
| `entities/schedule` | NPC routines (time-of-day → goal) |
| `sim/inventory` | item stacks, storage containers |
| `sim/crafting` | recipes (data-driven), the craft/place flow |
| `sim/building` | structures, rooms, furniture, upgrades |
| `sim/farming` | plots, crops, growth, watering |
| `sim/needs` | hunger/thirst (gentle) |
| `sim/relationships` | per-NPC value, tier, memory |
| `sim/events` | triggers, effects, resolvable issues |
| `sim/economy` | currency, shops, trade |
| `sim/combat` | venture-layer combat, enemies, threats |
| `sim/progression` | skill / tech / arcane nodes, unlocks |
| `io/save` | serialize/deserialize, versioning, migration |
| `io/input` | keyboard, touch joystick, action button |
| `render/*` | camera + all drawing (reads state, never mutates) |
| `ui/*` | HUD, panels, dialogue, menus |
| `audio` | the sfx synth (and later music) |
| `content/*` | **data definitions** — items, recipes, buildings, crops, npcs, events, progression, dialogue |
| `assets/sprites` | sprite loading (procedural now; sheets later) |

### 2.3 Content is data, not code
A `content/` layer holds plain declarative definitions. Systems are generic and read content; they don't hardcode it. Adding a crop, building, item, recipe, event, or skill node becomes a **data entry that touches no logic**. This is the single biggest lever for building fast without the codebase growing — see §6.

### 2.4 How systems communicate
- **Fixed update order** each tick (define it once in `core/loop`): input → time → world/resources → player → npc/schedule → sim systems → events → cleanup. Render runs after.
- **A lightweight event bus** for cross-system reactions: `bus.emit('cropFailed', {plotId})` and any system may subscribe (economy adjusts supply, an NPC reacts, the event system may spawn a "help with the harvest" issue). Systems **react to events; they don't reach into each other's internals.** This is what tames the integration problem that otherwise sinks big games.

### 2.5 Render stays a pure read of state
Already true today — keep it. Systems mutate state; the renderer only reads it and draws. Never draw from inside a system.

---

## 3. The data model — get this right first

*(This is the foundation. Concrete field lists below; treat as the schema contract.)*

```
GameState {
  version: int                       // for save migration (§4)
  seed: int                          // reserved for future procedural world
  time: { minute, day, season, year } // season ∈ spring|summer|autumn|winter
  player: Player
  inventory: Inventory
  world: World
  structures: Structure[]
  farm: Plot[]
  npcs: NPC[]
  relationships: { [npcId]: Relationship }
  economy: { currency: int, shops: Shop[] }
  progression: { skill: NodeState, tech: NodeState, arcane: NodeState }
  unlocks: string[]                  // recipe/building/ability ids unlocked
  events: { active: EventInstance[], history: string[] }
  quest: { stage: int }              // onboarding chain (exists)
  flags: { [key]: bool }             // one-off world facts
  settings: { palette, hair, muted } // exists
}

Player { x, y, dir, needs:{hunger,thirst}, skills:{...}, equipped:{weapon,tool} }

Inventory {
  slots: ItemStack[]                 // { itemId, qty }
  containers: { [containerId]: ItemStack[] }  // chests/storage
}

ItemDef (content) { id, name, sprite, stackMax, kind, tags[], value, ... }

World {
  baseMapId: string                  // which hand-authored map
  tileDeltas: { "tx,ty": tileType }  // only tiles changed from base
  objects: { "tx,ty": WorldObject }  // trees/stumps/rocks/fires/nodes/etc.
  drops: Drop[]                       // { kind, x, y }
  resourceTimers: { "tx,ty": regrowAtDay }  // stumps → tree, node respawn
}

Structure {
  id, type, ax, ay,                   // anchor tile
  tier,                               // e.g. house→keep progression level
  rooms: Room[], furniture: Furniture[], ownerId
}

Plot { id, tx, ty, cropId|null, plantedDay, stage, watered, healthy }

NPC {
  id, name, kind,                     // resident | traveller | landmark
  home: {tx,ty}, x, y,
  schedule: ScheduleEntry[],          // [{ fromMinute, toMinute, goal, place }]
  activity,                           // current derived goal
  memory: MemoryFact[],               // [{ type, subjectId, day }]
  arc: { id, state }                  // for landmark/quest NPCs
}

Relationship { value: int, tier: string, flags: {metPlayer, ...} }

EventDef (content) {
  id, trigger,                        // condition fn/spec (season, rel, chance)
  weight, effects[], resolutions[]    // resolutions = player choices/outcomes
}
EventInstance { defId, startedDay, data, resolved }

ProgressionNode (content) { id, tree, name, prereqs[], cost, grants[] }
NodeState { unlocked: string[], points: int }

Recipe (content) { id, out:{itemId,qty}, costs:[{itemId,qty}], station?, place? }

Shop { id, npcId, stock:[{itemId, price, qty}], buysTags[] }
```

Everything under `(content)` is a declarative data file, not logic.

---

## 4. Serialization & save/load

- **Saved:** the whole `GameState` minus transient visuals. Because `world` stores **base-map id + deltas** (not the full tile grid), saves stay small and survive you editing the map later.
- **Format:** JSON with a top-level `version`. Seed-ready for a possible future procedural world.
- **Storage:** `localStorage` to start. Migrate to **IndexedDB** if saves exceed a few MB or you want multiple slots/autosave history.
- **Triggers:** on meaningful actions (craft, build, plant, sleep, day rollover) + periodic autosave + on `visibilitychange`/`pagehide` (mobile tabs die silently).
- **Load flow:** title shows **CONTINUE** if a save exists else **NEW CAMP**; "New Camp" over a save confirms first.
- **Migration (do this from day one):** each `version` bump ships a small migration function `migrate(save) → save`. Over a long build you *will* add fields; without versioned migrations, every schema change breaks old saves. Cheap now, painful to retrofit.

---

## 5. System-by-system spec (full scope)

*Each: what it owns in GameState, its update logic, its interfaces. Concise on purpose — the design docs carry the "what"; this adds the technical layer. Existing systems are marked ✅.*

**World & environment**
- **Time / day-night** ✅ — extend `time` with `season` + `year`; season advances every N days; drives lighting, crop growth, spawns.
- **Seasons** — a content-driven modifier layer (crop viability, palette shift, event weights).
- **Tiles / biomes** ✅ — extend the base map with zone tags (forest/rock/water/meadow) for spawn distribution.
- **Resources + renewal** — nodes carry `resourceTimers`; stumps regrow (stump→sapling→tree over ~2–3 days); sticks/stones ambiently respawn by zone. Emits `resourceReady`.
- **Caves** — special map regions/entrances; the dragon's cave is one (§ Dragon).
- **Fishing** — water-edge action; a timing/patience minigame yielding fish items.
- **Weather** — optional modifier on top of season (rain waters crops, etc.).

**Player & action**
- **Movement + collision** ✅ (`blockedPx` grid check — keep).
- **Context-action resolver** ✅ (`actionCtx()` — the single "what does the button do here" function; extend it as new interactables land).
- **Skills** — usage-based growth on `player.skills`; gates/bonuses via `progression`.
- **Archery / weapons / tools** — equipped item drives the action verb and (later) combat.

**Inventory & crafting**
- **Item stacks + storage** — `slots` + `containers`; chests are Structures that own a container.
- **Crafting** ✅ (`RECIPE_DEFS` → move to `content/recipes`); keep the craft-or-place flow.
- **Enchantment** — a station (mage's tower / forge) that consumes arcane resources to add item modifiers.

**Building**
- **Placement** ✅ (ghost preview + validity — keep and generalize).
- **Structures / rooms / furniture** — data-defined; furniture placed inside room bounds.
- **Upgrades** — `Structure.tier` (house→keep). **Fork: upgrade-in-place vs. a separately-built castle** (design decision — see vision doc).
- **Walls**, **mage's tower**, **dragon-forge** — structure types with unlock gates.

**Farming**
- `Plot` growth driven by `time`/`season`/`watered`; unwatered or wrong-season → `healthy=false` → can fail. Emits `cropFailed` (an event hook — see People).

**Needs** ✅
- Hunger/thirst stay **gentle** (nudge, never kill) — a hard design pillar; enforce it in this module.

**NPCs & society (the heart)**
- **Arrivals** — `npc` spawns over time (residents you house + travellers passing through).
- **Routines** — `schedule` maps time-of-day → goal/place; `activity` derived each tick.
- **Memory & relationships** — actions write `MemoryFact`s and adjust `Relationship.value`/`tier`; they **like or dislike** you based on history.
- **Landmark characters** — the **black knight**, the **cloaked traveller** (fortune *or* trouble), etc., as NPCs with an `arc`.
- **Dialogue** — data-driven lines keyed by relationship tier + memory + arc state.

**Events & issues**
- Weighted `EventDef`s fire on triggers (season, relationship, chance). **Resolvable NPC issues** — a **dispute between two residents**, a **failed harvest** — are events with player `resolutions`. This system + NPCs is the main non-repetition engine.

**Economy**
- `currency`, `Shop` stock/prices, buy/sell. Shops are NPC-owned.

**Combat & threats (the venture layer)**
- Expeditions into the wilds; Arthur's **weapons/archery**; **Merlin's magic as support** (buffs your actions, never solos); enemy AI; **raiders**. Pillar: threats **hurt or steal, never annihilate** — the settlement is never wiped.

**The dragon**
- Lives in a cave; a **periodic ally** that unlocks things and yields **dragon-fire** → the dragon-forge → higher-tier crafting/enchantment. A neighbour, not a boss.

**Progression**
- `skill` / `tech` / `arcane` node graphs; **tech capped at medieval + magic limits**. **Fork: three trees vs. one unified progression** (lean toward fewer, richer — design decision).

**Merlin**
- The companion: force-multiplier behaviours (enchant, shield, light, hasten); **the bond deepens as progression** (relationship tier gates his help). Not player-controlled.

**Presentation**
- **Render** ✅ (keep the read-only-of-state discipline; add draws for new entities).
- **HUD / UI** — panels for inventory, build, crafting, dialogue, shops, progression trees.
- **Audio** ✅ (synth; add music later).
- **Art pipeline** — procedural now → **sprite-sheet loading** later. Character first (highest-value hand-made asset). See §9.

---

## 6. The two rules for an AI-assisted build

The AI multiplier is real but **decays as the codebase grows** — it starts breaking things it can't see. The architecture is the mitigation:

1. **One system per module; communicate only through GameState + the event bus.** Each module stays small enough for an AI to build or edit *in isolation* without needing the whole game in context. The integration risk lives in the seams — §2.4 makes the seams explicit and thin.
2. **Content as data.** Items, recipes, buildings, crops, events, dialogue, and progression nodes are data entries, not code. So the *logic* stops growing even as *content* explodes — which is how you go fast without the thing becoming unmaintainable.

**Practical workflow:** hand the AI one module + the schema (§3) + the specific interfaces it touches; keep the schema as a living contract doc; add the `version` field and a migration stub before Phase 2. Review each module against the fixed update order and the "systems never reach into each other" rule.

---

## 7. Build order — full scope, shippable increments

Each phase is a real, playable stopping point. Art runs as a **parallel track** throughout, not a final phase.

- **Phase 1 — Foundation refactor + persistence.** Extract `GameState`, split the monolith into the §2.2 modules, stand up the event bus, implement save/load + versioning, add resource renewal. *Unglamorous, enabling, and the most AI-friendly work there is. Everything below depends on it.*
- **Phase 2 — Bigger world + content-data layer.** Larger hand-authored map with zones; convert existing recipes/items/objects into `content/` definitions.
- **Phase 3 — Building depth.** Rooms, furniture, structure tiers/upgrades, walls, storage containers.
- **Phase 4 — Farming + economy.** Plots/crops/seasons/watering; currency + first shop.
- **Phase 5 — The people.** NPC arrivals, schedules/routines, relationships, memory, dialogue.
- **Phase 6 — Living world.** Events + resolvable issues (disputes, failed crops); first landmark characters (black knight, cloaked traveller).
- **Phase 7 — Merlin.** Companion behaviours + bond-as-progression.
- **Phase 8 — Venture & teeth.** Expedition maps, combat, Arthur's weapons/archery, Merlin's support, threats/raiders.
- **Phase 9 — The dragon.** Dragon's cave, periodic-ally loop, dragon-fire → forge → higher-tier crafting/enchantment.
- **Phase 10 — Progression & discovery.** Skill/tech/arcane trees; tech-capped civilisation discovery; unlock gating across the game.

**Dependencies to respect:** events (6) need NPCs (5); combat (8) needs the venture map + equipped-weapon action; the forge (9) needs building (3) + combat-won dragon-fire; progression (10) threads through everything, so wire the `unlocks`/`progression` hooks early (Phase 1) even if the trees come last.

---

## 8. Key conventions & decisions

- **Coordinates:** tile `T = 32px`; world positions in pixels; objects keyed `"tx,ty"`.
- **Time:** 1 real second = 1 game minute (current); define season length (e.g. ~14 in-game days) as a constant.
- **IDs:** stable string ids for every content entity and NPC (used by saves, relationships, events).
- **Determinism:** keep a seedable RNG so a future procedural world and reproducible events are possible.
- **Save versioning + migrations** from day one (§4).
- **Render/systems separation** is non-negotiable — it's what keeps the sim testable and the save clean.

---

## 9. Honest technical risks

- **Coupling / integration** — the classic big-game killer. Mitigated by the state object + event bus + thin module seams (§2, §6). This is the discipline that matters most.
- **Art pipeline** — the real wall for a non-artist. Beauty stays expensive: asset-pack sprite sheets or a commissioned artist. **Do the character first** — it's what the eye judges hardest and what procedural does worst. A hand-made sprite won't auto-recolour with the palette themes (minor, acceptable).
- **AI decay at scale** — mitigated by modular + data-driven design (§6); always feed the AI small, well-bounded pieces, never the whole game.
- **Save migration debt** — accumulates over a long build; the `version` field + migration functions are the cheap insurance.
- **Scope** — full scope is genuinely large. The phases are the release valve: every one is a complete, playable game you could stop at. Build hard and fast *one phase at a time* — that's what "fast" actually means here.
