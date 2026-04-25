export function createModeStateAccess(deps) {
  function getRuntimeMode() {
    return deps.normalizeRuntimeMode(deps.getModeValue());
  }

  function canUseTopicInCurrentMode(topic) {
    return deps.canUseModeTopic(getRuntimeMode(), topic);
  }

  function canUseInteractionInCurrentMode(mode) {
    return deps.canUseModeInteraction(getRuntimeMode(), mode);
  }

  return {
    getRuntimeMode,
    canUseTopicInCurrentMode,
    canUseInteractionInCurrentMode,
  };
}
