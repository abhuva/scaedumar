import test from "node:test";
import assert from "node:assert/strict";

import { STRUCTURE_DATA_LIMITS, normalizeStructureData } from "../src/gameplay/structureDataSerializer.js";

function createValidData(overrides = {}) {
  return {
    version: 1,
    atlas: {
      src: "assets/structures/default/structures_atlas.png",
      gridColumns: 8,
      gridRows: 8,
      slotWidth: 32,
      slotHeight: 32,
    },
    types: [
      {
        id: "cache",
        spriteId: "cache_bundle",
        spriteSlot: 3,
        spriteSrc: "assets/sprites/structures/default/cache_bundle.png",
        visualWidthPx: 2,
        visualHeightPx: 2,
        footprint: {
          width: 2,
          height: 2,
          mask: [1, 1, 1, 0],
        },
        interactionRadiusPx: 3,
        capabilities: ["container"],
      },
    ],
    structures: [
      {
        id: "cache_001",
        type: "cache",
        pixelX: 10,
        pixelY: 20,
        state: { hidden: true },
      },
    ],
    ...overrides,
  };
}

test("normalizes valid structure data", () => {
  const data = normalizeStructureData(createValidData());

  assert.equal(data.version, 1);
  assert.equal(data.atlas.slotWidth, 32);
  assert.equal(data.types[0].id, "cache");
  assert.equal(data.types[0].spriteSlot, 3);
  assert.equal(data.types[0].spriteSrc, "assets/sprites/structures/default/cache_bundle.png");
  assert.deepEqual(data.types[0].footprint.mask, [1, 1, 1, 0]);
  assert.equal(data.structures[0].id, "cache_001");
  assert.deepEqual(data.structures[0].state, { hidden: true });
});

test("normalizes empty structure data", () => {
  const data = normalizeStructureData(null);

  assert.equal(data.version, 1);
  assert.deepEqual(data.types, []);
  assert.deepEqual(data.structures, []);
});

test("missing optional fields use defaults", () => {
  const data = normalizeStructureData({
    version: 1,
    types: [
      { id: "marker" },
    ],
    structures: [
      { id: "marker_001", type: "marker", pixelX: 4, pixelY: 5 },
    ],
  });

  assert.equal(data.atlas.filter, "nearest");
  assert.equal(data.atlas.slotWidth, 32);
  assert.equal(data.types[0].name, "marker");
  assert.equal(data.types[0].spriteId, "marker");
  assert.equal(data.types[0].spriteSlot, 0);
  assert.equal(data.types[0].spriteSrc, "");
  assert.equal(data.types[0].visualWidthPx, 1);
  assert.equal(data.types[0].visualHeightPx, 1);
  assert.deepEqual(data.types[0].footprint, { width: 1, height: 1, mask: [1] });
  assert.equal(data.types[0].interactionRadiusPx, 0);
  assert.equal(data.types[0].blocksMovement, false);
  assert.deepEqual(data.types[0].capabilities, []);
  assert.deepEqual(data.types[0].stateDefaults, {});
  assert.deepEqual(data.structures[0].state, {});
});

test("unknown future fields are tolerated where intended", () => {
  const data = normalizeStructureData(createValidData({
    futureRootField: { ignored: true },
    atlas: {
      src: "assets/structures/default/structures_atlas.png",
      slotWidth: 32,
      slotHeight: 32,
      gridColumns: 8,
      gridRows: 8,
      futureAtlasField: "ignored",
    },
    types: [
      {
        id: "future_cache",
        visualWidthPx: 1,
        visualHeightPx: 1,
        futureTypeField: "ignored",
        stateDefaults: { quality: "rough", futureNested: { preserved: true } },
      },
    ],
    structures: [
      {
        id: "future_cache_001",
        type: "future_cache",
        pixelX: 2,
        pixelY: 3,
        futureInstanceField: "ignored",
        state: { durability: 0.75, futureNested: { preserved: true } },
      },
    ],
  }));

  assert.equal(data.types[0].futureTypeField, undefined);
  assert.equal(data.structures[0].futureInstanceField, undefined);
  assert.deepEqual(data.types[0].stateDefaults, { quality: "rough", futureNested: { preserved: true } });
  assert.deepEqual(data.structures[0].state, { durability: 0.75, futureNested: { preserved: true } });
});

test("rejects duplicate type ids", () => {
  assert.throws(
    () => normalizeStructureData(createValidData({
      types: [
        { id: "cache", visualWidthPx: 1, visualHeightPx: 1 },
        { id: "cache", visualWidthPx: 1, visualHeightPx: 1 },
      ],
      structures: [],
    })),
    /Duplicate structure type id 'cache'/,
  );
});

test("rejects duplicate structure ids", () => {
  assert.throws(
    () => normalizeStructureData(createValidData({
      structures: [
        { id: "cache_001", type: "cache", pixelX: 1, pixelY: 1 },
        { id: "cache_001", type: "cache", pixelX: 2, pixelY: 2 },
      ],
    })),
    /Duplicate structure instance id 'cache_001'/,
  );
});

test("rejects missing type references", () => {
  assert.throws(
    () => normalizeStructureData(createValidData({
      structures: [
        { id: "bad_001", type: "missing", pixelX: 1, pixelY: 1 },
      ],
    })),
    /references unknown type 'missing'/,
  );
});

test("rejects invalid footprint mask length", () => {
  assert.throws(
    () => normalizeStructureData(createValidData({
      types: [
        {
          id: "bad",
          visualWidthPx: 2,
          visualHeightPx: 2,
          footprint: { width: 2, height: 2, mask: [1, 1] },
        },
      ],
      structures: [],
    })),
    /footprint mask length must be 4/,
  );
});

test("rejects structure data over configured caps", () => {
  assert.throws(
    () => normalizeStructureData(createValidData({
      types: Array.from({ length: STRUCTURE_DATA_LIMITS.maxTypes + 1 }, (_, index) => ({
        id: `type_${index}`,
        visualWidthPx: 1,
        visualHeightPx: 1,
      })),
      structures: [],
    })),
    /exceeds maximum type count/,
  );

  assert.throws(
    () => normalizeStructureData(createValidData({
      structures: Array.from({ length: STRUCTURE_DATA_LIMITS.maxInstances + 1 }, (_, index) => ({
        id: `cache_${index}`,
        type: "cache",
        pixelX: index,
        pixelY: 0,
      })),
    })),
    /exceeds maximum instance count/,
  );
});

test("rejects structure dimensions over configured caps", () => {
  assert.throws(
    () => normalizeStructureData(createValidData({
      types: [{
        id: "too_large_visual",
        visualWidthPx: STRUCTURE_DATA_LIMITS.maxVisualWidthPx + 1,
        visualHeightPx: 1,
      }],
      structures: [],
    })),
    /visualWidthPx/,
  );

  assert.throws(
    () => normalizeStructureData(createValidData({
      types: [{
        id: "too_large_footprint",
        visualWidthPx: 1,
        visualHeightPx: 1,
        footprint: {
          width: STRUCTURE_DATA_LIMITS.maxFootprintWidth + 1,
          height: 1,
        },
      }],
      structures: [],
    })),
    /footprint.width/,
  );
});
