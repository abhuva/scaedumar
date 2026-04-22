export function createWaterFxSystem(deps) {
  function finiteNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return {
    update() {
      const flowDeg = deps.clamp(finiteNumber(deps.waterFlowDirectionInput.value, 135), 0, 360);
      const flowRad = (flowDeg * Math.PI) / 180;
      const value = {
        useWaterFx: deps.waterFxToggle.checked,
        waterFlowDownhill: deps.waterFlowDownhillToggle.checked,
        waterFlowInvertDownhill: deps.waterFlowInvertDownhillToggle.checked,
        waterFlowDebug: deps.waterFlowDebugToggle.checked,
        waterFlowDirX: Math.cos(flowRad),
        waterFlowDirY: Math.sin(flowRad),
        waterLocalFlowMix: deps.clamp(finiteNumber(deps.waterLocalFlowMixInput.value, 0.35), 0, 1),
        waterDownhillBoost: deps.clamp(finiteNumber(deps.waterDownhillBoostInput.value, 1), 0, 4),
        waterFlowStrength: deps.clamp(finiteNumber(deps.waterFlowStrengthInput.value, 0.045), 0, 0.15),
        waterFlowSpeed: deps.clamp(finiteNumber(deps.waterFlowSpeedInput.value, 0.75), 0, 2.5),
        waterFlowScale: deps.clamp(finiteNumber(deps.waterFlowScaleInput.value, 4.2), 0.5, 14),
        waterShimmerStrength: deps.clamp(finiteNumber(deps.waterShimmerStrengthInput.value, 0.05), 0, 0.2),
        waterGlintStrength: deps.clamp(finiteNumber(deps.waterGlintStrengthInput.value, 0.55), 0, 1.5),
        waterGlintSharpness: deps.clamp(finiteNumber(deps.waterGlintSharpnessInput.value, 0.55), 0, 1),
        waterShoreFoamStrength: deps.clamp(finiteNumber(deps.waterShoreFoamStrengthInput.value, 0.14), 0, 0.5),
        waterShoreWidth: deps.clamp(finiteNumber(deps.waterShoreWidthInput.value, 2.2), 0.4, 6),
        waterReflectivity: deps.clamp(finiteNumber(deps.waterReflectivityInput.value, 0.33), 0, 1),
        waterTintColor: deps.hexToRgb01(deps.waterTintColorInput.value),
        waterTintStrength: deps.clamp(finiteNumber(deps.waterTintStrengthInput.value, 0.2), 0, 1),
      };
      deps.setWaterFxState(value);
      if (typeof deps.updateStoreWaterFx === "function") {
        deps.updateStoreWaterFx(value);
      }
    },
  };
}
