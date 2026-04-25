import { createSettingsLegacyRuntimeBinding } from "./settingsLegacyRuntimeBinding.js";
import { createSettingsRuntimeBinding } from "../core/settingsRuntimeBinding.js";

export function createSettingsAssemblyRuntime(deps) {
  const settingsLegacyBindings = createSettingsLegacyRuntimeBinding(deps.legacy);
  const settingsRuntimeBinding = createSettingsRuntimeBinding({
    settingsApplyRuntime: deps.settingsApplyRuntime,
    defaultLightingSettings: deps.defaultLightingSettings,
    defaultFogSettings: deps.defaultFogSettings,
    defaultParallaxSettings: deps.defaultParallaxSettings,
    defaultCloudSettings: deps.defaultCloudSettings,
    defaultWaterSettings: deps.defaultWaterSettings,
    defaultInteractionSettings: deps.defaultInteractionSettings,
    defaultSwarmSettings: deps.defaultSwarmSettings,
    serializeLightingSettingsLegacy: (...args) => deps.settingsBridgeRuntime.serializeLightingSettingsLegacy(...args),
    applyLightingSettingsLegacy: (...args) => deps.settingsBridgeRuntime.applyLightingSettingsLegacy(...args),
    serializeFogSettingsLegacy: (...args) => deps.settingsBridgeRuntime.serializeFogSettingsLegacy(...args),
    applyFogSettingsLegacy: (...args) => deps.settingsBridgeRuntime.applyFogSettingsLegacy(...args),
    serializeParallaxSettingsLegacy: (...args) => deps.settingsBridgeRuntime.serializeParallaxSettingsLegacy(...args),
    applyParallaxSettingsLegacy: (...args) => deps.settingsBridgeRuntime.applyParallaxSettingsLegacy(...args),
    serializeCloudSettingsLegacy: (...args) => deps.settingsBridgeRuntime.serializeCloudSettingsLegacy(...args),
    applyCloudSettingsLegacy: (...args) => deps.settingsBridgeRuntime.applyCloudSettingsLegacy(...args),
    serializeWaterSettingsLegacy: (...args) => deps.settingsBridgeRuntime.serializeWaterSettingsLegacy(...args),
    applyWaterSettingsLegacy: (...args) => deps.settingsBridgeRuntime.applyWaterSettingsLegacy(...args),
    serializeInteractionSettingsLegacy: (...args) => deps.settingsBridgeRuntime.serializeInteractionSettingsLegacy(...args),
    applyInteractionSettingsLegacy: (...args) => deps.settingsBridgeRuntime.applyInteractionSettingsLegacy(...args),
    serializeSwarmDataLegacy: (...args) => deps.settingsBridgeRuntime.serializeSwarmDataLegacy(...args),
    applySwarmSettingsLegacy: (...args) => deps.settingsBridgeRuntime.applySwarmSettingsLegacy(...args),
    syncSwarmStateToStore: deps.syncSwarmStateToStore,
  });

  return {
    settingsLegacyBindings,
    settingsRuntimeBinding,
  };
}
