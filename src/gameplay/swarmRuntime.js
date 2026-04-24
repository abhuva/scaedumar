import { createSwarmFollowStateController } from "./swarmFollowStateController.js";
import {
  getSwarmRuntimeStateSnapshot as buildSwarmRuntimeStateSnapshot,
  syncSwarmFollowToStore as syncSwarmFollowToStoreState,
  syncSwarmRuntimeStateToStore as syncSwarmRuntimeStateToStoreState,
  syncSwarmStateToStore as syncSwarmStateToStoreState,
} from "./swarmStoreSync.js";

export function createSwarmRuntime(deps) {
  function getSwarmRuntimeStateSnapshot() {
    return buildSwarmRuntimeStateSnapshot({
      isSwarmEnabled: deps.isSwarmEnabled,
      swarmState: deps.swarmState,
      getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    });
  }

  function syncSwarmFollowToStore() {
    syncSwarmFollowToStoreState({
      store: deps.store,
      getSwarmRuntimeStateSnapshot,
      getSwarmSettings: deps.getSwarmSettings,
    });
  }

  function syncSwarmRuntimeStateToStore() {
    syncSwarmRuntimeStateToStoreState({
      store: deps.store,
      getSwarmRuntimeStateSnapshot,
    });
  }

  function syncSwarmStateToStore() {
    syncSwarmStateToStoreState({
      store: deps.store,
      getSwarmRuntimeStateSnapshot,
      getSwarmSettings: deps.getSwarmSettings,
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
