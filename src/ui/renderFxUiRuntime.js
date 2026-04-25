export function updateParallaxStrengthLabel(deps) {
  const value = deps.clamp(Number(deps.serializeParallaxSettings().parallaxStrength), 0, 1);
  deps.parallaxStrengthValue.textContent = value.toFixed(2);
}

export function updateParallaxBandsLabel(deps) {
  const value = Math.round(deps.clamp(Number(deps.serializeParallaxSettings().parallaxBands), 2, 256));
  deps.parallaxBandsValue.textContent = String(value);
}

export function updateShadowBlurLabel(deps) {
  const value = deps.clamp(Number(deps.serializeLightingSettings().shadowBlur), 0, 3);
  deps.shadowBlurValue.textContent = `${value.toFixed(2)} px`;
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

export function updateVolumetricLabels(deps) {
  const lighting = deps.serializeLightingSettings();
  deps.volumetricStrengthValue.textContent = deps.clamp(Number(lighting.volumetricStrength), 0, 1).toFixed(2);
  deps.volumetricDensityValue.textContent = deps.clamp(Number(lighting.volumetricDensity), 0, 2).toFixed(2);
  deps.volumetricAnisotropyValue.textContent = deps.clamp(Number(lighting.volumetricAnisotropy), 0, 0.95).toFixed(2);
  deps.volumetricLengthValue.textContent = `${Math.round(deps.clamp(Number(lighting.volumetricLength), 8, 160))} px`;
  deps.volumetricSamplesValue.textContent = String(Math.round(deps.clamp(Number(lighting.volumetricSamples), 4, 24)));
}

export function updateVolumetricUi(deps) {
  deps.volumetricStrengthInput.disabled = false;
  deps.volumetricDensityInput.disabled = false;
  deps.volumetricAnisotropyInput.disabled = false;
  deps.volumetricLengthInput.disabled = false;
  deps.volumetricSamplesInput.disabled = false;
}

export function updateCloudLabels(deps) {
  const clouds = deps.serializeCloudSettings();
  deps.cloudCoverageValue.textContent = deps.clamp(Number(clouds.cloudCoverage), 0, 1).toFixed(2);
  deps.cloudSoftnessValue.textContent = deps.clamp(Number(clouds.cloudSoftness), 0.01, 0.35).toFixed(2);
  deps.cloudOpacityValue.textContent = deps.clamp(Number(clouds.cloudOpacity), 0, 1).toFixed(2);
  deps.cloudScaleValue.textContent = deps.clamp(Number(clouds.cloudScale), 0.5, 8).toFixed(2);
  deps.cloudSpeed1Value.textContent = deps.clamp(Number(clouds.cloudSpeed1), -0.3, 0.3).toFixed(3);
  deps.cloudSpeed2Value.textContent = deps.clamp(Number(clouds.cloudSpeed2), -0.3, 0.3).toFixed(3);
  deps.cloudSunParallaxValue.textContent = deps.clamp(Number(clouds.cloudSunParallax), 0, 2).toFixed(2);
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
  deps.waterFlowSpeedValue.textContent = deps.clamp(Number(water.waterFlowSpeed), 0, 2.5).toFixed(2);
  deps.waterFlowScaleValue.textContent = deps.clamp(Number(water.waterFlowScale), 0.5, 14).toFixed(2);
  deps.waterShimmerStrengthValue.textContent = deps.clamp(Number(water.waterShimmerStrength), 0, 0.2).toFixed(3);
  deps.waterGlintStrengthValue.textContent = deps.clamp(Number(water.waterGlintStrength), 0, 1.5).toFixed(2);
  deps.waterGlintSharpnessValue.textContent = deps.clamp(Number(water.waterGlintSharpness), 0, 1).toFixed(2);
  deps.waterShoreFoamStrengthValue.textContent = deps.clamp(Number(water.waterShoreFoamStrength), 0, 0.5).toFixed(2);
  deps.waterShoreWidthValue.textContent = `${deps.clamp(Number(water.waterShoreWidth), 0.4, 6).toFixed(1)} px`;
  deps.waterReflectivityValue.textContent = deps.clamp(Number(water.waterReflectivity), 0, 1).toFixed(2);
  deps.waterTintStrengthValue.textContent = deps.clamp(Number(water.waterTintStrength), 0, 1).toFixed(2);
}

export function updateParallaxUi(deps) {
  deps.parallaxStrengthInput.disabled = false;
  deps.parallaxBandsInput.disabled = false;
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
  deps.cloudSunParallaxInput.disabled = false;
  deps.cloudSunProjectToggle.disabled = false;
}

export function updateWaterUi(deps) {
  deps.waterFlowDownhillToggle.disabled = false;
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
  deps.waterFlowSpeedInput.disabled = false;
  deps.waterFlowScaleInput.disabled = false;
  deps.waterShimmerStrengthInput.disabled = false;
  deps.waterGlintStrengthInput.disabled = false;
  deps.waterGlintSharpnessInput.disabled = false;
  deps.waterShoreFoamStrengthInput.disabled = false;
  deps.waterShoreWidthInput.disabled = false;
  deps.waterReflectivityInput.disabled = false;
  deps.waterTintColorInput.disabled = false;
  deps.waterTintStrengthInput.disabled = false;
}
