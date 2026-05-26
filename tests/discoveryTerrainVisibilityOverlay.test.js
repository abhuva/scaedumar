import assert from "node:assert/strict";
import test from "node:test";
import { shouldSkipDiscoveryTerrainVisibilityRaster } from "../src/ui/overlays/discoveryTerrainVisibilityOverlay.js";

function snapshot(cells) {
  return {
    resourceId: "world",
    version: 1,
    width: cells.length,
    height: 1,
    mapWidth: cells.length,
    mapHeight: 1,
    cells: Uint8Array.from(cells),
  };
}

test("terrain visibility overlay skips fully known non-debug rasters", () => {
  assert.equal(
    shouldSkipDiscoveryTerrainVisibilityRaster(snapshot([255, 255, 255]), {
      mode: "black",
      fullVisibilityThreshold: 0.98,
      unknownDarkness: 1,
    }),
    true,
  );
});

test("terrain visibility overlay keeps partially unknown rasters", () => {
  assert.equal(
    shouldSkipDiscoveryTerrainVisibilityRaster(snapshot([255, 120, 255]), {
      mode: "black",
      fullVisibilityThreshold: 0.98,
      unknownDarkness: 1,
    }),
    false,
  );
});

test("terrain visibility overlay keeps debug rasters even when fully known", () => {
  assert.equal(
    shouldSkipDiscoveryTerrainVisibilityRaster(snapshot([255, 255, 255]), {
      mode: "debug",
      fullVisibilityThreshold: 0.98,
      unknownDarkness: 1,
    }),
    false,
  );
});
