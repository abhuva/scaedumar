import { frequencyToBin, normalizeFrequencySettings, normalizedFrequencyToHz } from "./frequencyMappingRuntime.js";

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function colorForMagnitude(value) {
  const t = clamp01(value);
  const r = Math.round(18 + (230 * Math.max(0, t - 0.45) * 1.8));
  const g = Math.round(34 + (190 * Math.sin(t * Math.PI * 0.85)));
  const b = Math.round(48 + (180 * (1 - Math.abs(t - 0.55))));
  return `rgb(${r}, ${g}, ${b})`;
}

function amplitudeToDisplay(amplitude, maxAmplitude, floorDb) {
  if (maxAmplitude <= 0 || amplitude <= 0) return 0;
  const db = 20 * Math.log10(amplitude / maxAmplitude);
  return clamp01((db - floorDb) / -floorDb);
}

function disableImageSmoothing(context) {
  context.imageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.msImageSmoothingEnabled = false;
}

export function createSpectrogramRuntime(deps) {
  const ctx = deps.canvas.getContext("2d", { alpha: false });
  if (!ctx) {
    throw new Error("2D spectrogram context is required.");
  }
  disableImageSmoothing(ctx);
  const baseCanvas = document.createElement("canvas");
  const baseCtx = baseCanvas.getContext("2d", { alpha: false });
  if (baseCtx) {
    disableImageSmoothing(baseCtx);
  }
  let cachedBaseKey = "";

  function resizeBackingStore() {
    const rect = deps.canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width || deps.canvas.width));
    const height = Math.max(180, Math.round(rect.height || deps.canvas.height));
    if (deps.canvas.width !== width || deps.canvas.height !== height) {
      deps.canvas.width = width;
      deps.canvas.height = height;
    }
  }

  function drawGrid() {
    resizeBackingStore();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;
    for (let y = 0; y < deps.canvas.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(deps.canvas.width, y + 0.5);
      ctx.stroke();
    }
    for (let x = 0; x < deps.canvas.width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, deps.canvas.height);
      ctx.stroke();
    }
  }

  function clear() {
    resizeBackingStore();
    cachedBaseKey = "";
    ctx.fillStyle = "#071017";
    ctx.fillRect(0, 0, deps.canvas.width, deps.canvas.height);
    drawGrid();
  }

  function drawScribbleOverlay(scribble) {
    if (!scribble) return;
    resizeBackingStore();
    const cellW = deps.canvas.width / Math.max(1, scribble.widthBins);
    const cellH = deps.canvas.height / Math.max(1, scribble.heightBins);
    for (let y = 0; y < scribble.heightBins; y += 1) {
      for (let x = 0; x < scribble.widthBins; x += 1) {
        const value = scribble.grid[(y * scribble.widthBins) + x];
        if (value <= 0.001) continue;
        ctx.fillStyle = `rgba(255, 236, 115, ${Math.min(0.9, 0.18 + (value * 0.72))})`;
        ctx.fillRect(x * cellW, deps.canvas.height - ((y + 1) * cellH), Math.max(1, cellW), Math.max(1, cellH));
      }
    }
  }

  function drawLabels(targetCtx, stft, minHz, maxHz) {
    targetCtx.fillStyle = "rgba(232, 241, 247, 0.78)";
    targetCtx.font = "12px monospace";
    targetCtx.fillText(`${stft.durationSec.toFixed(2)}s`, deps.canvas.width - 54, 18);
    targetCtx.fillText(`${Math.round(maxHz)} Hz`, 8, 18);
    targetCtx.fillText(`${Math.round(minHz)} Hz`, 8, deps.canvas.height - 10);
  }

  function createBaseKey(stft, settings, width, height) {
    return [
      width,
      height,
      stft ? stft.sampleRate : 0,
      stft ? stft.sampleCount : 0,
      stft ? stft.segmentCount : 0,
      stft ? stft.frequencyBinCount : 0,
      Number(settings.minHz) || 0,
      Number(settings.maxHz) || 0,
      Number(settings.loudnessFloorDb) || -72,
    ].join(":");
  }

  function rebuildBaseSpectrogram(stft) {
    if (!baseCtx) return;
    baseCanvas.width = deps.canvas.width;
    baseCanvas.height = deps.canvas.height;
    baseCtx.fillStyle = "#071017";
    baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

    if (!stft) {
      return;
    }

    const image = baseCtx.createImageData(baseCanvas.width, baseCanvas.height);
    const settings = deps.getSettings();
    const { minHz, maxHz } = normalizeFrequencySettings(settings, stft);
    const floorDb = Math.min(-1, Number(settings.loudnessFloorDb) || -72);
    const maxAmplitude = stft.maxAmplitude || 1;
    const pixels = image.data;

    for (let y = 0; y < baseCanvas.height; y += 1) {
      const yNorm = 1 - (y / Math.max(1, baseCanvas.height - 1));
      const hz = normalizedFrequencyToHz(yNorm, normalizeFrequencySettings(settings, stft));
      const bin = frequencyToBin(hz, stft);
      for (let x = 0; x < baseCanvas.width; x += 1) {
        const segment = Math.max(0, Math.min(stft.segmentCount - 1, Math.floor((x / Math.max(1, baseCanvas.width - 1)) * stft.segmentCount)));
        const amp = stft.amplitudes[(segment * stft.frequencyBinCount) + bin];
        const t = amplitudeToDisplay(amp, maxAmplitude, floorDb);
        const pixel = ((y * baseCanvas.width) + x) * 4;
        pixels[pixel] = Math.round(8 + (t * 228));
        pixels[pixel + 1] = Math.round(20 + (Math.sin(t * Math.PI * 0.85) * 190));
        pixels[pixel + 2] = Math.round(34 + ((1 - Math.abs(t - 0.55)) * 160));
        pixels[pixel + 3] = 255;
      }
    }

    baseCtx.putImageData(image, 0, 0);
    drawLabels(baseCtx, stft, minHz, maxHz);
  }

  function drawCachedSpectrogram(stft, scribble) {
    if (!baseCtx) {
      clear();
      return;
    }
    const settings = deps.getSettings();
    const baseKey = createBaseKey(stft, settings, deps.canvas.width, deps.canvas.height);
    if (baseKey !== cachedBaseKey) {
      rebuildBaseSpectrogram(stft);
      cachedBaseKey = baseKey;
    }
    ctx.drawImage(baseCanvas, 0, 0);
    drawGrid();
    drawScribbleOverlay(scribble);
  }

  function drawStaticSpectrogram(stft, scribble) {
    resizeBackingStore();
    drawCachedSpectrogram(stft, scribble);
  }

  function invalidateBase() {
    cachedBaseKey = "";
  }

  function drawLabelsLegacy(stft, minHz, maxHz) {
    ctx.fillStyle = "rgba(232, 241, 247, 0.78)";
    ctx.font = "12px monospace";
    ctx.fillText(`${stft.durationSec.toFixed(2)}s`, deps.canvas.width - 54, 18);
    ctx.fillText(`${Math.round(maxHz)} Hz`, 8, 18);
    ctx.fillText(`${Math.round(minHz)} Hz`, 8, deps.canvas.height - 10);
  }

  function drawStaticSpectrogramLegacy(stft, scribble) {
    resizeBackingStore();
    ctx.fillStyle = "#071017";
    ctx.fillRect(0, 0, deps.canvas.width, deps.canvas.height);

    if (!stft) {
      drawGrid();
      return;
    }

    const image = ctx.createImageData(deps.canvas.width, deps.canvas.height);
    const settings = deps.getSettings();
    const nyquist = stft.sampleRate * 0.5;
    const minHz = Math.max(0, Math.min(nyquist, Number(settings.minHz) || 0));
    const maxHz = Math.max(minHz + 1, Math.min(nyquist, Number(settings.maxHz) || nyquist));
    const floorDb = Math.min(-1, Number(settings.loudnessFloorDb) || -72);
    const maxAmplitude = stft.maxAmplitude || 1;
    const pixels = image.data;

    for (let y = 0; y < deps.canvas.height; y += 1) {
      const yNorm = 1 - (y / Math.max(1, deps.canvas.height - 1));
      const hz = minHz + ((maxHz - minHz) * yNorm);
      const bin = Math.max(0, Math.min(stft.frequencyBinCount - 1, Math.round((hz / nyquist) * (stft.frequencyBinCount - 1))));
      for (let x = 0; x < deps.canvas.width; x += 1) {
        const segment = Math.max(0, Math.min(stft.segmentCount - 1, Math.floor((x / Math.max(1, deps.canvas.width - 1)) * stft.segmentCount)));
        const amp = stft.amplitudes[(segment * stft.frequencyBinCount) + bin];
        const t = amplitudeToDisplay(amp, maxAmplitude, floorDb);
        const pixel = ((y * deps.canvas.width) + x) * 4;
        pixels[pixel] = Math.round(8 + (t * 228));
        pixels[pixel + 1] = Math.round(20 + (Math.sin(t * Math.PI * 0.85) * 190));
        pixels[pixel + 2] = Math.round(34 + ((1 - Math.abs(t - 0.55)) * 160));
        pixels[pixel + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
    drawGrid();
    drawScribbleOverlay(scribble);
    drawLabelsLegacy(stft, minHz, maxHz);
  }

  function drawFrame() {
    const analyser = deps.getAnalyserNode();
    const data = deps.getFrequencyData();
    const audioContext = deps.getAudioContext();
    if (!analyser || !data || !audioContext) {
      clear();
      return;
    }

    resizeBackingStore();
    analyser.getByteFrequencyData(data);
    ctx.drawImage(deps.canvas, 1, 0, deps.canvas.width - 1, deps.canvas.height, 0, 0, deps.canvas.width - 1, deps.canvas.height);

    const settings = deps.getSettings();
    const nyquist = audioContext.sampleRate * 0.5;
    const minHz = Math.max(20, Math.min(nyquist, Number(settings.minHz) || 40));
    const maxHz = Math.max(minHz + 1, Math.min(nyquist, Number(settings.maxHz) || nyquist));
    const minLog = Math.log10(minHz);
    const maxLog = Math.log10(maxHz);
    const x = deps.canvas.width - 1;

    for (let y = 0; y < deps.canvas.height; y += 1) {
      const normY = 1 - (y / Math.max(1, deps.canvas.height - 1));
      const hz = 10 ** (minLog + ((maxLog - minLog) * normY));
      const bin = Math.max(0, Math.min(data.length - 1, Math.round((hz / nyquist) * data.length)));
      const magnitude = data[bin] / 255;
      ctx.fillStyle = colorForMagnitude(magnitude);
      ctx.fillRect(x, y, 1, 1);
    }
  }

  function start() {
    if (deps.runtime.spectrogramFrameId !== null) return;
    const tick = () => {
      drawFrame();
      deps.runtime.spectrogramFrameId = deps.requestAnimationFrame(tick);
    };
    tick();
  }

  function stop() {
    if (deps.runtime.spectrogramFrameId !== null) {
      deps.cancelAnimationFrame(deps.runtime.spectrogramFrameId);
      deps.runtime.spectrogramFrameId = null;
    }
  }

  return {
    clear,
    drawFrame,
    drawStaticSpectrogram,
    drawStaticSpectrogramLegacy,
    invalidateBase,
    drawScribbleOverlay,
    start,
    stop,
  };
}
