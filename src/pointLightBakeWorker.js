let cachedMapData = null;

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function normalize3(x, y, z) {
  const len = Math.hypot(x, y, z);
  if (len < 0.000001) return [0, 0, 1];
  return [x / len, y / len, z / len];
}

function mapPixelToTexIndex(pixel, mapSize, texSize) {
  return clamp(Math.round(((pixel + 0.5) / mapSize) * texSize - 0.5), 0, texSize - 1);
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "setMapData") {
    cachedMapData = {
      splatWidth: Math.max(1, Math.floor(Number(data.splatWidth) || 1)),
      splatHeight: Math.max(1, Math.floor(Number(data.splatHeight) || 1)),
      normalsWidth: Math.max(1, Math.floor(Number(data.normalsWidth) || 1)),
      normalsHeight: Math.max(1, Math.floor(Number(data.normalsHeight) || 1)),
      heightWidth: Math.max(1, Math.floor(Number(data.heightWidth) || 1)),
      heightHeight: Math.max(1, Math.floor(Number(data.heightHeight) || 1)),
      normalsData: data.normalsData instanceof Uint8ClampedArray ? data.normalsData : new Uint8ClampedArray(data.normalsData || 0),
      heightData: data.heightData instanceof Uint8ClampedArray ? data.heightData : new Uint8ClampedArray(data.heightData || 0),
    };
    return;
  }

  if (data.type !== "bake") {
    return;
  }

  const {
    requestId,
    bakeWidth,
    bakeHeight,
    lights,
    heightScaleValue,
    blendExposure,
  } = data;

  try {
    if (!cachedMapData) {
      throw new Error("Map data not initialized in point-light worker.");
    }
    const w = Math.max(1, Math.floor(Number(bakeWidth) || 1));
    const h = Math.max(1, Math.floor(Number(bakeHeight) || 1));
    const mapW = cachedMapData.splatWidth;
    const mapH = cachedMapData.splatHeight;
    const nW = cachedMapData.normalsWidth;
    const nH = cachedMapData.normalsHeight;
    const hW = cachedMapData.heightWidth;
    const hH = cachedMapData.heightHeight;
    const mapScaleX = mapW / w;
    const mapScaleY = mapH / h;
    const heightScale = Math.max(1, Number(heightScaleValue) || 1);
    const exposure = Number.isFinite(Number(blendExposure)) ? Number(blendExposure) : 0.65;

    const rgba = new Uint8ClampedArray(w * h * 4);
    const accumColor = new Float32Array(w * h * 3);
    const accumWeight = new Float32Array(w * h);
    const accumFlicker = new Float32Array(w * h);
    const accumFlickerSpeed = new Float32Array(w * h);

    const safeLights = Array.isArray(lights) ? lights : [];
    const normals = cachedMapData.normalsData;
    const heights = cachedMapData.heightData;

    function sampleHeightAtMapPixel(pixelX, pixelY) {
      if (!heights.length) return 0;
      const hx = mapPixelToTexIndex(pixelX, mapW, hW);
      const hy = mapPixelToTexIndex(pixelY, mapH, hH);
      const idx = (hy * hW + hx) * 4;
      return heights[idx] / 255;
    }

    function sampleNormalAtMapPixel(pixelX, pixelY) {
      if (!normals.length) return [0, 0, 1];
      const nx = mapPixelToTexIndex(pixelX, mapW, nW);
      const ny = mapPixelToTexIndex(pixelY, mapH, nH);
      const idx = (ny * nW + nx) * 4;
      const vx = (normals[idx] / 255) * 2 - 1;
      const vy = (normals[idx + 1] / 255) * 2 - 1;
      const vz = (normals[idx + 2] / 255) * 2 - 1;
      return normalize3(vx, vy, vz);
    }

    function hasLineOfSightToLight(surfaceX, surfaceY, surfaceH, lightX, lightY, lightH) {
      const dx = lightX - surfaceX;
      const dy = lightY - surfaceY;
      const dist = Math.hypot(dx, dy);
      if (dist <= 1.0) return true;
      const stepCount = Math.max(1, Math.floor(dist));
      const invSteps = 1 / stepCount;
      const heightBias = 0.7;
      for (let i = 1; i < stepCount; i++) {
        const t = i * invSteps;
        const sx = surfaceX + dx * t;
        const sy = surfaceY + dy * t;
        const rayH = surfaceH + (lightH - surfaceH) * t;
        const terrainH = sampleHeightAtMapPixel(sx, sy) * heightScale;
        if (terrainH > rayH + heightBias) {
          return false;
        }
      }
      return true;
    }

    for (const light of safeLights) {
      const lightX = Number(light.pixelX);
      const lightY = Number(light.pixelY);
      const radiusMapPx = Math.max(1, Number(light.strength) || 1);
      const intensityMul = clamp(Number(light.intensity), 0, 4);
      const flickerRaw = Number(light.flicker);
      const flickerMul = clamp(Number.isFinite(flickerRaw) ? flickerRaw : 0.7, 0, 1);
      const flickerSpeedRaw = Number(light.flickerSpeed);
      const flickerSpeedMul = clamp(Number.isFinite(flickerSpeedRaw) ? flickerSpeedRaw : 0.5, 0, 1);
      if (!Number.isFinite(lightX) || !Number.isFinite(lightY) || intensityMul <= 0.0001) continue;

      const lightTerrainHeight = sampleHeightAtMapPixel(lightX, lightY) * heightScale;
      const lightHeight = lightTerrainHeight + (Number(light.heightOffset) || 0);
      const minX = clamp(Math.floor((lightX - radiusMapPx) / mapScaleX), 0, w - 1);
      const maxX = clamp(Math.ceil((lightX + radiusMapPx) / mapScaleX), 0, w - 1);
      const minY = clamp(Math.floor((lightY - radiusMapPx) / mapScaleY), 0, h - 1);
      const maxY = clamp(Math.ceil((lightY + radiusMapPx) / mapScaleY), 0, h - 1);
      const radiusSq = radiusMapPx * radiusMapPx;

      const color = Array.isArray(light.color) ? light.color : [1, 1, 1];
      const colorR = clamp(Number(color[0]) || 0, 0, 1);
      const colorG = clamp(Number(color[1]) || 0, 0, 1);
      const colorB = clamp(Number(color[2]) || 0, 0, 1);
      for (let y = minY; y <= maxY; y++) {
        const mapY = (y + 0.5) * mapScaleY - 0.5;
        const dy = lightY - mapY;
        for (let x = minX; x <= maxX; x++) {
          const mapX = (x + 0.5) * mapScaleX - 0.5;
          const dx = lightX - mapX;
          const distSq = dx * dx + dy * dy;
          if (distSq > radiusSq) continue;

          const falloff = Math.max(0, 1 - Math.sqrt(distSq) / radiusMapPx);
          if (falloff <= 0) continue;
          const surfaceHeight = sampleHeightAtMapPixel(mapX, mapY) * heightScale;
          if (!hasLineOfSightToLight(mapX, mapY, surfaceHeight, lightX, lightY, lightHeight)) continue;
          const normal = sampleNormalAtMapPixel(mapX, mapY);
          const toLight = normalize3(dx, dy, lightHeight - surfaceHeight);
          const ndotl = Math.max(0, normal[0] * toLight[0] + normal[1] * toLight[1] + normal[2] * toLight[2]);
          const contribution = falloff * ndotl * intensityMul;
          if (contribution <= 0) continue;

          const pixelIdx = y * w + x;
          const baseIdx = pixelIdx * 3;
          accumWeight[pixelIdx] += contribution;
          accumFlicker[pixelIdx] += contribution * flickerMul;
          accumFlickerSpeed[pixelIdx] += contribution * flickerSpeedMul;
          accumColor[baseIdx] += colorR * contribution;
          accumColor[baseIdx + 1] += colorG * contribution;
          accumColor[baseIdx + 2] += colorB * contribution;
        }
      }
    }

    for (let pixelIdx = 0, j = 0; pixelIdx < accumWeight.length; pixelIdx++, j += 4) {
      const weight = accumWeight[pixelIdx];
      if (weight <= 0.000001) continue;
      const baseIdx = pixelIdx * 3;
      const intensityR = 1 - Math.exp(-accumColor[baseIdx] * exposure);
      const intensityG = 1 - Math.exp(-accumColor[baseIdx + 1] * exposure);
      const intensityB = 1 - Math.exp(-accumColor[baseIdx + 2] * exposure);
      rgba[j] = Math.round(clamp(accumColor[baseIdx] * intensityR, 0, 1) * 255);
      rgba[j + 1] = Math.round(clamp(accumColor[baseIdx + 1] * intensityG, 0, 1) * 255);
      rgba[j + 2] = Math.round(clamp(accumColor[baseIdx + 2] * intensityB, 0, 1) * 255);
      const flickerAvg = clamp(accumFlicker[pixelIdx] / weight, 0, 1);
      const flickerSpeedAvg = clamp(accumFlickerSpeed[pixelIdx] / weight, 0, 1);
      const flickerNibble = Math.round(flickerAvg * 15);
      const flickerSpeedNibble = Math.round(flickerSpeedAvg * 15);
      rgba[j + 3] = flickerNibble * 16 + flickerSpeedNibble;
    }

    self.postMessage({ requestId, width: w, height: h, rgbaBuffer: rgba.buffer }, [rgba.buffer]);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ requestId, error: message });
  }
});
