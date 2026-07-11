// audio/sfx — tiny retro WebAudio synth + the event→sound map.
// Audio subscribes to semantic bus events; systems never call sounds
// directly (§2.4: systems react to events).
export class SFX {
  constructor() { this.ctx = null; this.master = null; this.muted = false; }
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.35;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  setMuted(m) { this.muted = m; }
  tone(freq, dur, type = 'square', vol = 0.4, slide = 0, delay = 0) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.03);
  }
  noise(dur = 0.12, vol = 0.35, cutoff = 1000, delay = 0) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur + 0.03);
  }
  pickup() { this.tone(620, 0.08, 'square', 0.28, 320); }
  chop()   { this.noise(0.07, 0.5, 900); this.tone(150, 0.09, 'square', 0.32, -70); }
  treeFall(){ this.noise(0.28, 0.45, 500); this.tone(95, 0.24, 'triangle', 0.4, -40); }
  craft()  { this.tone(523, 0.09, 'square', 0.26); this.tone(784, 0.13, 'square', 0.26, 0, 0.09); }
  place()  { this.tone(120, 0.12, 'triangle', 0.5, -30); this.noise(0.09, 0.28, 420, 0.02); }
  eat()    { this.tone(230, 0.07, 'triangle', 0.38, -70); this.tone(200, 0.08, 'triangle', 0.34, -70, 0.1); }
  drink()  { this.tone(320, 0.09, 'sine', 0.32, 200); this.tone(430, 0.09, 'sine', 0.28, 220, 0.11); }
  squeak() { this.tone(900, 0.06, 'square', 0.16, 260); }
  poof()   { this.noise(0.14, 0.3, 750); }
  cook()   { this.noise(0.3, 0.16, 650); this.tone(520, 0.16, 'sine', 0.14, 140, 0.08); }
  quest()  { this.tone(587, 0.09, 'square', 0.22); this.tone(880, 0.15, 'square', 0.22, 0, 0.1); }
  home()   { [392, 523, 659, 784].forEach((f, i) => this.tone(f, 0.24, 'triangle', 0.26, 0, i * 0.14)); }
  denied() { this.tone(170, 0.1, 'square', 0.22, -50); }
  ui()     { this.tone(440, 0.05, 'square', 0.12); }
  coin()   { this.tone(988, 0.06, 'square', 0.2); this.tone(1319, 0.12, 'square', 0.2, 0, 0.06); }
}

// Map semantic events to sounds. Returns the SFX instance.
export function attachAudio(bus, sfx) {
  const on = (type, fn) => bus.on(type, fn);
  on('item:gained',      () => sfx.pickup());
  on('tree:hit',         () => sfx.chop());
  on('tree:felled',      () => sfx.treeFall());
  on('build:progress',   () => sfx.chop());
  on('craft:crafted',    () => sfx.craft());
  on('object:placed',    () => sfx.place());
  on('structure:built',  () => { sfx.place(); sfx.craft(); });
  on('structure:upgraded', () => { sfx.place(); sfx.home(); });
  on('player:slept',     () => sfx.quest());
  on('player:ate',       () => sfx.eat());
  on('player:drank',     () => sfx.drink());
  on('rabbit:killed',    () => { sfx.squeak(); sfx.poof(); });
  on('rabbit:startled',  () => sfx.squeak());
  on('cook:start',       () => sfx.cook());
  on('cook:done',        () => sfx.craft());
  on('quest:advanced',   () => sfx.quest());
  on('quest:finale',     () => sfx.home());
  on('action:denied',    () => sfx.denied());
  on('ui:click',         () => sfx.ui());
  // Phase 4: farming + trade
  on('farm:tilled',      () => sfx.place());
  on('farm:planted',     () => sfx.pickup());
  on('farm:watered',     () => sfx.drink());
  on('farm:harvested',   () => sfx.craft());
  on('farm:cleared',     () => sfx.poof());
  on('crop:withered',    () => sfx.denied());
  on('shop:bought',      () => sfx.coin());
  on('shop:sold',        () => sfx.coin());
  // Phase 5: people
  on('npc:talked',       () => sfx.ui());
  on('npc:arrived',      () => sfx.quest());
  on('relationship:tier', () => sfx.craft());
  // Phase 6: living world
  on('event:started',    () => sfx.quest());
  on('event:resolved',   () => sfx.craft());
  return sfx;
}
