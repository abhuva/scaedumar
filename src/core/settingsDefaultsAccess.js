export function createSettingsDefaultsAccess(deps) {
  function getSettingsDefaults(key, fallback) {
    if (!deps.settingsRegistry.has(key)) {
      return fallback;
    }
    return deps.settingsRegistry.getDefaults(key) || fallback;
  }

  return {
    getSettingsDefaults,
  };
}
