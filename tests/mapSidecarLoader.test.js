import test from "node:test";
import assert from "node:assert/strict";

import { createMapSidecarLoader } from "../src/gameplay/mapSidecarLoader.js";

function createLoader(overrides = {}) {
  const calls = [];
  const jsonByPath = new Map(Object.entries(overrides.jsonByPath || {}));
  return {
    calls,
    loader: createMapSidecarLoader({
      tryLoadJsonFromUrl: async (path) => {
        if (!jsonByPath.has(path)) {
          const error = new Error(`Missing ${path}`);
          error.code = "MISSING_OPTIONAL_JSON";
          throw error;
        }
        return jsonByPath.get(path);
      },
      applyLoadedPointLights: (data) => calls.push(["pointLights", data]),
      applyLightingSettings: (data) => calls.push(["lighting", data]),
      applyInteractionSettings: (data) => calls.push(["interaction", data]),
      applyFogSettings: (data) => calls.push(["fog", data]),
      applyCloudSettings: (data) => calls.push(["clouds", data]),
      applyWaterSettings: (data) => calls.push(["waterfx", data]),
      applyWaterTrailSettings: (data) => calls.push(["watertrails", data]),
      applySlimeSettings: (data) => calls.push(["slime", data]),
      applyDetailSettings: (data) => calls.push(["detail", data]),
      applyCameraSettings: (data) => calls.push(["camera", data]),
      applyAudioSettings: (data) => calls.push(["audio", data]),
      applyResourceDebugSettings: (data) => calls.push(["resourceDebug", data]),
      applyResourceStockSettings: (data) => calls.push(["resourceStock", data]),
      applySwarmData: (data) => calls.push(["swarm", data]),
      applyStructureData: (data) => calls.push(["structures", data]),
      applyLoadedNpc: (data) => calls.push(["npc", data]),
      getFileFromFolderSelection: (files, name) => files.find((file) => file.name === name) || null,
      getSettingsDefaults: (_key, fallback) => fallback,
      defaultPlayer: { pixelX: 1, pixelY: 2 },
      defaultWaterTrailSettings: { defaultWaterTrail: true },
      defaultSlimeSettings: { defaultSlime: true },
      setStatus: () => {},
    }),
  };
}

test("URL sidecar loading applies optional structures.json when present", async () => {
  const structures = {
    version: 1,
    types: [],
    structures: [],
  };
  const { loader, calls } = createLoader({
    jsonByPath: {
      "assets/map3/structures.json": structures,
    },
  });

  const loaded = await loader.loadSidecarsFromUrl("assets/map3", (name) => `assets/map3/${name}`);

  assert.equal(loaded.structures, true);
  assert.deepEqual(calls.find(([key]) => key === "structures"), ["structures", structures]);
});

test("URL sidecar loading applies empty structures when structures.json is absent", async () => {
  const { loader, calls } = createLoader();

  const loaded = await loader.loadSidecarsFromUrl("assets/map3", (name) => `assets/map3/${name}`);

  assert.equal(loaded.structures, false);
  assert.deepEqual(calls.find(([key]) => key === "structures"), ["structures", null]);
});

test("file sidecar loading applies structures.json from selected files", async () => {
  const structures = {
    version: 1,
    types: [],
    structures: [],
  };
  const file = {
    name: "structures.json",
    text: async () => JSON.stringify(structures),
  };
  const { loader, calls } = createLoader();

  const loaded = await loader.loadSidecarsFromFiles([file]);

  assert.equal(loaded.structures, true);
  assert.deepEqual(calls.find(([key]) => key === "structures"), ["structures", structures]);
});

test("file sidecar loading applies empty structures when structures.json is absent", async () => {
  const { loader, calls } = createLoader();

  const loaded = await loader.loadSidecarsFromFiles([]);

  assert.equal(loaded.structures, false);
  assert.deepEqual(calls.find(([key]) => key === "structures"), ["structures", null]);
});
