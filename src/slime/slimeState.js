export const DEFAULT_SLIME_SIMULATION_STATE = {
  running: false,
  initialized: false,
  backend: "webgl2",
  fps: 0,
  frame: 0,
  error: "",
  capabilities: "Not initialized",
};

export function normalizeSlimeSettings(input = {}, fallback = {}) {
  const source = input && typeof input === "object" ? input : {};
  const base = fallback && typeof fallback === "object" ? fallback : {};
  const next = { ...base, ...source };

  return {
    enabled: Boolean(next.enabled),
    agentCount: clampRound(next.agentCount, 1000, 5000000),
    simSize: clampRound(next.simSize, 128, 4096),
    stepsPerFrame: clampRound(next.stepsPerFrame, 1, 16),
    timeMode: next.timeMode === "gameTick" ? "gameTick" : "free",
    stepsPerGameTick: clampRound(next.stepsPerGameTick, 1, 10),
    gameTicksPerSlimeStep: clampRound(next.gameTicksPerSlimeStep, 1, 10),
    maxGameStepsPerFrame: clampRound(next.maxGameStepsPerFrame, 1, 20),
    warmupSteps: clampRound(next.warmupSteps, 0, 20000),
    availabilityGridSize: clampRound(next.availabilityGridSize, 32, 512),
    availabilityEffectiveMax: clampNumber(next.availabilityEffectiveMax, 0.01, 5),
    availabilityUpdateTickInterval: clampRound(next.availabilityUpdateTickInterval, 1, 100),
    plantStockSyncTickInterval: clampRound(next.plantStockSyncTickInterval, 10, 1000),
    sensorDistance: clampNumber(next.sensorDistance, 1, 96),
    sensorAngleDeg: clampNumber(next.sensorAngleDeg, 0, 180),
    sensorSize: clampRound(next.sensorSize, 1, 5),
    sensorNoise: clampNumber(next.sensorNoise, 0, 1),
    stepSize: clampNumber(next.stepSize, 0.1, 10),
    turnAngleDeg: clampNumber(next.turnAngleDeg, 0, 180),
    wanderChance: clampNumber(next.wanderChance, 0, 1),
    wanderStrengthDeg: clampNumber(next.wanderStrengthDeg, 0, 180),
    depositAmount: clampNumber(next.depositAmount, 0, 4),
    depositSize: clampNumber(next.depositSize, 1, 8),
    diffusion: clampNumber(next.diffusion, 0, 1),
    decay: clampNumber(next.decay, 0.8, 1),
    trailGain: clampNumber(next.trailGain, 0.1, 20),
    trailGamma: clampNumber(next.trailGamma, 0.1, 4),
    palette: ["fire", "ice", "mono", "toxic"].includes(next.palette) ? next.palette : "fire",
    wrapEdges: Boolean(next.wrapEdges),
    spawnMode: ["disk", "full", "ring", "line", "edge"].includes(next.spawnMode) ? next.spawnMode : "full",
    useTerrain: Boolean(next.useTerrain),
    showTerrainUnderlay: Boolean(next.showTerrainUnderlay),
    terrainMix: clampNumber(next.terrainMix, 0, 10),
    slopeBias: clampNumber(next.slopeBias, -10, 10),
    slopeCutoff: clampNumber(next.slopeCutoff, 0, 1),
    heightBias: clampNumber(next.heightBias, -10, 10),
    heightMin: clampNumber(next.heightMin, 0, 1),
    heightMax: clampNumber(next.heightMax, 0, 1),
    heightBandWeight: clampNumber(next.heightBandWeight, 0, 10),
    waterBias: clampNumber(next.waterBias, -10, 10),
    plantBias: clampNumber(next.plantBias, -10, 10),
    plantFloor: clampNumber(next.plantFloor, 0, 1),
    plantEatAmount: clampRound(next.plantEatAmount, 0, 50),
    plantEatTickInterval: clampRound(next.plantEatTickInterval, 1, 60),
    plantRegenAmount: clampRound(next.plantRegenAmount, 0, 50),
    plantRegenTickInterval: clampRound(next.plantRegenTickInterval, 1, 20),
    huntingFleeSteps: clampRound(next.huntingFleeSteps, 0, 1000),
    huntingFleeWeight: clampNumber(next.huntingFleeWeight, 0, 200),
    huntingFleeRadius: clampNumber(next.huntingFleeRadius, 1, 512),
    brushRadius: clampNumber(next.brushRadius, 1, 512),
    brushTrailClear: clampNumber(next.brushTrailClear, 0, 1),
    seed: clampRound(next.seed, 1, 999999),
  };
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.max(min, Math.min(max, number));
}

function clampRound(value, min, max) {
  return Math.round(clampNumber(value, min, max));
}
