export function createLightingSystem(deps) {
  return {
    update(_, state) {
      const value = {
        lightingParams: deps.computeLightingParams(state),
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
