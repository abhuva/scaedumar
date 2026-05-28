export function getRdTrailMotionPanelHtml() {
  return `
            <div id="rdTrailMotionPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="motion" aria-labelledby="rdTrailMotionTab" aria-hidden="true">
              <p class="panel-note">Agent sensing, steering, spawn, and edge behavior.</p>
          <div class="row">
            <label for="slimeSensorDistance">Sensor Distance</label>
            <div class="inline-control">
              <input id="slimeSensorDistance" type="range" min="1" max="64" step="0.5" value="14" />
              <span id="slimeSensorDistanceValue">14.0</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeSensorAngle">Sensor Angle</label>
            <div class="inline-control">
              <input id="slimeSensorAngle" type="range" min="0" max="120" step="1" value="45" />
              <span id="slimeSensorAngleValue">45 deg</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeSensorSize">Sensor Size</label>
            <div class="inline-control">
              <input id="slimeSensorSize" type="range" min="1" max="5" step="1" value="1" />
              <span id="slimeSensorSizeValue">1</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeSensorNoise">Sensor Noise</label>
            <div class="inline-control">
              <input id="slimeSensorNoise" type="range" min="0" max="0.25" step="0.005" value="0.02" />
              <span id="slimeSensorNoiseValue">0.020</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeStepSize">Step Size</label>
            <div class="inline-control">
              <input id="slimeStepSize" type="range" min="0.1" max="5" step="0.1" value="1.2" />
              <span id="slimeStepSizeValue">1.2</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeTurnAngle">Turn Angle</label>
            <div class="inline-control">
              <input id="slimeTurnAngle" type="range" min="0" max="120" step="1" value="30" />
              <span id="slimeTurnAngleValue">30 deg</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeWanderChance">Wander Chance</label>
            <div class="inline-control">
              <input id="slimeWanderChance" type="range" min="0" max="0.1" step="0.001" value="0.01" />
              <span id="slimeWanderChanceValue">1.0%</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeWanderStrength">Wander Strength</label>
            <div class="inline-control">
              <input id="slimeWanderStrength" type="range" min="0" max="180" step="1" value="45" />
              <span id="slimeWanderStrengthValue">45 deg</span>
            </div>
          </div>
          <div class="row">
            <label for="slimeWrapEdges">Wrap Edges</label>
            <input id="slimeWrapEdges" type="checkbox" checked />
          </div>
          <div class="row">
            <label for="slimeSpawnMode">Spawn Mode</label>
            <select id="slimeSpawnMode">
              <option value="full" selected>Full Field</option>
              <option value="disk">Center Disk</option>
              <option value="ring">Ring</option>
              <option value="line">Line</option>
              <option value="edge">Edges</option>
            </select>
          </div>
            </div>`;
}
