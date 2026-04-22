export function bindPathfindingControls(deps) {
  deps.pathfindingRangeInput.addEventListener("input", () => {
    deps.dispatchCoreCommand({ type: "core/pathfinding/setRange" });
  });

  deps.pathWeightSlopeInput.addEventListener("input", () => {
    deps.dispatchCoreCommand({ type: "core/pathfinding/setWeightSlope" });
  });

  deps.pathWeightHeightInput.addEventListener("input", () => {
    deps.dispatchCoreCommand({ type: "core/pathfinding/setWeightHeight" });
  });

  deps.pathWeightWaterInput.addEventListener("input", () => {
    deps.dispatchCoreCommand({ type: "core/pathfinding/setWeightWater" });
  });

  deps.pathSlopeCutoffInput.addEventListener("input", () => {
    deps.dispatchCoreCommand({ type: "core/pathfinding/setSlopeCutoff" });
  });

  deps.pathBaseCostInput.addEventListener("input", () => {
    deps.dispatchCoreCommand({ type: "core/pathfinding/setBaseCost" });
  });
}
