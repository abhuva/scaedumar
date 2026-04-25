export function getSwarmRuntimeStateSnapshot(deps) {
  const followState = deps.swarmFollowState || {};
  const swarmState = deps.swarmState || {};
  const follow = typeof deps.getSwarmFollowSnapshot === "function"
    ? deps.getSwarmFollowSnapshot()
    : {
        enabled: Boolean(followState.enabled),
        targetType: followState.targetType === "hawk" ? "hawk" : "agent",
        agentIndex: followState.agentIndex,
        hawkIndex: followState.hawkIndex,
      };
  const enabled = typeof deps.isSwarmEnabled === "function"
    ? deps.isSwarmEnabled()
    : Boolean(swarmState.enabled);
  return {
    enabled,
    count: Math.max(0, Math.round(Number(swarmState.count) || 0)),
    followEnabled: Boolean(follow.enabled),
    followTargetType: follow.targetType === "hawk" ? "hawk" : "agent",
    followAgentIndex: normalizeStoredFollowIndex(follow.agentIndex),
    followHawkIndex: normalizeStoredFollowIndex(follow.hawkIndex),
  };
}

export function getSwarmStoreSnapshot(deps) {
  const settings = typeof deps.getSwarmSettings === "function" ? (deps.getSwarmSettings() || {}) : {};
  return {
    ...settings,
    ...getSwarmRuntimeStateSnapshot(deps),
  };
}

export function hasSwarmSnapshotChanged(prevSwarm, nextSwarm) {
  const keys = new Set([...Object.keys(prevSwarm), ...Object.keys(nextSwarm)]);
  for (const key of keys) {
    if (prevSwarm[key] !== nextSwarm[key]) {
      return true;
    }
  }
  return false;
}

export function normalizeStoredFollowIndex(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : -1;
}
