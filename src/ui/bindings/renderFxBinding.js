export function bindRenderFxControls(deps) {
  function dispatchRenderFxChange(section, options = {}) {
    deps.dispatchCoreCommand({
      type: "core/renderFx/changed",
      section,
      rebuildFlowMap: Boolean(options.rebuildFlowMap),
      markFogColorManual: Boolean(options.markFogColorManual),
    });
  }

  const bindings = [
    { element: deps.parallaxStrengthInput, eventType: "input", section: "parallax" },
    { element: deps.parallaxBandsInput, eventType: "input", section: "parallax" },
    { element: deps.parallaxToggle, eventType: "change", section: "parallax" },
    { element: deps.shadowBlurInput, eventType: "input", section: "lighting" },
    { element: deps.volumetricStrengthInput, eventType: "input", section: "lighting" },
    { element: deps.volumetricDensityInput, eventType: "input", section: "lighting" },
    { element: deps.volumetricAnisotropyInput, eventType: "input", section: "lighting" },
    { element: deps.volumetricLengthInput, eventType: "input", section: "lighting" },
    { element: deps.volumetricSamplesInput, eventType: "input", section: "lighting" },
    { element: deps.volumetricToggle, eventType: "change", section: "lighting" },
    { element: deps.pointFlickerStrengthInput, eventType: "input", section: "lighting" },
    { element: deps.pointFlickerSpeedInput, eventType: "input", section: "lighting" },
    { element: deps.pointFlickerSpatialInput, eventType: "input", section: "lighting" },
    { element: deps.pointFlickerToggle, eventType: "change", section: "lighting" },
    { element: deps.fogMinAlphaInput, eventType: "input", section: "fog" },
    { element: deps.fogMaxAlphaInput, eventType: "input", section: "fog" },
    { element: deps.fogFalloffInput, eventType: "input", section: "fog" },
    { element: deps.fogStartOffsetInput, eventType: "input", section: "fog" },
    { element: deps.fogToggle, eventType: "change", section: "fog" },
    { element: deps.fogColorInput, eventType: "input", section: "fog", options: { markFogColorManual: true } },
    { element: deps.cloudCoverageInput, eventType: "input", section: "clouds" },
    { element: deps.cloudSoftnessInput, eventType: "input", section: "clouds" },
    { element: deps.cloudOpacityInput, eventType: "input", section: "clouds" },
    { element: deps.cloudScaleInput, eventType: "input", section: "clouds" },
    { element: deps.cloudSpeed1Input, eventType: "input", section: "clouds" },
    { element: deps.cloudSpeed2Input, eventType: "input", section: "clouds" },
    { element: deps.cloudSunParallaxInput, eventType: "input", section: "clouds" },
    { element: deps.cloudToggle, eventType: "change", section: "clouds" },
    { element: deps.waterFlowDirectionInput, eventType: "input", section: "waterfx" },
    { element: deps.waterLocalFlowMixInput, eventType: "input", section: "waterfx" },
    { element: deps.waterDownhillBoostInput, eventType: "input", section: "waterfx" },
    { element: deps.waterFlowRadius1Input, eventType: "input", section: "waterfx", options: { rebuildFlowMap: true } },
    { element: deps.waterFlowRadius2Input, eventType: "input", section: "waterfx", options: { rebuildFlowMap: true } },
    { element: deps.waterFlowRadius3Input, eventType: "input", section: "waterfx", options: { rebuildFlowMap: true } },
    { element: deps.waterFlowWeight1Input, eventType: "input", section: "waterfx", options: { rebuildFlowMap: true } },
    { element: deps.waterFlowWeight2Input, eventType: "input", section: "waterfx", options: { rebuildFlowMap: true } },
    { element: deps.waterFlowWeight3Input, eventType: "input", section: "waterfx", options: { rebuildFlowMap: true } },
    { element: deps.waterFlowStrengthInput, eventType: "input", section: "waterfx" },
    { element: deps.waterFlowSpeedInput, eventType: "input", section: "waterfx" },
    { element: deps.waterFlowScaleInput, eventType: "input", section: "waterfx" },
    { element: deps.waterShimmerStrengthInput, eventType: "input", section: "waterfx" },
    { element: deps.waterGlintStrengthInput, eventType: "input", section: "waterfx" },
    { element: deps.waterGlintSharpnessInput, eventType: "input", section: "waterfx" },
    { element: deps.waterShoreFoamStrengthInput, eventType: "input", section: "waterfx" },
    { element: deps.waterShoreWidthInput, eventType: "input", section: "waterfx" },
    { element: deps.waterReflectivityInput, eventType: "input", section: "waterfx" },
    { element: deps.waterTintStrengthInput, eventType: "input", section: "waterfx" },
    { element: deps.waterFxToggle, eventType: "change", section: "waterfx" },
    { element: deps.waterFlowDownhillToggle, eventType: "change", section: "waterfx", options: { rebuildFlowMap: true } },
    { element: deps.waterFlowInvertDownhillToggle, eventType: "change", section: "waterfx" },
  ];

  for (const binding of bindings) {
    binding.element.addEventListener(binding.eventType, () => {
      dispatchRenderFxChange(binding.section, binding.options || {});
    });
  }
}
