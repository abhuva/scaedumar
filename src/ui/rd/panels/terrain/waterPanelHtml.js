export function getRdTerrainWaterPanelHtml() {
  return `
            <div id="rdTerrainWaterPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="water" aria-labelledby="rdTerrainWaterTab" aria-hidden="true">
<div class="row">
            <label for="waterPresetSelect">Preset</label>
            <select id="waterPresetSelect">
              <option value="">No presets</option>
            </select>
          </div>
          <div class="row">
            <label for="waterPresetName">Preset Name</label>
            <input id="waterPresetName" type="text" placeholder="shallow-water" />
          </div>
          <div class="row">
            <button id="waterPresetApplyBtn" type="button">Apply Preset</button>
            <button id="waterPresetSaveBtn" type="button">Save Preset</button>
          </div>
          <div class="row">
            <label for="waterFxToggle">Water FX</label>
            <input id="waterFxToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterFlowSource">Flow Source</label>
            <select id="waterFlowSource">
              <option value="fixed">Fixed Direction</option>
              <option value="height" selected>Height Generated</option>
              <option value="image">flow.png Image</option>
            </select>
          </div>
          <div class="row">
            <label for="waterFlowRenderMode">Flow Render</label>
            <select id="waterFlowRenderMode">
              <option value="procedural">Procedural</option>
              <option value="streamlines" selected>Streamlines</option>
            </select>
          </div>
          <div class="row">
            <label for="waterFlowChannelPair">Flow Channels</label>
            <select id="waterFlowChannelPair">
              <option value="rg" selected>R/G</option>
              <option value="gb">G/B</option>
              <option value="rb">R/B</option>
            </select>
          </div>
          <div class="row">
            <label for="waterFlowFlipXToggle">Flip Flow X</label>
            <input id="waterFlowFlipXToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterFlowFlipYToggle">Flip Flow Y</label>
            <input id="waterFlowFlipYToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterFlowUseMagnitudeToggle">Use B Magnitude</label>
            <input id="waterFlowUseMagnitudeToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterFlowInvertDownhillToggle">Invert Downhill</label>
            <input id="waterFlowInvertDownhillToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterFlowDebugToggle">Flow Debug</label>
            <input id="waterFlowDebugToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="waterTimeRouting">Time Source</label>
            <select id="waterTimeRouting">
              <option value="detached" selected>Detached</option>
              <option value="global">Global</option>
            </select>
          </div>
          <div class="row">
            <label for="waterFlowDirection">Flow Direction</label>
            <div class="inline-control">
              <input id="waterFlowDirection" type="range" min="0" max="360" step="1" value="135" />
              <span id="waterFlowDirectionValue">135 deg</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowStrength">Flow Strength</label>
            <div class="inline-control">
              <input id="waterFlowStrength" type="range" min="0" max="0.15" step="0.001" value="0.045" />
              <span id="waterFlowStrengthValue">0.045</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowMapStrength">Flowmap Strength</label>
            <div class="inline-control">
              <input id="waterFlowMapStrength" type="range" min="0" max="4" step="0.05" value="1" />
              <span id="waterFlowMapStrengthValue">1.00</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowVisibility">Flow Visibility</label>
            <div class="inline-control">
              <input id="waterFlowVisibility" type="range" min="0" max="4" step="0.05" value="1" />
              <span id="waterFlowVisibilityValue">1.00</span>
            </div>
          </div>
          <div class="row">
            <label for="waterStreamlineDensity">Line Density</label>
            <div class="inline-control">
              <input id="waterStreamlineDensity" type="range" min="4" max="80" step="1" value="32" />
              <span id="waterStreamlineDensityValue">32</span>
            </div>
          </div>
          <div class="row">
            <label for="waterStreamlineSharpness">Line Sharpness</label>
            <div class="inline-control">
              <input id="waterStreamlineSharpness" type="range" min="0" max="1" step="0.01" value="0.55" />
              <span id="waterStreamlineSharpnessValue">0.55</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowSpeed">Flow Speed</label>
            <div class="inline-control">
              <input id="waterFlowSpeed" type="range" min="0" max="2.5" step="0.01" value="0.75" />
              <span id="waterFlowSpeedValue">0.75</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowScale">Flow Scale</label>
            <div class="inline-control">
              <input id="waterFlowScale" type="range" min="0.5" max="14" step="0.05" value="4.2" />
              <span id="waterFlowScaleValue">4.20</span>
            </div>
          </div>
          <div class="row">
            <label for="waterLocalFlowMix">Local Flow Mix</label>
            <div class="inline-control">
              <input id="waterLocalFlowMix" type="range" min="0" max="1" step="0.01" value="0.35" />
              <span id="waterLocalFlowMixValue">0.35</span>
            </div>
          </div>
          <div class="row">
            <label for="waterDownhillBoost">Downhill Boost</label>
            <div class="inline-control">
              <input id="waterDownhillBoost" type="range" min="0" max="4" step="0.05" value="1" />
              <span id="waterDownhillBoostValue">1.00</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowRadius1">Trend Radius 1</label>
            <div class="inline-control">
              <input id="waterFlowRadius1" type="range" min="1" max="12" step="1" value="1" />
              <span id="waterFlowRadius1Value">1</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowRadius2">Trend Radius 2</label>
            <div class="inline-control">
              <input id="waterFlowRadius2" type="range" min="1" max="24" step="1" value="3" />
              <span id="waterFlowRadius2Value">3</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowRadius3">Trend Radius 3</label>
            <div class="inline-control">
              <input id="waterFlowRadius3" type="range" min="1" max="40" step="1" value="6" />
              <span id="waterFlowRadius3Value">6</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowWeight1">Trend Weight 1</label>
            <div class="inline-control">
              <input id="waterFlowWeight1" type="range" min="0" max="1" step="0.01" value="0.22" />
              <span id="waterFlowWeight1Value">0.22</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowWeight2">Trend Weight 2</label>
            <div class="inline-control">
              <input id="waterFlowWeight2" type="range" min="0" max="1" step="0.01" value="0.33" />
              <span id="waterFlowWeight2Value">0.33</span>
            </div>
          </div>
          <div class="row">
            <label for="waterFlowWeight3">Trend Weight 3</label>
            <div class="inline-control">
              <input id="waterFlowWeight3" type="range" min="0" max="1" step="0.01" value="0.45" />
              <span id="waterFlowWeight3Value">0.45</span>
            </div>
          </div>
          <div class="row">
            <label for="waterShimmerStrength">Shimmer</label>
            <div class="inline-control">
              <input id="waterShimmerStrength" type="range" min="0" max="0.2" step="0.001" value="0.05" />
              <span id="waterShimmerStrengthValue">0.050</span>
            </div>
          </div>
          <div class="row">
            <label for="waterGlintStrength">Glint Strength</label>
            <div class="inline-control">
              <input id="waterGlintStrength" type="range" min="0" max="1.5" step="0.01" value="0.55" />
              <span id="waterGlintStrengthValue">0.55</span>
            </div>
          </div>
          <div class="row">
            <label for="waterGlintSharpness">Glint Sharpness</label>
            <div class="inline-control">
              <input id="waterGlintSharpness" type="range" min="0" max="1" step="0.01" value="0.55" />
              <span id="waterGlintSharpnessValue">0.55</span>
            </div>
          </div>
          <div class="row">
            <label for="waterShoreFoamStrength">Shore Foam</label>
            <div class="inline-control">
              <input id="waterShoreFoamStrength" type="range" min="0" max="0.5" step="0.01" value="0.14" />
              <span id="waterShoreFoamStrengthValue">0.14</span>
            </div>
          </div>
          <div class="row">
            <label for="waterShoreWidth">Shore Width</label>
            <div class="inline-control">
              <input id="waterShoreWidth" type="range" min="0.4" max="6" step="0.1" value="2.2" />
              <span id="waterShoreWidthValue">2.2 px</span>
            </div>
          </div>
          <div class="row">
            <label for="waterReflectivity">Reflectivity</label>
            <div class="inline-control">
              <input id="waterReflectivity" type="range" min="0" max="1" step="0.01" value="0.33" />
              <span id="waterReflectivityValue">0.33</span>
            </div>
          </div>
          <div class="row">
            <label for="waterBaseColor">Water Color</label>
            <input id="waterBaseColor" type="color" value="#245f73" />
          </div>
          <div class="row">
            <label for="waterOpacity">Water Opacity</label>
            <div class="inline-control">
              <input id="waterOpacity" type="range" min="0" max="1" step="0.01" value="0.25" />
              <span id="waterOpacityValue">0.25</span>
            </div>
          </div>
          <div class="row">
            <label for="waterTintColor">Water Tint</label>
            <input id="waterTintColor" type="color" value="#4aa6c8" />
          </div>
          <div class="row">
            <label for="waterTintStrength">Tint Strength</label>
            <div class="inline-control">
              <input id="waterTintStrength" type="range" min="0" max="1" step="0.01" value="0.20" />
              <span id="waterTintStrengthValue">0.20</span>
            </div>
          </div>
            </div>`;
}
