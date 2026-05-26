import { clamp } from "../core/mathUtils.js";

const RESOURCE_LAYER_IDS = new Set(["water", "plants"]);

export function normalizeInspectOverlayLayer(layer) {
  if (layer === "none") return "none";
  if (layer === "tracks") return "tracks";
  if (layer === "plants") return "plants";
  if (layer === "height" || layer === "slope") return layer;
  return "water";
}

export function getInspectOverlayDebugLayer(layer = "water") {
  const normalized = normalizeInspectOverlayLayer(layer);
  if (normalized === "tracks" || normalized === "none") return null;
  if (normalized === "plants" || normalized === "height" || normalized === "slope") return normalized;
  return "water";
}

export function getInspectOverlayResourceId(layer = "water") {
  const normalized = normalizeInspectOverlayLayer(layer);
  if (normalized === "water" || normalized === "plants") return normalized;
  return null;
}

export function getInspectOverlayDisplayLabel(layer = "water") {
  const normalized = normalizeInspectOverlayLayer(layer);
  if (normalized === "tracks") return "Tracks";
  if (normalized === "water") return "Water";
  if (normalized === "plants") return "Plants";
  if (normalized === "height") return "Height";
  if (normalized === "slope") return "Slope";
  return "Inspect";
}

function cloneReading(reading) {
  return reading && typeof reading === "object" ? { ...reading } : reading;
}

export function createInspectPerceptionRuntime(deps = {}) {
  const state = {
    enabled: false,
    layer: normalizeInspectOverlayLayer(deps.initialLayer || "water"),
    cursorX: null,
    cursorY: null,
    inspectX: null,
    inspectY: null,
    inspectHeight: null,
    inspectSlope: null,
    inspectTracks: 0,
    inspectResources: [],
  };

  function getMapSize() {
    const size = typeof deps.getMapSize === "function" ? deps.getMapSize() : null;
    return {
      width: Math.max(1, Math.round(Number(size && size.width) || 1)),
      height: Math.max(1, Math.round(Number(size && size.height) || 1)),
    };
  }

  function getResourceId(layer = state.layer) {
    return getInspectOverlayResourceId(layer);
  }

  function syncLayerButtons() {
    const buttons = typeof deps.getLayerButtons === "function" ? deps.getLayerButtons() : [];
    for (const entry of buttons || []) {
      const buttonLayer = Array.isArray(entry) ? entry[0] : entry && entry.layer;
      const button = Array.isArray(entry) ? entry[1] : entry && entry.button;
      if (!button) continue;
      const active = buttonLayer === state.layer;
      button.classList?.toggle?.("active", active);
      button.setAttribute?.("aria-pressed", active ? "true" : "false");
    }
  }

  function emitChanged(payload = {}) {
    deps.onChanged?.({
      layer: state.layer,
      enabled: state.enabled,
      ...payload,
    });
  }

  function setLayer(layer, options = {}) {
    state.layer = normalizeInspectOverlayLayer(layer);
    if (state.layer !== "none") {
      const resourceId = getResourceId(state.layer);
      if (resourceId) {
        deps.onResourceLayerSelected?.(resourceId);
        if (options.revealKnowledge !== false) {
          deps.revealResourceKnowledge?.(resourceId);
        }
      }
      const debugLayer = getInspectOverlayDebugLayer(state.layer);
      if (debugLayer) {
        deps.onDebugLayerSelected?.(debugLayer);
      }
    }
    syncLayerButtons();
    deps.syncDebugPanel?.();
    if (options.emit !== false) {
      emitChanged({ layer: state.layer, reason: options.reason || "layer-changed" });
    }
    return state.layer;
  }

  function sampleAt(pixelX, pixelY, cursorDriven = false) {
    const size = getMapSize();
    const x = clamp(Math.round(Number(pixelX) || 0), 0, Math.max(0, size.width - 1));
    const y = clamp(Math.round(Number(pixelY) || 0), 0, Math.max(0, size.height - 1));
    state.inspectX = x;
    state.inspectY = y;
    state.inspectHeight = typeof deps.sampleHeight === "function" ? deps.sampleHeight(x, y) : 0;
    state.inspectSlope = typeof deps.sampleSlope === "function" ? deps.sampleSlope(x, y) : 0;
    state.inspectTracks = typeof deps.sampleTracks === "function" ? deps.sampleTracks(x, y) : 0;
    state.inspectResources = typeof deps.getResourceReadings === "function"
      ? deps.getResourceReadings(x, y)
      : [];
    if (cursorDriven) {
      state.cursorX = x;
      state.cursorY = y;
    }
    return { x, y };
  }

  function refreshSample() {
    if (state.enabled && state.cursorX != null && state.cursorY != null) {
      sampleAt(state.cursorX, state.cursorY, false);
      return;
    }
    const fallback = typeof deps.getFallbackPixel === "function" ? deps.getFallbackPixel() : null;
    sampleAt(fallback && fallback.x, fallback && fallback.y, false);
  }

  function getLayerBarValue(layer = state.layer, stockOverlayMode = "known") {
    const normalized = normalizeInspectOverlayLayer(layer);
    if (normalized === "height") return clamp(Number(state.inspectHeight) || 0, 0, 1);
    if (normalized === "slope") return clamp(Number(state.inspectSlope) || 0, 0, 1);
    if (normalized === "tracks") return clamp(Number(state.inspectTracks) || 0, 0, 1);
    if (!RESOURCE_LAYER_IDS.has(normalized)) return 0;
    const resourceId = getResourceId(normalized);
    const reading = state.inspectResources.find((item) => item && item.resourceId === resourceId);
    if (!reading) return 0;
    const stockFactor = stockOverlayMode === "live"
      ? Number(reading.stock)
      : (stockOverlayMode === "none" ? 1 : Number(reading.knownStock));
    return clamp(
      (Number(reading.value) || 0)
        * (Number(reading.knowledge) || 0)
        * (Number.isFinite(stockFactor) ? stockFactor : 0),
      0,
      1,
    );
  }

  function getSnapshot(options = {}) {
    refreshSample();
    return {
      enabled: state.enabled,
      layer: state.layer,
      inspectX: state.inspectX,
      inspectY: state.inspectY,
      inspectHeight: state.inspectHeight,
      inspectSlope: state.inspectSlope,
      inspectTracks: state.inspectTracks,
      inspectResources: state.inspectResources.map(cloneReading),
      stockOverlayMode: options.stockOverlayMode || "known",
    };
  }

  function toggle() {
    if (!state.enabled && deps.canEnable?.() === false) {
      return { ok: false, reason: deps.getBlockedReason?.() || "Inspect is unavailable during this activity." };
    }
    state.enabled = !state.enabled;
    if (state.enabled && state.layer === "none") {
      setLayer("water", { reason: "toggle-layer" });
    } else {
      deps.syncDebugPanel?.();
    }
    emitChanged({ enabled: state.enabled, reason: "toggle" });
    deps.setStatus?.(state.enabled ? "Inspect enabled." : "Inspect disabled.");
    return { ok: true };
  }

  function updateFromMapPixel(pixelX, pixelY, reason = "pointer") {
    if (!state.enabled) return false;
    const pixel = sampleAt(pixelX, pixelY, true);
    emitChanged({ x: pixel.x, y: pixel.y, reason });
    return true;
  }

  function isEnabled() {
    return state.enabled;
  }

  function getLayer() {
    return state.layer;
  }

  syncLayerButtons();

  return {
    getLayer,
    getResourceId,
    getDebugLayer: () => getInspectOverlayDebugLayer(state.layer),
    getDisplayLabel: () => getInspectOverlayDisplayLabel(state.layer),
    getLayerDisplayLabel: getInspectOverlayDisplayLabel,
    getLayerResourceId: getInspectOverlayResourceId,
    getLayerDebugLayer: getInspectOverlayDebugLayer,
    setLayer,
    isEnabled,
    toggle,
    sampleAt,
    refreshSample,
    getLayerBarValue,
    getSnapshot,
    updateFromMapPixel,
  };
}
