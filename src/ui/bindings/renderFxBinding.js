export function bindRenderFxControls(deps) {
  function dispatchRenderFxChange(section, options = {}) {
    deps.dispatchCoreCommand({
      type: "core/renderFx/changed",
      section,
      rebuildFlowMap: Boolean(options.rebuildFlowMap),
      markFogColorManual: Boolean(options.markFogColorManual),
    });
  }

  deps.parallaxStrengthInput.addEventListener("input", () => dispatchRenderFxChange("parallax"));
  deps.parallaxBandsInput.addEventListener("input", () => dispatchRenderFxChange("parallax"));
  deps.parallaxToggle.addEventListener("change", () => dispatchRenderFxChange("parallax"));
  deps.shadowBlurInput.addEventListener("input", () => dispatchRenderFxChange("lighting"));
  deps.volumetricStrengthInput.addEventListener("input", () => dispatchRenderFxChange("lighting"));
  deps.volumetricDensityInput.addEventListener("input", () => dispatchRenderFxChange("lighting"));
  deps.volumetricAnisotropyInput.addEventListener("input", () => dispatchRenderFxChange("lighting"));
  deps.volumetricLengthInput.addEventListener("input", () => dispatchRenderFxChange("lighting"));
  deps.volumetricSamplesInput.addEventListener("input", () => dispatchRenderFxChange("lighting"));
  deps.volumetricToggle.addEventListener("change", () => dispatchRenderFxChange("lighting"));
  deps.pointFlickerStrengthInput.addEventListener("input", () => dispatchRenderFxChange("lighting"));
  deps.pointFlickerSpeedInput.addEventListener("input", () => dispatchRenderFxChange("lighting"));
  deps.pointFlickerSpatialInput.addEventListener("input", () => dispatchRenderFxChange("lighting"));
  deps.pointFlickerToggle.addEventListener("change", () => dispatchRenderFxChange("lighting"));
  deps.fogMinAlphaInput.addEventListener("input", () => dispatchRenderFxChange("fog"));
  deps.fogMaxAlphaInput.addEventListener("input", () => dispatchRenderFxChange("fog"));
  deps.fogFalloffInput.addEventListener("input", () => dispatchRenderFxChange("fog"));
  deps.fogStartOffsetInput.addEventListener("input", () => dispatchRenderFxChange("fog"));
  deps.fogToggle.addEventListener("change", () => dispatchRenderFxChange("fog"));
  deps.fogColorInput.addEventListener("input", () => dispatchRenderFxChange("fog", { markFogColorManual: true }));
  deps.cloudCoverageInput.addEventListener("input", () => dispatchRenderFxChange("clouds"));
  deps.cloudSoftnessInput.addEventListener("input", () => dispatchRenderFxChange("clouds"));
  deps.cloudOpacityInput.addEventListener("input", () => dispatchRenderFxChange("clouds"));
  deps.cloudScaleInput.addEventListener("input", () => dispatchRenderFxChange("clouds"));
  deps.cloudSpeed1Input.addEventListener("input", () => dispatchRenderFxChange("clouds"));
  deps.cloudSpeed2Input.addEventListener("input", () => dispatchRenderFxChange("clouds"));
  deps.cloudSunParallaxInput.addEventListener("input", () => dispatchRenderFxChange("clouds"));
  deps.cloudToggle.addEventListener("change", () => dispatchRenderFxChange("clouds"));
  deps.waterFlowDirectionInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterLocalFlowMixInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterDownhillBoostInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterFlowRadius1Input.addEventListener("input", () => {
    dispatchRenderFxChange("waterfx", { rebuildFlowMap: true });
  });
  deps.waterFlowRadius2Input.addEventListener("input", () => {
    dispatchRenderFxChange("waterfx", { rebuildFlowMap: true });
  });
  deps.waterFlowRadius3Input.addEventListener("input", () => {
    dispatchRenderFxChange("waterfx", { rebuildFlowMap: true });
  });
  deps.waterFlowWeight1Input.addEventListener("input", () => {
    dispatchRenderFxChange("waterfx", { rebuildFlowMap: true });
  });
  deps.waterFlowWeight2Input.addEventListener("input", () => {
    dispatchRenderFxChange("waterfx", { rebuildFlowMap: true });
  });
  deps.waterFlowWeight3Input.addEventListener("input", () => {
    dispatchRenderFxChange("waterfx", { rebuildFlowMap: true });
  });
  deps.waterFlowStrengthInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterFlowSpeedInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterFlowScaleInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterShimmerStrengthInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterGlintStrengthInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterGlintSharpnessInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterShoreFoamStrengthInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterShoreWidthInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterReflectivityInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterTintStrengthInput.addEventListener("input", () => dispatchRenderFxChange("waterfx"));
  deps.waterFxToggle.addEventListener("change", () => dispatchRenderFxChange("waterfx"));
  deps.waterFlowDownhillToggle.addEventListener("change", () => {
    dispatchRenderFxChange("waterfx", { rebuildFlowMap: true });
  });
  deps.waterFlowInvertDownhillToggle.addEventListener("change", () => dispatchRenderFxChange("waterfx"));
}
