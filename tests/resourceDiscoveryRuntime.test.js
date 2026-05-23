import test from "node:test";
import assert from "node:assert/strict";

import { normalizeResourceSearches } from "../src/gameplay/resourceSearchRegistry.js";
import { createResourceDiscoveryRuntime } from "../src/gameplay/resourceDiscoveryRuntime.js";

test("resource discovery reveals a tunable low-resolution circle", () => {
  const searches = normalizeResourceSearches({
    water: {
      map: "wetness",
      discovery: {
        gridSize: 16,
        movementRevealRadius: 10,
      },
    },
  });
  let changed = 0;
  const runtime = createResourceDiscoveryRuntime({
    resourceSearches: searches,
    getMapWidth: () => 64,
    getMapHeight: () => 64,
    onChange: () => {
      changed += 1;
    },
  });

  assert.equal(runtime.sampleKnowledge("water", 32, 32), 0);
  assert.equal(runtime.revealMovement("water", 32, 32), true);
  assert.equal(runtime.sampleKnowledge("water", 32, 32), 1);
  assert.equal(runtime.sampleKnowledge("water", 0, 0), 0);
  assert.equal(changed, 1);
});

test("resource discovery rebuilds masks when map size changes", () => {
  const searches = normalizeResourceSearches({
    water: {
      map: "wetness",
      discovery: {
        gridSize: 8,
        movementRevealRadius: 10,
      },
    },
  });
  let width = 32;
  const runtime = createResourceDiscoveryRuntime({
    resourceSearches: searches,
    getMapWidth: () => width,
    getMapHeight: () => 32,
  });

  runtime.revealMovement("water", 16, 16);
  assert.equal(runtime.sampleKnowledge("water", 16, 16), 1);
  width = 64;
  assert.equal(runtime.sampleKnowledge("water", 16, 16), 0);
});

test("resource discovery supports debug fill and grid override", () => {
  let gridSize = 8;
  const searches = normalizeResourceSearches({
    water: {
      map: "wetness",
      discovery: {
        gridSize: 8,
        movementRevealRadius: 10,
      },
    },
  });
  const runtime = createResourceDiscoveryRuntime({
    resourceSearches: searches,
    getMapWidth: () => 64,
    getMapHeight: () => 64,
    getDiscoveryConfig: () => ({
      gridSize,
      movementRevealRadius: 10,
    }),
  });

  runtime.fill("water", 1);
  assert.equal(runtime.sampleKnowledge("water", 0, 0), 1);
  runtime.fill("water", 0);
  assert.equal(runtime.sampleKnowledge("water", 0, 0), 0);
  gridSize = 16;
  assert.equal(runtime.getSnapshot("water").width, 16);
  assert.ok(runtime.getVersion("water") > 0);
});

test("resource discovery version changes when movement reveals new cells", () => {
  const searches = normalizeResourceSearches({
    water: {
      map: "wetness",
      discovery: {
        gridSize: 16,
        movementRevealRadius: 4,
      },
    },
  });
  const runtime = createResourceDiscoveryRuntime({
    resourceSearches: searches,
    getMapWidth: () => 64,
    getMapHeight: () => 64,
  });

  const before = runtime.getVersion("water");
  runtime.revealMovement("water", 16, 16);
  const after = runtime.getVersion("water");
  assert.ok(after > before);
});
