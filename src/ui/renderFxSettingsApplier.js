export function createRenderFxSettingsApplier(deps) {
  function normalizeDegrees(value) {
    const deg = Number(value);
    if (!Number.isFinite(deg)) return 0;
    return ((deg % 360) + 360) % 360;
  }

  function setControlValue(control, value) {
    const text = String(value);
    if (control.type === "range") {
      const num = Number(value);
      if (Number.isFinite(num)) {
        control.valueAsNumber = num;
      }
    }
    control.value = text;
    control.setAttribute("value", text);
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
    setControlValue(deps.waterFlowDirectionInput, Math.round(normalizeDegrees(water.waterFlowDirectionDeg)));
    setControlValue(deps.waterLocalFlowMixInput, deps.clamp(Number(water.waterLocalFlowMix), 0, 1));
    setControlValue(deps.waterDownhillBoostInput, deps.clamp(Number(water.waterDownhillBoost), 0, 4));
    setControlValue(deps.waterFlowRadius1Input, Math.round(deps.clamp(Number(water.waterFlowRadius1), 1, 12)));
    setControlValue(deps.waterFlowRadius2Input, Math.round(deps.clamp(Number(water.waterFlowRadius2), 1, 24)));
    setControlValue(deps.waterFlowRadius3Input, Math.round(deps.clamp(Number(water.waterFlowRadius3), 1, 40)));
    setControlValue(deps.waterFlowWeight1Input, deps.clamp(Number(water.waterFlowWeight1), 0, 1));
    setControlValue(deps.waterFlowWeight2Input, deps.clamp(Number(water.waterFlowWeight2), 0, 1));
    setControlValue(deps.waterFlowWeight3Input, deps.clamp(Number(water.waterFlowWeight3), 0, 1));
    setControlValue(deps.waterFlowStrengthInput, deps.clamp(Number(water.waterFlowStrength), 0, 0.15));
    setControlValue(deps.waterFlowMapStrengthInput, deps.clamp(Number(water.waterFlowMapStrength), 0, 4));
    setControlValue(deps.waterFlowVisibilityInput, deps.clamp(Number(water.waterFlowVisibility), 0, 4));
    setControlValue(deps.waterStreamlineDensityInput, Math.round(deps.clamp(Number(water.waterStreamlineDensity), 4, 80)));
    setControlValue(deps.waterStreamlineSharpnessInput, deps.clamp(Number(water.waterStreamlineSharpness), 0, 1));
    setControlValue(deps.waterFlowSpeedInput, deps.clamp(Number(water.waterFlowSpeed), 0, 2.5));
    setControlValue(deps.waterFlowScaleInput, deps.clamp(Number(water.waterFlowScale), 0.5, 14));
    setControlValue(deps.waterShimmerStrengthInput, deps.clamp(Number(water.waterShimmerStrength), 0, 0.2));
    setControlValue(deps.waterGlintStrengthInput, deps.clamp(Number(water.waterGlintStrength), 0, 1.5));
    setControlValue(deps.waterGlintSharpnessInput, deps.clamp(Number(water.waterGlintSharpness), 0, 1));
    setControlValue(deps.waterShoreFoamStrengthInput, deps.clamp(Number(water.waterShoreFoamStrength), 0, 0.5));
    setControlValue(deps.waterShoreWidthInput, deps.clamp(Number(water.waterShoreWidth), 0.4, 6));
    setControlValue(deps.waterReflectivityInput, deps.clamp(Number(water.waterReflectivity), 0, 1));
    setControlValue(deps.waterBaseColorInput, Array.isArray(water.waterBaseColor)
      ? deps.rgbToHex(water.waterBaseColor)
      : String(water.waterBaseColor || "#245f73"));
    setControlValue(deps.waterOpacityInput, deps.clamp(Number(water.waterOpacity), 0, 1));
    setControlValue(deps.waterTintColorInput, Array.isArray(water.waterTintColor)
      ? deps.rgbToHex(water.waterTintColor)
      : String(water.waterTintColor || "#5ea6d6"));
    setControlValue(deps.waterTintStrengthInput, deps.clamp(Number(water.waterTintStrength), 0, 1));
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
