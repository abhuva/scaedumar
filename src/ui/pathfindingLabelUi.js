export function updatePathfindingRangeLabel(deps) {
  const value = deps.getPathfindingStateSnapshot().range;
  deps.pathfindingRangeValue.textContent = `${value} x ${value}`;
}

export function updatePathWeightLabels(deps) {
  const pathfinding = deps.getPathfindingStateSnapshot();
  const slopeWeight = pathfinding.weightSlope;
  const heightWeight = pathfinding.weightHeight;
  const waterWeight = pathfinding.weightWater;
  deps.pathWeightSlopeValue.textContent = slopeWeight.toFixed(1);
  deps.pathWeightHeightValue.textContent = heightWeight.toFixed(1);
  deps.pathWeightWaterValue.textContent = waterWeight.toFixed(1);
}

export function updatePathSlopeCutoffLabel(deps) {
  const cutoff = deps.getPathfindingStateSnapshot().slopeCutoff;
  deps.pathSlopeCutoffValue.textContent = `${cutoff} deg`;
}

export function updatePathBaseCostLabel(deps) {
  const baseCost = deps.getPathfindingStateSnapshot().baseCost;
  deps.pathBaseCostValue.textContent = baseCost.toFixed(1);
}
