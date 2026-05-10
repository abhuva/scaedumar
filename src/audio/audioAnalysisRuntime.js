const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function nextPowerOfTwo(value) {
  let result = 1;
  while (result < value) result *= 2;
  return result;
}

function applyHannWindow(samples) {
  const denom = Math.max(1, samples.length - 1);
  for (let i = 0; i < samples.length; i += 1) {
    const t = i / denom;
    samples[i] *= 0.5 * (1 - Math.cos(TAU * t));
  }
}

function fft(real, imag) {
  const n = real.length;
  let j = 0;
  for (let i = 1; i < n; i += 1) {
    let bit = n >> 1;
    while (j & bit) {
      j ^= bit;
      bit >>= 1;
    }
    j ^= bit;
    if (i < j) {
      const tr = real[i];
      real[i] = real[j];
      real[j] = tr;
      const ti = imag[i];
      imag[i] = imag[j];
      imag[j] = ti;
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const angle = TAU / len;
    const wLenReal = Math.cos(angle);
    const wLenImag = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let wReal = 1;
      let wImag = 0;
      for (let k = 0; k < len / 2; k += 1) {
        const evenIndex = i + k;
        const oddIndex = evenIndex + (len / 2);
        const oddReal = (real[oddIndex] * wReal) - (imag[oddIndex] * wImag);
        const oddImag = (real[oddIndex] * wImag) + (imag[oddIndex] * wReal);
        real[oddIndex] = real[evenIndex] - oddReal;
        imag[oddIndex] = imag[evenIndex] - oddImag;
        real[evenIndex] += oddReal;
        imag[evenIndex] += oddImag;
        const nextReal = (wReal * wLenReal) - (wImag * wLenImag);
        wImag = (wReal * wLenImag) + (wImag * wLenReal);
        wReal = nextReal;
      }
    }
  }
}

export function audioBufferToMonoSamples(audioBuffer) {
  const channelCount = Math.max(1, audioBuffer.numberOfChannels);
  const sampleCount = audioBuffer.length;
  const mono = new Float32Array(sampleCount);
  for (let channel = 0; channel < channelCount; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let i = 0; i < sampleCount; i += 1) {
      mono[i] += data[i] / channelCount;
    }
  }
  return mono;
}

export function computeStft(samples, sampleRate, options = {}) {
  const windowSize = nextPowerOfTwo(clamp(options.windowSize ?? 2048, 256, 8192));
  const hopSize = Math.max(1, Math.round(clamp(options.hopSize ?? 512, 64, windowSize)));
  const useHannWindow = options.windowType !== "rect";
  const segmentCount = Math.max(1, Math.ceil(samples.length / hopSize));
  const frequencyBinCount = (windowSize / 2) + 1;
  const amplitudes = new Float32Array(segmentCount * frequencyBinCount);
  const phases = new Float32Array(segmentCount * frequencyBinCount);
  const frequencies = new Float32Array(frequencyBinCount);
  const segmentSampleCounts = new Uint32Array(segmentCount);
  let maxAmplitude = 0;

  for (let bin = 0; bin < frequencyBinCount; bin += 1) {
    frequencies[bin] = (bin / (frequencyBinCount - 1)) * (sampleRate / 2);
  }

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const offset = segment * hopSize;
    const remaining = samples.length - offset;
    const segmentSampleCount = Math.max(0, Math.min(windowSize, remaining));
    segmentSampleCounts[segment] = segmentSampleCount;
    const real = new Float32Array(windowSize);
    const imag = new Float32Array(windowSize);
    for (let i = 0; i < segmentSampleCount; i += 1) {
      real[i] = samples[offset + i];
    }
    if (useHannWindow) applyHannWindow(real);
    fft(real, imag);

    for (let bin = 0; bin < frequencyBinCount; bin += 1) {
      const isDc = bin === 0;
      const isNyquist = bin === frequencyBinCount - 1;
      const scale = isDc || isNyquist ? 1 : 2;
      const magnitude = Math.hypot(real[bin], imag[bin]);
      const amplitude = (magnitude / windowSize) * scale;
      const index = (segment * frequencyBinCount) + bin;
      amplitudes[index] = amplitude;
      phases[index] = -Math.atan2(imag[bin], real[bin]);
      maxAmplitude = Math.max(maxAmplitude, amplitude);
    }
  }

  return {
    sampleRate,
    sampleCount: samples.length,
    durationSec: samples.length / sampleRate,
    windowSize,
    hopSize,
    useHannWindow,
    segmentCount,
    frequencyBinCount,
    frequencies,
    amplitudes,
    phases,
    segmentSampleCounts,
    maxAmplitude,
  };
}

export function createAudioAnalysisRuntime() {
  return {
    audioBufferToMonoSamples,
    computeStft,
  };
}
