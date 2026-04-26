import { createModeStateAccess } from "../core/modeStateAccess.js";
import { createModeCapabilitiesUi } from "./modeCapabilitiesUi.js";
import { createTopicPanelRuntime } from "./topicPanelRuntime.js";

export function createModeTopicRuntimeBinding(deps) {
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

  const modeCapabilitiesUi = createModeCapabilitiesUi({
    topicButtons: deps.topicButtons,
    topicCards: deps.topicCards,
    topicPanelEl: deps.topicPanelEl,
    topicPanelTitleEl: deps.topicPanelTitleEl,
    dockLightingModeToggle: deps.dockLightingModeToggle,
    dockPathfindingModeToggle: deps.dockPathfindingModeToggle,
    getRuntimeMode,
    canUseModeTopic: deps.canUseModeTopic,
    canUseModeInteraction: deps.canUseModeInteraction,
    getInteractionModeSnapshot: deps.getInteractionModeSnapshot,
    setInteractionMode: deps.setInteractionMode,
  });

  const topicPanelRuntime = createTopicPanelRuntime({
    modeCapabilitiesUi,
    canUseTopicInCurrentMode,
    setStatus: deps.setStatus,
    getRuntimeMode,
  });

  return {
    getRuntimeMode,
    canUseTopicInCurrentMode,
    canUseInteractionInCurrentMode,
    setTopicPanelVisible: (visible) => topicPanelRuntime.setTopicPanelVisible(visible),
    setActiveTopic: (topicName) => topicPanelRuntime.setActiveTopic(topicName),
    updateModeCapabilitiesUi: () => topicPanelRuntime.updateModeCapabilitiesUi(),
  };
}
