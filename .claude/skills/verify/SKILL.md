# Verify Frontier

How to build/launch/drive this repo for runtime verification.

## Build / launch

No build step — vanilla ES modules. Serve the repo root:

```sh
http-server -p 8321 -s   # or any static server; open /index.html
```

## Drive (headless)

Playwright + preinstalled Chromium. Executable (on the remote runner):
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome` — pass as `executablePath`
(the `chromium-<rev>` suffix changes; `ls /opt/pw-browsers/`). Resolve the
globally-installed playwright with
`createRequire('/opt/node22/lib/node_modules/playwright/')`.

- The game exposes `window.__frontier` (the runtime: `state`, `session`, `bus`)
  as a dev/testing hook — read it for assertions; drive via real UI only
  (`dispatchEvent('pointerdown')` on buttons, `page.keyboard` for movement/actions).
- Title flow: `.t-actions .primary-btn` is START (fresh) or CONTINUE (save exists);
  NEW CAMP is `.ghost-btn` and pops a `confirm()` dialog.
- Walk the player by holding Arrow keys in short bursts while polling
  `state.player.x/y`. Pickup radius is 16px — target a drop's exact `x,y`
  (pick the NEAREST drop of a kind, drops scatter when popped).
- Chop: craft axe first (gather stick+stone → press `c` → MAKE), stand on an
  adjacent tile, tap the facing arrow briefly, then `e` ×3 (0.6s apart).
- Don't hardcode map coordinates — the default map is `greenwood` (44×34,
  zoned); find the nearest tree/drop via `__frontier.state.world.objects` /
  `.drops` and `__frontier.tiles.blockedTile`. `tiles.zoneAt(tx,ty)` returns
  forest/rock/lake/meadow.

## Gotchas

- `page.reload()` fires the pagehide autosave — you cannot corrupt/inject a
  save from a live game session. Reload to the TITLE first (autosave is inert
  there), then tamper with `localStorage['frontier.save']`, then reload again.
- Regrowth (stump→sapling→tree) defers while the player stands on the tile —
  step away before advancing `state.time.day` to test renewal. The regrow
  check runs once a game-minute (= 1 real second); allow ~2.5s for the two
  stage transitions.
- **The full end-to-end smoke test is committed at `tests/smoke.mjs`** — it
  drives all shipped phases (gather/craft/chop/renewal, save/load +
  migrations, building/storage/sleep, farming, trading, NPCs/dialogue,
  events, Merlin, venture combat) through the real UI. Run it before
  claiming a change works: `http-server -p 8321 & node tests/smoke.mjs`.
- The companion (Merlin) follows the player from day 3 — he heels 48px
  behind the facing, parks exactly at heel, can't be hailed mid-stride,
  and stops repositioning within 60px. Tests that face a direction after
  approaching should expect TALK only when deliberately facing a settled
  NPC; retry loops that wait ~700ms for walkers to settle are the pattern.
- Placement anchors depend on the player's exact row — use short 40ms key
  taps (see `alignTo` in the smoke test) to pin position before placing.
