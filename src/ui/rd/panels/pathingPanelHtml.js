import { getRdPathingLocalPanelHtml } from "./pathing/localPanelHtml.js";
import { getRdPathingNavPanelHtml } from "./pathing/navPanelHtml.js";
import { getRdPathingRoutePanelHtml } from "./pathing/routePanelHtml.js";

export function getRdPathingPanelHtml() {
  let html = `
          <div id="rdDevPathingPanel" class="rd-dev-panel" role="tabpanel" data-rd-dev-panel="pathing" aria-hidden="true">
            <div class="rd-tabs" role="tablist" aria-label="Pathing sections" data-rd-tab-group="pathing" data-rd-tab-fallback="local">
              <button id="rdGameplayPathingTab" class="rd-tab active" type="button" role="tab" data-rd-tab="local" aria-selected="true" aria-controls="rdGameplayPathingPanel" tabindex="0">Local</button>
              <button id="resourceDebugDiscoveryTab" class="rd-tab" type="button" role="tab" data-rd-tab="nav" aria-selected="false" aria-controls="resourceDebugDiscoveryPanel" tabindex="-1">NAV</button>
              <button id="rdOverlaysRouteTab" class="rd-tab" type="button" role="tab" data-rd-tab="route" aria-selected="false" aria-controls="rdOverlaysRoutePanel" tabindex="-1">Route</button>
            </div>
`;
  html += getRdPathingLocalPanelHtml();
  html += getRdPathingNavPanelHtml();
  html += getRdPathingRoutePanelHtml();
  html += `          </div>`;
  return html;
}
