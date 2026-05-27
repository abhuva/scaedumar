import { isWorkspaceId, normalizeWorkspaceId } from "./workspaceRegistry.js";

export function createWorkspaceRuntime(deps) {
  function normalizeWorkspace(workspace) {
    return normalizeWorkspaceId(workspace);
  }

  function syncWorkspaceUi(workspace) {
    const activeWorkspace = normalizeWorkspace(workspace);
    for (const panel of deps.workspacePanels || []) {
      const panelWorkspace = panel.dataset.workspacePanel;
      panel.classList.toggle("active", isWorkspaceId(panelWorkspace) && panelWorkspace === activeWorkspace);
    }
    for (const btn of deps.workspaceButtons) {
      const buttonWorkspace = btn.dataset.workspace;
      const active = isWorkspaceId(buttonWorkspace) && buttonWorkspace === activeWorkspace;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (activeWorkspace !== "map") {
      deps.setInteractionMode("none");
    }
  }

  return {
    normalizeWorkspace,
    syncWorkspaceUi,
  };
}
