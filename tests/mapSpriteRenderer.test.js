import test from "node:test";
import assert from "node:assert/strict";

import {
  applyTransparentColorKeyToImageData,
  packMapSpriteVertices,
  resolveMapSpriteSourceFrameRect,
} from "../src/render/mapSpriteRenderer.js";

const STRIDE = 9;

test("map sprite vertex packing creates two triangles per structure", () => {
  const vertices = packMapSpriteVertices([
    {
      pixelX: 2,
      pixelY: 3,
      visualWidthPx: 4,
      visualHeightPx: 5,
      spriteSlot: 9,
    },
  ], {
    slotWidth: 32,
    slotHeight: 32,
    atlasWidth: 256,
    atlasHeight: 256,
    color: [1, 1, 1, 1],
  });

  assert.equal(vertices.length, 6 * STRIDE);
  assert.deepEqual(Array.from(vertices.slice(0, STRIDE)), [
    2, 3,
    0.125, 0.25,
    1, 1, 1, 1, -1,
  ]);
  assert.deepEqual(Array.from(vertices.slice(STRIDE, STRIDE * 2)), [
    6, 3,
    0.25, 0.25,
    1, 1, 1, 1, -1,
  ]);
  assert.deepEqual(Array.from(vertices.slice(STRIDE * 5, STRIDE * 6)), [
    6, 8,
    0.25, 0.125,
    1, 1, 1, 1, -1,
  ]);
});

test("map sprite vertex packing wraps atlas slots to available grid", () => {
  const vertices = packMapSpriteVertices([
    {
      pixelX: 0,
      pixelY: 0,
      visualWidthPx: 1,
      visualHeightPx: 1,
      spriteSlot: 65,
    },
  ], {
    slotWidth: 32,
    slotHeight: 32,
    atlasWidth: 256,
    atlasHeight: 256,
  });

  assert.deepEqual(Array.from(vertices.slice(0, 4)), [0, 0, 0.125, 0.125]);
});

test("map sprite vertex packing preserves fractional map coordinates", () => {
  const vertices = packMapSpriteVertices([
    {
      pixelX: 2.25,
      pixelY: 3.5,
      visualWidthPx: 1.5,
      visualHeightPx: 2.25,
      spriteSlot: 0,
    },
  ], {
    slotWidth: 32,
    slotHeight: 32,
    atlasWidth: 32,
    atlasHeight: 32,
  });

  assert.deepEqual(Array.from(vertices.slice(0, 2)), [2.25, 3.5]);
  assert.deepEqual(Array.from(vertices.slice(STRIDE, STRIDE + 2)), [3.75, 3.5]);
  assert.deepEqual(Array.from(vertices.slice(STRIDE * 5, (STRIDE * 5) + 2)), [3.75, 5.75]);
});

test("map sprite vertex packing accepts agent render items", () => {
  const vertices = packMapSpriteVertices([
    {
      id: "player",
      owner: "player",
      pixelX: 10,
      pixelY: 11,
      visualWidthPx: 1,
      visualHeightPx: 1,
      spriteSlot: 2,
    },
  ], {
    slotWidth: 32,
    slotHeight: 32,
    atlasWidth: 128,
    atlasHeight: 32,
  });

  assert.equal(vertices.length, 6 * STRIDE);
  assert.deepEqual(Array.from(vertices.slice(0, 4)), [10, 11, 0.5, 1]);
});

test("map sprite vertex packing forces sprite color alpha to opaque", () => {
  const vertices = packMapSpriteVertices([
    {
      pixelX: 0,
      pixelY: 0,
      visualWidthPx: 1,
      visualHeightPx: 1,
      spriteSlot: 0,
      opacity: 0.25,
      tint: "#336699",
    },
  ], {
    slotWidth: 32,
    slotHeight: 32,
    atlasWidth: 32,
    atlasHeight: 32,
  });

  assert.equal(vertices[7], 1);
});

test("map sprite vertex packing stores grayscale LUT row for palette sprites", () => {
  const vertices = packMapSpriteVertices([
    {
      pixelX: 0,
      pixelY: 0,
      visualWidthPx: 1,
      visualHeightPx: 1,
      spriteSlot: 0,
      paletteMode: "grayscale-lut",
      paletteRow: 12,
    },
  ], {
    slotWidth: 32,
    slotHeight: 32,
    atlasWidth: 32,
    atlasHeight: 32,
  });

  assert.equal(vertices[8], 12);
});

test("transparent color key turns exact matching pixels into alpha cutout", () => {
  const imageData = {
    data: new Uint8ClampedArray([
      255, 255, 255, 255,
      254, 255, 255, 255,
      0, 0, 0, 255,
    ]),
  };

  applyTransparentColorKeyToImageData(imageData, "#ffffff", 0);

  assert.deepEqual(Array.from(imageData.data), [
    255, 255, 255, 0,
    254, 255, 255, 255,
    0, 0, 0, 255,
  ]);
});

test("map sprite source frame uses whole image when no explicit source slot is provided", () => {
  const rect = resolveMapSpriteSourceFrameRect(
    { width: 128, height: 128 },
    { frameCount: 1, frameIndex: 0 },
    32,
    32,
  );

  assert.deepEqual(rect, {
    x: 0,
    y: 0,
    width: 128,
    height: 128,
  });
});

test("map sprite source frame uses explicit slot width for animated strips", () => {
  const rect = resolveMapSpriteSourceFrameRect(
    { width: 192, height: 32 },
    {
      frameCount: 6,
      frameIndex: 2,
      sourceSlotWidth: 32,
      sourceSlotHeight: 32,
    },
    64,
    64,
  );

  assert.deepEqual(rect, {
    x: 64,
    y: 0,
    width: 32,
    height: 32,
  });
});

test("map sprite source frame supports explicit 64px player source slots", () => {
  const rect = resolveMapSpriteSourceFrameRect(
    { width: 64, height: 64 },
    {
      frameCount: 1,
      frameIndex: 0,
      sourceSlotWidth: 64,
      sourceSlotHeight: 64,
    },
    64,
    64,
  );

  assert.deepEqual(rect, {
    x: 0,
    y: 0,
    width: 64,
    height: 64,
  });
});

test("map sprite vertex packing rotates quads around render origin", () => {
  const vertices = packMapSpriteVertices([
    {
      pixelX: 9,
      pixelY: 19,
      visualWidthPx: 2,
      visualHeightPx: 2,
      rotationOriginX: 10,
      rotationOriginY: 20,
      rotationRadians: Math.PI / 2,
      spriteSlot: 0,
    },
  ], {
    slotWidth: 32,
    slotHeight: 32,
    atlasWidth: 32,
    atlasHeight: 32,
  });

  assert.deepEqual(Array.from(vertices.slice(0, 2)), [11, 19]);
  assert.deepEqual(Array.from(vertices.slice(STRIDE, STRIDE + 2)), [11, 21]);
  assert.deepEqual(Array.from(vertices.slice(STRIDE * 2, (STRIDE * 2) + 2)), [9, 19]);
  assert.deepEqual(Array.from(vertices.slice(STRIDE * 5, (STRIDE * 5) + 2)), [9, 21]);
});

test("map sprite vertex packing returns empty buffer for empty structures", () => {
  const vertices = packMapSpriteVertices([], {});

  assert.equal(vertices.length, 0);
});
