import test from "node:test";
import assert from "node:assert/strict";

import {
  buildGatheringMoveCandidates,
  chooseWeightedGatheringReward,
  chooseWeightedGatheringCandidate,
  createGatheringActivityRuntime,
} from "../src/gameplay/gatheringActivityRuntime.js";

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

test("chooseWeightedGatheringReward respects deterministic weighted pick", () => {
  const reward = chooseWeightedGatheringReward({
    random: () => 0.6,
  });

  assert.equal(reward.itemId, "medicinal_herb");
});

test("gathering successful new-cell search emits item reward", () => {
  const rewards = [];
  const searches = [];
  const runtime = createGatheringActivityRuntime({
    playerState: {
      pixelX: 4,
      pixelY: 5,
      stats: { gatherRadius: 30 },
    },
    getMapWidth: () => 20,
    getMapHeight: () => 20,
    getMovementSnapshot: () => ({ active: false }),
    computeMoveStepCost: () => 1,
    replaceMovementQueue: () => true,
    random: () => 0,
    onGatheringSearch: (payload) => {
      searches.push(payload);
    },
    onGatheringFound: (reward) => {
      rewards.push(reward);
      return { ok: true, itemName: "Berries" };
    },
    setActivitySnapshot: () => {},
    requestOverlayDraw: () => {},
    setStatus: () => {},
  });

  assert.equal(runtime.startGathering().ok, true);
  runtime.onStepCompleted({ toX: 5, toY: 5 });

  assert.equal(searches.length, 1);
  assert.equal(searches[0].x, 5);
  assert.equal(searches[0].y, 5);
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].itemId, "berries");
  assert.equal(runtime.getSnapshot().lastMessage, "Found Berries.");
});

test("inspect activity updates sampled cursor terrain stats", () => {
  const snapshots = [];
  const runtime = createGatheringActivityRuntime({
    playerState: {
      pixelX: 4,
      pixelY: 5,
      stats: { gatherRadius: 30 },
    },
    getMapWidth: () => 20,
    getMapHeight: () => 20,
    getMovementSnapshot: () => ({ active: false }),
    sampleHeight: (x, y) => (x + y) / 100,
    sampleSlope: (x, y) => x / (y + 1),
    getInspectResourceReadings: (x, y) => [{ resourceId: "water", value: x / 10, chance: y / 100, knowledge: 1 }],
    setActivitySnapshot: (snapshot) => snapshots.push(snapshot),
    requestOverlayDraw: () => {},
    setStatus: () => {},
  });

  assert.equal(runtime.startInspect().ok, true);
  assert.equal(runtime.updateInspectAtPixel(7, 3), true);
  const snapshot = runtime.getSnapshot();
  assert.equal(snapshot.type, "inspect");
  assert.equal(snapshot.inspectX, 7);
  assert.equal(snapshot.inspectY, 3);
  assert.equal(snapshot.inspectHeight, 0.1);
  assert.equal(snapshot.inspectSlope, 1.75);
  assert.deepEqual(snapshot.inspectResources, [{ resourceId: "water", value: 0.7, chance: 0.03, knowledge: 1 }]);
  assert.equal(snapshots.at(-1).inspectX, 7);
});

test("rest activity applies rest ticks and completes when fatigue is low", () => {
  let fatigue = 1.2;
  let upkeepTicks = 0;
  let restTicks = 0;
  const snapshots = [];
  const runtime = createGatheringActivityRuntime({
    playerState: {
      pixelX: 4,
      pixelY: 5,
      stats: { gatherRadius: 30 },
    },
    getMapWidth: () => 20,
    getMapHeight: () => 20,
    getMovementSnapshot: () => ({ active: false }),
    onUpkeepTick: () => {
      upkeepTicks += 1;
    },
    onRestTick: () => {
      restTicks += 1;
      fatigue -= 0.25;
    },
    getConditionSnapshot: () => ({ fatigue }),
    setActivitySnapshot: (snapshot) => snapshots.push(snapshot),
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

  assert.equal(upkeepTicks, 2);
  assert.equal(restTicks, 1);
  assert.equal(runtime.getSnapshot().active, false);
  assert.equal(snapshots.at(-1).lastMessage, "Rest complete.");
});

test("idle activity applies upkeep ticks without showing an active panel", () => {
  let upkeepTicks = 0;
  const runtime = createGatheringActivityRuntime({
    playerState: {
      pixelX: 4,
      pixelY: 5,
      stats: { gatherRadius: 30 },
    },
    getMapWidth: () => 20,
    getMapHeight: () => 20,
    getMovementSnapshot: () => ({ active: false }),
    onUpkeepTick: () => {
      upkeepTicks += 1;
    },
    setActivitySnapshot: () => {},
    requestOverlayDraw: () => {},
    setStatus: () => {},
  });

  runtime.update({
    time: {
      systems: {
        movement: {
          ticksProcessed: 3,
        },
      },
    },
  });

  assert.equal(upkeepTicks, 3);
  assert.equal(runtime.getSnapshot().active, false);
  assert.equal(runtime.getSnapshot().type, "idle");
});

test("travel activity tracks queued movement as explicit player intent", () => {
  let movementActive = true;
  const snapshots = [];
  const runtime = createGatheringActivityRuntime({
    activityDefinitions: {
      travel: {
        label: "Travel",
        cancelLabel: "Travel canceled.",
        completeLabel: "Travel complete.",
      },
    },
    playerState: {
      pixelX: 4,
      pixelY: 5,
      stats: { gatherRadius: 30 },
    },
    getMapWidth: () => 20,
    getMapHeight: () => 20,
    getMovementSnapshot: () => ({ active: movementActive }),
    cancelMovementQueue: () => {
      movementActive = false;
    },
    setActivitySnapshot: (snapshot) => snapshots.push(snapshot),
    requestOverlayDraw: () => {},
    setStatus: () => {},
  });

  assert.equal(runtime.startTravel().ok, true);
  assert.equal(runtime.getSnapshot().active, true);
  assert.equal(runtime.getSnapshot().type, "travel");

  runtime.onStepCompleted({ toX: 5, toY: 5 });
  assert.equal(runtime.getSnapshot().stepsTaken, 1);

  runtime.onQueueCompleted();
  assert.equal(runtime.getSnapshot().active, false);
  assert.equal(snapshots.at(-1).lastMessage, "Travel complete.");
});

test("resource search activity biases movement and emits item reward", () => {
  const rewards = [];
  let searchCalls = 0;
  let queuedTarget = null;
  const runtime = createGatheringActivityRuntime({
    activityDefinitions: {
      gather_water: {
        label: "Gather Water",
        resourceSearch: "water",
        cancelLabel: "Water gathering canceled.",
      },
    },
    playerState: {
      pixelX: 4,
      pixelY: 5,
      stats: { gatherRadius: 30 },
    },
    getMapWidth: () => 20,
    getMapHeight: () => 20,
    getMovementSnapshot: () => ({ active: false }),
    computeMoveStepCost: () => 1,
    getResourceMovementBias: (resourceId, x) => (resourceId === "water" && x === 5 ? 100 : 1),
    getResourceValue: () => 0.8,
    getResourceSearchChance: () => 1,
    replaceMovementQueue: (path) => {
      queuedTarget = path.at(-1);
      return true;
    },
    random: () => 0.99,
    onResourceSearch: () => {
      searchCalls += 1;
    },
    onResourceFound: (payload) => {
      rewards.push(payload);
      return { ok: true, itemName: "Waterskin" };
    },
    setActivitySnapshot: () => {},
    requestOverlayDraw: () => {},
    setStatus: () => {},
  });

  assert.equal(runtime.startGatherWater().ok, true);
  assert.equal(queuedTarget.x, 5);
  runtime.onStepCompleted({ toX: 5, toY: 5 });

  assert.equal(searchCalls, 1);
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0].resourceId, "water");
  assert.equal(runtime.getSnapshot().type, "gather_water");
  assert.equal(runtime.getSnapshot().lastResourceValue, 0.8);
  assert.equal(runtime.getSnapshot().lastSearchChance, 1);
  assert.equal(runtime.getSnapshot().lastMessage, "Found Waterskin.");
});
