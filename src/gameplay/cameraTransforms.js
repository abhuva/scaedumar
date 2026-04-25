function resolvePositiveFinite(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function resolveFinite(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function resolveOptionalZoom(deps, activeZoom) {
  const hasExplicitZoom = deps.zoomValue != null;
  const rawZoom = hasExplicitZoom ? deps.zoomValue : activeZoom;
  return resolvePositiveFinite(rawZoom, 1);
}

export function getBaseViewHalfExtents(deps) {
  const safeScreenAspect = resolvePositiveFinite(deps.getScreenAspect(), 1);
  const safeMapAspect = resolvePositiveFinite(deps.getMapAspect(), 1);
  if (safeScreenAspect >= safeMapAspect) {
    return { x: safeScreenAspect, y: 1 };
  }
  return { x: safeMapAspect, y: safeMapAspect / safeScreenAspect };
}

export function getActiveCameraState(deps) {
  const camera = deps.getCameraState() || {};
  const zoomValue = resolvePositiveFinite(camera.zoom, 1);
  const panX = resolveFinite(camera.panX, 0);
  const panY = resolveFinite(camera.panY, 0);
  return { zoom: zoomValue, panX, panY };
}

export function getViewHalfExtents(deps) {
  const activeCamera = deps.getActiveCameraState();
  const resolvedZoom = resolveOptionalZoom(deps, activeCamera.zoom);
  const base = deps.getBaseViewHalfExtents();
  return {
    x: base.x / resolvedZoom,
    y: base.y / resolvedZoom,
  };
}

export function clientToNdc(deps) {
  const rect = deps.getCanvasRect();
  const x = ((deps.clientX - rect.left) / rect.width) * 2 - 1;
  const y = 1 - ((deps.clientY - rect.top) / rect.height) * 2;
  return { x, y };
}

export function worldFromNdc(deps) {
  const activeCamera = deps.getActiveCameraState();
  const resolvedZoom = resolveOptionalZoom(deps, activeCamera.zoom);
  const resolvedPan = deps.pan
    ? {
        x: resolveFinite(deps.pan.x, activeCamera.panX),
        y: resolveFinite(deps.pan.y, activeCamera.panY),
      }
    : { x: activeCamera.panX, y: activeCamera.panY };
  const ext = deps.getViewHalfExtents(resolvedZoom);
  return {
    x: resolvedPan.x + deps.ndc.x * ext.x,
    y: resolvedPan.y + deps.ndc.y * ext.y,
  };
}

export function worldToUv(deps) {
  const safeMapAspect = resolvePositiveFinite(deps.getMapAspect(), 1);
  return {
    x: deps.world.x / safeMapAspect + 0.5,
    y: deps.world.y + 0.5,
  };
}

export function uvToMapPixelIndex(deps) {
  const safeWidth = Math.max(1, resolvePositiveFinite(deps.splatSize && deps.splatSize.width, 1));
  const safeHeight = Math.max(1, resolvePositiveFinite(deps.splatSize && deps.splatSize.height, 1));
  return {
    x: Math.floor(deps.clamp(deps.uv.x, 0, 0.999999) * safeWidth),
    y: Math.floor((1 - deps.clamp(deps.uv.y, 0, 0.999999)) * safeHeight),
  };
}

export function mapPixelIndexToUv(deps) {
  const safeWidth = Math.max(1, resolvePositiveFinite(deps.splatSize && deps.splatSize.width, 1));
  const safeHeight = Math.max(1, resolvePositiveFinite(deps.splatSize && deps.splatSize.height, 1));
  return {
    x: (deps.pixelX + 0.5) / safeWidth,
    y: 1 - (deps.pixelY + 0.5) / safeHeight,
  };
}

export function mapPixelToWorld(deps) {
  if (typeof deps.mapCoordToWorld === "function") {
    return deps.mapCoordToWorld(deps.pixelX, deps.pixelY);
  }
  const uv = deps.mapPixelIndexToUv(deps.pixelX, deps.pixelY);
  const safeMapAspect = resolvePositiveFinite(deps.getMapAspect(), 1);
  return {
    x: (uv.x - 0.5) * safeMapAspect,
    y: uv.y - 0.5,
  };
}

export function mapCoordToWorld(deps) {
  const safeW = Math.max(1, resolvePositiveFinite(deps.splatSize && deps.splatSize.width, 1));
  const safeH = Math.max(1, resolvePositiveFinite(deps.splatSize && deps.splatSize.height, 1));
  const safeMapAspect = resolvePositiveFinite(deps.getMapAspect(), 1);
  const uvX = (deps.mapX + 0.5) / safeW;
  const uvY = 1 - (deps.mapY + 0.5) / safeH;
  return {
    x: (uvX - 0.5) * safeMapAspect,
    y: uvY - 0.5,
  };
}

export function worldToScreen(deps) {
  const activeCamera = deps.getActiveCameraState();
  const viewHalf = deps.getViewHalfExtents(activeCamera.zoom);
  const ndcX = (deps.world.x - activeCamera.panX) / viewHalf.x;
  const ndcY = (deps.world.y - activeCamera.panY) / viewHalf.y;
  return {
    x: (ndcX * 0.5 + 0.5) * deps.overlayCanvas.width,
    y: (1 - (ndcY * 0.5 + 0.5)) * deps.overlayCanvas.height,
  };
}
