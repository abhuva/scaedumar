export const RuntimeEvents = Object.freeze({
  ACTIVITY_CHANGED: "activity:changed",
  INSPECT_CHANGED: "inspect:changed",
  RESOURCE_DISCOVERY_CHANGED: "resource-discovery:changed",
  RESOURCE_STOCK_CHANGED: "resource-stock:changed",
  TRAVEL_PLANNING_CHANGED: "travel-planning:changed",
});

export function createEventBus() {
  const listeners = new Map();

  function on(type, listener) {
    if (typeof type !== "string" || !type) {
      throw new TypeError("event type must be a non-empty string");
    }
    if (typeof listener !== "function") {
      throw new TypeError("event listener must be a function");
    }
    const bucket = listeners.get(type) || new Set();
    bucket.add(listener);
    listeners.set(type, bucket);
    return () => off(type, listener);
  }

  function off(type, listener) {
    const bucket = listeners.get(type);
    if (!bucket) return false;
    const removed = bucket.delete(listener);
    if (bucket.size === 0) listeners.delete(type);
    return removed;
  }

  function emit(type, payload = {}) {
    const bucket = listeners.get(type);
    if (!bucket || bucket.size === 0) return 0;
    const snapshot = [...bucket];
    for (const listener of snapshot) {
      listener(payload);
    }
    return snapshot.length;
  }

  function clear(type = null) {
    if (type == null) {
      listeners.clear();
      return;
    }
    listeners.delete(type);
  }

  return {
    on,
    off,
    emit,
    clear,
  };
}
