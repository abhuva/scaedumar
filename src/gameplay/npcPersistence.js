export function createNpcPersistence(deps) {
  function serializeNpcState() {
    return {
      version: 1,
      charID: deps.playerState.charID,
      pixelX: deps.playerState.pixelX,
      pixelY: deps.playerState.pixelY,
      color: deps.playerState.color,
    };
  }

  function parseNpcPlayer(rawData) {
    const data = rawData && typeof rawData === "object" ? rawData : {};
    const charID = String(data.charID || deps.defaultPlayer.charID);
    const color = /^#?[0-9a-fA-F]{6}$/.test(String(data.color || ""))
      ? String(data.color).replace(/^([^#])/, "#$1")
      : deps.defaultPlayer.color;
    const pixelX = Number.isFinite(Number(data.pixelX)) ? Number(data.pixelX) : deps.defaultPlayer.pixelX;
    const pixelY = Number.isFinite(Number(data.pixelY)) ? Number(data.pixelY) : deps.defaultPlayer.pixelY;
    return {
      charID,
      color,
      pixelX: deps.clamp(Math.round(pixelX), 0, Math.max(0, deps.splatSize.width - 1)),
      pixelY: deps.clamp(Math.round(pixelY), 0, Math.max(0, deps.splatSize.height - 1)),
    };
  }

  function applyLoadedNpc(rawData) {
    const player = parseNpcPlayer(rawData);
    deps.playerState.charID = player.charID;
    deps.playerState.color = player.color;
    deps.setPlayerPosition(player.pixelX, player.pixelY);
    deps.syncPlayerStateToStore();
  }

  return {
    serializeNpcState,
    parseNpcPlayer,
    applyLoadedNpc,
  };
}
