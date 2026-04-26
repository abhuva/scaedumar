export function createRenderFxSettingsSyncRuntime(deps) {
  return {
    syncParallaxUi: () => {
      deps.updateParallaxStrengthLabel();
      deps.updateParallaxBandsLabel();
      deps.updateParallaxUi();
    },
    syncLightingUi: () => {
      deps.updateShadowBlurLabel();
      deps.updateVolumetricLabels();
      deps.updateVolumetricUi();
      deps.updatePointFlickerLabels();
      deps.updatePointFlickerUi();
    },
    syncFogUi: () => {
      deps.updateFogAlphaLabels();
      deps.updateFogFalloffLabel();
      deps.updateFogStartOffsetLabel();
      deps.updateFogUi();
    },
    syncCloudUi: () => {
      deps.updateCloudLabels();
      deps.updateCloudUi();
    },
    syncWaterUi: () => {
      deps.updateWaterLabels();
      deps.updateWaterUi();
    },
  };
}
