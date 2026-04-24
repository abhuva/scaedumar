function normalizeSwarmFollowTargetType(value) {
  return value === "hawk" ? "hawk" : "agent";
}

export function createSwarmFollowStateController(deps) {
  function applySwarmFollowState(nextState, options = {}) {
    const resetSpeed = options.resetSpeed !== false;
    const enabled = Boolean(nextState && nextState.enabled);
    const targetType = normalizeSwarmFollowTargetType(nextState && nextState.targetType);
    const agentIndex = Number.isFinite(Number(nextState && nextState.agentIndex))
      ? Math.round(Number(nextState.agentIndex))
      : -1;
    const hawkIndex = Number.isFinite(Number(nextState && nextState.hawkIndex))
      ? Math.round(Number(nextState.hawkIndex))
      : -1;
    deps.setSwarmFollowEnabled(enabled);
    deps.setSwarmFollowTargetType(targetType);
    deps.setSwarmFollowAgentIndex(enabled ? agentIndex : -1);
    deps.setSwarmFollowHawkIndex(enabled ? hawkIndex : -1);
    if (!enabled) {
      deps.setSwarmFollowAgentIndex(-1);
      deps.setSwarmFollowHawkIndex(-1);
    }
    deps.swarmFollowTargetInput.value = targetType;
    if (resetSpeed) {
      deps.resetSwarmFollowSpeedSmoothing();
    }
    deps.updateSwarmFollowButtonUi();
    if (options.syncStore) {
      deps.syncSwarmFollowToStore();
    }
  }

  function stopSwarmFollow(options = {}) {
    const follow = deps.getSwarmFollowSnapshot();
    applySwarmFollowState(
      {
        enabled: false,
        targetType: options.targetType ?? follow.targetType,
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
