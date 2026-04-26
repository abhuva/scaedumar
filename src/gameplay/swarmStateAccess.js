export function setSwarmDefaults(deps) {
  deps.updateStoreFromAppliedSettings(
    "swarm",
    deps.normalizeAppliedSettings("swarm", deps.defaultSwarmSettings, deps.defaultSwarmSettings),
  );
  deps.applySwarmSettingsCompat(deps.defaultSwarmSettings);
  deps.stopSwarmFollow({ targetType: "agent" });
  deps.swarmState.breedingActive = false;
}

export function isSwarmEnabled(deps) {
  return Boolean(deps.getSwarmSettings().useAgentSwarm);
}
