export function bindRenderFxControls(deps) {
  deps.parallaxStrengthInput.addEventListener("input", deps.updateParallaxStrengthLabel);
  deps.parallaxBandsInput.addEventListener("input", deps.updateParallaxBandsLabel);
  deps.parallaxToggle.addEventListener("change", deps.updateParallaxUi);
  deps.shadowBlurInput.addEventListener("input", deps.updateShadowBlurLabel);
  deps.volumetricStrengthInput.addEventListener("input", deps.updateVolumetricLabels);
  deps.volumetricDensityInput.addEventListener("input", deps.updateVolumetricLabels);
  deps.volumetricAnisotropyInput.addEventListener("input", deps.updateVolumetricLabels);
  deps.volumetricLengthInput.addEventListener("input", deps.updateVolumetricLabels);
  deps.volumetricSamplesInput.addEventListener("input", deps.updateVolumetricLabels);
  deps.volumetricToggle.addEventListener("change", deps.updateVolumetricUi);
  deps.pointFlickerStrengthInput.addEventListener("input", deps.updatePointFlickerLabels);
  deps.pointFlickerSpeedInput.addEventListener("input", deps.updatePointFlickerLabels);
  deps.pointFlickerSpatialInput.addEventListener("input", deps.updatePointFlickerLabels);
  deps.pointFlickerToggle.addEventListener("change", deps.updatePointFlickerUi);
  deps.fogMinAlphaInput.addEventListener("input", deps.updateFogAlphaLabels);
  deps.fogMaxAlphaInput.addEventListener("input", deps.updateFogAlphaLabels);
  deps.fogFalloffInput.addEventListener("input", deps.updateFogFalloffLabel);
  deps.fogStartOffsetInput.addEventListener("input", deps.updateFogStartOffsetLabel);
  deps.fogToggle.addEventListener("change", deps.updateFogUi);
  deps.fogColorInput.addEventListener("input", deps.markFogColorManual);
  deps.cloudCoverageInput.addEventListener("input", deps.updateCloudLabels);
  deps.cloudSoftnessInput.addEventListener("input", deps.updateCloudLabels);
  deps.cloudOpacityInput.addEventListener("input", deps.updateCloudLabels);
  deps.cloudScaleInput.addEventListener("input", deps.updateCloudLabels);
  deps.cloudSpeed1Input.addEventListener("input", deps.updateCloudLabels);
  deps.cloudSpeed2Input.addEventListener("input", deps.updateCloudLabels);
  deps.cloudSunParallaxInput.addEventListener("input", deps.updateCloudLabels);
  deps.cloudToggle.addEventListener("change", deps.updateCloudUi);
  deps.waterFlowDirectionInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterLocalFlowMixInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterDownhillBoostInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterFlowRadius1Input.addEventListener("input", () => {
    deps.updateWaterLabels();
    deps.rebuildFlowMapTexture();
  });
  deps.waterFlowRadius2Input.addEventListener("input", () => {
    deps.updateWaterLabels();
    deps.rebuildFlowMapTexture();
  });
  deps.waterFlowRadius3Input.addEventListener("input", () => {
    deps.updateWaterLabels();
    deps.rebuildFlowMapTexture();
  });
  deps.waterFlowWeight1Input.addEventListener("input", () => {
    deps.updateWaterLabels();
    deps.rebuildFlowMapTexture();
  });
  deps.waterFlowWeight2Input.addEventListener("input", () => {
    deps.updateWaterLabels();
    deps.rebuildFlowMapTexture();
  });
  deps.waterFlowWeight3Input.addEventListener("input", () => {
    deps.updateWaterLabels();
    deps.rebuildFlowMapTexture();
  });
  deps.waterFlowStrengthInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterFlowSpeedInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterFlowScaleInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterShimmerStrengthInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterGlintStrengthInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterGlintSharpnessInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterShoreFoamStrengthInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterShoreWidthInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterReflectivityInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterTintStrengthInput.addEventListener("input", deps.updateWaterLabels);
  deps.waterFxToggle.addEventListener("change", deps.updateWaterUi);
  deps.waterFlowDownhillToggle.addEventListener("change", () => {
    deps.updateWaterUi();
    deps.rebuildFlowMapTexture();
  });
  deps.waterFlowInvertDownhillToggle.addEventListener("change", deps.updateWaterUi);
}
