export function createWorkspaceRuntime(deps) {
  function normalizeWorkspace(workspace) {
    return workspace === "audio" ? "audio" : "map";
  }

  function syncWorkspaceUi(workspace) {
    const activeWorkspace = normalizeWorkspace(workspace);
    deps.mapWorkspaceEl.classList.toggle("active", activeWorkspace === "map");
    deps.audioWorkspaceEl.classList.toggle("active", activeWorkspace === "audio");
    for (const btn of deps.workspaceButtons) {
      const active = normalizeWorkspace(btn.dataset.workspace) === activeWorkspace;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    }
    if (activeWorkspace === "audio") {
      deps.setActiveTopic("");
      deps.setInteractionMode("none");
    }
  }

  return {
    normalizeWorkspace,
    syncWorkspaceUi,
  };
}

