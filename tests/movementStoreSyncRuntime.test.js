import test from "node:test";
import assert from "node:assert/strict";

import { createMovementStoreSyncRuntime } from "../src/gameplay/movementStoreSyncRuntime.js";

function createStore(initialState) {
  let state = initialState;
  return {
    getState: () => state,
    update: (updater) => {
      state = updater(state);
    },
  };
}

test("movementStoreSyncRuntime updates player and movement snapshots in gameplay state", () => {
  const store = createStore({
    gameplay: {
      player: {
        charID: "npc",
        pixelX: 2,
        pixelY: 3,
      },
      movement: {
        active: false,
      },
    },
  });
  const runtime = createMovementStoreSyncRuntime({ store });

  runtime.setPlayerSnapshot({ pixelX: 8, pixelY: 9 });
  runtime.setMovementSnapshot({ active: true, queueLength: 4 });

  assert.deepEqual(store.getState().gameplay.player, {
    charID: "npc",
    pixelX: 8,
    pixelY: 9,
  });
  assert.deepEqual(store.getState().gameplay.movement, {
    active: true,
    queueLength: 4,
  });
});
