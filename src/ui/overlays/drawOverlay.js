import { drawResourceContourOverlay } from "./resourceContourOverlay.js";
import { drawDiscoveryMaskOverlay } from "./discoveryMaskOverlay.js";
import { drawRoutePlanningOverlay } from "./routePlanningOverlay.js";

export function createOverlayDrawer(deps) {
  return function drawOverlay() {
    deps.overlayCtx.clearRect(0, 0, deps.overlayCanvas.width, deps.overlayCanvas.height);
    const worldPerMapPixel = deps.getMapAspect() / deps.splatSize.width;
    const travelPlanning = deps.getTravelPlanningSnapshot();

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

    const drawMapCircle = (pixelX, pixelY, radiusMapPx, color, lineWidth = 2) => {
      const radius = Math.max(0, Number(radiusMapPx) || 0);
      if (radius <= 0) return;
      const centerWorld = deps.mapPixelToWorld(pixelX, pixelY);
      const centerScreen = deps.worldToScreen(centerWorld);
      const edgeWorld = { x: centerWorld.x + worldPerMapPixel * radius, y: centerWorld.y };
      const edgeScreen = deps.worldToScreen(edgeWorld);
      const screenRadius = Math.max(1, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
      deps.overlayCtx.beginPath();
      deps.overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
      deps.overlayCtx.strokeStyle = color;
      deps.overlayCtx.lineWidth = lineWidth;
      deps.overlayCtx.stroke();
    };

    if (deps.getInteractionMode() === "pathfinding") {
      const pathfinding = typeof deps.getPathfindingStateSnapshot === "function"
        ? deps.getPathfindingStateSnapshot()
        : null;
      const origin = travelPlanning.rangeOriginPixel || deps.playerState;
      const radius = Math.max(0, Number(travelPlanning.rangeRadius) || (Number(pathfinding && pathfinding.range) || 0) / 2);
      drawMapCircle(origin.x ?? origin.pixelX, origin.y ?? origin.pixelY, radius, "rgba(180, 126, 71, 0.85)", 2);
    }

    if (travelPlanning.committedRangeOriginPixel) {
      drawMapCircle(
        travelPlanning.committedRangeOriginPixel.x,
        travelPlanning.committedRangeOriginPixel.y,
        travelPlanning.committedRangeRadius,
        "rgba(180, 126, 71, 0.62)",
        2,
      );
    }

    if (Array.isArray(travelPlanning.committedPathPixels) && travelPlanning.committedPathPixels.length > 0) {
      for (const node of travelPlanning.committedPathPixels) {
        drawMapDot(node.x, node.y, "rgba(166, 179, 184, 0.58)");
      }
    }

    if (deps.getInteractionMode() === "pathfinding" && Array.isArray(travelPlanning.pathPixels) && travelPlanning.pathPixels.length > 0) {
      for (const node of travelPlanning.pathPixels) {
        drawMapDot(node.x, node.y, "rgba(112, 214, 255, 0.9)");
      }
    }

    const activitySnapshot = typeof deps.getActivitySnapshot === "function" ? deps.getActivitySnapshot() : null;
    const inspectSnapshot = typeof deps.getInspectSnapshot === "function" ? deps.getInspectSnapshot() : null;
    const inspectBlocked = activitySnapshot
      && activitySnapshot.active
      && (activitySnapshot.type === "rest" || activitySnapshot.type === "scout");

    const routePlanning = typeof deps.getRoutePlanningSnapshot === "function"
      ? deps.getRoutePlanningSnapshot()
      : null;
    const routeOverlaySnapshot = routePlanning
      ? {
          ...routePlanning,
          showFinalOverlay: routePlanning.active === true
            || (routePlanning.showCommittedOverlay !== false && inspectSnapshot && inspectSnapshot.enabled && !inspectBlocked),
        }
      : null;
    const discoveryMaskOverlay = typeof deps.getDiscoveryMaskOverlaySnapshot === "function"
      ? deps.getDiscoveryMaskOverlaySnapshot()
      : null;
    if (discoveryMaskOverlay) {
      drawDiscoveryMaskOverlay({
        ctx: deps.overlayCtx,
        snapshot: discoveryMaskOverlay,
        mapPixelToWorld: deps.mapPixelToWorld,
        worldToScreen: deps.worldToScreen,
      });
    }

    if (inspectSnapshot && inspectSnapshot.enabled && !inspectBlocked) {
      const contour = typeof deps.getResourceContourOverlaySnapshot === "function"
        ? deps.getResourceContourOverlaySnapshot()
        : null;
      if (contour) {
        drawResourceContourOverlay({
          ctx: deps.overlayCtx,
          imageData: contour.imageData,
          search: contour.search,
          contourVersion: contour.contourVersion,
          stockVersion: contour.stockVersion,
          sampleKnowledge: contour.sampleKnowledge,
          sampleStockFactor: contour.sampleStockFactor,
          mapPixelToWorld: deps.mapPixelToWorld,
          worldToScreen: deps.worldToScreen,
        });
      }
    }

    if (routeOverlaySnapshot) {
      drawRoutePlanningOverlay({
        ctx: deps.overlayCtx,
        snapshot: routeOverlaySnapshot,
        drawFinalTexture: true,
        drawPlanning: true,
        mapPixelToWorld: deps.mapPixelToWorld,
        worldToScreen: deps.worldToScreen,
        getMapAspect: deps.getMapAspect,
        splatSize: deps.splatSize,
      });
    }

    if (activitySnapshot && activitySnapshot.active && (activitySnapshot.type === "gathering" || activitySnapshot.resourceId)) {
      const radius = Math.max(0, Number(activitySnapshot.radius) || 0);
      drawMapCircle(activitySnapshot.originX, activitySnapshot.originY, radius, "rgba(180, 126, 71, 0.85)", 2);
    }

    if (activitySnapshot && activitySnapshot.active && activitySnapshot.type === "scout") {
      const radius = Math.max(0, Number(activitySnapshot.scoutScanRadius) || 0);
      drawMapCircle(deps.playerState.pixelX, deps.playerState.pixelY, radius, "rgba(180, 126, 71, 0.85)", 2);
    }

    const bundles = typeof deps.getInventoryBundles === "function" ? deps.getInventoryBundles() : [];
    for (const bundle of bundles) {
      const centerWorld = deps.mapPixelToWorld(bundle.pixelX, bundle.pixelY);
      const centerScreen = deps.worldToScreen(centerWorld);
      const edgeWorld = { x: centerWorld.x + worldPerMapPixel * 1.2, y: centerWorld.y };
      const edgeScreen = deps.worldToScreen(edgeWorld);
      const screenRadius = Math.max(4, Math.hypot(edgeScreen.x - centerScreen.x, edgeScreen.y - centerScreen.y));
      deps.overlayCtx.beginPath();
      deps.overlayCtx.arc(centerScreen.x, centerScreen.y, screenRadius, 0, Math.PI * 2);
      deps.overlayCtx.fillStyle = "rgba(168, 111, 49, 0.82)";
      deps.overlayCtx.fill();
      deps.overlayCtx.strokeStyle = "rgba(255, 221, 150, 0.92)";
      deps.overlayCtx.lineWidth = 1.5;
      deps.overlayCtx.stroke();
      deps.overlayCtx.fillStyle = "rgba(20, 14, 8, 0.95)";
      deps.overlayCtx.font = "700 10px sans-serif";
      deps.overlayCtx.textAlign = "center";
      deps.overlayCtx.textBaseline = "middle";
      deps.overlayCtx.fillText("B", centerScreen.x, centerScreen.y);
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
