import {
  DEFAULT_SCOUT_REVEAL_RADIUS,
  DEFAULT_SCOUT_SCAN_RADIUS,
} from "./playerActivityStateRuntime.js";

function finite(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resetScoutInspectFields(runtime) {
  runtime.inspectX = null;
  runtime.inspectY = null;
  runtime.inspectHeight = null;
  runtime.inspectSlope = null;
  runtime.inspectResources = [];
}

export function createScoutActivityController(deps) {
  const runtime = deps.runtime;
  const playerState = deps.playerState;
  const activityType = deps.activityType;

  function resolveRevealRadius() {
    return typeof deps.resolveDiscoveryRevealRadius === "function"
      ? deps.resolveDiscoveryRevealRadius("water", runtime.scoutRevealRadius)
      : runtime.scoutRevealRadius;
  }

  function startScout() {
    if (runtime.active) {
      return { ok: false, reason: "An activity is already active." };
    }
    const movement = typeof deps.getMovementSnapshot === "function" ? deps.getMovementSnapshot() : null;
    if (movement && movement.active) {
      return { ok: false, reason: "Cancel current travel before scouting." };
    }
    runtime.active = true;
    runtime.type = activityType;
    runtime.originX = Math.round(finite(playerState.pixelX, 0));
    runtime.originY = Math.round(finite(playerState.pixelY, 0));
    const scoutSettings = typeof deps.getScoutSettings === "function" ? deps.getScoutSettings() : null;
    const scanRadius = Math.max(0, finite(scoutSettings && scoutSettings.scanRadius, DEFAULT_SCOUT_SCAN_RADIUS));
    const revealRadius = Math.max(0, finite(scoutSettings && scoutSettings.revealRadius, DEFAULT_SCOUT_REVEAL_RADIUS));
    runtime.radius = scanRadius;
    runtime.stepsTaken = 0;
    runtime.foundCount = 0;
    runtime.visitedCells = new Set();
    runtime.recentCells = [];
    runtime.lastMessage = "Listening for nearby birds.";
    resetScoutInspectFields(runtime);
    runtime.scoutPhase = "scanning";
    runtime.scoutScanRadius = scanRadius;
    runtime.scoutRevealRadius = revealRadius;
    runtime.scoutEffectiveRevealRadius = resolveRevealRadius();
    runtime.scoutCandidateIndex = -1;
    runtime.scoutCandidateId = 0;
    runtime.scoutCandidateDistance = null;
    runtime.scoutPossessedIndex = -1;
    runtime.scoutPossessedId = 0;
    runtime.scoutBirdX = null;
    runtime.scoutBirdY = null;
    runtime.scoutDisconnectReason = "";
    runtime.lastScoutSyncMs = 0;
    deps.syncStore();
    if (typeof deps.setStatus === "function") {
      deps.setStatus("Scouting: listening for nearby birds.");
    }
    return { ok: true };
  }

  function possessScoutCandidate() {
    if (!runtime.active || runtime.type !== activityType) {
      return { ok: false, reason: "Scout activity is not active." };
    }
    if (!Number.isInteger(runtime.scoutCandidateIndex) || runtime.scoutCandidateIndex < 0) {
      return { ok: false, reason: "No bird is close enough to possess." };
    }
    runtime.scoutPhase = "possessed";
    runtime.scoutPossessedIndex = runtime.scoutCandidateIndex;
    runtime.scoutPossessedId = runtime.scoutCandidateId;
    runtime.scoutDisconnectReason = "";
    runtime.lastMessage = `Seeing through bird #${runtime.scoutPossessedIndex}.`;
    deps.syncStore();
    if (typeof deps.setStatus === "function") {
      deps.setStatus(`Possessing bird #${runtime.scoutPossessedIndex}.`);
    }
    return { ok: true };
  }

  function updatePossessedScout() {
    const result = typeof deps.updatePossessedScoutBird === "function"
      ? deps.updatePossessedScoutBird({
        index: runtime.scoutPossessedIndex,
        agentId: runtime.scoutPossessedId,
        revealRadius: runtime.scoutRevealRadius,
      })
      : null;
    if (!result || result.valid === false) {
      runtime.scoutDisconnectReason = "The possessed bird was killed.";
      runtime.scoutPhase = "scanning";
      runtime.scoutPossessedIndex = -1;
      runtime.scoutPossessedId = 0;
      runtime.scoutBirdX = null;
      runtime.scoutBirdY = null;
      runtime.lastMessage = runtime.scoutDisconnectReason;
      return;
    }
    runtime.scoutPossessedIndex = Number.isInteger(result.index) ? result.index : runtime.scoutPossessedIndex;
    runtime.scoutPossessedId = Number.isFinite(Number(result.agentId))
      ? Math.round(Number(result.agentId))
      : runtime.scoutPossessedId;
    runtime.scoutBirdX = Number.isFinite(Number(result.x)) ? Number(result.x) : runtime.scoutBirdX;
    runtime.scoutBirdY = Number.isFinite(Number(result.y)) ? Number(result.y) : runtime.scoutBirdY;
    runtime.scoutEffectiveRevealRadius = Number.isFinite(Number(result.effectiveRevealRadius))
      ? Number(result.effectiveRevealRadius)
      : runtime.scoutEffectiveRevealRadius;
    runtime.lastMessage = `Seeing through bird #${runtime.scoutPossessedIndex}.`;
  }

  function updateScanningScout(previous) {
    runtime.scoutPhase = "scanning";
    const candidate = typeof deps.findScoutBirdCandidate === "function"
      ? deps.findScoutBirdCandidate(runtime.originX, runtime.originY, runtime.scoutScanRadius)
      : null;
    runtime.scoutCandidateIndex = candidate && Number.isInteger(candidate.index) ? candidate.index : -1;
    runtime.scoutCandidateId = candidate && Number.isFinite(Number(candidate.agentId))
      ? Math.round(Number(candidate.agentId))
      : 0;
    runtime.scoutCandidateDistance = candidate && Number.isFinite(Number(candidate.distance))
      ? Number(candidate.distance)
      : null;
    runtime.scoutBirdX = candidate && Number.isFinite(Number(candidate.x)) ? Number(candidate.x) : null;
    runtime.scoutBirdY = candidate && Number.isFinite(Number(candidate.y)) ? Number(candidate.y) : null;
    runtime.scoutEffectiveRevealRadius = resolveRevealRadius();
    if (previous.candidateIndex < 0 && runtime.scoutCandidateIndex >= 0) {
      deps.setActivitySpeed1x();
    }
    runtime.lastMessage = runtime.scoutDisconnectReason || (runtime.scoutCandidateIndex >= 0
      ? "A bird is within reach."
      : "Listening... no bird sensed nearby.");
  }

  function updateScout(nowMs = 0) {
    if (!runtime.active || runtime.ending || runtime.type !== activityType) return false;
    const previous = {
      phase: runtime.scoutPhase,
      candidateIndex: runtime.scoutCandidateIndex,
      candidateDistance: runtime.scoutCandidateDistance,
      possessedIndex: runtime.scoutPossessedIndex,
      message: runtime.lastMessage,
    };

    if (runtime.scoutPhase === "possessed") {
      updatePossessedScout();
    }

    if (runtime.scoutPhase !== "possessed") {
      updateScanningScout(previous);
    }

    const safeNowMs = Number.isFinite(Number(nowMs)) ? Number(nowMs) : 0;
    const shouldSync = previous.phase !== runtime.scoutPhase
      || previous.candidateIndex !== runtime.scoutCandidateIndex
      || previous.possessedIndex !== runtime.scoutPossessedIndex
      || previous.message !== runtime.lastMessage
      || Math.abs(finite(previous.candidateDistance, -1) - finite(runtime.scoutCandidateDistance, -1)) >= 0.5
      || safeNowMs - runtime.lastScoutSyncMs >= 500;
    if (shouldSync) {
      runtime.lastScoutSyncMs = safeNowMs;
      deps.syncStore();
    }
    return true;
  }

  return {
    startScout,
    possessScoutCandidate,
    updateScout,
  };
}
