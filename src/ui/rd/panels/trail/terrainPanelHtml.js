export function getRdTrailTerrainPanelHtml() {
  return `
            <div id="rdTrailTerrainPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="terrain" aria-labelledby="rdTrailTerrainTab" aria-hidden="true">
              <p class="panel-note">Terrain coupling for Slime sensor scoring.</p>
          <div class="row">
            <label for="slimeUseTerrain">Use Terrain</label>
            <input id="slimeUseTerrain" type="checkbox" checked />
          </div>
          <div class="row">
            <label for="slimeTerrainMix">Terrain Mix</label>
            <div class="inline-control">
              <input id="slimeTerrainMix" type="range" min="0" max="10" step="0.1" value="10" />
              <span id="slimeTerrainMixValue">10.0</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeSlopeBias">Slope Bias</label>
            <div class="inline-control">
              <input id="slimeSlopeBias" type="range" min="-10" max="10" step="0.1" value="1.5" />
              <span id="slimeSlopeBiasValue">1.5</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeSlopeCutoff">Slope Cutoff</label>
            <div class="inline-control">
              <input id="slimeSlopeCutoff" type="range" min="0" max="1" step="0.01" value="0.85" />
              <span id="slimeSlopeCutoffValue">0.85</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeHeightBias">Height Bias</label>
            <div class="inline-control">
              <input id="slimeHeightBias" type="range" min="-10" max="10" step="0.1" value="0" />
              <span id="slimeHeightBiasValue">0.0</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeHeightMin">Height Min</label>
            <div class="inline-control">
              <input id="slimeHeightMin" type="range" min="0" max="1" step="0.01" value="0" />
              <span id="slimeHeightMinValue">0.00</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeHeightMax">Height Max</label>
            <div class="inline-control">
              <input id="slimeHeightMax" type="range" min="0" max="1" step="0.01" value="1" />
              <span id="slimeHeightMaxValue">1.00</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeHeightBandWeight">Height Band Weight</label>
            <div class="inline-control">
              <input id="slimeHeightBandWeight" type="range" min="0" max="10" step="0.1" value="0" />
              <span id="slimeHeightBandWeightValue">0.0</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeWaterBias">Water Bias</label>
            <div class="inline-control">
              <input id="slimeWaterBias" type="range" min="-10" max="10" step="0.1" value="2" />
              <span id="slimeWaterBiasValue">2.0</span>
            </div>
          </div>
            </div>`;
}
