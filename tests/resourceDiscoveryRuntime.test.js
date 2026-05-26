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

test("resource discovery can reveal with linear falloff while preserving hard brush at zero", () => {
  const searches = normalizeResourceSearches({
    water: {
      map: "wetness",
      discovery: {
        gridSize: 64,
        movementRevealRadius: 16,
      },
    },
  });
  let revealFalloff = 0;
  const runtime = createResourceDiscoveryRuntime({
    resourceSearches: searches,
    getMapWidth: () => 64,
    getMapHeight: () => 64,
    getDiscoveryConfig: () => ({
      gridSize: 64,
      movementRevealRadius: 16,
      revealFalloff,
    }),
  });

  runtime.revealMovement("water", 32, 32);
  assert.equal(runtime.sampleKnowledge("water", 44, 32), 1);

  runtime.fill("water", 0);
  revealFalloff = 1;
  runtime.revealMovement("water", 32, 32);
  assert.equal(runtime.sampleKnowledge("water", 32, 32), 1);
  assert.ok(runtime.sampleKnowledge("water", 40, 32) > runtime.sampleKnowledge("water", 44, 32));
  assert.ok(runtime.sampleKnowledge("water", 44, 32) > 0);
  assert.ok(runtime.sampleKnowledge("water", 44, 32) < 1);
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

test("resource discovery fills deterministic noise", () => {
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
  });

  assert.equal(runtime.fillNoise("water", { seed: 7, scale: 3, min: 0.2, max: 0.8 }), true);
  const first = Array.from(runtime.getSnapshot("water").cells);
  assert.ok(first.some((value) => value > Math.round(0.2 * 255)));
  assert.ok(first.every((value) => value >= Math.round(0.2 * 255) && value <= Math.round(0.8 * 255)));

  runtime.fill("water", 0);
  runtime.fillNoise("water", { seed: 7, scale: 3, min: 0.2, max: 0.8 });
  assert.deepEqual(Array.from(runtime.getSnapshot("water").cells), first);

  runtime.fillNoise("water", { seed: 8, scale: 3, min: 0.2, max: 0.8 });
  assert.notDeepEqual(Array.from(runtime.getSnapshot("water").cells), first);
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

test("resource discovery applies reveal radius multipliers", () => {
  const searches = normalizeResourceSearches({
    water: {
      map: "wetness",
      discovery: {
        gridSize: 64,
        movementRevealRadius: 10,
      },
    },
  });
  const runtime = createResourceDiscoveryRuntime({
    resourceSearches: searches,
    getMapWidth: () => 64,
    getMapHeight: () => 64,
    getRevealRadiusMultiplier: () => 0.4,
  });

  assert.equal(runtime.resolveRevealRadius("water", 10), 4);
  runtime.revealMovement("water", 32, 32);
  assert.equal(runtime.sampleKnowledge("water", 32, 32), 1);
  assert.equal(runtime.sampleKnowledge("water", 39, 32), 0);
});

test("resource discovery decays known cells by configured game ticks", () => {
  const searches = normalizeResourceSearches({
    water: {
      map: "wetness",
      discovery: {
        gridSize: 8,
        movementRevealRadius: 10,
      },
    },
  });
  let changed = 0;
  const runtime = createResourceDiscoveryRuntime({
    resourceSearches: searches,
    getMapWidth: () => 64,
    getMapHeight: () => 64,
    getDecayConfig: () => ({
      enabled: true,
      intervalTicks: 3,
      amount: 10,
    }),
    onChange: () => {
      changed += 1;
    },
  });

  runtime.fill("water", 1);
  assert.equal(runtime.sampleKnowledge("water", 32, 32), 1);
  runtime.update({ time: { ticksProcessed: 2 } });
  assert.equal(runtime.sampleKnowledge("water", 32, 32), 1);
  runtime.update({ time: { ticksProcessed: 1 } });
  assert.equal(runtime.getSnapshot("water").cells[0], 245);
  assert.equal(runtime.sampleKnowledge("water", 32, 32), 245 / 255);
  runtime.decay("water", 999);
  assert.equal(runtime.sampleKnowledge("water", 32, 32), 0);
  assert.ok(changed >= 3);
});

test("resource discovery can alias resources to one shared knowledge map", () => {
  const runtime = createResourceDiscoveryRuntime({
    resourceSearches: {
      water: { discovery: { gridSize: 8, movementRevealRadius: 4 } },
      plants: { discovery: { gridSize: 8, movementRevealRadius: 4 } },
    },
    getMapWidth: () => 16,
    getMapHeight: () => 16,
    getKnowledgeMapId: () => "world",
    onChange: () => {},
  });

  runtime.fill("water", 0);
  runtime.revealCircle("plants", 8, 8, 4, 1);

  assert.equal(runtime.getSnapshot("water").resourceId, "world");
  assert.deepEqual(Array.from(runtime.getSnapshot("water").cells), Array.from(runtime.getSnapshot("plants").cells));
});
