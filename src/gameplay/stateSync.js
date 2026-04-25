export function syncMapState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    map: {
      ...prev.map,
      folderPath: deps.currentMapFolderPath || "",
      width: deps.splatSize.width,
      height: deps.splatSize.height,
      loaded: Boolean(deps.currentMapFolderPath),
    },
  }));
}

export function syncPlayerState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      player: {
        ...prev.gameplay.player,
        pixelX: deps.playerState.pixelX,
        pixelY: deps.playerState.pixelY,
      },
    },
  }));
}

export function syncPointLightsState(deps) {
  const liveUpdate = deps.nextLiveUpdate == null ? deps.isPointLightLiveUpdateEnabled() : Boolean(deps.nextLiveUpdate);
  const nextSaveConfirmArmed = deps.nextSaveConfirmArmed;
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      pointLights: {
        ...(prev.gameplay && prev.gameplay.pointLights ? prev.gameplay.pointLights : {}),
        liveUpdate,
        saveConfirmArmed: nextSaveConfirmArmed == null
          ? Boolean(prev.gameplay && prev.gameplay.pointLights && prev.gameplay.pointLights.saveConfirmArmed)
          : Boolean(nextSaveConfirmArmed),
      },
    },
  }));
}

export function syncCursorLightState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      cursorLight: {
        ...prev.gameplay.cursorLight,
        enabled: Boolean(deps.cursorLightState.enabled),
        useTerrainHeight: Boolean(deps.cursorLightState.useTerrainHeight),
        strength: Math.round(deps.clamp(Number(deps.cursorLightState.strength), 1, 200)),
        heightOffset: Math.round(deps.clamp(Number(deps.cursorLightState.heightOffset), 0, 120)),
        color: typeof deps.cursorLightState.colorHex === "string" ? deps.cursorLightState.colorHex : "#ff9b2f",
        showGizmo: Boolean(deps.cursorLightState.showGizmo),
      },
    },
  }));
}

export function patchSimulationKnobSection(deps) {
  deps.store.update((prev) => ({
    ...prev,
    simulation: {
      ...prev.simulation,
      knobs: {
        ...(prev.simulation && prev.simulation.knobs ? prev.simulation.knobs : {}),
        [deps.key]: deps.value,
      },
    },
  }));
}

export function setCycleSpeedState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    clock: {
      ...prev.clock,
      timeScale: deps.cycleSpeed,
    },
    systems: {
      ...prev.systems,
      time: {
        ...(prev.systems && prev.systems.time ? prev.systems.time : {}),
        cycleSpeedHoursPerSec: deps.cycleSpeed,
      },
    },
  }));
}

export function setSimTickHoursState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    systems: {
      ...prev.systems,
      time: {
        ...(prev.systems && prev.systems.time ? prev.systems.time : {}),
        simTickHours: deps.simTickHours,
      },
    },
  }));
}

export function setTimeRoutingModeState(deps) {
  deps.store.update((prev) => {
    const prevTime = prev.systems && prev.systems.time ? prev.systems.time : {};
    return {
      ...prev,
      systems: {
        ...prev.systems,
        time: {
          ...prevTime,
          routing: {
            ...(prevTime && prevTime.routing ? prevTime.routing : {}),
            [deps.target]: deps.mode,
          },
        },
      },
    };
  });
}

export function setModeState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    mode: deps.mode,
  }));
}

export function setCameraPoseState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    camera: {
      ...(prev.camera || {}),
      panX: deps.panX,
      panY: deps.panY,
      zoom: deps.zoom,
    },
  }));
}

export function setCycleHourUiState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    ui: {
      ...(prev.ui || {}),
      cycleHour: deps.cycleHour,
    },
  }));
}

export function patchPathfindingState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      pathfinding: {
        ...(prev.gameplay && prev.gameplay.pathfinding ? prev.gameplay.pathfinding : {}),
        ...(deps.patch || {}),
      },
    },
  }));
}

export function syncPathfindingState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      pathfinding: {
        ...(prev.gameplay && prev.gameplay.pathfinding ? prev.gameplay.pathfinding : {}),
        ...(deps.snapshot || {}),
      },
    },
  }));
}

export function setInteractionModeState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      interactionMode: deps.interactionMode,
    },
  }));
}

export function patchPlayerState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      player: {
        ...(prev.gameplay && prev.gameplay.player ? prev.gameplay.player : {}),
        ...(deps.patch || {}),
      },
    },
  }));
}

export function patchMovementState(deps) {
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      movement: {
        ...(prev.gameplay && prev.gameplay.movement ? prev.gameplay.movement : {}),
        ...(deps.patch || {}),
      },
    },
  }));
}

export function syncSwarmFollowState(deps) {
  const runtimeSwarm = deps.getSwarmRuntimeStateSnapshot();
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      swarm: {
        ...prev.gameplay.swarm,
        followEnabled: runtimeSwarm.followEnabled,
        followTargetType: runtimeSwarm.followTargetType,
        followAgentIndex: runtimeSwarm.followAgentIndex,
        followHawkIndex: runtimeSwarm.followHawkIndex,
      },
    },
  }));
}

export function syncSwarmRuntimeState(deps) {
  const runtimeSwarm = deps.getSwarmRuntimeStateSnapshot();
  deps.store.update((prev) => {
    const prevSwarm = prev.gameplay && prev.gameplay.swarm ? prev.gameplay.swarm : {};
    if (
      Boolean(prevSwarm.enabled) === runtimeSwarm.enabled
      && Math.max(0, Math.round(Number(prevSwarm.count) || 0)) === runtimeSwarm.count
      && Boolean(prevSwarm.followEnabled) === runtimeSwarm.followEnabled
      && String(prevSwarm.followTargetType || "agent") === runtimeSwarm.followTargetType
      && deps.normalizeStoredFollowIndex(prevSwarm.followAgentIndex) === runtimeSwarm.followAgentIndex
      && deps.normalizeStoredFollowIndex(prevSwarm.followHawkIndex) === runtimeSwarm.followHawkIndex
    ) {
      return prev;
    }
    return {
      ...prev,
      gameplay: {
        ...prev.gameplay,
        swarm: {
          ...prevSwarm,
          ...runtimeSwarm,
        },
      },
    };
  });
}

export function syncSwarmState(deps) {
  const nextSwarm = deps.getSwarmStoreSnapshot();
  deps.store.update((prev) => {
    const prevSwarm = prev.gameplay && prev.gameplay.swarm ? prev.gameplay.swarm : {};
    if (!deps.hasSwarmSnapshotChanged(prevSwarm, nextSwarm)) {
      return prev;
    }
    return {
      ...prev,
      gameplay: {
        ...prev.gameplay,
        swarm: {
          ...prevSwarm,
          ...nextSwarm,
        },
      },
    };
  });
}

export function patchSwarmSettingsState(deps) {
  const patch = deps && deps.patch && typeof deps.patch === "object" ? deps.patch : {};
  deps.store.update((prev) => {
    const prevSwarm = prev.gameplay && prev.gameplay.swarm ? prev.gameplay.swarm : {};
    return {
      ...prev,
      gameplay: {
        ...prev.gameplay,
        swarm: {
          ...prevSwarm,
          ...patch,
        },
      },
    };
  });
}
