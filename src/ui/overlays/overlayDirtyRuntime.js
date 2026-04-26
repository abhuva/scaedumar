export function createOverlayDirtyRuntime(initialDirty = true) {
  let overlayDirty = Boolean(initialDirty);

  function requestOverlayDraw() {
    overlayDirty = true;
  }

  function isOverlayDirty() {
    return overlayDirty;
  }

  function clearOverlayDirty() {
    overlayDirty = false;
  }

  return {
    requestOverlayDraw,
    isOverlayDirty,
    clearOverlayDirty,
  };
}
