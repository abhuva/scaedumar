export function createModeCapabilitiesUi(deps) {
  function setTopicPanelVisible(visible) {
    deps.topicPanelEl.classList.toggle("hidden", !visible);
  }

  function setActiveTopic(topicName) {
    if (!topicName) {
      for (const btn of deps.topicButtons) btn.classList.remove("active");
      for (const card of deps.topicCards) card.classList.remove("active");
      deps.topicPanelEl.dataset.activeTopic = "";
      setTopicPanelVisible(false);
      return;
    }
    let opened = false;
    for (const btn of deps.topicButtons) {
      const active = btn.dataset.topic === topicName;
      btn.classList.toggle("active", active);
      if (active) opened = true;
    }
    for (const card of deps.topicCards) {
      const active = card.dataset.topic === topicName;
      card.classList.toggle("active", active);
      if (active) {
        deps.topicPanelTitleEl.textContent = card.dataset.title || "Settings";
      }
    }
    deps.topicPanelEl.dataset.activeTopic = opened ? topicName : "";
    setTopicPanelVisible(opened);
  }

  function updateModeCapabilitiesUi() {
    const mode = deps.getRuntimeMode();
    for (const btn of deps.topicButtons) {
      const topic = btn.dataset.topic || "";
      const enabled = deps.canUseModeTopic(mode, topic);
      btn.disabled = !enabled;
      btn.classList.toggle("disabled", !enabled);
      btn.classList.toggle("mode-capability-hidden", !enabled);
    }
    const activeTopicButton = deps.topicButtons.find((btn) => btn.classList.contains("active"));
    const activeTopic = activeTopicButton ? activeTopicButton.dataset.topic || "" : "";
    if (activeTopic && !deps.canUseModeTopic(mode, activeTopic)) {
      setActiveTopic("");
    }
    if (!deps.canUseModeInteraction(mode, deps.getInteractionModeSnapshot())) {
      deps.setInteractionMode("none");
    }
  }

  return {
    setTopicPanelVisible,
    setActiveTopic,
    updateModeCapabilitiesUi,
  };
}
