export function createLightingSystem(deps) {
  return {
    update() {
      const value = {
        lightingParams: deps.computeLightingParams(),
      };
      deps.setLightingState(value);
      if (typeof deps.updateStoreLighting === "function") {
        deps.updateStoreLighting({
          hasFrameLighting: Boolean(value.lightingParams),
          lightingParams: value.lightingParams,
        });
      }
    },
  };
}
