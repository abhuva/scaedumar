import test from "node:test";
import assert from "node:assert/strict";

import { normalizeResourceSearches } from "../src/gameplay/resourceSearchRegistry.js";
import {
  computeResourceMovementBias,
  computeResourceSearchChance,
  createResourceSearchRuntime,
  sampleResourceMapValue,
} from "../src/gameplay/resourceSearchRuntime.js";

test("resource search chance uses threshold, curve, scale, and max clamp", () => {
  const search = {
    threshold: 0.25,
    curve: 1.5,
    baseChance: 0.01,
    chanceScale: 0.5,
    maxChance: 0.35,
  };

  assert.equal(computeResourceSearchChance(search, 0), 0.01);
  assert.equal(computeResourceSearchChance(search, 1), 0.35);
  assert.ok(computeResourceSearchChance(search, 0.7) > computeResourceSearchChance(search, 0.4));
});

test("resource movement bias scales with sampled value", () => {
  assert.equal(computeResourceMovementBias({ movementBias: 2.5 }, 0), 1);
  assert.equal(computeResourceMovementBias({ movementBias: 2.5 }, 0.8), 3);
});

test("resource runtime samples configured channel from map image data", () => {
  const resourceSearches = normalizeResourceSearches({
    water: {
      map: "wetness",
      channel: "r",
      threshold: 0,
      baseChance: 0,
      chanceScale: 1,
      maxChance: 1,
      movementBias: 1,
    },
  });
  const imageData = {
    width: 1,
    height: 1,
    data: new Uint8ClampedArray([128, 0, 0, 255]),
  };
  const runtime = createResourceSearchRuntime({
    resourceSearches,
    getResourceMapImageData: () => imageData,
  });

  assert.equal(sampleResourceMapValue(imageData, 0, 0, "r"), 128 / 255);
  assert.equal(runtime.sample("water", 0, 0), 128 / 255);
  assert.ok(runtime.chance("water", 0, 0) > 0);
  assert.ok(runtime.movementBias("water", 0, 0) > 1);
});

test("resource runtime disables chance when configured map is missing", () => {
  const resourceSearches = normalizeResourceSearches({
    water: {
      map: "wetness",
      channel: "r",
      threshold: 0,
      baseChance: 0.25,
      chanceScale: 1,
      maxChance: 1,
    },
  });
  const runtime = createResourceSearchRuntime({
    resourceSearches,
    getResourceMapImageData: () => null,
  });

  assert.equal(runtime.hasMap("water"), false);
  assert.equal(runtime.chance("water", 0, 0), 0);
});
