import { patchConditionState } from "./stateSync.js";

export function createConditionStoreSyncRuntime(deps) {
  return {
    setConditionSnapshot: (snapshot) => {
      patchConditionState({
        store: deps.store,
        patch: snapshot,
      });
    },
  };
}
