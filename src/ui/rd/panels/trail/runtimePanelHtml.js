export function getRdTrailRuntimePanelHtml() {
  return `
            <div id="rdTrailRuntimePanel" class="rd-tab-panel active" role="tabpanel" data-rd-panel="runtime" aria-labelledby="rdTrailRuntimeTab" aria-hidden="false">
              <p class="panel-note">Runtime, preset, time, low-resolution readback, seed, and status controls.</p>
          <div class="row">
            <label for="slimePresetSelect">Preset</label>
            <select id="slimePresetSelect">
              <option value="">No presets</option>
            </select>
          </div>
          <div class="row">
            <label for="slimePresetName">Preset Name</label>
            <input id="slimePresetName" type="text" placeholder="plant-seeker" />
          </div>
          <div class="light-editor-actions audio-actions">
            <button id="slimePresetApplyBtn" type="button">Apply Preset</button>
            <button id="slimePresetSaveBtn" type="button">Save Named Preset</button>
          </div>
          <div class="light-editor-actions audio-actions">
            <button id="slimeStartBtn" type="button">Start</button>
            <button id="slimeStopBtn" type="button">Stop</button>
            <button id="slimeResetBtn" type="button">Reset</button>
            <button id="slimeRandomizeBtn" type="button">Seed</button>
          </div>
          <div class="row">
            <label for="slimeShowTerrainUnderlay">Terrain Underlay</label>
            <input id="slimeShowTerrainUnderlay" type="checkbox" />
          </div>
          <div class="row">
            <label for="slimeAgentCount">Agents</label>
            <div class="inline-control">
              <input id="slimeAgentCount" type="range" min="1000" max="20000" step="1000" value="20000" />
              <span id="slimeAgentCountValue">20000</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeSimSize">Texture Size</label>
            <select id="slimeSimSize">
              <option value="512">512</option>
              <option value="1024" selected>1024</option>
              <option value="2048">2048</option>
            </select>
          </div>
          <div class="row">
            <label for="slimeStepsPerFrame">Steps / Frame</label>
            <div class="inline-control">
              <input id="slimeStepsPerFrame" type="range" min="1" max="8" step="1" value="1" />
              <span id="slimeStepsPerFrameValue">1</span>
            </div>
          </div>
          <h2>Time</h2>
          <div class="row">
            <label for="slimeTimeMode">Time Source</label>
            <select id="slimeTimeMode">
              <option value="gameTick" selected>Game Time</option>
              <option value="free">Free Run</option>
            </select>
          </div>
          <div class="row">
            <label for="slimeStepsPerGameTick">Steps / Game Tick</label>
            <div class="inline-control">
              <input id="slimeStepsPerGameTick" type="range" min="1" max="10" step="1" value="1" />
              <span id="slimeStepsPerGameTickValue">1</span>
            </div>
          </div>
          <div class="light-editor-actions audio-actions">
            <button class="slime-game-speed-btn" type="button" data-cycle-speed="0.01">1x</button>
            <button class="slime-game-speed-btn" type="button" data-cycle-speed="0.05">5x</button>
            <button class="slime-game-speed-btn" type="button" data-cycle-speed="0.2">20x</button>
            <button class="slime-game-speed-btn" type="button" data-cycle-speed="1">100x</button>
          </div>
          <h2>Warm Up</h2>
          <div class="row">
            <label for="slimeWarmupEnabled">Warmup</label>
            <input id="slimeWarmupEnabled" type="checkbox" checked />
          </div>
          <div class="row">
            <label for="slimeWarmupSteps">Warmup Steps</label>
            <div class="inline-control">
              <input id="slimeWarmupSteps" type="range" min="0" max="20000" step="100" value="3000" />
              <span id="slimeWarmupStepsValue">3000</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeAvailabilityGridSize">Availability Grid</label>
            <div class="inline-control">
              <input id="slimeAvailabilityGridSize" type="range" min="32" max="512" step="32" value="128" />
              <span id="slimeAvailabilityGridSizeValue">128</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeAvailabilityEffectiveMax">Trail Max</label>
            <div class="inline-control">
              <input id="slimeAvailabilityEffectiveMax" type="range" min="0.01" max="5" step="0.01" value="0.7" />
              <span id="slimeAvailabilityEffectiveMaxValue">0.70</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeAvailabilityUpdateTickInterval">Grid Tick</label>
            <div class="inline-control">
              <input id="slimeAvailabilityUpdateTickInterval" type="range" min="1" max="100" step="1" value="10" />
              <span id="slimeAvailabilityUpdateTickIntervalValue">10</span>
            </div>
          </div>
          <div class="row">
            <label for="slimePlantStockSyncTickInterval">Plant Sync Tick</label>
            <div class="inline-control">
              <input id="slimePlantStockSyncTickInterval" type="range" min="10" max="1000" step="10" value="120" />
              <span id="slimePlantStockSyncTickIntervalValue">120</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeSeed">Seed</label>
            <input id="slimeSeed" type="number" min="1" max="999999" step="1" value="1" />
          </div>
          <p>Slime Status: <span id="slimeStatusValue">Stopped</span></p>
          <p>Slime Stats: <span id="slimeStatsValue">Not initialized</span></p>
            </div>`;
}
