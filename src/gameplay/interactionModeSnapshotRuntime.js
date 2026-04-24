export function createInteractionModeSnapshotRuntime(deps) {
  function getInteractionModeSnapshot() {
    return deps.resolveInteractionModeSnapshot({
      getCoreGameplay: deps.getCoreGameplay,
    });
  }

  return {
    getInteractionModeSnapshot,
  };
}
