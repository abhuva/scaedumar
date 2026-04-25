import test from "node:test";
import assert from "node:assert/strict";

import { createMainRuntimeStateBinding } from "../src/gameplay/mainRuntimeStateBinding.js";

test("mainRuntimeStateBinding exposes direct runtime-state ownership without extra indirection", () => {
  const calls = [];
  const store = {
    state: {
      gameplay: {
        map: {},
        pointLights: { liveUpdate: false, saveConfirmArmed: true },
        cursorLight: { enabled: true, color: "#ffffff", strength: 12, heightOffset: 3, useTerrainHeight: false, showGizmo: true },
        swarm: {},
      },
    },
    update(fn) {
      this.state = fn(this.state);
      calls.push("update");
    },
    getState() {
      return this.state;
    },
  };

  const binding = createMainRuntimeStateBinding({
    store,
    getCoreSwarm: () => ({}),
    getCorePathfinding: () => ({ range: 40 }),
    getCoreCursorLight: () => store.state.gameplay.cursorLight,
    getCorePointLights: () => store.state.gameplay.pointLights,
    getSettingsDefaults: (_key, fallback) => fallback,
    defaultSwarmSettings: { enabled: true, cursorMode: "push", minHeight: 10, maxHeight: 100 },
    updateStoreFromAppliedSettings: () => {},
    normalizeAppliedSettings: (_key, rawData) => rawData,
    applySwarmSettingsCompat: () => {},
    getCurrentMapFolderPath: () => "assets/Map 1/",
    getSplatSize: () => ({ width: 128, height: 64 }),
    getCursorLightState: () => store.state.gameplay.cursorLight,
    getStopSwarmFollow: () => () => {},
    getSwarmState: () => ({}),
    clamp: (value, min, max) => Math.min(max, Math.max(min, value)),
    swarmZMax: 256,
    zoomMin: 1,
    zoomMax: 32,
    normalizeRoutingMode: (value) => value ?? "cycle",
  });

  binding.syncMapStateToStore();
  binding.syncPointLightsStateToStore(true, false);

  assert.equal(binding.isPointLightLiveUpdateEnabled(), true);
  assert.equal(binding.isPointLightsSaveConfirmArmed(), false);
  assert.deepEqual(binding.getCursorLightSnapshot(), {
    enabled: true,
    colorHex: "#ffffff",
    strength: 12,
    heightOffset: 3,
    useTerrainHeight: false,
    showGizmo: true,
  });
  assert.ok(calls.length >= 2);
});
