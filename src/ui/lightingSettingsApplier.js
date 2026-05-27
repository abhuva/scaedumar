export function createLightingSettingsApplier(deps) {
  return function applyLightingSettingsCompat() {
    const state = deps.getCoreState();
    const lighting = deps.getLightingSettings();
    const timeState = state.systems && state.systems.time ? state.systems.time : {};
    const uiState = state.ui || {};
    const cycleHour = Number(uiState.cycleHour);
    deps.shadowsToggle.checked = Boolean(lighting.useShadows);
    deps.heightScaleInput.value = String(Math.round(deps.clamp(Number(lighting.heightScale), 1, 300)));
    deps.shadowStrengthInput.value = String(deps.clamp(Number(lighting.shadowStrength), 0, 1));
    deps.shadowBlurInput.value = String(deps.clamp(Number(lighting.shadowBlur), 0, 3));
    deps.ambientInput.value = String(deps.clamp(Number(lighting.ambient), 0, 1));
    deps.diffuseInput.value = String(deps.clamp(Number(lighting.diffuse), 0, 2));
    deps.cycleState.hour = Number.isFinite(cycleHour) ? deps.clamp(cycleHour, 0, 24) : deps.cycleState.hour;
    deps.cycleSpeedInput.value = String(deps.clamp(Number(timeState.cycleSpeedHoursPerSec), 0, 1));
    deps.simTickHoursInput.value = String(deps.normalizeSimTickHours(timeState.simTickHours));
    deps.pointFlickerToggle.checked = Boolean(lighting.pointFlickerEnabled);
    deps.pointFlickerStrengthInput.value = String(deps.clamp(Number(lighting.pointFlickerStrength), 0, 1));
    deps.pointFlickerSpeedInput.value = String(deps.clamp(Number(lighting.pointFlickerSpeed), 0.1, 12));
    deps.pointFlickerSpatialInput.value = String(deps.clamp(Number(lighting.pointFlickerSpatial), 0, 4));
    deps.updateShadowBlurLabel();
    deps.updateLightingBalanceLabels();
    deps.updatePointFlickerLabels();
    deps.updatePointFlickerUi();
    deps.updateSimTickLabel();
    deps.setCycleHourSliderFromState();
    deps.updateCycleHourLabel();
    deps.schedulePointLightBake();
  };
}
