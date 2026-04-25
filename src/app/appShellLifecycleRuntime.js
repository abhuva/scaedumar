import { tryAutoLoadDefaultMapRuntime, runAppStartupRuntime } from "../core/appStartupRuntime.js";
import { createMainBindingsAssemblyRuntime } from "./mainBindingsAssemblyRuntime.js";
import { setupMainBindingsRuntime } from "../ui/mainBindingsRuntime.js";

export function runAppShellLifecycleRuntime(deps) {
  setupMainBindingsRuntime(createMainBindingsAssemblyRuntime(deps.bindings));

  tryAutoLoadDefaultMapRuntime(deps.autoLoad).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    if (deps.autoLoad && typeof deps.autoLoad.setStatus === "function") {
      deps.autoLoad.setStatus(`Default map auto-load failed: ${message}`);
      return;
    }
    console.error("Default map auto-load failed:", error);
  });

  const startupUiSync = deps.startup;
  const requiredStartupKeys = ["setStatus", "updateSwarmUi", "updateSwarmLabels", "setCycleHourSliderFromState"];
  for (const key of requiredStartupKeys) {
    if (typeof startupUiSync[key] !== "function") {
      throw new Error(`Missing startup dependency: startupUiSync.${key}`);
    }
  }

  runAppStartupRuntime({
    startupUiSync,
    resize: deps.startup.resize,
    render: deps.startup.render,
    requestAnimationFrame: (cb) => deps.windowEl.requestAnimationFrame(cb),
  });
}
