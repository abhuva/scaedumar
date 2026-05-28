export function getRdTerrainWaterTrailsPanelHtml() {
  return `
            <div id="rdTerrainWaterTrailsPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="water-trails" aria-labelledby="rdTerrainWaterTrailsTab" aria-hidden="true">
<div class="row">
            <label for="waterTrailPresetSelect">Preset</label>
            <select id="waterTrailPresetSelect">
              <option value="">No presets</option>
            </select>
          </div>
          <div class="row">
            <label for="waterTrailPresetName">Preset Name</label>
            <input id="waterTrailPresetName" type="text" placeholder="calm-glitter" />
          </div>
          <div class="row">
            <button id="waterTrailPresetApplyBtn" type="button">Apply Preset</button>
            <button id="waterTrailPresetSaveBtn" type="button">Save Preset</button>
          </div>
          <div class="row">
            <label for="waterTrailToggle">Particle Trails</label>
            <input id="waterTrailToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterTrailChannelPair">Flow Channels</label>
            <select id="waterTrailChannelPair">
              <option value="gb" selected>G/B</option>
              <option value="rg">R/G</option>
              <option value="rb">R/B</option>
            </select>
          </div>
          <div class="row">
            <label for="waterTrailFlipXToggle">Flip Flow X</label>
            <input id="waterTrailFlipXToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterTrailFlipYToggle">Flip Flow Y</label>
            <input id="waterTrailFlipYToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterTrailUseMagnitudeToggle">Use B Magnitude</label>
            <input id="waterTrailUseMagnitudeToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterTrailDebugToggle">Debug View</label>
            <input id="waterTrailDebugToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterTrailParticleCount">Particles</label>
            <div class="inline-control">
              <input id="waterTrailParticleCount" type="range" min="1" max="2000" step="1" value="400" />
              <span id="waterTrailParticleCountValue">400</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailSpeed">Speed</label>
            <div class="inline-control">
              <input id="waterTrailSpeed" type="range" min="1" max="240" step="1" value="45" />
              <span id="waterTrailSpeedValue">45 px/s</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailSimSpeed">Simulation Speed</label>
            <div class="inline-control">
              <input id="waterTrailSimSpeed" type="range" min="0" max="4" step="0.01" value="1" />
              <span id="waterTrailSimSpeedValue">1.00x</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailResolution">Wake Resolution</label>
            <select id="waterTrailResolution">
              <option value="1">Full</option>
              <option value="0.5" selected>1/2</option>
              <option value="0.25">1/4</option>
              <option value="0.125">1/8</option>
            </select>
          </div>
          <div class="row">
            <label for="waterTrailFlowInfluence">Flow Influence</label>
            <div class="inline-control">
              <input id="waterTrailFlowInfluence" type="range" min="0" max="4" step="0.01" value="1" />
              <span id="waterTrailFlowInfluenceValue">1.00</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailStrength">Trail Strength</label>
            <div class="inline-control">
              <input id="waterTrailStrength" type="range" min="0" max="6" step="0.01" value="1.4" />
              <span id="waterTrailStrengthValue">1.40</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailAgentOpacity">Agent Opacity</label>
            <div class="inline-control">
              <input id="waterTrailAgentOpacity" type="range" min="0.01" max="1" step="0.01" value="0.18" />
              <span id="waterTrailAgentOpacityValue">0.18</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailHeadroom">Trail Headroom</label>
            <div class="inline-control">
              <input id="waterTrailHeadroom" type="range" min="1" max="12" step="0.1" value="4" />
              <span id="waterTrailHeadroomValue">4.0x</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailFade">Trail Fade</label>
            <div class="inline-control">
              <input id="waterTrailFade" type="range" min="0.5" max="0.995" step="0.001" value="0.92" />
              <span id="waterTrailFadeValue">0.920</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailDiffusion">Wake Spread</label>
            <div class="inline-control">
              <input id="waterTrailDiffusion" type="range" min="0" max="1" step="0.01" value="0" />
              <span id="waterTrailDiffusionValue">0.00</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailCurrentDrag">Current Drag</label>
            <div class="inline-control">
              <input id="waterTrailCurrentDrag" type="range" min="0" max="1" step="0.01" value="0.18" />
              <span id="waterTrailCurrentDragValue">0.18</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailSpawnInheritRadius">Spawn Inherit</label>
            <div class="inline-control">
              <input id="waterTrailSpawnInheritRadius" type="range" min="0" max="80" step="1" value="24" />
              <span id="waterTrailSpawnInheritRadiusValue">24 px</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailWarmup">Spawn Warmup</label>
            <div class="inline-control">
              <input id="waterTrailWarmup" type="range" min="0" max="2" step="0.05" value="0.8" />
              <span id="waterTrailWarmupValue">0.80 s</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailStampRadius">Trail Width</label>
            <div class="inline-control">
              <input id="waterTrailStampRadius" type="range" min="0.1" max="8" step="0.1" value="0.6" />
              <span id="waterTrailStampRadiusValue">0.6 px</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTrailTintColor">Trail Tint</label>
            <input id="waterTrailTintColor" type="color" value="#7ed7ff" />
          </div>
          <div class="row">
            <label for="waterGlitterStrength">Glitter Strength</label>
            <div class="inline-control">
              <input id="waterGlitterStrength" type="range" min="0" max="2" step="0.01" value="0" />
              <span id="waterGlitterStrengthValue">0.00</span>
            </div>
          </div>
          <div class="row">
            <label for="waterGlitterDensity">Glitter Density</label>
            <div class="inline-control">
              <input id="waterGlitterDensity" type="range" min="0.001" max="0.25" step="0.001" value="0.04" />
              <span id="waterGlitterDensityValue">0.040</span>
            </div>
          </div>
          <div class="row">
            <label for="waterGlitterSpeed">Glitter Speed</label>
            <div class="inline-control">
              <input id="waterGlitterSpeed" type="range" min="0" max="12" step="0.05" value="3.5" />
              <span id="waterGlitterSpeedValue">3.50</span>
            </div>
          </div>
          <div class="row">
            <label for="waterGlitterSize">Glitter Size</label>
            <div class="inline-control">
              <input id="waterGlitterSize" type="range" min="1" max="12" step="1" value="2" />
              <span id="waterGlitterSizeValue">2 px</span>
            </div>
          </div>
          <div class="row">
            <label for="waterGlitterSharpness">Glitter Sharpness</label>
            <div class="inline-control">
              <input id="waterGlitterSharpness" type="range" min="1" max="24" step="0.5" value="10" />
              <span id="waterGlitterSharpnessValue">10.0</span>
            </div>
          </div>
          <div class="row">
            <label for="waterGlitterWakeSuppression">Wake Suppression</label>
            <div class="inline-control">
              <input id="waterGlitterWakeSuppression" type="range" min="0" max="1" step="0.01" value="0.75" />
              <span id="waterGlitterWakeSuppressionValue">0.75</span>
            </div>
          </div>
          <p id="waterTrailStats" class="slime-note">Trail stats: waiting for map.</p>
            </div>`;
}
