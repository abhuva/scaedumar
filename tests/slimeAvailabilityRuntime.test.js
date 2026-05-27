import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSlimeAvailabilityGrid,
  createEmptySlimeAvailabilityGrid,
  sampleSlimeAvailabilityCircle,
} from "../src/slime/slimeAvailabilityRuntime.js";

test("slime availability grid downsamples red trail channel and normalizes samples", () => {
  const source = new Float32Array([
    1, 0, 0, 1, 0.5, 0, 0, 1,
    0, 0, 0, 1, 0, 0, 0, 1,
  ]);
  const grid = buildSlimeAvailabilityGrid({
    source,
    sourceWidth: 2,
    sourceHeight: 2,
    gridSize: 2,
    effectiveMax: 0.5,
    version: 3,
  });

  assert.equal(grid.width, 2);
  assert.equal(grid.height, 2);
  assert.equal(grid.version, 3);
  assert.deepEqual(Array.from(grid.rawData), [1, 0.5, 0, 0]);
  assert.deepEqual(Array.from(grid.data), [1, 1, 0, 0]);

  const sample = sampleSlimeAvailabilityCircle(grid, {
    x: 1,
    y: 1,
    radius: 2,
    mapWidth: 2,
    mapHeight: 2,
    effectiveMax: 0.5,
  });

  assert.equal(sample.samples, 4);
  assert.equal(sample.rawAverage, 0.375);
  assert.equal(sample.availability, 0.5);
  assert.equal(sample.hotSamples, 1);
  assert.equal(sample.hotRawAverage, 1);
  assert.equal(sample.hotAvailability, 1);
});

test("empty slime availability grid samples as unavailable", () => {
  const grid = createEmptySlimeAvailabilityGrid(8);
  const sample = sampleSlimeAvailabilityCircle(grid, {
    x: 4,
    y: 4,
    radius: 3,
    mapWidth: 8,
    mapHeight: 8,
  });

  assert.equal(sample.rawAverage, 0);
  assert.equal(sample.availability, 0);
});

test("slime availability grid can flip readPixels rows into map coordinates", () => {
  const source = new Float32Array([
    0.25, 0, 0, 1, 0.5, 0, 0, 1,
    0.75, 0, 0, 1, 1, 0, 0, 1,
  ]);
  const grid = buildSlimeAvailabilityGrid({
    source,
    sourceWidth: 2,
    sourceHeight: 2,
    gridSize: 2,
    effectiveMax: 1,
    flipY: true,
  });

  assert.deepEqual(Array.from(grid.rawData), [0.75, 1, 0.25, 0.5]);
});
