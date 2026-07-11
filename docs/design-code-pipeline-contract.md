# Frontier — Design ↔ Code Pipeline Contract

*The process and shared language for handing work between the two roles building Frontier: **CODE** (builds systems, needs assets) and **DESIGN** (produces visuals/audio). This is a standing contract both roles follow so nothing gets lost in translation. It's deliberately standalone from the technical handover so the DESIGN role can use it without reading the code architecture — the two link only through asset **ids**.*

---

## 0. The principle

Two roles, one shared format, a reliable round-trip:

> **CODE** hits a point where it needs an asset it can't generate → it emits a structured **Asset Request** → **DESIGN** produces the asset → returns a structured **Asset Delivery** → **CODE** validates it against the request and integrates it — or sends it back with a precise reason.

The one idea that makes this powerful: **everything is keyed to an `assetId`.** CODE builds against a *placeholder* under that id and keeps moving; DESIGN fills in the real asset whenever it's ready; the swap is automatic because both point at the same id. **CODE never blocks on art.** The gap announces itself, gets tracked, and gets filled asynchronously.

---

## 1. The loop & its states

Every asset moves through a fixed lifecycle. The `status` field travels with it so nothing falls through:

```
requested ──▶ in_progress ──▶ delivered ──▶ accepted ──▶ integrated
                                   │
                                   └──▶ rejected ──▶ (back to in_progress)
```

- **requested** — CODE has emitted an Asset Request; a placeholder is in use.
- **in_progress** — DESIGN has picked it up.
- **delivered** — DESIGN has returned an Asset Delivery.
- **accepted / rejected** — CODE validated the delivery against the request (§4).
- **integrated** — the real asset is in the project, referenced by its id; placeholder retired.

A shared tracking list (a simple table or JSON file, the "request ledger") holds every asset's id, status, and owner. That ledger is the single view of what art is outstanding.

---

## 2. Contract A — the Asset Request (CODE → DESIGN)

What CODE must provide so DESIGN can build with zero guesswork. Structured so either a human or an AI on the DESIGN side can consume it reliably:

```json
{
  "requestId": "REQ-0001",
  "assetId": "player.arthur",
  "status": "requested",
  "type": "character_sheet",
  "purpose": "Player character; replaces the procedural Arthur",
  "spec": {
    "frameSize": { "w": 32, "h": 48 },
    "states": [
      { "name": "idle", "frames": 1, "directions": ["down","up","left","right"] },
      { "name": "walk", "frames": 4, "directions": ["down","up","left","right"] },
      { "name": "act",  "frames": 2, "directions": ["down","up","left","right"] }
    ],
    "anchor": "bottom_center",
    "sheetLayout": "grid_by_state",
    "palette": "theme_agnostic",
    "format": "png_rgba"
  },
  "naming": "arthur.png + arthur.json atlas  (or arthur_{state}_{dir}_{frame}.png)",
  "integratesAt": "assets/sprites/player/",
  "priority": "high",
  "constraints": [
    "match the ~32x48 footprint of the current sprite",
    "readable at 3x scale"
  ]
}
```

**Required fields, always:** `requestId`, `assetId`, `type`, `purpose`, `spec` (with `frameSize`, `states`/frames, `anchor`, `format`), `naming`, `integratesAt`. `constraints` and a style/palette reference where they matter.

`type` ∈ `character_sheet | prop | tile | icon | vfx | ui | audio`. For non-animated types (`tile`, `icon`, `prop`), `states` collapses to a single frame or a small variant set.

---

## 3. Contract B — the Asset Delivery (DESIGN → CODE)

What DESIGN must return so CODE can integrate mechanically. The **manifest is the point** — it echoes the request and states exactly what was made, so validation is a comparison, not a judgment call:

```json
{
  "requestId": "REQ-0001",
  "assetId": "player.arthur",
  "status": "delivered",
  "files": ["arthur.png", "arthur.json"],
  "produced": {
    "frameSize": { "w": 32, "h": 48 },
    "states": [
      { "name": "idle", "frames": 1, "directions": ["down","up","left","right"] },
      { "name": "walk", "frames": 4, "directions": ["down","up","left","right"] },
      { "name": "act",  "frames": 2, "directions": ["down","up","left","right"] }
    ],
    "anchor": "bottom_center",
    "sheetLayout": "grid_by_state",
    "format": "png_rgba"
  },
  "deviations": [],
  "notes": "Single theme; not recoloured per palette, as requested (theme_agnostic)."
}
```

**Rule:** any difference from the request goes in `deviations`, explicitly — never a silent change. Files must be named exactly as the request's `naming` specifies.

---

## 4. Validation & the revision loop (CODE)

On delivery, CODE checks `produced` against the request's `spec`, field by field: frame size, state names + frame counts + directions, anchor, sheet layout, format, file naming. Then:

- **All match →** `accepted` → drop files at `integratesAt`, wire to `assetId`, retire the placeholder → `integrated`.
- **Any mismatch →** `rejected`, with a structured reason so DESIGN knows precisely what to fix:

```json
{
  "requestId": "REQ-0001",
  "assetId": "player.arthur",
  "status": "rejected",
  "failures": [
    { "field": "frameSize", "expected": "32x48", "got": "32x32" },
    { "field": "states.walk.frames", "expected": 4, "got": 3 }
  ],
  "action": "revise and redeliver"
}
```

This closes the loop: mismatches can't slip through silently, and revisions carry an exact target.

---

## 5. Shared conventions — the common language

The defaults both roles assume **unless a request overrides them.** This is what keeps most requests short: the baseline is already agreed.

- **Tile size:** 32×32 px. **Characters:** ~32×48 px.
- **Format:** PNG with transparency (`png_rgba`); audio as short WAV/OGG.
- **World anchor:** `bottom_center` (feet) — where a sprite is pinned to its tile.
- **Sheet layout:** frames grouped by state, one row per direction, plus a JSON atlas (`{state}_{dir}` → frame rects) so CODE reads frames by name, not by counting pixels.
- **Palette:** procedural assets recolour per theme automatically; hand-made assets are `theme_agnostic` (constant across themes) unless variants are explicitly requested. A hand-made asset *not* following the themes is expected and fine.
- **Ids:** every asset has a stable `assetId` that matches the content definition it belongs to (§6). The id is the contract's anchor — filenames can change, the id never does.
- **Readability:** everything must read clearly at 3× scale (the game renders pixel-doubled).

---

## 6. How it plugs into the build

From the technical handover: content is data, and every visual is referenced by `assetId`. So this pipeline isn't extra bureaucracy — it *falls out of* the architecture:

- A **missing asset** is simply a content definition whose `assetId` has no file yet. The game can **generate the outstanding-request list by scanning content for unfulfilled ids** — the request ledger writes itself.
- Until delivery, CODE renders a **placeholder** under that id (procedural stand-in, or a flat coloured box). Building proceeds; art is a parallel fill-in track.
- On `integrated`, the loader resolves the id to the real file instead of the placeholder — **no code change**, because everything always referenced the id.

This is the mechanism that lets the art run behind the code the whole way, and it's why the art wall stops being a wall.

---

## 7. The reverse leg (design → code)

The pipeline runs both ways. The vision/design briefs are DESIGN → CODE handoffs that kick off system work — the same discipline applies: a structured request (what to build, acceptance criteria) and an explicit accept/revise on delivery. Kept brief here because the asset round-trip above is the leg that was missing; the design→code leg already exists as the briefs, now understood as the same contract in the other direction.

---

## 8. Worked example — the flow end to end

1. CODE adds the player system; content defines `assetId: "player.arthur"`. No file exists → CODE renders the current procedural Arthur as the placeholder and emits **REQ-0001** (§2). Ledger: `player.arthur — requested`.
2. DESIGN picks it up (`in_progress`), produces `arthur.png` + `arthur.json`, returns the Delivery manifest (§3). Ledger: `delivered`.
3. CODE validates `produced` vs `spec`. Walk has 3 frames, not 4 → **rejected** with the failure (§4). Back to DESIGN.
4. DESIGN fixes the walk cycle, redelivers. Validation passes → **accepted** → files dropped at `assets/sprites/player/`, id wired, placeholder retired → **integrated**.
5. The swap is invisible to the rest of the code — everything always pointed at `player.arthur`.

Same five steps for every tile, prop, icon, effect, and sound in the game.
