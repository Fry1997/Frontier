// core/bus — the lightweight event bus (§2.4 of the technical handover).
// Systems react to events; they never reach into each other's internals.
// Usage: const off = bus.on('tree:felled', p => {...}); bus.emit('tree:felled', {tx, ty});

export function createBus() {
  const subs = new Map(); // type -> Set<fn>
  return {
    on(type, fn) {
      if (!subs.has(type)) subs.set(type, new Set());
      subs.get(type).add(fn);
      return () => subs.get(type)?.delete(fn);
    },
    emit(type, payload) {
      const set = subs.get(type);
      if (!set) return;
      for (const fn of [...set]) {
        try { fn(payload); }
        catch (e) { console.error(`[bus] handler for "${type}" threw`, e); }
      }
    },
  };
}
