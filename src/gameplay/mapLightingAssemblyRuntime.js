import { createPointLightRuntime } from "./pointLightRuntime.js";
import { createMapLifecycleRuntime } from "./mapLifecycleRuntime.js";

export function createMapLightingAssemblyRuntime(deps) {
  const pointLightRuntime = createPointLightRuntime(deps.pointLightSetup);
  const mapLifecycleRuntime = createMapLifecycleRuntime({
    ...deps.mapLifecycleSetup,
    clearPointLights: () => pointLightRuntime.clearPointLights(),
    applyLoadedPointLights: (...args) => pointLightRuntime.applyLoadedPointLights(...args),
    serializePointLights: () => pointLightRuntime.serializePointLights(),
  });

  return {
    pointLightRuntime,
    mapLifecycleRuntime,
  };
}
