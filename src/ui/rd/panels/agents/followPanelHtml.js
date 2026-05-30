export function getRdAgentsFollowPanelHtml() {
  return `
            <div id="rdAgentsFollowPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="follow" aria-labelledby="rdAgentsFollowTab" aria-hidden="true">
              <p class="panel-note">Camera follow controls for bird and hawk tracking.</p>
          <div class="row">
            <label for="swarmFollowToggle">Follow Agent</label>
            <button id="swarmFollowToggle" class="row-action-btn" type="button">Follow Agent Mode</button>
          </div>
          <div class="row">
            <label for="swarmFollowTarget">Follow Target</label>
            <select id="swarmFollowTarget">
              <option value="agent">Agent</option>
              <option value="hawk">Hawk</option>
            </select>
          </div>
          <div class="row">
            <label for="swarmFollowZoomIn">Max Zoom In</label>
            <div class="inline-control">
              <input id="swarmFollowZoomIn" type="range" min="0.5" max="32" step="0.1" value="2.2" />
              <span id="swarmFollowZoomInValue">2.2x</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmFollowZoomOut">Max Zoom Out</label>
            <div class="inline-control">
              <input id="swarmFollowZoomOut" type="range" min="0.5" max="32" step="0.1" value="0.8" />
              <span id="swarmFollowZoomOutValue">0.8x</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmFollowAgentZoomSmoothing">Zoom Gain</label>
            <div class="inline-control">
              <input id="swarmFollowAgentZoomSmoothing" type="range" min="0" max="1" step="0.01" value="0.12" />
              <span id="swarmFollowAgentZoomSmoothingValue">0.12</span>
            </div>
          </div>
          <div class="row">
            <label for="swarmFollowCameraPositionSmoothing">Position Gain</label>
            <div class="inline-control">
              <input id="swarmFollowCameraPositionSmoothing" type="range" min="0" max="1" step="0.01" value="0.12" />
              <span id="swarmFollowCameraPositionSmoothingValue">0.12</span>
            </div>
          </div>
            </div>`;
}
