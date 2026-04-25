export function createPointLightBakeSync(deps) {
  function bakePointLightsTextureSync(useReducedResolution = false) {
    const fullBakeSize = deps.getFullBakeSize();
    const fullWidth = fullBakeSize.width;
    const fullHeight = fullBakeSize.height;
    const scale = useReducedResolution ? deps.pointLightBakeLiveScale : 1;
    const w = Math.max(1, Math.round(fullWidth * scale));
    const h = Math.max(1, Math.round(fullHeight * scale));
    const mapScaleX = fullWidth / w;
    const mapScaleY = fullHeight / h;
    const lightingSettings = deps.getLightingSettings();
    const heightScaleValue = Math.max(1, Number(lightingSettings.heightScale) || 1);
    const pixelCount = w * h;
    const rgba = new Uint8ClampedArray(pixelCount * 4);
    const accumColor = new Float32Array(pixelCount * 3);
    const accumWeight = new Float32Array(pixelCount);
    const accumFlicker = new Float32Array(pixelCount);
    const accumFlickerSpeed = new Float32Array(pixelCount);

    const pointLights = deps.getLights();
    if (pointLights.length > 0) {
      for (const light of pointLights) {
        const radiusMapPx = Math.max(1, Number(light.strength) || 1);
        const intensityMul = deps.clamp(Number(light.intensity), 0, 4);
        const flickerRaw = Number(light.flicker);
        const flickerMul = deps.clamp(
          Number.isFinite(flickerRaw) ? flickerRaw : deps.defaultPointLightFlicker,
          0,
          1,
        );
        const flickerSpeedRaw = Number(light.flickerSpeed);
        const flickerSpeedMul = deps.clamp(
          Number.isFinite(flickerSpeedRaw) ? flickerSpeedRaw : deps.defaultPointLightFlickerSpeed,
          0,
          1,
        );
        if (intensityMul <= 0.0001) continue;
        const lightTerrainHeight = deps.sampleHeightAtMapPixel(light.pixelX, light.pixelY) * heightScaleValue;
        const lightHeight = lightTerrainHeight + (Number(light.heightOffset) || 0);
        const minX = Math.max(0, Math.floor((light.pixelX - radiusMapPx) / mapScaleX));
        const maxX = Math.min(w - 1, Math.ceil((light.pixelX + radiusMapPx) / mapScaleX));
        const minY = Math.max(0, Math.floor((light.pixelY - radiusMapPx) / mapScaleY));
        const maxY = Math.min(h - 1, Math.ceil((light.pixelY + radiusMapPx) / mapScaleY));
        const radiusSq = radiusMapPx * radiusMapPx;

        for (let y = minY; y <= maxY; y++) {
          const mapY = (y + 0.5) * mapScaleY - 0.5;
          const dy = light.pixelY - mapY;
          for (let x = minX; x <= maxX; x++) {
            const mapX = (x + 0.5) * mapScaleX - 0.5;
            const dx = light.pixelX - mapX;
            const distSq = dx * dx + dy * dy;
            if (distSq > radiusSq) continue;
            const falloff = Math.max(0, 1 - Math.sqrt(distSq) / radiusMapPx);
            if (falloff <= 0) continue;
            const surfaceHeight = deps.sampleHeightAtMapPixel(mapX, mapY) * heightScaleValue;
            if (!deps.hasLineOfSightToLight(mapX, mapY, surfaceHeight, light.pixelX, light.pixelY, lightHeight, heightScaleValue)) {
              continue;
            }
            const normal = deps.sampleNormalAtMapPixel(mapX, mapY);
            const toLight = deps.normalize3(dx, dy, lightHeight - surfaceHeight);
            const ndotl = Math.max(0, normal[0] * toLight[0] + normal[1] * toLight[1] + normal[2] * toLight[2]);
            const contribution = falloff * ndotl * intensityMul;
            if (contribution <= 0) continue;
            const pixelIdx = y * w + x;
            const baseIdx = pixelIdx * 3;
            accumWeight[pixelIdx] += contribution;
            accumFlicker[pixelIdx] += contribution * flickerMul;
            accumFlickerSpeed[pixelIdx] += contribution * flickerSpeedMul;
            accumColor[baseIdx] += light.color[0] * contribution;
            accumColor[baseIdx + 1] += light.color[1] * contribution;
            accumColor[baseIdx + 2] += light.color[2] * contribution;
          }
        }
      }
    }

    for (let pixelIdx = 0, j = 0; pixelIdx < accumWeight.length; pixelIdx++, j += 4) {
      const weight = accumWeight[pixelIdx];
      if (weight <= 0.000001) continue;
      const baseIdx = pixelIdx * 3;
      const intensityR = 1 - Math.exp(-accumColor[baseIdx] * deps.pointLightBlendExposure);
      const intensityG = 1 - Math.exp(-accumColor[baseIdx + 1] * deps.pointLightBlendExposure);
      const intensityB = 1 - Math.exp(-accumColor[baseIdx + 2] * deps.pointLightBlendExposure);
      rgba[j] = Math.round(deps.clamp(accumColor[baseIdx] * intensityR, 0, 1) * 255);
      rgba[j + 1] = Math.round(deps.clamp(accumColor[baseIdx + 1] * intensityG, 0, 1) * 255);
      rgba[j + 2] = Math.round(deps.clamp(accumColor[baseIdx + 2] * intensityB, 0, 1) * 255);
      const flickerAvg = deps.clamp(accumFlicker[pixelIdx] / weight, 0, 1);
      const flickerSpeedAvg = deps.clamp(accumFlickerSpeed[pixelIdx] / weight, 0, 1);
      const flickerNibble = Math.round(flickerAvg * 15);
      const flickerSpeedNibble = Math.round(flickerSpeedAvg * 15);
      rgba[j + 3] = flickerNibble * 16 + flickerSpeedNibble;
    }

    deps.applyPointLightBakeRgba(rgba, w, h);
  }

  return {
    bakePointLightsTextureSync,
  };
}
