import { tryAutoLoadDefaultMapRuntime, runAppStartupRuntime } from "../core/appStartupRuntime.js";
import { createMainBindingsAssemblyRuntime } from "./mainBindingsAssemblyRuntime.js";
import { setupMainBindingsRuntime } from "../ui/mainBindingsRuntime.js";
import { createTitleScreenRuntime } from "./titleScreenRuntime.js";

const REQUIRED_TITLE_SCREEN_KEYS = [
  "bodyEl",
  "titleScreenEl",
  "titleNewGameBtn",
  "titleDevModeBtn",
  "titleQuitGameBtn",
  "dispatchCoreCommand",
  "setActiveTopic",
  "updateModeCapabilitiesUi",
  "setStatus",
];

function assertTitleScreenDeps(titleScreenDeps) {
  if (!titleScreenDeps || typeof titleScreenDeps !== "object") {
    throw new Error("Invalid deps.titleScreen for createTitleScreenRuntime: expected an object.");
  }
  for (const key of REQUIRED_TITLE_SCREEN_KEYS) {
    if (!titleScreenDeps[key]) {
      throw new Error(`Invalid deps.titleScreen for createTitleScreenRuntime: missing ${key}.`);
    }
  }
}

export function runAppShellLifecycleRuntime(deps) {
  setupMainBindingsRuntime(createMainBindingsAssemblyRuntime(deps.bindings));

  const mapReadyPromise = tryAutoLoadDefaultMapRuntime(deps.autoLoad);

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

  if (deps.titleScreen) {
    assertTitleScreenDeps(deps.titleScreen);
    const titleScreenRuntime = createTitleScreenRuntime(deps.titleScreen);
    deps.titleScreen.readyPromise = mapReadyPromise;
    if (!titleScreenRuntime || typeof titleScreenRuntime.bindTitleScreen !== "function") {
      throw new Error("createTitleScreenRuntime(deps.titleScreen) must return bindTitleScreen().");
    }
    titleScreenRuntime.bindTitleScreen();
  }
}
