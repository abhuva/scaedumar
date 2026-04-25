import {
  getSwarmCursorMode as resolveSwarmCursorMode,
  getSwarmSettings as resolveSwarmSettings,
  getPathfindingStateSnapshot as resolvePathfindingStateSnapshot,
} from "./runtimeStateSnapshots.js";
import {
  syncMapState,
  syncPointLightsState,
  syncCursorLightState,
  patchSimulationKnobSection,
  setCycleSpeedState,
  setSimTickHoursState,
  setTimeRoutingModeState,
  setModeState,
  setCameraPoseState,
  setCycleHourUiState,
  patchPathfindingState,
  syncPathfindingState,
  patchSwarmSettingsState,
} from "./stateSync.js";
import {
  getCursorLightSnapshot as buildCursorLightSnapshot,
  isPointLightLiveUpdateEnabled as getPointLightLiveUpdateEnabled,
} from "./interactionStateAccess.js";
import { setSwarmDefaults as applySwarmDefaults, isSwarmEnabled as resolveSwarmEnabled } from "./swarmStateAccess.js";

export function createMainRuntimeStateBinding(deps) {
  function getCursorLightState() {
    return typeof deps.getCursorLightState === "function" ? deps.getCursorLightState() : deps.cursorLightState;
  }

  function getStopSwarmFollow() {
    return typeof deps.getStopSwarmFollow === "function" ? deps.getStopSwarmFollow() : deps.stopSwarmFollow;
  }

  function getSplatSize() {
    return typeof deps.getSplatSize === "function" ? deps.getSplatSize() : deps.splatSize;
  }

  function getSwarmState() {
    return typeof deps.getSwarmState === "function" ? deps.getSwarmState() : deps.swarmState;
  }

  function getResolveSwarmSettingsArgs() {
    return {
      getCoreSwarm: deps.getCoreSwarm,
      getSettingsDefaults: deps.getSettingsDefaults,
      defaultSwarmSettings: deps.defaultSwarmSettings,
      clamp: deps.clamp,
      swarmZMax: deps.swarmZMax,
      zoomMin: deps.zoomMin,
      zoomMax: deps.zoomMax,
      normalizeRoutingMode: deps.normalizeRoutingMode,
    };
  }

  return {
    getSwarmCursorMode: () =>
      resolveSwarmCursorMode({
        getCoreSwarm: deps.getCoreSwarm,
        getSettingsDefaults: deps.getSettingsDefaults,
        defaultSwarmSettings: deps.defaultSwarmSettings,
      }),
    getSwarmSettings: () =>
      resolveSwarmSettings(getResolveSwarmSettingsArgs()),
    getPathfindingStateSnapshot: () =>
      resolvePathfindingStateSnapshot({
        getCorePathfinding: deps.getCorePathfinding,
        clamp: deps.clamp,
      }),
    syncMapStateToStore: () =>
      syncMapState({
        store: deps.store,
        currentMapFolderPath: deps.getCurrentMapFolderPath(),
        splatSize: getSplatSize(),
      }),
    setModeToStore: (mode) =>
      setModeState({
        store: deps.store,
        mode,
      }),
    setCameraPoseToStore: (panX, panY, zoom) =>
      setCameraPoseState({
        store: deps.store,
        panX,
        panY,
        zoom,
      }),
    setCycleHourUiToStore: (cycleHour) =>
      setCycleHourUiState({
        store: deps.store,
        cycleHour,
      }),
    patchPathfindingStateToStore: (patch) =>
      patchPathfindingState({
        store: deps.store,
        patch,
      }),
    syncPathfindingStateToStore: (snapshot) =>
      syncPathfindingState({
        store: deps.store,
        snapshot,
      }),
    patchSimulationKnobSectionToStore: (key, value) =>
      patchSimulationKnobSection({
        store: deps.store,
        key,
        value,
      }),
    setCycleSpeedToStore: (cycleSpeed) =>
      setCycleSpeedState({
        store: deps.store,
        cycleSpeed,
      }),
    setSimTickHoursToStore: (simTickHours) =>
      setSimTickHoursState({
        store: deps.store,
        simTickHours,
      }),
    setTimeRoutingModeToStore: (target, mode) =>
      setTimeRoutingModeState({
        store: deps.store,
        target,
        mode,
      }),
    syncPointLightsStateToStore: (nextLiveUpdate = null, nextSaveConfirmArmed = null) =>
      syncPointLightsState({
        store: deps.store,
        isPointLightLiveUpdateEnabled: () =>
          getPointLightLiveUpdateEnabled({
            getCorePointLights: deps.getCorePointLights,
          }),
        nextLiveUpdate,
        nextSaveConfirmArmed,
      }),
    patchSwarmSettingsToStore: (patch) =>
      patchSwarmSettingsState({
        store: deps.store,
        patch,
      }),
    syncCursorLightStateToStore: () =>
      syncCursorLightState({
        store: deps.store,
        cursorLightState: getCursorLightState(),
        clamp: deps.clamp,
      }),
    getCursorLightSnapshot: () =>
      buildCursorLightSnapshot({
        getCoreCursorLight: deps.getCoreCursorLight,
        getCursorLightState,
        clamp: deps.clamp,
      }),
    isPointLightLiveUpdateEnabled: () =>
      getPointLightLiveUpdateEnabled({
        getCorePointLights: deps.getCorePointLights,
      }),
    isPointLightsSaveConfirmArmed: () =>
      Boolean(deps.getCorePointLights()?.saveConfirmArmed),
    setSwarmDefaults: () =>
      applySwarmDefaults({
        updateStoreFromAppliedSettings: deps.updateStoreFromAppliedSettings,
        normalizeAppliedSettings: deps.normalizeAppliedSettings,
        defaultSwarmSettings: deps.defaultSwarmSettings,
        applySwarmSettingsCompat: deps.applySwarmSettingsCompat,
        stopSwarmFollow: getStopSwarmFollow(),
        swarmState: getSwarmState(),
      }),
    isSwarmEnabled: () =>
      resolveSwarmEnabled({
        getSwarmSettings: () => resolveSwarmSettings(getResolveSwarmSettingsArgs()),
      }),
  };
}
