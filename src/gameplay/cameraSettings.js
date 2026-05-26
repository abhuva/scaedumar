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
  const normalized = {
    version: 1,
    zoomMin: min,
    zoomMax: max,
  };
  if (Number.isFinite(Number(source.zoom))) {
    normalized.zoom = clamp(Number(source.zoom), min, max);
  }
  if (Number.isFinite(Number(source.pixelX)) && Number.isFinite(Number(source.pixelY))) {
    normalized.pixelX = Number(source.pixelX);
    normalized.pixelY = Number(source.pixelY);
  }
  if (Number.isFinite(Number(source.panX)) && Number.isFinite(Number(source.panY))) {
    normalized.panX = Number(source.panX);
    normalized.panY = Number(source.panY);
  }
  return normalized;
}

export function createCameraSettingsSerializer(deps) {
  function serializeCameraSettingsCompat() {
    const settings = normalizeCameraSettings(deps.getCameraSettings(), deps.defaultCameraSettings);
    const camera = typeof deps.getCameraState === "function" ? deps.getCameraState() || {} : {};
    if (Number.isFinite(Number(camera.panX)) && Number.isFinite(Number(camera.panY))) {
      settings.panX = Number(camera.panX);
      settings.panY = Number(camera.panY);
    }
    if (Number.isFinite(Number(camera.zoom))) {
      settings.zoom = clamp(Number(camera.zoom), settings.zoomMin, settings.zoomMax);
    }
    return settings;
  }

  function applyCameraSettingsCompat(rawData) {
    const settings = normalizeCameraSettings(rawData, deps.defaultCameraSettings);
    const zoom = Number.isFinite(Number(settings.zoom)) ? settings.zoom : null;
    if (
      Number.isFinite(Number(settings.pixelX))
      && Number.isFinite(Number(settings.pixelY))
      && typeof deps.mapPixelToWorld === "function"
      && typeof deps.setCameraPoseToStore === "function"
    ) {
      const world = deps.mapPixelToWorld(settings.pixelX, settings.pixelY);
      deps.setCameraPoseToStore(world.x, world.y, zoom ?? getCurrentZoom(settings));
      return;
    }
    if (
      Number.isFinite(Number(settings.panX))
      && Number.isFinite(Number(settings.panY))
      && typeof deps.setCameraPoseToStore === "function"
    ) {
      deps.setCameraPoseToStore(settings.panX, settings.panY, zoom ?? getCurrentZoom(settings));
      return;
    }
    if (typeof deps.clampCameraToBounds === "function") {
      deps.clampCameraToBounds();
    }
  }

  function getCurrentZoom(settings) {
    const camera = typeof deps.getCameraState === "function" ? deps.getCameraState() || {} : {};
    return clamp(finiteOr(camera.zoom, 1), settings.zoomMin, settings.zoomMax);
  }

  return {
    serializeCameraSettingsCompat,
    applyCameraSettingsCompat,
  };
}
