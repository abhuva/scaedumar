export function applyRuntimeParityFromCoreState(coreState, deps) {
  const camera = coreState && coreState.camera ? coreState.camera : null;
  const clock = coreState && coreState.clock ? coreState.clock : null;
  const gameplay = coreState && coreState.gameplay ? coreState.gameplay : null;

  if (camera) {
    if (Number.isFinite(camera.zoom)) {
      deps.setZoom(camera.zoom);
    }
    if (Number.isFinite(camera.panX)) {
      deps.panWorld.x = camera.panX;
    }
    if (Number.isFinite(camera.panY)) {
      deps.panWorld.y = camera.panY;
    }
  }

  if (clock && Number.isFinite(clock.timeScale)) {
    deps.cycleSpeedInput.value = String(deps.clamp(clock.timeScale, 0, 1));
  }

  if (!gameplay) return;

  if (typeof gameplay.interactionMode === "string") {
    deps.setInteractionMode(gameplay.interactionMode);
  }

  const pathfinding = gameplay.pathfinding || null;
  if (pathfinding) {
    if (Number.isFinite(pathfinding.range)) deps.pathfindingRangeInput.value = String(Math.round(deps.clamp(pathfinding.range, 30, 300)));
    if (Number.isFinite(pathfinding.weightSlope)) deps.pathWeightSlopeInput.value = String(deps.clamp(pathfinding.weightSlope, 0, 10));
    if (Number.isFinite(pathfinding.weightHeight)) deps.pathWeightHeightInput.value = String(deps.clamp(pathfinding.weightHeight, 0, 10));
    if (Number.isFinite(pathfinding.weightWater)) deps.pathWeightWaterInput.value = String(deps.clamp(pathfinding.weightWater, 0, 100));
    if (Number.isFinite(pathfinding.slopeCutoff)) deps.pathSlopeCutoffInput.value = String(Math.round(deps.clamp(pathfinding.slopeCutoff, 0, 90)));
    if (Number.isFinite(pathfinding.baseCost)) deps.pathBaseCostInput.value = String(deps.clamp(pathfinding.baseCost, 0, 2));
  }
}
