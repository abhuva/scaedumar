import { createTimeStateAccess } from "./timeStateAccess.js";
import { createAppliedSettingsStoreSync } from "./appliedSettingsStoreSync.js";
import { createSimulationKnobAccess } from "./simulationKnobAccess.js";
import { createSettingsRegistryAdapter } from "./settingsRegistryAdapter.js";
import { createSettingsDefaultsAccess } from "./settingsDefaultsAccess.js";

export function createSettingsCoreSetupRuntime(deps) {
  const timeStateRuntime = createTimeStateAccess({
    getSettingsDefaults: deps.getSettingsDefaults,
    defaultLightingSettings: deps.defaultLightingSettings,
    defaultCloudSettings: deps.defaultCloudSettings,
    defaultWaterSettings: deps.defaultWaterSettings,
    normalizeTimeRouting: deps.normalizeTimeRouting,
    normalizeRoutingMode: deps.normalizeRoutingMode,
    normalizeSimTickHours: deps.normalizeSimTickHours,
    getCoreState: deps.getCoreState,
    clamp: deps.clamp,
    simSecondsPerHour: deps.simSecondsPerHour,
  });
  const appliedSettingsStoreSync = createAppliedSettingsStoreSync({
    runtimeCore: deps.runtimeCore,
    getSettingsDefaults: deps.getSettingsDefaults,
    clamp: deps.clamp,
    normalizeSimTickHours: deps.normalizeSimTickHours,
    normalizeRoutingMode: deps.normalizeRoutingMode,
  });
  const simulationKnobAccess = createSimulationKnobAccess({
    getCoreState: deps.getCoreState,
  });
  const settingsRegistryAdapter = createSettingsRegistryAdapter({
    settingsRegistry: deps.settingsRegistry,
  });
  const settingsDefaultsAccess = createSettingsDefaultsAccess({
    settingsRegistry: deps.settingsRegistry,
  });
  const settingsApplyRuntime = {
    serializeSettingsByKey: (key, fallbackSerialize) =>
      settingsRegistryAdapter.serializeSettingsByKey(key, fallbackSerialize),
    applySettingsByKey: (key, rawData, fallbackApply) =>
      settingsRegistryAdapter.applySettingsByKey(key, rawData, fallbackApply),
    normalizeAppliedSettings: (key, rawData, fallbackDefaults) =>
      appliedSettingsStoreSync.normalizeAppliedSettings(key, rawData, fallbackDefaults),
    updateStoreFromAppliedSettings: (key, normalized) =>
      appliedSettingsStoreSync.updateStoreFromAppliedSettings(key, normalized),
    getSettingsDefaults: (key, fallback) =>
      settingsDefaultsAccess.getSettingsDefaults(key, fallback),
  };
  function getCompatBindings() {
    return typeof deps.getCompatBindings === "function" ? (deps.getCompatBindings() || {}) : {};
  }

  function getSettingsRuntimeBinding() {
    return typeof deps.getSettingsRuntimeBinding === "function" ? deps.getSettingsRuntimeBinding() : null;
  }

  function callCompat(name, ...args) {
    const bindings = getCompatBindings();
    if (typeof bindings[name] !== "function") {
      throw new Error(`settingsCompatRuntime missing compatibility binding: ${name}`);
    }
    return bindings[name](...args);
  }

  function callCanonical(name, ...args) {
    const binding = getSettingsRuntimeBinding();
    if (!binding || typeof binding[name] !== "function") {
      throw new Error(`settingsCompatRuntime missing canonical binding: ${name}`);
    }
    return binding[name](...args);
  }

  const settingsCompatRuntime = {
    serializeLightingSettingsCompat: (...args) => callCompat("serializeLightingSettingsCompat", ...args),
    applyLightingSettingsCompat: (...args) => callCompat("applyLightingSettingsCompat", ...args),
    serializeFogSettingsCompat: (...args) => callCompat("serializeFogSettingsCompat", ...args),
    applyFogSettingsCompat: (...args) => callCompat("applyFogSettingsCompat", ...args),
    serializeParallaxSettingsCompat: (...args) => callCompat("serializeParallaxSettingsCompat", ...args),
    applyParallaxSettingsCompat: (...args) => callCompat("applyParallaxSettingsCompat", ...args),
    serializeCloudSettingsCompat: (...args) => callCompat("serializeCloudSettingsCompat", ...args),
    applyCloudSettingsCompat: (...args) => callCompat("applyCloudSettingsCompat", ...args),
    serializeWaterSettingsCompat: (...args) => callCompat("serializeWaterSettingsCompat", ...args),
    applyWaterSettingsCompat: (...args) => callCompat("applyWaterSettingsCompat", ...args),
    serializeInteractionSettingsCompat: (...args) => callCompat("serializeInteractionSettingsCompat", ...args),
    applyInteractionSettingsCompat: (...args) => callCompat("applyInteractionSettingsCompat", ...args),
    serializeSwarmDataCompat: (...args) => callCompat("serializeSwarmDataCompat", ...args),
    applySwarmSettingsCompat: (...args) => callCompat("applySwarmSettingsCompat", ...args),
    applySwarmData: (...args) => callCompat("applySwarmData", ...args),
    syncPathfindingSettingsUi: (...args) => callCompat("syncPathfindingSettingsUi", ...args),
    serializeLightingSettings: (...args) => callCanonical("serializeLightingSettings", ...args),
    applyLightingSettings: (...args) => callCanonical("applyLightingSettings", ...args),
    serializeFogSettings: (...args) => callCanonical("serializeFogSettings", ...args),
    applyFogSettings: (...args) => callCanonical("applyFogSettings", ...args),
    serializeParallaxSettings: (...args) => callCanonical("serializeParallaxSettings", ...args),
    applyParallaxSettings: (...args) => callCanonical("applyParallaxSettings", ...args),
    serializeCloudSettings: (...args) => callCanonical("serializeCloudSettings", ...args),
    applyCloudSettings: (...args) => callCanonical("applyCloudSettings", ...args),
    serializeWaterSettings: (...args) => callCanonical("serializeWaterSettings", ...args),
    applyWaterSettings: (...args) => callCanonical("applyWaterSettings", ...args),
    serializeInteractionSettings: (...args) => callCanonical("serializeInteractionSettings", ...args),
    applyInteractionSettings: (...args) => callCanonical("applyInteractionSettings", ...args),
    serializeSwarmData: (...args) => callCanonical("serializeSwarmData", ...args),
    applySwarmSettings: (...args) => callCanonical("applySwarmSettings", ...args),
    getSettingsDefaults: (key, fallback) => {
      const binding = getSettingsRuntimeBinding();
      if (binding && typeof binding.getSettingsDefaults === "function") {
        return binding.getSettingsDefaults(key, fallback);
      }
      return settingsApplyRuntime.getSettingsDefaults(key, fallback);
    },
  };

  return {
    timeStateRuntime,
    simulationKnobAccess,
    settingsApplyRuntime,
    settingsCompatRuntime,
  };
}
