export function buildFlowMapImageDataFromHeight(imageData, sourceWidth, sourceHeight, settings, clamp) {
  const lowWidth = Math.max(64, Math.min(512, Math.round(sourceWidth / 2)));
  const lowHeight = Math.max(64, Math.min(512, Math.round(sourceHeight / 2)));
  const lowHeights = new Float32Array(lowWidth * lowHeight);
  const src = imageData.data;

  for (let y = 0; y < lowHeight; y++) {
    const srcY = clamp(Math.round(((y + 0.5) / lowHeight) * sourceHeight - 0.5), 0, sourceHeight - 1);
    for (let x = 0; x < lowWidth; x++) {
      const srcX = clamp(Math.round(((x + 0.5) / lowWidth) * sourceWidth - 0.5), 0, sourceWidth - 1);
      const idx = (srcY * sourceWidth + srcX) * 4;
      lowHeights[y * lowWidth + x] = src[idx] / 255;
    }
  }

  const sampleLow = (x, y) => {
    const xi = clamp(Math.round(x), 0, lowWidth - 1);
    const yi = clamp(Math.round(y), 0, lowHeight - 1);
    return lowHeights[yi * lowWidth + xi];
  };

  const pairs = [
    { r: Math.round(clamp(Number(settings.radius1), 1, 40)), w: clamp(Number(settings.weight1), 0, 1) },
    { r: Math.round(clamp(Number(settings.radius2), 1, 40)), w: clamp(Number(settings.weight2), 0, 1) },
    { r: Math.round(clamp(Number(settings.radius3), 1, 40)), w: clamp(Number(settings.weight3), 0, 1) },
  ].sort((a, b) => a.r - b.r);
  const weightSum = Math.max(0.0001, pairs[0].w + pairs[1].w + pairs[2].w);
  const gradX = new Float32Array(lowWidth * lowHeight);
  const gradY = new Float32Array(lowWidth * lowHeight);
  let maxMag = 0;

  for (let y = 0; y < lowHeight; y++) {
    for (let x = 0; x < lowWidth; x++) {
      let gx = 0;
      let gy = 0;
      for (let i = 0; i < pairs.length; i++) {
        const r = pairs[i].r;
        const w = pairs[i].w / weightSum;
        gx += (sampleLow(x + r, y) - sampleLow(x - r, y)) * w;
        gy += (sampleLow(x, y + r) - sampleLow(x, y - r)) * w;
      }
      const idx = y * lowWidth + x;
      gradX[idx] = gx;
      gradY[idx] = gy;
      const mag = Math.hypot(gx, gy);
      if (mag > maxMag) {
        maxMag = mag;
      }
    }
  }

  const out = new Uint8Array(lowWidth * lowHeight * 4);
  const invMax = maxMag > 1e-6 ? 1 / maxMag : 0;
  for (let y = 0; y < lowHeight; y++) {
    for (let x = 0; x < lowWidth; x++) {
      const idx = y * lowWidth + x;
      const gx = gradX[idx];
      const gy = gradY[idx];
      const downhillX = -gx;
      const downhillY = -gy;
      const len = Math.hypot(downhillX, downhillY);
      let dirX = 0;
      let dirY = 0;
      if (len > 1e-6) {
        dirX = downhillX / len;
        dirY = downhillY / len;
      }
      const magNorm = Math.pow(clamp(len * invMax, 0, 1), 0.75);
      const outIdx = idx * 4;
      out[outIdx + 0] = Math.round((dirX * 0.5 + 0.5) * 255);
      out[outIdx + 1] = Math.round((dirY * 0.5 + 0.5) * 255);
      out[outIdx + 2] = Math.round(magNorm * 255);
      out[outIdx + 3] = 255;
    }
  }

  return { width: lowWidth, height: lowHeight, data: out };
}

export function rebuildFlowMapTexture(opts) {
  if (!opts.heightImageData) return;
  const flowMap = buildFlowMapImageDataFromHeight(
    opts.heightImageData,
    opts.heightSize.width,
    opts.heightSize.height,
    opts.settings,
    opts.clamp,
  );
  opts.gl.bindTexture(opts.gl.TEXTURE_2D, opts.flowMapTex);
  opts.gl.texImage2D(
    opts.gl.TEXTURE_2D,
    0,
    opts.gl.RGBA,
    flowMap.width,
    flowMap.height,
    0,
    opts.gl.RGBA,
    opts.gl.UNSIGNED_BYTE,
    flowMap.data,
  );
}
