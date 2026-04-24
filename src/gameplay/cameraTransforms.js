export function getBaseViewHalfExtents(deps) {
  const screenAspect = deps.getScreenAspect();
  const mapAspect = deps.getMapAspect();
  const safeScreenAspect = Number.isFinite(Number(screenAspect)) && Number(screenAspect) > 0 ? Number(screenAspect) : 1;
  const safeMapAspect = Number.isFinite(Number(mapAspect)) && Number(mapAspect) > 0 ? Number(mapAspect) : 1;
  if (safeScreenAspect >= safeMapAspect) {
    return { x: safeScreenAspect, y: 1 };
  }
  return { x: safeMapAspect, y: safeMapAspect / safeScreenAspect };
}

export function getActiveCameraState(deps) {
  const camera = deps.getCameraState() || {};
  const rawZoom = Number(camera.zoom);
  const zoomValue = Number.isFinite(rawZoom) && rawZoom > 0.000001 ? rawZoom : 1;
  const panX = Number.isFinite(Number(camera.panX)) ? Number(camera.panX) : 0;
  const panY = Number.isFinite(Number(camera.panY)) ? Number(camera.panY) : 0;
  return { zoom: zoomValue, panX, panY };
}

export function getViewHalfExtents(deps) {
  const activeCamera = deps.getActiveCameraState();
  const hasExplicitZoom = deps.zoomValue != null && Number.isFinite(Number(deps.zoomValue));
  const rawZoom = hasExplicitZoom ? Number(deps.zoomValue) : activeCamera.zoom;
  const resolvedZoom = rawZoom > 0.000001 ? rawZoom : 1;
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
  const hasExplicitZoom = deps.zoomValue != null && Number.isFinite(Number(deps.zoomValue));
  const rawZoom = hasExplicitZoom ? Number(deps.zoomValue) : activeCamera.zoom;
  const resolvedZoom = rawZoom > 0.000001 ? rawZoom : 1;
  const resolvedPan = deps.pan && Number.isFinite(Number(deps.pan.x)) && Number.isFinite(Number(deps.pan.y))
    ? deps.pan
    : { x: activeCamera.panX, y: activeCamera.panY };
  const ext = deps.getViewHalfExtents(resolvedZoom);
  return {
    x: resolvedPan.x + deps.ndc.x * ext.x,
    y: resolvedPan.y + deps.ndc.y * ext.y,
  };
}

export function worldToUv(deps) {
  const mapAspect = deps.getMapAspect();
  const safeMapAspect = Number.isFinite(Number(mapAspect)) && Number(mapAspect) > 0 ? Number(mapAspect) : 1;
  return {
    x: deps.world.x / safeMapAspect + 0.5,
    y: deps.world.y + 0.5,
  };
}

export function uvToMapPixelIndex(deps) {
  const safeWidth = Math.max(1, Number(deps.splatSize.width) || 1);
  const safeHeight = Math.max(1, Number(deps.splatSize.height) || 1);
  return {
    x: Math.floor(deps.clamp(deps.uv.x, 0, 0.999999) * safeWidth),
    y: Math.floor((1 - deps.clamp(deps.uv.y, 0, 0.999999)) * safeHeight),
  };
}

export function mapPixelIndexToUv(deps) {
  const safeWidth = Math.max(1, Number(deps.splatSize.width) || 1);
  const safeHeight = Math.max(1, Number(deps.splatSize.height) || 1);
  return {
    x: (deps.pixelX + 0.5) / safeWidth,
    y: 1 - (deps.pixelY + 0.5) / safeHeight,
  };
}

export function mapPixelToWorld(deps) {
  const uv = deps.mapPixelIndexToUv(deps.pixelX, deps.pixelY);
  const mapAspect = deps.getMapAspect();
  const safeMapAspect = Number.isFinite(Number(mapAspect)) && Number(mapAspect) > 0 ? Number(mapAspect) : 1;
  return {
    x: (uv.x - 0.5) * safeMapAspect,
    y: uv.y - 0.5,
  };
}

export function mapCoordToWorld(deps) {
  const safeW = Math.max(1, deps.splatSize.width);
  const safeH = Math.max(1, deps.splatSize.height);
  const mapAspect = deps.getMapAspect();
  const safeMapAspect = Number.isFinite(Number(mapAspect)) && Number(mapAspect) > 0 ? Number(mapAspect) : 1;
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
