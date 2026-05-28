export function getRdTrailTracksPanelHtml() {
  return `
            <div id="rdTrailTracksPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="tracks" aria-labelledby="rdTrailTracksTab" aria-hidden="true">
              <p class="panel-note">Slime trail availability grid. Hunting samples this same field.</p>
            <div class="row">
              <label for="slimeAvailabilityOverlayEnabled">Trail Overlay</label>
              <div class="inline-control">
                <input id="slimeAvailabilityOverlayEnabled" type="checkbox" aria-label="Show Slime trail availability overlay" />
                <input id="slimeAvailabilityOverlayOpacity" type="range" min="0" max="1" step="0.05" value="1" aria-label="Slime trail overlay opacity" />
                <span id="slimeAvailabilityOverlayOpacityValue">1.00</span>
              </div>
            </div>
            <div class="row">
              <label for="slimeAvailabilityOverlayThreshold">Overlay Threshold</label>
              <div class="inline-control">
                <input id="slimeAvailabilityOverlayThreshold" type="range" min="0" max="1" step="0.001" value="0.061" />
                <span id="slimeAvailabilityOverlayThresholdValue">0.061</span>
              </div>
            </div>
            <div class="row">
              <label for="slimeGameTicksPerSlimeStep">Game Ticks / Slime Step</label>
              <div class="inline-control">
                <input id="slimeGameTicksPerSlimeStep" type="range" min="1" max="10" step="1" value="3" />
                <span id="slimeGameTicksPerSlimeStepValue">3</span>
              </div>
            </div>
            <div class="row">
              <label for="slimeHuntingFleeSteps">Hunt Flee Steps</label>
              <div class="inline-control">
                <input id="slimeHuntingFleeSteps" type="range" min="0" max="1000" step="1" value="100" />
                <span id="slimeHuntingFleeStepsValue">100</span>
              </div>
            </div>
            <div class="row">
              <label for="slimeHuntingFleeWeight">Hunt Flee Weight</label>
              <div class="inline-control">
                <input id="slimeHuntingFleeWeight" type="range" min="0" max="200" step="1" value="80" />
                <span id="slimeHuntingFleeWeightValue">80.0</span>
              </div>
            </div>
            <div class="row">
              <label for="slimeHuntingFleeRadius">Hunt Flee Radius</label>
              <div class="inline-control">
                <input id="slimeHuntingFleeRadius" type="range" min="1" max="512" step="1" value="120" />
                <span id="slimeHuntingFleeRadiusValue">120</span>
              </div>
            </div>
            <div class="row">
              <label for="slimeTracksKnowledgeCutoff">Track Knowledge Cutoff</label>
              <div class="inline-control">
                <input id="slimeTracksKnowledgeCutoff" type="range" min="0" max="1" step="0.01" value="0.2" />
                <span id="slimeTracksKnowledgeCutoffValue">0.20</span>
              </div>
            </div>
            <div class="row">
              <label>Track Knowledge</label>
              <div class="inline-control">
                <button id="slimeTracksClearBtn" class="row-action-btn" type="button">Clear</button>
                <button id="slimeTracksFillBtn" class="row-action-btn" type="button">Fill</button>
                <button id="slimeTracksNoiseBtn" class="row-action-btn" type="button">Noise</button>
              </div>
            </div>
            <p>Slime Availability: <span id="slimeAvailabilityReadout">waiting for grid</span></p>
            </div>`;
}
