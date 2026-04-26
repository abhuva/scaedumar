export function createSwarmFollowSmoothingRuntime(deps) {
  function resetSwarmFollowSpeedSmoothing() {
    deps.resetSwarmFollowSpeedNormFiltered();
  }

  return {
    resetSwarmFollowSpeedSmoothing,
  };
}
