import test from "node:test";
import assert from "node:assert/strict";

import {
  buildFrameTimeState,
  getRoutedSystemTime,
  normalizeSimTickHours,
  normalizeTimeRouting,
} from "../src/core/timeRouter.js";

test("timeRouter builds deterministic tick state", () => {
  const routing = normalizeTimeRouting({
    movement: "global",
    swarm: "global",
    clouds: "detached",
    water: "detached",
    weather: "global",
  });
  const stateA = buildFrameTimeState({
    prevTimeState: {
      simTickHours: 0.01,
      tickRemainder: 0,
      globalTimeHours: 0,
      detachedTimeSec: 0,
      routing,
    },
    dtSec: 1,
    cycleSpeedHoursPerSec: 0.1,
    simTickHours: 0.01,
    routing,
  });
  assert.equal(stateA.ticksProcessed, 2);
  assert.equal(stateA.globalHoursAdvanced, 0.02);
  assert.equal(stateA.tickRemainder, 0.5);

  const stateB = buildFrameTimeState({
    prevTimeState: stateA,
    dtSec: 0.016,
    cycleSpeedHoursPerSec: 0.08,
    simTickHours: normalizeSimTickHours(0.01),
    routing,
  });
  assert.equal(stateB.ticksProcessed, 0);
  assert.ok(stateB.tickRemainder > 0);
});

test("timeRouter returns routed system timing payload", () => {
  const frame = buildFrameTimeState({
    prevTimeState: {
      simTickHours: 0.01,
      tickRemainder: 0,
      globalTimeHours: 0.25,
      detachedTimeSec: 12,
      routing: normalizeTimeRouting({
        movement: "global",
        swarm: "detached",
        clouds: "global",
        water: "detached",
        weather: "global",
      }),
    },
    dtSec: 0.1,
    cycleSpeedHoursPerSec: 0.5,
    simTickHours: 0.01,
  });
  const movementTime = getRoutedSystemTime(frame, "movement", 0.1);
  const swarmTime = getRoutedSystemTime(frame, "swarm", 0.1);

  assert.equal(movementTime.route, "global");
  assert.ok(movementTime.ticksProcessed >= 1);
  assert.equal(swarmTime.route, "detached");
  assert.equal(swarmTime.ticksProcessed, 0);
  assert.equal(swarmTime.dtSec, 0.1);
});
