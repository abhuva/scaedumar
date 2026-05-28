import { getRdAgentsSwarmPanelHtml } from "./agents/swarmPanelHtml.js";
import { getRdAgentsFollowPanelHtml } from "./agents/followPanelHtml.js";
import { getRdAgentsOverlaysPanelHtml } from "./agents/overlaysPanelHtml.js";

export function getRdAgentsPanelHtml() {
  let html = `
          <div id="rdDevAgentsPanel" class="rd-dev-panel" role="tabpanel" data-rd-dev-panel="agents" aria-hidden="true">
            <div class="rd-tabs" role="tablist" aria-label="Agent sections" data-rd-tab-group="agents" data-rd-tab-fallback="swarm">
              <button id="rdAgentsSwarmTab" class="rd-tab active" type="button" role="tab" data-rd-tab="swarm" aria-selected="true" aria-controls="rdAgentsSwarmPanel" tabindex="0">Swarm</button>
              <button id="rdAgentsFollowTab" class="rd-tab" type="button" role="tab" data-rd-tab="follow" aria-selected="false" aria-controls="rdAgentsFollowPanel" tabindex="-1">Follow</button>
              <button id="rdAgentsOverlaysTab" class="rd-tab" type="button" role="tab" data-rd-tab="overlays" aria-selected="false" aria-controls="rdAgentsOverlaysPanel" tabindex="-1">Overlays</button>
            </div>
`;
  html += getRdAgentsSwarmPanelHtml();
  html += getRdAgentsFollowPanelHtml();
  html += getRdAgentsOverlaysPanelHtml();
  html += `
          </div>`;
  return html;
}
