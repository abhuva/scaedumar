import {
  DEFAULT_GAMEPLAY_CURSOR_LIGHT,
  DEFAULT_GAMEPLAY_PATHFINDING,
  DEFAULT_GAMEPLAY_SWARM,
} from "./state.js";

function buildSimulationUpdate(prevSimulation, weatherInput, simulationKnobs) {
  if (!weatherInput && !simulationKnobs) {
    return prevSimulation;
  }
  if (weatherInput && simulationKnobs) {
    return {
      ...prevSimulation,
      weather: {
        ...prevSimulation.weather,
        ...weatherInput,
      },
      knobs: {
        ...prevSimulation.knobs,
        ...simulationKnobs,
      },
    };
  }
  if (weatherInput) {
    return {
      ...prevSimulation,
      weather: {
        ...prevSimulation.weather,
        ...weatherInput,
      },
    };
  }
  return {
    ...prevSimulation,
    knobs: {
      ...prevSimulation.knobs,
      ...simulationKnobs,
    },
  };
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
  const clamp01 = typeof deps.clamp === "function"
    ? (value) => deps.clamp(value, 0, 1)
    : (value) => Math.max(0, Math.min(1, value));

  store.update((prev) => ({
    ...prev,
    clock: {
      ...prev.clock,
      nowSec: Math.max(0, Number(nowMs) * 0.001),
      timeScale: clamp01(safeCycleSpeed),
    },
    camera: {
      ...prev.camera,
      panX,
      panY,
      zoom,
    },
    map: {
      ...prev.map,
      folderPath: deps.currentMapFolderPath ?? "",
      width: mapWidth,
      height: mapHeight,
      loaded: Boolean(deps.currentMapFolderPath ?? ""),
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
        : { ...DEFAULT_GAMEPLAY_PATHFINDING },
      swarm: swarm
        ? {
          ...prev.gameplay.swarm,
          ...swarm,
        }
        : { ...DEFAULT_GAMEPLAY_SWARM },
      cursorLight: cursorLight
        ? {
          ...prev.gameplay.cursorLight,
          ...cursorLight,
        }
        : { ...DEFAULT_GAMEPLAY_CURSOR_LIGHT },
    },
  }));
}
