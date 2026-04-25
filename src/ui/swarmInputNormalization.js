export function createSwarmInputNormalization(deps) {
  function normalizeSwarmHeightRangeInputs(changed = "min") {
    let minHeight = Math.round(deps.clamp(Number(deps.swarmMinHeightInput.value), 0, deps.swarmHeightMax));
    let maxHeight = Math.round(deps.clamp(Number(deps.swarmMaxHeightInput.value), 0, deps.swarmHeightMax));
    if (minHeight > maxHeight) {
      if (changed === "min") {
        maxHeight = minHeight;
      } else {
        minHeight = maxHeight;
      }
    }
    deps.swarmMinHeightInput.value = String(minHeight);
    deps.swarmMaxHeightInput.value = String(maxHeight);
    return { minHeight, maxHeight };
  }

  function normalizeSwarmFollowZoomInputs(changed = "out") {
    let zoomOut = deps.clamp(Number(deps.swarmFollowZoomOutInput.value), deps.zoomMin, deps.zoomMax);
    let zoomIn = deps.clamp(Number(deps.swarmFollowZoomInInput.value), deps.zoomMin, deps.zoomMax);
    if (zoomOut > zoomIn) {
      if (changed === "out") {
        zoomIn = zoomOut;
      } else {
        zoomOut = zoomIn;
      }
    }
    deps.swarmFollowZoomOutInput.value = zoomOut.toFixed(1);
    deps.swarmFollowZoomInInput.value = zoomIn.toFixed(1);
    return { zoomOut, zoomIn };
  }

  return {
    normalizeSwarmHeightRangeInputs,
    normalizeSwarmFollowZoomInputs,
  };
}
