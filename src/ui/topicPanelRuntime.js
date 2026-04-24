export function createTopicPanelRuntime(deps) {
  function setTopicPanelVisible(visible) {
    deps.modeCapabilitiesUi.setTopicPanelVisible(visible);
  }

  function setActiveTopic(topicName) {
    let nextTopic = topicName;
    if (nextTopic && !deps.canUseTopicInCurrentMode(nextTopic)) {
      deps.setStatus(`'${nextTopic}' panel is unavailable in ${deps.getRuntimeMode()} mode.`);
      nextTopic = "";
    }
    deps.modeCapabilitiesUi.setActiveTopic(nextTopic);
  }

  function updateModeCapabilitiesUi() {
    deps.modeCapabilitiesUi.updateModeCapabilitiesUi();
  }

  return {
    setTopicPanelVisible,
    setActiveTopic,
    updateModeCapabilitiesUi,
  };
}
