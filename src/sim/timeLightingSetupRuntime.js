import { createLightingParamsRuntime } from "./lightingParamsRuntime.js";
import { createTimeUiRuntime } from "../ui/timeUiRuntime.js";

export function createTimeLightingSetupRuntime(deps) {
  function normalizeHour(value) {
    return deps.clamp(Number(value), 0, 24);
  }

  function getCycleHour() {
    if (typeof deps.getCycleHour === "function") {
      return normalizeHour(deps.getCycleHour());
    }
    return normalizeHour(deps.initialHour);
  }

  function setCycleHour(value) {
    const nextHour = normalizeHour(value);
    if (typeof deps.setCycleHour === "function") {
      deps.setCycleHour(nextHour);
    }
  }

  const cycleState = {
    get hour() {
      return getCycleHour();
    },
    set hour(value) {
      setCycleHour(value);
    },
  };

  let lightingParamsRuntime = null;
  function getLightingParamsRuntime() {
    if (lightingParamsRuntime) {
      return lightingParamsRuntime;
    }
    lightingParamsRuntime = createLightingParamsRuntime({
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
      cycleState,
    });
    return lightingParamsRuntime;
  }

  let timeUiRuntime = null;
  function getTimeUiRuntime() {
    if (timeUiRuntime) {
      return timeUiRuntime;
    }
    timeUiRuntime = createTimeUiRuntime({
      cycleHourInput: deps.cycleHourInput,
      cycleHourValue: deps.cycleHourValue,
      cycleState,
      clamp: deps.clamp,
      formatHour: deps.formatHour,
    });
    return timeUiRuntime;
  }

  return {
    cycleState,
    getLightingParamsRuntime,
    getTimeUiRuntime,
    computeLightingParams: (coreState = null) => getLightingParamsRuntime().computeLightingParams(coreState),
    setCycleHourSliderFromState: () => getTimeUiRuntime().setCycleHourSliderFromState(),
    updateCycleHourLabel: () => getTimeUiRuntime().updateCycleHourLabel(),
  };
}
