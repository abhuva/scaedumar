export function createFogSystem(deps) {
  function finite(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  return {
    update() {
      let fogMinAlpha = deps.clamp(finite(deps.fogMinAlphaInput.value, 0.06), 0, 1);
      let fogMaxAlpha = deps.clamp(finite(deps.fogMaxAlphaInput.value, 0.55), 0, 1);
      const fogFalloff = deps.clamp(finite(deps.fogFalloffInput.value, 1.2), 0.2, 4);
      const fogStartOffset = deps.clamp(finite(deps.fogStartOffsetInput.value, 0), 0, 1);
      if (fogMinAlpha > fogMaxAlpha) {
        const swap = fogMinAlpha;
        fogMinAlpha = fogMaxAlpha;
        fogMaxAlpha = swap;
      }
      const value = {
        useFog: deps.fogToggle.checked,
        fogMinAlpha,
        fogMaxAlpha,
        fogFalloff,
        fogStartOffset,
      };
      deps.setFogState(value);
      if (typeof deps.updateStoreFog === "function") {
        deps.updateStoreFog(value);
      }
    },
  };
}
