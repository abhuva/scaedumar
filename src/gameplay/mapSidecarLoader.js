export function createMapSidecarLoader(deps) {
  function waterTrailDefaults() {
    return typeof deps.getSettingsDefaults === "function"
      ? deps.getSettingsDefaults("watertrails", deps.defaultWaterTrailSettings)
      : deps.defaultWaterTrailSettings;
  }

  function isMissingOptionalJsonError(err) {
    return Boolean(err && err.code === "MISSING_OPTIONAL_JSON");
  }

  async function unifyTryApplyJson(loadJson, applyFn, onAbsentOrFailed, onErrorLabel) {
    try {
      const payload = await loadJson();
      if (!payload || payload.absent) {
        if (typeof onAbsentOrFailed === "function") {
          onAbsentOrFailed();
        }
        return false;
      }
      applyFn(payload.data, payload.source);
      return true;
    } catch (err) {
      if (onErrorLabel) {
        console.warn(onErrorLabel, err);
      }
      if (typeof onAbsentOrFailed === "function") {
        onAbsentOrFailed();
      }
      return false;
    }
  }

  function createEmptyLoadedState() {
    return {
      pointLights: false,
      lighting: false,
      interaction: false,
      fog: false,
      clouds: false,
      waterFx: false,
      waterTrails: false,
      detail: false,
      camera: false,
      audio: false,
      resourceDebug: false,
      swarm: false,
      npc: false,
    };
  }

  async function runSidecarSpecs(specs) {
    const loaded = createEmptyLoadedState();
    for (const spec of specs) {
      loaded[spec.key] = await unifyTryApplyJson(
        spec.loadJson,
        spec.applyFn,
        spec.onAbsentOrFailed,
        spec.onErrorLabel,
      );
    }
    return loaded;
  }

  async function loadSidecarsFromUrl(folder, jsonPath) {
    function loadOptionalUrlJson(path) {
      return async () => {
        try {
          const data = await deps.tryLoadJsonFromUrl(path);
          return { absent: false, data, source: path };
        } catch (err) {
          if (isMissingOptionalJsonError(err)) {
            return { absent: true };
          }
          throw err;
        }
      };
    }

    return runSidecarSpecs([
      {
        key: "pointLights",
        loadJson: loadOptionalUrlJson(jsonPath("pointlights.json")),
        applyFn: (rawData, source) => deps.applyLoadedPointLights(rawData, source, { suppressStatus: true }),
        onErrorLabel: `Failed to load pointlights.json from ${folder}`,
      },
      {
        key: "lighting",
        loadJson: loadOptionalUrlJson(jsonPath("lighting.json")),
        applyFn: (rawData) => deps.applyLightingSettings(rawData),
        onErrorLabel: `Failed to load lighting.json from ${folder}`,
      },
      {
        key: "interaction",
        loadJson: loadOptionalUrlJson(jsonPath("interaction.json")),
        applyFn: (rawData) => deps.applyInteractionSettings(rawData),
        onErrorLabel: `Failed to load interaction.json from ${folder}`,
      },
      {
        key: "fog",
        loadJson: loadOptionalUrlJson(jsonPath("fog.json")),
        applyFn: (rawData) => deps.applyFogSettings(rawData),
        onErrorLabel: `Failed to load fog.json from ${folder}`,
      },
      {
        key: "clouds",
        loadJson: loadOptionalUrlJson(jsonPath("clouds.json")),
        applyFn: (rawData) => deps.applyCloudSettings(rawData),
        onErrorLabel: `Failed to load clouds.json from ${folder}`,
      },
      {
        key: "waterFx",
        loadJson: loadOptionalUrlJson(jsonPath("waterfx.json")),
        applyFn: (rawData) => deps.applyWaterSettings(rawData),
        onErrorLabel: `Failed to load waterfx.json from ${folder}`,
      },
      {
        key: "waterTrails",
        loadJson: loadOptionalUrlJson(jsonPath("watertrails.json")),
        applyFn: (rawData) => deps.applyWaterTrailSettings(rawData),
        onAbsentOrFailed: () => deps.applyWaterTrailSettings(waterTrailDefaults()),
        onErrorLabel: `Failed to load watertrails.json from ${folder}`,
      },
      {
        key: "detail",
        loadJson: loadOptionalUrlJson(jsonPath("detail.json")),
        applyFn: (rawData) => deps.applyDetailSettings(rawData),
        onErrorLabel: `Failed to load detail.json from ${folder}`,
      },
      {
        key: "camera",
        loadJson: loadOptionalUrlJson(jsonPath("camera.json")),
        applyFn: (rawData) => deps.applyCameraSettings(rawData),
        onErrorLabel: `Failed to load camera.json from ${folder}`,
      },
      {
        key: "audio",
        loadJson: loadOptionalUrlJson(jsonPath("audio.json")),
        applyFn: (rawData) => deps.applyAudioSettings(rawData),
        onErrorLabel: `Failed to load audio.json from ${folder}`,
      },
      {
        key: "resourceDebug",
        loadJson: loadOptionalUrlJson(jsonPath("resource_debug.json")),
        applyFn: (rawData) => deps.applyResourceDebugSettings(rawData),
        onAbsentOrFailed: () => deps.applyResourceDebugSettings(null),
        onErrorLabel: `Failed to load resource_debug.json from ${folder}`,
      },
      {
        key: "resourceStock",
        loadJson: loadOptionalUrlJson(jsonPath("resource_stock.json")),
        applyFn: (rawData) => deps.applyResourceStockSettings(rawData),
        onAbsentOrFailed: () => deps.applyResourceStockSettings(null),
        onErrorLabel: `Failed to load resource_stock.json from ${folder}`,
      },
      {
        key: "swarm",
        loadJson: loadOptionalUrlJson(jsonPath("swarm.json")),
        applyFn: (rawData) => deps.applySwarmData(rawData),
        onErrorLabel: `Failed to load swarm.json from ${folder}`,
      },
      {
        key: "npc",
        loadJson: loadOptionalUrlJson(jsonPath("npc.json")),
        applyFn: (rawData) => deps.applyLoadedNpc(rawData),
        onAbsentOrFailed: () => deps.applyLoadedNpc(deps.defaultPlayer),
        onErrorLabel: `Failed to load npc.json from ${folder}`,
      },
    ]);
  }

  async function loadSidecarsFromFiles(files) {
    function loadOptionalFileJson(fileName) {
      return async () => {
        const file = deps.getFileFromFolderSelection(files, fileName);
        if (!file) return { absent: true };
        return {
          absent: false,
          data: JSON.parse(await file.text()),
          source: file.name,
        };
      };
    }

    const loaded = await runSidecarSpecs([
      {
        key: "pointLights",
        loadJson: loadOptionalFileJson("pointlights.json"),
        applyFn: (rawData, source) => deps.applyLoadedPointLights(rawData, source, { suppressStatus: true }),
        onErrorLabel: "Failed to parse pointlights.json from selected folder",
      },
      {
        key: "lighting",
        loadJson: loadOptionalFileJson("lighting.json"),
        applyFn: (rawData) => deps.applyLightingSettings(rawData),
        onErrorLabel: "Failed to parse lighting.json from selected folder",
      },
      {
        key: "interaction",
        loadJson: loadOptionalFileJson("interaction.json"),
        applyFn: (rawData) => deps.applyInteractionSettings(rawData),
        onErrorLabel: "Failed to parse interaction.json from selected folder",
      },
      {
        key: "fog",
        loadJson: loadOptionalFileJson("fog.json"),
        applyFn: (rawData) => deps.applyFogSettings(rawData),
        onErrorLabel: "Failed to parse fog.json from selected folder",
      },
      {
        key: "clouds",
        loadJson: loadOptionalFileJson("clouds.json"),
        applyFn: (rawData) => deps.applyCloudSettings(rawData),
        onErrorLabel: "Failed to parse clouds.json from selected folder",
      },
      {
        key: "waterFx",
        loadJson: loadOptionalFileJson("waterfx.json"),
        applyFn: (rawData) => deps.applyWaterSettings(rawData),
        onErrorLabel: "Failed to parse waterfx.json from selected folder",
      },
      {
        key: "waterTrails",
        loadJson: loadOptionalFileJson("watertrails.json"),
        applyFn: (rawData) => deps.applyWaterTrailSettings(rawData),
        onAbsentOrFailed: () => deps.applyWaterTrailSettings(waterTrailDefaults()),
        onErrorLabel: "Failed to parse watertrails.json from selected folder",
      },
      {
        key: "detail",
        loadJson: loadOptionalFileJson("detail.json"),
        applyFn: (rawData) => deps.applyDetailSettings(rawData),
        onErrorLabel: "Failed to parse detail.json from selected folder",
      },
      {
        key: "camera",
        loadJson: loadOptionalFileJson("camera.json"),
        applyFn: (rawData) => deps.applyCameraSettings(rawData),
        onErrorLabel: "Failed to parse camera.json from selected folder",
      },
      {
        key: "audio",
        loadJson: loadOptionalFileJson("audio.json"),
        applyFn: (rawData) => deps.applyAudioSettings(rawData),
        onErrorLabel: "Failed to parse audio.json from selected folder",
      },
      {
        key: "resourceDebug",
        loadJson: loadOptionalFileJson("resource_debug.json"),
        applyFn: (rawData) => deps.applyResourceDebugSettings(rawData),
        onAbsentOrFailed: () => deps.applyResourceDebugSettings(null),
        onErrorLabel: "Failed to parse resource_debug.json from selected folder",
      },
      {
        key: "resourceStock",
        loadJson: loadOptionalFileJson("resource_stock.json"),
        applyFn: (rawData) => deps.applyResourceStockSettings(rawData),
        onAbsentOrFailed: () => deps.applyResourceStockSettings(null),
        onErrorLabel: "Failed to parse resource_stock.json from selected folder",
      },
      {
        key: "swarm",
        loadJson: loadOptionalFileJson("swarm.json"),
        applyFn: (rawData) => deps.applySwarmData(rawData),
        onErrorLabel: "Failed to parse swarm.json from selected folder",
      },
      {
        key: "npc",
        loadJson: loadOptionalFileJson("npc.json"),
        applyFn: (rawData) => deps.applyLoadedNpc(rawData),
        onAbsentOrFailed: () => deps.applyLoadedNpc(deps.defaultPlayer),
        onErrorLabel: "Failed to parse npc.json from selected folder",
      },
    ]);
    if (!loaded.pointLights) {
      console.warn("No pointlights.json found in selected folder");
    }
    return loaded;
  }

  return {
    loadSidecarsFromUrl,
    loadSidecarsFromFiles,
  };
}
