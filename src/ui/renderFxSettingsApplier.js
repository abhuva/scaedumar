export function createRenderFxSettingsApplier(deps) {
  function normalizeDegrees(value) {
    const deg = Number(value);
    if (!Number.isFinite(deg)) return 0;
    return ((deg % 360) + 360) % 360;
  }

  function applyFogSettingsCompat() {
    const fog = deps.getFogSettings();
    deps.fogToggle.checked = Boolean(fog.useFog);
    deps.fogColorInput.value = typeof fog.fogColor === "string"
      ? (fog.fogColor.startsWith("#") ? fog.fogColor : `#${fog.fogColor}`)
      : "#ffffff";
    deps.setFogColorManual(Boolean(fog.fogColorManual));
    deps.fogMinAlphaInput.value = String(deps.clamp(Number(fog.fogMinAlpha), 0, 1));
    deps.fogMaxAlphaInput.value = String(deps.clamp(Number(fog.fogMaxAlpha), 0, 1));
    deps.fogFalloffInput.value = String(deps.clamp(Number(fog.fogFalloff), 0.2, 4));
    deps.fogStartOffsetInput.value = String(deps.clamp(Number(fog.fogStartOffset), 0, 1));
    deps.updateFogAlphaLabels();
    deps.updateFogFalloffLabel();
    deps.updateFogStartOffsetLabel();
    deps.updateFogUi();
  }

  function applyCloudSettingsCompat() {
    const clouds = deps.getCloudSettings();
    const timeState = deps.getTimeState();
    deps.cloudToggle.checked = Boolean(clouds.useClouds);
    deps.cloudCoverageInput.value = String(deps.clamp(Number(clouds.cloudCoverage), 0, 1));
    deps.cloudSoftnessInput.value = String(deps.clamp(Number(clouds.cloudSoftness), 0.01, 0.35));
    deps.cloudOpacityInput.value = String(deps.clamp(Number(clouds.cloudOpacity), 0, 1));
    deps.cloudScaleInput.value = String(deps.clamp(Number(clouds.cloudScale), 0.5, 8));
    deps.cloudSpeed1Input.value = String(deps.clamp(Number(clouds.cloudSpeed1), -0.3, 0.3));
    deps.cloudSpeed2Input.value = String(deps.clamp(Number(clouds.cloudSpeed2), -0.3, 0.3));
    deps.cloudSunParallaxInput.value = String(deps.clamp(Number(clouds.cloudSunParallax), 0, 2));
    deps.cloudSunProjectToggle.checked = Boolean(clouds.cloudUseSunProjection);
    deps.cloudTimeRoutingInput.value = deps.normalizeRoutingMode(timeState.routing && timeState.routing.clouds, "global");
    deps.updateCloudLabels();
    deps.updateCloudUi();
  }

  function applyWaterSettingsCompat() {
    const water = deps.getWaterSettings();
    const timeState = deps.getTimeState();
    const flowSource = water.waterFlowSource === "fixed" || water.waterFlowSource === "height" || water.waterFlowSource === "image"
      ? water.waterFlowSource
      : (water.waterFlowDownhill === false ? "fixed" : "height");
    deps.waterFxToggle.checked = Boolean(water.useWaterFx);
    deps.waterFlowSourceInput.value = flowSource;
    deps.waterFlowRenderModeInput.value = water.waterFlowRenderMode === "procedural" ? "procedural" : "streamlines";
    deps.waterFlowChannelPairInput.value = water.waterFlowChannelPair === "gb" || water.waterFlowChannelPair === "rb" ? water.waterFlowChannelPair : "rg";
    deps.waterFlowFlipXToggle.checked = Boolean(water.waterFlowFlipX);
    deps.waterFlowFlipYToggle.checked = Boolean(water.waterFlowFlipY);
    deps.waterFlowUseMagnitudeToggle.checked = Boolean(water.waterFlowUseMagnitude);
    deps.waterFlowInvertDownhillToggle.checked = Boolean(water.waterFlowInvertDownhill);
    deps.waterFlowDebugToggle.checked = Boolean(water.waterFlowDebug);
    deps.waterFlowDirectionInput.value = String(Math.round(normalizeDegrees(water.waterFlowDirectionDeg)));
    deps.waterLocalFlowMixInput.value = String(deps.clamp(Number(water.waterLocalFlowMix), 0, 1));
    deps.waterDownhillBoostInput.value = String(deps.clamp(Number(water.waterDownhillBoost), 0, 4));
    deps.waterFlowRadius1Input.value = String(Math.round(deps.clamp(Number(water.waterFlowRadius1), 1, 12)));
    deps.waterFlowRadius2Input.value = String(Math.round(deps.clamp(Number(water.waterFlowRadius2), 1, 24)));
    deps.waterFlowRadius3Input.value = String(Math.round(deps.clamp(Number(water.waterFlowRadius3), 1, 40)));
    deps.waterFlowWeight1Input.value = String(deps.clamp(Number(water.waterFlowWeight1), 0, 1));
    deps.waterFlowWeight2Input.value = String(deps.clamp(Number(water.waterFlowWeight2), 0, 1));
    deps.waterFlowWeight3Input.value = String(deps.clamp(Number(water.waterFlowWeight3), 0, 1));
    deps.waterFlowStrengthInput.value = String(deps.clamp(Number(water.waterFlowStrength), 0, 0.15));
    deps.waterFlowMapStrengthInput.value = String(deps.clamp(Number(water.waterFlowMapStrength), 0, 4));
    deps.waterFlowVisibilityInput.value = String(deps.clamp(Number(water.waterFlowVisibility), 0, 4));
    deps.waterStreamlineDensityInput.value = String(Math.round(deps.clamp(Number(water.waterStreamlineDensity), 4, 80)));
    deps.waterStreamlineSharpnessInput.value = String(deps.clamp(Number(water.waterStreamlineSharpness), 0, 1));
    deps.waterFlowSpeedInput.value = String(deps.clamp(Number(water.waterFlowSpeed), 0, 2.5));
    deps.waterFlowScaleInput.value = String(deps.clamp(Number(water.waterFlowScale), 0.5, 14));
    deps.waterShimmerStrengthInput.value = String(deps.clamp(Number(water.waterShimmerStrength), 0, 0.2));
    deps.waterGlintStrengthInput.value = String(deps.clamp(Number(water.waterGlintStrength), 0, 1.5));
    deps.waterGlintSharpnessInput.value = String(deps.clamp(Number(water.waterGlintSharpness), 0, 1));
    deps.waterShoreFoamStrengthInput.value = String(deps.clamp(Number(water.waterShoreFoamStrength), 0, 0.5));
    deps.waterShoreWidthInput.value = String(deps.clamp(Number(water.waterShoreWidth), 0.4, 6));
    deps.waterReflectivityInput.value = String(deps.clamp(Number(water.waterReflectivity), 0, 1));
    deps.waterBaseColorInput.value = Array.isArray(water.waterBaseColor)
      ? deps.rgbToHex(water.waterBaseColor)
      : String(water.waterBaseColor || "#245f73");
    deps.waterOpacityInput.value = String(deps.clamp(Number(water.waterOpacity), 0, 1));
    deps.waterTintColorInput.value = Array.isArray(water.waterTintColor)
      ? deps.rgbToHex(water.waterTintColor)
      : String(water.waterTintColor || "#5ea6d6");
    deps.waterTintStrengthInput.value = String(deps.clamp(Number(water.waterTintStrength), 0, 1));
    deps.waterTimeRoutingInput.value = deps.normalizeRoutingMode(timeState.routing && timeState.routing.water, "detached");
    deps.updateWaterLabels();
    deps.updateWaterUi();
    deps.rebuildFlowMapTexture();
  }

  return {
    applyFogSettingsCompat,
    applyCloudSettingsCompat,
    applyWaterSettingsCompat,
  };
}
