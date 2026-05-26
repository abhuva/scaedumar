import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDirectHuntingPath,
  chooseHuntingPatrolTarget,
  createHuntingActivityController,
} from "../src/gameplay/playerHuntingActivityRuntime.js";

test("direct hunting path moves one 8-neighbor step at a time", () => {
  const path = buildDirectHuntingPath({ fromX: 2, fromY: 2, toX: 5, toY: 4 });

  assert.deepEqual(path[0], { x: 2, y: 2 });
  assert.deepEqual(path.at(-1), { x: 5, y: 4 });
  for (let i = 1; i < path.length; i++) {
    assert.ok(Math.abs(path[i].x - path[i - 1].x) <= 1);
    assert.ok(Math.abs(path[i].y - path[i - 1].y) <= 1);
  }
});

test("hunting patrol target remains inside activity radius", () => {
  const target = chooseHuntingPatrolTarget({
    originX: 50,
    originY: 50,
    currentX: 50,
    currentY: 50,
    radius: 10,
    mapWidth: 100,
    mapHeight: 100,
    random: () => 0.25,
  });

  assert.ok(target);
  const dx = target.x - 50;
  const dy = target.y - 50;
  assert.ok(dx * dx + dy * dy <= 100);
});

test("hunting activity samples availability and applies success depletion", () => {
  const runtime = {
    active: false,
    type: "idle",
    recentCells: [],
  };
  const playerState = { pixelX: 10, pixelY: 10, stats: {} };
  const queuedPaths = [];
  const successes = [];
  const snapshots = [];
  const randomValues = [0.25, 1, 0];
  const controller = createHuntingActivityController({
    runtime,
    playerState,
    activityType: "hunting",
    getMapWidth: () => 64,
    getMapHeight: () => 64,
    getMovementSnapshot: () => ({ active: false }),
    getHuntingSettings: () => ({
      radius: 12,
      trailEffectiveMax: 0.7,
      maxChance: 1,
      depletionRadius: 20,
      depletionTrailClear: 0.5,
    }),
    sampleHuntingAvailability: () => ({ availability: 0.8, rawAverage: 0.56 }),
    onHuntingSearch: () => {},
    onHuntingSuccess: (payload) => successes.push(payload),
    replaceMovementQueue: (path) => {
      queuedPaths.push(path);
      return true;
    },
    random: () => randomValues.shift() ?? 0,
    setActivitySpeed1x: () => {},
    syncStore: () => snapshots.push({ ...runtime }),
    stopActivity: () => false,
    setStatus: () => {},
  });

  assert.equal(controller.startHunting().ok, true);
  assert.equal(runtime.active, true);
  assert.equal(runtime.type, "hunting");
  assert.equal(queuedPaths.length, 1);

  controller.onStepCompleted({ toX: 11, toY: 10 });

  assert.equal(runtime.huntingAvailability, 0.8);
  assert.equal(runtime.huntingRawAvailability, 0.56);
  assert.equal(runtime.foundCount, 1);
  assert.deepEqual(successes, [{ x: 11, y: 10, radius: 20, trailClear: 0.5 }]);
  assert.ok(snapshots.length >= 2);
});
