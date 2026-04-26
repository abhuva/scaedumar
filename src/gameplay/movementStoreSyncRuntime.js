import { patchMovementState, patchPlayerState } from "./stateSync.js";

export function createMovementStoreSyncRuntime(deps) {
  return {
    setPlayerSnapshot: ({ pixelX, pixelY }) => {
      patchPlayerState({
        store: deps.store,
        patch: { pixelX, pixelY },
      });
    },
    setMovementSnapshot: (value) => {
      patchMovementState({
        store: deps.store,
        patch: value,
      });
    },
  };
}
