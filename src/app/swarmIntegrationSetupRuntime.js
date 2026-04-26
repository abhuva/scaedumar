import { createSwarmGameplayRuntime } from "../gameplay/swarmGameplayRuntime.js";
import { createSwarmRenderSetupRuntime } from "../gameplay/swarmRenderSetupRuntime.js";
import { createSettingsAssemblyRuntime } from "../ui/settingsAssemblyRuntime.js";
import { createInfoPanelRuntime } from "../ui/infoPanelRuntime.js";
import { setInteractionMode as applyInteractionMode } from "../gameplay/interactionModeController.js";

export function createSwarmIntegrationSetupRuntime(deps) {
  const swarmGameplayRuntime = createSwarmGameplayRuntime(deps.gameplay);

  const { settingsCompatBindings, settingsRuntimeBinding } = createSettingsAssemblyRuntime({
    ...deps.settingsAssembly,
    Compat: {
      ...deps.settingsAssembly.Compat,
      serializeSwarmDataCompat: swarmGameplayRuntime.serializeSwarmData,
      applySwarmData: swarmGameplayRuntime.applySwarmData,
    },
  });

  const swarmRenderSetupRuntime = createSwarmRenderSetupRuntime({
    ...deps.render,
    spawnRestingBirdNear: swarmGameplayRuntime.spawnRestingBirdNear,
    removeSwarmAgentAtIndex: swarmGameplayRuntime.removeSwarmAgentAtIndex,
    chooseRandomSwarmTargetIndexNear: swarmGameplayRuntime.chooseRandomSwarmTargetIndexNear,
    chooseRandomFollowAgentIndex: swarmGameplayRuntime.chooseRandomFollowAgentIndex,
    chooseRandomFollowHawkIndex: swarmGameplayRuntime.chooseRandomFollowHawkIndex,
    terrainFloorAtSwarmCoord: swarmGameplayRuntime.terrainFloorAtSwarmCoord,
    isWaterAtSwarmCoord: swarmGameplayRuntime.isWaterAtSwarmCoord,
    isSwarmCoordFlyable: swarmGameplayRuntime.isSwarmCoordFlyable,
  });

  const updateInfoPanel = createInfoPanelRuntime({
    isSwarmEnabled: deps.interactionContext.isSwarmEnabled,
    getSwarmCursorMode: deps.interactionContext.getSwarmCursorMode,
    swarmState: deps.interactionContext.swarmState,
    swarmCursorState: deps.interactionContext.swarmCursorState,
    playerState: deps.interactionContext.playerState,
    getCurrentPathMetrics: deps.interactionContext.getCurrentPathMetrics,
    getMovementSnapshot: deps.interactionContext.getMovementSnapshot,
    playerInfoEl: deps.interactionContext.playerInfoEl,
    pathInfoEl: deps.interactionContext.pathInfoEl,
  });

  const interactionModeBinding = {
    setInteractionMode: (mode) =>
      applyInteractionMode(
        {
          canUseInteractionInCurrentMode: deps.interactionContext.canUseInteractionInCurrentMode,
          syncInteractionModeUi: deps.interactionContext.syncInteractionModeUi,
          movePreviewState: deps.interactionContext.movePreviewState,
          store: deps.interactionContext.store,
          requestOverlayDraw: deps.interactionContext.requestOverlayDraw,
        },
        mode,
      ),
  };

  const mainInteractionBindings = {
    getBaseViewHalfExtents: () => deps.interactionContext.getCameraRuntimeBinding().getBaseViewHalfExtents(),
    getActiveCameraState: () => deps.interactionContext.getCameraRuntimeBinding().getActiveCameraState(),
    getViewHalfExtents: (zoomValue = null) => deps.interactionContext.getCameraRuntimeBinding().getViewHalfExtents(zoomValue),
    clientToNdc: (clientX, clientY) => deps.interactionContext.getCameraRuntimeBinding().clientToNdc(clientX, clientY),
    worldFromNdc: (ndc, zoomValue = null, pan = null) =>
      deps.interactionContext.getCameraRuntimeBinding().worldFromNdc(ndc, zoomValue, pan),
    worldToUv: (world) => deps.interactionContext.getCameraRuntimeBinding().worldToUv(world),
    uvToMapPixelIndex: (uv) => deps.interactionContext.getCameraRuntimeBinding().uvToMapPixelIndex(uv),
    mapPixelIndexToUv: (pixelX, pixelY) => deps.interactionContext.getCameraRuntimeBinding().mapPixelIndexToUv(pixelX, pixelY),
    mapPixelToWorld: (pixelX, pixelY) => deps.interactionContext.getCameraRuntimeBinding().mapPixelToWorld(pixelX, pixelY),
    mapCoordToWorld: (mapX, mapY) => deps.interactionContext.getCameraRuntimeBinding().mapCoordToWorld(mapX, mapY),
    worldToScreen: (world) => deps.interactionContext.getCameraRuntimeBinding().worldToScreen(world),
    setInteractionMode: (mode) => interactionModeBinding.setInteractionMode(mode),
    setPlayerPosition: (pixelX, pixelY) => deps.interactionContext.playerRuntimeBinding.setPlayerPosition(pixelX, pixelY),
    parseNpcPlayer: (rawData) => deps.interactionContext.parseNpcPlayerImpl(rawData),
    applyLoadedNpc: (rawData) => deps.interactionContext.applyLoadedNpcImpl(rawData),
    updateInfoPanel: () => updateInfoPanel(),
  };

  return {
    swarmGameplayRuntime,
    terrainFloorAtSwarmCoord: swarmGameplayRuntime.terrainFloorAtSwarmCoord,
    isWaterAtSwarmCoord: swarmGameplayRuntime.isWaterAtSwarmCoord,
    isSwarmCoordFlyable: swarmGameplayRuntime.isSwarmCoordFlyable,
    chooseRandomSwarmTargetIndexNear: swarmGameplayRuntime.chooseRandomSwarmTargetIndexNear,
    chooseRandomFollowAgentIndex: swarmGameplayRuntime.chooseRandomFollowAgentIndex,
    chooseRandomFollowHawkIndex: swarmGameplayRuntime.chooseRandomFollowHawkIndex,
    ensureSwarmBuffers: swarmGameplayRuntime.ensureSwarmBuffers,
    reseedSwarmAgents: swarmGameplayRuntime.reseedSwarmAgents,
    settingsCompatBindings,
    settingsRuntimeBinding,
    swarmRenderSetupRuntime,
    swarmOverlayRuntime: swarmRenderSetupRuntime.swarmOverlayRuntime,
    renderSwarmLit: swarmRenderSetupRuntime.renderSwarmLit,
    updateInfoPanel,
    interactionModeBinding,
    mainInteractionBindings,
  };
}
