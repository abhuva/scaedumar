export function updateCoreFrameSnapshot(store, nowMs, deps) {
  const pathfinding = typeof deps.getPathfindingState === "function" ? deps.getPathfindingState() : null;
  const swarm = typeof deps.getSwarmRuntimeState === "function" ? deps.getSwarmRuntimeState() : null;
  const player = typeof deps.getPlayerState === "function" ? deps.getPlayerState() : null;
  const interactionMode = typeof deps.getInteractionMode === "function" ? deps.getInteractionMode() : "none";
  const weatherInput = typeof deps.getWeatherInput === "function" ? deps.getWeatherInput() : null;
  const simulationKnobs = typeof deps.getSimulationKnobs === "function" ? deps.getSimulationKnobs() : null;
  const cursorLight = typeof deps.getCursorLightState === "function" ? deps.getCursorLightState() : null;

  store.update((prev) => ({
    ...prev,
    clock: {
      ...prev.clock,
      nowSec: Math.max(0, Number(nowMs) * 0.001),
      timeScale: deps.clamp(Number(deps.cycleSpeedInput.value), 0, 1),
    },
    camera: {
      ...prev.camera,
      panX: deps.panWorld.x,
      panY: deps.panWorld.y,
      zoom: deps.getZoom(),
    },
    map: {
      ...prev.map,
      folderPath: deps.currentMapFolderPath,
      width: deps.splatSize.width,
      height: deps.splatSize.height,
      loaded: Boolean(deps.currentMapFolderPath),
    },
    simulation: weatherInput
      ? {
        ...prev.simulation,
        knobs: simulationKnobs
          ? {
            ...prev.simulation.knobs,
            ...simulationKnobs,
          }
          : prev.simulation.knobs,
        weather: {
          ...prev.simulation.weather,
          ...weatherInput,
        },
      }
      : simulationKnobs
        ? {
          ...prev.simulation,
          knobs: {
            ...prev.simulation.knobs,
            ...simulationKnobs,
          },
        }
        : prev.simulation,
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
