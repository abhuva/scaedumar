import test from "node:test";
import assert from "node:assert/strict";

import {
  buildGatheringMoveCandidates,
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
  assert.equal(snapshots.at(-1).inspectX, 7);
});
