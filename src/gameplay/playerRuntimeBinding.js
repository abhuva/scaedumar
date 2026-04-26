import { createPlayerStateRuntime } from "./playerStateRuntime.js";
import { createNpcPersistence } from "./npcPersistence.js";
import { patchPlayerState } from "./stateSync.js";

export function createPlayerRuntimeBinding(deps) {
  const playerStateRuntime = createPlayerStateRuntime({
    playerState: deps.playerState,
    clamp: deps.clamp,
    splatSize: deps.splatSize,
    setPlayerSnapshot: ({ pixelX, pixelY }) => {
      patchPlayerState({
        store: deps.store,
        patch: { pixelX, pixelY },
      });
    },
  });

  function syncPlayerStateToStore() {
    patchPlayerState({
      store: deps.store,
      patch: {
        charID: deps.playerState.charID,
        pixelX: deps.playerState.pixelX,
        pixelY: deps.playerState.pixelY,
        color: deps.playerState.color,
      },
    });
  }

  const npcPersistence = createNpcPersistence({
    playerState: deps.playerState,
    defaultPlayer: deps.defaultPlayer,
    clamp: deps.clamp,
    splatSize: deps.splatSize,
    setPlayerPosition: (pixelX, pixelY) => playerStateRuntime.setPlayerPosition(pixelX, pixelY),
    syncPlayerStateToStore,
  });

  return {
    syncPlayerStateToStore,
    setPlayerPosition: (pixelX, pixelY) => playerStateRuntime.setPlayerPosition(pixelX, pixelY),
    serializeNpcState: () => npcPersistence.serializeNpcState(),
    parseNpcPlayer: (rawData) => npcPersistence.parseNpcPlayer(rawData),
    applyLoadedNpc: (rawData) => npcPersistence.applyLoadedNpc(rawData),
  };
}
