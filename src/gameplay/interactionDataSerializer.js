export function createInteractionDataSerializer(deps) {
  return function serializeInteractionSettings() {
    const interaction = deps.getPathfindingStateSnapshot();
    const cursorLight = deps.getCursorLightSnapshot();
    const pointLightsState = deps.getPointLightsState() || {};
    return {
      version: 1,
      pathfindingRange: interaction.range,
      pathWeightSlope: interaction.weightSlope,
      pathWeightHeight: interaction.weightHeight,
      pathWeightWater: interaction.weightWater,
      pathSlopeCutoff: interaction.slopeCutoff,
      pathBaseCost: interaction.baseCost,
      cursorLightEnabled: Boolean(cursorLight.enabled),
      cursorLightFollowHeight: Boolean(cursorLight.useTerrainHeight),
      cursorLightColor: cursorLight.colorHex,
      cursorLightStrength: Math.round(deps.clamp(Number(cursorLight.strength), 1, 200)),
      cursorLightHeightOffset: Math.round(deps.clamp(Number(cursorLight.heightOffset), 0, 120)),
      cursorLightGizmo: Boolean(cursorLight.showGizmo),
      pointLightLiveUpdate: Boolean(pointLightsState.liveUpdate),
    };
  };
}
