export function createPathfindingSystem(deps) {
  return {
    update(_, state) {
      const current = state && state.gameplay && state.gameplay.pathfinding ? state.gameplay.pathfinding : {};
      const next = typeof deps.getPathfindingState === "function" ? deps.getPathfindingState() : current;
      if (typeof deps.setPathfindingState === "function") {
        deps.setPathfindingState(next);
      }
    },
  };
}
