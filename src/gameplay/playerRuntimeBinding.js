import { createPlayerStateRuntimeBinding } from "./playerStateRuntimeBinding.js";
import { createNpcPersistence } from "./npcPersistence.js";

export function createPlayerRuntimeBinding(deps) {
  const playerStateRuntimeBinding = createPlayerStateRuntimeBinding({
    playerState: deps.playerState,
    clamp: deps.clamp,
    splatSize: deps.splatSize,
    setPlayerSnapshot: ({ pixelX, pixelY }) => {
      deps.store.update((prev) => ({
        ...prev,
        gameplay: {
          ...prev.gameplay,
          player: {
            ...prev.gameplay.player,
            pixelX,
            pixelY,
          },
        },
      }));
    },
  });

  function syncPlayerStateToStore() {
    deps.store.update((prev) => ({
      ...prev,
      gameplay: {
        ...prev.gameplay,
        player: {
          ...prev.gameplay.player,
          charID: deps.playerState.charID,
          pixelX: deps.playerState.pixelX,
          pixelY: deps.playerState.pixelY,
          color: deps.playerState.color,
        },
      },
    }));
  }

  const npcPersistence = createNpcPersistence({
    playerState: deps.playerState,
    defaultPlayer: deps.defaultPlayer,
    clamp: deps.clamp,
    splatSize: deps.splatSize,
    setPlayerPosition: (pixelX, pixelY) => playerStateRuntimeBinding.setPlayerPosition(pixelX, pixelY),
    syncPlayerStateToStore,
  });

  return {
    syncPlayerStateToStore,
    setPlayerPosition: (pixelX, pixelY) => playerStateRuntimeBinding.setPlayerPosition(pixelX, pixelY),
    serializeNpcState: () => npcPersistence.serializeNpcState(),
    parseNpcPlayer: (rawData) => npcPersistence.parseNpcPlayer(rawData),
    applyLoadedNpc: (rawData) => npcPersistence.applyLoadedNpc(rawData),
  };
}
