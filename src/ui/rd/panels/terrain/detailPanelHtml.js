export function getRdTerrainDetailPanelHtml() {
  return `
            <div id="rdTerrainDetailPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="detail" aria-labelledby="rdTerrainDetailTab" aria-hidden="true">
<p class="help">The current terrain color map stays as the base. The material splat map is normalized RGBA: R dirt, G rock, B grass, A snow. Tile px means terrain-map pixels.</p>
          <div class="row">
            <label for="detailEnabled">Zoom Detail</label>
            <input id="detailEnabled" type="checkbox" data-detail-path="enabled" checked />
          </div>
          <div class="row">
            <label for="detailBlendMode">Material Blend</label>
            <select id="detailBlendMode" data-detail-path="transition.blendMode" data-detail-format="text">
              <option value="smooth">Smooth</option>
              <option value="dithered">Dithered</option>
              <option value="priorityDither">Priority Dither</option>
            </select>
          </div>
          <div class="row">
            <label for="detailDebugChannel">Detail Debug</label>
            <select id="detailDebugChannel" data-detail-path="transition.debugChannel" data-detail-format="text">
              <option value="none">Off</option>
              <option value="rgba">Raw RGBA</option>
              <option value="red">Dirt / R</option>
              <option value="green">Rock / G</option>
              <option value="blue">Grass / B</option>
              <option value="alpha">Snow / A</option>
            </select>
          </div>
          <div class="row">
            <label for="detailQuantizationSteps">Weight Steps</label>
            <div class="inline-control">
              <input id="detailQuantizationSteps" type="range" min="0" max="32" step="1" value="0" data-detail-path="transition.quantizationSteps" data-detail-value="detailQuantizationStepsValue" data-detail-format="int" />
              <span id="detailQuantizationStepsValue">0</span>
            </div>
          </div>
          <div class="row">
            <label for="detailDitherScale">Dither Cell map px</label>
            <select id="detailDitherScale" data-detail-path="transition.ditherScale">
              <option value="1">1024 px / 1 map px</option>
              <option value="0.5">512 px</option>
              <option value="0.25">256 px</option>
              <option value="0.125">128 px</option>
              <option value="0.0625">64 px</option>
              <option value="0.03125">32 px</option>
            </select>
          </div>
          <div class="row">
            <label for="detailDitherStrength">Priority Noise</label>
            <div class="inline-control">
              <input id="detailDitherStrength" type="range" min="0" max="1" step="0.01" value="0.18" data-detail-path="transition.ditherStrength" data-detail-value="detailDitherStrengthValue" />
              <span id="detailDitherStrengthValue">0.18</span>
            </div>
          </div>
          <div class="row">
            <label for="detailMinWeight">Min Weight</label>
            <div class="inline-control">
              <input id="detailMinWeight" type="range" min="0" max="0.25" step="0.005" value="0" data-detail-path="transition.minWeight" data-detail-value="detailMinWeightValue" data-detail-format="3" />
              <span id="detailMinWeightValue">0.000</span>
            </div>
          </div>
          <div class="row">
            <label for="detailStartPxPerMeter">Fade Start px/m</label>
            <div class="inline-control">
              <input id="detailStartPxPerMeter" type="range" min="0" max="128" step="0.5" value="4" data-detail-path="zoom.startPxPerMeter" data-detail-value="detailStartPxPerMeterValue" data-detail-format="1" />
              <span id="detailStartPxPerMeterValue">4.0</span>
            </div>
          </div>
          <div class="row">
            <label for="detailFullPxPerMeter">Fade Full px/m</label>
            <div class="inline-control">
              <input id="detailFullPxPerMeter" type="range" min="0" max="256" step="0.5" value="16" data-detail-path="zoom.fullPxPerMeter" data-detail-value="detailFullPxPerMeterValue" data-detail-format="1" />
              <span id="detailFullPxPerMeterValue">16.0</span>
            </div>
          </div>
          <h2>Dirt - Slot 0</h2>
          <div class="row">
            <label for="detailMaterial0Priority">Dirt Priority</label>
            <div class="inline-control">
              <input id="detailMaterial0Priority" type="range" min="-0.2" max="0.2" step="0.005" value="-0.02" data-detail-path="transition.priorities.0" data-detail-value="detailMaterial0PriorityValue" data-detail-format="3" />
              <span id="detailMaterial0PriorityValue">-0.020</span>
            </div>
          </div>
          <div class="row">
            <label for="detailMaterial0MicroScale">Dirt Micro Tile px</label>
            <select id="detailMaterial0MicroScale" data-detail-path="materials.0.micro.scaleMeters">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="32">32</option>
            </select>
          </div>
          <div class="row">
            <label for="detailMaterial0MicroColor">Dirt Micro Color</label>
            <div class="inline-control">
              <input id="detailMaterial0MicroColor" type="range" min="0" max="1" step="0.01" value="1" data-detail-path="materials.0.micro.colorStrength" data-detail-value="detailMaterial0MicroColorValue" />
              <span id="detailMaterial0MicroColorValue">1.00</span>
            </div>
          </div>
          <h2>Rock - Slot 1</h2>
          <div class="row">
            <label for="detailMaterial1Priority">Rock Priority</label>
            <div class="inline-control">
              <input id="detailMaterial1Priority" type="range" min="-0.2" max="0.2" step="0.005" value="0.05" data-detail-path="transition.priorities.1" data-detail-value="detailMaterial1PriorityValue" data-detail-format="3" />
              <span id="detailMaterial1PriorityValue">0.050</span>
            </div>
          </div>
          <div class="row">
            <label for="detailMaterial1MicroScale">Rock Micro Tile px</label>
            <select id="detailMaterial1MicroScale" data-detail-path="materials.1.micro.scaleMeters">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="32">32</option>
            </select>
          </div>
          <div class="row">
            <label for="detailMaterial1MicroColor">Rock Micro Color</label>
            <div class="inline-control">
              <input id="detailMaterial1MicroColor" type="range" min="0" max="1" step="0.01" value="1" data-detail-path="materials.1.micro.colorStrength" data-detail-value="detailMaterial1MicroColorValue" />
              <span id="detailMaterial1MicroColorValue">1.00</span>
            </div>
          </div>
          <h2>Grass - Slot 2</h2>
          <div class="row">
            <label for="detailMaterial2Priority">Grass Priority</label>
            <div class="inline-control">
              <input id="detailMaterial2Priority" type="range" min="-0.2" max="0.2" step="0.005" value="0" data-detail-path="transition.priorities.2" data-detail-value="detailMaterial2PriorityValue" data-detail-format="3" />
              <span id="detailMaterial2PriorityValue">0.000</span>
            </div>
          </div>
          <div class="row">
            <label for="detailMaterial2MicroScale">Grass Micro Tile px</label>
            <select id="detailMaterial2MicroScale" data-detail-path="materials.2.micro.scaleMeters">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="32">32</option>
            </select>
          </div>
          <div class="row">
            <label for="detailMaterial2MicroColor">Grass Micro Color</label>
            <div class="inline-control">
              <input id="detailMaterial2MicroColor" type="range" min="0" max="1" step="0.01" value="1" data-detail-path="materials.2.micro.colorStrength" data-detail-value="detailMaterial2MicroColorValue" />
              <span id="detailMaterial2MicroColorValue">1.00</span>
            </div>
          </div>
          <h2>Snow - Slot 3</h2>
          <div class="row">
            <label for="detailMaterial3Priority">Snow Priority</label>
            <div class="inline-control">
              <input id="detailMaterial3Priority" type="range" min="-0.2" max="0.2" step="0.005" value="0.03" data-detail-path="transition.priorities.3" data-detail-value="detailMaterial3PriorityValue" data-detail-format="3" />
              <span id="detailMaterial3PriorityValue">0.030</span>
            </div>
          </div>
          <div class="row">
            <label for="detailMaterial3MicroScale">Snow Micro Tile px</label>
            <select id="detailMaterial3MicroScale" data-detail-path="materials.3.micro.scaleMeters">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="32">32</option>
            </select>
          </div>
          <div class="row">
            <label for="detailMaterial3MicroColor">Snow Micro Color</label>
            <div class="inline-control">
              <input id="detailMaterial3MicroColor" type="range" min="0" max="1" step="0.01" value="1" data-detail-path="materials.3.micro.colorStrength" data-detail-value="detailMaterial3MicroColorValue" />
              <span id="detailMaterial3MicroColorValue">1.00</span>
            </div>
          </div>
            </div>`;
}
