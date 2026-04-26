export function createSettingsRegistryAdapter(deps) {
  function serializeSettingsByKey(key, fallbackSerialize) {
    if (!deps.settingsRegistry.has(key)) {
      return fallbackSerialize();
    }
    return deps.settingsRegistry.serialize(key, null);
  }

  function applySettingsByKey(key, rawData, fallbackApply) {
    if (!deps.settingsRegistry.has(key)) {
      fallbackApply(rawData);
      return;
    }
    if (!deps.settingsRegistry.validate(key, rawData)) {
      fallbackApply(rawData);
      return;
    }
    deps.settingsRegistry.apply(key, rawData, null);
  }

  return {
    serializeSettingsByKey,
    applySettingsByKey,
  };
}
