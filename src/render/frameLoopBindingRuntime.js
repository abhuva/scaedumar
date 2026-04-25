import { createFrameRuntimeBinding } from "./frameRuntimeBinding.js";

export function createFrameLoopBindingRuntime(deps) {
  let frameRuntime = null;

  function getFrameRuntime() {
    if (frameRuntime) {
      return frameRuntime;
    }
    frameRuntime = createFrameRuntimeBinding({
      computeFrameTiming: deps.computeFrameTiming,
      runtimeFrame: deps.runtimeFrame,
      getCoreState: deps.getCoreState,
      clamp: deps.clamp,
      buildFrameTimeState: deps.buildFrameTimeState,
      getConfiguredSimTickHoursFromStoreOrDefaults: deps.getConfiguredSimTickHoursFromStoreOrDefaults,
      getCurrentTimeRoutingFromStoreOrDefaults: deps.getCurrentTimeRoutingFromStoreOrDefaults,
      getRoutedSystemTime: deps.getRoutedSystemTime,
      getInterpolatedRoutedTimeSec: deps.getInterpolatedRoutedTimeSec,
      schedulerUpdateAll: deps.schedulerUpdateAll,
      resize: deps.resize,
      overlayHooks: deps.overlayHooks,
      computeLightingParams: deps.computeLightingParams,
      getFrameUiRuntime: deps.getFrameUiRuntime,
      buildUniformInputState: deps.buildUniformInputState,
      getMapAspect: deps.getMapAspect,
      cursorLightState: deps.cursorLightState,
      getSettingsDefaults: deps.getSettingsDefaults,
      defaultLightingSettings: deps.defaultLightingSettings,
      defaultParallaxSettings: deps.defaultParallaxSettings,
      defaultFogSettings: deps.defaultFogSettings,
      defaultCloudSettings: deps.defaultCloudSettings,
      defaultWaterSettings: deps.defaultWaterSettings,
      hexToRgb01: deps.hexToRgb01,
      updateInfoPanel: deps.updateInfoPanel,
      updateSwarmStatsPanel: deps.updateSwarmStatsPanel,
      updateCycleHourLabel: deps.updateCycleHourLabel,
      updateWeatherFieldMeta: deps.updateWeatherFieldMeta,
      renderResources: deps.renderResources,
      splatSize: deps.splatSize,
      renderFrameSwarmLayers: deps.renderFrameSwarmLayers,
      getSwarmSettings: deps.getSwarmSettings,
      buildFrameRenderState: deps.buildFrameRenderState,
      cycleState: deps.cycleState,
      getCurrentMapFolderPath: deps.getCurrentMapFolderPath,
      renderer: deps.renderer,
      renderSwarmLit: deps.renderSwarmLit,
      requestAnimationFrame: deps.requestAnimationFrame,
      renderCallback: deps.renderCallback,
    });
    return frameRuntime;
  }

  return {
    getFrameRuntime,
    render(nowMs) {
      getFrameRuntime().render(nowMs);
    },
  };
}
