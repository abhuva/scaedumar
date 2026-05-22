export function createNpcPersistence(deps) {
  function normalizePlayerStats(rawStats) {
    const defaults = deps.defaultPlayer.stats || {};
    const data = rawStats && typeof rawStats === "object" ? rawStats : {};
    const gatherRadius = Number.isFinite(Number(data.gatherRadius))
      ? deps.clamp(Math.round(Number(data.gatherRadius)), 1, 300)
      : Number(defaults.gatherRadius) || 30;
    return {
      ...defaults,
      ...data,
      gatherRadius,
    };
  }

  function serializeNpcState() {
    return {
      version: 1,
      charID: deps.playerState.charID,
      pixelX: deps.playerState.pixelX,
      pixelY: deps.playerState.pixelY,
      color: deps.playerState.color,
      stats: normalizePlayerStats(deps.playerState.stats),
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
      stats: normalizePlayerStats(data.stats),
    };
  }

  function applyLoadedNpc(rawData) {
    const player = parseNpcPlayer(rawData);
    deps.playerState.charID = player.charID;
    deps.playerState.color = player.color;
    deps.playerState.stats = { ...player.stats };
    deps.setPlayerPosition(player.pixelX, player.pixelY);
    deps.syncPlayerStateToStore();
  }

  return {
    serializeNpcState,
    parseNpcPlayer,
    applyLoadedNpc,
  };
}
