export function createSwarmOverlayRuntime(deps) {
  function drawSwarmUnlitOverlay(settings) {
    const tintAlpha = settings.showTerrainInSwarm ? 0.55 : 0.95;
    const agentPos = deps.swarmOverlayAgentScratch;
    for (let i = 0; i < deps.swarmState.count; i++) {
      deps.writeInterpolatedSwarmAgentPos(i, agentPos);
      const mapX = agentPos.x;
      const mapY = agentPos.y;
      const centerWorld = deps.mapCoordToWorld(mapX, mapY);
      const rightWorld = deps.mapCoordToWorld(mapX + 1, mapY);
      const downWorld = deps.mapCoordToWorld(mapX, mapY + 1);
      const center = deps.worldToScreen(centerWorld);
      const right = deps.worldToScreen(rightWorld);
      const down = deps.worldToScreen(downWorld);
      const texelW = Math.max(0.25, Math.abs(right.x - center.x));
      const texelH = Math.max(0.25, Math.abs(down.y - center.y));
      const z = deps.clamp(agentPos.z / deps.swarmZMax, 0, 1);
      const lum = Math.round((0.28 + z * 0.72) * 255);
      deps.overlayCtx.fillStyle = `rgba(${lum}, ${lum}, ${lum}, ${tintAlpha})`;
      deps.overlayCtx.fillRect(center.x - texelW * 0.5, center.y - texelH * 0.5, texelW, texelH);
    }

    if (settings.useHawk && deps.swarmState.hawks.length > 0) {
      const hawk0 = deps.writeInterpolatedSwarmHawkPos(0, deps.swarmOverlayHawkScratch);
      const hawkCenterWorld = deps.mapCoordToWorld(hawk0.x, hawk0.y);
      const hawkRightWorld = deps.mapCoordToWorld(hawk0.x + 1, hawk0.y);
      const hawkDownWorld = deps.mapCoordToWorld(hawk0.x, hawk0.y + 1);
      const hawkCenter = deps.worldToScreen(hawkCenterWorld);
      const hawkRight = deps.worldToScreen(hawkRightWorld);
      const hawkDown = deps.worldToScreen(hawkDownWorld);
      const w = Math.max(0.25, Math.abs(hawkRight.x - hawkCenter.x));
      const h = Math.max(0.25, Math.abs(hawkDown.y - hawkCenter.y));
      const hawkRgb = deps.hexToRgb01(settings.hawkColor).map((v) => Math.round(deps.clamp(v, 0, 1) * 255));
      const hawkAlpha = settings.showTerrainInSwarm ? 0.85 : 1.0;
      deps.overlayCtx.fillStyle = `rgba(${hawkRgb[0]}, ${hawkRgb[1]}, ${hawkRgb[2]}, ${hawkAlpha})`;
      for (let i = 0; i < deps.swarmState.hawks.length; i++) {
        const hawk = deps.writeInterpolatedSwarmHawkPos(i, deps.swarmOverlayHawkScratch);
        const centerWorld = deps.mapCoordToWorld(hawk.x, hawk.y);
        const center = deps.worldToScreen(centerWorld);
        deps.overlayCtx.fillRect(center.x - w * 0.5, center.y - h * 0.5, w, h);
      }
    }
  }

  function drawSwarmGizmos(settings) {
    const follow = deps.getSwarmFollowSnapshot();
    if (settings.followHawkRangeGizmo && follow.enabled && follow.targetType === "hawk") {
      const followHawkIndex = follow.hawkIndex;
      if (Number.isInteger(followHawkIndex) && followHawkIndex >= 0 && followHawkIndex < deps.swarmState.hawks.length) {
        const hawk = deps.writeInterpolatedSwarmHawkPos(followHawkIndex, deps.swarmGizmoHawkScratch);
        const centerWorld = deps.mapCoordToWorld(hawk.x, hawk.y);
        const edgeWorld = deps.mapCoordToWorld(hawk.x + settings.hawkTargetRange, hawk.y);
        const centerScreen = deps.worldToScreen(centerWorld);
        const edgeScreen = deps.worldToScreen(edgeWorld);
        const radiusScreen = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
        deps.overlayCtx.beginPath();
        deps.overlayCtx.arc(centerScreen.x, centerScreen.y, radiusScreen, 0, Math.PI * 2);
        deps.overlayCtx.lineWidth = 1.5;
        deps.overlayCtx.strokeStyle = "rgba(255, 124, 92, 0.85)";
        deps.overlayCtx.stroke();
      }
    }

    if (deps.swarmCursorState.active && settings.cursorMode !== "none") {
      const centerWorld = deps.mapCoordToWorld(deps.swarmCursorState.x, deps.swarmCursorState.y);
      const edgeWorld = deps.mapCoordToWorld(deps.swarmCursorState.x + settings.cursorRadius, deps.swarmCursorState.y);
      const centerScreen = deps.worldToScreen(centerWorld);
      const edgeScreen = deps.worldToScreen(edgeWorld);
      const radiusScreen = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
      deps.overlayCtx.beginPath();
      deps.overlayCtx.arc(centerScreen.x, centerScreen.y, radiusScreen, 0, Math.PI * 2);
      deps.overlayCtx.lineWidth = 1.5;
      deps.overlayCtx.strokeStyle = settings.cursorMode === "attract" ? "rgba(110, 255, 170, 0.75)" : "rgba(255, 128, 128, 0.75)";
      deps.overlayCtx.stroke();
    }
  }

  return {
    drawSwarmUnlitOverlay,
    drawSwarmGizmos,
  };
}
