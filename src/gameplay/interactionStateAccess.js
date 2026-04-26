import { DEFAULT_CURSOR_LIGHT_COLOR_HEX } from "../core/state.js";

export function getCursorLightSnapshot(deps) {
  const cursorLightState = typeof deps.getCursorLightState === "function"
    ? deps.getCursorLightState()
    : deps.cursorLightState;
  // These UI-side fallback defaults are intentionally brighter than core boot defaults
  // so cursor-light editing remains readable before any map settings are loaded.
  const effectiveCursorLightState = cursorLightState || {
    enabled: false,
    useTerrainHeight: true,
    strength: 40,
    heightOffset: 25,
    colorHex: DEFAULT_CURSOR_LIGHT_COLOR_HEX,
    showGizmo: false,
  };
  const coreCursorLight = deps.getCoreCursorLight();
  if (coreCursorLight && Number.isFinite(Number(coreCursorLight.strength))) {
    return {
      enabled: Boolean(coreCursorLight.enabled),
      useTerrainHeight: Boolean(coreCursorLight.useTerrainHeight),
      strength: Math.round(deps.clamp(Number(coreCursorLight.strength), 1, 200)),
      heightOffset: Math.round(deps.clamp(Number(coreCursorLight.heightOffset), 0, 120)),
      colorHex: typeof coreCursorLight.color === "string"
        ? coreCursorLight.color
        : (typeof effectiveCursorLightState.colorHex === "string"
          ? effectiveCursorLightState.colorHex
          : DEFAULT_CURSOR_LIGHT_COLOR_HEX),
      showGizmo: Boolean(coreCursorLight.showGizmo),
    };
  }
  return {
    enabled: Boolean(effectiveCursorLightState.enabled),
    useTerrainHeight: Boolean(effectiveCursorLightState.useTerrainHeight),
    strength: Math.round(deps.clamp(Number(effectiveCursorLightState.strength), 1, 200)),
    heightOffset: Math.round(deps.clamp(Number(effectiveCursorLightState.heightOffset), 0, 120)),
    colorHex: typeof effectiveCursorLightState.colorHex === "string"
      ? effectiveCursorLightState.colorHex
      : DEFAULT_CURSOR_LIGHT_COLOR_HEX,
    showGizmo: Boolean(effectiveCursorLightState.showGizmo),
  };
}

export function isPointLightLiveUpdateEnabled(deps) {
  const pointLightsState = deps.getCorePointLights();
  if (pointLightsState && typeof pointLightsState.liveUpdate === "boolean") {
    return pointLightsState.liveUpdate;
  }
  return false;
}
