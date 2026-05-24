import test from "node:test";
import assert from "node:assert/strict";
import {
  createDefaultResourceDebugSettings,
  getResourceDebugBandColors,
  normalizeResourceDebugSettings,
  serializeResourceDebugSettings,
} from "../src/gameplay/resourceDebugSettings.js";

test("resource debug defaults create separate layer settings", () => {
  const settings = createDefaultResourceDebugSettings({
    water: {
      discovery: { gridSize: 128, movementRevealRadius: 42 },
      overlay: {
        renderMode: "marching",
        thresholds: [0.2, 0.35, 0.5, 0.65, 0.8],
        colors: ["rgba(1, 2, 3, 0.4)"],
      },
    },
  });

  assert.equal(settings.discovery.gridSize, 128);
  assert.equal(settings.discovery.movementRevealRadius, 42);
  assert.equal(settings.discovery.revealFalloff, 0);
  assert.equal(settings.discovery.showMaskOverlay, false);
  assert.equal(settings.discovery.maskOverlayOpacity, 0.45);
  assert.equal(settings.discovery.decay.enabled, true);
  assert.equal(settings.discovery.decay.intervalTicks, 500);
  assert.equal(settings.discovery.decay.amount, 1);
  assert.equal(settings.layers.water.renderMode, "marching");
  assert.equal(settings.layers.plants.renderMode, "marching");
  assert.equal(settings.layers.height.renderMode, "marching");
  assert.notEqual(settings.layers.water.tintColor, settings.layers.plants.tintColor);
  assert.notEqual(settings.layers.water.tintColor, settings.layers.height.tintColor);
});

test("resource debug normalization preserves per-band toggles and layer tint", () => {
  const defaults = createDefaultResourceDebugSettings();
  const settings = normalizeResourceDebugSettings({
    activeLayer: "slope",
    discovery: { gridSize: 99999, movementRevealRadius: 12, revealFalloff: 99 },
    layers: {
      slope: {
        renderMode: "raster",
        sampleStep: 4,
        knowledgeThreshold: 0.5,
        lineWidth: 2,
        bandWidth: 0.03,
        tintColor: "#ff0000",
        bands: [
          { enabled: false, threshold: 0.25 },
        ],
      },
    },
  }, defaults);

  assert.equal(settings.activeLayer, "slope");
  assert.equal(settings.discovery.gridSize, 2048);
  assert.equal(settings.discovery.revealFalloff, 8);
  assert.equal(settings.layers.slope.renderMode, "raster");
  assert.equal(settings.layers.slope.tintColor, "#ff0000");
  assert.equal(settings.layers.slope.bands[0].enabled, false);
  assert.equal(settings.layers.slope.bands[0].threshold, 0.25);
  assert.equal(settings.layers.water.bands.length, 5);
});

test("resource debug normalization migrates old per-band colors into tint color", () => {
  const settings = normalizeResourceDebugSettings({
    layers: {
      wetness: {
        bands: [
          { threshold: 0.25, color: "rgba(10, 20, 30, 0.5)" },
        ],
      },
    },
  }, createDefaultResourceDebugSettings());

  assert.equal(settings.layers.water.tintColor, "#0a141e");
});

test("resource debug serialization returns normalized map-sidecar shape", () => {
  const serialized = serializeResourceDebugSettings({
    version: 99,
    activeLayer: "invalid",
    discovery: { gridSize: 64 },
    layers: {},
  }, createDefaultResourceDebugSettings());

  assert.equal(serialized.version, 1);
  assert.equal(serialized.activeLayer, "water");
  assert.equal(serialized.discovery.gridSize, 64);
  assert.equal(serialized.discovery.showMaskOverlay, false);
  assert.equal(serialized.layers.water.bands.length, 5);
  assert.equal(serialized.layers.plants.bands.length, 5);
  assert.equal(serialized.layers.height.bands.length, 5);
  assert.equal(serialized.layers.slope.bands.length, 5);
});

test("resource debug tint generates the contour alpha ramp", () => {
  assert.deepEqual(getResourceDebugBandColors({ tintColor: "#112233" }), [
    "rgba(17, 34, 51, 0.34)",
    "rgba(17, 34, 51, 0.44)",
    "rgba(17, 34, 51, 0.58)",
    "rgba(17, 34, 51, 0.70)",
    "rgba(17, 34, 51, 0.82)",
  ]);
});
test("resource debug defaults can inherit discovery data defaults", () => {
  const settings = createDefaultResourceDebugSettings({
    water: {
      discovery: { gridSize: 128, movementRevealRadius: 42 },
    },
  }, "water", {
    maps: {
      water: {
        decay: {
          enabled: false,
          intervalTicks: 750,
          amount: 4,
        },
      },
    },
  });

  assert.equal(settings.discovery.decay.enabled, false);
  assert.equal(settings.discovery.decay.intervalTicks, 750);
  assert.equal(settings.discovery.decay.amount, 4);
});

test("resource debug serialization resets dev-only discovery mask overlay toggle", () => {
  const serialized = serializeResourceDebugSettings({
    discovery: {
      showMaskOverlay: true,
      maskOverlayOpacity: 0.8,
    },
  }, createDefaultResourceDebugSettings());

  assert.equal(serialized.discovery.showMaskOverlay, false);
  assert.equal(serialized.discovery.maskOverlayOpacity, 0.8);
});
