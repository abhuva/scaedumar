import { patchSwarmSettingsState } from "./stateSync.js";

function normalizeFollowIndex(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : -1;
}

function normalizeFollowTargetType(value) {
  return value === "hawk" ? "hawk" : "agent";
}

export function createSwarmFollowRuntimeState(deps) {
  function getStore() {
    if (typeof deps.getStore === "function") {
      return deps.getStore();
    }
    return deps.store || null;
  }

  function getCoreSwarm() {
    const store = getStore();
    const state = store && typeof store.getState === "function" ? store.getState() : null;
    return state && state.gameplay && state.gameplay.swarm ? state.gameplay.swarm : {};
  }

  function updateCoreSwarm(patch) {
    const store = getStore();
    if (!store || typeof store.update !== "function") {
      return;
    }
    patchSwarmSettingsState({
      store,
      patch,
    });
  }

  function getSwarmFollowSnapshot() {
    const coreSwarm = getCoreSwarm();
    return {
      enabled: Boolean(coreSwarm.followEnabled),
      targetType: normalizeFollowTargetType(coreSwarm.followTargetType),
      agentIndex: normalizeFollowIndex(coreSwarm.followAgentIndex),
      hawkIndex: normalizeFollowIndex(coreSwarm.followHawkIndex),
      speedNormFiltered: Number.isFinite(Number(deps.swarmFollowState.speedNormFiltered))
        ? Number(deps.swarmFollowState.speedNormFiltered)
        : null,
    };
  }

  function setSwarmFollowEnabled(value) {
    const enabled = Boolean(value);
    updateCoreSwarm({ followEnabled: enabled });
  }

  function setSwarmFollowTargetType(value) {
    const targetType = normalizeFollowTargetType(value);
    updateCoreSwarm({ followTargetType: targetType });
  }

  function setSwarmFollowAgentIndex(value) {
    const agentIndex = normalizeFollowIndex(value);
    updateCoreSwarm({ followAgentIndex: agentIndex });
  }

  function setSwarmFollowHawkIndex(value) {
    const hawkIndex = normalizeFollowIndex(value);
    updateCoreSwarm({ followHawkIndex: hawkIndex });
  }

  function setSwarmFollowSpeedNormFiltered(value) {
    deps.swarmFollowState.speedNormFiltered = Number.isFinite(Number(value)) ? Number(value) : null;
  }

  function getSwarmFollowSpeedNormFiltered() {
    const stored = Number(deps.swarmFollowState.speedNormFiltered);
    return Number.isFinite(stored) ? stored : null;
  }

  function resetSwarmFollowSpeedNormFiltered() {
    deps.swarmFollowState.speedNormFiltered = null;
  }

  return {
    getSwarmFollowSnapshot,
    setSwarmFollowEnabled,
    setSwarmFollowTargetType,
    setSwarmFollowAgentIndex,
    setSwarmFollowHawkIndex,
    getSwarmFollowSpeedNormFiltered,
    setSwarmFollowSpeedNormFiltered,
    resetSwarmFollowSpeedNormFiltered,
  };
}
