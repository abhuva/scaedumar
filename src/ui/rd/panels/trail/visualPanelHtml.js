export function getRdTrailVisualPanelHtml() {
  return `
            <div id="rdTrailVisualPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="visual" aria-labelledby="rdTrailVisualTab" aria-hidden="true">
              <p class="panel-note">Trail deposit, decay, diffusion, and colorization.</p>
          <div class="row">
            <label for="slimeDepositAmount">Deposit</label>
            <div class="inline-control">
              <input id="slimeDepositAmount" type="range" min="0" max="3" step="0.05" value="0.8" />
              <span id="slimeDepositAmountValue">0.80</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeDepositSize">Deposit Size</label>
            <div class="inline-control">
              <input id="slimeDepositSize" type="range" min="1" max="8" step="0.5" value="1.5" />
              <span id="slimeDepositSizeValue">1.5</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeDiffusion">Diffusion</label>
            <div class="inline-control">
              <input id="slimeDiffusion" type="range" min="0" max="1" step="0.01" value="0.2" />
              <span id="slimeDiffusionValue">0.20</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeDecay">Decay</label>
            <div class="inline-control">
              <input id="slimeDecay" type="range" min="0.8" max="1" step="0.001" value="0.96" />
              <span id="slimeDecayValue">0.960</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeTrailGain">Trail Gain</label>
            <div class="inline-control">
              <input id="slimeTrailGain" type="range" min="0.1" max="20" step="0.1" value="3" />
              <span id="slimeTrailGainValue">3.0</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeTrailGamma">Gamma</label>
            <div class="inline-control">
              <input id="slimeTrailGamma" type="range" min="0.2" max="4" step="0.05" value="1.2" />
              <span id="slimeTrailGammaValue">1.20</span>
            </div>
          </div>
          <div class="row">
            <label for="slimePalette">Palette</label>
            <select id="slimePalette">
              <option value="fire" selected>Fire</option>
              <option value="ice">Ice</option>
              <option value="mono">Mono</option>
              <option value="toxic">Toxic</option>
            </select>
          </div>
            </div>`;
}
