export function bindPathfindingControls(deps) {
  const bindings = [
    { element: deps.pathfindingRangeInput, type: "core/pathfinding/setRange" },
    { element: deps.pathWeightSlopeInput, type: "core/pathfinding/setWeightSlope" },
    { element: deps.pathWeightHeightInput, type: "core/pathfinding/setWeightHeight" },
    { element: deps.pathWeightWaterInput, type: "core/pathfinding/setWeightWater" },
    { element: deps.pathSlopeCutoffInput, type: "core/pathfinding/setSlopeCutoff" },
    { element: deps.pathBaseCostInput, type: "core/pathfinding/setBaseCost" },
  ];

  const listeners = [];
  for (const binding of bindings) {
    if (!binding.element || typeof binding.element.addEventListener !== "function") {
      continue;
    }
    const handler = () => {
      deps.dispatchCoreCommand({
        type: binding.type,
        value: Number(binding.element.value),
      });
    };
    binding.element.addEventListener("input", handler);
    listeners.push({ element: binding.element, handler });
  }

  return () => {
    for (const listener of listeners) {
      listener.element.removeEventListener("input", listener.handler);
    }
  };
}
