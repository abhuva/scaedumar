export function bindTopicPanelControls(deps) {
  for (const btn of deps.topicButtons) {
    btn.addEventListener("click", () => {
      const topic = btn.dataset.topic || "";
      const isAlreadyActive = btn.classList.contains("active");
      deps.setActiveTopic(isAlreadyActive ? "" : topic);
    });
  }

  deps.topicPanelCloseBtn.addEventListener("click", () => {
    deps.setActiveTopic("");
  });

  deps.windowEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      deps.setActiveTopic("");
    }
  });
}
