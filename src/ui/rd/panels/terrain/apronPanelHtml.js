export function getRdTerrainApronPanelHtml() {
  return `
            <div id="rdTerrainApronPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="apron" aria-labelledby="rdTerrainApronTab" aria-hidden="true">
<p class="help">Terrain apron is a visual-only mirrored background outside the playable map. It does not affect terrain sampling, movement, resources, or shadows.</p>
          <p id="terrainApronStatus" class="help">Status: not checked yet.</p>
          <div class="row">
            <label for="terrainApronEnabled">Apron</label>
            <input id="terrainApronEnabled" type="checkbox" data-apron-path="enabled" />
          </div>
          <div class="row">
            <label for="terrainApronUseAuthored">Use apron.png</label>
            <input id="terrainApronUseAuthored" type="checkbox" data-apron-path="useAuthoredImage" />
          </div>
          <div class="row">
            <label for="terrainApronResolution">Generated Size</label>
            <select id="terrainApronResolution" data-apron-path="resolution">
              <option value="256">256</option>
              <option value="512">512</option>
              <option value="1024">1024</option>
              <option value="2048">2048</option>
            </select>
          </div>
          <div class="row">
            <label for="terrainApronFadeStart">Fade Start</label>
            <div class="inline-control">
              <input id="terrainApronFadeStart" type="range" min="0" max="1" step="0.01" value="0.05" data-apron-path="fadeStart" data-apron-value="terrainApronFadeStartValue" />
              <span id="terrainApronFadeStartValue">0.05</span>
            </div>
          </div>
          <div class="row">
            <label for="terrainApronFadeEnd">Fade End</label>
            <div class="inline-control">
              <input id="terrainApronFadeEnd" type="range" min="0" max="1" step="0.01" value="1" data-apron-path="fadeEnd" data-apron-value="terrainApronFadeEndValue" />
              <span id="terrainApronFadeEndValue">1.00</span>
            </div>
          </div>
          <div class="row">
            <label for="terrainApronDitherScale">Dither Cell px</label>
            <div class="inline-control">
              <input id="terrainApronDitherScale" type="range" min="1" max="32" step="1" value="3" data-apron-path="ditherScalePx" data-apron-value="terrainApronDitherScaleValue" data-apron-format="int" />
              <span id="terrainApronDitherScaleValue">3</span>
            </div>
          </div>
          <div class="row">
            <label for="terrainApronDitherStrength">Dither Strength</label>
            <div class="inline-control">
              <input id="terrainApronDitherStrength" type="range" min="0" max="1" step="0.01" value="0.65" data-apron-path="ditherStrength" data-apron-value="terrainApronDitherStrengthValue" />
              <span id="terrainApronDitherStrengthValue">0.65</span>
            </div>
          </div>
          <div class="row">
            <label for="terrainApronFlipX">Flip X</label>
            <input id="terrainApronFlipX" type="checkbox" data-apron-path="flipX" />
          </div>
          <div class="row">
            <label for="terrainApronFlipY">Flip Y</label>
            <input id="terrainApronFlipY" type="checkbox" data-apron-path="flipY" />
          </div>
          <div class="row">
            <label for="terrainApronBackground">Background</label>
            <input id="terrainApronBackground" type="color" value="#000000" data-apron-path="backgroundColor" data-apron-format="text" />
          </div>
            </div>`;
}
