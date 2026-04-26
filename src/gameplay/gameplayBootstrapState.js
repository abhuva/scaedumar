export function createGameplayBootstrapState() {
  const defaultPlayer = {
    charID: "player",
    pixelX: 120,
    pixelY: 96,
    color: "#ff69b4",
  };

  const playerState = {
    charID: defaultPlayer.charID,
    pixelX: defaultPlayer.pixelX,
    pixelY: defaultPlayer.pixelY,
    color: defaultPlayer.color,
  };

  const movePreviewState = {
    hoverPixel: null,
    pathPixels: [],
  };

  const swarmState = {
    x: new Float32Array(0),
    y: new Float32Array(0),
    z: new Float32Array(0),
    vx: new Float32Array(0),
    vy: new Float32Array(0),
    vz: new Float32Array(0),
    speedScale: new Float32Array(0),
    steerScale: new Float32Array(0),
    isResting: new Uint8Array(0),
    restTicksLeft: new Uint16Array(0),
    ax: new Float32Array(0),
    ay: new Float32Array(0),
    az: new Float32Array(0),
    count: 0,
    lastUpdateMs: null,
    stepSec: 1 / 60,
    stepCount: 0,
    hawkKillIntervalSum: 0,
    hawkKillCount: 0,
    breedingActive: false,
    hawks: [],
  };

  const swarmRenderState = {
    prevX: new Float32Array(0),
    prevY: new Float32Array(0),
    prevZ: new Float32Array(0),
    prevHawkX: new Float32Array(0),
    prevHawkY: new Float32Array(0),
    prevHawkZ: new Float32Array(0),
    alpha: 1,
    hasPrev: false,
  };

  const swarmCursorState = {
    x: 0,
    y: 0,
    active: false,
  };

  const swarmFollowState = {
    enabled: false,
    targetType: "agent",
    agentIndex: -1,
    hawkIndex: -1,
    speedNormFiltered: null,
  };

  function createScratch() {
    return { x: 0, y: 0, z: 0 };
  }

  const swarmFollowAgentScratch = createScratch();
  const swarmFollowHawkScratch = createScratch();
  const swarmOverlayAgentScratch = createScratch();
  const swarmOverlayHawkScratch = createScratch();
  const swarmGizmoHawkScratch = createScratch();
  const swarmLitAgentScratch = createScratch();
  const swarmLitHawkScratch = createScratch();

  function invalidateSwarmInterpolation() {
    swarmRenderState.hasPrev = false;
    swarmRenderState.alpha = 1;
  }

  return {
    defaultPlayer,
    playerState,
    movePreviewState,
    swarmState,
    swarmRenderState,
    swarmCursorState,
    swarmFollowState,
    swarmFollowAgentScratch,
    swarmFollowHawkScratch,
    swarmOverlayAgentScratch,
    swarmOverlayHawkScratch,
    swarmGizmoHawkScratch,
    swarmLitAgentScratch,
    swarmLitHawkScratch,
    invalidateSwarmInterpolation,
  };
}
