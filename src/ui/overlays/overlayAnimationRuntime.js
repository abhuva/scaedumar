export function createOverlayAnimationRuntime(deps) {
  function shouldAnimateOverlay() {
    if (!deps.isSwarmEnabled()) {
      return false;
    }
    const settings = deps.getSwarmSettings();
    const follow = deps.getSwarmFollowSnapshot();
    if (!settings.useLitSwarm) {
      return true;
    }
    return Boolean(
      (deps.swarmCursorState.active && settings.cursorMode !== "none")
      || (settings.followHawkRangeGizmo
        && follow.enabled
        && follow.targetType === "hawk")
    );
  }

  return {
    shouldAnimateOverlay,
  };
}
