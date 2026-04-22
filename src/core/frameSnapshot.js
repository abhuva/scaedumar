function buildSimulationUpdate(prevSimulation, weatherInput, simulationKnobs) {
  const nextSimulation = {
    ...prevSimulation,
  };
  if (weatherInput) {
    nextSimulation.weather = {
      ...prevSimulation.weather,
      ...weatherInput,
    };
  }
  if (simulationKnobs) {
    nextSimulation.knobs = {
      ...prevSimulation.knobs,
      ...simulationKnobs,
    };
  }
  return nextSimulation;
}

export function updateCoreFrameSnapshot(store, nowMs, deps) {
  const pathfinding = typeof deps.getPathfindingState === "function" ? deps.getPathfindingState() : null;
  const swarm = typeof deps.getSwarmRuntimeState === "function" ? deps.getSwarmRuntimeState() : null;
  const player = typeof deps.getPlayerState === "function" ? deps.getPlayerState() : null;
  const interactionMode = typeof deps.getInteractionMode === "function" ? deps.getInteractionMode() : "none";
  const weatherInput = typeof deps.getWeatherInput === "function" ? deps.getWeatherInput() : null;
  const simulationKnobs = typeof deps.getSimulationKnobs === "function" ? deps.getSimulationKnobs() : null;
  const cursorLight = typeof deps.getCursorLightState === "function" ? deps.getCursorLightState() : null;
  const zoom = typeof deps.getZoom === "function" ? deps.getZoom() : 1;
  const panX = deps.panWorld && Number.isFinite(deps.panWorld.x) ? deps.panWorld.x : 0;
  const panY = deps.panWorld && Number.isFinite(deps.panWorld.y) ? deps.panWorld.y : 0;
  const mapWidth = deps.splatSize && Number.isFinite(deps.splatSize.width) ? deps.splatSize.width : 0;
  const mapHeight = deps.splatSize && Number.isFinite(deps.splatSize.height) ? deps.splatSize.height : 0;
  const cycleSpeed = deps.cycleSpeedInput && "value" in deps.cycleSpeedInput
    ? Number(deps.cycleSpeedInput.value)
    : 0;
  const safeCycleSpeed = Number.isFinite(cycleSpeed) ? cycleSpeed : 0;

  store.update((prev) => ({
    ...prev,
    clock: {
      ...prev.clock,
      nowSec: Math.max(0, Number(nowMs) * 0.001),
      timeScale: deps.clamp(safeCycleSpeed, 0, 1),
    },
    camera: {
      ...prev.camera,
      panX,
      panY,
      zoom,
    },
    map: {
      ...prev.map,
      folderPath: deps.currentMapFolderPath,
      width: mapWidth,
      height: mapHeight,
      loaded: Boolean(deps.currentMapFolderPath),
    },
    simulation: buildSimulationUpdate(prev.simulation, weatherInput, simulationKnobs),
    gameplay: {
      ...prev.gameplay,
      interactionMode,
      player: player
        ? {
          ...prev.gameplay.player,
          pixelX: player.pixelX,
          pixelY: player.pixelY,
        }
        : prev.gameplay.player,
      pathfinding: pathfinding
        ? {
          ...prev.gameplay.pathfinding,
          ...pathfinding,
        }
        : prev.gameplay.pathfinding,
      swarm: swarm
        ? {
          ...prev.gameplay.swarm,
          ...swarm,
        }
        : prev.gameplay.swarm,
      cursorLight: cursorLight
        ? {
          ...prev.gameplay.cursorLight,
          ...cursorLight,
        }
        : prev.gameplay.cursorLight,
    },
  }));
}
