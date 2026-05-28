export function getRdAudioSynthesisPanelHtml() {
  return `
          <section id="rdAudioSynthesisPanel" class="rd-tab-panel audio-control-section" role="tabpanel" data-rd-panel="synthesis" data-audio-control-panel="synthesis" aria-labelledby="rdAudioSynthesisTab" aria-hidden="true">
            <div class="row">
              <label for="audioSynthesisDuration">Duration</label>
              <div class="inline-control">
                <input id="audioSynthesisDuration" type="range" min="0.25" max="20" step="0.25" value="4" />
                <span id="audioSynthesisDurationValue">4.00s</span>
              </div>
            </div>
            <div class="row">
              <label for="audioSynthesisMasterGain">Synth Gain</label>
              <div class="inline-control">
                <input id="audioSynthesisMasterGain" type="range" min="0" max="1" step="0.01" value="0.45" />
                <span id="audioSynthesisMasterGainValue">0.45</span>
              </div>
            </div>
            <div class="row">
              <label for="audioSynthesisLoopToggle">Loop</label>
              <input id="audioSynthesisLoopToggle" type="checkbox" checked />
            </div>
            <div class="light-editor-actions audio-actions">
              <button id="audioSynthesisPlayBtn" type="button">Play Synth</button>
              <button id="audioSynthesisAddOscillatorBtn" type="button">Add Osc</button>
              <button id="audioSynthesisStopBtn" type="button">Stop</button>
            </div>
            <div id="audioSynthesisOscillatorList" class="oscillator-list" aria-label="Synthesis oscillators"></div>
          </section>`;
}
