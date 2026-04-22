export function updateCoreFrameSnapshot(store, nowMs, deps) {
  store.update((prev) => ({
    ...prev,
    clock: {
      ...prev.clock,
      nowSec: Math.max(0, Number(nowMs) * 0.001),
      timeScale: deps.clamp(Number(deps.cycleSpeedInput.value), 0, 1),
    },
    camera: {
      ...prev.camera,
      panX: deps.panWorld.x,
      panY: deps.panWorld.y,
      zoom: deps.getZoom(),
    },
    map: {
      ...prev.map,
      folderPath: deps.currentMapFolderPath,
      width: deps.splatSize.width,
      height: deps.splatSize.height,
      loaded: Boolean(deps.currentMapFolderPath),
    },
  }));
}
