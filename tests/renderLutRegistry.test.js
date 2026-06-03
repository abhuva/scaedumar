import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildGrayscaleRampRow,
  buildRenderLutPreviewImageData,
  buildRenderLutRegistry,
  expandRenderLutRefIds,
  expandRenderLutRefs,
  expandRenderLutWeightedRefs,
  formatMissingSpritePaletteLutRefs,
  getRenderLutDebugSnapshot,
  getRenderLutRowRgba,
  loadRenderLutRegistry,
  validateRenderLutRefs,
  validateSpritePaletteLutRefs,
} from "../src/render/renderLutRegistry.js";

test("grayscale ramp rows interpolate between color stops", () => {
  const row = buildGrayscaleRampRow([
    { pos: 0, rgb: [0, 0, 0] },
    { pos: 128, rgb: [128, 64, 32] },
    { pos: 255, rgb: [255, 255, 255] },
  ]);

  assert.deepEqual(Array.from(row.slice(0, 4)), [0, 0, 0, 255]);
  assert.deepEqual(Array.from(row.slice(128 * 4, (128 * 4) + 4)), [128, 64, 32, 255]);
  assert.deepEqual(Array.from(row.slice(255 * 4, (255 * 4) + 4)), [255, 255, 255, 255]);
});

test("render LUT registry builds explicit IDs and fixed two-digit variant IDs", () => {
  const registry = buildRenderLutRegistry({
    version: 1,
    luts: {
      "animal.bird.dark": {
        stops: [
          { pos: 0, rgb: [0, 0, 0] },
          { pos: 255, rgb: [255, 255, 255] },
        ],
      },
    },
    variants: [
      {
        family: "animal.bird",
        count: 3,
        seed: 1,
        stops: [
          { pos: 0, rgb: [10, 10, 10] },
          { pos: 255, rgb: [200, 200, 200] },
        ],
      },
    ],
  });

  assert.equal(registry.width, 256);
  assert.equal(registry.height, 4);
  assert.equal(registry.rowsById["animal.bird.dark"], 0);
  assert.equal(registry.rowsById["animal.bird.variant.00"], 1);
  assert.equal(registry.rowsById["animal.bird.variant.02"], 3);
  assert.deepEqual(registry.rowIds, [
    "animal.bird.dark",
    "animal.bird.variant.00",
    "animal.bird.variant.01",
    "animal.bird.variant.02",
  ]);
  assert.deepEqual(expandRenderLutRefs([
    { id: "animal.bird.dark" },
    { range: { family: "animal.bird", start: 1, count: 2 } },
  ], registry), [0, 2, 3]);
  assert.deepEqual(expandRenderLutRefIds([
    { id: "animal.bird.dark" },
    { range: { family: "animal.bird", start: 1, count: 2 } },
  ]), [
    "animal.bird.dark",
    "animal.bird.variant.01",
    "animal.bird.variant.02",
  ]);
  assert.deepEqual(expandRenderLutWeightedRefs([
    { id: "animal.bird.dark", weight: 4 },
    { range: { family: "animal.bird", start: 1, count: 2 }, weight: 0.5 },
  ], registry), [
    { id: "animal.bird.dark", row: 0, weight: 4, tags: [] },
    { id: "animal.bird.variant.01", row: 2, weight: 0.5, tags: [] },
    { id: "animal.bird.variant.02", row: 3, weight: 0.5, tags: [] },
  ]);
  assert.deepEqual(expandRenderLutWeightedRefs([
    { id: "animal.bird.dark", rare: true, tags: ["winter", "winter"] },
    { range: { family: "animal.bird", start: 1, count: 1 }, rare: true, weight: 0.25, tags: ["forest"] },
  ], registry), [
    { id: "animal.bird.dark", row: 0, weight: 0.1, tags: ["winter"] },
    { id: "animal.bird.variant.01", row: 2, weight: 0.25, tags: ["forest"] },
  ]);
});

test("render LUT variants can derive stops from an explicit base LUT", () => {
  const registry = buildRenderLutRegistry({
    version: 1,
    luts: {
      "animal.bird.dark": {
        stops: [
          { pos: 0, rgb: [12, 13, 14] },
          { pos: 255, rgb: [90, 91, 92] },
        ],
      },
    },
    variants: [
      {
        family: "animal.bird",
        baseLutId: "animal.bird.dark",
        count: 1,
        seed: 1,
        positionJitter: 0,
        brightnessJitter: 0,
        colorJitter: 0,
        stops: [
          { pos: 0, rgb: [200, 200, 200] },
          { pos: 255, rgb: [255, 255, 255] },
        ],
      },
    ],
  });

  const row = getRenderLutRowRgba(registry, registry.rowsById["animal.bird.variant.00"]);

  assert.deepEqual(Array.from(row.slice(0, 4)), [12, 13, 14, 255]);
  assert.deepEqual(Array.from(row.slice(255 * 4, (255 * 4) + 4)), [90, 91, 92, 255]);
  assert.deepEqual(registry.variantFamilies, [
    {
      family: "animal.bird",
      baseLutId: "animal.bird.dark",
      type: "grayscale-ramp",
      count: 1,
      seed: 1,
      positionJitter: 0,
      brightnessJitter: 0,
      colorJitter: 0,
      rowIds: ["animal.bird.variant.00"],
      rows: [1],
    },
  ]);
});

test("render LUT debug snapshots expose row IDs without mutable registry access", () => {
  const registry = buildRenderLutRegistry({
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

  const snapshot = getRenderLutDebugSnapshot(registry);
  snapshot.rowIds.push("mutated");

  assert.deepEqual(getRenderLutDebugSnapshot(registry), {
    width: 256,
    height: 1,
    rowCount: 1,
    rowIds: ["ui.test"],
    duplicateIds: [],
  });
});

test("render LUT registry keeps first duplicate ID and reports duplicates", () => {
  const registry = buildRenderLutRegistry({
    version: 1,
    luts: {
      "animal.bird.variant.00": {
        stops: [
          { pos: 0, rgb: [1, 1, 1] },
          { pos: 255, rgb: [2, 2, 2] },
        ],
      },
    },
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
  });

  assert.equal(registry.height, 1);
  assert.deepEqual(registry.rowIds, ["animal.bird.variant.00"]);
  assert.deepEqual(registry.duplicateIds, ["animal.bird.variant.00"]);
  assert.deepEqual(getRenderLutDebugSnapshot(registry).duplicateIds, ["animal.bird.variant.00"]);
});

test("render LUT preview helpers extract rows and repeat preview height", () => {
  const registry = buildRenderLutRegistry({
    version: 1,
    luts: {
      "ui.black": {
        stops: [
          { pos: 0, rgb: [0, 0, 0] },
          { pos: 255, rgb: [0, 0, 0] },
        ],
      },
      "ui.white": {
        stops: [
          { pos: 0, rgb: [255, 255, 255] },
          { pos: 255, rgb: [255, 255, 255] },
        ],
      },
    },
  });

  const row = getRenderLutRowRgba(registry, 1);
  assert.equal(row.length, 256 * 4);
  assert.deepEqual(Array.from(row.slice(0, 4)), [255, 255, 255, 255]);

  const preview = buildRenderLutPreviewImageData(registry, 1, { height: 3 });
  assert.equal(preview.width, 256);
  assert.equal(preview.height, 3);
  assert.equal(preview.data.length, 256 * 3 * 4);
  assert.deepEqual(
    Array.from(preview.data.slice(256 * 4, (256 * 4) + 4)),
    [255, 255, 255, 255],
  );
});

test("loads render LUT registries", async () => {
  const loadedUrls = [];
  const registry = await loadRenderLutRegistry({
    url: "render_luts.json",
    fetchFn: async (url) => {
      loadedUrls.push(url);
      return {
        ok: true,
        json: async () => ({
          version: 1,
          luts: {
            "ui.test": {
              stops: [
                { pos: 0, rgb: [0, 0, 0] },
                { pos: 255, rgb: [255, 255, 255] },
              ],
            },
          },
        }),
      };
    },
  });

  assert.deepEqual(loadedUrls, ["render_luts.json"]);
  assert.equal(registry.rowsById["ui.test"], 0);
});

test("validates missing render LUT references", () => {
  const registry = buildRenderLutRegistry({
    version: 1,
    luts: {
      "animal.bird.dark": {
        stops: [
          { pos: 0, rgb: [0, 0, 0] },
          { pos: 255, rgb: [255, 255, 255] },
        ],
      },
    },
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
  });

  assert.deepEqual(validateRenderLutRefs([
    { id: "animal.bird.dark" },
    { id: "animal.bird.missing" },
    { range: { family: "animal.bird", start: 0, count: 2 } },
  ], registry), {
    ok: false,
    ids: [
      "animal.bird.dark",
      "animal.bird.missing",
      "animal.bird.variant.00",
      "animal.bird.variant.01",
    ],
    missing: [
      "animal.bird.missing",
      "animal.bird.variant.01",
    ],
  });
});

test("validates sprite palette LUT references with readable details", () => {
  const registry = buildRenderLutRegistry({
    version: 1,
    luts: {
      "animal.bird.dark": {
        stops: [
          { pos: 0, rgb: [0, 0, 0] },
          { pos: 255, rgb: [255, 255, 255] },
        ],
      },
    },
  });
  const validation = validateSpritePaletteLutRefs([
    {
      label: "swarm_sprites",
      sprites: {
        bird: {
          id: "bird",
          palette: {
            mode: "grayscale-lut",
            lutRefs: [
              { id: "animal.bird.dark" },
              { id: "animal.bird.missing" },
            ],
          },
        },
      },
    },
  ], registry);

  assert.deepEqual(validation, {
    ok: false,
    missing: [
      {
        file: "swarm_sprites",
        spriteId: "bird",
        lutId: "animal.bird.missing",
      },
    ],
  });
  assert.equal(
    formatMissingSpritePaletteLutRefs(validation),
    "swarm_sprites:bird -> animal.bird.missing",
  );
});

test("shipped sprite palette LUT references resolve", async () => {
  const registry = buildRenderLutRegistry(JSON.parse(
    await readFile("assets/data/render_luts.json", "utf8"),
  ));
  const swarmSprites = JSON.parse(await readFile("assets/data/agents/swarm_sprites.json", "utf8"));

  assert.deepEqual(validateSpritePaletteLutRefs([
    { label: "swarm_sprites", sprites: swarmSprites.sprites },
  ], registry), {
    ok: true,
    missing: [],
  });
});

test("shipped render LUT registry declares bird variants", async () => {
  const registry = buildRenderLutRegistry(JSON.parse(
    await readFile("assets/data/render_luts.json", "utf8"),
  ));

  assert.equal(registry.width, 256);
  assert.ok(registry.height >= 19);
  assert.equal(registry.rowsById["animal.bird.dark"], 0);
  assert.equal(registry.rowsById["animal.bird.pale"], 1);
  assert.equal(registry.rowsById["animal.bird.rare.white"], 2);
  assert.equal(typeof registry.rowsById["animal.bird.dark.variant.00"], "number");
  assert.equal(typeof registry.rowsById["animal.bird.dark.variant.15"], "number");
});
