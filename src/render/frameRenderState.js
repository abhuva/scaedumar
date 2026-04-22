export function buildFrameRenderState(input) {
  const coreState = input.coreState || {};
  const coreCamera = coreState.camera || {};
  const coreMap = coreState.map || {};
  const nowSec = Math.max(0, Number(input.nowMs) * 0.001);

  return {
    time: {
      nowMs: Number(input.nowMs) || 0,
      nowSec,
      dtSec: Number(input.dtSec) || 0,
      cycleHour: Number(input.cycleHour) || 0,
      cycleSpeedHoursPerSec: Number(input.cycleSpeedHoursPerSec) || 0,
    },
    camera: {
      panX: Number.isFinite(coreCamera.panX) ? coreCamera.panX : input.panWorld.x,
      panY: Number.isFinite(coreCamera.panY) ? coreCamera.panY : input.panWorld.y,
      zoom: Number.isFinite(coreCamera.zoom) ? coreCamera.zoom : input.zoom,
    },
    map: {
      folderPath: coreMap.folderPath || input.currentMapFolderPath,
      width: Number(coreMap.width) || input.splatSize.width,
      height: Number(coreMap.height) || input.splatSize.height,
      loaded: Boolean(coreMap.loaded),
    },
    lightingParams: input.lightingParams,
    uniformInput: input.uniformInput || {},
    showTerrain: Boolean(input.showTerrain),
    backgroundColorRgb: input.backgroundColorRgb || [0, 0, 0],
    swarm: {
      enabled: Boolean(input.swarmEnabled),
      litEnabled: Boolean(input.swarmLitEnabled),
    },
  };
}
