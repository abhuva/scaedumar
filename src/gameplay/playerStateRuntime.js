export function createPlayerStateRuntime(deps) {
  function setPlayerPosition(pixelX, pixelY) {
    const x = Number(pixelX);
    const y = Number(pixelY);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    deps.playerState.pixelX = deps.clamp(Math.round(x), 0, Math.max(0, deps.splatSize.width - 1));
    deps.playerState.pixelY = deps.clamp(Math.round(y), 0, Math.max(0, deps.splatSize.height - 1));
    if (typeof deps.setPlayerSnapshot === "function") {
      deps.setPlayerSnapshot({
        pixelX: deps.playerState.pixelX,
        pixelY: deps.playerState.pixelY,
      });
    }
  }

  return {
    setPlayerPosition,
  };
}
