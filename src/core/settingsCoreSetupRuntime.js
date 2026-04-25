import { createTimeStateAccess } from "./timeStateAccess.js";
import { createAppliedSettingsStoreSync } from "./appliedSettingsStoreSync.js";
import { createSimulationKnobAccess } from "./simulationKnobAccess.js";
import { createSettingsRegistryBridge } from "./settingsRegistryBridge.js";
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
  const settingsRegistryBridge = createSettingsRegistryBridge({
    settingsRegistry: deps.settingsRegistry,
  });
  const settingsDefaultsAccess = createSettingsDefaultsAccess({
    settingsRegistry: deps.settingsRegistry,
  });
  const settingsApplyRuntime = {
    serializeSettingsByKey: (key, fallbackSerialize) =>
      settingsRegistryBridge.serializeSettingsByKey(key, fallbackSerialize),
    applySettingsByKey: (key, rawData, fallbackApply) =>
      settingsRegistryBridge.applySettingsByKey(key, rawData, fallbackApply),
    normalizeAppliedSettings: (key, rawData, fallbackDefaults) =>
      appliedSettingsStoreSync.normalizeAppliedSettings(key, rawData, fallbackDefaults),
    updateStoreFromAppliedSettings: (key, normalized) =>
      appliedSettingsStoreSync.updateStoreFromAppliedSettings(key, normalized),
    getSettingsDefaults: (key, fallback) =>
      settingsDefaultsAccess.getSettingsDefaults(key, fallback),
  };
  function getLegacyBindings() {
    return typeof deps.getLegacyBindings === "function" ? (deps.getLegacyBindings() || {}) : {};
  }

  function getSettingsRuntimeBinding() {
    return typeof deps.getSettingsRuntimeBinding === "function" ? deps.getSettingsRuntimeBinding() : null;
  }

  function callLegacy(name, ...args) {
    const bindings = getLegacyBindings();
    if (typeof bindings[name] !== "function") {
      throw new Error(`settingsBridgeRuntime missing legacy binding: ${name}`);
    }
    return bindings[name](...args);
  }

  function callCanonical(name, ...args) {
    const binding = getSettingsRuntimeBinding();
    if (!binding || typeof binding[name] !== "function") {
      throw new Error(`settingsBridgeRuntime missing canonical binding: ${name}`);
    }
    return binding[name](...args);
  }

  const settingsBridgeRuntime = {
    serializeLightingSettingsLegacy: (...args) => callLegacy("serializeLightingSettingsLegacy", ...args),
    applyLightingSettingsLegacy: (...args) => callLegacy("applyLightingSettingsLegacy", ...args),
    serializeFogSettingsLegacy: (...args) => callLegacy("serializeFogSettingsLegacy", ...args),
    applyFogSettingsLegacy: (...args) => callLegacy("applyFogSettingsLegacy", ...args),
    serializeParallaxSettingsLegacy: (...args) => callLegacy("serializeParallaxSettingsLegacy", ...args),
    applyParallaxSettingsLegacy: (...args) => callLegacy("applyParallaxSettingsLegacy", ...args),
    serializeCloudSettingsLegacy: (...args) => callLegacy("serializeCloudSettingsLegacy", ...args),
    applyCloudSettingsLegacy: (...args) => callLegacy("applyCloudSettingsLegacy", ...args),
    serializeWaterSettingsLegacy: (...args) => callLegacy("serializeWaterSettingsLegacy", ...args),
    applyWaterSettingsLegacy: (...args) => callLegacy("applyWaterSettingsLegacy", ...args),
    serializeInteractionSettingsLegacy: (...args) => callLegacy("serializeInteractionSettings", ...args),
    applyInteractionSettingsLegacy: (...args) => callLegacy("applyInteractionSettingsLegacy", ...args),
    serializeSwarmDataLegacy: (...args) => callLegacy("serializeSwarmDataLegacy", ...args),
    applySwarmSettingsLegacy: (...args) => callLegacy("applySwarmSettingsLegacy", ...args),
    applySwarmData: (...args) => callLegacy("applySwarmData", ...args),
    syncPathfindingSettingsUi: (...args) => callLegacy("syncPathfindingSettingsUi", ...args),
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
    settingsBridgeRuntime,
  };
}
