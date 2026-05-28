export function getRdIoPanelHtml() {
  return `
          <div id="rdDevIoPanel" class="rd-dev-panel" role="tabpanel" data-rd-dev-panel="io" aria-hidden="true">
            <p class="panel-note">Map loading and map sidecar save controls.</p>
            <div class="row">
              <label for="mapPathInput">Map Path</label>
              <div class="inline-control">
                <input id="mapPathInput" type="text" value="assets/map3/" />
                <button id="mapPathLoadBtn" class="row-action-btn" type="button">Load</button>
              </div>
            </div>
            <div class="row">
              <label for="mapFolderInput">Map Folder</label>
              <input id="mapFolderInput" type="file" webkitdirectory multiple />
            </div>
            <div class="row">
              <label for="mapSaveAllBtn">Map Data</label>
              <button id="mapSaveAllBtn" class="row-action-btn" type="button">Save All</button>
            </div>
            <div class="row">
              <label>Point Lights</label>
              <div class="inline-control">
                <button id="pointLightsSaveAllBtn" class="row-action-btn" type="button">Save Pointlights</button>
                <button id="pointLightsLoadAllBtn" class="row-action-btn" type="button">Load Pointlights</button>
                <input id="pointLightsLoadInput" type="file" accept="application/json,.json" aria-label="Load point lights from JSON file" hidden />
              </div>
            </div>
            <div class="row">
              <label for="slimeSaveBtn">Slime Sidecar</label>
              <button id="slimeSaveBtn" class="row-action-btn" type="button">Save Slime Settings</button>
            </div>
          </div>`;
}
