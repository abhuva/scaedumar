export function bindWorkspaceControls(deps) {
  for (const btn of deps.workspaceButtons) {
    btn.addEventListener("click", () => {
      const isToggle = btn.dataset.workspaceToggle === "true";
      const isPressed = btn.getAttribute("aria-pressed") === "true";
      deps.dispatchCoreCommand({
        type: "core/workspace/setActive",
        workspace: isToggle && isPressed ? "map" : (btn.dataset.workspace || "map"),
      });
    });
  }
}
