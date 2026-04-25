export function createSettingsRuntimeBinding(deps) {
  function make(key, compatSerializer, compatApplier, fallbackDefaults) {
    return {
      serialize: () => deps.settingsApplyRuntime.serializeSettingsByKey(key, compatSerializer),
      apply: (rawData) => {
        deps.settingsApplyRuntime.updateStoreFromAppliedSettings(
          key,
          deps.settingsApplyRuntime.normalizeAppliedSettings(key, rawData, fallbackDefaults),
        );
        deps.settingsApplyRuntime.applySettingsByKey(key, rawData, compatApplier);
      },
    };
  }

  const lighting = make(
    "lighting",
    deps.serializeLightingSettingsCompat,
    deps.applyLightingSettingsCompat,
    deps.defaultLightingSettings,
  );
  const fog = make(
    "fog",
    deps.serializeFogSettingsCompat,
    deps.applyFogSettingsCompat,
    deps.defaultFogSettings,
  );
  const parallax = make(
    "parallax",
    deps.serializeParallaxSettingsCompat,
    deps.applyParallaxSettingsCompat,
    deps.defaultParallaxSettings,
  );
  const clouds = make(
    "clouds",
    deps.serializeCloudSettingsCompat,
    deps.applyCloudSettingsCompat,
    deps.defaultCloudSettings,
  );
  const waterfx = make(
    "waterfx",
    deps.serializeWaterSettingsCompat,
    deps.applyWaterSettingsCompat,
    deps.defaultWaterSettings,
  );
  const interaction = make(
    "interaction",
    deps.serializeInteractionSettingsCompat,
    deps.applyInteractionSettingsCompat,
    deps.defaultInteractionSettings,
  );

  return {
    serializeLightingSettings: lighting.serialize,
    applyLightingSettings: lighting.apply,
    serializeFogSettings: fog.serialize,
    applyFogSettings: fog.apply,
    serializeParallaxSettings: parallax.serialize,
    applyParallaxSettings: parallax.apply,
    serializeCloudSettings: clouds.serialize,
    applyCloudSettings: clouds.apply,
    serializeWaterSettings: waterfx.serialize,
    applyWaterSettings: waterfx.apply,
    serializeInteractionSettings: interaction.serialize,
    applyInteractionSettings: interaction.apply,
    serializeSwarmData: () =>
      deps.settingsApplyRuntime.serializeSettingsByKey("swarm", deps.serializeSwarmDataCompat),
    applySwarmSettings: (rawData) => {
      deps.settingsApplyRuntime.updateStoreFromAppliedSettings(
        "swarm",
        deps.settingsApplyRuntime.normalizeAppliedSettings("swarm", rawData, deps.defaultSwarmSettings),
      );
      deps.applySwarmSettingsCompat(rawData);
      deps.syncSwarmStateToStore();
    },
    getSettingsDefaults: (key, fallback) =>
      deps.settingsApplyRuntime.getSettingsDefaults(key, fallback),
  };
}
