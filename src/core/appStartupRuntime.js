import { runStartupUiSync } from "../ui/startupUiSync.js";

export async function tryAutoLoadDefaultMapRuntime(deps) {
  try {
    await deps.tryAutoLoadDefaultMap();
  } catch (error) {
    console.error("Default map auto-load failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    deps.setStatus(`Default map auto-load failed: ${message}`);
  }
}

export function runAppStartupRuntime(deps) {
  runStartupUiSync(deps.startupUiSync);
  if (typeof deps.resize === "function") {
    deps.resize();
  }
  deps.requestAnimationFrame(deps.render);
}
