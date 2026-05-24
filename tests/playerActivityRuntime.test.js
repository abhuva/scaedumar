import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVITY_TIME_SPEED_1X,
  createPlayerActivityRuntime,
} from "../src/gameplay/playerActivityRuntime.js";

test("player activity facade applies shared cancel cleanup for delegated scout activity", () => {
  let movementCanceled = 0;
  const cycleSpeeds = [];
  const scoutStops = [];
  const snapshots = [];
  const statuses = [];
  const runtime = createPlayerActivityRuntime({
    activityDefinitions: {
      scout: {
        label: "Scout",
        cancelLabel: "Scout canceled.",
      },
    },
    playerState: {
      pixelX: 10,
      pixelY: 12,
      stats: {},
    },
    getMovementSnapshot: () => ({ active: false }),
    getScoutSettings: () => ({ scanRadius: 30, revealRadius: 40 }),
    cancelMovementQueue: () => {
      movementCanceled += 1;
    },
    setCycleSpeed: (value) => {
      cycleSpeeds.push(value);
    },
    onScoutStopped: (payload) => {
      scoutStops.push(payload);
    },
    setActivitySnapshot: (snapshot) => {
      snapshots.push(snapshot);
    },
    requestOverlayDraw: () => {},
    setStatus: (value) => {
      statuses.push(value);
    },
  });

  assert.equal(runtime.startScout().ok, true);
  assert.equal(runtime.isScoutActive(), true);

  assert.equal(runtime.cancelActivity(), true);

  assert.equal(runtime.isActivityActive(), false);
  assert.equal(movementCanceled, 1);
  assert.deepEqual(scoutStops, [{ reason: "Scout canceled." }]);
  assert.equal(cycleSpeeds.at(-1), ACTIVITY_TIME_SPEED_1X);
  assert.equal(snapshots.at(-1).active, false);
  assert.equal(snapshots.at(-1).type, "idle");
  assert.equal(snapshots.at(-1).lastMessage, "Scout canceled.");
  assert.equal(statuses.at(-1), "Scout canceled.");
});

test("player activity facade routes upkeep before rest recovery", () => {
  const events = [];
  const runtime = createPlayerActivityRuntime({
    playerState: {
      pixelX: 4,
      pixelY: 5,
      stats: {},
    },
    getMovementSnapshot: () => ({ active: false }),
    onUpkeepTick: ({ tickIndex, activityType }) => {
      events.push(`upkeep:${activityType}:${tickIndex}`);
    },
    onRestTick: ({ tickIndex }) => {
      events.push(`rest:${tickIndex}`);
    },
    getConditionSnapshot: () => ({ fatigue: 10 }),
    setActivitySnapshot: () => {},
    requestOverlayDraw: () => {},
    setStatus: () => {},
  });

  assert.equal(runtime.startRest().ok, true);
  runtime.update({
    time: {
      systems: {
        movement: {
          ticksProcessed: 2,
        },
      },
    },
  });

  assert.deepEqual(events, [
    "upkeep:rest:0",
    "upkeep:rest:1",
    "rest:0",
    "rest:1",
  ]);
  assert.equal(runtime.getSnapshot().active, true);
  assert.equal(runtime.getSnapshot().type, "rest");
});
