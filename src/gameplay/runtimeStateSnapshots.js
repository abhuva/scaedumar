export function getInteractionModeSnapshot(deps) {
  const gameplay = deps.getCoreGameplay();
  const storedMode = gameplay && typeof gameplay.interactionMode === "string"
    ? gameplay.interactionMode
    : "none";
  return storedMode === "lighting" || storedMode === "pathfinding" ? storedMode : "none";
}

export function getSwarmCursorMode(deps) {
  const coreSwarm = deps.getCoreSwarm();
  if (coreSwarm && typeof coreSwarm.cursorMode === "string") {
    const storedMode = String(coreSwarm.cursorMode);
    if (storedMode === "attract" || storedMode === "repel") return storedMode;
    if (storedMode === "none") return "none";
  }
  const defaults = deps.getSettingsDefaults("swarm", deps.defaultSwarmSettings);
  const defaultMode = String(defaults.cursorMode || "none");
  return defaultMode === "attract" || defaultMode === "repel" ? defaultMode : "none";
}

export function getSwarmSettings(deps) {
  const coreSwarm = deps.getCoreSwarm() || {};
  const defaults = deps.getSettingsDefaults("swarm", deps.defaultSwarmSettings);
  const source = {
    ...defaults,
    ...coreSwarm,
  };
  const minHeight = Math.round(deps.clamp(Number(source.minHeight), 0, deps.swarmZMax));
  const rawMaxHeight = Math.round(deps.clamp(Number(source.maxHeight), 0, deps.swarmZMax));
  const maxHeight = Math.max(minHeight, rawMaxHeight);
  const followZoomOut = deps.clamp(Number(source.followZoomOut), deps.zoomMin, deps.zoomMax);
  const rawFollowZoomIn = deps.clamp(Number(source.followZoomIn), deps.zoomMin, deps.zoomMax);
  const followZoomIn = Math.max(followZoomOut, rawFollowZoomIn);
  const followAgentSpeedSmoothing = deps.clamp(Number(source.followAgentSpeedSmoothing), 0.01, 0.25);
  const followAgentZoomSmoothing = deps.clamp(Number(source.followAgentZoomSmoothing), 0.01, 0.25);
  const backgroundColor = typeof source.backgroundColor === "string" && /^#?[0-9a-fA-F]{6}$/.test(source.backgroundColor)
    ? (source.backgroundColor.startsWith("#") ? source.backgroundColor : `#${source.backgroundColor}`)
    : deps.defaultSwarmSettings.backgroundColor;
  const hawkColor = typeof source.hawkColor === "string" && /^#?[0-9a-fA-F]{6}$/.test(source.hawkColor)
    ? (source.hawkColor.startsWith("#") ? source.hawkColor : `#${source.hawkColor}`)
    : deps.defaultSwarmSettings.hawkColor;
  return {
    ...source,
    useAgentSwarm: Boolean(source.useAgentSwarm),
    useLitSwarm: Boolean(source.useLitSwarm),
    followZoomBySpeed: Boolean(source.followZoomBySpeed),
    followZoomIn,
    followZoomOut,
    followHawkRangeGizmo: Boolean(source.followHawkRangeGizmo),
    followAgentSpeedSmoothing,
    followAgentZoomSmoothing,
    showStatsPanel: Boolean(source.showStatsPanel),
    showTerrainInSwarm: Boolean(source.showTerrainInSwarm),
    backgroundColor,
    agentCount: Math.round(deps.clamp(Number(source.agentCount), 100, 1000)),
    simulationSpeed: deps.clamp(Number(source.simulationSpeed), 0.1, 20),
    maxSpeed: deps.clamp(Number(source.maxSpeed), 30, 300),
    maxSteering: deps.clamp(Number(source.maxSteering), 10, 500),
    variationStrengthPct: Math.round(deps.clamp(Number(source.variationStrengthPct), 0, 50)),
    neighborRadius: deps.clamp(Number(source.neighborRadius), 10, 200),
    minHeight,
    maxHeight,
    separationRadius: deps.clamp(Number(source.separationRadius), 6, 120),
    alignmentWeight: deps.clamp(Number(source.alignmentWeight), 0, 4),
    cohesionWeight: deps.clamp(Number(source.cohesionWeight), 0, 4),
    separationWeight: deps.clamp(Number(source.separationWeight), 0, 6),
    wanderWeight: deps.clamp(Number(source.wanderWeight), 0, 2),
    restChancePct: deps.clamp(Number(source.restChancePct), 0, 0.002),
    restTicks: Math.round(deps.clamp(Number(source.restTicks), 100, 10000)),
    breedingThreshold: Math.round(deps.clamp(Number(source.breedingThreshold), 0, 1000)),
    breedingSpawnChance: deps.clamp(Number(source.breedingSpawnChance), 0, 1),
    cursorMode: ["none", "attract", "repel"].includes(String(source.cursorMode)) ? String(source.cursorMode) : "none",
    cursorStrength: deps.clamp(Number(source.cursorStrength), 0, 8),
    cursorRadius: deps.clamp(Number(source.cursorRadius), 20, 260),
    useHawk: Boolean(source.useHawk),
    hawkCount: Math.round(deps.clamp(Number(source.hawkCount), 0, 20)),
    hawkColor,
    hawkSpeed: deps.clamp(Number(source.hawkSpeed), 30, 420),
    hawkSteering: deps.clamp(Number(source.hawkSteering), 20, 700),
    hawkTargetRange: Math.round(deps.clamp(Number(source.hawkTargetRange), 20, 500)),
    timeRouting: deps.normalizeRoutingMode(source.timeRouting, "global"),
  };
}

export function getPathfindingStateSnapshot(deps) {
  const corePathfinding = deps.getCorePathfinding() || {};
  return {
    range: Math.round(deps.clamp(Number(corePathfinding.range), 30, 300)),
    weightSlope: deps.clamp(Number(corePathfinding.weightSlope), 0, 10),
    weightHeight: deps.clamp(Number(corePathfinding.weightHeight), 0, 10),
    weightWater: deps.clamp(Number(corePathfinding.weightWater), 0, 100),
    slopeCutoff: Math.round(deps.clamp(Number(corePathfinding.slopeCutoff), 0, 90)),
    baseCost: deps.clamp(Number(corePathfinding.baseCost), 0, 2),
  };
}
