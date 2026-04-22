export function createPathfindingSystem(deps) {
  return {
    update(_, state) {
      const current = state && state.gameplay && state.gameplay.pathfinding ? state.gameplay.pathfinding : {};
      const nextCandidate = typeof deps.getPathfindingState === "function" ? deps.getPathfindingState() : current;
      const next = nextCandidate ?? current;
      if (typeof deps.setPathfindingState === "function" && next !== null && next !== undefined) {
        deps.setPathfindingState(next);
      }
    },
  };
}
