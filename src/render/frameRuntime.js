export function createFrameRuntime(deps) {
  const getCurrentMapFolderPath = typeof deps.getCurrentMapFolderPath === "function"
    ? deps.getCurrentMapFolderPath
    : () => "";
  const now = typeof deps.now === "function"
    ? deps.now
    : () => (typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now());

  function render(nowMs) {
    const profileStart = now();
    let mark = profileStart;
    const profile = {};
    function lap(key) {
      const next = now();
      profile[key] = next - mark;
      mark = next;
    }

    const { dtSec, preUpdateState, frameTimeState, routedTime, smoothCloudTimeSec } = deps.computeFrameTiming({
      nowMs,
      frame: deps.runtimeFrame,
      getCoreState: deps.getCoreState,
      clamp: deps.clamp,
      buildFrameTimeState: deps.buildFrameTimeState,
      getConfiguredSimTickHoursFromStoreOrDefaults: deps.getConfiguredSimTickHoursFromStoreOrDefaults,
      getCurrentTimeRoutingFromStoreOrDefaults: deps.getCurrentTimeRoutingFromStoreOrDefaults,
      getRoutedSystemTime: deps.getRoutedSystemTime,
      getInterpolatedRoutedTimeSec: deps.getInterpolatedRoutedTimeSec,
    });
    lap("timingMs");
    deps.runtimeFrame.lastDtSec = dtSec;
    deps.schedulerUpdateAll({ nowMs, dtSec, time: { ...frameTimeState, systems: routedTime } }, preUpdateState);
    lap("systemsMs");
    const coreState = deps.getCoreState();

    deps.resize();
    deps.overlayHooks.updateGameplay(nowMs, dtSec, routedTime.swarm);
    lap("gameplayMs");
    const systemState = coreState.systems || {};
    const simulationState = coreState.simulation || {};
    const simulationKnobs = simulationState.knobs || {};
    const simulationWeather = simulationState.weather || null;
    const frameUi = deps.getFrameUiRuntime();
    const lightingParams = systemState.lighting && systemState.lighting.lightingParams
      ? systemState.lighting.lightingParams
      : deps.computeLightingParams(coreState);
    frameUi.syncFogAutoColorInput(lightingParams);
    const uniformInput = deps.buildUniformInputState({
      clamp: deps.clamp,
      getMapAspect: deps.getMapAspect,
      cursorLightState: deps.cursorLightState,
      lightingSettings: simulationKnobs.lighting || null,
      parallaxSettings: simulationKnobs.parallax || null,
      detailState: simulationKnobs.detail || null,
      defaultLightingSettings: deps.getSettingsDefaults("lighting", deps.defaultLightingSettings),
      defaultParallaxSettings: deps.getSettingsDefaults("parallax", deps.defaultParallaxSettings),
      defaultDetailSettings: deps.getSettingsDefaults("detail", deps.defaultDetailSettings),
      defaultFogSettings: deps.getSettingsDefaults("fog", deps.defaultFogSettings),
      defaultCloudSettings: deps.getSettingsDefaults("clouds", deps.defaultCloudSettings),
      defaultWaterSettings: deps.getSettingsDefaults("waterfx", deps.defaultWaterSettings),
      hexToRgb01: deps.hexToRgb01,
      fogState: systemState.fog || null,
      cloudState: systemState.clouds || null,
      waterFxState: systemState.waterFx || null,
      weatherState: simulationWeather,
      cloudTimeSec: smoothCloudTimeSec,
      waterTimeSec: routedTime.water.timeSec,
    });
    lap("uniformInputMs");
    const { cycleSpeed } = frameUi.syncCycleInfoText(systemState);
    deps.updateInfoPanel();
    deps.updateSwarmStatsPanel();
    deps.updateCycleHourLabel();
    if (typeof deps.updateGameTimeDiorama === "function") {
      deps.updateGameTimeDiorama(deps.cycleState.hour, cycleSpeed);
    }
    lap("uiMs");

    deps.updateWeatherFieldMeta({
      renderResources: deps.renderResources,
      splatSize: deps.splatSize,
      simulationWeather,
      nowMs,
    });
    lap("weatherMetaMs");
    const frameState = deps.renderFrameSwarmLayers({
      getSwarmSettings: deps.getSwarmSettings,
      buildFrameRenderState: deps.buildFrameRenderState,
      coreState,
      nowMs,
      dtSec,
      cycleState: deps.cycleState,
      cycleSpeed,
      smoothCloudTimeSec,
      currentMapFolderPath: getCurrentMapFolderPath(),
      splatSize: deps.splatSize,
      lightingParams,
      uniformInput,
      hexToRgb01: deps.hexToRgb01,
      renderer: deps.renderer,
      renderSwarmLit: deps.renderSwarmLit,
      profile,
      now,
    });
    lap("renderMs");

    deps.overlayHooks.renderOverlayIfNeeded(frameState);
    lap("overlayMs");
    profile.totalCpuMs = now() - profileStart;
    deps.runtimeFrame.profile = profile;
    deps.requestAnimationFrame(deps.renderCallback);
  }

  return {
    render,
  };
}
