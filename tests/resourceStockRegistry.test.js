import test from "node:test";
import assert from "node:assert/strict";

import { normalizeResourceStockSettings } from "../src/gameplay/resourceStockRegistry.js";

test("resource stock settings merge defaults into resources", () => {
  const settings = normalizeResourceStockSettings({
    defaults: {
      gridSize: 64,
      depleteAmount: 30,
      replenishIntervalTicks: 100,
      replenishAmount: 2,
    },
    resources: {
      water: {
        replenishIntervalTicks: 50,
        replenishAmount: 250,
      },
    },
  }, ["berries"]);

  assert.equal(settings.version, 1);
  assert.equal(settings.resources.water.gridSize, 64);
  assert.equal(settings.resources.water.depleteAmount, 30);
  assert.equal(settings.resources.water.replenishIntervalTicks, 50);
  assert.equal(settings.resources.water.replenishAmount, 250);
  assert.equal(settings.resources.berries.gridSize, 64);
  assert.equal(settings.resources.berries.replenishIntervalTicks, 100);
});
