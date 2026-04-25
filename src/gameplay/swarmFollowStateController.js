function normalizeSwarmFollowTargetType(value) {
  return value === "hawk" ? "hawk" : "agent";
}

export function createSwarmFollowStateController(deps) {
  function applySwarmFollowState(nextState, options = {}) {
    const resetSpeed = options.resetSpeed !== false;
    deps.swarmFollowState.enabled = Boolean(nextState && nextState.enabled);
    deps.swarmFollowState.targetType = normalizeSwarmFollowTargetType(nextState && nextState.targetType);
    deps.swarmFollowState.agentIndex = Number.isFinite(Number(nextState && nextState.agentIndex))
      ? Math.round(Number(nextState.agentIndex))
      : -1;
    deps.swarmFollowState.hawkIndex = Number.isFinite(Number(nextState && nextState.hawkIndex))
      ? Math.round(Number(nextState.hawkIndex))
      : -1;
    if (!deps.swarmFollowState.enabled) {
      deps.swarmFollowState.agentIndex = -1;
      deps.swarmFollowState.hawkIndex = -1;
    }
    deps.swarmFollowTargetInput.value = deps.swarmFollowState.targetType;
    if (resetSpeed) {
      deps.resetSwarmFollowSpeedSmoothing();
    }
    deps.updateSwarmFollowButtonUi();
    if (options.syncStore) {
      deps.syncSwarmFollowToStore();
    }
  }

  function stopSwarmFollow(options = {}) {
    applySwarmFollowState(
      {
        enabled: false,
        targetType: options.targetType ?? deps.swarmFollowState.targetType,
        agentIndex: -1,
        hawkIndex: -1,
      },
      options,
    );
  }

  return {
    applySwarmFollowState,
    stopSwarmFollow,
  };
}
