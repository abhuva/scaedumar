export function createLightingSystem(deps) {
  return {
    update() {
      deps.setLightingState({
        lightingParams: deps.computeLightingParams(),
      });
    },
  };
}
