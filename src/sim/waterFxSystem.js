export function createWaterFxSystem(deps) {
  function normalizeFlowSource(value, fallback = "height") {
    return value === "fixed" || value === "height" || value === "image" ? value : fallback;
  }

  function normalizeChannelPair(value) {
    return value === "gb" || value === "rb" ? value : "rg";
  }

  function normalizeRenderMode(value) {
    return value === "procedural" ? "procedural" : "streamlines";
  }

  function finiteNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return {
    update(_, state) {
      const knobs = state && state.simulation && state.simulation.knobs ? state.simulation.knobs : {};
      const input = knobs && knobs.waterFx ? knobs.waterFx : {};
      const flowDeg = deps.clamp(finiteNumber(input.waterFlowDirectionDeg, 135), 0, 360);
      const flowRad = (flowDeg * Math.PI) / 180;
      const flowSource = normalizeFlowSource(
        input.waterFlowSource,
        input.waterFlowDownhill === false ? "fixed" : "height",
      );
      const value = {
        useWaterFx: Boolean(input.useWaterFx),
        waterFlowSource: flowSource,
        waterFlowRenderMode: normalizeRenderMode(input.waterFlowRenderMode),
        waterFlowDownhill: flowSource !== "fixed",
        waterFlowChannelPair: normalizeChannelPair(input.waterFlowChannelPair),
        waterFlowFlipX: Boolean(input.waterFlowFlipX),
        waterFlowFlipY: Boolean(input.waterFlowFlipY),
        waterFlowUseMagnitude: Boolean(input.waterFlowUseMagnitude),
        waterFlowInvertDownhill: Boolean(input.waterFlowInvertDownhill),
        waterFlowDebug: Boolean(input.waterFlowDebug),
        waterFlowDirectionDeg: flowDeg,
        waterFlowDirX: Math.cos(flowRad),
        waterFlowDirY: Math.sin(flowRad),
        waterLocalFlowMix: deps.clamp(finiteNumber(input.waterLocalFlowMix, 0.35), 0, 1),
        waterDownhillBoost: deps.clamp(finiteNumber(input.waterDownhillBoost, 1), 0, 4),
        waterFlowStrength: deps.clamp(finiteNumber(input.waterFlowStrength, 0.045), 0, 0.15),
        waterFlowMapStrength: deps.clamp(finiteNumber(input.waterFlowMapStrength, 1), 0, 4),
        waterFlowVisibility: deps.clamp(finiteNumber(input.waterFlowVisibility, 1), 0, 4),
        waterStreamlineDensity: deps.clamp(finiteNumber(input.waterStreamlineDensity, 32), 4, 80),
        waterStreamlineSharpness: deps.clamp(finiteNumber(input.waterStreamlineSharpness, 0.55), 0, 1),
        waterFlowSpeed: deps.clamp(finiteNumber(input.waterFlowSpeed, 0.75), 0, 2.5),
        waterFlowScale: deps.clamp(finiteNumber(input.waterFlowScale, 4.2), 0.5, 14),
        waterShimmerStrength: deps.clamp(finiteNumber(input.waterShimmerStrength, 0.05), 0, 0.2),
        waterGlintStrength: deps.clamp(finiteNumber(input.waterGlintStrength, 0.55), 0, 1.5),
        waterGlintSharpness: deps.clamp(finiteNumber(input.waterGlintSharpness, 0.55), 0, 1),
        waterShoreFoamStrength: deps.clamp(finiteNumber(input.waterShoreFoamStrength, 0.14), 0, 0.5),
        waterShoreWidth: deps.clamp(finiteNumber(input.waterShoreWidth, 2.2), 0.4, 6),
        waterReflectivity: deps.clamp(finiteNumber(input.waterReflectivity, 0.33), 0, 1),
        waterBaseColor: Array.isArray(input.waterBaseColor) ? input.waterBaseColor : deps.hexToRgb01(input.waterBaseColor || "#245f73"),
        waterOpacity: deps.clamp(finiteNumber(input.waterOpacity, 0.25), 0, 1),
        waterTintColor: Array.isArray(input.waterTintColor) ? input.waterTintColor : deps.hexToRgb01(input.waterTintColor),
        waterTintStrength: deps.clamp(finiteNumber(input.waterTintStrength, 0.2), 0, 1),
      };
      deps.setWaterFxState(value);
      if (typeof deps.updateStoreWaterFx === "function") {
        deps.updateStoreWaterFx(value);
      }
    },
  };
}
