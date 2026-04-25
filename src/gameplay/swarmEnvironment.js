export function createSwarmEnvironment(deps) {
  function terrainFloorAtSwarmCoord(mapX, mapY) {
    return deps.sampleHeightAtMapPixel(mapX, mapY) * deps.swarmHeightMax + deps.terrainClearance;
  }

  function isWaterAtSwarmCoord(mapX, mapY) {
    if (!deps.waterImageData || !deps.waterImageData.data) return false;
    return deps.getGrayAt(deps.waterImageData, mapX, mapY) > 0.01;
  }

  function isSwarmCoordFlyable(mapX, mapY, maxFlight) {
    return terrainFloorAtSwarmCoord(mapX, mapY) <= maxFlight;
  }

  return {
    terrainFloorAtSwarmCoord,
    isWaterAtSwarmCoord,
    isSwarmCoordFlyable,
  };
}
