const VALID_ANALYSER_FFT_SIZES = [
  32,
  64,
  128,
  256,
  512,
  1024,
  2048,
  4096,
  8192,
  16384,
  32768,
];

function normalizeAnalyserFftSize(input) {
  const value = Number(input);
  if (!Number.isFinite(value)) return 2048;
  let best = VALID_ANALYSER_FFT_SIZES[0];
  let bestDistance = Math.abs(value - best);
  for (const candidate of VALID_ANALYSER_FFT_SIZES) {
    const distance = Math.abs(value - candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

export function createAudioEngineRuntime(deps) {
  function ensureContext() {
    if (deps.runtime.audioContext) {
      return deps.runtime.audioContext;
    }
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      throw new Error("WebAudio API is unavailable.");
    }
    const context = new Ctor();
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = normalizeAnalyserFftSize(deps.getSettings().fftSize);
    analyserNode.smoothingTimeConstant = 0.72;
    const masterGainNode = context.createGain();
    masterGainNode.gain.value = deps.getSettings().masterGain;
    analyserNode.connect(masterGainNode);
    masterGainNode.connect(context.destination);
    deps.runtime.audioContext = context;
    deps.runtime.analyserNode = analyserNode;
    deps.runtime.frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
    deps.runtime.masterGainNode = masterGainNode;
    return context;
  }

  function syncMasterGain() {
    if (!deps.runtime.masterGainNode) return;
    const settings = deps.getSettings();
    deps.runtime.masterGainNode.gain.value = Math.max(0, Math.min(1, Number(settings.masterGain) || 0));
  }

  function syncAnalyserSettings() {
    if (!deps.runtime.analyserNode) return;
    const settings = deps.getSettings();
    const fftSize = normalizeAnalyserFftSize(settings.fftSize);
    if (deps.runtime.analyserNode.fftSize !== fftSize) {
      deps.runtime.analyserNode.fftSize = fftSize;
      deps.runtime.frequencyData = new Uint8Array(deps.runtime.analyserNode.frequencyBinCount);
    }
  }

  function play() {
    const context = ensureContext();
    syncMasterGain();
    syncAnalyserSettings();
    if (deps.runtime.oscNode) {
      return;
    }
    const osc = context.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 220;
    osc.connect(deps.runtime.analyserNode);
    osc.start();
    deps.runtime.oscNode = osc;
    deps.setPlaying(true);
  }

  function stopOscillator() {
    if (deps.runtime.oscNode) {
      deps.runtime.oscNode.stop();
      deps.runtime.oscNode.disconnect();
      deps.runtime.oscNode = null;
    }
  }

  function stopBufferSource() {
    if (deps.runtime.bufferSourceNode) {
      deps.runtime.bufferSourceNode.onended = null;
      try {
        deps.runtime.bufferSourceNode.stop();
      } catch {
        // Already-ended buffer sources cannot be stopped again.
      }
      deps.runtime.bufferSourceNode.disconnect();
      deps.runtime.bufferSourceNode = null;
    }
  }

  function playBuffer(audioBuffer, options = {}) {
    const context = ensureContext();
    syncMasterGain();
    stopOscillator();
    stopBufferSource();
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = Math.max(0.25, Math.min(2, Number(options.playbackRate) || 1));
    source.connect(deps.runtime.analyserNode);
    source.onended = () => {
      if (deps.runtime.bufferSourceNode === source) {
        deps.runtime.bufferSourceNode = null;
        deps.setPlaying(false);
      }
    };
    source.start();
    deps.runtime.bufferSourceNode = source;
    deps.setPlaying(true);
  }

  function stop() {
    stopOscillator();
    stopBufferSource();
    deps.setPlaying(false);
  }

  return {
    ensureContext,
    syncMasterGain,
    syncAnalyserSettings,
    play,
    playBuffer,
    stop,
  };
}
