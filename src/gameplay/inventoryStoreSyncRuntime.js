import { patchInventoryState } from "./stateSync.js";

export function createInventoryStoreSyncRuntime(deps) {
  return {
    setInventorySnapshot: (snapshot) => {
      patchInventoryState({
        store: deps.store,
        patch: snapshot,
      });
    },
  };
}
