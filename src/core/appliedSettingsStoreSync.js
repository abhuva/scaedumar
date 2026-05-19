import { DEFAULT_CURSOR_LIGHT_COLOR_HEX } from "./state.js";
import { normalizeDetailSettings } from "../gameplay/detailDataSerializer.js";
import { normalizeCameraSettings } from "../gameplay/cameraSettings.js";
import { normalizeSlimeSettings } from "../slime/slimeState.js";

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
      if (key === "detail") {
        const nextDetail = normalizeDetailSettings(
          normalized,
          deps.getSettingsDefaults("detail", {}),
        );
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              detail: nextDetail,
            },
          },
        };
      }
      if (key === "camera") {
        const nextCamera = normalizeCameraSettings(
          normalized,
          deps.getSettingsDefaults("camera", {}),
        );
        const currentZoom = Number(prev.camera?.zoom);
        const nextZoom = deps.clamp(
          Number.isFinite(currentZoom) ? currentZoom : 1,
          nextCamera.zoomMin,
          nextCamera.zoomMax,
        );
        return {
          ...prev,
          camera: {
            ...prev.camera,
            zoom: nextZoom,
          },
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              camera: nextCamera,
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
      if (key === "audio") {
        const prevAudio = prev.simulation?.knobs?.audio || {};
        const prevSynthesis = prevAudio.synthesis && typeof prevAudio.synthesis === "object"
          ? prevAudio.synthesis
          : {};
        const normalizedSynthesis = normalized.synthesis && typeof normalized.synthesis === "object"
          ? normalized.synthesis
          : {};
        const sourceOscillators = Array.isArray(normalizedSynthesis.oscillators)
          ? normalizedSynthesis.oscillators
          : (Array.isArray(prevSynthesis.oscillators) ? prevSynthesis.oscillators : []);
        const oscillators = sourceOscillators.slice(0, 16).map((oscillator, index) => {
          const osc = oscillator && typeof oscillator === "object" ? oscillator : {};
          return {
            id: typeof osc.id === "string" && osc.id ? osc.id : `osc-${index + 1}`,
            enabled: Boolean(osc.enabled ?? true),
            type: ["sine", "square", "sawtooth", "triangle"].includes(osc.type) ? osc.type : "sine",
            frequency: deps.clamp(finiteOr(osc.frequency, 220), 10, 800),
            amplitude: deps.clamp(finiteOr(osc.amplitude, 0.25), 0, 1),
            phase: deps.clamp(finiteOr(osc.phase, 0), -360, 360),
          };
        });
        if (oscillators.length === 0) {
          oscillators.push({
            id: "osc-1",
            enabled: true,
            type: "sine",
            frequency: 220,
            amplitude: 0.35,
            phase: 0,
          });
        }
        const prevSoundscape = prevAudio.soundscape && typeof prevAudio.soundscape === "object"
          ? prevAudio.soundscape
          : {};
        const normalizedSoundscape = normalized.soundscape && typeof normalized.soundscape === "object"
          ? normalized.soundscape
          : {};
        const soundscapeLayersSource = Array.isArray(normalizedSoundscape.layers)
          ? normalizedSoundscape.layers
          : (Array.isArray(prevSoundscape.layers) ? prevSoundscape.layers : []);
        const validScales = ["minorPentatonic", "majorPentatonic", "dorian", "aeolian", "phrygian", "suspendedPentatonic"];
        const validRoots = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        const noiseRoles = ["wind", "rumble", "air"];
        const soundscapeLayers = soundscapeLayersSource.slice(0, 16).map((layer, index) => {
          const item = layer && typeof layer === "object" ? layer : {};
          const role = ["drone", "resonance", "shimmer", "pulse", "call", "wind", "rumble", "air"].includes(item.role) ? item.role : "drone";
          return {
            id: typeof item.id === "string" && item.id ? item.id : `layer-${index + 1}`,
            enabled: Boolean(item.enabled ?? true),
            role,
            source: item.source === "noise" || noiseRoles.includes(role) ? "noise" : "tone",
            type: ["sine", "square", "sawtooth", "triangle"].includes(item.type) ? item.type : "sine",
            noiseType: ["wind", "rumble", "air"].includes(item.noiseType) ? item.noiseType : (noiseRoles.includes(role) ? role : "wind"),
            degree: clampRound(item.degree ?? 0, 0, 6),
            octave: clampRound(item.octave ?? 0, -3, 3),
            detuneCents: clampRound(item.detuneCents ?? 0, -100, 100),
            amplitude: deps.clamp(finiteOr(item.amplitude, 0.2), 0, 1),
            attackSec: deps.clamp(finiteOr(item.attackSec, 2), 0, 20),
            releaseSec: deps.clamp(finiteOr(item.releaseSec, 3), 0, 20),
            ampDrift: deps.clamp(finiteOr(item.ampDrift, 0), 0, 1),
            pitchDriftCents: deps.clamp(finiteOr(item.pitchDriftCents, 0), 0, 50),
            driftCycleSec: deps.clamp(finiteOr(item.driftCycleSec, 20), 2, 120),
            motionMode: ["static", "wander", "call"].includes(item.motionMode) ? item.motionMode : "static",
            changeIntervalSec: deps.clamp(finiteOr(item.changeIntervalSec, 12), 2, 120),
            changeChance: deps.clamp(finiteOr(item.changeChance, 0.35), 0, 1),
            glideSec: deps.clamp(finiteOr(item.glideSec, 2), 0, 20),
            filterFrequency: deps.clamp(finiteOr(item.filterFrequency, 850), 40, 8000),
          };
        });
        if (soundscapeLayers.length === 0) {
          soundscapeLayers.push({
            id: "layer-1",
            enabled: true,
            role: "drone",
            source: "tone",
            type: "triangle",
            noiseType: "wind",
            degree: 0,
            octave: -1,
            detuneCents: 0,
            amplitude: 0.35,
            attackSec: 3,
            releaseSec: 4,
            ampDrift: 0.18,
            pitchDriftCents: 3,
            driftCycleSec: 18,
            motionMode: "static",
            changeIntervalSec: 16,
            changeChance: 0,
            glideSec: 2,
            filterFrequency: 900,
          });
        }
        const activeMode = ["spectrogram", "synthesis", "soundscape"].includes(normalized.activeMode)
          ? normalized.activeMode
          : (prevAudio.activeMode || "spectrogram");
        const nextAudio = {
          ...prevAudio,
          activeMode,
          fftSize: clampRound(normalized.fftSize ?? prevAudio.fftSize ?? 1024, 256, 4096),
          hopSize: clampRound(normalized.hopSize ?? prevAudio.hopSize ?? 256, 64, 2048),
          windowType: "hann",
          minHz: clampRound(normalized.minHz ?? prevAudio.minHz ?? 40, 20, 20000),
          maxHz: clampRound(normalized.maxHz ?? prevAudio.maxHz ?? 12000, 20, 22050),
          loudnessFloorDb: deps.clamp(finiteOr(normalized.loudnessFloorDb, finiteOr(prevAudio.loudnessFloorDb, -72)), -120, -12),
          brushSize: clampRound(normalized.brushSize ?? prevAudio.brushSize ?? 6, 1, 32),
          brushStrength: deps.clamp(finiteOr(normalized.brushStrength, finiteOr(prevAudio.brushStrength, 0.8)), 0, 1),
          eraseMode: Boolean(normalized.eraseMode),
          autoThreshold: deps.clamp(finiteOr(normalized.autoThreshold, finiteOr(prevAudio.autoThreshold, 0.62)), 0, 1),
          autoContrast: deps.clamp(finiteOr(normalized.autoContrast, finiteOr(prevAudio.autoContrast, 1.5)), 0.25, 4),
          autoGain: deps.clamp(finiteOr(normalized.autoGain, finiteOr(prevAudio.autoGain, 1)), 0, 2),
          autoClearBeforePaint: Boolean(normalized.autoClearBeforePaint ?? prevAudio.autoClearBeforePaint ?? true),
          approximationMaxStrokes: clampRound(normalized.approximationMaxStrokes ?? prevAudio.approximationMaxStrokes ?? 100, 1, 1000),
          approximationMinStrength: deps.clamp(finiteOr(normalized.approximationMinStrength, finiteOr(prevAudio.approximationMinStrength, 0.05)), 0, 1),
          playbackRate: deps.clamp(finiteOr(normalized.playbackRate, finiteOr(prevAudio.playbackRate, 1)), 0.25, 2),
          masterGain: deps.clamp(finiteOr(normalized.masterGain, finiteOr(prevAudio.masterGain, 0.7)), 0, 1),
          synthesis: {
            durationSec: deps.clamp(finiteOr(normalizedSynthesis.durationSec, finiteOr(prevSynthesis.durationSec, 4)), 0.25, 60),
            loop: Boolean(normalizedSynthesis.loop ?? prevSynthesis.loop ?? true),
            masterGain: deps.clamp(finiteOr(normalizedSynthesis.masterGain, finiteOr(prevSynthesis.masterGain, 0.45)), 0, 1),
            oscillators,
          },
          soundscape: {
            rootNote: validRoots.includes(normalizedSoundscape.rootNote)
              ? normalizedSoundscape.rootNote
              : (validRoots.includes(prevSoundscape.rootNote) ? prevSoundscape.rootNote : "D"),
            scale: validScales.includes(normalizedSoundscape.scale)
              ? normalizedSoundscape.scale
              : (validScales.includes(prevSoundscape.scale) ? prevSoundscape.scale : "minorPentatonic"),
            durationSec: deps.clamp(finiteOr(normalizedSoundscape.durationSec, finiteOr(prevSoundscape.durationSec, 8)), 0.25, 60),
            loop: Boolean(normalizedSoundscape.loop ?? prevSoundscape.loop ?? true),
            masterGain: deps.clamp(finiteOr(normalizedSoundscape.masterGain, finiteOr(prevSoundscape.masterGain, 0.45)), 0, 1),
            randomSeed: clampRound(normalizedSoundscape.randomSeed ?? prevSoundscape.randomSeed ?? 1, 1, 999999),
            layers: soundscapeLayers,
          },
        };
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              audio: nextAudio,
            },
          },
        };
      }
      if (key === "slime") {
        const nextSlime = normalizeSlimeSettings(
          normalized,
          deps.getSettingsDefaults("slime", {}),
        );
        return {
          ...prev,
          simulation: {
            ...prev.simulation,
            knobs: {
              ...prev.simulation.knobs,
              slime: nextSlime,
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
