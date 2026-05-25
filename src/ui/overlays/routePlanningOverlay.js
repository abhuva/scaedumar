function hexToRgb(hex) {
  const value = typeof hex === "string" && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#ffffff";
  return {
    r: parseInt(value.slice(1, 3), 16),
    g: parseInt(value.slice(3, 5), 16),
    b: parseInt(value.slice(5, 7), 16),
  };
}

function rgba(hex, alpha) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0, Math.min(1, Number(alpha) || 0)).toFixed(3)})`;
}

function finitePositive(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function drawMapDot(ctx, deps, pixel, color, radiusMapPx) {
  const centerWorld = deps.mapPixelToWorld(pixel.x, pixel.y);
  const centerScreen = deps.worldToScreen(centerWorld);
  const worldPerMapPixel = deps.getMapAspect() / deps.splatSize.width;
  const edgeWorld = { x: centerWorld.x + worldPerMapPixel * radiusMapPx, y: centerWorld.y };
  const edgeScreen = deps.worldToScreen(edgeWorld);
  const screenRadius = Math.max(1.25, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
  ctx.beginPath();
  ctx.arc(Math.round(centerScreen.x), Math.round(centerScreen.y), screenRadius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function mapPixelToScreenRadius(deps, pixel, radiusMapPx) {
  const centerWorld = deps.mapPixelToWorld(pixel.x, pixel.y);
  const centerScreen = deps.worldToScreen(centerWorld);
  const worldPerMapPixel = deps.getMapAspect() / deps.splatSize.width;
  const edgeWorld = { x: centerWorld.x + worldPerMapPixel * radiusMapPx, y: centerWorld.y };
  const edgeScreen = deps.worldToScreen(edgeWorld);
  return Math.max(3, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
}

function drawMapCircle(ctx, deps, pixel, settings) {
  const center = deps.worldToScreen(deps.mapPixelToWorld(pixel.x, pixel.y));
  const radius = mapPixelToScreenRadius(deps, pixel, settings.radius);
  ctx.save();
  ctx.beginPath();
  ctx.arc(Math.round(center.x), Math.round(center.y), radius, 0, Math.PI * 2);
  ctx.lineWidth = settings.lineWidth;
  ctx.strokeStyle = settings.strokeStyle;
  ctx.fillStyle = settings.fillStyle || "transparent";
  if (settings.fillStyle) ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawMapSegmentHighlight(ctx, deps, segment, color) {
  const polyline = Array.isArray(segment && segment.polyline) ? segment.polyline : [];
  if (polyline.length < 2) return;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < polyline.length; i += 1) {
    const screen = deps.worldToScreen(deps.mapPixelToWorld(polyline[i].x, polyline[i].y));
    if (i === 0) ctx.moveTo(screen.x, screen.y);
    else ctx.lineTo(screen.x, screen.y);
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.restore();
}

function samePixel(a, b) {
  return a && b && Math.round(Number(a.x)) === Math.round(Number(b.x)) && Math.round(Number(a.y)) === Math.round(Number(b.y));
}

const ROUTE_TEXTURE_SIZE = 1024;

function mapPixelToTexture(pixel, deps, textureSize) {
  const width = Math.max(1, Number(deps.splatSize && deps.splatSize.width) || textureSize);
  const height = Math.max(1, Number(deps.splatSize && deps.splatSize.height) || textureSize);
  return {
    x: Math.round(((Number(pixel.x) + 0.5) / width) * textureSize),
    y: Math.round(((Number(pixel.y) + 0.5) / height) * textureSize),
  };
}

function routeTextureScale(deps, textureSize) {
  const width = Math.max(1, Number(deps.splatSize && deps.splatSize.width) || textureSize);
  const height = Math.max(1, Number(deps.splatSize && deps.splatSize.height) || textureSize);
  return textureSize / Math.max(width, height);
}

function drawTextureArrow(ctx, center, tangent, settings, scale) {
  const size = Math.max(1, (Number(settings.arrowSize) || 1) * scale);
  const angle = Math.atan2(tangent.y, tangent.x);
  const color = rgba(settings.arrowColor, settings.arrowOpacity);
  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(size * 0.65, 0);
  ctx.lineTo(size * -0.45, size * -0.38);
  ctx.lineTo(size * -0.2, 0);
  ctx.lineTo(size * -0.45, size * 0.38);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawTextureWaypoint(ctx, center, settings, scale) {
  const size = Math.max(1, (Number(settings.arrowSize) || 1) * scale);
  const radius = Math.max(1, size * 0.42);
  const color = rgba(settings.arrowColor, settings.arrowOpacity);
  ctx.save();
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, size * 0.16);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

function createCanvas(size, height = size) {
  if (typeof globalThis.OffscreenCanvas === "function") {
    return new globalThis.OffscreenCanvas(size, height);
  }
  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = height;
    return canvas;
  }
  return null;
}

const routeTextureCache = {
  key: "",
  canvas: null,
};

const debugTextureCache = {
  key: "",
  canvas: null,
};

function routeTextureKey(snapshot, deps, settings, textureSize) {
  const segments = Array.isArray(snapshot && snapshot.segments) ? snapshot.segments : [];
  const segmentKey = segments.map((segment) => {
    const polyline = Array.isArray(segment && segment.polyline) ? segment.polyline : [];
    const source = segment && segment.source ? `${Math.round(Number(segment.source.x))},${Math.round(Number(segment.source.y))}` : "";
    const destination = segment && segment.destination ? `${Math.round(Number(segment.destination.x))},${Math.round(Number(segment.destination.y))}` : "";
    return `${segment && segment.id}:${source}:${destination}:${polyline.length}`;
  }).join("|");
  const mapWidth = deps && deps.splatSize ? deps.splatSize.width : "";
  const mapHeight = deps && deps.splatSize ? deps.splatSize.height : "";
  return [
    snapshot.version,
    segments.length,
    segmentKey,
    mapWidth,
    mapHeight,
    settings.arrowSpacing,
    settings.arrowColor,
    settings.arrowOpacity,
    settings.arrowSize,
    settings.endpointSkipRatio,
    textureSize,
  ].join(":");
}

function renderCommittedRouteTexture(snapshot, deps, settings, textureSize = 1024) {
  const key = routeTextureKey(snapshot, deps, settings, textureSize);
  if (routeTextureCache.canvas && routeTextureCache.key === key) {
    return routeTextureCache.canvas;
  }
  const canvas = routeTextureCache.canvas || createCanvas(textureSize);
  if (!canvas) return null;
  if (canvas.width !== textureSize) canvas.width = textureSize;
  if (canvas.height !== textureSize) canvas.height = textureSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, textureSize, textureSize);
  ctx.imageSmoothingEnabled = false;
  const segments = Array.isArray(snapshot.segments) ? snapshot.segments : [];
  const waypointByKey = new Map();
  const scale = routeTextureScale(deps, textureSize);
  const spacing = Math.max(1, Math.round(Number(settings.arrowSpacing) || 1));
  const endpointSkipNodes = Math.max(0, Math.floor(spacing * (Number(settings.endpointSkipRatio) || 0)));
  for (const segment of segments) {
    const polyline = Array.isArray(segment && segment.polyline) ? segment.polyline : [];
    if (polyline.length < 2) continue;
    for (const waypoint of [segment.source, segment.destination]) {
      if (!waypoint) continue;
      const waypointKey = `${Math.round(Number(waypoint.x))},${Math.round(Number(waypoint.y))}`;
      if (!waypointByKey.has(waypointKey)) waypointByKey.set(waypointKey, waypoint);
    }
    const lastIndex = polyline.length - 1;
    for (const idx of markerIndexes(polyline.length, spacing)) {
      const point = polyline[idx];
      if (idx < endpointSkipNodes || lastIndex - idx < endpointSkipNodes) continue;
      const prev = polyline[Math.max(0, idx - 1)];
      const next = polyline[Math.min(polyline.length - 1, idx + 1)];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      const center = mapPixelToTexture(point, deps, textureSize);
      drawTextureArrow(ctx, center, { x: dx / len, y: dy / len }, settings, scale);
    }
  }
  for (const waypoint of waypointByKey.values()) {
    drawTextureWaypoint(ctx, mapPixelToTexture(waypoint, deps, textureSize), settings, scale);
  }
  routeTextureCache.key = key;
  routeTextureCache.canvas = canvas;
  return canvas;
}

function drawTextureOverMap(ctx, deps, texture) {
  if (!texture) return;
  const topLeft = deps.worldToScreen(deps.mapPixelToWorld(-0.5, -0.5));
  const bottomRight = deps.worldToScreen(deps.mapPixelToWorld(deps.splatSize.width - 0.5, deps.splatSize.height - 0.5));
  const x = Math.round(Math.min(topLeft.x, bottomRight.x));
  const y = Math.round(Math.min(topLeft.y, bottomRight.y));
  const width = Math.round(Math.abs(bottomRight.x - topLeft.x));
  const height = Math.round(Math.abs(bottomRight.y - topLeft.y));
  if (width <= 0 || height <= 0) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(texture, x, y, width, height);
  ctx.restore();
}

function heatColor(value) {
  const v = Math.max(0, Math.min(1, Number(value) || 0));
  if (v < 0.5) {
    const t = v / 0.5;
    return {
      r: Math.round(35 + 40 * t),
      g: Math.round(70 + 185 * t),
      b: Math.round(210 - 130 * t),
    };
  }
  const t = (v - 0.5) / 0.5;
  return {
    r: Math.round(75 + 180 * t),
    g: Math.round(255 - 70 * t),
    b: Math.round(80 - 45 * t),
  };
}

function renderDebugOverlayTexture(debugOverlay, version) {
  if (!debugOverlay || !debugOverlay.values) return null;
  const width = Math.max(1, Math.round(Number(debugOverlay.width) || 1));
  const height = Math.max(1, Math.round(Number(debugOverlay.height) || 1));
  const mode = debugOverlay.mode || "none";
  const key = [version, mode, width, height].join(":");
  if (debugTextureCache.canvas && debugTextureCache.key === key) return debugTextureCache.canvas;
  const canvas = debugTextureCache.canvas || createCanvas(width, height);
  if (!canvas) return null;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(width, height);
  const values = debugOverlay.values;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  const normalizedUnitMode = mode === "knowledge";
  if (!normalizedUnitMode) {
    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];
      if (!Number.isFinite(value)) continue;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  const range = Number.isFinite(min) && Number.isFinite(max) && max > min ? max - min : 1;
  for (let i = 0; i < width * height; i += 1) {
    const offset = i * 4;
    const value = values[i];
    if (!Number.isFinite(value)) {
      image.data[offset] = 0;
      image.data[offset + 1] = 0;
      image.data[offset + 2] = 0;
      image.data[offset + 3] = normalizedUnitMode ? 0 : 130;
      continue;
    }
    if (normalizedUnitMode) {
      const known = Math.max(0, Math.min(1, value));
      image.data[offset] = Math.round(240 * (1 - known));
      image.data[offset + 1] = Math.round(70 + 180 * known);
      image.data[offset + 2] = Math.round(30 + 60 * known);
      image.data[offset + 3] = 145;
      continue;
    }
    const normalized = Math.max(0, Math.min(1, (value - min) / range));
    const color = heatColor(1 - normalized);
    image.data[offset] = color.r;
    image.data[offset + 1] = color.g;
    image.data[offset + 2] = color.b;
    image.data[offset + 3] = 150;
  }
  ctx.putImageData(image, 0, 0);
  debugTextureCache.key = key;
  debugTextureCache.canvas = canvas;
  return canvas;
}

function markerIndexes(length, spacing) {
  if (length < 2) return [];
  const step = Math.max(1, Math.round(Number(spacing) || 1));
  const indexes = [];
  for (let i = step; i < length - 1; i += step) indexes.push(i);
  if (indexes.length === 0) indexes.push(Math.floor(length / 2));
  return indexes;
}

export function drawRoutePlanningOverlay(deps) {
  const snapshot = deps.snapshot;
  if (!snapshot) return;
  const settings = snapshot.settings || {};
  const previewPointRadius = finitePositive(settings.previewPointRadius, 1);
  if (snapshot.active && snapshot.debugOverlay) {
    drawTextureOverMap(deps.ctx, deps, renderDebugOverlayTexture(snapshot.debugOverlay, snapshot.version));
  }
  if (deps.drawFinalTexture !== false && snapshot.showFinalOverlay === true) {
    const texture = renderCommittedRouteTexture(snapshot, deps, settings, ROUTE_TEXTURE_SIZE);
    drawTextureOverMap(deps.ctx, deps, texture);
  }

  if (deps.drawPlanning !== true || !snapshot.active) return;
  const segments = Array.isArray(snapshot.segments) ? snapshot.segments : [];
  for (const segment of segments) {
    const selected = segment && segment.id === snapshot.selectedSegmentId;
    if (selected) {
      drawMapSegmentHighlight(deps.ctx, deps, segment, rgba(settings.arrowColor, 0.95));
    }
    if (segment && segment.source) {
      const selectedSource = samePixel(segment.source, snapshot.selectedWaypoint);
      drawMapCircle(deps.ctx, deps, segment.source, {
        radius: selected || selectedSource ? 7 : 5,
        lineWidth: selected || selectedSource ? 2.5 : 1.5,
        strokeStyle: selected || selectedSource ? "#fff1b0" : rgba(settings.arrowColor, 0.9),
        fillStyle: "rgba(0, 0, 0, 0.22)",
      });
    }
    if (segment && segment.destination) {
      const selectedDestination = samePixel(segment.destination, snapshot.selectedWaypoint);
      drawMapCircle(deps.ctx, deps, segment.destination, {
        radius: selected || selectedDestination ? 7 : 5,
        lineWidth: selected || selectedDestination ? 2.5 : 1.5,
        strokeStyle: selected || selectedDestination ? "#fff1b0" : rgba(settings.arrowColor, 0.9),
        fillStyle: "rgba(0, 0, 0, 0.22)",
      });
    }
  }

  if (snapshot.active && Array.isArray(snapshot.hoverPathPixels) && snapshot.hoverPathPixels.length > 0) {
    const color = rgba(settings.arrowColor, settings.previewOpacity);
    for (const pixel of snapshot.hoverPathPixels) {
      drawMapDot(deps.ctx, deps, pixel, color, previewPointRadius);
    }
  }
}
