export function getRdTrailBrushPanelHtml() {
  return `
            <div id="rdTrailBrushPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="brush" aria-labelledby="rdTrailBrushTab" aria-hidden="true">
              <p class="panel-note">Legacy Slime canvas brush perturbation settings.</p>
          <div class="row">
            <label for="slimeBrushRadius">Brush Radius</label>
            <div class="inline-control">
              <input id="slimeBrushRadius" type="range" min="1" max="512" step="1" value="60" />
              <span id="slimeBrushRadiusValue">60 px</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeBrushTrailClear">Trail Clear</label>
            <div class="inline-control">
              <input id="slimeBrushTrailClear" type="range" min="0" max="1" step="0.01" value="0.85" />
              <span id="slimeBrushTrailClearValue">0.85</span>
            </div>
          </div>
            </div>`;
}
