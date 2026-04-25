export function createTimeStateAccess(deps) {
  function getDefaultTimeRouting() {
    const lightingDefaults = deps.getSettingsDefaults("lighting", deps.defaultLightingSettings);
    const cloudDefaults = deps.getSettingsDefaults("clouds", deps.defaultCloudSettings);
    const waterDefaults = deps.getSettingsDefaults("waterfx", deps.defaultWaterSettings);
    return deps.normalizeTimeRouting({
      movement: "global",
      swarm: deps.normalizeRoutingMode(lightingDefaults.swarmTimeRouting ?? "global", "global"),
      clouds: deps.normalizeRoutingMode(cloudDefaults.timeRouting ?? "global", "global"),
      water: deps.normalizeRoutingMode(waterDefaults.timeRouting ?? "detached", "detached"),
      weather: "global",
    });
  }

  function getConfiguredSimTickHours() {
    const lightingDefaults = deps.getSettingsDefaults("lighting", deps.defaultLightingSettings);
    return deps.normalizeSimTickHours(lightingDefaults.simTickHours);
  }

  function getCurrentTimeRoutingFromStoreOrDefaults() {
    const state = deps.getCoreState();
    const routing = state && state.systems && state.systems.time ? state.systems.time.routing : null;
    if (routing && typeof routing === "object") {
      return deps.normalizeTimeRouting(routing);
    }
    return getDefaultTimeRouting();
  }

  function getConfiguredSimTickHoursFromStoreOrDefaults() {
    const state = deps.getCoreState();
    const simTick = state && state.systems && state.systems.time ? state.systems.time.simTickHours : null;
    if (Number.isFinite(Number(simTick))) {
      return deps.normalizeSimTickHours(simTick);
    }
    return getConfiguredSimTickHours();
  }

  function getInterpolatedRoutedTimeSec(systemTiming) {
    const baseTime = Number(systemTiming && systemTiming.timeSec);
    if (!Number.isFinite(baseTime)) {
      return 0;
    }
    const route = String(systemTiming && systemTiming.route ? systemTiming.route : "global");
    if (route !== "global") {
      return Math.max(0, baseTime);
    }
    const alpha = deps.clamp(Number(systemTiming && systemTiming.interpolationAlpha), 0, 1);
    const simTickHours = deps.normalizeSimTickHours(systemTiming && systemTiming.simTickHours);
    return Math.max(0, baseTime + alpha * simTickHours * deps.simSecondsPerHour);
  }

  return {
    getDefaultTimeRouting,
    getConfiguredSimTickHours,
    getCurrentTimeRoutingFromStoreOrDefaults,
    getConfiguredSimTickHoursFromStoreOrDefaults,
    getInterpolatedRoutedTimeSec,
  };
}
