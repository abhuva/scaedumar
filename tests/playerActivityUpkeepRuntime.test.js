import test from "node:test";
import assert from "node:assert/strict";

import { createPlayerActivityState } from "../src/gameplay/playerActivityStateRuntime.js";
import {
  createPlayerActivityUpkeepController,
  getProcessedMovementTicks,
} from "../src/gameplay/playerActivityUpkeepRuntime.js";

test("getProcessedMovementTicks normalizes scheduler movement tick batches", () => {
  assert.equal(getProcessedMovementTicks({ time: { systems: { movement: { ticksProcessed: 2.6 } } } }), 3);
  assert.equal(getProcessedMovementTicks({ time: { systems: { movement: { ticksProcessed: -4 } } } }), 0);
  assert.equal(getProcessedMovementTicks({ time: { systems: { movement: { ticksProcessed: "bad" } } } }), 0);
  assert.equal(getProcessedMovementTicks(null), 0);
});

test("upkeep controller applies one callback per processed movement tick", () => {
  const runtime = createPlayerActivityState("idle");
  runtime.type = "gathering";
  const ticks = [];
  const controller = createPlayerActivityUpkeepController({
    runtime,
    onUpkeepTick: (payload) => {
      ticks.push(payload);
    },
  });

  assert.equal(controller.update({ time: { systems: { movement: { ticksProcessed: 3 } } } }), 3);

  assert.deepEqual(ticks, [
    { activityType: "gathering", tickIndex: 0 },
    { activityType: "gathering", tickIndex: 1 },
    { activityType: "gathering", tickIndex: 2 },
  ]);
});
