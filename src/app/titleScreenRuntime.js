export function createTitleScreenRuntime(deps) {
  const validModes = new Set(["dev", "gameplay"]);

  function setTitleVisible(visible) {
    deps.titleScreenEl.classList.toggle("hidden", !visible);
    deps.bodyEl.classList.toggle("shell-title", visible);
  }

  function setRuntimeModeClass(mode) {
    deps.bodyEl.classList.toggle("runtime-dev", mode === "dev");
    deps.bodyEl.classList.toggle("runtime-gameplay", mode === "gameplay");
  }

  function startMode(mode) {
    const nextMode = validModes.has(mode) ? mode : "dev";
    deps.dispatchCoreCommand({ type: "core/workspace/setActive", workspace: "map" });
    deps.dispatchCoreCommand({ type: "core/setMode", mode: nextMode });
    deps.setActiveTopic("");
    deps.updateModeCapabilitiesUi();
    setRuntimeModeClass(nextMode);
    setTitleVisible(false);
    deps.setStatus(nextMode === "gameplay" ? "New game started." : "Dev mode started.");
  }

  function exitToTitle() {
    deps.dispatchCoreCommand({ type: "core/interaction/setMode", mode: "none" });
    deps.setActiveTopic("");
    deps.updateModeCapabilitiesUi();
    setTitleVisible(true);
    deps.setStatus("Returned to title screen.");
  }

  async function quitGame() {
    if (!deps.isTauriRuntime) {
      deps.setStatus("Quit game is available in the desktop build only.");
      return;
    }
    try {
      await deps.invokeTauri("quit_app");
    } catch (err) {
      const message = err && err.message ? err.message : String(err);
      deps.setStatus(`Quit failed: ${message}`);
    }
  }

  function syncQuitAvailability() {
    deps.titleQuitGameBtn.disabled = !deps.isTauriRuntime;
    deps.titleQuitGameBtn.classList.toggle("disabled", !deps.isTauriRuntime);
    deps.titleQuitGameBtn.title = deps.isTauriRuntime ? "Exit game" : "Desktop build only";
  }

  function bindTitleScreen() {
    deps.titleNewGameBtn.addEventListener("click", () => startMode("gameplay"));
    deps.titleDevModeBtn.addEventListener("click", () => startMode("dev"));
    deps.titleQuitGameBtn.addEventListener("click", () => quitGame());
    if (deps.dockExitToTitleBtn) {
      deps.dockExitToTitleBtn.addEventListener("click", () => exitToTitle());
    }
    syncQuitAvailability();
    setRuntimeModeClass(deps.initialMode);
    setTitleVisible(true);
  }

  return {
    bindTitleScreen,
    startMode,
    exitToTitle,
    setTitleVisible,
  };
}
