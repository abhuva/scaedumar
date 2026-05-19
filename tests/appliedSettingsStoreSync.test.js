import test from "node:test";
import assert from "node:assert/strict";

import { createAppliedSettingsStoreSync } from "../src/core/appliedSettingsStoreSync.js";
import { DEFAULT_SLIME_SETTINGS } from "../src/core/mainSettingsContracts.js";

function createStore(initialState) {
  let state = initialState;
  return {
    getState: () => state,
    update: (updater) => {
      state = updater(state);
    },
  };
}

test("slime applied settings are normalized before store persistence", () => {
  const store = createStore({
    simulation: {
      knobs: {
        slime: {},
      },
    },
  });
  const runtime = createAppliedSettingsStoreSync({
    runtimeCore: { store },
    getSettingsDefaults: (key, fallback) => (key === "slime" ? DEFAULT_SLIME_SETTINGS : fallback),
    clamp: (value, min, max) => Math.max(min, Math.min(max, Number(value))),
    normalizeSimTickHours: (value) => value,
    normalizeRoutingMode: (value) => value,
  });

  runtime.updateStoreFromAppliedSettings("slime", {
    ...DEFAULT_SLIME_SETTINGS,
    agentCount: "not-a-number",
    palette: "invalid",
    sensorNoise: 4,
    spawnMode: "bad",
  });

  assert.equal(store.getState().simulation.knobs.slime.agentCount, 1000);
  assert.equal(store.getState().simulation.knobs.slime.palette, "fire");
  assert.equal(store.getState().simulation.knobs.slime.sensorNoise, 1);
  assert.equal(store.getState().simulation.knobs.slime.spawnMode, "full");
});
