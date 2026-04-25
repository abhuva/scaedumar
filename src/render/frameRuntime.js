export function createFrameRuntime(deps) {
  function render(nowMs) {
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
    deps.schedulerUpdateAll({ nowMs, dtSec, time: { ...frameTimeState, systems: routedTime } }, preUpdateState);
    const coreState = deps.getCoreState();

    deps.resize();
    deps.overlayHooks.updateGameplay(nowMs, dtSec, routedTime.swarm);
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
      defaultLightingSettings: deps.getSettingsDefaults("lighting", deps.defaultLightingSettings),
      defaultParallaxSettings: deps.getSettingsDefaults("parallax", deps.defaultParallaxSettings),
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
    const { cycleSpeed } = frameUi.syncCycleInfoText(systemState);
    deps.updateInfoPanel();
    deps.updateSwarmStatsPanel();
    deps.updateCycleHourLabel();

    deps.updateWeatherFieldMeta({
      renderResources: deps.renderResources,
      splatSize: deps.splatSize,
      simulationWeather,
      nowMs,
    });
    const frameState = deps.renderFrameSwarmLayers({
      getSwarmSettings: deps.getSwarmSettings,
      buildFrameRenderState: deps.buildFrameRenderState,
      coreState,
      nowMs,
      dtSec,
      cycleState: deps.cycleState,
      cycleSpeed,
      smoothCloudTimeSec,
      currentMapFolderPath: typeof deps.getCurrentMapFolderPath === "function"
        ? deps.getCurrentMapFolderPath()
        : "",
      splatSize: deps.splatSize,
      lightingParams,
      uniformInput,
      hexToRgb01: deps.hexToRgb01,
      renderer: deps.renderer,
      renderSwarmLit: deps.renderSwarmLit,
    });

    deps.overlayHooks.renderOverlayIfNeeded(frameState);
    deps.requestAnimationFrame(deps.renderCallback);
  }

  return {
    render,
  };
}
