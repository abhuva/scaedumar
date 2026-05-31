export function renderFrameSwarmLayers(deps) {
  const now = typeof deps.now === "function"
    ? deps.now
    : () => (typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now());
  const profile = deps.profile && typeof deps.profile === "object" ? deps.profile : null;
  const swarmSettings = deps.getSwarmSettings();
  const swarmEnabled = swarmSettings.useAgentSwarm;
  const showTerrain = !swarmEnabled || swarmSettings.showTerrainInSwarm;
  const swarmSpriteMode = typeof deps.isSwarmSpriteRenderMode === "function"
    ? deps.isSwarmSpriteRenderMode()
    : false;
  const buildStart = now();
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
    swarmLitEnabled: swarmSettings.useLitSwarm && !swarmSpriteMode,
  });
  if (profile) profile.frameStateMs = now() - buildStart;
  const terrainStart = now();
  deps.renderer.renderTerrainFrame(frameState);
  if (profile) profile.terrainRenderMs = now() - terrainStart;
  if (frameState.swarm.enabled && frameState.swarm.litEnabled) {
    const swarmLitStart = now();
    deps.renderSwarmLit(
      frameState.lightingParams,
      frameState.time,
      swarmSettings,
      frameState.uniformInput,
      frameState.camera,
    );
    if (profile) profile.swarmLitRenderMs = now() - swarmLitStart;
  } else if (profile) {
    profile.swarmLitRenderMs = 0;
  }
  return frameState;
}
