export function createInteractionUiSyncRuntime(deps) {
  return {
    syncPointLightLiveUpdateToggle(liveUpdate) {
      if (deps.pointLightLiveUpdateToggle) {
        deps.pointLightLiveUpdateToggle.checked = Boolean(liveUpdate);
      }
    },
    syncSwarmFollowTargetInput(targetType) {
      if (deps.swarmFollowTargetInput) {
        deps.swarmFollowTargetInput.value = targetType === "hawk" ? "hawk" : "agent";
      }
    },
  };
}
