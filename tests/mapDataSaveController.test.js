import test from "node:test";
import assert from "node:assert/strict";

import { createMapDataSaveController } from "../src/gameplay/mapDataSaveController.js";

function createController(overrides = {}) {
  return createMapDataSaveController({
    serializePointLights: () => ({ pointLights: true }),
    serializeLightingSettings: () => ({ lighting: true }),
    serializeInteractionSettings: () => ({ interaction: true }),
    serializeFogSettings: () => ({ fog: true }),
    serializeCloudSettings: () => ({ clouds: true }),
    serializeWaterSettings: () => ({ waterfx: true }),
    serializeWaterTrailSettings: () => ({ watertrails: true }),
    serializeSlimeSettings: () => ({ slime: true }),
    serializeDetailSettings: () => ({ detail: true }),
    serializeCameraSettings: () => ({ camera: true }),
    serializeAudioSettings: () => ({ audio: true }),
    serializeResourceDebugSettings: () => ({ resourceDebug: true }),
    serializeResourceStockSettings: () => ({ resourceStock: true }),
    serializeSwarmData: () => ({ swarm: true }),
    serializeStructureData: () => ({ structures: true }),
    serializeNpcState: () => ({ npc: true }),
    normalizeMapFolderPath: (value) => value || "assets/map1",
    getCurrentMapFolderPath: () => "assets/map1",
    confirm: () => false,
    setStatus: () => {},
    ...overrides,
  });
}

test("Save All includes map-local resource debug settings", () => {
  const files = createController().createMapDataFileTexts();

  assert.ok(files["resource_debug.json"]);
  assert.deepEqual(JSON.parse(files["resource_debug.json"]), { resourceDebug: true });
  assert.ok(files["resource_stock.json"]);
  assert.deepEqual(JSON.parse(files["resource_stock.json"]), { resourceStock: true });
  assert.ok(files["slime.json"]);
  assert.deepEqual(JSON.parse(files["slime.json"]), { slime: true });
  assert.ok(files["structures.json"]);
  assert.deepEqual(JSON.parse(files["structures.json"]), { structures: true });
  assert.equal(files["../data/render_luts.json"], undefined);
  assert.equal(files["render_luts.json"], undefined);
});

test("Save All includes map-local render LUTs when present", () => {
  const files = createController({
    serializeRenderLutMapLocalDefinition: () => ({
      version: 1,
      luts: {
        "map.bird": { type: "grayscale-ramp", stops: [] },
      },
      variants: [],
    }),
  }).createMapDataFileTexts();

  assert.ok(files["render_luts.json"]);
  assert.equal(JSON.parse(files["render_luts.json"]).luts["map.bird"].type, "grayscale-ramp");
});
