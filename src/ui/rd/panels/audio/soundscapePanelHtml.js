export function getRdAudioSoundscapePanelHtml() {
  return `
          <section id="rdAudioSoundscapePanel" class="rd-tab-panel audio-control-section" role="tabpanel" data-rd-panel="soundscape" data-audio-control-panel="soundscape" aria-labelledby="rdAudioSoundscapeTab" aria-hidden="true">
            <div class="row">
              <label for="audioSoundscapeRoot">Root</label>
              <select id="audioSoundscapeRoot">
                <option value="C">C</option>
                <option value="C#">C#</option>
                <option value="D" selected>D</option>
                <option value="D#">D#</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#</option>
                <option value="G">G</option>
                <option value="G#">G#</option>
                <option value="A">A</option>
                <option value="A#">A#</option>
                <option value="B">B</option>
              </select>
            </div>
            <div class="row">
              <label for="audioSoundscapeScale">Scale</label>
              <select id="audioSoundscapeScale">
                <option value="minorPentatonic" selected>Minor Pentatonic</option>
                <option value="majorPentatonic">Major Pentatonic</option>
                <option value="dorian">Dorian</option>
                <option value="aeolian">Aeolian</option>
                <option value="phrygian">Phrygian</option>
                <option value="suspendedPentatonic">Suspended Pentatonic</option>
              </select>
            </div>
            <div class="row">
              <label for="audioSoundscapeDuration">Duration</label>
              <div class="inline-control">
                <input id="audioSoundscapeDuration" type="range" min="0.25" max="60" step="0.25" value="8" />
                <span id="audioSoundscapeDurationValue">8.00s</span>
              </div>
            </div>
            <div class="row">
              <label for="audioSoundscapeMasterGain">Sound Gain</label>
              <div class="inline-control">
                <input id="audioSoundscapeMasterGain" type="range" min="0" max="1" step="0.01" value="0.45" />
                <span id="audioSoundscapeMasterGainValue">0.45</span>
              </div>
            </div>
            <div class="row">
              <label for="audioSoundscapeLoopToggle">Loop</label>
              <input id="audioSoundscapeLoopToggle" type="checkbox" checked />
            </div>
            <div class="row">
              <label for="audioSoundscapeSeed">Seed</label>
              <input id="audioSoundscapeSeed" type="number" min="1" max="999999" step="1" value="1" />
            </div>
            <div class="light-editor-actions audio-actions">
              <button id="audioSoundscapePlayBtn" type="button">Play Soundscape</button>
              <button id="audioSoundscapeRandomizeBtn" type="button">Randomize</button>
              <button id="audioSoundscapeStopBtn" type="button">Stop</button>
            </div>
            <div class="light-editor-actions audio-actions">
              <button id="audioSoundscapeAddDroneBtn" type="button">Add Drone</button>
              <button id="audioSoundscapeAddResonanceBtn" type="button">Add Resonance</button>
              <button id="audioSoundscapeAddShimmerBtn" type="button">Add Shimmer</button>
              <button id="audioSoundscapeAddCallBtn" type="button">Add Call</button>
            </div>
            <div class="light-editor-actions audio-actions">
              <button id="audioSoundscapeAddWindBtn" type="button">Add Wind</button>
              <button id="audioSoundscapeAddRumbleBtn" type="button">Add Rumble</button>
              <button id="audioSoundscapeAddAirBtn" type="button">Add Air</button>
            </div>
            <div id="audioSoundscapeLayerList" class="oscillator-list" aria-label="Soundscape layers"></div>
          </section>`;
}
