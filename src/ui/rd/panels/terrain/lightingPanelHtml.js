export function getRdTerrainLightingPanelHtml() {
  return `
            <div id="rdTerrainLightingPanel" class="rd-tab-panel active" role="tabpanel" data-rd-panel="lighting" aria-labelledby="rdTerrainLightingTab" aria-hidden="false">
<input id="cycleSpeed" type="hidden" value="0.08" />
          <div class="row">
            <label for="cycleHour">Time of Day</label>
            <div class="inline-control">
              <input id="cycleHour" type="range" min="0" max="24" step="0.0166667" value="9.5" />
              <span id="cycleHourValue">09:30</span>
            </div>
          </div>
          <div class="row">
            <label for="simTickHours">Sim Tick (h)</label>
            <div class="inline-control">
              <input id="simTickHours" type="range" min="0.001" max="0.1" step="0.001" value="0.01" />
              <span id="simTickHoursValue">0.010</span>
            </div>
          </div>
          <div class="row">
            <label for="shadowsToggle">Shadows</label>
            <input id="shadowsToggle" type="checkbox" checked />
          </div>
          <div class="row">
            <label for="heightScale">Height Scale</label>
            <input id="heightScale" type="range" min="1" max="300" value="80" />
          </div>
          <div class="row">
            <label for="shadowStrength">Shadow Strength</label>
            <input id="shadowStrength" type="range" min="0" max="1" step="0.01" value="0.6" />
          </div>
          <div class="row">
            <label for="shadowBlur">Shadow Blur</label>
            <div class="inline-control">
              <input id="shadowBlur" type="range" min="0" max="3" step="0.05" value="0" />
              <span id="shadowBlurValue">0.00 px</span>
            </div>
          </div>
          <div class="row">
            <label for="ambient">Ambient</label>
            <div class="inline-control">
              <input id="ambient" type="range" min="0" max="1" step="0.01" value="0.35" />
              <span id="ambientValue">0.35</span>
            </div>
          </div>
          <div class="row">
            <label for="diffuse">Diffuse</label>
            <div class="inline-control">
              <input id="diffuse" type="range" min="0" max="2" step="0.01" value="1" />
              <span id="diffuseValue">1.00</span>
            </div>
          </div>
            </div>`;
}
