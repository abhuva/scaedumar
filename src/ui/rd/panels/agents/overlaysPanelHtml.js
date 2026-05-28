export function getRdAgentsOverlaysPanelHtml() {
  return `
            <div id="rdAgentsOverlaysPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="overlays" aria-labelledby="rdAgentsOverlaysTab" aria-hidden="true">
              <p class="panel-note">Swarm overlay visibility.</p>
              <div class="row">
                <label for="swarmFollowHawkRangeGizmoToggle">Hawk Range Gizmo</label>
                <input id="swarmFollowHawkRangeGizmoToggle" type="checkbox" />
              </div>
              <div class="row">
                <label for="swarmStatsPanelToggle">Stats Panel</label>
                <input id="swarmStatsPanelToggle" type="checkbox" />
              </div>
            </div>`;
}
