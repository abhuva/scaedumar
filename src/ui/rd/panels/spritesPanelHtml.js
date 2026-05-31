export function getRdSpritesPanelHtml() {
  return `
          <div id="rdDevSpritesPanel" class="rd-dev-panel" role="tabpanel" data-rd-dev-panel="sprites" aria-hidden="true">
          <div class="rd-tabs" role="tablist" aria-label="Sprite Debug sections" data-rd-tab-group="sprites" data-rd-tab-fallback="structures">
            <button id="structureDebugTab" class="rd-tab active" type="button" role="tab" data-rd-tab="structures" aria-selected="true" aria-controls="structureDebugPanel" tabindex="0">Structures</button>
            <button id="agentSpriteDebugTab" class="rd-tab" type="button" role="tab" data-rd-tab="agents" aria-selected="false" aria-controls="agentSpriteDebugPanel" tabindex="-1">Agents</button>
          </div>
          <div id="structureDebugPanel" class="rd-tab-panel active" role="tabpanel" data-rd-panel="structures" aria-labelledby="structureDebugTab" aria-hidden="false">
            <p class="panel-note">Debug controls for authored map structures. Actions dispatch structure commands; selection is UI-local.</p>
            <div class="row">
              <label for="structureDebugTypeSelect">Type</label>
              <select id="structureDebugTypeSelect"></select>
            </div>
            <div class="row">
              <label>Selected</label>
              <p id="structureDebugSelectedValue" class="panel-note">None</p>
            </div>
            <div class="row">
              <label>Structure State</label>
              <p id="structureDebugReadout" class="panel-note">Structures: 0 | Types: 0</p>
            </div>
            <div class="row">
              <label for="structureDebugShowOccupancyToggle">Show Occupancy</label>
              <div class="inline-control">
                <input id="structureDebugShowOccupancyToggle" type="checkbox" aria-label="Show structure occupancy overlay" />
                <span>debug overlay</span>
              </div>
            </div>
            <div class="row">
              <label for="structureDebugRenderVisibleToggle">Render Sprites</label>
              <div class="inline-control">
                <input id="structureDebugRenderVisibleToggle" type="checkbox" checked aria-label="Render structure sprites" />
                <span>main pass</span>
              </div>
            </div>
            <div class="row">
              <label for="structureDebugPlaceModeToggle">Place Mode</label>
              <div class="inline-control">
                <input id="structureDebugPlaceModeToggle" type="checkbox" aria-label="Enable structure placement preview mode" />
                <span>cursor preview</span>
              </div>
            </div>
            <div class="row">
              <label>At Player</label>
              <div class="inline-control">
                <button id="structureDebugPlaceAtPlayerBtn" class="row-action-btn" type="button">Place</button>
                <button id="structureDebugSelectNearestBtn" class="row-action-btn" type="button">Select Nearest</button>
              </div>
            </div>
            <div class="row">
              <label>Selection</label>
              <div class="inline-control">
                <button id="structureDebugRemoveSelectedBtn" class="row-action-btn" type="button">Remove</button>
                <button id="structureDebugRefreshBtn" class="row-action-btn" type="button">Refresh</button>
              </div>
            </div>
          </div>
          <div id="agentSpriteDebugPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="agents" aria-labelledby="agentSpriteDebugTab" aria-hidden="true">
            <p class="panel-note">Debug controls for player and swarm agent sprites. Swarm sprite mode is shared with RD > Agents > Swarm.</p>
            <div class="row">
              <label for="agentSpritePlayerRenderToggle">Player Sprite</label>
              <div class="inline-control">
                <input id="agentSpritePlayerRenderToggle" type="checkbox" checked aria-label="Render player sprite" />
                <span>main pass</span>
              </div>
            </div>
            <div class="row">
              <label for="agentSpriteSwarmRenderModeToggle">Swarm Sprites</label>
              <div class="inline-control">
                <input id="agentSpriteSwarmRenderModeToggle" type="checkbox" checked aria-label="Render swarm as sprites instead of square agents" />
                <span>not squares</span>
              </div>
            </div>
          </div>
          </div>`;
}
