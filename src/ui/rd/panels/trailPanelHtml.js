import { getRdTrailRuntimePanelHtml } from "./trail/runtimePanelHtml.js";
import { getRdTrailMotionPanelHtml } from "./trail/motionPanelHtml.js";
import { getRdTrailVisualPanelHtml } from "./trail/visualPanelHtml.js";
import { getRdTrailTerrainPanelHtml } from "./trail/terrainPanelHtml.js";
import { getRdTrailPlantsPanelHtml } from "./trail/plantsPanelHtml.js";
import { getRdTrailBrushPanelHtml } from "./trail/brushPanelHtml.js";
import { getRdTrailTracksPanelHtml } from "./trail/tracksPanelHtml.js";

export function getRdTrailPanelHtml() {
  let html = `
          <div id="rdDevTrailPanel" class="rd-dev-panel" role="tabpanel" data-rd-dev-panel="trail" aria-hidden="true">
            <div class="rd-tabs" role="tablist" aria-label="Trail sections" data-rd-tab-group="trail" data-rd-tab-fallback="runtime">
              <button id="rdTrailRuntimeTab" class="rd-tab active" type="button" role="tab" data-rd-tab="runtime" aria-selected="true" aria-controls="rdTrailRuntimePanel" tabindex="0">Runtime</button>
              <button id="rdTrailMotionTab" class="rd-tab" type="button" role="tab" data-rd-tab="motion" aria-selected="false" aria-controls="rdTrailMotionPanel" tabindex="-1">Motion</button>
              <button id="rdTrailVisualTab" class="rd-tab" type="button" role="tab" data-rd-tab="visual" aria-selected="false" aria-controls="rdTrailVisualPanel" tabindex="-1">Visual</button>
              <button id="rdTrailTerrainTab" class="rd-tab" type="button" role="tab" data-rd-tab="terrain" aria-selected="false" aria-controls="rdTrailTerrainPanel" tabindex="-1">Terrain</button>
              <button id="rdTrailPlantsTab" class="rd-tab" type="button" role="tab" data-rd-tab="plants" aria-selected="false" aria-controls="rdTrailPlantsPanel" tabindex="-1">Plants</button>
              <button id="rdTrailBrushTab" class="rd-tab" type="button" role="tab" data-rd-tab="brush" aria-selected="false" aria-controls="rdTrailBrushPanel" tabindex="-1">Brush</button>
              <button id="rdTrailTracksTab" class="rd-tab" type="button" role="tab" data-rd-tab="tracks" aria-selected="false" aria-controls="rdTrailTracksPanel" tabindex="-1">Tracks</button>
            </div>
`;
  html += getRdTrailRuntimePanelHtml();
  html += getRdTrailMotionPanelHtml();
  html += getRdTrailVisualPanelHtml();
  html += getRdTrailTerrainPanelHtml();
  html += getRdTrailPlantsPanelHtml();
  html += getRdTrailBrushPanelHtml();
  html += getRdTrailTracksPanelHtml();
  html += `
          </div>`;
  return html;
}
