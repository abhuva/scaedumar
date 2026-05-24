export function resolveTauriWindow(win) {
  const tauriWindow = win && win.__TAURI__ && win.__TAURI__.window;
  if (!tauriWindow || typeof tauriWindow !== "object") return null;
  if (typeof tauriWindow.getCurrentWindow === "function") {
    return tauriWindow.getCurrentWindow();
  }
  return tauriWindow.appWindow || null;
}

export async function toggleTauriFullscreen(win) {
  const appWindow = resolveTauriWindow(win);
  if (
    !appWindow
    || typeof appWindow.isFullscreen !== "function"
    || typeof appWindow.setFullscreen !== "function"
  ) {
    return false;
  }
  const fullscreen = await appWindow.isFullscreen();
  await appWindow.setFullscreen(!fullscreen);
  return true;
}

function isFullscreenShortcut(event) {
  return event && (event.key === "F11" || (event.altKey && event.key === "Enter"));
}

export function bindDesktopWindowControls(deps) {
  const windowEl = deps && deps.windowEl;
  if (!windowEl || typeof windowEl.addEventListener !== "function") return;
  windowEl.addEventListener("keydown", (event) => {
    if (!isFullscreenShortcut(event)) return;
    if (resolveTauriWindow(windowEl) && event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    toggleTauriFullscreen(windowEl).catch((error) => {
      if (typeof deps.setStatus === "function") {
        deps.setStatus(`Fullscreen toggle failed: ${error instanceof Error ? error.message : error}`);
      }
    });
  });
}
