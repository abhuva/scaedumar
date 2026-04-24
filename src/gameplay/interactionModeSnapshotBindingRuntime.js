import { createInteractionModeSnapshotRuntime } from "./interactionModeSnapshotRuntime.js";

export function createInteractionModeSnapshotBindingRuntime(deps) {
  const interactionModeSnapshotRuntime = createInteractionModeSnapshotRuntime({
    resolveInteractionModeSnapshot: deps.resolveInteractionModeSnapshot,
    getCoreGameplay: deps.getCoreGameplay,
  });
  return {
    getInteractionModeSnapshot: () => interactionModeSnapshotRuntime.getInteractionModeSnapshot(),
  };
}
