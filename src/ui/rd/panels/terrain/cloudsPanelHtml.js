export function getRdTerrainCloudsPanelHtml() {
  return `
            <div id="rdTerrainCloudsPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="clouds" aria-labelledby="rdTerrainCloudsTab" aria-hidden="true">
<div class="row">
            <label for="cloudToggle">Cloud Shadows</label>
            <input id="cloudToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="cloudCoverage">Coverage</label>
            <div class="inline-control">
              <input id="cloudCoverage" type="range" min="0" max="1" step="0.01" value="0.58" />
              <span id="cloudCoverageValue">0.58</span>
            </div>
          </div>
          <div class="row">
            <label for="cloudSoftness">Softness</label>
            <div class="inline-control">
              <input id="cloudSoftness" type="range" min="0.01" max="0.35" step="0.01" value="0.12" />
              <span id="cloudSoftnessValue">0.12</span>
            </div>
          </div>
          <div class="row">
            <label for="cloudOpacity">Opacity</label>
            <div class="inline-control">
              <input id="cloudOpacity" type="range" min="0" max="1" step="0.01" value="0.35" />
              <span id="cloudOpacityValue">0.35</span>
            </div>
          </div>
          <div class="row">
            <label for="cloudScale">Scale</label>
            <div class="inline-control">
              <input id="cloudScale" type="range" min="0.5" max="8" step="0.05" value="2.20" />
              <span id="cloudScaleValue">2.20</span>
            </div>
          </div>
          <div class="row">
            <label for="cloudSpeed1">Layer A Speed</label>
            <div class="inline-control">
              <input id="cloudSpeed1" type="range" min="-0.30" max="0.30" step="0.005" value="0.018" />
              <span id="cloudSpeed1Value">0.018</span>
            </div>
          </div>
          <div class="row">
            <label for="cloudSpeed2">Layer B Speed</label>
            <div class="inline-control">
              <input id="cloudSpeed2" type="range" min="-0.30" max="0.30" step="0.005" value="-0.012" />
              <span id="cloudSpeed2Value">-0.012</span>
            </div>
          </div>
          <div class="row">
            <label for="cloudTimeRouting">Time Source</label>
            <select id="cloudTimeRouting">
              <option value="global" selected>Global</option>
              <option value="detached">Detached</option>
            </select>
          </div>
            </div>`;
}
