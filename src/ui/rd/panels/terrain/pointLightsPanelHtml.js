export function getRdTerrainPointLightsPanelHtml() {
  return `
            <div id="rdTerrainPointLightsPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="point-lights" aria-labelledby="rdTerrainPointLightsTab" aria-hidden="true">
          <div class="row">
            <label for="pointLightGizmoToggle">Show Gizmos</label>
            <input id="pointLightGizmoToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="pointFlickerToggle">Light Flicker</label>
            <input id="pointFlickerToggle" type="checkbox" checked />
          </div>
          <div class="row">
            <label for="pointFlickerStrength">Flicker Amount</label>
            <div class="inline-control">
              <input id="pointFlickerStrength" type="range" min="0" max="1" step="0.01" value="0.55" />
              <span id="pointFlickerStrengthValue">0.55</span>
            </div>
          </div>
          <div class="row">
            <label for="pointFlickerSpeed">Flicker Speed</label>
            <div class="inline-control">
              <input id="pointFlickerSpeed" type="range" min="0.10" max="12" step="0.05" value="2.40" />
              <span id="pointFlickerSpeedValue">2.40 Hz</span>
            </div>
          </div>
          <div class="row">
            <label for="pointFlickerSpatial">Flicker Chaos</label>
            <div class="inline-control">
              <input id="pointFlickerSpatial" type="range" min="0" max="4" step="0.05" value="1.00" />
              <span id="pointFlickerSpatialValue">1.00</span>
            </div>
          </div>
<p id="lightEditorEmpty" class="light-editor-empty">No light selected.</p>
          <div id="lightEditorFields" class="light-editor-fields">
            <p id="lightCoord" class="light-editor-coord">Coord: (-, -)</p>
            <div class="row">
              <label for="pointLightColor">Color</label>
              <input id="pointLightColor" type="color" value="#ff9b2f" />
            </div>
            <div class="row">
              <label for="pointLightStrength">Range</label>
              <div class="inline-control">
                <input id="pointLightStrength" type="range" min="1" max="200" step="1" value="30" />
                <span id="pointLightStrengthValue">30 px</span>
              </div>
            </div>
            <div class="row">
              <label for="pointLightIntensity">Intensity</label>
              <div class="inline-control">
                <input id="pointLightIntensity" type="range" min="0" max="4" step="0.01" value="1" />
                <span id="pointLightIntensityValue">1.00x</span>
              </div>
            </div>
            <div class="row">
              <label for="pointLightHeightOffset">Height</label>
              <div class="inline-control">
                <input id="pointLightHeightOffset" type="range" min="-120" max="240" step="1" value="8" />
                <span id="pointLightHeightOffsetValue">8 px</span>
              </div>
            </div>
            <div class="row">
              <label for="pointLightFlicker">Flicker</label>
              <div class="inline-control">
                <input id="pointLightFlicker" type="range" min="0" max="1" step="0.01" value="0.70" />
                <span id="pointLightFlickerValue">0.70</span>
              </div>
            </div>
            <div class="row">
              <label for="pointLightFlickerSpeed">Flicker Speed</label>
              <div class="inline-control">
                <input id="pointLightFlickerSpeed" type="range" min="0" max="1" step="0.01" value="0.50" />
                <span id="pointLightFlickerSpeedValue">0.50</span>
              </div>
            </div>
            <div class="row">
              <label for="pointLightLiveUpdateToggle">Live Update</label>
              <input id="pointLightLiveUpdateToggle" type="checkbox" />
            </div>
            <div class="light-editor-actions">
              <button id="lightSaveBtn" type="button">Save</button>
              <button id="lightCancelBtn" type="button">Cancel</button>
              <button id="lightDeleteBtn" type="button">Delete</button>
            </div>
          </div>
            </div>`;
}
