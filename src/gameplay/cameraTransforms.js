export function getBaseViewHalfExtents(deps) {
  const screenAspect = deps.getScreenAspect();
  const mapAspect = deps.getMapAspect();
  if (screenAspect >= mapAspect) {
    return { x: screenAspect, y: 1 };
  }
  return { x: mapAspect, y: mapAspect / screenAspect };
}

export function getActiveCameraState(deps) {
  const camera = deps.getCameraState() || {};
  const zoomRaw = Number(camera.zoom);
  const zoomValue = Number.isFinite(zoomRaw) && zoomRaw > 0 ? zoomRaw : 1;
  const panX = Number.isFinite(Number(camera.panX)) ? Number(camera.panX) : 0;
  const panY = Number.isFinite(Number(camera.panY)) ? Number(camera.panY) : 0;
  return { zoom: zoomValue, panX, panY };
}

export function getViewHalfExtents(deps) {
  const activeCamera = deps.getActiveCameraState();
  const zoomRaw = Number(deps.zoomValue);
  const resolvedZoom = Number.isFinite(zoomRaw) && zoomRaw > 0 ? zoomRaw : activeCamera.zoom;
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
  const zoomRaw = Number(deps.zoomValue);
  const resolvedZoom = Number.isFinite(zoomRaw) && zoomRaw > 0 ? zoomRaw : activeCamera.zoom;
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
  return {
    x: deps.world.x / deps.getMapAspect() + 0.5,
    y: deps.world.y + 0.5,
  };
}

export function uvToMapPixelIndex(deps) {
  return {
    x: Math.floor(deps.clamp(deps.uv.x, 0, 0.999999) * deps.splatSize.width),
    y: Math.floor((1 - deps.clamp(deps.uv.y, 0, 0.999999)) * deps.splatSize.height),
  };
}

export function mapPixelIndexToUv(deps) {
  return {
    x: (deps.pixelX + 0.5) / deps.splatSize.width,
    y: 1 - (deps.pixelY + 0.5) / deps.splatSize.height,
  };
}

export function mapPixelToWorld(deps) {
  return deps.mapCoordToWorld(deps.pixelX, deps.pixelY);
}

export function mapCoordToWorld(deps) {
  const safeW = Math.max(1, deps.splatSize.width);
  const safeH = Math.max(1, deps.splatSize.height);
  const uvX = (deps.mapX + 0.5) / safeW;
  const uvY = 1 - (deps.mapY + 0.5) / safeH;
  return {
    x: (uvX - 0.5) * deps.getMapAspect(),
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
