import { patchActivityState } from "./stateSync.js";

export function createActivityStoreSyncRuntime(deps) {
  return {
    setActivitySnapshot: (snapshot) => {
      patchActivityState({
        store: deps.store,
        patch: snapshot,
      });
    },
  };
}
