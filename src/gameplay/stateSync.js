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
  deps.store.update((prev) => ({
    ...prev,
    gameplay: {
      ...prev.gameplay,
      pointLights: {
        ...(prev.gameplay && prev.gameplay.pointLights ? prev.gameplay.pointLights : {}),
        liveUpdate,
      },
    },
  }));
}
