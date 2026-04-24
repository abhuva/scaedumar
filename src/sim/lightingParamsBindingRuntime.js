import { createLightingParamsRuntime } from "./lightingParamsRuntime.js";

export function createLightingParamsBindingRuntime(deps) {
  const lightingParamsRuntime = createLightingParamsRuntime({
    getSettingsDefaults: deps.getSettingsDefaults,
    defaultLightingSettings: deps.defaultLightingSettings,
    defaultFogSettings: deps.defaultFogSettings,
    sampleSunAtHour: deps.sampleSunAtHour,
    wrapHour: deps.wrapHour,
    clamp: deps.clamp,
    smoothstep: deps.smoothstep,
    lerpVec3: deps.lerpVec3,
    getFogColorManual: deps.getFogColorManual,
    rgbToHex: deps.rgbToHex,
    hexToRgb01: deps.hexToRgb01,
    zoomMin: deps.zoomMin,
    zoomMax: deps.zoomMax,
    cycleState: deps.cycleState,
  });
  return {
    computeLightingParams: (coreState = null) => lightingParamsRuntime.computeLightingParams(coreState),
  };
}
