import { createSettingsCompatRuntimeBinding } from "./settingsCompatRuntimeBinding.js";
import { createSettingsRuntimeBinding } from "../core/settingsRuntimeBinding.js";

export function createSettingsAssemblyRuntime(deps) {
  const settingsCompatBindings = createSettingsCompatRuntimeBinding(deps.Compat);
  const settingsRuntimeBinding = createSettingsRuntimeBinding({
    settingsApplyRuntime: deps.settingsApplyRuntime,
    defaultLightingSettings: deps.defaultLightingSettings,
    defaultFogSettings: deps.defaultFogSettings,
    defaultParallaxSettings: deps.defaultParallaxSettings,
    defaultCloudSettings: deps.defaultCloudSettings,
    defaultWaterSettings: deps.defaultWaterSettings,
    defaultInteractionSettings: deps.defaultInteractionSettings,
    defaultSwarmSettings: deps.defaultSwarmSettings,
    serializeLightingSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeLightingSettingsCompat(...args),
    applyLightingSettingsCompat: (...args) => deps.settingsCompatRuntime.applyLightingSettingsCompat(...args),
    serializeFogSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeFogSettingsCompat(...args),
    applyFogSettingsCompat: (...args) => deps.settingsCompatRuntime.applyFogSettingsCompat(...args),
    serializeParallaxSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeParallaxSettingsCompat(...args),
    applyParallaxSettingsCompat: (...args) => deps.settingsCompatRuntime.applyParallaxSettingsCompat(...args),
    serializeCloudSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeCloudSettingsCompat(...args),
    applyCloudSettingsCompat: (...args) => deps.settingsCompatRuntime.applyCloudSettingsCompat(...args),
    serializeWaterSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeWaterSettingsCompat(...args),
    applyWaterSettingsCompat: (...args) => deps.settingsCompatRuntime.applyWaterSettingsCompat(...args),
    serializeInteractionSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeInteractionSettingsCompat(...args),
    applyInteractionSettingsCompat: (...args) => deps.settingsCompatRuntime.applyInteractionSettingsCompat(...args),
    serializeSwarmDataCompat: (...args) => deps.settingsCompatRuntime.serializeSwarmDataCompat(...args),
    applySwarmSettingsCompat: (...args) => deps.settingsCompatRuntime.applySwarmSettingsCompat(...args),
    syncSwarmStateToStore: deps.syncSwarmStateToStore,
  });

  return {
    settingsCompatBindings,
    settingsRuntimeBinding,
  };
}
