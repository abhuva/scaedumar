import { createStore, createInitialState } from "./state.js";
import { createScheduler } from "./scheduler.js";
import { createCommandBus } from "./commands.js";
import { createSettingsRegistry } from "./settingsRegistry.js";

export function createRuntimeCore() {
  return {
    store: createStore(createInitialState()),
    scheduler: createScheduler(),
    commandBus: createCommandBus(),
    settingsRegistry: createSettingsRegistry(),
    frame: {
      lastNowMs: null,
    },
  };
}

export function createCoreCommandDispatch(runtimeCore) {
  return function dispatchCoreCommand(command) {
    return runtimeCore.commandBus.dispatch(command, {
      store: runtimeCore.store,
      scheduler: runtimeCore.scheduler,
      settingsRegistry: runtimeCore.settingsRegistry,
    });
  };
}
