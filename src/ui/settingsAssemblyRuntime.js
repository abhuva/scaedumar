import { createSettingsCompatRuntimeBinding } from "./settingsCompatRuntimeBinding.js";
import { createSettingsRuntimeBinding } from "../core/settingsRuntimeBinding.js";

export function createSettingsAssemblyRuntime(deps) {
  const settingsCompatBindings = createSettingsCompatRuntimeBinding(deps.Compat);
  const settingsRuntimeBinding = createSettingsRuntimeBinding({
    settingsApplyRuntime: deps.settingsApplyRuntime,
    defaultLightingSettings: deps.defaultLightingSettings,
    defaultFogSettings: deps.defaultFogSettings,
    defaultCloudSettings: deps.defaultCloudSettings,
    defaultWaterSettings: deps.defaultWaterSettings,
    defaultDetailSettings: deps.defaultDetailSettings,
    defaultApronSettings: deps.defaultApronSettings,
    defaultCameraSettings: deps.defaultCameraSettings,
    defaultInteractionSettings: deps.defaultInteractionSettings,
    defaultSwarmSettings: deps.defaultSwarmSettings,
    defaultAudioSettings: deps.defaultAudioSettings,
    serializeLightingSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeLightingSettingsCompat(...args),
    applyLightingSettingsCompat: (...args) => deps.settingsCompatRuntime.applyLightingSettingsCompat(...args),
    serializeFogSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeFogSettingsCompat(...args),
    applyFogSettingsCompat: (...args) => deps.settingsCompatRuntime.applyFogSettingsCompat(...args),
    serializeCloudSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeCloudSettingsCompat(...args),
    applyCloudSettingsCompat: (...args) => deps.settingsCompatRuntime.applyCloudSettingsCompat(...args),
    serializeWaterSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeWaterSettingsCompat(...args),
    applyWaterSettingsCompat: (...args) => deps.settingsCompatRuntime.applyWaterSettingsCompat(...args),
    serializeDetailSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeDetailSettingsCompat(...args),
    applyDetailSettingsCompat: (...args) => deps.settingsCompatRuntime.applyDetailSettingsCompat(...args),
    serializeApronSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeApronSettingsCompat(...args),
    applyApronSettingsCompat: (...args) => deps.settingsCompatRuntime.applyApronSettingsCompat(...args),
    serializeCameraSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeCameraSettingsCompat(...args),
    applyCameraSettingsCompat: (...args) => deps.settingsCompatRuntime.applyCameraSettingsCompat(...args),
    serializeInteractionSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeInteractionSettingsCompat(...args),
    applyInteractionSettingsCompat: (...args) => deps.settingsCompatRuntime.applyInteractionSettingsCompat(...args),
    serializeAudioSettingsCompat: (...args) => deps.settingsCompatRuntime.serializeAudioSettingsCompat(...args),
    applyAudioSettingsCompat: (...args) => deps.settingsCompatRuntime.applyAudioSettingsCompat(...args),
    serializeSwarmDataCompat: (...args) => deps.settingsCompatRuntime.serializeSwarmDataCompat(...args),
    applySwarmSettingsCompat: (...args) => deps.settingsCompatRuntime.applySwarmSettingsCompat(...args),
    syncSwarmStateToStore: deps.syncSwarmStateToStore,
  });

  return {
    settingsCompatBindings,
    settingsRuntimeBinding,
  };
}
