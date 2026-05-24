export const DEFAULT_DISCOVERY_SETTINGS_URL = "./assets/data/discovery.json";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export const DEFAULT_DISCOVERY_SETTINGS = {
  timeOfDay: {
    dayRevealMultiplier: 1,
    nightRevealMultiplier: 0.4,
  },
  maps: {
    water: {
      decay: {
        enabled: true,
        intervalTicks: 500,
        amount: 1,
      },
    },
  },
  scout: {
    scanRadius: 30,
    revealRadius: 40,
    camera: {
      speedZoomEnabled: true,
      zoomIn: 35,
      zoomOut: 12,
      speedForZoomOut: 120,
      speedSmoothing: 0.08,
      zoomSmoothing: 0.10,
    },
  },
};

export function normalizeDiscoverySettings(rawSettings = {}, fallback = DEFAULT_DISCOVERY_SETTINGS) {
  const source = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
  const sourceTime = source.timeOfDay && typeof source.timeOfDay === "object" ? source.timeOfDay : {};
  const sourceMaps = source.maps && typeof source.maps === "object" ? source.maps : {};
  const sourceScout = source.scout && typeof source.scout === "object" ? source.scout : {};
  const sourceCamera = sourceScout.camera && typeof sourceScout.camera === "object" ? sourceScout.camera : {};
  const fallbackTime = fallback.timeOfDay || DEFAULT_DISCOVERY_SETTINGS.timeOfDay;
  const fallbackMaps = fallback.maps || DEFAULT_DISCOVERY_SETTINGS.maps;
  const fallbackScout = fallback.scout || DEFAULT_DISCOVERY_SETTINGS.scout;
  const fallbackCamera = fallbackScout.camera || DEFAULT_DISCOVERY_SETTINGS.scout.camera;
  const maps = {};
  const mapIds = new Set([
    ...Object.keys(fallbackMaps),
    ...Object.keys(sourceMaps),
  ]);
  for (const mapId of mapIds) {
    const sourceMap = sourceMaps[mapId] && typeof sourceMaps[mapId] === "object" ? sourceMaps[mapId] : {};
    const fallbackMap = fallbackMaps[mapId] || {};
    const sourceDecay = sourceMap.decay && typeof sourceMap.decay === "object" ? sourceMap.decay : {};
    const fallbackDecay = fallbackMap.decay || {};
    maps[mapId] = {
      decay: {
        enabled: sourceDecay.enabled !== false,
        intervalTicks: Math.max(1, Math.round(finite(sourceDecay.intervalTicks, fallbackDecay.intervalTicks || 500))),
        amount: clamp(finite(sourceDecay.amount, fallbackDecay.amount || 1), 0, 255),
      },
    };
  }

  return {
    timeOfDay: {
      dayRevealMultiplier: clamp(finite(sourceTime.dayRevealMultiplier, fallbackTime.dayRevealMultiplier), 0, 4),
      nightRevealMultiplier: clamp(finite(sourceTime.nightRevealMultiplier, fallbackTime.nightRevealMultiplier), 0, 4),
    },
    maps,
    scout: {
      scanRadius: clamp(finite(sourceScout.scanRadius, fallbackScout.scanRadius), 0, 4096),
      revealRadius: clamp(finite(sourceScout.revealRadius, fallbackScout.revealRadius), 0, 4096),
      camera: {
        speedZoomEnabled: sourceCamera.speedZoomEnabled !== false,
        zoomIn: clamp(finite(sourceCamera.zoomIn, fallbackCamera.zoomIn), 0.05, 512),
        zoomOut: clamp(finite(sourceCamera.zoomOut, fallbackCamera.zoomOut), 0.05, 512),
        speedForZoomOut: Math.max(1, finite(sourceCamera.speedForZoomOut, fallbackCamera.speedForZoomOut)),
        speedSmoothing: clamp(finite(sourceCamera.speedSmoothing, fallbackCamera.speedSmoothing), 0, 1),
        zoomSmoothing: clamp(finite(sourceCamera.zoomSmoothing, fallbackCamera.zoomSmoothing), 0, 1),
      },
    },
  };
}

export async function loadDiscoverySettings(options = {}) {
  const fetchFn = options.fetchFn || globalThis.fetch;
  if (typeof fetchFn !== "function") {
    throw new Error("Cannot load discovery settings: fetch is unavailable.");
  }
  const url = options.url || DEFAULT_DISCOVERY_SETTINGS_URL;
  const response = await fetchFn(url);
  if (!response || !response.ok) {
    const status = response ? `${response.status} ${response.statusText || ""}`.trim() : "no response";
    throw new Error(`Failed to load discovery settings from ${url}: ${status}`);
  }
  return normalizeDiscoverySettings(await response.json());
}
