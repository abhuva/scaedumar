export function createSettingsDefaultsAccess(deps) {
  function getSettingsDefaults(key, fallback) {
    if (!deps.settingsRegistry.has(key)) {
      return fallback;
    }
    const registryDefaults = deps.settingsRegistry.getDefaults(key);
    return registryDefaults ?? fallback;
  }

  return {
    getSettingsDefaults,
  };
}
