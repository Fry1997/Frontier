# Frontier — Design Handoff #1

*CODE → DESIGN, per the standing contract in
[`docs/design-code-pipeline-contract.md`](../docs/design-code-pipeline-contract.md).
This is the first batch of Asset Requests. The game is fully playable on
procedural placeholders — nothing here blocks the build. Deliver in any
order; priority tells you where the value is.*

## What's outstanding

| Request | Asset id | Type | Priority | What it is |
|---|---|---|---|---|
| REQ-0001 | `player.arthur` | character_sheet | **high** | The player character — idle/walk/act, 4 directions |
| REQ-0002 | `prop.chest` | prop | medium | Storage chest (closed + open) |
| REQ-0003 | `prop.bed` | prop | medium | Bed (interior furniture, sleep target) |
| REQ-0005 | `structure.roof_t2` | prop | medium | Tier-2 "Timber Home" roof (upgrade payoff) |
| REQ-0004 | `prop.table` | prop | low | Table (interior furniture) |
| REQ-0006 | `prop.wall_segment` | prop | low | Freestanding fence/palisade segment |

Full machine-readable specs: [`design/requests.json`](requests.json) — that
file is the ledger; every field the contract requires (frame sizes, states,
anchor, naming, `integratesAt`) is in there.

## Why the character first

From the technical handover (§9): the character is what the eye judges
hardest and what procedural art does worst. One good hand-made Arthur lifts
the whole game more than any other single asset.

## The shared conventions (contract §5, restated)

- Tiles are 32×32; the character ~32×48. Everything must read at **3× scale**.
- PNG with transparency. Sheets grouped by state, one row per direction,
  plus a JSON atlas mapping `{state}_{dir}` → frame rects.
- World anchor is `bottom_center` (feet) unless the request says otherwise.
- Hand-made assets are `theme_agnostic`: they do **not** recolour with the
  three palette themes, and that's expected and fine.

## How to deliver

Drop files in `design/deliveries/REQ-XXXX/` and update the request's entry
in `requests.json`: set `status: "delivered"` and add a `produced` block
echoing what you actually made (same shape as `spec`), plus `deviations`
(explicit list — never a silent change) and `notes`. CODE validates field
by field (contract §4): full match → integrated; any mismatch → a
structured rejection naming exactly what to fix.

## Current placeholders

Every asset above already exists as a procedural placeholder in
`src/assets/sprites.js`, keyed by the same id — that's what you're
replacing, and the swap is invisible to the code because everything
references the id, not the file.
