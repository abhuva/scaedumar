export function getRdPathingRoutePanelHtml() {
  return `
            <div id="rdOverlaysRoutePanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="route" aria-labelledby="rdOverlaysRouteTab" aria-hidden="true">
              <p class="panel-note">Route overlay drawing and NAV debug visualization.</p>
              <div class="row">
                <label for="routeArrowColor">Arrow Color</label>
                <div class="inline-control">
                  <input id="routeArrowColor" type="color" value="#ffffff" />
                </div>
              </div>
              <div class="row">
                <label for="routeArrowSpacing">Arrow Spacing</label>
                <div class="inline-control">
                  <input id="routeArrowSpacing" type="range" min="1" max="128" step="1" value="12" />
                  <span id="routeArrowSpacingValue">12</span>
                </div>
              </div>
              <div class="row">
                <label for="routeArrowOpacity">Arrow Opacity</label>
                <div class="inline-control">
                  <input id="routeArrowOpacity" type="range" min="0" max="1" step="0.01" value="0.78" />
                  <span id="routeArrowOpacityValue">0.78</span>
                </div>
              </div>
              <div class="row">
                <label for="routeArrowSize">Arrow Size</label>
                <div class="inline-control">
                  <input id="routeArrowSize" type="range" min="1" max="48" step="0.5" value="8" />
                  <span id="routeArrowSizeValue">8.0</span>
                </div>
              </div>
              <div class="row">
                <label for="routeEndpointSkipRatio">Endpoint Skip</label>
                <div class="inline-control">
                  <input id="routeEndpointSkipRatio" type="range" min="0" max="1" step="0.05" value="0.5" />
                  <span id="routeEndpointSkipRatioValue">0.50</span>
                </div>
              </div>
              <div class="row">
                <label for="routePreviewPointRadius">Preview Radius</label>
                <div class="inline-control">
                  <input id="routePreviewPointRadius" type="range" min="0.1" max="12" step="0.1" value="2" />
                  <span id="routePreviewPointRadiusValue">2.0</span>
                </div>
              </div>
              <div class="row">
                <label for="routePreviewOpacity">Preview Opacity</label>
                <div class="inline-control">
                  <input id="routePreviewOpacity" type="range" min="0" max="1" step="0.01" value="0.82" />
                  <span id="routePreviewOpacityValue">0.82</span>
                </div>
              </div>
              <div class="row">
                <label for="routeDebugOverlayMode">NAV Overlay</label>
                <div class="inline-control">
                  <select id="routeDebugOverlayMode">
                    <option value="none">None</option>
                    <option value="dijkstra">Cost Field</option>
                    <option value="knowledge">NAV Knowledge</option>
                  </select>
                </div>
              </div>
            </div>`;
}
