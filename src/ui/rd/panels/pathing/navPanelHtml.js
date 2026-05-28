export function getRdPathingNavPanelHtml() {
  return `
<div id="resourceDebugDiscoveryPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="nav" aria-labelledby="resourceDebugDiscoveryTab" aria-hidden="true">
            <p class="panel-note">NAV uses the shared Knowledge Map for terrain visibility and long-route restrictions.</p>
            <div class="row">
              <label for="discoveryVisibilityEnabled">Terrain Visibility</label>
              <div class="inline-control">
                <input id="discoveryVisibilityEnabled" type="checkbox" aria-label="Enable NAV terrain visibility" checked />
                <span>enabled</span>
              </div>
            </div>
            <div class="row">
              <label for="discoveryVisibilityResource">Knowledge Source</label>
              <select id="discoveryVisibilityResource">
                <option value="world" selected>Shared Knowledge Map</option>
              </select>
            </div>
            <div class="row">
              <label for="discoveryVisibilityMode">Mode</label>
              <select id="discoveryVisibilityMode">
                <option value="black" selected>Black Dither</option>
                <option value="greyscale">Greyscale Unknown</option>
                <option value="desaturate">Desaturate by Knowledge</option>
                <option value="debug">Debug Knowledge</option>
              </select>
            </div>
            <div class="row">
              <label for="discoveryVisibilityDitherScale">Dither Cell px</label>
              <div class="inline-control">
                <input id="discoveryVisibilityDitherScale" type="range" min="0.25" max="16" step="0.25" value="1" />
                <span id="discoveryVisibilityDitherScaleValue">1.00</span>
              </div>
            </div>
            <div class="row">
              <label for="discoveryVisibilityKnowledgeGamma">Knowledge Gamma</label>
              <div class="inline-control">
                <input id="discoveryVisibilityKnowledgeGamma" type="range" min="0.1" max="4" step="0.05" value="1" />
                <span id="discoveryVisibilityKnowledgeGammaValue">1.00</span>
              </div>
            </div>
            <div class="row">
              <label for="discoveryVisibilityBase">Base Visibility</label>
              <div class="inline-control">
                <input id="discoveryVisibilityBase" type="range" min="0" max="1" step="0.01" value="0.2" />
                <span id="discoveryVisibilityBaseValue">0.20</span>
              </div>
            </div>
            <div class="row">
              <label for="discoveryVisibilityFullThreshold">Full Visible At</label>
              <div class="inline-control">
                <input id="discoveryVisibilityFullThreshold" type="range" min="0" max="1" step="0.01" value="0.8" />
                <span id="discoveryVisibilityFullThresholdValue">0.80</span>
              </div>
            </div>
            <div class="row">
              <label for="discoveryVisibilityUnknownDarkness">Unknown Dark</label>
              <div class="inline-control">
                <input id="discoveryVisibilityUnknownDarkness" type="range" min="0" max="1" step="0.01" value="1" />
                <span id="discoveryVisibilityUnknownDarknessValue">1.00</span>
              </div>
            </div>
            <p class="panel-note">Route rules for NAV.</p>
            <div class="row">
              <label for="routeDiscoveryCutoff">Knowledge Cutoff</label>
              <div class="inline-control">
                <input id="routeDiscoveryCutoff" type="range" min="0" max="1" step="0.01" value="0" />
                <span id="routeDiscoveryCutoffValue">0.00</span>
              </div>
            </div>
            <div class="row">
              <label for="routePlanningSlopeMul">Slope Mul</label>
              <div class="inline-control">
                <input id="routePlanningSlopeMul" type="range" min="0" max="3" step="0.01" value="1" />
                <span id="routePlanningSlopeMulValue">1.00</span>
              </div>
            </div>
            <div class="row">
              <label for="routePlanningHeightMul">Height Mul</label>
              <div class="inline-control">
                <input id="routePlanningHeightMul" type="range" min="0" max="3" step="0.01" value="1" />
                <span id="routePlanningHeightMulValue">1.00</span>
              </div>
            </div>
            <div class="row">
              <label for="routePlanningWaterMul">Water Mul</label>
              <div class="inline-control">
                <input id="routePlanningWaterMul" type="range" min="0" max="3" step="0.01" value="1" />
                <span id="routePlanningWaterMulValue">1.00</span>
              </div>
            </div>
            <div class="row">
              <label for="routePlanningSlopeCutoffAdd">Slope Cutoff Add</label>
              <div class="inline-control">
                <input id="routePlanningSlopeCutoffAdd" type="range" min="-1" max="1" step="0.01" value="0" />
                <span id="routePlanningSlopeCutoffAddValue">0.00</span>
              </div>
            </div>
            <div class="row">
              <label>Committed Route</label>
              <div class="inline-control">
                <button id="routeClearBtn" class="row-action-btn" type="button">Clear Route</button>
              </div>
            </div>
          </div>`;
}
