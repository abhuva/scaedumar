export function createSwarmInputNormalization(deps) {
  /**
   * Normalizes min/max swarm height inputs.
   * `changed` accepts "min" or "max" (aliases "out"/"in" are treated as neither here).
   * Any other value (null/undefined/typos like "both") uses the default branch and unifies by Math.max.
   */
  function normalizeSwarmHeightRangeInputs(changed = "min", values = null) {
    const sourceMin = values && values.minHeight != null ? values.minHeight : deps.swarmMinHeightInput.value;
    const sourceMax = values && values.maxHeight != null ? values.maxHeight : deps.swarmMaxHeightInput.value;
    let minHeight = Math.round(deps.clamp(Number(sourceMin), 0, deps.swarmHeightMax));
    let maxHeight = Math.round(deps.clamp(Number(sourceMax), 0, deps.swarmHeightMax));
    if (minHeight > maxHeight) {
      if (changed === "min") {
        maxHeight = minHeight;
      } else if (changed === "max") {
        minHeight = maxHeight;
      } else {
        const unified = Math.max(minHeight, maxHeight);
        minHeight = unified;
        maxHeight = unified;
      }
    }
    deps.swarmMinHeightInput.value = String(minHeight);
    deps.swarmMaxHeightInput.value = String(maxHeight);
    return { minHeight, maxHeight };
  }

  /**
   * Normalizes paired follow zoom inputs.
   * `changed` accepts "out" or "in" (aliases "min"/"max" are treated as neither here).
   * Any other value (null/undefined/typos like "both") uses the default branch and unifies by Math.max.
   */
  function normalizeSwarmFollowZoomInputs(changed = "out", values = null) {
    const sourceZoomOut = values && values.zoomOut != null ? values.zoomOut : deps.swarmFollowZoomOutInput.value;
    const sourceZoomIn = values && values.zoomIn != null ? values.zoomIn : deps.swarmFollowZoomInInput.value;
    let zoomOut = deps.clamp(Number(sourceZoomOut), deps.zoomMin, deps.zoomMax);
    let zoomIn = deps.clamp(Number(sourceZoomIn), deps.zoomMin, deps.zoomMax);
    if (zoomOut > zoomIn) {
      if (changed === "out") {
        zoomIn = zoomOut;
      } else if (changed === "in") {
        zoomOut = zoomIn;
      } else {
        const unified = Math.max(zoomOut, zoomIn);
        zoomOut = unified;
        zoomIn = unified;
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
