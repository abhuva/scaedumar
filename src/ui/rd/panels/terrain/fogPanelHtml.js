export function getRdTerrainFogPanelHtml() {
  return `
            <div id="rdTerrainFogPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="fog" aria-labelledby="rdTerrainFogTab" aria-hidden="true">
<div class="row">
            <label for="fogToggle">Height Fog</label>
            <input id="fogToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="fogColor">Fog Color</label>
            <input id="fogColor" type="color" value="#7f8d99" />
          </div>
          <div class="row">
            <label for="fogMinAlpha">Fog Min Alpha</label>
            <div class="inline-control">
              <input id="fogMinAlpha" type="range" min="0" max="1" step="0.01" value="0.06" />
              <span id="fogMinAlphaValue">0.06</span>
            </div>
          </div>
          <div class="row">
            <label for="fogMaxAlpha">Fog Max Alpha</label>
            <div class="inline-control">
              <input id="fogMaxAlpha" type="range" min="0" max="1" step="0.01" value="0.55" />
              <span id="fogMaxAlphaValue">0.55</span>
            </div>
          </div>
          <div class="row">
            <label for="fogFalloff">Fog Falloff</label>
            <div class="inline-control">
              <input id="fogFalloff" type="range" min="0.2" max="4" step="0.05" value="1.20" />
              <span id="fogFalloffValue">1.20</span>
            </div>
          </div>
          <div class="row">
            <label for="fogStartOffset">Fog Start Offset</label>
            <div class="inline-control">
              <input id="fogStartOffset" type="range" min="0" max="1" step="0.01" value="0.00" />
              <span id="fogStartOffsetValue">0.00</span>
            </div>
          </div>
            </div>`;
}
