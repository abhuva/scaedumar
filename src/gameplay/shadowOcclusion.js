export function createShadowOcclusion(deps) {
  function computeSwarmDirectionalShadow(mapX, mapY, sourceHeight, lightDir, blockedShadowFactor) {
    const lx = Number(lightDir[0]) || 0;
    const ly = Number(lightDir[1]) || 0;
    const lz = Number(lightDir[2]) || 0;
    if (lz <= 0.01) return 0;
    const dirLen = Math.hypot(lx, ly);
    if (dirLen < 0.0001) return 1;

    const stepPixels = 1.5;
    const maxSteps = 120;
    const slope = lz / Math.max(dirLen, 0.0001);
    const stepX = (lx / dirLen) * stepPixels;
    const stepY = (ly / dirLen) * stepPixels;
    const heightBias = 0.7;
    let rayX = mapX;
    let rayY = mapY;
    let traveledPixels = 0;
    const splatSize = deps.getSplatSize();
    for (let i = 0; i < maxSteps; i++) {
      rayX += stepX;
      rayY += stepY;
      traveledPixels += stepPixels;
      if (rayX <= 0 || rayY <= 0 || rayX >= splatSize.width - 1 || rayY >= splatSize.height - 1) {
        break;
      }
      const terrainH = deps.sampleHeightAtMapCoord(rayX, rayY) * deps.swarmZMax;
      const rayH = sourceHeight + slope * traveledPixels;
      if (terrainH > rayH + heightBias) {
        return blockedShadowFactor;
      }
    }
    return 1;
  }

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
    computeSwarmDirectionalShadow,
    hasLineOfSightToLight,
  };
}
