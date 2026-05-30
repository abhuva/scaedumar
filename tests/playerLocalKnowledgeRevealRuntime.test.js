import test from "node:test";
import assert from "node:assert/strict";

import { createPlayerLocalKnowledgeRevealRuntime } from "../src/gameplay/playerLocalKnowledgeRevealRuntime.js";

function createFakeDiscovery() {
  const calls = [];
  return {
    calls,
    resolveKnowledgeMapId: (id) => (id === "tracks" ? "tracks" : "world"),
    getGridCell: (id, x, y) => ({
      resourceId: id === "tracks" ? "tracks" : "world",
      x: Math.floor(Number(x) / 4),
      y: Math.floor(Number(y) / 4),
      width: 16,
      height: 16,
    }),
    withMutationBatch: (callback) => callback(),
    revealMovement: (id, x, y) => {
      calls.push({ id, x, y });
      return true;
    },
    revealCircle: (id, x, y, radius, strength) => {
      calls.push({ id, x, y, radius, strength });
      return true;
    },
  };
}

function createFakeStock() {
  const calls = [];
  return {
    calls,
    withMutationBatch: (callback) => callback(),
    revealKnown: (id, x, y, radius) => {
      calls.push({ id, x, y, radius });
      return true;
    },
  };
}

test("player local knowledge reveal writes canonical world and tracks once", () => {
  const discovery = createFakeDiscovery();
  const stock = createFakeStock();
  const runtime = createPlayerLocalKnowledgeRevealRuntime({
    worldKnowledgeMapId: "world",
    tracksKnowledgeMapId: "tracks",
    resourceDiscoveryRuntime: discovery,
    resourceStockRuntime: stock,
    getObservedStockResourceIds: () => [],
  });

  const result = runtime.revealAt(8, 12);

  assert.equal(result.changed, true);
  assert.deepEqual(discovery.calls.map((call) => call.id), ["tracks", "world"]);
  assert.deepEqual(stock.calls, []);
});

test("player local knowledge reveal skips repeated reveals inside same grid cell", () => {
  const discovery = createFakeDiscovery();
  const runtime = createPlayerLocalKnowledgeRevealRuntime({
    worldKnowledgeMapId: "world",
    tracksKnowledgeMapId: "tracks",
    resourceDiscoveryRuntime: discovery,
    getObservedStockResourceIds: () => [],
  });

  runtime.revealAt(8, 12);
  runtime.revealAt(9, 13);
  runtime.revealAt(12, 12);

  assert.deepEqual(discovery.calls.map((call) => `${call.id}:${call.x},${call.y}`), [
    "tracks:8,12",
    "world:8,12",
    "tracks:12,12",
    "world:12,12",
  ]);
});

test("player local knowledge reveal refreshes only observed stock resources when world changed", () => {
  const discovery = createFakeDiscovery();
  const stock = createFakeStock();
  const runtime = createPlayerLocalKnowledgeRevealRuntime({
    worldKnowledgeMapId: "world",
    tracksKnowledgeMapId: "tracks",
    resourceDiscoveryRuntime: discovery,
    resourceStockRuntime: stock,
    getObservedStockResourceIds: () => ["water"],
    resolveStockRevealRadius: (id) => (id === "water" ? 80 : 40),
  });

  runtime.revealAt(8, 12);
  runtime.revealAt(9, 13);

  assert.deepEqual(stock.calls, [
    { id: "water", x: 8, y: 12, radius: 80 },
  ]);
});

test("player local knowledge reveal refreshes observed stock for a new cell even when bytes did not change", () => {
  const discovery = createFakeDiscovery();
  discovery.revealMovement = (id, x, y) => {
    discovery.calls.push({ id, x, y });
    return false;
  };
  const stock = createFakeStock();
  const runtime = createPlayerLocalKnowledgeRevealRuntime({
    worldKnowledgeMapId: "world",
    tracksKnowledgeMapId: "tracks",
    resourceDiscoveryRuntime: discovery,
    resourceStockRuntime: stock,
    getObservedStockResourceIds: () => ["plants"],
    resolveStockRevealRadius: () => 40,
  });

  const result = runtime.revealAt(8, 12);

  assert.equal(result.worldChanged, false);
  assert.equal(result.worldObserved, true);
  assert.deepEqual(stock.calls, [
    { id: "plants", x: 8, y: 12, radius: 40 },
  ]);
});

test("player local knowledge reveal does not refresh stock while staying in same world cell", () => {
  const discovery = createFakeDiscovery();
  const stock = createFakeStock();
  const runtime = createPlayerLocalKnowledgeRevealRuntime({
    worldKnowledgeMapId: "world",
    tracksKnowledgeMapId: "tracks",
    resourceDiscoveryRuntime: discovery,
    resourceStockRuntime: stock,
    getObservedStockResourceIds: () => ["water"],
    resolveStockRevealRadius: () => 80,
  });

  runtime.revealAt(8, 12);
  runtime.revealAt(9, 13);

  assert.deepEqual(stock.calls, [
    { id: "water", x: 8, y: 12, radius: 80 },
  ]);
});

test("player local knowledge reveal can explicitly refresh observed stock", () => {
  const stock = createFakeStock();
  const runtime = createPlayerLocalKnowledgeRevealRuntime({
    resourceStockRuntime: stock,
    resolveStockRevealRadius: () => 64,
  });

  assert.equal(runtime.revealObservedStockAt("plants", 10, 20), true);
  assert.deepEqual(stock.calls, [
    { id: "plants", x: 10, y: 20, radius: 64 },
  ]);
});

test("player local knowledge reveal can reveal world only with an explicit scout radius", () => {
  const discovery = createFakeDiscovery();
  const stock = createFakeStock();
  const runtime = createPlayerLocalKnowledgeRevealRuntime({
    worldKnowledgeMapId: "world",
    tracksKnowledgeMapId: "tracks",
    revealTracks: false,
    resourceDiscoveryRuntime: discovery,
    resourceStockRuntime: stock,
    getObservedStockResourceIds: () => ["water"],
    resolveStockRevealRadius: (_id, radius) => Number(radius) || 80,
  });

  runtime.revealAt(8, 12, {
    revealTracks: false,
    worldRevealRadius: 160,
    stockRevealRadius: 160,
  });
  runtime.revealAt(9, 13, {
    revealTracks: false,
    worldRevealRadius: 160,
    stockRevealRadius: 160,
  });

  assert.deepEqual(discovery.calls, [
    { id: "world", x: 8, y: 12, radius: 160, strength: 1 },
  ]);
  assert.deepEqual(stock.calls, [
    { id: "water", x: 8, y: 12, radius: 160 },
  ]);
});

test("player local knowledge reveal re-runs same-cell reveal when explicit radius changes", () => {
  const discovery = createFakeDiscovery();
  const runtime = createPlayerLocalKnowledgeRevealRuntime({
    worldKnowledgeMapId: "world",
    tracksKnowledgeMapId: "tracks",
    revealTracks: false,
    resourceDiscoveryRuntime: discovery,
    getObservedStockResourceIds: () => [],
  });

  runtime.revealAt(8, 12, { worldRevealRadius: 120 });
  runtime.revealAt(9, 13, { worldRevealRadius: 160 });

  assert.deepEqual(discovery.calls, [
    { id: "world", x: 8, y: 12, radius: 120, strength: 1 },
    { id: "world", x: 9, y: 13, radius: 160, strength: 1 },
  ]);
});
