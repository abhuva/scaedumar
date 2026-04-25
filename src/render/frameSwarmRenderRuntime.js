export function renderFrameSwarmLayers(deps) {
  const swarmSettings = deps.getSwarmSettings();
  const swarmEnabled = swarmSettings.useAgentSwarm;
  const showTerrain = !swarmEnabled || swarmSettings.showTerrainInSwarm;
  const frameState = deps.buildFrameRenderState({
    coreState: deps.coreState,
    nowMs: deps.nowMs,
    dtSec: deps.dtSec,
    cycleHour: deps.cycleState.hour,
    cycleSpeedHoursPerSec: deps.cycleSpeed,
    cloudTimeSec: deps.smoothCloudTimeSec,
    currentMapFolderPath: deps.currentMapFolderPath,
    splatSize: deps.splatSize,
    lightingParams: deps.lightingParams,
    uniformInput: deps.uniformInput,
    showTerrain,
    backgroundColorRgb: deps.hexToRgb01(swarmSettings.backgroundColor),
    swarmEnabled,
    swarmLitEnabled: swarmSettings.useLitSwarm,
  });
  deps.renderer.renderTerrainFrame(frameState);
  if (frameState.swarm.enabled && frameState.swarm.litEnabled) {
    deps.renderSwarmLit(
      frameState.lightingParams,
      frameState.time,
      swarmSettings,
      frameState.uniformInput,
      frameState.camera,
    );
  }
  return frameState;
}
