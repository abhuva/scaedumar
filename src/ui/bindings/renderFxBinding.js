export function bindRenderFxControls(deps) {
  function buildSectionPatch(section, options = {}) {
    if (section === "parallax") {
      return {
        useParallax: Boolean(deps.parallaxToggle.checked),
        parallaxStrength: Number(deps.parallaxStrengthInput.value),
        parallaxBands: Number(deps.parallaxBandsInput.value),
      };
    }

    if (section === "lighting") {
      return {
        shadowBlur: Number(deps.shadowBlurInput.value),
        useVolumetric: Boolean(deps.volumetricToggle.checked),
        volumetricStrength: Number(deps.volumetricStrengthInput.value),
        volumetricDensity: Number(deps.volumetricDensityInput.value),
        volumetricAnisotropy: Number(deps.volumetricAnisotropyInput.value),
        volumetricLength: Number(deps.volumetricLengthInput.value),
        volumetricSamples: Number(deps.volumetricSamplesInput.value),
        pointFlickerEnabled: Boolean(deps.pointFlickerToggle.checked),
        pointFlickerStrength: Number(deps.pointFlickerStrengthInput.value),
        pointFlickerSpeed: Number(deps.pointFlickerSpeedInput.value),
        pointFlickerSpatial: Number(deps.pointFlickerSpatialInput.value),
      };
    }

    if (section === "fog") {
      const patch = {
        useFog: Boolean(deps.fogToggle.checked),
        fogColor: deps.fogColorInput.value,
        fogMinAlpha: Number(deps.fogMinAlphaInput.value),
        fogMaxAlpha: Number(deps.fogMaxAlphaInput.value),
        fogFalloff: Number(deps.fogFalloffInput.value),
        fogStartOffset: Number(deps.fogStartOffsetInput.value),
      };
      if (options.markFogColorManual) {
        patch.fogColorManual = true;
      }
      return patch;
    }

    if (section === "clouds") {
      return {
        useClouds: Boolean(deps.cloudToggle.checked),
        cloudCoverage: Number(deps.cloudCoverageInput.value),
        cloudSoftness: Number(deps.cloudSoftnessInput.value),
        cloudOpacity: Number(deps.cloudOpacityInput.value),
        cloudScale: Number(deps.cloudScaleInput.value),
        cloudSpeed1: Number(deps.cloudSpeed1Input.value),
        cloudSpeed2: Number(deps.cloudSpeed2Input.value),
        cloudSunParallax: Number(deps.cloudSunParallaxInput.value),
        cloudUseSunProjection: Boolean(deps.cloudSunProjectToggle.checked),
      };
    }

    if (section === "waterfx") {
      return {
        useWaterFx: Boolean(deps.waterFxToggle.checked),
        waterFlowDownhill: Boolean(deps.waterFlowDownhillToggle.checked),
        waterFlowInvertDownhill: Boolean(deps.waterFlowInvertDownhillToggle.checked),
        waterFlowDebug: Boolean(deps.waterFlowDebugToggle.checked),
        waterFlowDirectionDeg: Number(deps.waterFlowDirectionInput.value),
        waterLocalFlowMix: Number(deps.waterLocalFlowMixInput.value),
        waterDownhillBoost: Number(deps.waterDownhillBoostInput.value),
        waterFlowRadius1: Number(deps.waterFlowRadius1Input.value),
        waterFlowRadius2: Number(deps.waterFlowRadius2Input.value),
        waterFlowRadius3: Number(deps.waterFlowRadius3Input.value),
        waterFlowWeight1: Number(deps.waterFlowWeight1Input.value),
        waterFlowWeight2: Number(deps.waterFlowWeight2Input.value),
        waterFlowWeight3: Number(deps.waterFlowWeight3Input.value),
        waterFlowStrength: Number(deps.waterFlowStrengthInput.value),
        waterFlowSpeed: Number(deps.waterFlowSpeedInput.value),
        waterFlowScale: Number(deps.waterFlowScaleInput.value),
        waterShimmerStrength: Number(deps.waterShimmerStrengthInput.value),
        waterGlintStrength: Number(deps.waterGlintStrengthInput.value),
        waterGlintSharpness: Number(deps.waterGlintSharpnessInput.value),
        waterShoreFoamStrength: Number(deps.waterShoreFoamStrengthInput.value),
        waterShoreWidth: Number(deps.waterShoreWidthInput.value),
        waterReflectivity: Number(deps.waterReflectivityInput.value),
        waterTintColor: deps.waterTintColorInput.value,
        waterTintStrength: Number(deps.waterTintStrengthInput.value),
      };
    }

    throw new Error(`Unknown render FX section: ${section}`);
  }

  function dispatchRenderFxChange(section, options = {}) {
    deps.dispatchCoreCommand({
      type: "core/renderFx/changed",
      section,
      patch: buildSectionPatch(section, options),
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
    { element: deps.cloudSunProjectToggle, eventType: "change", section: "clouds" },
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
    { element: deps.waterTintColorInput, eventType: "input", section: "waterfx" },
    { element: deps.waterFxToggle, eventType: "change", section: "waterfx" },
    { element: deps.waterFlowDownhillToggle, eventType: "change", section: "waterfx", options: { rebuildFlowMap: true } },
    { element: deps.waterFlowInvertDownhillToggle, eventType: "change", section: "waterfx" },
    { element: deps.waterFlowDebugToggle, eventType: "change", section: "waterfx" },
  ];

  for (const binding of bindings) {
    if (!binding || !binding.element || typeof binding.element.addEventListener !== "function") {
      continue;
    }
    binding.element.addEventListener(binding.eventType, () => {
      dispatchRenderFxChange(binding.section, binding.options || {});
    });
  }

  if (deps.cloudTimeRoutingInput) {
    deps.cloudTimeRoutingInput.addEventListener("change", () => {
      deps.dispatchCoreCommand({
        type: "core/time/setRouting",
        target: "clouds",
        mode: deps.cloudTimeRoutingInput.value,
      });
    });
  }

  if (deps.waterTimeRoutingInput) {
    deps.waterTimeRoutingInput.addEventListener("change", () => {
      deps.dispatchCoreCommand({
        type: "core/time/setRouting",
        target: "water",
        mode: deps.waterTimeRoutingInput.value,
      });
    });
  }
}
