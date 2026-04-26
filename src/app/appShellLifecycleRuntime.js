import { tryAutoLoadDefaultMapRuntime, runAppStartupRuntime } from "../core/appStartupRuntime.js";
import { createMainBindingsAssemblyRuntime } from "./mainBindingsAssemblyRuntime.js";
import { setupMainBindingsRuntime } from "../ui/mainBindingsRuntime.js";

export function runAppShellLifecycleRuntime(deps) {
  setupMainBindingsRuntime(createMainBindingsAssemblyRuntime(deps.bindings));

  tryAutoLoadDefaultMapRuntime(deps.autoLoad);

  if (!deps.startup || typeof deps.startup !== "object") throw new Error("Missing startup dependency: deps.startup");
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
