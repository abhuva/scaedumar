export function getRdSpritesPanelHtml() {
  return `
          <div id="rdDevSpritesPanel" class="rd-dev-panel" role="tabpanel" data-rd-dev-panel="sprites" aria-hidden="true">
          <div class="rd-tabs" role="tablist" aria-label="Sprite Debug sections" data-rd-tab-group="sprites" data-rd-tab-fallback="structures">
            <button id="structureDebugTab" class="rd-tab active" type="button" role="tab" data-rd-tab="structures" aria-selected="true" aria-controls="structureDebugPanel" tabindex="0">Structures</button>
            <button id="agentSpriteDebugTab" class="rd-tab" type="button" role="tab" data-rd-tab="agents" aria-selected="false" aria-controls="agentSpriteDebugPanel" tabindex="-1">Agents</button>
            <button id="spriteLutDebugTab" class="rd-tab" type="button" role="tab" data-rd-tab="lut" aria-selected="false" aria-controls="spriteLutDebugPanel" tabindex="-1">LUT</button>
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
          <div id="spriteLutDebugPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="lut" aria-labelledby="spriteLutDebugTab" aria-hidden="true">
            <p class="panel-note">Reusable sprite LUT inspection. Editing controls will live here instead of in agent-specific panels.</p>
            <div class="row">
              <label>LUTs</label>
              <p id="agentSpriteLutReadout" class="panel-note">LUTs: 0 | Bird refs: 0 | Duplicates: 0</p>
            </div>
            <div class="row">
              <label>Preview</label>
              <div class="inline-control">
                <select id="agentSpriteLutPreviewSelect" aria-label="Select sprite LUT preview row"></select>
                <canvas id="agentSpriteLutPreviewCanvas" width="256" height="12" aria-label="Selected sprite LUT preview"></canvas>
                <span id="agentSpriteLutPreviewLabel">None</span>
              </div>
            </div>
            <div class="row">
              <label>Source</label>
              <p id="spriteLutSourceReadout" class="panel-note">No LUT selected.</p>
            </div>
            <div id="spriteLutStopEditor" class="rd-compact-list" aria-label="Selected LUT color stops"></div>
            <div class="row">
              <label>Edits</label>
              <div class="inline-control">
                <button id="spriteLutOpenEditorBtn" class="row-action-btn" type="button">Open Editor</button>
                <button id="spriteLutApplyBtn" class="row-action-btn" type="button">Apply</button>
                <button id="spriteLutResetBtn" class="row-action-btn" type="button">Reset Runtime</button>
              </div>
            </div>
          </div>
          <div id="spriteLutEditorOverlay" class="lut-editor-overlay hidden" aria-hidden="true">
            <section class="lut-editor-panel" aria-label="Sprite LUT editor">
              <div class="lut-editor-header">
                <div>
                  <h2>Sprite LUT Editor</h2>
                  <p id="spriteLutEditorStatus" class="panel-note">Runtime-local explicit LUT editing.</p>
                </div>
                <button id="spriteLutEditorCloseBtn" class="row-action-btn" type="button">Close</button>
              </div>
              <div class="lut-editor-toolbar">
                <label for="spriteLutEditorSelect">Editable LUT</label>
                <select id="spriteLutEditorSelect"></select>
                <label for="spriteLutEditorScopeSelect">Scope</label>
                <select id="spriteLutEditorScopeSelect">
                  <option value="global">Global</option>
                  <option value="map">Map</option>
                </select>
                <input id="spriteLutEditorIdInput" type="text" value="" aria-label="Editable LUT id" />
                <button id="spriteLutEditorCreateBtn" class="row-action-btn" type="button">Create</button>
                <button id="spriteLutEditorRenameBtn" class="row-action-btn" type="button">Rename</button>
                <button id="spriteLutEditorDeleteBtn" class="row-action-btn" type="button">Delete</button>
                <button id="spriteLutEditorApplyBtn" class="row-action-btn" type="button">Apply To Runtime</button>
                <button id="spriteLutEditorSaveGlobalBtn" class="row-action-btn" type="button">Save Global</button>
                <button id="spriteLutEditorResetDraftBtn" class="row-action-btn" type="button">Reset Draft</button>
              </div>
              <div id="spriteLutEditorSaveReadout" class="lut-editor-save-readout" aria-label="LUT save diagnostics">Save diagnostics unavailable.</div>
              <div id="spriteLutEditorSurface" class="lut-editor-surface">
                <div id="spriteLutEditorHandleLayer" class="lut-editor-handle-layer"></div>
                <canvas id="spriteLutEditorCanvas" class="lut-editor-canvas" width="768" height="48" aria-label="Editable LUT preview"></canvas>
              </div>
              <div class="lut-editor-stop-panel">
                <p id="spriteLutEditorStopReadout" class="panel-note">No stop selected.</p>
                <span>Position</span>
                <span id="spriteLutEditorStopPosValue">0</span>
                <label for="spriteLutEditorStopColor">Color</label>
                <input id="spriteLutEditorStopColor" type="color" value="#000000" />
                <button id="spriteLutEditorAddStopBtn" class="row-action-btn" type="button">Add Stop</button>
                <button id="spriteLutEditorDeleteStopBtn" class="row-action-btn" type="button">Delete Stop</button>
              </div>
              <div class="lut-editor-variant-panel">
                <div class="lut-editor-usage-box">
                  <h3>Usage Debug</h3>
                  <div id="spriteLutEditorUsageReadout" class="lut-editor-debug-list">No LUT selected.</div>
                </div>
                <div class="lut-editor-variant-box">
                  <div class="lut-editor-variant-preview">
                    <h3>Generated Variants</h3>
                    <canvas id="spriteLutEditorVariantCanvas" class="lut-editor-variant-canvas" width="256" height="1" aria-label="Generated LUT variant preview"></canvas>
                  </div>
                  <div class="lut-editor-variant-controls" aria-label="Selected LUT variant family controls">
                    <p id="spriteLutEditorVariantReadout" class="panel-note">No variant family for selected LUT.</p>
                    <label for="spriteLutEditorVariantFamily">Family</label>
                    <input id="spriteLutEditorVariantFamily" type="text" value="" />
                    <span id="spriteLutEditorVariantIdPreview">-</span>
                    <label for="spriteLutEditorVariantCount">Count</label>
                    <input id="spriteLutEditorVariantCount" type="range" min="0" max="100" step="1" />
                    <span id="spriteLutEditorVariantCountValue">0</span>
                    <label for="spriteLutEditorVariantSeed">Seed</label>
                    <input id="spriteLutEditorVariantSeed" type="range" min="0" max="9999" step="1" />
                    <span id="spriteLutEditorVariantSeedValue">0</span>
                    <label for="spriteLutEditorVariantPosition">Position</label>
                    <input id="spriteLutEditorVariantPosition" type="range" min="0" max="32" step="1" />
                    <span id="spriteLutEditorVariantPositionValue">0</span>
                    <label for="spriteLutEditorVariantBrightness">Brightness</label>
                    <input id="spriteLutEditorVariantBrightness" type="range" min="0" max="0.5" step="0.01" />
                    <span id="spriteLutEditorVariantBrightnessValue">0</span>
                    <label for="spriteLutEditorVariantColor">Color</label>
                    <input id="spriteLutEditorVariantColor" type="range" min="0" max="0.5" step="0.01" />
                    <span id="spriteLutEditorVariantColorValue">0</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
          </div>`;
}
