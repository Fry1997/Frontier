// core/loop — the rAF loop and the fixed update order (§2.4).
// The order is defined once, here, and nowhere else:
//   input → time → world/resources → player → critters → sim systems → cleanup
// Render runs after all updates and only reads state.

export function createLoop({ update, render }) {
  let raf = 0, last = 0, running = false;
  function frame(ts) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    update(dt);
    render();
  }
  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
}
