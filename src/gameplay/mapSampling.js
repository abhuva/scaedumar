export function createMapSampling(deps) {
  function normalize3(x, y, z) {
    const len = Math.hypot(x, y, z);
    if (len < 0.000001) return [0, 0, 1];
    return [x / len, y / len, z / len];
  }

  function sampleNormalAtMapPixel(pixelX, pixelY) {
    const normalsImageData = deps.getNormalsImageData();
    if (!normalsImageData || !normalsImageData.data) {
      return [0, 0, 1];
    }
    const splatSize = deps.getSplatSize();
    if (!splatSize.width || !splatSize.height) {
      return [0, 0, 1];
    }
    const normalsSize = deps.getNormalsSize();
    const nx = deps.clamp(Math.round((pixelX + 0.5) / splatSize.width * normalsSize.width - 0.5), 0, normalsSize.width - 1);
    const ny = deps.clamp(Math.round((pixelY + 0.5) / splatSize.height * normalsSize.height - 0.5), 0, normalsSize.height - 1);
    const idx = (ny * normalsSize.width + nx) * 4;
    const d = normalsImageData.data;
    const vx = (d[idx] / 255) * 2 - 1;
    const vy = (d[idx + 1] / 255) * 2 - 1;
    const vz = (d[idx + 2] / 255) * 2 - 1;
    return normalize3(vx, vy, vz);
  }

  function sampleHeightAtMapPixel(pixelX, pixelY) {
    const heightImageData = deps.getHeightImageData();
    if (!heightImageData || !heightImageData.data) {
      return 0;
    }
    const splatSize = deps.getSplatSize();
    if (!splatSize.width || !splatSize.height) {
      return 0;
    }
    const heightSize = deps.getHeightSize();
    const hx = deps.clamp(Math.round((pixelX + 0.5) / splatSize.width * heightSize.width - 0.5), 0, heightSize.width - 1);
    const hy = deps.clamp(Math.round((pixelY + 0.5) / splatSize.height * heightSize.height - 0.5), 0, heightSize.height - 1);
    const idx = (hy * heightSize.width + hx) * 4;
    return heightImageData.data[idx] / 255;
  }

  function sampleHeightAtMapCoord(mapX, mapY) {
    const heightImageData = deps.getHeightImageData();
    if (!heightImageData || !heightImageData.data) {
      return 0;
    }
    const splatSize = deps.getSplatSize();
    if (!splatSize.width || !splatSize.height) {
      return 0;
    }
    const heightSize = deps.getHeightSize();
    const hx = deps.clamp(Math.round((mapX + 0.5) / splatSize.width * heightSize.width - 0.5), 0, heightSize.width - 1);
    const hy = deps.clamp(Math.round((mapY + 0.5) / splatSize.height * heightSize.height - 0.5), 0, heightSize.height - 1);
    const idx = (hy * heightSize.width + hx) * 4;
    return heightImageData.data[idx] / 255;
  }

  return {
    normalize3,
    sampleNormalAtMapPixel,
    sampleHeightAtMapPixel,
    sampleHeightAtMapCoord,
  };
}
