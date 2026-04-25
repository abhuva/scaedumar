export function createFogSystem(deps) {
  function finite(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  return {
    update(_, state) {
      const knobs = state && state.simulation && state.simulation.knobs ? state.simulation.knobs : {};
      const input = knobs && knobs.fog ? knobs.fog : {};
      let fogMinAlpha = deps.clamp(finite(input.fogMinAlpha, 0.06), 0, 1);
      let fogMaxAlpha = deps.clamp(finite(input.fogMaxAlpha, 0.55), 0, 1);
      const fogFalloff = deps.clamp(finite(input.fogFalloff, 1.2), 0.2, 4);
      const fogStartOffset = deps.clamp(finite(input.fogStartOffset, 0), 0, 1);
      if (fogMinAlpha > fogMaxAlpha) {
        const swap = fogMinAlpha;
        fogMinAlpha = fogMaxAlpha;
        fogMaxAlpha = swap;
      }
      const value = {
        useFog: Boolean(input.useFog),
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
