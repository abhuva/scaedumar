export function getRdPathingLocalPanelHtml() {
  return `
          <div id="rdPathingLocalPanel" class="rd-tab-panel active" role="tabpanel" data-rd-panel="local" aria-labelledby="rdPathingLocalTab" aria-hidden="false">
            <p class="panel-note">Local PF movement-field and terrain-cost tuning.</p>
          <div class="row">
            <label for="pathfindingRange">Path Window</label>
            <div class="inline-control">
              <input id="pathfindingRange" type="range" min="30" max="300" step="1" value="30" />
              <span id="pathfindingRangeValue">30 x 30</span>
            </div>
          </div>
          <div class="row">
            <label for="pathWeightSlope">Weight Slope</label>
            <div class="inline-control">
              <input id="pathWeightSlope" type="range" min="0" max="10" step="0.1" value="1.8" />
              <span id="pathWeightSlopeValue">1.8</span>
            </div>
          </div>
          <div class="row">
            <label for="pathWeightHeight">Weight Height</label>
            <div class="inline-control">
              <input id="pathWeightHeight" type="range" min="0" max="10" step="0.1" value="3.0" />
              <span id="pathWeightHeightValue">3.0</span>
            </div>
          </div>
          <div class="row">
            <label for="pathWeightWater">Weight Water</label>
            <div class="inline-control">
              <input id="pathWeightWater" type="range" min="0" max="100" step="0.1" value="0.0" />
              <span id="pathWeightWaterValue">0.0</span>
            </div>
          </div>
          <div class="row">
            <label for="pathSlopeCutoff">Slope Cutoff</label>
            <div class="inline-control">
              <input id="pathSlopeCutoff" type="range" min="0" max="90" step="1" value="90" />
              <span id="pathSlopeCutoffValue">90 deg</span>
            </div>
          </div>
          <div class="row">
            <label for="pathBaseCost">Base Cost</label>
            <div class="inline-control">
              <input id="pathBaseCost" type="range" min="0" max="2" step="0.1" value="1.0" />
              <span id="pathBaseCostValue">1.0</span>
            </div>
          </div>
          </div>          `;
}
