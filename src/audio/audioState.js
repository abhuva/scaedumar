export const DEFAULT_AUDIO_SIMULATION_STATE = {
  isPlaying: false,
  playbackKind: "none",
  cursorT: 0,
  durationSec: 4,
  hasInputSignal: false,
  lastError: "",
};

export function createAudioRuntimeState() {
  return {
    audioContext: null,
    analyserNode: null,
    frequencyData: null,
    masterGainNode: null,
    oscNode: null,
    bufferSourceNode: null,
    synthesisNodes: [],
    soundscapeFrameId: null,
    soundscapeStartedAtSec: 0,
    soundscapeLayerStates: {},
    spectrogramFrameId: null,
    decodedAudioBuffer: null,
    decodedFileName: "",
    stft: null,
  };
}
