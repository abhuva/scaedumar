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
    serializeDetailSettings: () => ({ detail: true }),
    serializeCameraSettings: () => ({ camera: true }),
    serializeAudioSettings: () => ({ audio: true }),
    serializeResourceDebugSettings: () => ({ resourceDebug: true }),
    serializeResourceStockSettings: () => ({ resourceStock: true }),
    serializeSwarmData: () => ({ swarm: true }),
    serializeNpcState: () => ({ npc: true }),
    normalizeMapFolderPath: (value) => value || "assets/Map 1",
    getCurrentMapFolderPath: () => "assets/Map 1",
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
});
