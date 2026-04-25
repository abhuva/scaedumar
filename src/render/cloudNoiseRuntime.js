function fract(v) {
  return v - Math.floor(v);
}

function valueNoise2D(x, y, seed) {
  const n = Math.sin((x + seed * 17.13) * 127.1 + (y + seed * 31.7) * 311.7) * 43758.5453123;
  return fract(n);
}

function wrapInt(value, period) {
  const p = Math.max(1, Math.floor(period));
  const v = Math.floor(value) % p;
  return v < 0 ? v + p : v;
}

function periodicValueNoise2D(ix, iy, period, seed) {
  return valueNoise2D(wrapInt(ix, period), wrapInt(iy, period), seed);
}

function smoothPeriodicValueNoise2D(x, y, period, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const n00 = periodicValueNoise2D(x0, y0, period, seed);
  const n10 = periodicValueNoise2D(x0 + 1, y0, period, seed);
  const n01 = periodicValueNoise2D(x0, y0 + 1, period, seed);
  const n11 = periodicValueNoise2D(x0 + 1, y0 + 1, period, seed);
  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;
  return nx0 + (nx1 - nx0) * sy;
}

export function createCloudNoiseImage(size = 128, clamp) {
  const imageData = new ImageData(size, size);
  const data = imageData.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let f = 0;
      let amp = 0.58;
      let ampSum = 0;
      for (let octave = 0; octave < 4; octave++) {
        const period = 8 * (1 << octave);
        const nx = (x / size) * period;
        const ny = (y / size) * period;
        f += smoothPeriodicValueNoise2D(nx, ny, period, 2.31 + octave * 13.7) * amp;
        ampSum += amp;
        amp *= 0.5;
      }
      const v = Math.round(clamp(f / Math.max(0.0001, ampSum), 0, 1) * 255);
      const idx = (y * size + x) * 4;
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
      data[idx + 3] = 255;
    }
  }
  return imageData;
}

export function uploadCloudNoiseTexture(deps) {
  deps.gl.bindTexture(deps.gl.TEXTURE_2D, deps.cloudNoiseTex);
  deps.gl.texParameteri(deps.gl.TEXTURE_2D, deps.gl.TEXTURE_MIN_FILTER, deps.gl.LINEAR);
  deps.gl.texParameteri(deps.gl.TEXTURE_2D, deps.gl.TEXTURE_MAG_FILTER, deps.gl.LINEAR);
  deps.gl.texParameteri(deps.gl.TEXTURE_2D, deps.gl.TEXTURE_WRAP_S, deps.gl.REPEAT);
  deps.gl.texParameteri(deps.gl.TEXTURE_2D, deps.gl.TEXTURE_WRAP_T, deps.gl.REPEAT);
  const cloudNoiseImage = createCloudNoiseImage(128, deps.clamp);
  deps.gl.texImage2D(
    deps.gl.TEXTURE_2D,
    0,
    deps.gl.RGBA,
    cloudNoiseImage.width,
    cloudNoiseImage.height,
    0,
    deps.gl.RGBA,
    deps.gl.UNSIGNED_BYTE,
    cloudNoiseImage.data,
  );
}
