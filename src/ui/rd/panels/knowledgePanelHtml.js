export function getRdKnowledgePanelHtml() {
  return `
          <div id="rdDevKnowledgePanel" class="rd-dev-panel active" role="tabpanel" data-rd-dev-panel="knowledge" aria-hidden="false">
          <div class="rd-tabs" role="tablist" aria-label="Resource Debug sections" data-rd-tab-group="knowledge" data-rd-tab-fallback="knowledge">
            <button id="resourceDebugKnowledgeTab" class="rd-tab active" type="button" role="tab" data-rd-tab="knowledge" aria-selected="true" aria-controls="resourceDebugKnowledgePanel" tabindex="0">Knowledge</button>
            <button id="resourceDebugOverlayTab" class="rd-tab" type="button" role="tab" data-rd-tab="overlay" aria-selected="false" aria-controls="resourceDebugOverlayPanel" tabindex="-1">Known View</button>
            <button id="resourceDebugStockTab" class="rd-tab" type="button" role="tab" data-rd-tab="stock" aria-selected="false" aria-controls="resourceDebugStockPanel" tabindex="-1">Stock</button>
          </div>
          <div id="resourceDebugKnowledgePanel" class="rd-tab-panel active" role="tabpanel" data-rd-panel="knowledge" aria-labelledby="resourceDebugKnowledgeTab" aria-hidden="false">
            <p class="panel-note">Shared world Knowledge Map. Sliders change future reveals only; buttons below are the only direct map edits.</p>
            <div class="row">
              <label>Map Scope</label>
              <p class="panel-note">Shared World Knowledge</p>
            </div>
            <div class="row">
              <label for="resourceDebugDiscoveryGrid">Knowledge Grid</label>
            <div class="inline-control">
              <input id="resourceDebugDiscoveryGrid" type="range" min="32" max="512" step="32" value="256" />
              <span id="resourceDebugDiscoveryGridValue">256</span>
            </div>
          </div>
            <div class="row">
            <label for="resourceDebugRevealRadius">Reveal Radius</label>
            <div class="inline-control">
              <input id="resourceDebugRevealRadius" type="range" min="0" max="160" step="1" value="80" />
              <span id="resourceDebugRevealRadiusValue">80</span>
            </div>
          </div>
            <div class="row">
            <label for="resourceDebugRevealFalloff">Reveal Falloff</label>
            <div class="inline-control">
              <input id="resourceDebugRevealFalloff" type="range" min="0" max="4" step="0.05" value="0.15" />
              <span id="resourceDebugRevealFalloffValue">0.15</span>
            </div>
          </div>
            <div class="row">
            <label for="resourceDebugDecayEnabled">Decay</label>
            <div class="inline-control">
              <input id="resourceDebugDecayEnabled" type="checkbox" checked aria-label="Enable knowledge decay" />
              <span>enabled</span>
            </div>
          </div>
            <div class="row">
            <label for="resourceDebugDecayInterval">Decay Ticks</label>
            <div class="inline-control">
              <input id="resourceDebugDecayInterval" type="range" min="1" max="5000" step="1" value="500" />
              <span id="resourceDebugDecayIntervalValue">500</span>
            </div>
          </div>
            <div class="row">
            <label for="resourceDebugDecayAmount">Decay Amount</label>
            <div class="inline-control">
              <input id="resourceDebugDecayAmount" type="range" min="0" max="32" step="1" value="1" />
              <span id="resourceDebugDecayAmountValue">1</span>
            </div>
          </div>
            <div class="row">
            <label for="resourceDebugShowMaskOverlay">Show Knowledge Map</label>
            <div class="inline-control">
              <input id="resourceDebugShowMaskOverlay" type="checkbox" aria-label="Show full Knowledge Map overlay" />
              <input id="resourceDebugMaskOverlayOpacity" type="range" min="0" max="1" step="0.05" value="0.45" aria-label="Knowledge Map overlay opacity" />
              <span id="resourceDebugMaskOverlayOpacityValue">0.45</span>
            </div>
          </div>
            <div class="row">
              <label for="discoveryNoiseSeed">Noise Seed</label>
              <div class="inline-control">
                <input id="discoveryNoiseSeed" type="range" min="0" max="9999" step="1" value="1" />
                <span id="discoveryNoiseSeedValue">1</span>
              </div>
            </div>
            <div class="row">
              <label for="discoveryNoiseScale">Noise Scale</label>
              <div class="inline-control">
                <input id="discoveryNoiseScale" type="range" min="1" max="128" step="1" value="24" />
                <span id="discoveryNoiseScaleValue">24</span>
              </div>
            </div>
            <div class="row">
              <label for="discoveryNoiseMin">Noise Min</label>
              <div class="inline-control">
                <input id="discoveryNoiseMin" type="range" min="0" max="1" step="0.01" value="0" />
                <span id="discoveryNoiseMinValue">0.00</span>
              </div>
            </div>
            <div class="row">
              <label for="discoveryNoiseMax">Noise Max</label>
              <div class="inline-control">
                <input id="discoveryNoiseMax" type="range" min="0" max="1" step="0.01" value="1" />
                <span id="discoveryNoiseMaxValue">1.00</span>
              </div>
            </div>
            <div class="row">
              <label>Knowledge Actions</label>
              <div class="inline-control">
                <button id="discoveryFillUnknownBtn" class="row-action-btn" type="button">Clear</button>
                <button id="discoveryFillKnownBtn" class="row-action-btn" type="button">Fill</button>
                <button id="discoveryNoiseApplyBtn" class="row-action-btn" type="button">Noise</button>
              </div>
            </div>
          </div>
          <div id="resourceDebugOverlayPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="overlay" aria-labelledby="resourceDebugOverlayTab" aria-hidden="true">
          <div class="row">
            <label for="resourceDebugLayer">Known View</label>
            <select id="resourceDebugLayer">
              <option value="water" selected>Water</option>
              <option value="plants">Plants</option>
              <option value="height">Height</option>
              <option value="slope">Slope</option>
            </select>
          </div>
          <div class="row">
            <label for="resourceDebugTintColor">Tint</label>
            <div class="inline-control">
              <input id="resourceDebugTintColor" type="color" value="#74d7f5" />
            </div>
          </div>







          <div class="row">
            <label for="resourceDebugSampleStep">Contour Step</label>
            <div class="inline-control">
              <input id="resourceDebugSampleStep" type="range" min="2" max="32" step="1" value="8" />
              <span id="resourceDebugSampleStepValue">8</span>
            </div>
          </div>
          <p class="panel-note">Contour Step is the marching-grid spacing in map pixels. Lower values preserve more detail but cost more; small changes can shift lines because the sampled cell grid changes.</p>
          <div class="row">
            <label for="resourceDebugKnowledgeThreshold">Knowledge Gate</label>
            <div class="inline-control">
              <input id="resourceDebugKnowledgeThreshold" type="range" min="0" max="1" step="0.01" value="0.25" />
              <span id="resourceDebugKnowledgeThresholdValue">0.25</span>
            </div>
          </div>
          <div class="row">
            <label for="resourceDebugLineWidth">Line Width</label>
            <div class="inline-control">
              <input id="resourceDebugLineWidth" type="range" min="0.25" max="4" step="0.05" value="1.25" />
              <span id="resourceDebugLineWidthValue">1.25</span>
            </div>
          </div>
          <div class="row">
            <label for="resourceDebugBand1">Band 1</label>
            <div class="inline-control">
              <input id="resourceDebugBand1Enabled" type="checkbox" checked aria-label="Enable band 1" />
              <input id="resourceDebugBand1" type="range" min="0" max="1" step="0.01" value="0.35" />
              <span id="resourceDebugBand1Value">0.35</span>
            </div>
          </div>
          <div class="row">
            <label for="resourceDebugBand2">Band 2</label>
            <div class="inline-control">
              <input id="resourceDebugBand2Enabled" type="checkbox" checked aria-label="Enable band 2" />
              <input id="resourceDebugBand2" type="range" min="0" max="1" step="0.01" value="0.55" />
              <span id="resourceDebugBand2Value">0.55</span>
            </div>
          </div>
          <div class="row">
            <label for="resourceDebugBand3">Band 3</label>
            <div class="inline-control">
              <input id="resourceDebugBand3Enabled" type="checkbox" checked aria-label="Enable band 3" />
              <input id="resourceDebugBand3" type="range" min="0" max="1" step="0.01" value="0.75" />
              <span id="resourceDebugBand3Value">0.75</span>
            </div>
          </div>
          <div class="row">
            <label for="resourceDebugBand4">Band 4</label>
            <div class="inline-control">
              <input id="resourceDebugBand4Enabled" type="checkbox" checked aria-label="Enable band 4" />
              <input id="resourceDebugBand4" type="range" min="0" max="1" step="0.01" value="0.65" />
              <span id="resourceDebugBand4Value">0.65</span>
            </div>
          </div>
          <div class="row">
            <label for="resourceDebugBand5">Band 5</label>
            <div class="inline-control">
              <input id="resourceDebugBand5Enabled" type="checkbox" checked aria-label="Enable band 5" />
              <input id="resourceDebugBand5" type="range" min="0" max="1" step="0.01" value="0.80" />
              <span id="resourceDebugBand5Value">0.80</span>
            </div>
          </div>

          </div>
          <div id="resourceDebugStockPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="stock" aria-labelledby="resourceDebugStockTab" aria-hidden="true">
            <p class="panel-note">Resource stock controls. Stock affects actual search chance and recovery; it is separate from the Knowledge Map.</p>
            <div class="row">
              <label for="resourceStockResource">Resource</label>
              <select id="resourceStockResource">
                <option value="water" selected>Water</option>
                <option value="plants">Plants</option>
              </select>
            </div>
            <div class="row">
              <label for="resourceStockOverlayMode">Stock View</label>
              <select id="resourceStockOverlayMode">
                <option value="known" selected>Known</option>
                <option value="live">Live</option>
                <option value="none">Ignore</option>
              </select>
            </div>
            <div class="row">
              <label for="resourceStockGridSize">Grid Size</label>
              <div class="inline-control">
                <input id="resourceStockGridSize" type="range" min="32" max="512" step="32" value="128" />
                <span id="resourceStockGridSizeValue">128</span>
              </div>
            </div>
            <div class="row">
              <label for="resourceStockDepleteAmount">Deplete Center</label>
              <div class="inline-control">
                <input id="resourceStockDepleteAmount" type="range" min="0" max="255" step="1" value="50" />
                <span id="resourceStockDepleteAmountValue">50</span>
              </div>
            </div>
            <div class="row">
              <label for="resourceStockNeighborDepleteAmount">Deplete Neighbor</label>
              <div class="inline-control">
                <input id="resourceStockNeighborDepleteAmount" type="range" min="0" max="255" step="1" value="25" />
                <span id="resourceStockNeighborDepleteAmountValue">25</span>
              </div>
            </div>
            <div class="row">
              <label for="resourceStockDepleteRadius">Deplete Radius</label>
              <div class="inline-control">
                <input id="resourceStockDepleteRadius" type="range" min="0" max="4" step="1" value="1" />
                <span id="resourceStockDepleteRadiusValue">1</span>
              </div>
            </div>
            <div class="row">
              <label for="resourceStockReplenishInterval">Regen Ticks</label>
              <div class="inline-control">
                <input id="resourceStockReplenishInterval" type="range" min="1" max="5000" step="1" value="50" />
                <span id="resourceStockReplenishIntervalValue">50</span>
              </div>
            </div>
            <div class="row">
              <label for="resourceStockReplenishAmount">Regen Amount</label>
              <div class="inline-control">
                <input id="resourceStockReplenishAmount" type="range" min="0" max="255" step="1" value="250" />
                <span id="resourceStockReplenishAmountValue">250</span>
              </div>
            </div>
            <div class="row">
              <label>At Player</label>
              <p id="resourceStockReadout" class="panel-note">Stock: -- | Known: -- | Chance: --</p>
            </div>
            <div class="row">
              <label>Stock Actions</label>
              <div class="inline-control">
                <button id="resourceStockDepleteHereBtn" class="row-action-btn" type="button">Deplete Here</button>
                <button id="resourceStockRevealHereBtn" class="row-action-btn" type="button">Reveal Stock</button>
              </div>
            </div>
            <div class="row">
              <label>Fill</label>
              <div class="inline-control">
                <button id="resourceStockFillFullBtn" class="row-action-btn" type="button">Full</button>
                <button id="resourceStockFillEmptyBtn" class="row-action-btn" type="button">Empty</button>
                <button id="resourceStockResetBtn" class="row-action-btn" type="button">Reset</button>
              </div>
            </div>
          </div>
          </div>`;
}
