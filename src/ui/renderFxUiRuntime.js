export function updateShadowBlurLabel(deps) {
  const value = deps.clamp(Number(deps.serializeLightingSettings().shadowBlur), 0, 3);
  deps.shadowBlurValue.textContent = `${value.toFixed(2)} px`;
}

export function updateLightingBalanceLabels(deps) {
  const lighting = deps.serializeLightingSettings();
  deps.ambientValue.textContent = deps.clamp(Number(lighting.ambient), 0, 1).toFixed(2);
  deps.diffuseValue.textContent = deps.clamp(Number(lighting.diffuse), 0, 2).toFixed(2);
}

export function updateSimTickLabel(deps) {
  const value = deps.normalizeSimTickHours(deps.serializeLightingSettings().simTickHours);
  deps.simTickHoursValue.textContent = value.toFixed(3);
}

export function updateFogAlphaLabels(deps) {
  const fog = deps.serializeFogSettings();
  deps.fogMinAlphaValue.textContent = deps.clamp(Number(fog.fogMinAlpha), 0, 1).toFixed(2);
  deps.fogMaxAlphaValue.textContent = deps.clamp(Number(fog.fogMaxAlpha), 0, 1).toFixed(2);
}

export function updateFogFalloffLabel(deps) {
  const fog = deps.serializeFogSettings();
  deps.fogFalloffValue.textContent = deps.clamp(Number(fog.fogFalloff), 0.2, 4).toFixed(2);
}

export function updateFogStartOffsetLabel(deps) {
  const fog = deps.serializeFogSettings();
  deps.fogStartOffsetValue.textContent = deps.clamp(Number(fog.fogStartOffset), 0, 1).toFixed(2);
}

export function updatePointFlickerLabels(deps) {
  const lighting = deps.serializeLightingSettings();
  deps.pointFlickerStrengthValue.textContent = deps.clamp(Number(lighting.pointFlickerStrength), 0, 1).toFixed(2);
  deps.pointFlickerSpeedValue.textContent = `${deps.clamp(Number(lighting.pointFlickerSpeed), 0.1, 12).toFixed(2)} Hz`;
  deps.pointFlickerSpatialValue.textContent = deps.clamp(Number(lighting.pointFlickerSpatial), 0, 4).toFixed(2);
}

export function updatePointFlickerUi(deps) {
  deps.pointFlickerStrengthInput.disabled = false;
  deps.pointFlickerSpeedInput.disabled = false;
  deps.pointFlickerSpatialInput.disabled = false;
}

export function updateCloudLabels(deps) {
  const clouds = deps.serializeCloudSettings();
  deps.cloudCoverageValue.textContent = deps.clamp(Number(clouds.cloudCoverage), 0, 1).toFixed(2);
  deps.cloudSoftnessValue.textContent = deps.clamp(Number(clouds.cloudSoftness), 0.01, 0.35).toFixed(2);
  deps.cloudOpacityValue.textContent = deps.clamp(Number(clouds.cloudOpacity), 0, 1).toFixed(2);
  deps.cloudScaleValue.textContent = deps.clamp(Number(clouds.cloudScale), 0.5, 8).toFixed(2);
  deps.cloudSpeed1Value.textContent = deps.clamp(Number(clouds.cloudSpeed1), -0.3, 0.3).toFixed(3);
  deps.cloudSpeed2Value.textContent = deps.clamp(Number(clouds.cloudSpeed2), -0.3, 0.3).toFixed(3);
}

export function updateWaterLabels(deps) {
  const water = deps.serializeWaterSettings();
  const waterFlowDirectionDeg = Number(water.waterFlowDirectionDeg);
  const normalizedDirection = Number.isFinite(waterFlowDirectionDeg)
    ? ((waterFlowDirectionDeg % 360) + 360) % 360
    : 0;
  deps.waterFlowDirectionValue.textContent = `${Math.round(normalizedDirection)} deg`;
  deps.waterLocalFlowMixValue.textContent = deps.clamp(Number(water.waterLocalFlowMix), 0, 1).toFixed(2);
  deps.waterDownhillBoostValue.textContent = deps.clamp(Number(water.waterDownhillBoost), 0, 4).toFixed(2);
  deps.waterFlowRadius1Value.textContent = String(Math.round(deps.clamp(Number(water.waterFlowRadius1), 1, 12)));
  deps.waterFlowRadius2Value.textContent = String(Math.round(deps.clamp(Number(water.waterFlowRadius2), 1, 24)));
  deps.waterFlowRadius3Value.textContent = String(Math.round(deps.clamp(Number(water.waterFlowRadius3), 1, 40)));
  deps.waterFlowWeight1Value.textContent = deps.clamp(Number(water.waterFlowWeight1), 0, 1).toFixed(2);
  deps.waterFlowWeight2Value.textContent = deps.clamp(Number(water.waterFlowWeight2), 0, 1).toFixed(2);
  deps.waterFlowWeight3Value.textContent = deps.clamp(Number(water.waterFlowWeight3), 0, 1).toFixed(2);
  deps.waterFlowStrengthValue.textContent = deps.clamp(Number(water.waterFlowStrength), 0, 0.15).toFixed(3);
  deps.waterFlowMapStrengthValue.textContent = deps.clamp(Number(water.waterFlowMapStrength), 0, 4).toFixed(2);
  deps.waterFlowVisibilityValue.textContent = deps.clamp(Number(water.waterFlowVisibility), 0, 4).toFixed(2);
  deps.waterStreamlineDensityValue.textContent = String(Math.round(deps.clamp(Number(water.waterStreamlineDensity), 4, 80)));
  deps.waterStreamlineSharpnessValue.textContent = deps.clamp(Number(water.waterStreamlineSharpness), 0, 1).toFixed(2);
  deps.waterFlowSpeedValue.textContent = deps.clamp(Number(water.waterFlowSpeed), 0, 2.5).toFixed(2);
  deps.waterFlowScaleValue.textContent = deps.clamp(Number(water.waterFlowScale), 0.5, 14).toFixed(2);
  deps.waterShimmerStrengthValue.textContent = deps.clamp(Number(water.waterShimmerStrength), 0, 0.2).toFixed(3);
  deps.waterGlintStrengthValue.textContent = deps.clamp(Number(water.waterGlintStrength), 0, 1.5).toFixed(2);
  deps.waterGlintSharpnessValue.textContent = deps.clamp(Number(water.waterGlintSharpness), 0, 1).toFixed(2);
  deps.waterShoreFoamStrengthValue.textContent = deps.clamp(Number(water.waterShoreFoamStrength), 0, 0.5).toFixed(2);
  deps.waterShoreWidthValue.textContent = `${deps.clamp(Number(water.waterShoreWidth), 0.4, 6).toFixed(1)} px`;
  deps.waterReflectivityValue.textContent = deps.clamp(Number(water.waterReflectivity), 0, 1).toFixed(2);
  deps.waterOpacityValue.textContent = deps.clamp(Number(water.waterOpacity), 0, 1).toFixed(2);
  deps.waterTintStrengthValue.textContent = deps.clamp(Number(water.waterTintStrength), 0, 1).toFixed(2);
}

export function updateFogUi(deps) {
  deps.fogColorInput.disabled = false;
  deps.fogMinAlphaInput.disabled = false;
  deps.fogMaxAlphaInput.disabled = false;
  deps.fogFalloffInput.disabled = false;
  deps.fogStartOffsetInput.disabled = false;
}

export function updateCloudUi(deps) {
  deps.cloudCoverageInput.disabled = false;
  deps.cloudSoftnessInput.disabled = false;
  deps.cloudOpacityInput.disabled = false;
  deps.cloudScaleInput.disabled = false;
  deps.cloudSpeed1Input.disabled = false;
  deps.cloudSpeed2Input.disabled = false;
}

export function updateWaterUi(deps) {
  deps.waterFlowSourceInput.disabled = false;
  deps.waterFlowRenderModeInput.disabled = false;
  deps.waterFlowChannelPairInput.disabled = false;
  deps.waterFlowFlipXToggle.disabled = false;
  deps.waterFlowFlipYToggle.disabled = false;
  deps.waterFlowUseMagnitudeToggle.disabled = false;
  deps.waterFlowInvertDownhillToggle.disabled = false;
  deps.waterFlowDebugToggle.disabled = false;
  deps.waterFlowDirectionInput.disabled = false;
  deps.waterLocalFlowMixInput.disabled = false;
  deps.waterDownhillBoostInput.disabled = false;
  deps.waterFlowRadius1Input.disabled = false;
  deps.waterFlowRadius2Input.disabled = false;
  deps.waterFlowRadius3Input.disabled = false;
  deps.waterFlowWeight1Input.disabled = false;
  deps.waterFlowWeight2Input.disabled = false;
  deps.waterFlowWeight3Input.disabled = false;
  deps.waterFlowStrengthInput.disabled = false;
  deps.waterFlowMapStrengthInput.disabled = false;
  deps.waterFlowVisibilityInput.disabled = false;
  deps.waterStreamlineDensityInput.disabled = false;
  deps.waterStreamlineSharpnessInput.disabled = false;
  deps.waterFlowSpeedInput.disabled = false;
  deps.waterFlowScaleInput.disabled = false;
  deps.waterShimmerStrengthInput.disabled = false;
  deps.waterGlintStrengthInput.disabled = false;
  deps.waterGlintSharpnessInput.disabled = false;
  deps.waterShoreFoamStrengthInput.disabled = false;
  deps.waterShoreWidthInput.disabled = false;
  deps.waterReflectivityInput.disabled = false;
  deps.waterBaseColorInput.disabled = false;
  deps.waterOpacityInput.disabled = false;
  deps.waterTintColorInput.disabled = false;
  deps.waterTintStrengthInput.disabled = false;
}
