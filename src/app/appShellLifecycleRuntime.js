import { tryAutoLoadDefaultMapRuntime, runAppStartupRuntime } from "../core/appStartupRuntime.js";
import { createMainBindingsAssemblyRuntime } from "./mainBindingsAssemblyRuntime.js";
import { setupMainBindingsRuntime } from "../ui/mainBindingsRuntime.js";

export function runAppShellLifecycleRuntime(deps) {
  setupMainBindingsRuntime(createMainBindingsAssemblyRuntime(deps.bindings));

  void tryAutoLoadDefaultMapRuntime(deps.autoLoad);

  runAppStartupRuntime({
    startupUiSync: {
      setSwarmDefaults: deps.startup.setSwarmDefaults,
      normalizeSwarmHeightRangeInputs: deps.startup.normalizeSwarmHeightRangeInputs,
      updatePathfindingRangeLabel: deps.startup.updatePathfindingRangeLabel,
      updatePathWeightLabels: deps.startup.updatePathWeightLabels,
      updatePathSlopeCutoffLabel: deps.startup.updatePathSlopeCutoffLabel,
      updatePathBaseCostLabel: deps.startup.updatePathBaseCostLabel,
      updateSwarmLabels: deps.startup.updateSwarmLabels,
      updateSwarmUi: deps.startup.updateSwarmUi,
      updateSwarmStatsPanel: deps.startup.updateSwarmStatsPanel,
      updateSwarmFollowButtonUi: deps.startup.updateSwarmFollowButtonUi,
      updateParallaxStrengthLabel: deps.startup.updateParallaxStrengthLabel,
      updateParallaxBandsLabel: deps.startup.updateParallaxBandsLabel,
      updateShadowBlurLabel: deps.startup.updateShadowBlurLabel,
      updateVolumetricLabels: deps.startup.updateVolumetricLabels,
      updatePointFlickerLabels: deps.startup.updatePointFlickerLabels,
      updateSimTickLabel: deps.startup.updateSimTickLabel,
      updateFogAlphaLabels: deps.startup.updateFogAlphaLabels,
      updateFogFalloffLabel: deps.startup.updateFogFalloffLabel,
      updateFogStartOffsetLabel: deps.startup.updateFogStartOffsetLabel,
      updateCloudLabels: deps.startup.updateCloudLabels,
      updateWaterLabels: deps.startup.updateWaterLabels,
      updatePointLightStrengthLabel: deps.startup.updatePointLightStrengthLabel,
      updatePointLightIntensityLabel: deps.startup.updatePointLightIntensityLabel,
      updatePointLightHeightOffsetLabel: deps.startup.updatePointLightHeightOffsetLabel,
      updatePointLightFlickerLabel: deps.startup.updatePointLightFlickerLabel,
      updatePointLightFlickerSpeedLabel: deps.startup.updatePointLightFlickerSpeedLabel,
      updateCursorLightStrengthLabel: deps.startup.updateCursorLightStrengthLabel,
      updateCursorLightHeightOffsetLabel: deps.startup.updateCursorLightHeightOffsetLabel,
      setCycleHourSliderFromState: deps.startup.setCycleHourSliderFromState,
      updateCycleHourLabel: deps.startup.updateCycleHourLabel,
      syncMapPathInput: deps.startup.syncMapPathInput,
      currentMapFolderPath: deps.startup.currentMapFolderPath,
      updateLightEditorUi: deps.startup.updateLightEditorUi,
      updateCursorLightModeUi: deps.startup.updateCursorLightModeUi,
      updateParallaxUi: deps.startup.updateParallaxUi,
      updateVolumetricUi: deps.startup.updateVolumetricUi,
      updatePointFlickerUi: deps.startup.updatePointFlickerUi,
      updateFogUi: deps.startup.updateFogUi,
      updateCloudUi: deps.startup.updateCloudUi,
      updateWaterUi: deps.startup.updateWaterUi,
      setActiveTopic: deps.startup.setActiveTopic,
      setInteractionMode: deps.startup.setInteractionMode,
      updateModeCapabilitiesUi: deps.startup.updateModeCapabilitiesUi,
      reseedSwarmAgents: deps.startup.reseedSwarmAgents,
      getSwarmSettings: deps.startup.getSwarmSettings,
      setStatus: deps.startup.setStatus,
      statusTextEl: deps.startup.statusTextEl,
    },
    resize: deps.startup.resize,
    render: deps.startup.render,
    requestAnimationFrame: (cb) => deps.windowEl.requestAnimationFrame(cb),
  });
}
