import assert from "node:assert/strict";
import test from "node:test";
import { createEventBus, RuntimeEvents } from "../src/core/eventBus.js";

test("event bus emits to listeners and returns unsubscribe", () => {
  const bus = createEventBus();
  const calls = [];
  const unsubscribe = bus.on(RuntimeEvents.INSPECT_CHANGED, (payload) => {
    calls.push(payload);
  });

  assert.equal(bus.emit(RuntimeEvents.INSPECT_CHANGED, { enabled: true }), 1);
  assert.deepEqual(calls, [{ enabled: true }]);

  unsubscribe();
  assert.equal(bus.emit(RuntimeEvents.INSPECT_CHANGED, { enabled: false }), 0);
  assert.deepEqual(calls, [{ enabled: true }]);
});

test("event bus snapshots listeners during emit", () => {
  const bus = createEventBus();
  const calls = [];
  let unsubscribeSecond = null;

  bus.on("runtime:test", () => {
    calls.push("first");
    unsubscribeSecond();
  });
  unsubscribeSecond = bus.on("runtime:test", () => {
    calls.push("second");
  });

  assert.equal(bus.emit("runtime:test"), 2);
  assert.deepEqual(calls, ["first", "second"]);

  assert.equal(bus.emit("runtime:test"), 1);
  assert.deepEqual(calls, ["first", "second", "first"]);
});

test("event bus rejects invalid subscriptions", () => {
  const bus = createEventBus();
  assert.throws(() => bus.on("", () => {}), /event type/);
  assert.throws(() => bus.on("runtime:test", null), /event listener/);
});
