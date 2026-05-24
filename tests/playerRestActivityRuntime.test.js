import test from "node:test";
import assert from "node:assert/strict";

import { createPlayerActivityState } from "../src/gameplay/playerActivityStateRuntime.js";
import { createRestActivityController } from "../src/gameplay/playerRestActivityRuntime.js";

function createRestHarness(overrides = {}) {
  const runtime = createPlayerActivityState("idle");
  const playerState = {
    pixelX: 4,
    pixelY: 5,
    stats: {},
  };
  const syncCalls = [];
  const stopCalls = [];
  let cycleSpeed = 0.2;
  const controller = createRestActivityController({
    runtime,
    playerState,
    activityType: "rest",
    getMovementSnapshot: () => ({ active: false }),
    setActivitySpeed1x: () => {
      cycleSpeed = 0.01;
    },
    syncStore: () => {
      syncCalls.push({ ...runtime });
    },
    stopActivity: (options) => {
      stopCalls.push(options);
      runtime.active = false;
      runtime.type = "idle";
      runtime.lastMessage = options.reason;
    },
    setStatus: () => {},
    ...overrides,
  });

  return {
    controller,
    cycleSpeed: () => cycleSpeed,
    runtime,
    stopCalls,
    syncCalls,
  };
}

test("rest controller starts rest activity and resets inspect fields", () => {
  const statuses = [];
  const { controller, cycleSpeed, runtime, syncCalls } = createRestHarness({
    setStatus: (status) => {
      statuses.push(status);
    },
  });
  runtime.inspectX = 10;
  runtime.inspectResources = [{ resourceId: "water" }];

  assert.equal(controller.startRest().ok, true);

  assert.equal(runtime.active, true);
  assert.equal(runtime.type, "rest");
  assert.equal(runtime.originX, 4);
  assert.equal(runtime.originY, 5);
  assert.equal(runtime.radius, 0);
  assert.equal(runtime.lastMessage, "Resting.");
  assert.equal(runtime.inspectX, null);
  assert.deepEqual(runtime.inspectResources, []);
  assert.equal(cycleSpeed(), 0.01);
  assert.equal(syncCalls.length, 1);
  assert.equal(statuses.at(-1), "Resting: fatigue recovers while food and water slowly drain.");
});

test("rest controller applies rest ticks and completes when fatigue is low", () => {
  let fatigue = 1.2;
  let restTicks = 0;
  const { controller, runtime, stopCalls } = createRestHarness({
    onRestTick: () => {
      restTicks += 1;
      fatigue -= 0.25;
    },
    getConditionSnapshot: () => ({ fatigue }),
  });

  assert.equal(controller.startRest().ok, true);
  assert.equal(controller.updateRestTicks(2), true);

  assert.equal(restTicks, 1);
  assert.equal(runtime.active, false);
  assert.equal(runtime.lastMessage, "Rest complete.");
  assert.deepEqual(stopCalls, [{ reason: "Rest complete.", cancelMovement: false }]);
});

test("rest controller does not own generic upkeep ticks", () => {
  let upkeepTicks = 0;
  const { controller } = createRestHarness({
    onUpkeepTick: () => {
      upkeepTicks += 1;
    },
  });

  assert.equal(controller.startRest().ok, true);
  controller.updateRestTicks(3);

  assert.equal(upkeepTicks, 0);
});
