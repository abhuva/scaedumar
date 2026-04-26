import { createSwarmStepFunction } from "./swarmStep.js";
import { createSwarmLoopRuntime } from "./swarmLoopRuntime.js";
import { createSwarmOverlayRuntime } from "../ui/swarmOverlayRuntime.js";
import { createSwarmLitRenderer } from "../render/swarmLitRenderer.js";

export function createSwarmRenderSetupRuntime(deps) {
  const stepSwarm = createSwarmStepFunction({
    splatSize: deps.splatSize,
    swarmState: deps.swarmState,
    clamp: deps.clamp,
    swarmCursorState: deps.swarmCursorState,
    swarmZNeighborScale: deps.swarmZNeighborScale,
    isWaterAtSwarmCoord: deps.isWaterAtSwarmCoord,
    terrainFloorAtSwarmCoord: deps.terrainFloorAtSwarmCoord,
    isSwarmCoordFlyable: deps.isSwarmCoordFlyable,
    spawnRestingBirdNear: deps.spawnRestingBirdNear,
    removeSwarmAgentAtIndex: deps.removeSwarmAgentAtIndex,
    chooseRandomSwarmTargetIndexNear: deps.chooseRandomSwarmTargetIndexNear,
  });

  const swarmLoopRuntime = createSwarmLoopRuntime({
    swarmState: deps.swarmState,
    swarmRenderState: deps.swarmRenderState,
    clamp: deps.clamp,
    isSwarmEnabled: deps.isSwarmEnabled,
    getSwarmSettings: deps.getSwarmSettings,
    stepSwarm,
    syncSwarmRuntimeStateToStore: deps.syncSwarmRuntimeStateToStore,
    stopSwarmFollow: deps.stopSwarmFollow,
    chooseRandomFollowHawkIndex: deps.chooseRandomFollowHawkIndex,
    chooseRandomFollowAgentIndex: deps.chooseRandomFollowAgentIndex,
    swarmFollowHawkScratch: deps.swarmFollowHawkScratch,
    swarmFollowAgentScratch: deps.swarmFollowAgentScratch,
    mapCoordToWorld: deps.mapCoordToWorld,
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

  const swarmOverlayRuntime = createSwarmOverlayRuntime({
    swarmState: deps.swarmState,
    swarmOverlayAgentScratch: deps.swarmOverlayAgentScratch,
    swarmOverlayHawkScratch: deps.swarmOverlayHawkScratch,
    swarmGizmoHawkScratch: deps.swarmGizmoHawkScratch,
    swarmCursorState: deps.swarmCursorState,
    getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    writeInterpolatedSwarmAgentPos: swarmLoopRuntime.writeInterpolatedSwarmAgentPos,
    writeInterpolatedSwarmHawkPos: swarmLoopRuntime.writeInterpolatedSwarmHawkPos,
    mapCoordToWorld: deps.mapCoordToWorld,
    worldToScreen: deps.worldToScreen,
    overlayCtx: deps.overlayCtx,
    hexToRgb01: deps.hexToRgb01,
    clamp: deps.clamp,
    swarmZMax: deps.swarmZMax,
  });

  const renderSwarmLit = createSwarmLitRenderer({
    swarmState: deps.swarmState,
    clamp: deps.clamp,
    writeInterpolatedSwarmAgentPos: swarmLoopRuntime.writeInterpolatedSwarmAgentPos,
    writeInterpolatedSwarmHawkPos: swarmLoopRuntime.writeInterpolatedSwarmHawkPos,
    swarmLitAgentScratch: deps.swarmLitAgentScratch,
    swarmLitHawkScratch: deps.swarmLitHawkScratch,
    computeSwarmDirectionalShadow: deps.computeSwarmDirectionalShadow,
    getViewHalfExtents: deps.getViewHalfExtents,
    getMapAspect: deps.getMapAspect,
    hexToRgb01: deps.hexToRgb01,
    gl: deps.gl,
    swarmProgram: deps.swarmProgram,
    swarmUniforms: deps.swarmUniforms,
    normalsTex: deps.normalsTex,
    heightTex: deps.heightTex,
    pointLightTex: deps.pointLightTex,
    cloudNoiseTex: deps.cloudNoiseTex,
    heightSize: deps.heightSize,
    splatSize: deps.splatSize,
    canvas: deps.canvas,
    swarmHeightMax: deps.swarmHeightMax,
    pointLightEdgeMin: deps.pointLightEdgeMin,
    swarmPointVao: deps.swarmPointVao,
    swarmPointBuffer: deps.swarmPointBuffer,
  });

  return {
    stepSwarm,
    swarmLoopRuntime,
    swarmOverlayRuntime,
    renderSwarmLit,
  };
}
