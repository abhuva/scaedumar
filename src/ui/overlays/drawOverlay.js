export function createOverlayDrawer(deps) {
  return function drawOverlay() {
    deps.overlayCtx.clearRect(0, 0, deps.overlayCanvas.width, deps.overlayCanvas.height);
    const worldPerMapPixel = deps.getMapAspect() / deps.splatSize.width;

    if (deps.getInteractionMode() === "lighting") {
      const lightEditDraft = deps.getLightEditDraft();
      for (const light of deps.getPointLights()) {
        const selected = deps.isPointLightSelected(light);
        const displayStrength = selected && lightEditDraft ? lightEditDraft.strength : light.strength;
        const displayColor = selected && lightEditDraft ? lightEditDraft.color : light.color;
        const centerWorld = deps.mapPixelToWorld(light.pixelX, light.pixelY);
        const centerScreen = deps.worldToScreen(centerWorld);
        const edgeWorld = { x: centerWorld.x + worldPerMapPixel * displayStrength, y: centerWorld.y };
        const edgeScreen = deps.worldToScreen(edgeWorld);
        const screenRadius = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
        const rgb = displayColor.map((v) => Math.round(deps.clamp(v, 0, 1) * 255));

        deps.overlayCtx.beginPath();
        deps.overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
        deps.overlayCtx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${selected ? 0.95 : 0.7})`;
        deps.overlayCtx.lineWidth = selected ? 2 : 1;
        deps.overlayCtx.stroke();

        deps.overlayCtx.beginPath();
        deps.overlayCtx.arc(centerScreen.x, centerScreen.y, selected ? 5 : 4, 0, Math.PI * 2);
        deps.overlayCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        deps.overlayCtx.fill();

        if (selected) {
          deps.overlayCtx.beginPath();
          deps.overlayCtx.arc(centerScreen.x, centerScreen.y, 7, 0, Math.PI * 2);
          deps.overlayCtx.strokeStyle = "rgba(255,255,255,0.85)";
          deps.overlayCtx.lineWidth = 1.5;
          deps.overlayCtx.stroke();
        }
      }
    }

    const cursorLight = deps.getCursorLightSnapshot();
    if (cursorLight.enabled && deps.cursorLightState.active && cursorLight.showGizmo) {
      const cursorPixelX = deps.clamp(Math.floor(deps.cursorLightState.uvX * deps.splatSize.width), 0, deps.splatSize.width - 1);
      const cursorPixelY = deps.clamp(Math.floor((1 - deps.cursorLightState.uvY) * deps.splatSize.height), 0, deps.splatSize.height - 1);
      const centerWorld = deps.mapPixelToWorld(cursorPixelX, cursorPixelY);
      const centerScreen = deps.worldToScreen(centerWorld);
      const edgeWorld = { x: centerWorld.x + worldPerMapPixel * deps.cursorLightState.strength, y: centerWorld.y };
      const edgeScreen = deps.worldToScreen(edgeWorld);
      const screenRadius = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
      const rgb = deps.cursorLightState.color.map((v) => Math.round(deps.clamp(v, 0, 1) * 255));

      deps.overlayCtx.beginPath();
      deps.overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
      deps.overlayCtx.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`;
      deps.overlayCtx.lineWidth = 2;
      deps.overlayCtx.stroke();

      deps.overlayCtx.beginPath();
      deps.overlayCtx.arc(centerScreen.x, centerScreen.y, 4.5, 0, Math.PI * 2);
      deps.overlayCtx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      deps.overlayCtx.fill();
    }

    const drawMapDot = (pixelX, pixelY, color, radiusMapPx = 0.5) => {
      const centerWorld = deps.mapPixelToWorld(pixelX, pixelY);
      const centerScreen = deps.worldToScreen(centerWorld);
      const edgeWorld = { x: centerWorld.x + worldPerMapPixel * radiusMapPx, y: centerWorld.y };
      const edgeScreen = deps.worldToScreen(edgeWorld);
      const screenRadius = Math.max(0.001, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
      deps.overlayCtx.beginPath();
      deps.overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
      deps.overlayCtx.fillStyle = color;
      deps.overlayCtx.fill();
    };

    if (deps.getInteractionMode() === "pathfinding" && deps.movePreviewState.pathPixels.length > 0) {
      for (const node of deps.movePreviewState.pathPixels) {
        drawMapDot(node.x, node.y, "rgba(112, 214, 255, 0.9)");
      }
    }

    drawMapDot(deps.playerState.pixelX, deps.playerState.pixelY, deps.playerState.color);
    if (deps.isSwarmEnabled()) {
      const swarmSettings = deps.getSwarmSettings();
      if (!swarmSettings.useLitSwarm) {
        deps.drawSwarmUnlitOverlay(swarmSettings);
      }
      deps.drawSwarmGizmos(swarmSettings);
    }
  };
}
