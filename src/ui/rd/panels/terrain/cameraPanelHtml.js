export function getRdTerrainCameraPanelHtml() {
  return `
            <div id="rdTerrainCameraPanel" class="rd-tab-panel" role="tabpanel" data-rd-panel="camera" aria-labelledby="rdTerrainCameraTab" aria-hidden="true">
              <p class="panel-note">Viewport camera actions. Mouse wheel and middle-drag remain the primary direct controls.</p>
              <div class="row">
                <label>Camera</label>
                <div class="inline-control">
                  <button id="cameraResetViewBtn" class="row-action-btn" type="button">Reset</button>
                  <button id="cameraCenterPlayerBtn" class="row-action-btn" type="button">Player</button>
                </div>
              </div>
              <div class="row">
                <label>Zoom</label>
                <div class="inline-control">
                  <button id="cameraZoomOutBtn" class="row-action-btn" type="button">-</button>
                  <button id="cameraZoomInBtn" class="row-action-btn" type="button">+</button>
                </div>
              </div>
            </div>`;
}
