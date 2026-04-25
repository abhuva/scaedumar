export function getCursorLightSnapshot(deps) {
  const coreCursorLight = deps.getCoreCursorLight();
  if (coreCursorLight && Number.isFinite(Number(coreCursorLight.strength))) {
    return {
      enabled: Boolean(coreCursorLight.enabled),
      useTerrainHeight: Boolean(coreCursorLight.useTerrainHeight),
      strength: Math.round(deps.clamp(Number(coreCursorLight.strength), 1, 200)),
      heightOffset: Math.round(deps.clamp(Number(coreCursorLight.heightOffset), 0, 120)),
      colorHex: typeof coreCursorLight.color === "string" ? coreCursorLight.color : deps.cursorLightState.colorHex,
      showGizmo: Boolean(coreCursorLight.showGizmo),
    };
  }
  return {
    enabled: Boolean(deps.cursorLightState.enabled),
    useTerrainHeight: Boolean(deps.cursorLightState.useTerrainHeight),
    strength: Math.round(deps.clamp(Number(deps.cursorLightState.strength), 1, 200)),
    heightOffset: Math.round(deps.clamp(Number(deps.cursorLightState.heightOffset), 0, 120)),
    colorHex: typeof deps.cursorLightState.colorHex === "string" ? deps.cursorLightState.colorHex : "#ff9b2f",
    showGizmo: Boolean(deps.cursorLightState.showGizmo),
  };
}

export function isPointLightLiveUpdateEnabled(deps) {
  const pointLightsState = deps.getCorePointLights();
  if (pointLightsState && typeof pointLightsState.liveUpdate === "boolean") {
    return pointLightsState.liveUpdate;
  }
  return false;
}
