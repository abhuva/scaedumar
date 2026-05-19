import { normalizeWorkspaceId } from "./workspaceRegistry.js";

export function createWorkspaceRuntime(deps) {
  function normalizeWorkspace(workspace) {
    return normalizeWorkspaceId(workspace);
  }

  function syncWorkspaceUi(workspace) {
    const activeWorkspace = normalizeWorkspace(workspace);
    for (const panel of deps.workspacePanels || []) {
      panel.classList.toggle("active", normalizeWorkspace(panel.dataset.workspacePanel) === activeWorkspace);
    }
    for (const btn of deps.workspaceButtons) {
      const active = normalizeWorkspace(btn.dataset.workspace) === activeWorkspace;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (activeWorkspace !== "map") {
      deps.setActiveTopic("");
      deps.setInteractionMode("none");
    }
  }

  return {
    normalizeWorkspace,
    syncWorkspaceUi,
  };
}
