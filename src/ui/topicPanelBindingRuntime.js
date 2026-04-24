import { bindTopicPanelControls } from "./bindings/topicPanelBinding.js";

export function bindTopicPanelRuntime(deps) {
  bindTopicPanelControls({
    topicButtons: deps.topicButtons,
    topicPanelCloseBtn: deps.topicPanelCloseBtn,
    windowEl: deps.windowEl,
    setActiveTopic: deps.setActiveTopic,
    canUseTopic: deps.canUseTopic,
    setStatus: deps.setStatus,
  });
}
