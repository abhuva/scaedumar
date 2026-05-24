import test from "node:test";
import assert from "node:assert/strict";

import { normalizeResourceStockSettings } from "../src/gameplay/resourceStockRegistry.js";
import { createResourceStockRuntime } from "../src/gameplay/resourceStockRuntime.js";

function createRuntime(overrides = {}) {
  const resourceStockSettings = normalizeResourceStockSettings({
    defaults: {
      gridSize: 8,
      initialStock: 255,
      initialKnownStock: 0,
      depleteAmount: 50,
      neighborDepleteAmount: 25,
      depleteRadius: 1,
      replenishIntervalTicks: 3,
      replenishAmount: 10,
    },
  }, ["water"]);
  return createResourceStockRuntime({
    resourceSearches: { water: { id: "water" } },
    resourceStockSettings,
    getMapWidth: () => 64,
    getMapHeight: () => 64,
    ...overrides,
  });
}

test("resource stock starts full while known stock starts unknown", () => {
  const runtime = createRuntime();

  assert.equal(runtime.sampleFactor("water", 32, 32), 1);
  assert.equal(runtime.sampleKnownFactor("water", 32, 32), 0);
});

test("resource stock reveal copies current stock into known stock", () => {
  const runtime = createRuntime();

  assert.equal(runtime.revealKnown("water", 32, 32, 10), true);
  assert.equal(runtime.sampleKnownFactor("water", 32, 32), 1);
});

test("resource stock depletion writes center and neighbor cells into stock and known stock", () => {
  const runtime = createRuntime();

  runtime.revealKnown("water", 32, 32, 10);
  assert.equal(runtime.deplete("water", 32, 32), true);

  const snapshot = runtime.getSnapshot("water");
  const centerIndex = 4 * snapshot.width + 4;
  const neighborIndex = 4 * snapshot.width + 5;
  assert.equal(snapshot.stock[centerIndex], 205);
  assert.equal(snapshot.knownStock[centerIndex], 205);
  assert.equal(snapshot.stock[neighborIndex], 230);
  assert.equal(snapshot.knownStock[neighborIndex], 230);
});

test("resource stock replenishes true stock but not known stock", () => {
  const runtime = createRuntime();

  runtime.revealKnown("water", 32, 32, 10);
  runtime.deplete("water", 32, 32);
  runtime.update({ time: { ticksProcessed: 2 } });
  assert.equal(runtime.getSnapshot("water").stock[4 * 8 + 4], 205);
  runtime.update({ time: { ticksProcessed: 1 } });
  assert.equal(runtime.getSnapshot("water").stock[4 * 8 + 4], 215);
  assert.equal(runtime.getSnapshot("water").knownStock[4 * 8 + 4], 205);
});

test("resource stock reveal refreshes stale known stock after replenish", () => {
  const runtime = createRuntime();

  runtime.revealKnown("water", 32, 32, 10);
  runtime.deplete("water", 32, 32);
  runtime.update({ time: { ticksProcessed: 3 } });
  assert.equal(runtime.sampleKnownFactor("water", 32, 32), 205 / 255);
  runtime.revealKnown("water", 32, 32, 10);
  assert.equal(runtime.sampleKnownFactor("water", 32, 32), 215 / 255);
});

test("resource stock settings can be adjusted at runtime", () => {
  const runtime = createRuntime();

  runtime.updateResourceSettings("water", {
    depleteAmount: 100,
    neighborDepleteAmount: 0,
  });
  runtime.revealKnown("water", 32, 32, 10);
  runtime.deplete("water", 32, 32);

  assert.equal(runtime.getSnapshot("water").stock[4 * 8 + 4], 155);
  assert.equal(runtime.getResourceSettings("water").depleteAmount, 100);
});

test("resource stock debug fill can target live and known stock", () => {
  const runtime = createRuntime();

  runtime.fill("water", 128, "both");

  assert.equal(runtime.getSnapshot("water").stock[0], 128);
  assert.equal(runtime.getSnapshot("water").knownStock[0], 128);
});

test("resource stock serializes and restores live and known fields", () => {
  const runtime = createRuntime();
  runtime.deplete("water", 32, 32);
  runtime.revealKnown("water", 32, 32, 10);

  const serialized = runtime.serializeSettings();
  const restored = createRuntime();
  restored.applySettings(serialized);

  const snapshot = restored.getSnapshot("water");
  assert.deepEqual(Array.from(snapshot.stock), serialized.fields.water.stock);
  assert.deepEqual(Array.from(snapshot.knownStock), serialized.fields.water.knownStock);
  assert.equal(restored.sampleFactor("water", 32, 32), runtime.sampleFactor("water", 32, 32));
  assert.equal(restored.sampleKnownFactor("water", 32, 32), runtime.sampleKnownFactor("water", 32, 32));
});
