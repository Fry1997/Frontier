// io/save — serialize/deserialize, versioning, migration (§4).
//
// - Saved: the whole GameState minus transient visuals. The world stores
//   baseMapId + tileDeltas (not the full grid), so saves stay small and
//   survive later edits to the base map.
// - Format: JSON with a top-level `version`.
// - Storage: localStorage (IndexedDB if saves outgrow it — §4).
// - Triggers: meaningful actions (craft, build, place, quest, day rollover)
//   + periodic autosave + visibilitychange/pagehide (mobile tabs die silently).
// - Migration: every version bump ships migrate fns; wired from day one.

import { SAVE_VERSION } from '../core/state.js';
import { recomputeSeason } from '../world/time.js';

const SAVE_KEY = 'frontier.save';
const SETTINGS_KEY = 'frontier.settings';
const AUTOSAVE_EVERY = 30; // seconds

// migrations[n] upgrades a version-n save to version n+1.
// Example for a future bump:
//   1: save => { save.player.mana = 1; save.version = 2; return save; }
const migrations = {};

export function migrate(save) {
  while (save.version < SAVE_VERSION) {
    const fn = migrations[save.version];
    if (!fn) throw new Error(`No migration from save version ${save.version}`);
    save = fn(save);
  }
  return save;
}

// Strip transient per-object/per-drop fields so saves hold only what matters.
export function serialize(state) {
  const out = JSON.parse(JSON.stringify(state));
  for (const k of Object.keys(out.world.objects)) delete out.world.objects[k].shake;
  out.world.drops = out.world.drops.map(d => ({ kind: d.kind, x: Math.round(d.x), y: Math.round(d.y) }));
  return out;
}

export function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

export function save(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(serialize(state)));
    return true;
  } catch (e) {
    console.error('[save] failed', e);
    return false;
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.version !== 'number') return null;
    if (parsed.version > SAVE_VERSION) {
      console.warn(`[save] save version ${parsed.version} is newer than this build (${SAVE_VERSION}); refusing to load`);
      return null;
    }
    const state = migrate(parsed);
    recomputeSeason(state); // derived; cheap to refresh on load
    return state;
  } catch (e) {
    console.error('[save] corrupt save, ignoring', e);
    return null;
  }
}

export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

// --- settings (persist independently of the world save, as before) ---

export function loadSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch (e) { return {}; }
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
}

// Wire autosave triggers. Returns an update(dt) for the periodic tick.
export function attach(rt) {
  const { bus } = rt;
  const doSave = () => { if (rt.session.phase === 'game') save(rt.state); };

  bus.on('craft:crafted', doSave);
  bus.on('object:placed', doSave);
  bus.on('structure:built', doSave);
  bus.on('quest:advanced', doSave);
  bus.on('time:dayStart', doSave);

  const onHide = () => { if (document.visibilityState === 'hidden') doSave(); };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', doSave);

  let t = AUTOSAVE_EVERY;
  return {
    update(dt) {
      t -= dt;
      if (t <= 0) { t = AUTOSAVE_EVERY; doSave(); }
    },
    detach() {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', doSave);
    },
  };
}
