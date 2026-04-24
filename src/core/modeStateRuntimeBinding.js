import { createModeStateAccess } from "./modeStateAccess.js";

export function createModeStateRuntimeBinding(deps) {
  const modeStateAccess = createModeStateAccess({
    getModeValue: deps.getModeValue,
    normalizeRuntimeMode: deps.normalizeRuntimeMode,
    canUseModeTopic: deps.canUseModeTopic,
    canUseModeInteraction: deps.canUseModeInteraction,
  });

  function getRuntimeMode() {
    return modeStateAccess.getRuntimeMode();
  }

  function canUseTopicInCurrentMode(topic) {
    return modeStateAccess.canUseTopicInCurrentMode(topic);
  }

  function canUseInteractionInCurrentMode(mode) {
    return modeStateAccess.canUseInteractionInCurrentMode(mode);
  }

  return {
    getRuntimeMode,
    canUseTopicInCurrentMode,
    canUseInteractionInCurrentMode,
  };
}
