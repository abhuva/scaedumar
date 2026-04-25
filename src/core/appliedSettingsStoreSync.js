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

export function createAppliedSettingsStoreSync(deps) {
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
            cycleHour: Number.isFinite(Number(normalized.cycleHour))
              ? deps.clamp(Number(normalized.cycleHour), 0, 24)
              : prev.ui.cycleHour,
          },
        };
      }
      if (key === "fog") {
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              fog: { ...normalized },
            },
          },
        };
      }
      if (key === "parallax") {
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              parallax: { ...normalized },
            },
          },
        };
      }
      if (key === "clouds") {
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              clouds: { ...normalized },
            },
          },
          systems: {
            ...prev.systems,
            time: {
              ...prev.systems.time,
              routing: {
                ...prev.systems.time.routing,
                clouds: deps.normalizeRoutingMode(normalized.timeRouting, "global"),
              },
            },
          },
        };
      }
      if (key === "waterfx") {
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              waterFx: { ...normalized },
            },
          },
          systems: {
            ...prev.systems,
            time: {
              ...prev.systems.time,
              routing: {
                ...prev.systems.time.routing,
                water: deps.normalizeRoutingMode(normalized.timeRouting, "detached"),
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
