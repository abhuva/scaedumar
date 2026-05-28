export function getRdTrailPlantsPanelHtml() {
  return `
            <div id="rdTrailPlantsPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="plants" aria-labelledby="rdTrailPlantsTab" aria-hidden="true">
              <p class="panel-note">Plant attraction, consumption, regeneration, and gameplay stock sync controls.</p>
          <div class="row">
            <label for="slimePlantBias">Plant Bias</label>
            <div class="inline-control">
              <input id="slimePlantBias" type="range" min="-10" max="10" step="0.1" value="0" />
              <span id="slimePlantBiasValue">0.0</span>
            </div>
          </div>
          <div class="row">
            <label for="slimePlantFloor">Plant Floor</label>
            <div class="inline-control">
              <input id="slimePlantFloor" type="range" min="0" max="1" step="0.01" value="0.25" />
              <span id="slimePlantFloorValue">0.25</span>
            </div>
          </div>
          <div class="row">
            <label for="slimePlantEatAmount">Eat Amount</label>
            <div class="inline-control">
              <input id="slimePlantEatAmount" type="range" min="0" max="50" step="1" value="5" />
              <span id="slimePlantEatAmountValue">5</span>
            </div>
          </div>
          <div class="row">
            <label for="slimePlantEatTickInterval">Eat Tick</label>
            <div class="inline-control">
              <input id="slimePlantEatTickInterval" type="range" min="1" max="60" step="1" value="10" />
              <span id="slimePlantEatTickIntervalValue">10</span>
            </div>
          </div>
          <div class="row">
            <label for="slimePlantRegenAmount">Plant Regen</label>
            <div class="inline-control">
              <input id="slimePlantRegenAmount" type="range" min="0" max="50" step="1" value="1" />
              <span id="slimePlantRegenAmountValue">1</span>
            </div>
          </div>
          <div class="row">
            <label for="slimePlantRegenTickInterval">Regen Tick</label>
            <div class="inline-control">
              <input id="slimePlantRegenTickInterval" type="range" min="1" max="20" step="1" value="5" />
              <span id="slimePlantRegenTickIntervalValue">5</span>
            </div>
          </div>
            </div>`;
}
