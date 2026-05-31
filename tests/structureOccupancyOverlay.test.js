import test from "node:test";
import assert from "node:assert/strict";

import { buildStructureOccupancyOverlayCells, buildStructurePlacementPreviewCells } from "../src/ui/overlays/structureOccupancyOverlay.js";

test("buildStructureOccupancyOverlayCells expands footprint masks", () => {
  const cells = buildStructureOccupancyOverlayCells({
    types: [
      {
        id: "tent",
        footprint: { width: 3, height: 2, mask: [1, 0, 1, 1, 1, 0] },
      },
    ],
    structures: [
      { id: "tent_001", type: "tent", pixelX: 10, pixelY: 20 },
    ],
  }, "tent_001");

  assert.deepEqual(cells, [
    { x: 10, y: 20, structureId: "tent_001", selected: true },
    { x: 12, y: 20, structureId: "tent_001", selected: true },
    { x: 10, y: 21, structureId: "tent_001", selected: true },
    { x: 11, y: 21, structureId: "tent_001", selected: true },
  ]);
});

test("buildStructureOccupancyOverlayCells skips structures with missing types", () => {
  const cells = buildStructureOccupancyOverlayCells({
    types: [],
    structures: [
      { id: "missing_001", type: "missing", pixelX: 1, pixelY: 2 },
    ],
  }, "");

  assert.deepEqual(cells, []);
});

test("buildStructurePlacementPreviewCells expands candidate footprint with aggregate validity", () => {
  const cells = buildStructurePlacementPreviewCells({
    snapshot: {
      types: [
        {
          id: "tent",
          footprint: { width: 2, height: 2, mask: [1, 1, 0, 1] },
        },
      ],
    },
    typeId: "tent",
    pixelX: 4,
    pixelY: 5,
    placement: { ok: false },
  });

  assert.deepEqual(cells, [
    { x: 4, y: 5, valid: false },
    { x: 5, y: 5, valid: false },
    { x: 5, y: 6, valid: false },
  ]);
});
