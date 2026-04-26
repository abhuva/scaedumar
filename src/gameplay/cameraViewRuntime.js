export function createCameraViewRuntime(deps) {
  function getSafeMapSize() {
    const width = Math.max(1, Number(deps.splatSize.width) || 1);
    const height = Math.max(1, Number(deps.splatSize.height) || 1);
    return { width, height };
  }

  function resetCamera() {
    deps.dispatchCoreCommand({ type: "core/camera/reset" });
  }

  function getScreenAspect() {
    return deps.canvas.width > 0 && deps.canvas.height > 0 ? deps.canvas.width / deps.canvas.height : 1;
  }

  function getMapAspect() {
    const size = getSafeMapSize();
    return size.width / size.height;
  }

  return {
    resetCamera,
    getScreenAspect,
    getMapAspect,
  };
}
