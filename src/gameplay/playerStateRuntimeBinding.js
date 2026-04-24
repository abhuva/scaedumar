import { createPlayerStateRuntime } from "./playerStateRuntime.js";

export function createPlayerStateRuntimeBinding(deps) {
  const playerStateRuntime = createPlayerStateRuntime({
    playerState: deps.playerState,
    clamp: deps.clamp,
    splatSize: deps.splatSize,
  });
  return {
    setPlayerPosition: (pixelX, pixelY) => playerStateRuntime.setPlayerPosition(pixelX, pixelY),
  };
}
