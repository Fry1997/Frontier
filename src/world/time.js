// world/time — minute/day/season/year, day-night curve (§5: World & environment).
// 1 real second = 1 game minute. `state.time.minute` is minute-of-day [0..1440).
// Seasons advance every SEASON_DAYS days (schema-ready; season effects land
// in Phase 4+, but the clock carries them from day one).

export const DAY_MIN = 1440;
export const SEASON_DAYS = 14;
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

export function update(state, dt, bus) {
  const t = state.time;
  t.minute += dt;
  if (t.minute >= DAY_MIN) {
    t.minute -= DAY_MIN;
    t.day += 1;
    recomputeSeason(state);
    bus.emit('time:dayStart', { day: t.day, season: t.season, year: t.year });
  }
}

export function recomputeSeason(state) {
  const t = state.time;
  const idx = Math.floor((t.day - 1) / SEASON_DAYS);
  t.season = SEASONS[idx % 4];
  t.year = 1 + Math.floor(idx / 4);
}

function smoo(a, b, x) {
  x = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

// 0 = full day, 1 = full night
export function nightAmt(state) {
  const t = state.time.minute;
  if (t < 300) return 1;
  if (t < 390) return 1 - smoo(300, 390, t);
  if (t < 1200) return 0;
  if (t < 1320) return smoo(1200, 1320, t);
  return 1;
}

// warm sunrise/sunset tint
export function warmAmt(state) {
  const t = state.time.minute;
  return Math.max(0, 1 - Math.abs(t - 1185) / 60) * 0.14 + Math.max(0, 1 - Math.abs(t - 375) / 60) * 0.12;
}

export function isDaytime(state) {
  const t = state.time.minute;
  return t >= 360 && t < 1140;
}

// Sleep in a bed: skip forward to next morning. Runs through the same
// day-rollover path as the live clock so season/year and the dayStart
// event (autosave, regrowth day counters) stay consistent.
export function sleep(state, bus) {
  state.time.minute = 8 * 60;
  state.time.day += 1;
  recomputeSeason(state);
  bus.emit('time:dayStart', { day: state.time.day, season: state.time.season, year: state.time.year, slept: true });
  bus.emit('player:slept', {});
}

export function clockLabel(state) {
  const t = state.time.minute;
  const hh = String(Math.floor(t / 60)).padStart(2, '0');
  const mm = String(Math.floor(t % 60)).padStart(2, '0');
  return 'D' + state.time.day + ' ' + hh + ':' + mm;
}
