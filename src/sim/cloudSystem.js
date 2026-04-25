export function createCloudSystem(deps) {
  let lastSentClouds = null;

  function finite(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function areCloudValuesEqual(a, b) {
    if (!a || !b) return false;
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    for (const key of keys) {
      if (a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  }

  return {
    update(_, state) {
      const knobs = state && state.simulation && state.simulation.knobs ? state.simulation.knobs : {};
      const input = knobs && knobs.clouds ? knobs.clouds : {};
      const value = {
        useClouds: Boolean(input.useClouds),
        cloudCoverage: deps.clamp(finite(input.cloudCoverage, 0.58), 0, 1),
        cloudSoftness: deps.clamp(finite(input.cloudSoftness, 0.12), 0.01, 0.35),
        cloudOpacity: deps.clamp(finite(input.cloudOpacity, 0.35), 0, 1),
        cloudScale: deps.clamp(finite(input.cloudScale, 2.2), 0.5, 8),
        cloudSpeed1: deps.clamp(finite(input.cloudSpeed1, 0.018), -0.3, 0.3),
        cloudSpeed2: deps.clamp(finite(input.cloudSpeed2, -0.012), -0.3, 0.3),
        cloudSunParallax: deps.clamp(finite(input.cloudSunParallax, 0.45), 0, 2),
        cloudUseSunProjection: Boolean(input.cloudUseSunProjection),
      };
      deps.setCloudState(value);
      if (typeof deps.updateStoreClouds === "function") {
        if (areCloudValuesEqual(value, lastSentClouds)) {
          return;
        }
        deps.updateStoreClouds(value);
        lastSentClouds = { ...value };
      }
    },
  };
}
