export function getRdTerrainCursorLightPanelHtml() {
  return `
            <div id="rdTerrainCursorLightPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="cursor-light" aria-labelledby="rdTerrainCursorLightTab" aria-hidden="true">
              <p class="panel-note">Cursor-following point light and gizmo controls.</p>
          <div class="row">
            <label for="cursorLightModeToggle">Cursor Light</label>
            <input id="cursorLightModeToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="cursorLightGizmoToggle">Cursor Gizmo</label>
            <input id="cursorLightGizmoToggle" type="checkbox" />
          </div>
          <div class="row">
            <label for="cursorLightFollowHeightToggle">Cursor Height Mode</label>
            <input id="cursorLightFollowHeightToggle" type="checkbox" checked />
          </div>
          <div class="row">
            <label for="cursorLightColor">Cursor Color</label>
            <input id="cursorLightColor" type="color" value="#ff9b2f" />
          </div>
          <div class="row">
            <label for="cursorLightStrength">Cursor Strength</label>
            <div class="inline-control">
              <input id="cursorLightStrength" type="range" min="1" max="200" step="1" value="30" />
              <span id="cursorLightStrengthValue">30 px</span>
            </div>
          </div>
          <div class="row">
            <label for="cursorLightHeightOffset">Cursor Height</label>
            <div class="inline-control">
              <input id="cursorLightHeightOffset" type="range" min="0" max="120" step="1" value="8" />
              <span id="cursorLightHeightOffsetValue">8</span>
            </div>
          </div>
            </div>`;
}
