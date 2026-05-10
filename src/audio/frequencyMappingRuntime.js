function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function getNyquist(stft) {
  return stft.sampleRate * 0.5;
}

export function normalizeFrequencySettings(settings, stft) {
  const nyquist = getNyquist(stft);
  const minHz = clamp(settings.minHz ?? 40, 1, nyquist - 1);
  const maxHz = clamp(settings.maxHz ?? nyquist, minHz + 1, nyquist);
  return {
    minHz,
    maxHz,
    frequencyScale: "log",
  };
}

export function rowToFrequency(rowIndex, rowCount, settings, stft) {
  const normalized = normalizeFrequencySettings(settings, stft);
  const t = rowCount <= 1 ? 0 : clamp(rowIndex / (rowCount - 1), 0, 1);
  return normalizedFrequencyToHz(t, normalized);
}

export function normalizedFrequencyToHz(t, normalized) {
  const value = clamp(t, 0, 1);
  if (normalized.frequencyScale === "linear") {
    return normalized.minHz + ((normalized.maxHz - normalized.minHz) * value);
  }
  const minLog = Math.log10(Math.max(1, normalized.minHz));
  const maxLog = Math.log10(Math.max(normalized.minHz + 1, normalized.maxHz));
  return 10 ** (minLog + ((maxLog - minLog) * value));
}

export function frequencyToBin(frequency, stft) {
  const nyquist = getNyquist(stft);
  return Math.max(0, Math.min(
    stft.frequencyBinCount - 1,
    Math.round((frequency / nyquist) * (stft.frequencyBinCount - 1)),
  ));
}

export function rowToSourceBin(rowIndex, rowCount, settings, stft) {
  return frequencyToBin(rowToFrequency(rowIndex, rowCount, settings, stft), stft);
}
