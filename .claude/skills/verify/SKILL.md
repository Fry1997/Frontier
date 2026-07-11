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

## Gotchas

- `page.reload()` fires the pagehide autosave — you cannot corrupt/inject a
  save from a live game session. Reload to the TITLE first (autosave is inert
  there), then tamper with `localStorage['frontier.save']`, then reload again.
- Regrowth (stump→sapling→tree) defers while the player stands on the tile —
  step away before advancing `state.time.day` to test renewal. The regrow
  check runs once a game-minute (= 1 real second); allow ~2.5s for the two
  stage transitions.
- Working smoke test lives at the session scratchpad `smoke.mjs` pattern:
  gather → craft → chop → renewal → save/load round-trip → corrupt-save and
  future-version probes.
