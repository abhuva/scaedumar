export function createCloudSystem(deps) {
  let lastSentClouds = null;

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
    update() {
      const value = {
        useClouds: deps.cloudToggle.checked,
        cloudCoverage: deps.clamp(Number(deps.cloudCoverageInput.value), 0, 1),
        cloudSoftness: deps.clamp(Number(deps.cloudSoftnessInput.value), 0.01, 0.35),
        cloudOpacity: deps.clamp(Number(deps.cloudOpacityInput.value), 0, 1),
        cloudScale: deps.clamp(Number(deps.cloudScaleInput.value), 0.5, 8),
        cloudSpeed1: deps.clamp(Number(deps.cloudSpeed1Input.value), -0.3, 0.3),
        cloudSpeed2: deps.clamp(Number(deps.cloudSpeed2Input.value), -0.3, 0.3),
        cloudSunParallax: deps.clamp(Number(deps.cloudSunParallaxInput.value), 0, 2),
        cloudUseSunProjection: deps.cloudSunProjectToggle.checked,
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
