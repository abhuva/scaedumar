export function createSettingsRuntimeBinding(deps) {
  return {
    serializeLightingSettings: () =>
      deps.settingsApplyRuntime.serializeSettingsByKey("lighting", deps.serializeLightingSettingsLegacy),
    applyLightingSettings: (rawData) => {
      deps.settingsApplyRuntime.updateStoreFromAppliedSettings(
        "lighting",
        deps.settingsApplyRuntime.normalizeAppliedSettings(
          "lighting",
          rawData,
          deps.defaultLightingSettings,
        ),
      );
      deps.settingsApplyRuntime.applySettingsByKey("lighting", rawData, deps.applyLightingSettingsLegacy);
    },
    serializeFogSettings: () =>
      deps.settingsApplyRuntime.serializeSettingsByKey("fog", deps.serializeFogSettingsLegacy),
    applyFogSettings: (rawData) => {
      deps.settingsApplyRuntime.updateStoreFromAppliedSettings(
        "fog",
        deps.settingsApplyRuntime.normalizeAppliedSettings("fog", rawData, deps.defaultFogSettings),
      );
      deps.settingsApplyRuntime.applySettingsByKey("fog", rawData, deps.applyFogSettingsLegacy);
    },
    serializeParallaxSettings: () =>
      deps.settingsApplyRuntime.serializeSettingsByKey("parallax", deps.serializeParallaxSettingsLegacy),
    applyParallaxSettings: (rawData) => {
      deps.settingsApplyRuntime.updateStoreFromAppliedSettings(
        "parallax",
        deps.settingsApplyRuntime.normalizeAppliedSettings(
          "parallax",
          rawData,
          deps.defaultParallaxSettings,
        ),
      );
      deps.settingsApplyRuntime.applySettingsByKey("parallax", rawData, deps.applyParallaxSettingsLegacy);
    },
    serializeCloudSettings: () =>
      deps.settingsApplyRuntime.serializeSettingsByKey("clouds", deps.serializeCloudSettingsLegacy),
    applyCloudSettings: (rawData) => {
      deps.settingsApplyRuntime.updateStoreFromAppliedSettings(
        "clouds",
        deps.settingsApplyRuntime.normalizeAppliedSettings("clouds", rawData, deps.defaultCloudSettings),
      );
      deps.settingsApplyRuntime.applySettingsByKey("clouds", rawData, deps.applyCloudSettingsLegacy);
    },
    serializeWaterSettings: () =>
      deps.settingsApplyRuntime.serializeSettingsByKey("waterfx", deps.serializeWaterSettingsLegacy),
    applyWaterSettings: (rawData) => {
      deps.settingsApplyRuntime.updateStoreFromAppliedSettings(
        "waterfx",
        deps.settingsApplyRuntime.normalizeAppliedSettings("waterfx", rawData, deps.defaultWaterSettings),
      );
      deps.settingsApplyRuntime.applySettingsByKey("waterfx", rawData, deps.applyWaterSettingsLegacy);
    },
    serializeInteractionSettings: () =>
      deps.settingsApplyRuntime.serializeSettingsByKey("interaction", deps.serializeInteractionSettingsLegacy),
    applyInteractionSettings: (rawData) => {
      deps.settingsApplyRuntime.updateStoreFromAppliedSettings(
        "interaction",
        deps.settingsApplyRuntime.normalizeAppliedSettings(
          "interaction",
          rawData,
          deps.defaultInteractionSettings,
        ),
      );
      deps.settingsApplyRuntime.applySettingsByKey("interaction", rawData, deps.applyInteractionSettingsLegacy);
    },
    serializeSwarmData: () =>
      deps.settingsApplyRuntime.serializeSettingsByKey("swarm", deps.serializeSwarmDataLegacy),
    applySwarmSettings: (rawData) => {
      deps.settingsApplyRuntime.updateStoreFromAppliedSettings(
        "swarm",
        deps.settingsApplyRuntime.normalizeAppliedSettings("swarm", rawData, deps.defaultSwarmSettings),
      );
      deps.applySwarmSettingsLegacy(rawData);
      deps.syncSwarmStateToStore();
    },
    getSettingsDefaults: (key, fallback) =>
      deps.settingsApplyRuntime.getSettingsDefaults(key, fallback),
  };
}
