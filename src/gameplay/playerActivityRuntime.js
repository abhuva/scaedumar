import {
  createPlayerActivityState,
  getPlayerActivitySnapshot,
  resetPlayerActivityState,
  startBaseActivityState,
} from "./playerActivityStateRuntime.js";
import {
  buildGatheringMoveCandidates,
  chooseWeightedGatheringCandidate,
  createResourceSearchActivityController,
} from "./playerResourceSearchActivityRuntime.js";
import { createInspectActivityController } from "./playerInspectActivityRuntime.js";
import { createRestActivityController } from "./playerRestActivityRuntime.js";
import { createScoutActivityController } from "./playerScoutActivityRuntime.js";
import { createTravelActivityController } from "./playerTravelActivityRuntime.js";
import { createPlayerActivityUpkeepController } from "./playerActivityUpkeepRuntime.js";
import { createHuntingActivityController } from "./playerHuntingActivityRuntime.js";

export {
  buildGatheringMoveCandidates,
  chooseWeightedGatheringCandidate,
};

export const ACTIVITY_IDLE = "idle";
export const ACTIVITY_NONE = ACTIVITY_IDLE;
export const ACTIVITY_TRAVEL = "travel";
export const ACTIVITY_GATHERING = "gathering";
export const ACTIVITY_GATHER_WATER = "gather_water";
export const ACTIVITY_HUNTING = "hunting";
export const ACTIVITY_INSPECT = "inspect";
export const ACTIVITY_REST = "rest";
export const ACTIVITY_SCOUT = "scout";
export const ACTIVITY_TIME_SPEED_1X = 0.01;
export const ACTIVITY_TIME_SPEED_20X = 0.2;

export function createPlayerActivityRuntime(deps) {
  const activityDefinitions = deps && deps.activityDefinitions && typeof deps.activityDefinitions === "object"
    ? deps.activityDefinitions
    : {};
  const runtime = createPlayerActivityState(ACTIVITY_IDLE);

  function getSnapshot() {
    return getPlayerActivitySnapshot(runtime, activityDefinitions);
  }

  function syncStore() {
    if (typeof deps.setActivitySnapshot === "function") {
      deps.setActivitySnapshot(getSnapshot());
    }
    if (typeof deps.onActivitySnapshot === "function") {
      deps.onActivitySnapshot(getSnapshot());
    }
    if (typeof deps.requestOverlayDraw === "function") {
      deps.requestOverlayDraw();
    }
  }

  function setActivitySpeed1x() {
    if (typeof deps.setCycleSpeed === "function") {
      deps.setCycleSpeed(ACTIVITY_TIME_SPEED_1X);
    }
  }

  function setActivitySpeed20x() {
    if (typeof deps.setCycleSpeed === "function") {
      deps.setCycleSpeed(ACTIVITY_TIME_SPEED_20X);
    }
  }

  function resetRuntime(lastMessage = "") {
    resetPlayerActivityState(runtime, ACTIVITY_IDLE, lastMessage);
  }

  function getActivityDefinition(type) {
    return activityDefinitions[type] || null;
  }

  function getCancelLabel(type) {
    const definition = getActivityDefinition(type);
    return definition && definition.cancelLabel ? definition.cancelLabel : "Activity canceled.";
  }

  function getCompleteLabel(type, fallback) {
    const definition = getActivityDefinition(type);
    return definition && definition.completeLabel ? definition.completeLabel : fallback;
  }

  function startRuntimeActivity(type, message) {
    startBaseActivityState(runtime, type, message, deps.playerState);
  }

  function startGathering() {
    return startResourceSearch(ACTIVITY_GATHERING);
  }

  function isResourceSearchActivity(type = runtime.type) {
    return resourceSearchController.isResourceSearchActivity(type);
  }

  function startResourceSearch(activityType) {
    return resourceSearchController.startResourceSearch(activityType);
  }

  function startGatherWater() {
    return startResourceSearch(ACTIVITY_GATHER_WATER);
  }

  function startHunting() {
    return huntingController.startHunting();
  }

  function startTravel() {
    return travelController.startTravel();
  }

  function updateInspectAtPixel(pixelX, pixelY) {
    return inspectController.updateInspectAtPixel(pixelX, pixelY);
  }

  function startInspect() {
    return inspectController.startInspect();
  }

  function startScout() {
    return scoutController.startScout();
  }

  function possessScoutCandidate() {
    return scoutController.possessScoutCandidate();
  }

  function startRest() {
    return restController.startRest();
  }

  function stopActivity(options = {}) {
    if (!runtime.active) return false;
    const stoppedType = runtime.type;
    const reason = String(options.reason || "Activity stopped.");
    const cancelMovement = options.cancelMovement !== false;
    runtime.lastMessage = reason;
    runtime.ending = true;
    if (cancelMovement && typeof deps.cancelMovementQueue === "function") {
      deps.cancelMovementQueue();
    }
    runtime.ending = false;
    resetRuntime(reason);
    setActivitySpeed1x();
    if (stoppedType === ACTIVITY_SCOUT && typeof deps.onScoutStopped === "function") {
      deps.onScoutStopped({ reason });
    }
    syncStore();
    if (typeof deps.setStatus === "function") {
      deps.setStatus(reason);
    }
    return true;
  }

  const resourceSearchController = createResourceSearchActivityController({
    runtime,
    playerState: deps.playerState,
    getActivityDefinition,
    getMapWidth: deps.getMapWidth,
    getMapHeight: deps.getMapHeight,
    getMoveCostContext: deps.getMoveCostContext,
    computeMoveStepCost: deps.computeMoveStepCost,
    replaceMovementQueue: deps.replaceMovementQueue,
    getMovementSnapshot: deps.getMovementSnapshot,
    getResourceMovementBias: deps.getResourceMovementBias,
    getResourceValue: deps.getResourceValue,
    getResourceSearchChance: deps.getResourceSearchChance,
    random: deps.random,
    setStatus: deps.setStatus,
    onResourceSearch: deps.onResourceSearch,
    onResourceFound: deps.onResourceFound,
    setActivitySpeed1x,
    setActivitySpeed20x,
    syncStore,
    stopActivity,
  });

  const inspectController = createInspectActivityController({
    runtime,
    playerState: deps.playerState,
    activityType: ACTIVITY_INSPECT,
    getMapWidth: deps.getMapWidth,
    getMapHeight: deps.getMapHeight,
    getMovementSnapshot: deps.getMovementSnapshot,
    sampleHeight: deps.sampleHeight,
    sampleSlope: deps.sampleSlope,
    getInspectResourceReadings: deps.getInspectResourceReadings,
    syncStore,
    setStatus: deps.setStatus,
  });

  const travelController = createTravelActivityController({
    runtime,
    activityType: ACTIVITY_TRAVEL,
    getMovementSnapshot: deps.getMovementSnapshot,
    getCompleteLabel,
    startRuntimeActivity,
    setActivitySpeed1x,
    setActivitySpeed20x,
    syncStore,
    stopActivity,
  });

  const restController = createRestActivityController({
    runtime,
    playerState: deps.playerState,
    activityType: ACTIVITY_REST,
    getMovementSnapshot: deps.getMovementSnapshot,
    onRestTick: deps.onRestTick,
    getConditionSnapshot: deps.getConditionSnapshot,
    setActivitySpeed1x,
    syncStore,
    stopActivity,
    setStatus: deps.setStatus,
  });

  const scoutController = createScoutActivityController({
    runtime,
    playerState: deps.playerState,
    activityType: ACTIVITY_SCOUT,
    getMovementSnapshot: deps.getMovementSnapshot,
    getScoutSettings: deps.getScoutSettings,
    resolveDiscoveryRevealRadius: deps.resolveDiscoveryRevealRadius,
    findScoutBirdCandidate: deps.findScoutBirdCandidate,
    updatePossessedScoutBird: deps.updatePossessedScoutBird,
    setActivitySpeed1x,
    syncStore,
    setStatus: deps.setStatus,
  });

  const huntingController = createHuntingActivityController({
    runtime,
    playerState: deps.playerState,
    activityType: ACTIVITY_HUNTING,
    getMapWidth: deps.getMapWidth,
    getMapHeight: deps.getMapHeight,
    replaceMovementQueue: deps.replaceMovementQueue,
    getMovementSnapshot: deps.getMovementSnapshot,
    getHuntingSettings: deps.getHuntingSettings,
    sampleHuntingAvailability: deps.sampleHuntingAvailability,
    onHuntingSearch: deps.onHuntingSearch,
    onHuntingSuccess: deps.onHuntingSuccess,
    random: deps.random,
    setActivitySpeed1x,
    setActivitySpeed20x,
    syncStore,
    stopActivity,
    setStatus: deps.setStatus,
  });

  const upkeepController = createPlayerActivityUpkeepController({
    runtime,
    onUpkeepTick: deps.onUpkeepTick,
  });

  function onStepCompleted(step) {
    if (!runtime.active || runtime.ending) return;
    if (travelController.onStepCompleted(step)) return;
    if (huntingController.onStepCompleted(step)) return;
    resourceSearchController.onStepCompleted(step);
  }

  function onQueueCompleted() {
    if (!runtime.active || runtime.ending) return;
    if (travelController.onQueueCompleted()) return;
    if (huntingController.onQueueCompleted()) return;
    resourceSearchController.onQueueCompleted();
  }

  function onMovementCanceled() {
    if (!runtime.active || runtime.ending) return;
    stopActivity({ reason: getCancelLabel(runtime.type), cancelMovement: false });
  }

  function updateScout(nowMs = 0) {
    return scoutController.updateScout(nowMs);
  }

  function update(ctx) {
    const ticksToProcess = upkeepController.update(ctx);
    if (ticksToProcess <= 0) return;

    restController.updateRestTicks(ticksToProcess);
  }

  return {
    startGathering,
    startGatherWater,
    startHunting,
    startTravel,
    startInspect,
    startRest,
    startScout,
    possessScoutCandidate,
    updateInspectAtPixel,
    updateScout,
    stopActivity,
    cancelActivity: () => {
      return stopActivity({ reason: getCancelLabel(runtime.type), cancelMovement: true });
    },
    isActivityActive: () => runtime.active,
    isInspectActive: () => runtime.active && runtime.type === ACTIVITY_INSPECT,
    isScoutActive: () => runtime.active && runtime.type === ACTIVITY_SCOUT,
    getSnapshot,
    onStepCompleted,
    onQueueCompleted,
    onMovementCanceled,
    update,
  };
}

export const createGatheringActivityRuntime = createPlayerActivityRuntime;
