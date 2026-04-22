export function createMovementSystem(deps) {
  return {
    update(_, state) {
      const currentPlayer = state && state.gameplay && state.gameplay.player ? state.gameplay.player : null;
      const nextPlayerCandidate = typeof deps.getPlayerState === "function" ? deps.getPlayerState() : null;
      const nextPlayer = nextPlayerCandidate ?? currentPlayer;
      if (!nextPlayer) return;

      if (typeof deps.setPlayerSnapshot === "function") {
        deps.setPlayerSnapshot(nextPlayer);
      }
      if (deps.entityStore && typeof deps.entityStore.upsert === "function") {
        deps.entityStore.upsert({
          id: "player",
          type: "player",
          pixelX: nextPlayer.pixelX,
          pixelY: nextPlayer.pixelY,
        });
      }
    },
  };
}
