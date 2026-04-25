export function createWaterFxSystem(deps) {
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
      const value = {
        useWaterFx: Boolean(input.useWaterFx),
        waterFlowDownhill: Boolean(input.waterFlowDownhill),
        waterFlowInvertDownhill: Boolean(input.waterFlowInvertDownhill),
        waterFlowDebug: Boolean(input.waterFlowDebug),
        waterFlowDirectionDeg: flowDeg,
        waterFlowDirX: Math.cos(flowRad),
        waterFlowDirY: Math.sin(flowRad),
        waterLocalFlowMix: deps.clamp(finiteNumber(input.waterLocalFlowMix, 0.35), 0, 1),
        waterDownhillBoost: deps.clamp(finiteNumber(input.waterDownhillBoost, 1), 0, 4),
        waterFlowStrength: deps.clamp(finiteNumber(input.waterFlowStrength, 0.045), 0, 0.15),
        waterFlowSpeed: deps.clamp(finiteNumber(input.waterFlowSpeed, 0.75), 0, 2.5),
        waterFlowScale: deps.clamp(finiteNumber(input.waterFlowScale, 4.2), 0.5, 14),
        waterShimmerStrength: deps.clamp(finiteNumber(input.waterShimmerStrength, 0.05), 0, 0.2),
        waterGlintStrength: deps.clamp(finiteNumber(input.waterGlintStrength, 0.55), 0, 1.5),
        waterGlintSharpness: deps.clamp(finiteNumber(input.waterGlintSharpness, 0.55), 0, 1),
        waterShoreFoamStrength: deps.clamp(finiteNumber(input.waterShoreFoamStrength, 0.14), 0, 0.5),
        waterShoreWidth: deps.clamp(finiteNumber(input.waterShoreWidth, 2.2), 0.4, 6),
        waterReflectivity: deps.clamp(finiteNumber(input.waterReflectivity, 0.33), 0, 1),
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
