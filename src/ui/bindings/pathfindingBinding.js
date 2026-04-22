export function bindPathfindingControls(deps) {
  const bindings = [
    { element: deps.pathfindingRangeInput, type: "core/pathfinding/setRange" },
    { element: deps.pathWeightSlopeInput, type: "core/pathfinding/setWeightSlope" },
    { element: deps.pathWeightHeightInput, type: "core/pathfinding/setWeightHeight" },
    { element: deps.pathWeightWaterInput, type: "core/pathfinding/setWeightWater" },
    { element: deps.pathSlopeCutoffInput, type: "core/pathfinding/setSlopeCutoff" },
    { element: deps.pathBaseCostInput, type: "core/pathfinding/setBaseCost" },
  ];

  for (const binding of bindings) {
    binding.element.addEventListener("input", () => {
      deps.dispatchCoreCommand({ type: binding.type });
    });
  }
}
