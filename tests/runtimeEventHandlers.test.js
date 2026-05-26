import assert from "node:assert/strict";
import test from "node:test";
import { createEventBus, RuntimeEvents } from "../src/core/eventBus.js";
import { registerRuntimeEventHandlers } from "../src/core/runtimeEventHandlers.js";

function createCallRecorder() {
  const calls = [];
  const deps = {
    invalidateResourceContourOverlay: () => calls.push("invalidate"),
    syncResourceStockPanel: () => calls.push("sync-stock"),
    refreshInspectSample: () => calls.push("refresh-inspect"),
    syncGameplayHud: () => calls.push("sync-hud"),
    updateMovementStatusPanel: () => calls.push("update-panel"),
    requestOverlayDraw: () => calls.push("redraw"),
  };
  return { calls, deps };
}

test("resource stock events fan out to stock UI, inspect, overlay cache, and redraw", () => {
  const bus = createEventBus();
  const { calls, deps } = createCallRecorder();
  registerRuntimeEventHandlers(bus, deps);

  bus.emit(RuntimeEvents.RESOURCE_STOCK_CHANGED, { resourceId: "water" });

  assert.deepEqual(calls, ["invalidate", "sync-stock", "refresh-inspect", "redraw"]);
});

test("inspect events update focused UI and redraw without contour cache invalidation", () => {
  const bus = createEventBus();
  const { calls, deps } = createCallRecorder();
  registerRuntimeEventHandlers(bus, deps);

  bus.emit(RuntimeEvents.INSPECT_CHANGED, { enabled: true });

  assert.deepEqual(calls, ["refresh-inspect", "sync-hud", "update-panel", "redraw"]);
});

test("registered runtime event handlers can be removed", () => {
  const bus = createEventBus();
  const { calls, deps } = createCallRecorder();
  const unsubscribe = registerRuntimeEventHandlers(bus, deps);

  unsubscribe();
  bus.emit(RuntimeEvents.ACTIVITY_CHANGED);

  assert.deepEqual(calls, []);
});
