// io/input — keyboard + touch joystick. Knows nothing about game logic:
// exposes movement axes for polling and emits semantic intents on the bus
// ('input:action', 'input:craftToggle', 'input:cancel', ...).

export function createInput({ bus, els, isActive }) {
  const keys = {};
  const joy = { id: null, bx: 0, by: 0, vx: 0, vy: 0 };

  const kd = e => {
    if (e.repeat) return;
    keys[e.key.toLowerCase()] = true;
    if (!isActive()) return;
    const k = e.key.toLowerCase();
    if (k === 'e' || k === ' ' || k === 'enter') { e.preventDefault(); bus.emit('input:action', {}); }
    if (k === 'c') bus.emit('input:craftToggle', {});
    if (k === 'escape') bus.emit('input:cancel', {});
    if (k === 'p') bus.emit('input:palette', {});
    if (k === 'm') bus.emit('input:mute', {});
  };
  const ku = e => { keys[e.key.toLowerCase()] = false; };
  addEventListener('keydown', kd);
  addEventListener('keyup', ku);

  const jz = els.joyZone;
  const jpd = e => {
    if (!isActive() || joy.id !== null) return;
    joy.id = e.pointerId; joy.bx = e.clientX; joy.by = e.clientY; joy.vx = 0; joy.vy = 0;
    jz.setPointerCapture(e.pointerId);
    positionJoy(e.clientX, e.clientY, 0, 0, true);
  };
  const jpm = e => {
    if (e.pointerId !== joy.id) return;
    let dx = e.clientX - joy.bx, dy = e.clientY - joy.by;
    const m = Math.hypot(dx, dy);
    if (m > 40) { dx = dx / m * 40; dy = dy / m * 40; }
    joy.vx = dx / 40; joy.vy = dy / 40;
    positionJoy(joy.bx, joy.by, dx, dy, true);
  };
  const jpu = e => {
    if (e.pointerId !== joy.id) return;
    joy.id = null; joy.vx = 0; joy.vy = 0;
    positionJoy(0, 0, 0, 0, false);
  };
  function positionJoy(x, y, dx, dy, show) {
    const b = els.joyBase, k = els.joyKnob;
    if (!b || !k) return;
    b.style.display = show ? 'block' : 'none';
    if (show) {
      const r = els.wrap.getBoundingClientRect();
      b.style.left = (x - r.left - 48) + 'px';
      b.style.top = (y - r.top - 48) + 'px';
      k.style.transform = `translate(${dx}px,${dy}px)`;
    }
  }
  jz.addEventListener('pointerdown', jpd);
  jz.addEventListener('pointermove', jpm);
  jz.addEventListener('pointerup', jpu);
  jz.addEventListener('pointercancel', jpu);

  return {
    axes() {
      const mx = (keys['a'] || keys['arrowleft'] ? -1 : 0) + (keys['d'] || keys['arrowright'] ? 1 : 0) + joy.vx;
      const my = (keys['w'] || keys['arrowup'] ? -1 : 0) + (keys['s'] || keys['arrowdown'] ? 1 : 0) + joy.vy;
      return [mx, my];
    },
    destroy() {
      removeEventListener('keydown', kd);
      removeEventListener('keyup', ku);
      jz.removeEventListener('pointerdown', jpd);
      jz.removeEventListener('pointermove', jpm);
      jz.removeEventListener('pointerup', jpu);
      jz.removeEventListener('pointercancel', jpu);
    },
  };
}
