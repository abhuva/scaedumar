export function createPathfindingSettingsApplier(deps) {
  return function syncPathfindingSettingsUi() {
    const pathfinding = deps.getPathfindingStateSnapshot();
    deps.pathfindingRangeInput.value = String(pathfinding.range);
    deps.pathWeightSlopeInput.value = String(pathfinding.weightSlope);
    deps.pathWeightHeightInput.value = String(pathfinding.weightHeight);
    deps.pathWeightWaterInput.value = String(pathfinding.weightWater);
    deps.pathSlopeCutoffInput.value = String(pathfinding.slopeCutoff);
    deps.pathBaseCostInput.value = String(pathfinding.baseCost);

    deps.updatePathfindingRangeLabel();
    deps.updatePathWeightLabels();
    deps.updatePathSlopeCutoffLabel();
    deps.updatePathBaseCostLabel();
  };
}
