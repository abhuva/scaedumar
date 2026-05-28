export function getRdAudioSpectrogramPanelHtml() {
  return `
          <section id="rdAudioSpectrogramPanel" class="rd-tab-panel audio-control-section active" role="tabpanel" data-rd-panel="spectrogram" data-audio-control-panel="spectrogram" aria-labelledby="rdAudioSpectrogramTab" aria-hidden="false">
            <div class="row">
              <label for="audioFileInput">Audio File</label>
              <input id="audioFileInput" type="file" accept="audio/*" />
            </div>
            <div class="row">
              <label for="audioMinHz">Min Hz</label>
              <input id="audioMinHz" type="number" min="1" max="22050" step="1" value="40" />
            </div>
            <div class="row">
              <label for="audioMaxHz">Max Hz</label>
              <input id="audioMaxHz" type="number" min="20" max="22050" step="1" value="12000" />
            </div>
            <div class="row">
              <label for="audioBrushSize">Brush Size</label>
              <div class="inline-control">
                <input id="audioBrushSize" type="range" min="1" max="32" step="1" value="6" />
                <span id="audioBrushSizeValue">6</span>
              </div>
            </div>
            <div class="row">
              <label for="audioBrushStrength">Brush Strength</label>
              <div class="inline-control">
                <input id="audioBrushStrength" type="range" min="0" max="1" step="0.01" value="0.8" />
                <span id="audioBrushStrengthValue">0.80</span>
              </div>
            </div>
            <div class="row">
              <label for="audioEraseModeToggle">Erase Mode</label>
              <input id="audioEraseModeToggle" type="checkbox" />
            </div>
            <div class="row">
              <label for="audioAutoThreshold">Auto Threshold</label>
              <div class="inline-control">
                <input id="audioAutoThreshold" type="range" min="0" max="1" step="0.01" value="0.62" />
                <span id="audioAutoThresholdValue">0.62</span>
              </div>
            </div>
            <div class="row">
              <label for="audioAutoContrast">Auto Contrast</label>
              <div class="inline-control">
                <input id="audioAutoContrast" type="range" min="0.25" max="4" step="0.05" value="1.5" />
                <span id="audioAutoContrastValue">1.50</span>
              </div>
            </div>
            <div class="row">
              <label for="audioAutoGain">Auto Gain</label>
              <div class="inline-control">
                <input id="audioAutoGain" type="range" min="0" max="2" step="0.01" value="1" />
                <span id="audioAutoGainValue">1.00</span>
              </div>
            </div>
            <div class="row">
              <label for="audioAutoClearToggle">Auto Clears</label>
              <input id="audioAutoClearToggle" type="checkbox" checked />
            </div>
            <div class="row">
              <label for="audioApproxMaxStrokes">Approx Strokes</label>
              <input id="audioApproxMaxStrokes" type="number" min="1" max="1000" step="1" value="100" />
            </div>
            <div class="row">
              <label for="audioApproxMinStrength">Approx Min</label>
              <div class="inline-control">
                <input id="audioApproxMinStrength" type="range" min="0" max="1" step="0.01" value="0.05" />
                <span id="audioApproxMinStrengthValue">0.05</span>
              </div>
            </div>
            <div class="row">
              <label for="audioMasterGain">Master Gain</label>
              <div class="inline-control">
                <input id="audioMasterGain" type="range" min="0" max="1" step="0.01" value="0.7" />
                <span id="audioMasterGainValue">0.70</span>
              </div>
            </div>
            <div class="row">
              <label for="audioPlaybackRate">Playback Rate</label>
              <div class="inline-control">
                <input id="audioPlaybackRate" type="range" min="0.25" max="2" step="0.01" value="1" />
                <span id="audioPlaybackRateValue">1.00</span>
              </div>
            </div>
            <div class="light-editor-actions audio-actions">
              <button id="audioPlayBtn" type="button" title="Play Test Tone">Tone</button>
              <button id="audioPlayOriginalBtn" type="button" title="Play Original">Orig</button>
              <button id="audioPlayScribbleBtn" type="button" title="Play Scribble">Scrb</button>
              <button id="audioAutoPaintBtn" type="button" title="Auto Paint Strong">Auto</button>
              <button id="audioApproximateBtn" type="button" title="Approximate">Appr</button>
              <button id="audioStopBtn" type="button" title="Stop">Stop</button>
              <button id="audioClearBtn" type="button" title="Clear Scribble">Clr</button>
            </div>
            <p>Audio File: <span id="audioFileStatusValue">No file loaded</span></p>
          </section>`;
}
