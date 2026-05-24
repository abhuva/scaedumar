import test from "node:test";
import assert from "node:assert/strict";

import { createPlayerActivityState } from "../src/gameplay/playerActivityStateRuntime.js";
import { createTravelActivityController } from "../src/gameplay/playerTravelActivityRuntime.js";

function createTravelHarness(overrides = {}) {
  const runtime = createPlayerActivityState("idle");
  const syncCalls = [];
  const stopCalls = [];
  let cycleSpeed = 0.2;
  const controller = createTravelActivityController({
    runtime,
    activityType: "travel",
    getMovementSnapshot: () => ({ active: true }),
    getCompleteLabel: () => "Travel complete.",
    startRuntimeActivity: (type, message) => {
      runtime.active = true;
      runtime.type = type;
      runtime.lastMessage = message;
      runtime.stepsTaken = 0;
    },
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

test("travel controller starts explicit travel from queued movement", () => {
  const { controller, cycleSpeed, runtime, syncCalls } = createTravelHarness();

  assert.equal(controller.startTravel().ok, true);

  assert.equal(runtime.active, true);
  assert.equal(runtime.type, "travel");
  assert.equal(runtime.lastMessage, "Traveling.");
  assert.equal(cycleSpeed(), 0.01);
  assert.equal(syncCalls.length, 1);
});

test("travel controller rejects start without queued movement", () => {
  const { controller, runtime } = createTravelHarness({
    getMovementSnapshot: () => ({ active: false }),
  });

  assert.deepEqual(controller.startTravel(), { ok: false, reason: "No queued travel path." });
  assert.equal(runtime.active, false);
});

test("travel controller tracks steps and completes queue", () => {
  const { controller, runtime, stopCalls } = createTravelHarness();

  assert.equal(controller.startTravel().ok, true);
  assert.equal(controller.onStepCompleted(), true);
  assert.equal(runtime.stepsTaken, 1);
  assert.equal(runtime.lastMessage, "Traveling.");

  assert.equal(controller.onQueueCompleted(), true);
  assert.equal(runtime.active, false);
  assert.equal(runtime.lastMessage, "Travel complete.");
  assert.deepEqual(stopCalls, [{ reason: "Travel complete.", cancelMovement: false }]);
});
