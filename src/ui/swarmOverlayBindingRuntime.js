import { createSwarmOverlayRuntime } from "./swarmOverlayRuntime.js";

export function createSwarmOverlayBindingRuntime(deps) {
  const swarmOverlayRuntime = createSwarmOverlayRuntime({
    swarmState: deps.swarmState,
    swarmOverlayAgentScratch: deps.swarmOverlayAgentScratch,
    swarmOverlayHawkScratch: deps.swarmOverlayHawkScratch,
    swarmGizmoHawkScratch: deps.swarmGizmoHawkScratch,
    swarmCursorState: deps.swarmCursorState,
    getSwarmFollowSnapshot: deps.getSwarmFollowSnapshot,
    writeInterpolatedSwarmAgentPos: deps.writeInterpolatedSwarmAgentPos,
    writeInterpolatedSwarmHawkPos: deps.writeInterpolatedSwarmHawkPos,
    mapCoordToWorld: deps.mapCoordToWorld,
    worldToScreen: deps.worldToScreen,
    overlayCtx: deps.overlayCtx,
    hexToRgb01: deps.hexToRgb01,
    clamp: deps.clamp,
    swarmZMax: deps.swarmZMax,
  });
  return {
    drawSwarmUnlitOverlay: (settings) => swarmOverlayRuntime.drawSwarmUnlitOverlay(settings),
    drawSwarmGizmos: (settings) => swarmOverlayRuntime.drawSwarmGizmos(settings),
  };
}
