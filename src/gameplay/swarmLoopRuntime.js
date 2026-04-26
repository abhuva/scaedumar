import { createSwarmInterpolation } from "./swarmInterpolation.js";
import { createSwarmUpdateLoop } from "./swarmUpdateLoop.js";
import { createSwarmFollowCameraUpdater } from "./swarmFollowCamera.js";

export function createSwarmLoopRuntime(deps) {
  const swarmInterpolation = createSwarmInterpolation({
    swarmState: deps.swarmState,
    swarmRenderState: deps.swarmRenderState,
    clamp: deps.clamp,
  });

  const updateSwarm = createSwarmUpdateLoop({
    swarmRenderState: deps.swarmRenderState,
    clamp: deps.clamp,
    isSwarmEnabled: deps.isSwarmEnabled,
    getSwarmSettings: deps.getSwarmSettings,
    swarmState: deps.swarmState,
    captureSwarmRenderPreviousState: swarmInterpolation.capturePreviousState,
    stepSwarm: deps.stepSwarm,
    syncSwarmRuntimeStateToStore: deps.syncSwarmRuntimeStateToStore,
  });

  const updateSwarmFollowCamera = createSwarmFollowCameraUpdater({
    swarmState: deps.swarmState,
    isSwarmEnabled: deps.isSwarmEnabled,
    stopSwarmFollow: deps.stopSwarmFollow,
    getSwarmSettings: deps.getSwarmSettings,
    chooseRandomFollowHawkIndex: deps.chooseRandomFollowHawkIndex,
    chooseRandomFollowAgentIndex: deps.chooseRandomFollowAgentIndex,
    writeInterpolatedSwarmHawkPos: swarmInterpolation.writeInterpolatedHawkPos,
    writeInterpolatedSwarmAgentPos: swarmInterpolation.writeInterpolatedAgentPos,
    swarmFollowHawkScratch: deps.swarmFollowHawkScratch,
    swarmFollowAgentScratch: deps.swarmFollowAgentScratch,
    mapCoordToWorld: deps.mapCoordToWorld,
    clamp: deps.clamp,
    zoomMin: deps.zoomMin,
    zoomMax: deps.zoomMax,
    getZoom: deps.getZoom,
    dispatchCoreCommand: deps.dispatchCoreCommand,
    getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    setSwarmFollowAgentIndex: deps.setSwarmFollowAgentIndex,
    setSwarmFollowHawkIndex: deps.setSwarmFollowHawkIndex,
    getSwarmFollowSpeedNormFiltered: deps.getSwarmFollowSpeedNormFiltered,
    setSwarmFollowSpeedNormFiltered: deps.setSwarmFollowSpeedNormFiltered,
  });

  return {
    writeInterpolatedSwarmAgentPos: swarmInterpolation.writeInterpolatedAgentPos,
    writeInterpolatedSwarmHawkPos: swarmInterpolation.writeInterpolatedHawkPos,
    captureSwarmRenderPreviousState: swarmInterpolation.capturePreviousState,
    updateSwarm,
    updateSwarmFollowCamera,
  };
}
