export function createWaterFxSystem(deps) {
  return {
    update() {
      const flowDeg = deps.clamp(Number(deps.waterFlowDirectionInput.value), 0, 360);
      const flowRad = (flowDeg * Math.PI) / 180;
      deps.setWaterFxState({
        useWaterFx: deps.waterFxToggle.checked,
        waterFlowDownhill: deps.waterFlowDownhillToggle.checked,
        waterFlowInvertDownhill: deps.waterFlowInvertDownhillToggle.checked,
        waterFlowDebug: deps.waterFlowDebugToggle.checked,
        waterFlowDirX: Math.cos(flowRad),
        waterFlowDirY: Math.sin(flowRad),
        waterLocalFlowMix: deps.clamp(Number(deps.waterLocalFlowMixInput.value), 0, 1),
        waterDownhillBoost: deps.clamp(Number(deps.waterDownhillBoostInput.value), 0, 4),
        waterFlowStrength: deps.clamp(Number(deps.waterFlowStrengthInput.value), 0, 0.15),
        waterFlowSpeed: deps.clamp(Number(deps.waterFlowSpeedInput.value), 0, 2.5),
        waterFlowScale: deps.clamp(Number(deps.waterFlowScaleInput.value), 0.5, 14),
        waterShimmerStrength: deps.clamp(Number(deps.waterShimmerStrengthInput.value), 0, 0.2),
        waterGlintStrength: deps.clamp(Number(deps.waterGlintStrengthInput.value), 0, 1.5),
        waterGlintSharpness: deps.clamp(Number(deps.waterGlintSharpnessInput.value), 0, 1),
        waterShoreFoamStrength: deps.clamp(Number(deps.waterShoreFoamStrengthInput.value), 0, 0.5),
        waterShoreWidth: deps.clamp(Number(deps.waterShoreWidthInput.value), 0.4, 6),
        waterReflectivity: deps.clamp(Number(deps.waterReflectivityInput.value), 0, 1),
        waterTintColor: deps.hexToRgb01(deps.waterTintColorInput.value),
        waterTintStrength: deps.clamp(Number(deps.waterTintStrengthInput.value), 0, 1),
      });
    },
  };
}
