import test from "node:test";
import assert from "node:assert/strict";

import { createRenderLutRuntime } from "../src/render/renderLutRuntime.js";

function createSource() {
  return {
    version: 1,
    luts: {
      "animal.bird.dark": {
        stops: [
          { pos: 0, rgb: [0, 0, 0] },
          { pos: 255, rgb: [64, 64, 64] },
        ],
      },
      "animal.bird.pale": {
        stops: [
          { pos: 0, rgb: [128, 128, 128] },
          { pos: 255, rgb: [255, 255, 255] },
        ],
      },
    },
  };
}

test("render LUT runtime exposes registry and debug snapshots", () => {
  const runtime = createRenderLutRuntime({ sourceDefinition: createSource() });

  assert.equal(runtime.getRegistry().height, 2);
  assert.deepEqual(runtime.getDebugSnapshot(), {
    width: 256,
    height: 2,
    rowCount: 2,
    rowIds: ["animal.bird.dark", "animal.bird.pale"],
    duplicateIds: [],
    selectedRow: 0,
  });
  assert.deepEqual(runtime.getEditableLutSummaries(), [
    { id: "animal.bird.dark", type: "grayscale-ramp", row: 0 },
    { id: "animal.bird.pale", type: "grayscale-ramp", row: 1 },
  ]);
});

test("render LUT runtime owns selected row and preview image data", () => {
  const runtime = createRenderLutRuntime({ sourceDefinition: createSource() });

  assert.equal(runtime.setSelectedRow(99), 1);
  assert.equal(runtime.getSelectedRow(), 1);

  const preview = runtime.getPreviewImageData(undefined, { height: 2 });

  assert.equal(preview.width, 256);
  assert.equal(preview.height, 2);
  assert.deepEqual(Array.from(preview.data.slice(0, 4)), [128, 128, 128, 255]);
});

test("render LUT runtime resolves refs and rebuilds from source definitions", () => {
  const runtime = createRenderLutRuntime({ sourceDefinition: createSource() });

  assert.deepEqual(runtime.resolveRows([
    { id: "animal.bird.pale" },
  ]), [1]);

  runtime.rebuild({
    version: 1,
    luts: {
      "ui.test": {
        stops: [
          { pos: 0, rgb: [0, 0, 0] },
          { pos: 255, rgb: [255, 255, 255] },
        ],
      },
    },
  });

  assert.deepEqual(runtime.getDebugSnapshot().rowIds, ["ui.test"]);
  assert.deepEqual(runtime.resolveRows([{ id: "animal.bird.pale" }]), []);
});

test("render LUT runtime source snapshots are isolated", () => {
  const runtime = createRenderLutRuntime({ sourceDefinition: createSource() });
  const snapshot = runtime.getSourceDefinitionSnapshot();

  snapshot.luts["animal.bird.dark"].stops[0].rgb[0] = 255;

  assert.equal(runtime.getSourceDefinitionSnapshot().luts["animal.bird.dark"].stops[0].rgb[0], 0);
});

test("render LUT runtime exposes editable explicit LUT source snapshots", () => {
  const runtime = createRenderLutRuntime({ sourceDefinition: createSource() });
  runtime.setSelectedRowById("animal.bird.pale");

  assert.deepEqual(runtime.getSelectedSourceSnapshot(), {
    id: "animal.bird.pale",
    row: 1,
    type: "grayscale-ramp",
    editable: true,
    generated: false,
    stops: [
      { pos: 0, rgb: [128, 128, 128] },
      { pos: 255, rgb: [255, 255, 255] },
    ],
  });
});

test("render LUT runtime patches explicit stops and can reset runtime edits", () => {
  const runtime = createRenderLutRuntime({ sourceDefinition: createSource() });

  const result = runtime.patchExplicitLutStops("animal.bird.dark", [
    { pos: 0, rgb: [10, 20, 30] },
    { pos: 255, rgb: [40, 50, 60] },
  ]);

  assert.deepEqual(result, { ok: true, id: "animal.bird.dark", row: 0 });
  assert.deepEqual(runtime.getSelectedSourceSnapshot().stops, [
    { pos: 0, rgb: [10, 20, 30] },
    { pos: 255, rgb: [40, 50, 60] },
  ]);

  runtime.resetRuntimeEdits();

  assert.deepEqual(runtime.getSelectedSourceSnapshot().stops, [
    { pos: 0, rgb: [0, 0, 0] },
    { pos: 255, rgb: [64, 64, 64] },
  ]);
});

test("render LUT runtime reports generated variant rows as read-only", () => {
  const runtime = createRenderLutRuntime({
    sourceDefinition: {
      version: 1,
      variants: [
        {
          family: "animal.bird",
          count: 1,
          stops: [
            { pos: 0, rgb: [0, 0, 0] },
            { pos: 255, rgb: [255, 255, 255] },
          ],
        },
      ],
    },
  });

  assert.deepEqual(runtime.getSelectedSourceSnapshot(), {
    id: "animal.bird.variant.00",
    row: 0,
    type: "grayscale-ramp",
    editable: false,
    generated: true,
    family: "animal.bird",
    variantIndex: 0,
    stops: [],
  });
});

test("render LUT runtime exposes generated variants for an explicit base LUT", () => {
  const runtime = createRenderLutRuntime({
    sourceDefinition: {
      version: 1,
      luts: {
        "animal.bird.dark": {
          stops: [
            { pos: 0, rgb: [10, 20, 30] },
            { pos: 255, rgb: [40, 50, 60] },
          ],
        },
      },
      variants: [
        {
          family: "animal.bird",
          baseLutId: "animal.bird.dark",
          count: 2,
          seed: 77,
          positionJitter: 0,
          brightnessJitter: 0,
          colorJitter: 0,
        },
      ],
    },
  });

  assert.deepEqual(runtime.getVariantFamilySummariesForBaseLut("animal.bird.dark"), [
    {
      family: "animal.bird",
      baseLutId: "animal.bird.dark",
      type: "grayscale-ramp",
      count: 2,
      seed: 77,
      positionJitter: 0,
      brightnessJitter: 0,
      colorJitter: 0,
      rowIds: ["animal.bird.variant.00", "animal.bird.variant.01"],
      rows: [1, 2],
    },
  ]);

  const preview = runtime.getVariantPreviewImageDataForBaseLut("animal.bird.dark");

  assert.equal(preview.width, 256);
  assert.equal(preview.height, 2);
  assert.deepEqual(Array.from(preview.data.slice(0, 4)), [10, 20, 30, 255]);
  assert.deepEqual(Array.from(preview.data.slice(256 * 4, (256 * 4) + 4)), [10, 20, 30, 255]);
});

test("render LUT runtime patches variant family settings by base LUT", () => {
  const runtime = createRenderLutRuntime({
    sourceDefinition: {
      version: 1,
      luts: {
        "animal.bird.dark": {
          stops: [
            { pos: 0, rgb: [10, 20, 30] },
            { pos: 255, rgb: [40, 50, 60] },
          ],
        },
      },
      variants: [
        {
          family: "animal.bird",
          baseLutId: "animal.bird.dark",
          count: 2,
          seed: 77,
          positionJitter: 0,
          brightnessJitter: 0,
          colorJitter: 0,
        },
      ],
    },
  });

  assert.deepEqual(runtime.patchVariantFamilyForBaseLut("animal.bird.dark", {
    count: 4,
    seed: 123,
    positionJitter: 5,
    brightnessJitter: 0.2,
    colorJitter: 0.1,
  }), {
    ok: true,
    baseLutId: "animal.bird.dark",
    family: "animal.bird",
    row: 0,
  });

  assert.deepEqual(runtime.getVariantFamilySummariesForBaseLut("animal.bird.dark"), [
    {
      family: "animal.bird",
      baseLutId: "animal.bird.dark",
      type: "grayscale-ramp",
      count: 4,
      seed: 123,
      positionJitter: 5,
      brightnessJitter: 0.2,
      colorJitter: 0.1,
      rowIds: [
        "animal.bird.variant.00",
        "animal.bird.variant.01",
        "animal.bird.variant.02",
        "animal.bird.variant.03",
      ],
      rows: [1, 2, 3, 4],
    },
  ]);
});

test("render LUT runtime uses count zero as disabled variant state", () => {
  const runtime = createRenderLutRuntime({
    sourceDefinition: {
      version: 1,
      luts: {
        "animal.bird.pale": {
          stops: [
            { pos: 0, rgb: [10, 20, 30] },
            { pos: 255, rgb: [40, 50, 60] },
          ],
        },
      },
    },
  });

  assert.deepEqual(runtime.patchVariantFamilyForBaseLut("animal.bird.pale", {
    family: "animal.bird.pale",
    count: 0,
    seed: 99,
    positionJitter: 4,
    brightnessJitter: 0.12,
    colorJitter: 0.08,
  }), {
    ok: true,
    baseLutId: "animal.bird.pale",
    family: "animal.bird.pale",
    row: 0,
  });
  assert.deepEqual(runtime.getVariantFamilySummariesForBaseLut("animal.bird.pale"), []);
  assert.equal(runtime.getVariantPreviewImageDataForBaseLut("animal.bird.pale").height, 0);
  assert.deepEqual(runtime.getSourceDefinitionSnapshot().variants, [
    {
      family: "animal.bird.pale",
      baseLutId: "animal.bird.pale",
      type: "grayscale-ramp",
      count: 0,
      seed: 99,
      positionJitter: 4,
      brightnessJitter: 0.12,
      colorJitter: 0.08,
    },
  ]);

  runtime.patchVariantFamilyForBaseLut("animal.bird.pale", { count: 1 });

  assert.deepEqual(runtime.getVariantFamilySummariesForBaseLut("animal.bird.pale")[0].rowIds, [
    "animal.bird.pale.variant.00",
  ]);
});
