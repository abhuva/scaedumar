export function bindWorkspaceControls(deps) {
  for (const btn of deps.workspaceButtons) {
    btn.addEventListener("click", () => {
      deps.dispatchCoreCommand({
        type: "core/workspace/setActive",
        workspace: btn.dataset.workspace || "map",
      });
    });
  }
}

