import test from "node:test";
import assert from "node:assert/strict";

import { createPlayerActivityState } from "../src/gameplay/playerActivityStateRuntime.js";
import { createInspectActivityController } from "../src/gameplay/playerInspectActivityRuntime.js";

function createInspectHarness(overrides = {}) {
  const runtime = createPlayerActivityState("idle");
  const syncCalls = [];
  const statuses = [];
  const playerState = {
    pixelX: 4,
    pixelY: 5,
    stats: {},
  };
  const controller = createInspectActivityController({
    runtime,
    playerState,
    activityType: "inspect",
    getMapWidth: () => 20,
    getMapHeight: () => 20,
    getMovementSnapshot: () => ({ active: false }),
    sampleHeight: (x, y) => (x + y) / 100,
    sampleSlope: (x, y) => x / (y + 1),
    getInspectResourceReadings: (x, y) => [{ resourceId: "water", value: x / 10, chance: y / 100, knowledge: 1 }],
    syncStore: () => {
      syncCalls.push({ ...runtime });
    },
    setStatus: (status) => {
      statuses.push(status);
    },
    ...overrides,
  });

  return {
    controller,
    playerState,
    runtime,
    statuses,
    syncCalls,
  };
}

test("inspect controller starts close inspection from player position", () => {
  const { controller, runtime, statuses, syncCalls } = createInspectHarness();

  assert.equal(controller.startInspect().ok, true);

  assert.equal(runtime.active, true);
  assert.equal(runtime.type, "inspect");
  assert.equal(runtime.originX, 4);
  assert.equal(runtime.originY, 5);
  assert.equal(runtime.radius, 0);
  assert.equal(runtime.lastMessage, "Move cursor over terrain to inspect.");
  assert.equal(runtime.inspectX, null);
  assert.equal(runtime.inspectY, null);
  assert.equal(runtime.inspectHeight, null);
  assert.equal(runtime.inspectSlope, null);
  assert.deepEqual(runtime.inspectResources, []);
  assert.equal(statuses.at(-1), "Inspecting terrain: move cursor over the map.");
  assert.equal(syncCalls.length, 1);
});

test("inspect controller updates sampled cursor terrain stats", () => {
  const { controller, runtime, syncCalls } = createInspectHarness();

  assert.equal(controller.startInspect().ok, true);
  assert.equal(controller.updateInspectAtPixel(7, 3), true);

  assert.equal(runtime.inspectX, 7);
  assert.equal(runtime.inspectY, 3);
  assert.equal(runtime.inspectHeight, 0.1);
  assert.equal(runtime.inspectSlope, 1.75);
  assert.deepEqual(runtime.inspectResources, [{ resourceId: "water", value: 0.7, chance: 0.03, knowledge: 1 }]);
  assert.equal(runtime.lastMessage, "Inspecting terrain.");
  assert.equal(syncCalls.at(-1).inspectX, 7);
});

test("inspect controller clamps sampled cursor coordinates to map bounds", () => {
  const { controller, runtime } = createInspectHarness();

  assert.equal(controller.startInspect().ok, true);
  assert.equal(controller.updateInspectAtPixel(999, -10), true);

  assert.equal(runtime.inspectX, 19);
  assert.equal(runtime.inspectY, 0);
});
