export function createOverlayAnimationRuntime(deps) {
  function shouldAnimateOverlay() {
    if (!deps.isSwarmEnabled()) {
      return false;
    }
    const settings = deps.getSwarmSettings();
    if (!settings.useLitSwarm) {
      return true;
    }
    return Boolean(
      (deps.swarmCursorState.active && settings.cursorMode !== "none")
      || (settings.followHawkRangeGizmo
        && deps.swarmFollowState.enabled
        && deps.swarmFollowState.targetType === "hawk")
    );
  }

  return {
    shouldAnimateOverlay,
  };
}
