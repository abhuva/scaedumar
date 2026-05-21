export function createRenderFxSettingsSyncRuntime(deps) {
  return {
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
