import test from "node:test";
import assert from "node:assert/strict";

import { patchSimulationKnobSection } from "../src/gameplay/stateSync.js";

function createStore(initialState) {
  let state = initialState;
  return {
    getState: () => state,
    update: (updater) => {
      state = updater(state);
    },
  };
}

test("patchSimulationKnobSection accepts detail settings", () => {
  const store = createStore({
    simulation: {
      knobs: {
        detail: {
          enabled: true,
        },
      },
    },
  });

  patchSimulationKnobSection({
    store,
    key: "detail",
    value: {
      enabled: false,
      zoom: {
        startPxPerMeter: 2,
        fullPxPerMeter: 8,
      },
    },
  });

  assert.deepEqual(store.getState().simulation.knobs.detail, {
    enabled: false,
    zoom: {
      startPxPerMeter: 2,
      fullPxPerMeter: 8,
    },
  });
});
