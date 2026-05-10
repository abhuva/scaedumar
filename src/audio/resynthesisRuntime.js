import { rowToFrequency } from "./frequencyMappingRuntime.js";

const TAU = Math.PI * 2;

function applyHannWindow(samples) {
  const denom = Math.max(1, samples.length - 1);
  for (let i = 0; i < samples.length; i += 1) {
    const t = i / denom;
    samples[i] *= 0.5 * (1 - Math.cos(TAU * t));
  }
}

function normalizeSamples(samples, targetPeak = 0.85) {
  let peak = 0;
  for (let i = 0; i < samples.length; i += 1) {
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  if (peak <= 0) return;
  const scale = targetPeak / peak;
  for (let i = 0; i < samples.length; i += 1) {
    samples[i] *= scale;
  }
}

export function createResynthesisRuntime(deps) {
  function sampleColumn(columnIndex) {
    const x = Math.max(0, Math.min(deps.scribble.widthBins - 1, Math.round(Number(columnIndex) || 0)));
    const column = new Array(deps.scribble.heightBins);
    for (let y = 0; y < deps.scribble.heightBins; y += 1) {
      column[y] = deps.scribble.grid[(y * deps.scribble.widthBins) + x];
    }
    return column;
  }

  function synthesizeScribbleToAudioBuffer(audioContext, stft, options = {}) {
    if (!audioContext) throw new Error("AudioContext is required for scribble playback.");
    if (!stft) throw new Error("Load an audio file before playing scribbles.");
    const output = new Float32Array(stft.sampleCount);
    const gain = Math.max(0, Number(options.gain) || 1);
    const sourceMaxAmplitude = stft.maxAmplitude || 1;
    const minAudible = Math.max(0.0001, Number(options.minAudible) || 0.002);

    for (let segment = 0; segment < stft.segmentCount; segment += 1) {
      const sampleOffset = segment * stft.hopSize;
      const segmentSampleCount = Math.min(stft.windowSize, Math.max(0, stft.sampleCount - sampleOffset));
      if (segmentSampleCount <= 0) continue;
      const segmentSamples = new Float32Array(segmentSampleCount);

      for (let bin = 0; bin < deps.scribble.heightBins; bin += 1) {
        const paint = deps.scribble.grid[(bin * deps.scribble.widthBins) + segment] || 0;
        if (paint <= minAudible) continue;
        const frequency = rowToFrequency(bin, deps.scribble.heightBins, options, stft);
        const amplitude = paint * sourceMaxAmplitude * gain;
        for (let i = 0; i < segmentSampleCount; i += 1) {
          const globalSampleIndex = sampleOffset + i;
          const time = globalSampleIndex / stft.sampleRate;
          segmentSamples[i] += Math.cos((time * TAU * frequency)) * amplitude;
        }
      }

      if (stft.useHannWindow) applyHannWindow(segmentSamples);
      for (let i = 0; i < segmentSampleCount; i += 1) {
        output[sampleOffset + i] += segmentSamples[i];
      }
    }

    normalizeSamples(output);
    const buffer = audioContext.createBuffer(1, output.length, stft.sampleRate);
    buffer.copyToChannel(output, 0);
    return buffer;
  }

  return {
    sampleColumn,
    synthesizeScribbleToAudioBuffer,
  };
}
