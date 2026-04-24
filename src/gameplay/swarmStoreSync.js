export function getSwarmRuntimeStateSnapshot(deps) {
  return {
    enabled: deps.isSwarmEnabled(),
    count: Math.max(0, Math.round(Number(deps.swarmState.count) || 0)),
    followEnabled: Boolean(deps.swarmFollowState.enabled),
    followTargetType: deps.swarmFollowState.targetType === "hawk" ? "hawk" : "agent",
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
