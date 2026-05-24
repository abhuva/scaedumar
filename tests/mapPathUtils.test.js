import test from "node:test";
import assert from "node:assert/strict";

import {
  buildMapAssetPath,
  normalizeMapFolderPath,
} from "../src/gameplay/mapPathUtils.js";

test("buildMapAssetPath preserves relative map folder segments for packaged assets", () => {
  assert.equal(
    buildMapAssetPath("assets/Map 3/", "splat.png"),
    "./assets/Map%203/splat.png",
  );
});

test("buildMapAssetPath preserves relative sidecar paths through the same path", () => {
  assert.equal(
    buildMapAssetPath("assets/Map 3", "resource_stock.json"),
    "./assets/Map%203/resource_stock.json",
  );
});

test("buildMapAssetPath does not double-encode relative URL paths", () => {
  assert.equal(
    buildMapAssetPath("assets/Map%203", "resource debug.json"),
    "./assets/Map%203/resource%20debug.json",
  );
});

test("normalizeMapFolderPath trims trailing path separators", () => {
  assert.equal(normalizeMapFolderPath("assets/Map 3/"), "assets/Map 3");
  assert.equal(normalizeMapFolderPath("assets\\Map 3\\"), "assets\\Map 3");
});
