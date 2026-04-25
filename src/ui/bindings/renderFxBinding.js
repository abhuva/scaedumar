export function bindRenderFxControls(deps) {
  function dispatchRenderFxChange(section, patch, options = {}) {
    if (!patch || typeof patch !== "object") {
      throw new Error(`Invalid render FX patch for section: ${section}`);
    }
    deps.dispatchCoreCommand({
      type: "core/renderFx/changed",
      section,
      patch,
      rebuildFlowMap: Boolean(options.rebuildFlowMap),
      markFogColorManual: Boolean(options.markFogColorManual),
    });
  }

  const bindings = [
    {
      element: deps.parallaxStrengthInput,
      eventType: "input",
      section: "parallax",
      patchFactory: () => ({ parallaxStrength: Number(deps.parallaxStrengthInput.value) }),
    },
    {
      element: deps.parallaxBandsInput,
      eventType: "input",
      section: "parallax",
      patchFactory: () => ({ parallaxBands: Number(deps.parallaxBandsInput.value) }),
    },
    {
      element: deps.parallaxToggle,
      eventType: "change",
      section: "parallax",
      patchFactory: () => ({ useParallax: Boolean(deps.parallaxToggle.checked) }),
    },
    {
      element: deps.shadowsToggle,
      eventType: "change",
      section: "lighting",
      patchFactory: () => ({ useShadows: Boolean(deps.shadowsToggle.checked) }),
    },
    {
      element: deps.heightScaleInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ heightScale: Number(deps.heightScaleInput.value) }),
    },
    {
      element: deps.shadowStrengthInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ shadowStrength: Number(deps.shadowStrengthInput.value) }),
    },
    {
      element: deps.shadowBlurInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ shadowBlur: Number(deps.shadowBlurInput.value) }),
    },
    {
      element: deps.ambientInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ ambient: Number(deps.ambientInput.value) }),
    },
    {
      element: deps.diffuseInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ diffuse: Number(deps.diffuseInput.value) }),
    },
    {
      element: deps.volumetricStrengthInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ volumetricStrength: Number(deps.volumetricStrengthInput.value) }),
    },
    {
      element: deps.volumetricDensityInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ volumetricDensity: Number(deps.volumetricDensityInput.value) }),
    },
    {
      element: deps.volumetricAnisotropyInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ volumetricAnisotropy: Number(deps.volumetricAnisotropyInput.value) }),
    },
    {
      element: deps.volumetricLengthInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ volumetricLength: Number(deps.volumetricLengthInput.value) }),
    },
    {
      element: deps.volumetricSamplesInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ volumetricSamples: Number(deps.volumetricSamplesInput.value) }),
    },
    {
      element: deps.volumetricToggle,
      eventType: "change",
      section: "lighting",
      patchFactory: () => ({ useVolumetric: Boolean(deps.volumetricToggle.checked) }),
    },
    {
      element: deps.pointFlickerStrengthInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ pointFlickerStrength: Number(deps.pointFlickerStrengthInput.value) }),
    },
    {
      element: deps.pointFlickerSpeedInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ pointFlickerSpeed: Number(deps.pointFlickerSpeedInput.value) }),
    },
    {
      element: deps.pointFlickerSpatialInput,
      eventType: "input",
      section: "lighting",
      patchFactory: () => ({ pointFlickerSpatial: Number(deps.pointFlickerSpatialInput.value) }),
    },
    {
      element: deps.pointFlickerToggle,
      eventType: "change",
      section: "lighting",
      patchFactory: () => ({ pointFlickerEnabled: Boolean(deps.pointFlickerToggle.checked) }),
    },
    {
      element: deps.fogMinAlphaInput,
      eventType: "input",
      section: "fog",
      patchFactory: () => ({ fogMinAlpha: Number(deps.fogMinAlphaInput.value) }),
    },
    {
      element: deps.fogMaxAlphaInput,
      eventType: "input",
      section: "fog",
      patchFactory: () => ({ fogMaxAlpha: Number(deps.fogMaxAlphaInput.value) }),
    },
    {
      element: deps.fogFalloffInput,
      eventType: "input",
      section: "fog",
      patchFactory: () => ({ fogFalloff: Number(deps.fogFalloffInput.value) }),
    },
    {
      element: deps.fogStartOffsetInput,
      eventType: "input",
      section: "fog",
      patchFactory: () => ({ fogStartOffset: Number(deps.fogStartOffsetInput.value) }),
    },
    {
      element: deps.fogToggle,
      eventType: "change",
      section: "fog",
      patchFactory: () => ({ useFog: Boolean(deps.fogToggle.checked) }),
    },
    {
      element: deps.fogColorInput,
      eventType: "input",
      section: "fog",
      patchFactory: () => ({ fogColor: deps.fogColorInput.value }),
      options: { markFogColorManual: true },
    },
    {
      element: deps.cloudCoverageInput,
      eventType: "input",
      section: "clouds",
      patchFactory: () => ({ cloudCoverage: Number(deps.cloudCoverageInput.value) }),
    },
    {
      element: deps.cloudSoftnessInput,
      eventType: "input",
      section: "clouds",
      patchFactory: () => ({ cloudSoftness: Number(deps.cloudSoftnessInput.value) }),
    },
    {
      element: deps.cloudOpacityInput,
      eventType: "input",
      section: "clouds",
      patchFactory: () => ({ cloudOpacity: Number(deps.cloudOpacityInput.value) }),
    },
    {
      element: deps.cloudScaleInput,
      eventType: "input",
      section: "clouds",
      patchFactory: () => ({ cloudScale: Number(deps.cloudScaleInput.value) }),
    },
    {
      element: deps.cloudSpeed1Input,
      eventType: "input",
      section: "clouds",
      patchFactory: () => ({ cloudSpeed1: Number(deps.cloudSpeed1Input.value) }),
    },
    {
      element: deps.cloudSpeed2Input,
      eventType: "input",
      section: "clouds",
      patchFactory: () => ({ cloudSpeed2: Number(deps.cloudSpeed2Input.value) }),
    },
    {
      element: deps.cloudSunParallaxInput,
      eventType: "input",
      section: "clouds",
      patchFactory: () => ({ cloudSunParallax: Number(deps.cloudSunParallaxInput.value) }),
    },
    {
      element: deps.cloudSunProjectToggle,
      eventType: "change",
      section: "clouds",
      patchFactory: () => ({ cloudUseSunProjection: Boolean(deps.cloudSunProjectToggle.checked) }),
    },
    {
      element: deps.cloudToggle,
      eventType: "change",
      section: "clouds",
      patchFactory: () => ({ useClouds: Boolean(deps.cloudToggle.checked) }),
    },
    {
      element: deps.waterFlowDirectionInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowDirectionDeg: Number(deps.waterFlowDirectionInput.value) }),
    },
    {
      element: deps.waterLocalFlowMixInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterLocalFlowMix: Number(deps.waterLocalFlowMixInput.value) }),
    },
    {
      element: deps.waterDownhillBoostInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterDownhillBoost: Number(deps.waterDownhillBoostInput.value) }),
    },
    {
      element: deps.waterFlowRadius1Input,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowRadius1: Number(deps.waterFlowRadius1Input.value) }),
      options: { rebuildFlowMap: true },
    },
    {
      element: deps.waterFlowRadius2Input,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowRadius2: Number(deps.waterFlowRadius2Input.value) }),
      options: { rebuildFlowMap: true },
    },
    {
      element: deps.waterFlowRadius3Input,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowRadius3: Number(deps.waterFlowRadius3Input.value) }),
      options: { rebuildFlowMap: true },
    },
    {
      element: deps.waterFlowWeight1Input,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowWeight1: Number(deps.waterFlowWeight1Input.value) }),
      options: { rebuildFlowMap: true },
    },
    {
      element: deps.waterFlowWeight2Input,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowWeight2: Number(deps.waterFlowWeight2Input.value) }),
      options: { rebuildFlowMap: true },
    },
    {
      element: deps.waterFlowWeight3Input,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowWeight3: Number(deps.waterFlowWeight3Input.value) }),
      options: { rebuildFlowMap: true },
    },
    {
      element: deps.waterFlowStrengthInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowStrength: Number(deps.waterFlowStrengthInput.value) }),
    },
    {
      element: deps.waterFlowSpeedInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowSpeed: Number(deps.waterFlowSpeedInput.value) }),
    },
    {
      element: deps.waterFlowScaleInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterFlowScale: Number(deps.waterFlowScaleInput.value) }),
    },
    {
      element: deps.waterShimmerStrengthInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterShimmerStrength: Number(deps.waterShimmerStrengthInput.value) }),
    },
    {
      element: deps.waterGlintStrengthInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterGlintStrength: Number(deps.waterGlintStrengthInput.value) }),
    },
    {
      element: deps.waterGlintSharpnessInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterGlintSharpness: Number(deps.waterGlintSharpnessInput.value) }),
    },
    {
      element: deps.waterShoreFoamStrengthInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterShoreFoamStrength: Number(deps.waterShoreFoamStrengthInput.value) }),
    },
    {
      element: deps.waterShoreWidthInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterShoreWidth: Number(deps.waterShoreWidthInput.value) }),
    },
    {
      element: deps.waterReflectivityInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterReflectivity: Number(deps.waterReflectivityInput.value) }),
    },
    {
      element: deps.waterTintStrengthInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterTintStrength: Number(deps.waterTintStrengthInput.value) }),
    },
    {
      element: deps.waterTintColorInput,
      eventType: "input",
      section: "waterfx",
      patchFactory: () => ({ waterTintColor: deps.waterTintColorInput.value }),
    },
    {
      element: deps.waterFxToggle,
      eventType: "change",
      section: "waterfx",
      patchFactory: () => ({ useWaterFx: Boolean(deps.waterFxToggle.checked) }),
    },
    {
      element: deps.waterFlowDownhillToggle,
      eventType: "change",
      section: "waterfx",
      patchFactory: () => ({ waterFlowDownhill: Boolean(deps.waterFlowDownhillToggle.checked) }),
      options: { rebuildFlowMap: true },
    },
    {
      element: deps.waterFlowInvertDownhillToggle,
      eventType: "change",
      section: "waterfx",
      patchFactory: () => ({ waterFlowInvertDownhill: Boolean(deps.waterFlowInvertDownhillToggle.checked) }),
    },
    {
      element: deps.waterFlowDebugToggle,
      eventType: "change",
      section: "waterfx",
      patchFactory: () => ({ waterFlowDebug: Boolean(deps.waterFlowDebugToggle.checked) }),
    },
  ];

  for (const binding of bindings) {
    if (
      !binding
      || !binding.element
      || typeof binding.element.addEventListener !== "function"
      || typeof binding.patchFactory !== "function"
    ) {
      continue;
    }
    binding.element.addEventListener(binding.eventType, () => {
      dispatchRenderFxChange(
        binding.section,
        binding.patchFactory(),
        binding.options || {},
      );
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
