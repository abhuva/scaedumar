export const DEFAULT_CAMERA_SETTINGS = {
  version: 1,
  zoomMin: 0.5,
  zoomMax: 128,
};

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeCameraSettings(rawData, fallback = DEFAULT_CAMERA_SETTINGS) {
  const source = rawData && typeof rawData === "object" ? rawData : {};
  const min = clamp(finiteOr(source.zoomMin, fallback.zoomMin), 0.05, 32);
  const max = clamp(finiteOr(source.zoomMax, fallback.zoomMax), min, 512);
  return {
    version: 1,
    zoomMin: min,
    zoomMax: max,
  };
}

export function createCameraSettingsSerializer(deps) {
  function serializeCameraSettingsCompat() {
    return normalizeCameraSettings(deps.getCameraSettings(), deps.defaultCameraSettings);
  }

  function applyCameraSettingsCompat() {
    if (typeof deps.clampCameraToBounds === "function") {
      deps.clampCameraToBounds();
    }
  }

  return {
    serializeCameraSettingsCompat,
    applyCameraSettingsCompat,
  };
}
