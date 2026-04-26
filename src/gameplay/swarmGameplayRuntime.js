import { createSwarmEnvironment } from "./swarmEnvironment.js";
import { createSwarmTargeting } from "./swarmTargeting.js";
import { createSwarmAgentStateMutator } from "./swarmAgentStateMutator.js";
import { createSwarmReseeder } from "./swarmReseed.js";
import { createSwarmDataApplier } from "./swarmDataApplier.js";
import { createSwarmDataSerializer } from "./swarmDataSerializer.js";

export function createSwarmGameplayRuntime(deps) {
  const swarmEnvironment = createSwarmEnvironment({
    sampleHeightAtMapPixel: deps.sampleHeightAtMapPixel,
    getGrayAt: deps.getGrayAt,
    waterImageData: deps.waterImageData,
    swarmHeightMax: deps.swarmHeightMax,
    terrainClearance: deps.terrainClearance,
  });
  const terrainFloorAtSwarmCoord = swarmEnvironment.terrainFloorAtSwarmCoord;
  const isWaterAtSwarmCoord = swarmEnvironment.isWaterAtSwarmCoord;
  const isSwarmCoordFlyable = swarmEnvironment.isSwarmCoordFlyable;

  const swarmTargeting = createSwarmTargeting({
    swarmState: deps.swarmState,
    splatSize: deps.splatSize,
    terrainFloorAtSwarmCoord,
    clamp: deps.clamp,
  });
  const chooseRandomSwarmTargetIndexNear = swarmTargeting.chooseRandomSwarmTargetIndexNear;
  const chooseRandomFollowAgentIndex = swarmTargeting.chooseRandomFollowAgentIndex;
  const chooseRandomFollowHawkIndex = swarmTargeting.chooseRandomFollowHawkIndex;

  const swarmAgentStateMutator = createSwarmAgentStateMutator({
    swarmState: deps.swarmState,
    invalidateSwarmInterpolation: deps.invalidateSwarmInterpolation,
    getSwarmSettings: deps.getSwarmSettings,
    chooseRandomSwarmTargetIndexNear,
    chooseRandomFollowAgentIndex,
    getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    setSwarmFollowAgentIndex: deps.setSwarmFollowAgentIndex,
    stopSwarmFollow: deps.stopSwarmFollow,
    clamp: deps.clamp,
    splatSize: deps.splatSize,
    isSwarmCoordFlyable,
    isWaterAtSwarmCoord,
    terrainFloorAtSwarmCoord,
  });

  const reseedSwarmAgents = createSwarmReseeder({
    getSwarmSettings: deps.getSwarmSettings,
    invalidateSwarmInterpolation: deps.invalidateSwarmInterpolation,
    ensureSwarmBuffers: swarmAgentStateMutator.ensureSwarmBuffers,
    splatSize: deps.splatSize,
    isSwarmCoordFlyable,
    terrainFloorAtSwarmCoord,
    clamp: deps.clamp,
    swarmState: deps.swarmState,
    chooseRandomFollowAgentIndex,
    getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    setSwarmFollowAgentIndex: deps.setSwarmFollowAgentIndex,
    createSpawnedHawk: swarmTargeting.createSpawnedHawk,
    requestOverlayDraw: deps.requestOverlayDraw,
  });

  const applySwarmData = createSwarmDataApplier({
    applySwarmSettings: deps.applySwarmSettings,
    getSwarmSettings: deps.getSwarmSettings,
    swarmState: deps.swarmState,
    clamp: deps.clamp,
    ensureSwarmBuffers: swarmAgentStateMutator.ensureSwarmBuffers,
    splatSize: deps.splatSize,
    isSwarmCoordFlyable,
    terrainFloorAtSwarmCoord,
    chooseRandomSwarmTargetIndexNear,
    reseedSwarmAgents,
    applySwarmFollowState: deps.applySwarmFollowState,
    invalidateSwarmInterpolation: deps.invalidateSwarmInterpolation,
    syncSwarmRuntimeStateToStore: deps.syncSwarmRuntimeStateToStore,
    requestOverlayDraw: deps.requestOverlayDraw,
  });

  const serializeSwarmData = createSwarmDataSerializer({
    getSwarmSettings: deps.getSwarmSettings,
    getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    swarmState: deps.swarmState,
  });

  return {
    terrainFloorAtSwarmCoord,
    isWaterAtSwarmCoord,
    isSwarmCoordFlyable,
    chooseRandomSwarmTargetIndexNear,
    chooseRandomFollowAgentIndex,
    chooseRandomFollowHawkIndex,
    ensureSwarmBuffers: swarmAgentStateMutator.ensureSwarmBuffers,
    removeSwarmAgentAtIndex: swarmAgentStateMutator.removeSwarmAgentAtIndex,
    spawnRestingBirdNear: swarmAgentStateMutator.spawnRestingBirdNear,
    reseedSwarmAgents,
    applySwarmData,
    serializeSwarmData,
  };
}
