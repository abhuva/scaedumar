export function createSettingsCoreAssemblyRuntime(deps) {
  return {
    runtimeCore: deps.runtimeCore,
    settingsRegistry: deps.settingsRegistry,
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
    getSettingsRuntimeBinding: deps.getSettingsRuntimeBinding,
    getCompatBindings: deps.getCompatBindings,
  };
}
