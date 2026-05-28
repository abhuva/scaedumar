export function getRdAgentsSwarmPanelHtml() {
  return `
            <div id="rdAgentsSwarmPanel" class="rd-tab-panel active" role="tabpanel" data-rd-panel="swarm" aria-labelledby="rdAgentsSwarmTab" aria-hidden="false">
<p class="help">Swarm runs in map space and can render as unlit overlay or fully lit pass.</p>
          <div class="row">
            <label for="swarmEnabledToggle">Use Agent Swarm</label>
            <input id="swarmEnabledToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="swarmShowTerrainToggle">Show Terrain</label>
            <input id="swarmShowTerrainToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="swarmLitModeToggle">Fully Lit Swarm</label>
            <input id="swarmLitModeToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="swarmBackgroundColor">Studio Background</label>
            <input id="swarmBackgroundColor" type="color" value="#1c2b44" />
          </div>
          <div class="row">
            <label for="swarmAgentCount">Agent Count</label>
            <div class="inline-control">
              <input id="swarmAgentCount" type="range" min="100" max="1000" step="10" value="300" />
              <span id="swarmAgentCountValue">300</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmUpdateInterval">Sim Speed</label>
            <div class="inline-control">
              <input id="swarmUpdateInterval" type="range" min="0.1" max="20" step="0.1" value="1.0" />
              <span id="swarmUpdateIntervalValue">1.0x</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmTimeRouting">Time Source</label>
            <select id="swarmTimeRouting">
              <option value="global" selected>Global</option>
              <option value="detached">Detached</option>
            </select>
          </div>
          <div class="row">
            <label for="swarmMaxSpeed">Max Speed</label>
            <div class="inline-control">
              <input id="swarmMaxSpeed" type="range" min="30" max="300" step="1" value="120" />
              <span id="swarmMaxSpeedValue">120 px/s</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmSteeringMax">Max Steering</label>
            <div class="inline-control">
              <input id="swarmSteeringMax" type="range" min="10" max="500" step="1" value="140" />
              <span id="swarmSteeringMaxValue">140 px/s^2</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmVariationStrength">Variation</label>
            <div class="inline-control">
              <input id="swarmVariationStrength" type="range" min="0" max="50" step="1" value="0" />
              <span id="swarmVariationStrengthValue">0%</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmNeighborRadius">Neighbor Radius</label>
            <div class="inline-control">
              <input id="swarmNeighborRadius" type="range" min="10" max="200" step="1" value="52" />
              <span id="swarmNeighborRadiusValue">52 px</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmMinHeight">Min Height</label>
            <div class="inline-control">
              <input id="swarmMinHeight" type="range" min="0" max="256" step="1" value="0" />
              <span id="swarmMinHeightValue">0</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmMaxHeight">Max Height</label>
            <div class="inline-control">
              <input id="swarmMaxHeight" type="range" min="16" max="256" step="1" value="256" />
              <span id="swarmMaxHeightValue">256</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmSeparationRadius">Separation Radius</label>
            <div class="inline-control">
              <input id="swarmSeparationRadius" type="range" min="6" max="120" step="1" value="22" />
              <span id="swarmSeparationRadiusValue">22 px</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmAlignmentWeight">Alignment</label>
            <div class="inline-control">
              <input id="swarmAlignmentWeight" type="range" min="0" max="4" step="0.05" value="1.1" />
              <span id="swarmAlignmentWeightValue">1.10</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmCohesionWeight">Cohesion</label>
            <div class="inline-control">
              <input id="swarmCohesionWeight" type="range" min="0" max="4" step="0.05" value="0.85" />
              <span id="swarmCohesionWeightValue">0.85</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmSeparationWeight">Separation</label>
            <div class="inline-control">
              <input id="swarmSeparationWeight" type="range" min="0" max="6" step="0.05" value="2.4" />
              <span id="swarmSeparationWeightValue">2.40</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmWanderWeight">Wander</label>
            <div class="inline-control">
              <input id="swarmWanderWeight" type="range" min="0" max="2" step="0.01" value="0.22" />
              <span id="swarmWanderWeightValue">0.22</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmRestChance">Rest Chance</label>
            <div class="inline-control">
              <input id="swarmRestChance" type="range" min="0" max="0.002" step="0.0001" value="0" />
              <span id="swarmRestChanceValue">0.0000</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmRestTicks">Rest Ticks</label>
            <div class="inline-control">
              <input id="swarmRestTicks" type="range" min="100" max="10000" step="1" value="1000" />
              <span id="swarmRestTicksValue">1000</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmBreedingThreshold">Breeding Threshold</label>
            <div class="inline-control">
              <input id="swarmBreedingThreshold" type="range" min="0" max="1000" step="1" value="180" />
              <span id="swarmBreedingThresholdValue">180</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmBreedingSpawnChance">Breed Spawn Chance</label>
            <div class="inline-control">
              <input id="swarmBreedingSpawnChance" type="range" min="0" max="1" step="0.01" value="0.35" />
              <span id="swarmBreedingSpawnChanceValue">35%</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmCursorMode">Cursor Force</label>
            <select id="swarmCursorMode">
              <option value="none">None</option>
              <option value="attract">Attract</option>
              <option value="repel">Repel</option>
            </select>
          </div>
          <div class="row">
            <label for="swarmCursorStrength">Cursor Strength</label>
            <div class="inline-control">
              <input id="swarmCursorStrength" type="range" min="0" max="8" step="0.1" value="2.5" />
              <span id="swarmCursorStrengthValue">2.5</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmCursorRadius">Cursor Radius</label>
            <div class="inline-control">
              <input id="swarmCursorRadius" type="range" min="20" max="260" step="1" value="130" />
              <span id="swarmCursorRadiusValue">130 px</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmHawkEnabledToggle">Use Hawk</label>
            <input id="swarmHawkEnabledToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="swarmHawkCount">Hawk Count</label>
            <div class="inline-control">
              <input id="swarmHawkCount" type="range" min="0" max="20" step="1" value="1" />
              <span id="swarmHawkCountValue">1</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmHawkColor">Hawk Color</label>
            <input id="swarmHawkColor" type="color" value="#ff7c5c" />
          </div>
          <div class="row">
            <label for="swarmHawkSpeed">Hawk Speed</label>
            <div class="inline-control">
              <input id="swarmHawkSpeed" type="range" min="30" max="420" step="1" value="180" />
              <span id="swarmHawkSpeedValue">180 px/s</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmHawkSteering">Hawk Steering</label>
            <div class="inline-control">
              <input id="swarmHawkSteering" type="range" min="20" max="700" step="1" value="240" />
              <span id="swarmHawkSteeringValue">240 px/s^2</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmHawkTargetRange">Hawk Target Range</label>
            <div class="inline-control">
              <input id="swarmHawkTargetRange" type="range" min="20" max="500" step="1" value="180" />
              <span id="swarmHawkTargetRangeValue">180 px</span>
            </div>
          </div>
            </div>`;
}
