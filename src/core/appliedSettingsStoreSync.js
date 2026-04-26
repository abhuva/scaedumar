import { DEFAULT_CURSOR_LIGHT_COLOR_HEX } from "./state.js";

const PERSISTED_SWARM_KEYS = [
  "useAgentSwarm",
  "useLitSwarm",
  "followZoomBySpeed",
  "followZoomIn",
  "followZoomOut",
  "followHawkRangeGizmo",
  "followAgentSpeedSmoothing",
  "followAgentZoomSmoothing",
  "showStatsPanel",
  "showTerrainInSwarm",
  "backgroundColor",
  "agentCount",
  "simulationSpeed",
  "maxSpeed",
  "maxSteering",
  "variationStrengthPct",
  "neighborRadius",
  "minHeight",
  "maxHeight",
  "separationRadius",
  "alignmentWeight",
  "cohesionWeight",
  "separationWeight",
  "wanderWeight",
  "restChancePct",
  "restTicks",
  "breedingThreshold",
  "breedingSpawnChance",
  "cursorMode",
  "cursorStrength",
  "cursorRadius",
  "useHawk",
  "hawkCount",
  "hawkColor",
  "hawkSpeed",
  "hawkSteering",
  "hawkTargetRange",
];

function pickSwarmPersistedSettings(input) {
  const source = input && typeof input === "object" ? input : {};
  const picked = {};
  for (const key of PERSISTED_SWARM_KEYS) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      picked[key] = source[key];
    }
  }
  return picked;
}

function finiteOr(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function createAppliedSettingsStoreSync(deps) {
  function clampRound(value, min, max) {
    return Math.round(deps.clamp(Number(value), min, max));
  }

  function normalizeHexColor(value, fallback) {
    if (typeof value === "string" && /^#?[0-9a-fA-F]{6}$/.test(value)) {
      return value.startsWith("#") ? value : `#${value}`;
    }
    return fallback;
  }

  function normalizeAppliedSettings(key, rawData, fallbackDefaults) {
    const defaults = deps.getSettingsDefaults(key, fallbackDefaults);
    const input = rawData && typeof rawData === "object" ? rawData : {};
    return {
      ...defaults,
      ...input,
    };
  }

  function updateStoreFromAppliedSettings(key, normalized) {
    deps.runtimeCore.store.update((prev) => {
      if (key === "lighting") {
        let rawCycleSpeed = Number(normalized.cycleSpeed);
        if (!Number.isFinite(rawCycleSpeed)) {
          rawCycleSpeed = 0;
        }
        const cycleSpeed = deps.clamp(rawCycleSpeed, 0, 1);
        const simTickHours = deps.normalizeSimTickHours(normalized.simTickHours);
        return {
          ...prev,
          clock: {
            ...prev.clock,
            timeScale: cycleSpeed,
          },
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              lighting: { ...normalized },
            },
          },
          systems: {
            ...prev.systems,
            time: {
              ...prev.systems.time,
              cycleSpeedHoursPerSec: cycleSpeed,
              simTickHours,
            },
          },
          ui: {
            ...prev.ui,
            // Settings sidecar apply writes ui.cycleHour directly for backwards compatibility.
            // Runtime ticking still resolves canonical time through the time systems each frame.
            cycleHour: Number.isFinite(Number(normalized.cycleHour))
              ? deps.clamp(Number(normalized.cycleHour), 0, 24)
              : prev.ui.cycleHour,
          },
        };
      }
      if (key === "fog") {
        const prevFog = prev.simulation?.knobs?.fog || {};
        const nextFog = {
          ...prevFog,
          useFog: Boolean(normalized.useFog),
          fogColor: normalizeHexColor(normalized.fogColor, prevFog.fogColor || "#9fd0ff"),
          fogColorManual: Boolean(normalized.fogColorManual),
          fogMinAlpha: deps.clamp(finiteOr(normalized.fogMinAlpha, finiteOr(prevFog.fogMinAlpha, 0)), 0, 1),
          fogMaxAlpha: deps.clamp(finiteOr(normalized.fogMaxAlpha, finiteOr(prevFog.fogMaxAlpha, 0.65)), 0, 1),
          fogFalloff: deps.clamp(finiteOr(normalized.fogFalloff, finiteOr(prevFog.fogFalloff, 1.35)), 0.2, 4),
          fogStartOffset: deps.clamp(finiteOr(normalized.fogStartOffset, finiteOr(prevFog.fogStartOffset, 0.15)), 0, 1),
        };
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              fog: nextFog,
            },
          },
        };
      }
      if (key === "parallax") {
        const prevParallax = prev.simulation?.knobs?.parallax || {};
        const nextParallax = {
          ...prevParallax,
          useParallax: Boolean(normalized.useParallax),
          parallaxStrength: deps.clamp(
            finiteOr(normalized.parallaxStrength, finiteOr(prevParallax.parallaxStrength, 0.2)),
            0,
            1,
          ),
          parallaxBands: clampRound(
            normalized.parallaxBands ?? prevParallax.parallaxBands ?? 24,
            2,
            256,
          ),
        };
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              parallax: nextParallax,
            },
          },
        };
      }
      if (key === "clouds") {
        const prevClouds = prev.simulation?.knobs?.clouds || {};
        const nextClouds = {
          ...prevClouds,
          useClouds: Boolean(normalized.useClouds),
          cloudCoverage: deps.clamp(finiteOr(normalized.cloudCoverage, finiteOr(prevClouds.cloudCoverage, 0.52)), 0, 1),
          cloudSoftness: deps.clamp(finiteOr(normalized.cloudSoftness, finiteOr(prevClouds.cloudSoftness, 0.15)), 0.01, 0.35),
          cloudOpacity: deps.clamp(finiteOr(normalized.cloudOpacity, finiteOr(prevClouds.cloudOpacity, 0.35)), 0, 1),
          cloudScale: deps.clamp(finiteOr(normalized.cloudScale, finiteOr(prevClouds.cloudScale, 2.4)), 0.5, 8),
          cloudSpeed1: deps.clamp(finiteOr(normalized.cloudSpeed1, finiteOr(prevClouds.cloudSpeed1, 0.018)), -0.3, 0.3),
          cloudSpeed2: deps.clamp(finiteOr(normalized.cloudSpeed2, finiteOr(prevClouds.cloudSpeed2, -0.012)), -0.3, 0.3),
          cloudSunParallax: deps.clamp(finiteOr(normalized.cloudSunParallax, finiteOr(prevClouds.cloudSunParallax, 0.45)), 0, 2),
          cloudUseSunProjection: Boolean(normalized.cloudUseSunProjection),
          timeRouting: deps.normalizeRoutingMode(normalized.timeRouting, "global"),
        };
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              clouds: nextClouds,
            },
          },
          systems: {
            ...prev.systems,
            time: {
              ...prev.systems.time,
              routing: {
                ...prev.systems.time.routing,
                clouds: nextClouds.timeRouting,
              },
            },
          },
        };
      }
      if (key === "waterfx") {
        const prevWater = prev.simulation?.knobs?.waterFx || {};
        const nextWater = {
          ...prevWater,
          useWaterFx: Boolean(normalized.useWaterFx),
          waterFlowDownhill: Boolean(normalized.waterFlowDownhill),
          waterFlowInvertDownhill: Boolean(normalized.waterFlowInvertDownhill),
          waterFlowDebug: Boolean(normalized.waterFlowDebug),
          waterFlowDirectionDeg: clampRound(
            normalized.waterFlowDirectionDeg ?? prevWater.waterFlowDirectionDeg ?? 0,
            0,
            360,
          ),
          waterLocalFlowMix: deps.clamp(finiteOr(normalized.waterLocalFlowMix, finiteOr(prevWater.waterLocalFlowMix, 0.5)), 0, 1),
          waterDownhillBoost: deps.clamp(finiteOr(normalized.waterDownhillBoost, finiteOr(prevWater.waterDownhillBoost, 1)), 0, 4),
          waterFlowRadius1: clampRound(normalized.waterFlowRadius1 ?? prevWater.waterFlowRadius1 ?? 3, 1, 12),
          waterFlowRadius2: clampRound(normalized.waterFlowRadius2 ?? prevWater.waterFlowRadius2 ?? 7, 1, 24),
          waterFlowRadius3: clampRound(normalized.waterFlowRadius3 ?? prevWater.waterFlowRadius3 ?? 13, 1, 40),
          waterFlowWeight1: deps.clamp(finiteOr(normalized.waterFlowWeight1, finiteOr(prevWater.waterFlowWeight1, 0.34)), 0, 1),
          waterFlowWeight2: deps.clamp(finiteOr(normalized.waterFlowWeight2, finiteOr(prevWater.waterFlowWeight2, 0.33)), 0, 1),
          waterFlowWeight3: deps.clamp(finiteOr(normalized.waterFlowWeight3, finiteOr(prevWater.waterFlowWeight3, 0.33)), 0, 1),
          waterFlowStrength: deps.clamp(finiteOr(normalized.waterFlowStrength, finiteOr(prevWater.waterFlowStrength, 0.05)), 0, 0.15),
          waterFlowSpeed: deps.clamp(finiteOr(normalized.waterFlowSpeed, finiteOr(prevWater.waterFlowSpeed, 0.5)), 0, 2.5),
          waterFlowScale: deps.clamp(finiteOr(normalized.waterFlowScale, finiteOr(prevWater.waterFlowScale, 3.2)), 0.5, 14),
          waterShimmerStrength: deps.clamp(finiteOr(normalized.waterShimmerStrength, finiteOr(prevWater.waterShimmerStrength, 0.04)), 0, 0.2),
          waterGlintStrength: deps.clamp(finiteOr(normalized.waterGlintStrength, finiteOr(prevWater.waterGlintStrength, 0.7)), 0, 1.5),
          waterGlintSharpness: deps.clamp(finiteOr(normalized.waterGlintSharpness, finiteOr(prevWater.waterGlintSharpness, 0.65)), 0, 1),
          waterShoreFoamStrength: deps.clamp(finiteOr(normalized.waterShoreFoamStrength, finiteOr(prevWater.waterShoreFoamStrength, 0.15)), 0, 0.5),
          waterShoreWidth: deps.clamp(finiteOr(normalized.waterShoreWidth, finiteOr(prevWater.waterShoreWidth, 2.5)), 0.4, 6),
          waterReflectivity: deps.clamp(finiteOr(normalized.waterReflectivity, finiteOr(prevWater.waterReflectivity, 0.3)), 0, 1),
          waterTintColor: normalizeHexColor(normalized.waterTintColor, prevWater.waterTintColor || "#1f6f8f"),
          waterTintStrength: deps.clamp(finiteOr(normalized.waterTintStrength, finiteOr(prevWater.waterTintStrength, 0.25)), 0, 1),
          timeRouting: deps.normalizeRoutingMode(normalized.timeRouting, "detached"),
        };
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              waterFx: nextWater,
            },
          },
          systems: {
            ...prev.systems,
            time: {
              ...prev.systems.time,
              routing: {
                ...prev.systems.time.routing,
                water: nextWater.timeRouting,
              },
            },
          },
        };
      }
      if (key === "interaction") {
        return {
          ...prev,
          gameplay: {
            ...prev.gameplay,
            pathfinding: {
              ...prev.gameplay.pathfinding,
              range: Math.round(deps.clamp(Number(normalized.pathfindingRange), 30, 300)),
              weightSlope: deps.clamp(Number(normalized.pathWeightSlope), 0, 10),
              weightHeight: deps.clamp(Number(normalized.pathWeightHeight), 0, 10),
              weightWater: deps.clamp(Number(normalized.pathWeightWater), 0, 100),
              slopeCutoff: Math.round(deps.clamp(Number(normalized.pathSlopeCutoff), 0, 90)),
              baseCost: deps.clamp(Number(normalized.pathBaseCost), 0, 2),
            },
            cursorLight: {
              ...(prev.gameplay && prev.gameplay.cursorLight ? prev.gameplay.cursorLight : {}),
              enabled: Boolean(normalized.cursorLightEnabled),
              useTerrainHeight: Boolean(normalized.cursorLightFollowHeight),
              strength: Math.round(deps.clamp(Number(normalized.cursorLightStrength), 1, 200)),
              heightOffset: Math.round(deps.clamp(Number(normalized.cursorLightHeightOffset), 0, 120)),
              color: typeof normalized.cursorLightColor === "string"
                ? normalized.cursorLightColor
                : (prev.gameplay && prev.gameplay.cursorLight
                  ? prev.gameplay.cursorLight.color
                  : DEFAULT_CURSOR_LIGHT_COLOR_HEX),
              showGizmo: Boolean(normalized.cursorLightGizmo),
            },
            pointLights: {
              ...(prev.gameplay && prev.gameplay.pointLights ? prev.gameplay.pointLights : {}),
              liveUpdate: Boolean(normalized.pointLightLiveUpdate),
            },
          },
        };
      }
      if (key === "swarm") {
        const persistedSwarm = pickSwarmPersistedSettings(normalized);
        return {
          ...prev,
          gameplay: {
            ...prev.gameplay,
            swarm: {
              ...prev.gameplay.swarm,
              ...persistedSwarm,
              timeRouting: deps.normalizeRoutingMode(normalized.timeRouting, "global"),
            },
          },
          systems: {
            ...prev.systems,
            time: {
              ...prev.systems.time,
              routing: {
                ...prev.systems.time.routing,
                swarm: deps.normalizeRoutingMode(normalized.timeRouting, "global"),
              },
            },
          },
        };
      }
      return prev;
    });
  }

  return {
    normalizeAppliedSettings,
    updateStoreFromAppliedSettings,
  };
}
