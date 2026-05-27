import test from "node:test";
import assert from "node:assert/strict";

import { createPlayerActivityState } from "../src/gameplay/playerActivityStateRuntime.js";
import { ACTIVITY_TIME_SPEED_20X } from "../src/gameplay/playerActivityRuntime.js";
import {
  buildGatheringMoveCandidates,
  chooseWeightedGatheringCandidate,
  createResourceSearchActivityController,
} from "../src/gameplay/playerResourceSearchActivityRuntime.js";

function createResourceSearchHarness(overrides = {}) {
  const activityDefinitions = {
    gathering: {
      label: "Gathering",
      resourceSearch: "plants",
      cancelLabel: "Gathering canceled.",
    },
    gather_water: {
      label: "Gather Water",
      resourceSearch: "water",
      cancelLabel: "Water gathering canceled.",
    },
  };
  const runtime = createPlayerActivityState("idle");
  const playerState = {
    pixelX: 4,
    pixelY: 5,
    stats: { gatherRadius: 30 },
  };
  const queuedPaths = [];
  const stopCalls = [];
  const syncCalls = [];
  let cycleSpeed = 0.2;
  const controller = createResourceSearchActivityController({
    runtime,
    playerState,
    getActivityDefinition: (type) => activityDefinitions[type] || null,
    getMapWidth: () => 20,
    getMapHeight: () => 20,
    computeMoveStepCost: () => 1,
    replaceMovementQueue: (path) => {
      queuedPaths.push(path);
      return true;
    },
    getMovementSnapshot: () => ({ active: false }),
    random: () => 0,
    setActivitySpeed1x: () => {
      cycleSpeed = 0.01;
    },
    setActivitySpeed20x: () => {
      cycleSpeed = ACTIVITY_TIME_SPEED_20X;
    },
    syncStore: () => {
      syncCalls.push({ ...runtime });
    },
    stopActivity: (options) => {
      stopCalls.push(options);
      cycleSpeed = 0.01;
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
    playerState,
    queuedPaths,
    runtime,
    stopCalls,
    syncCalls,
  };
}

test("buildGatheringMoveCandidates rejects invalid and out-of-radius cells", () => {
  const candidates = buildGatheringMoveCandidates({
    currentX: 5,
    currentY: 5,
    originX: 5,
    originY: 5,
    radius: 1,
    mapWidth: 20,
    mapHeight: 20,
    computeMoveStepCost: (fromX, fromY, toX, toY) => {
      if (toX === 6 && toY === 5) return Number.POSITIVE_INFINITY;
      return 1;
    },
  });

  const keys = new Set(candidates.map((candidate) => `${candidate.x},${candidate.y}`));
  assert.deepEqual(keys, new Set(["5,4", "4,5", "5,6"]));
});

test("buildGatheringMoveCandidates can exclude recent cells then allow fallback", () => {
  const recentCells = new Set(["5,4", "6,5", "4,5", "5,6"]);
  const base = {
    currentX: 5,
    currentY: 5,
    originX: 5,
    originY: 5,
    radius: 1,
    mapWidth: 20,
    mapHeight: 20,
    computeMoveStepCost: () => 1,
    recentCells,
  };

  assert.equal(buildGatheringMoveCandidates(base).length, 0);
  assert.equal(buildGatheringMoveCandidates({ ...base, allowRecent: true }).length, 4);
});

test("chooseWeightedGatheringCandidate respects deterministic weighted pick", () => {
  const chosen = chooseWeightedGatheringCandidate({
    random: () => 0.75,
    candidates: [
      { x: 1, y: 0, weight: 1 },
      { x: 2, y: 0, weight: 3 },
    ],
  });

  assert.equal(chosen.x, 2);
});

test("resource search controller uses configured plant search and emits reward", () => {
  const rewards = [];
  const searches = [];
  const { controller, cycleSpeed, runtime } = createResourceSearchHarness({
    getResourceValue: () => 0.7,
    getResourceSearchChance: () => 1,
    onResourceSearch: (payload) => {
      searches.push(payload);
    },
    onResourceFound: (payload) => {
      rewards.push(payload);
      return { ok: true, itemName: "Medicinal Herb" };
    },
  });

  assert.equal(controller.startResourceSearch("gathering").ok, true);
  assert.equal(cycleSpeed(), ACTIVITY_TIME_SPEED_20X);
  controller.onStepCompleted({ toX: 5, toY: 5 });

  assert.equal(searches.length, 1);
  assert.equal(searches[0].x, 5);
  assert.equal(searches[0].y, 5);
  assert.equal(searches[0].resourceId, "plants");
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].resourceId, "plants");
  assert.equal(runtime.resourceId, "plants");
  assert.equal(runtime.lastResourceValue, 0.7);
  assert.equal(runtime.lastSearchChance, 1);
  assert.equal(runtime.lastMessage, "Found Medicinal Herb.");
});

test("resource search controller biases movement and emits water reward", () => {
  const rewards = [];
  let searchCalls = 0;
  const { controller, queuedPaths, runtime } = createResourceSearchHarness({
    random: () => 0.99,
    getResourceMovementBias: (resourceId, x) => (resourceId === "water" && x === 5 ? 100 : 1),
    getResourceValue: () => 0.8,
    getResourceSearchChance: () => 1,
    onResourceSearch: () => {
      searchCalls += 1;
    },
    onResourceFound: (payload) => {
      rewards.push(payload);
      return { ok: true, itemName: "Waterskin" };
    },
  });

  assert.equal(controller.startResourceSearch("gather_water").ok, true);
  assert.equal(queuedPaths.at(-1).at(-1).x, 5);
  controller.onStepCompleted({ toX: 5, toY: 5 });

  assert.equal(searchCalls, 1);
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].resourceId, "water");
  assert.equal(runtime.type, "gather_water");
  assert.equal(runtime.lastResourceValue, 0.8);
  assert.equal(runtime.lastSearchChance, 1);
  assert.equal(runtime.lastMessage, "Found Waterskin.");
});

test("resource search controller stops when reward acquisition fails", () => {
  const { controller, cycleSpeed, runtime, stopCalls } = createResourceSearchHarness({
    getResourceValue: () => 1,
    getResourceSearchChance: () => 1,
    onResourceFound: () => ({ ok: false, reason: "Could not store water: No container capacity." }),
  });

  assert.equal(controller.startResourceSearch("gather_water").ok, true);
  controller.onStepCompleted({ toX: 5, toY: 5 });

  assert.equal(runtime.active, false);
  assert.equal(runtime.foundCount, 0);
  assert.equal(runtime.lastMessage, "Could not store water: No container capacity.");
  assert.equal(cycleSpeed(), 0.01);
  assert.deepEqual(stopCalls, [{
    reason: "Could not store water: No container capacity.",
    cancelMovement: false,
  }]);
});
