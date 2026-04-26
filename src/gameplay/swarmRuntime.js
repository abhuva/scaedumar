import { createSwarmFollowStateController } from "./swarmFollowStateController.js";
import {
  getSwarmRuntimeStateSnapshot as buildSwarmRuntimeStateSnapshot,
  getSwarmStoreSnapshot,
  hasSwarmSnapshotChanged,
  normalizeStoredFollowIndex,
} from "./swarmStoreSync.js";
import { syncSwarmFollowState, syncSwarmRuntimeState, syncSwarmState } from "./stateSync.js";

export function createSwarmRuntime(deps) {
  function getSwarmRuntimeStateSnapshot() {
    return buildSwarmRuntimeStateSnapshot({
      isSwarmEnabled: deps.isSwarmEnabled,
      swarmState: deps.swarmState,
      swarmFollowState: deps.swarmFollowState,
      getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    });
  }

  function syncSwarmFollowToStore() {
    syncSwarmFollowState({
      store: deps.store,
      getSwarmRuntimeStateSnapshot,
    });
  }

  function syncSwarmRuntimeStateToStore() {
    syncSwarmRuntimeState({
      store: deps.store,
      getSwarmRuntimeStateSnapshot,
      normalizeStoredFollowIndex,
    });
  }

  function syncSwarmStateToStore() {
    syncSwarmState({
      store: deps.store,
      getSwarmStoreSnapshot: () =>
        getSwarmStoreSnapshot({
          getSwarmSettings: deps.getSwarmSettings,
          getSwarmRuntimeStateSnapshot,
        }),
      hasSwarmSnapshotChanged,
    });
  }

  const swarmFollowStateController = createSwarmFollowStateController({
    swarmFollowTargetInput: deps.swarmFollowTargetInput,
    getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    setSwarmFollowEnabled: deps.setSwarmFollowEnabled,
    setSwarmFollowTargetType: deps.setSwarmFollowTargetType,
    setSwarmFollowAgentIndex: deps.setSwarmFollowAgentIndex,
    setSwarmFollowHawkIndex: deps.setSwarmFollowHawkIndex,
    resetSwarmFollowSpeedSmoothing: deps.resetSwarmFollowSpeedSmoothing,
    updateSwarmFollowButtonUi: deps.updateSwarmFollowButtonUi,
    syncSwarmFollowToStore,
  });

  return {
    getSwarmRuntimeStateSnapshot,
    syncSwarmFollowToStore,
    syncSwarmRuntimeStateToStore,
    syncSwarmStateToStore,
    applySwarmFollowState: (nextState, options = {}) => swarmFollowStateController.applySwarmFollowState(nextState, options),
    stopSwarmFollow: (options = {}) => swarmFollowStateController.stopSwarmFollow(options),
  };
}
