export function createPointLightOcclusion(deps) {
  function hasLineOfSightToLight(surfaceX, surfaceY, surfaceH, lightX, lightY, lightH, heightScaleValue) {
    const dx = lightX - surfaceX;
    const dy = lightY - surfaceY;
    const dist = Math.hypot(dx, dy);
    if (dist <= 1.0) return true;

    const stepSize = 1.0;
    const stepCount = Math.max(1, Math.floor(dist / stepSize));
    const invSteps = 1 / stepCount;
    const heightBias = 0.7;

    for (let i = 1; i < stepCount; i++) {
      const t = i * invSteps;
      const sx = surfaceX + dx * t;
      const sy = surfaceY + dy * t;
      const rayHeight = surfaceH + (lightH - surfaceH) * t;
      const terrainH = deps.sampleHeightAtMapPixel(sx, sy) * heightScaleValue;
      if (terrainH > rayHeight + heightBias) {
        return false;
      }
    }
    return true;
  }

  return {
    hasLineOfSightToLight,
  };
}
