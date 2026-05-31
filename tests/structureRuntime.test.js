import test from "node:test";
import assert from "node:assert/strict";

import {
  createStructureRuntime,
  getStructureFootprintBounds,
  getStructureFootprintCells,
  getStructureVisualBounds,
} from "../src/gameplay/structureRuntime.js";

function createData() {
  return {
    version: 1,
    types: [
      {
        id: "cache",
        spriteId: "cache_bundle",
        spriteSrc: "assets/sprites/structures/default/cache_bundle.png",
        visualWidthPx: 2,
        visualHeightPx: 2,
        footprint: { width: 2, height: 2, mask: [1, 1, 1, 1] },
        blocksMovement: true,
        capabilities: ["container"],
        stateDefaults: { hidden: false },
      },
      {
        id: "campfire",
        spriteId: "campfire_unlit",
        visualWidthPx: 1,
        visualHeightPx: 1,
        capabilities: ["heat"],
      },
    ],
    structures: [
      { id: "cache_001", type: "cache", pixelX: 2, pixelY: 3, state: { hidden: true } },
    ],
  };
}

function createRuntime() {
  return createStructureRuntime({
    getMapSize: () => ({ width: 16, height: 16 }),
  });
}

test("applies structure data and serializes it", () => {
  const runtime = createRuntime();
  runtime.applyStructureData(createData());

  const serialized = runtime.serializeStructureData();
  assert.equal(serialized.structures.length, 1);
  assert.equal(serialized.structures[0].id, "cache_001");
  assert.equal(serialized.types.length, 2);
});

test("snapshot is isolated from runtime state", () => {
  const runtime = createRuntime();
  runtime.applyStructureData(createData());

  const snapshot = runtime.getStructureSnapshot();
  snapshot.structures[0].state.hidden = false;
  snapshot.types[0].footprint.mask[0] = 0;

  const next = runtime.getStructureSnapshot();
  assert.equal(next.structures[0].state.hidden, true);
  assert.equal(next.types[0].footprint.mask[0], 1);
});

test("render snapshot includes source sprite metadata", () => {
  const runtime = createRuntime();
  runtime.applyStructureData(createData());

  const snapshot = runtime.getStructureRenderSnapshot();

  assert.equal(snapshot.structures[0].spriteId, "cache_bundle");
  assert.equal(snapshot.structures[0].spriteSrc, "assets/sprites/structures/default/cache_bundle.png");
});

test("pure footprint helpers resolve cells and bounds from anchor", () => {
  const type = {
    visualWidthPx: 4,
    visualHeightPx: 3,
    footprint: { width: 3, height: 2, mask: [1, 0, 1, 0, 1, 1] },
  };
  const structure = { pixelX: 5, pixelY: 7 };

  assert.deepEqual(getStructureFootprintBounds(type, structure), {
    x: 5,
    y: 7,
    width: 3,
    height: 2,
  });
  assert.deepEqual(getStructureVisualBounds(type, structure), {
    x: 5,
    y: 7,
    width: 4,
    height: 3,
  });
  assert.deepEqual(getStructureFootprintCells(type, structure), [
    { x: 5, y: 7 },
    { x: 7, y: 7 },
    { x: 6, y: 8 },
    { x: 7, y: 8 },
  ]);
});

test("occupancy queries structure footprint", () => {
  const runtime = createRuntime();
  runtime.applyStructureData(createData());

  assert.equal(runtime.isStructureOccupied(2, 3), true);
  assert.equal(runtime.isMovementBlocked(2, 3), true);
  assert.equal(runtime.isStructureOccupied(3, 4), true);
  assert.equal(runtime.isMovementBlocked(4, 4), false);
  assert.equal(runtime.isStructureOccupied(4, 4), false);
  assert.deepEqual(runtime.getMovementBlockedCellsInBounds(0, 0, 2, 3), [
    { x: 2, y: 3 },
  ]);
  assert.equal(runtime.getStructureIdAt(2, 3), "cache_001");
  assert.deepEqual(runtime.getOccupiedCells("cache_001"), [
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 4 },
  ]);
});

test("non-blocking structures occupy cells without blocking movement", () => {
  const runtime = createRuntime();
  const data = createData();
  data.structures.push({ id: "fire_001", type: "campfire", pixelX: 8, pixelY: 9 });
  runtime.applyStructureData(data);

  assert.equal(runtime.isStructureOccupied(8, 9), true);
  assert.equal(runtime.getStructureIdAt(8, 9), "fire_001");
  assert.equal(runtime.isMovementBlocked(8, 9), false);
  assert.deepEqual(runtime.getMovementBlockedCellsInBounds(8, 9, 8, 9), []);
});

test("placement rejects overlap and removal frees occupancy", () => {
  const runtime = createRuntime();
  runtime.applyStructureData(createData());

  const blocked = runtime.placeStructure("campfire", 2, 3, {}, { id: "fire_001" });
  assert.equal(blocked.ok, false);
  assert.match(blocked.reason, /overlaps/);

  assert.equal(runtime.removeStructure("cache_001").ok, true);
  const placed = runtime.placeStructure("campfire", 2, 3, { lit: true }, { id: "fire_001" });
  assert.equal(placed.ok, true);
  assert.equal(runtime.getStructureIdAt(2, 3), "fire_001");
});

test("updates structure state explicitly", () => {
  const runtime = createRuntime();
  runtime.applyStructureData(createData());

  const result = runtime.updateStructureState("cache_001", { hidden: false, condition: 0.5 });
  assert.equal(result.ok, true);

  const structure = runtime.getStructureAtPixel(2, 3);
  assert.deepEqual(structure.state, { hidden: false, condition: 0.5 });
});

test("queries structures by capability and radius", () => {
  const runtime = createRuntime();
  runtime.applyStructureData(createData());
  runtime.placeStructure("campfire", 10, 10, {}, { id: "fire_001" });

  assert.deepEqual(runtime.getStructuresByCapability("container").map((item) => item.id), ["cache_001"]);
  assert.deepEqual(runtime.getStructuresNear(2, 3, 1).map((item) => item.id), ["cache_001"]);
  assert.equal(runtime.getNearestStructureByType("campfire", 10, 11).id, "fire_001");
  assert.equal(runtime.getNearestStructureByType("missing", 10, 11), null);
});

test("apply rejects overlapping sidecar structures", () => {
  const runtime = createRuntime();
  const data = createData();
  data.structures.push({ id: "cache_002", type: "cache", pixelX: 3, pixelY: 4 });

  assert.throws(() => runtime.applyStructureData(data), /overlaps/);
});
