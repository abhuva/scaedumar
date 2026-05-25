import test from "node:test";
import assert from "node:assert/strict";

import { createRoutePlanningCostModel } from "../src/gameplay/routePlanningCostModel.js";

function imageData(width, height, values) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    const value = values[i] || 0;
    data[i * 4] = value;
    data[i * 4 + 1] = value;
    data[i * 4 + 2] = value;
    data[i * 4 + 3] = 255;
  }
  return { width, height, data };
}

test("route planning terrain grid averages source map blocks", () => {
  const model = createRoutePlanningCostModel({
    getMapSize: () => ({ width: 4, height: 4 }),
    getSlopeImageData: () => imageData(4, 4, [
      0, 10, 100, 110,
      20, 30, 120, 130,
      40, 50, 140, 150,
      60, 70, 160, 170,
    ]),
    getHeightImageData: () => imageData(4, 4, []),
    getWaterImageData: () => imageData(4, 4, []),
  });

  const grid = model.getTerrainGrid({ gridSize: 2 });

  assert.equal(grid.width, 2);
  assert.equal(grid.height, 2);
  assert.equal(Math.round(grid.slopeMap[0] * 255), 15);
  assert.equal(Math.round(grid.slopeMap[1] * 255), 115);
  assert.equal(Math.round(grid.slopeMap[2] * 255), 55);
  assert.equal(Math.round(grid.slopeMap[3] * 255), 155);
});

test("route planning step cost scales low-res steps by source map pixels", () => {
  const model = createRoutePlanningCostModel({
    getMapSize: () => ({ width: 4, height: 4 }),
    getSlopeImageData: () => imageData(4, 4, []),
    getHeightImageData: () => imageData(4, 4, []),
    getWaterImageData: () => imageData(4, 4, []),
  });
  const settings = {
    gridSize: 2,
    baseCost: 1,
    weightSlope: 0,
    weightHeight: 0,
    weightWater: 0,
    slopeCutoff: 1,
  };
  const grid = model.getTerrainGrid(settings);

  assert.equal(model.computeRouteStepCost(0, 0, 1, 0, grid, settings), 2);
  assert.equal(Number(model.computeRouteStepCost(0, 0, 1, 1, grid, settings).toFixed(3)), 2.828);
});

test("route planning step cost rejects out-of-bounds source cells", () => {
  const model = createRoutePlanningCostModel({
    getMapSize: () => ({ width: 4, height: 4 }),
    getSlopeImageData: () => imageData(4, 4, []),
    getHeightImageData: () => imageData(4, 4, []),
    getWaterImageData: () => imageData(4, 4, []),
  });
  const grid = model.getTerrainGrid({ gridSize: 2 });

  assert.equal(model.computeRouteStepCost(-1, 0, 1, 0, grid), Number.POSITIVE_INFINITY);
  assert.equal(model.computeRouteStepCost(0, 2, 1, 0, grid), Number.POSITIVE_INFINITY);
});
