export function getSwarmRuntimeStateSnapshot(deps) {
  const follow = typeof deps.getSwarmFollowSnapshot === "function"
    ? deps.getSwarmFollowSnapshot()
    : {
        enabled: Boolean(deps.swarmFollowState.enabled),
        targetType: deps.swarmFollowState.targetType === "hawk" ? "hawk" : "agent",
        agentIndex: Number.isFinite(Number(deps.swarmFollowState.agentIndex)) ? Math.round(Number(deps.swarmFollowState.agentIndex)) : -1,
        hawkIndex: Number.isFinite(Number(deps.swarmFollowState.hawkIndex)) ? Math.round(Number(deps.swarmFollowState.hawkIndex)) : -1,
      };
  return {
    enabled: deps.isSwarmEnabled(),
    count: Math.max(0, Math.round(Number(deps.swarmState.count) || 0)),
    followEnabled: Boolean(follow.enabled),
    followTargetType: follow.targetType === "hawk" ? "hawk" : "agent",
    followAgentIndex: Number.isFinite(Number(follow.agentIndex)) ? Math.round(Number(follow.agentIndex)) : -1,
    followHawkIndex: Number.isFinite(Number(follow.hawkIndex)) ? Math.round(Number(follow.hawkIndex)) : -1,
  };
}

export function getSwarmStoreSnapshot(deps) {
  const settings = typeof deps.getSwarmSettings === "function" ? (deps.getSwarmSettings() || {}) : {};
  return {
    ...settings,
    ...getSwarmRuntimeStateSnapshot(deps),
  };
}

function hasSwarmSnapshotChanged(prevSwarm, nextSwarm) {
  const keys = Object.keys(nextSwarm);
  for (const key of keys) {
    if (prevSwarm[key] !== nextSwarm[key]) {
      return true;
    }
  }
  return false;
}

function normalizeStoredFollowIndex(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : -1;
}

export function syncSwarmFollowToStore(deps) {
  const runtimeSwarm = deps.getSwarmRuntimeStateSnapshot();
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      swarm: {
        ...prev.gameplay.swarm,
        followEnabled: runtimeSwarm.followEnabled,
        followTargetType: runtimeSwarm.followTargetType,
        followAgentIndex: runtimeSwarm.followAgentIndex,
        followHawkIndex: runtimeSwarm.followHawkIndex,
      },
    },
  }));
}

export function syncSwarmRuntimeStateToStore(deps) {
  const runtimeSwarm = deps.getSwarmRuntimeStateSnapshot();
  deps.store.update((prev) => {
    const prevSwarm = prev.gameplay && prev.gameplay.swarm ? prev.gameplay.swarm : {};
    if (
      Boolean(prevSwarm.enabled) === runtimeSwarm.enabled
      && Math.max(0, Math.round(Number(prevSwarm.count) || 0)) === runtimeSwarm.count
      && Boolean(prevSwarm.followEnabled) === runtimeSwarm.followEnabled
      && String(prevSwarm.followTargetType || "agent") === runtimeSwarm.followTargetType
      && normalizeStoredFollowIndex(prevSwarm.followAgentIndex) === runtimeSwarm.followAgentIndex
      && normalizeStoredFollowIndex(prevSwarm.followHawkIndex) === runtimeSwarm.followHawkIndex
    ) {
      return prev;
    }
    return {
      ...prev,
      gameplay: {
        ...prev.gameplay,
        swarm: {
          ...prevSwarm,
          ...runtimeSwarm,
        },
      },
    };
  });
}

export function syncSwarmStateToStore(deps) {
  const nextSwarm = getSwarmStoreSnapshot(deps);
  deps.store.update((prev) => {
    const prevSwarm = prev.gameplay && prev.gameplay.swarm ? prev.gameplay.swarm : {};
    if (!hasSwarmSnapshotChanged(prevSwarm, nextSwarm)) {
      return prev;
    }
    return {
      ...prev,
      gameplay: {
        ...prev.gameplay,
        swarm: {
          ...prevSwarm,
          ...nextSwarm,
        },
      },
    };
  });
}
