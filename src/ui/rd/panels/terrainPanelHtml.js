import { getRdTerrainLightingPanelHtml } from "./terrain/lightingPanelHtml.js";
import { getRdTerrainPointLightsPanelHtml } from "./terrain/pointLightsPanelHtml.js";
import { getRdTerrainCursorLightPanelHtml } from "./terrain/cursorLightPanelHtml.js";
import { getRdTerrainFogPanelHtml } from "./terrain/fogPanelHtml.js";
import { getRdTerrainCloudsPanelHtml } from "./terrain/cloudsPanelHtml.js";
import { getRdTerrainWaterPanelHtml } from "./terrain/waterPanelHtml.js";
import { getRdTerrainWaterTrailsPanelHtml } from "./terrain/waterTrailsPanelHtml.js";
import { getRdTerrainDetailPanelHtml } from "./terrain/detailPanelHtml.js";
import { getRdTerrainApronPanelHtml } from "./terrain/apronPanelHtml.js";
import { getRdTerrainCameraPanelHtml } from "./terrain/cameraPanelHtml.js";

export function getRdTerrainPanelHtml() {
  let html = `
          <div id="rdDevTerrainPanel" class="rd-dev-panel" role="tabpanel" data-rd-dev-panel="terrain" aria-hidden="true">
            <div class="rd-tabs" role="tablist" aria-label="Terrain sections" data-rd-tab-group="terrain" data-rd-tab-fallback="lighting">
              <button id="rdTerrainLightingTab" class="rd-tab active" type="button" role="tab" data-rd-tab="lighting" aria-selected="true" aria-controls="rdTerrainLightingPanel" tabindex="0">Lighting</button>
              <button id="rdTerrainPointLightsTab" class="rd-tab" type="button" role="tab" data-rd-tab="point-lights" aria-selected="false" aria-controls="rdTerrainPointLightsPanel" tabindex="-1">Point Lights</button>
              <button id="rdTerrainCursorLightTab" class="rd-tab" type="button" role="tab" data-rd-tab="cursor-light" aria-selected="false" aria-controls="rdTerrainCursorLightPanel" tabindex="-1">Cursor Light</button>
              <button id="rdTerrainFogTab" class="rd-tab" type="button" role="tab" data-rd-tab="fog" aria-selected="false" aria-controls="rdTerrainFogPanel" tabindex="-1">Fog</button>
              <button id="rdTerrainCloudsTab" class="rd-tab" type="button" role="tab" data-rd-tab="clouds" aria-selected="false" aria-controls="rdTerrainCloudsPanel" tabindex="-1">Clouds</button>
              <button id="rdTerrainWaterTab" class="rd-tab" type="button" role="tab" data-rd-tab="water" aria-selected="false" aria-controls="rdTerrainWaterPanel" tabindex="-1">Water</button>
              <button id="rdTerrainWaterTrailsTab" class="rd-tab" type="button" role="tab" data-rd-tab="water-trails" aria-selected="false" aria-controls="rdTerrainWaterTrailsPanel" tabindex="-1">Water Trails</button>
              <button id="rdTerrainDetailTab" class="rd-tab" type="button" role="tab" data-rd-tab="detail" aria-selected="false" aria-controls="rdTerrainDetailPanel" tabindex="-1">Detail</button>
              <button id="rdTerrainApronTab" class="rd-tab" type="button" role="tab" data-rd-tab="apron" aria-selected="false" aria-controls="rdTerrainApronPanel" tabindex="-1">Apron</button>
              <button id="rdTerrainCameraTab" class="rd-tab" type="button" role="tab" data-rd-tab="camera" aria-selected="false" aria-controls="rdTerrainCameraPanel" tabindex="-1">Camera</button>
            </div>
`;
  html += getRdTerrainLightingPanelHtml();
  html += getRdTerrainPointLightsPanelHtml();
  html += getRdTerrainCursorLightPanelHtml();
  html += getRdTerrainFogPanelHtml();
  html += getRdTerrainCloudsPanelHtml();
  html += getRdTerrainWaterPanelHtml();
  html += getRdTerrainWaterTrailsPanelHtml();
  html += getRdTerrainDetailPanelHtml();
  html += getRdTerrainApronPanelHtml();
  html += getRdTerrainCameraPanelHtml();
  html += `
          </div>`;
  return html;
}
