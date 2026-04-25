import { createModeTopicRuntimeBinding } from "./modeTopicRuntimeBinding.js";
import { createInteractionModeSnapshotRuntime } from "../gameplay/interactionModeSnapshotRuntime.js";

export function createModeInteractionRuntimeBinding(deps) {
  const interactionModeSnapshotRuntime = createInteractionModeSnapshotRuntime({
    resolveInteractionModeSnapshot: deps.resolveInteractionModeSnapshot,
    getCoreGameplay: deps.getCoreGameplay,
  });

  const modeTopicRuntimeBinding = createModeTopicRuntimeBinding({
    getModeValue: deps.getModeValue,
    normalizeRuntimeMode: deps.normalizeRuntimeMode,
    canUseModeTopic: deps.canUseModeTopic,
    canUseModeInteraction: deps.canUseModeInteraction,
    topicButtons: deps.topicButtons,
    topicCards: deps.topicCards,
    topicPanelEl: deps.topicPanelEl,
    topicPanelTitleEl: deps.topicPanelTitleEl,
    dockLightingModeToggle: deps.dockLightingModeToggle,
    dockPathfindingModeToggle: deps.dockPathfindingModeToggle,
    getInteractionModeSnapshot: interactionModeSnapshotRuntime.getInteractionModeSnapshot,
    setInteractionMode: deps.setInteractionMode,
    setStatus: deps.setStatus,
  });

  return {
    getRuntimeMode: () => modeTopicRuntimeBinding.getRuntimeMode(),
    canUseTopicInCurrentMode: (topic) => modeTopicRuntimeBinding.canUseTopicInCurrentMode(topic),
    canUseInteractionInCurrentMode: (mode) => modeTopicRuntimeBinding.canUseInteractionInCurrentMode(mode),
    setTopicPanelVisible: (visible) => modeTopicRuntimeBinding.setTopicPanelVisible(visible),
    setActiveTopic: (topicName) => modeTopicRuntimeBinding.setActiveTopic(topicName),
    updateModeCapabilitiesUi: () => modeTopicRuntimeBinding.updateModeCapabilitiesUi(),
    getInteractionModeSnapshot: interactionModeSnapshotRuntime.getInteractionModeSnapshot,
  };
}
