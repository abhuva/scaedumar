import test from "node:test";
import assert from "node:assert/strict";

import { createPathfindingCostModel } from "../src/gameplay/pathfindingCostModel.js";

function createImageData(value) {
  return {
    width: 4,
    height: 4,
    data: new Uint8ClampedArray(Array.from({ length: 4 * 4 * 4 }, (_, index) => (
      index % 4 === 0 ? value : 255
    ))),
  };
}

function createCostModel(overrides = {}) {
  return createPathfindingCostModel({
    clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
    playerState: { pixelX: 1, pixelY: 1 },
    getMapSize: () => ({ width: 4, height: 4 }),
    getPathfindingStateSnapshot: () => ({
      range: 5,
      slopeCutoff: 90,
      weightSlope: 0,
      weightHeight: 0,
      weightWater: 0,
      baseCost: 1,
    }),
    getSlopeImageData: () => createImageData(0),
    getHeightImageData: () => createImageData(0),
    getWaterImageData: () => createImageData(0),
    ...overrides,
  });
}

test("pathfinding cost model treats blocking structures as impassable destinations", () => {
  const model = createCostModel({
    isStructureMovementBlocked: (x, y) => x === 2 && y === 1,
  });

  assert.equal(model.computeMoveStepCost(1, 1, 2, 1), Number.POSITIVE_INFINITY);
  assert.equal(model.computeMoveStepCost(1, 1, 1, 2), 1);
  assert.equal(model.computeTerrainStepCost(1, 1, 2, 1), 1);
});
