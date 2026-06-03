export function createMapSidecarLoader(deps) {
  function waterTrailDefaults() {
    return typeof deps.getSettingsDefaults === "function"
      ? deps.getSettingsDefaults("watertrails", deps.defaultWaterTrailSettings)
      : deps.defaultWaterTrailSettings;
  }

  function slimeDefaults() {
    return typeof deps.getSettingsDefaults === "function"
      ? deps.getSettingsDefaults("slime", deps.defaultSlimeSettings)
      : deps.defaultSlimeSettings;
  }

  function isMissingOptionalJsonError(err) {
    return Boolean(err && err.code === "MISSING_OPTIONAL_JSON");
  }

  async function unifyTryApplyJson(loadJson, applyFn, onAbsentOrFailed, onErrorLabel) {
    function applyAbsentOrFailed() {
      if (typeof onAbsentOrFailed === "function") {
        onAbsentOrFailed();
      }
    }
    try {
      const payload = await loadJson();
      if (!payload || payload.absent) {
        applyAbsentOrFailed();
        return false;
      }
      applyFn(payload.data, payload.source);
      return true;
    } catch (err) {
      if (onErrorLabel) {
        console.warn(onErrorLabel, err);
      }
      applyAbsentOrFailed();
      return false;
    }
  }

  function applyRenderLutMapLocalDefinition(rawData, source) {
    if (typeof deps.applyRenderLutMapLocalDefinition === "function") {
      deps.applyRenderLutMapLocalDefinition(rawData, source);
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
      slime: false,
      detail: false,
      apron: false,
      camera: false,
      audio: false,
      resourceDebug: false,
      resourceStock: false,
      swarm: false,
      renderLuts: false,
      structures: false,
      npc: false,
    };
  }

  async function runSidecarSpecs(specs, progressOptions = {}) {
    const loaded = createEmptyLoadedState();
    const start = Number(progressOptions.start);
    const end = Number(progressOptions.end);
    const hasProgress = Number.isFinite(start) && Number.isFinite(end);
    for (let index = 0; index < specs.length; index += 1) {
      const spec = specs[index];
      if (hasProgress && typeof deps.setStatus === "function") {
        const progress = start + ((end - start) * (index / Math.max(1, specs.length)));
        deps.setStatus(`Loading sidecar ${spec.fileName || spec.key}...`, { progress });
      }
      loaded[spec.key] = await unifyTryApplyJson(
        spec.loadJson,
        spec.applyFn,
        spec.onAbsentOrFailed,
        spec.onErrorLabel,
      );
    }
    if (hasProgress && typeof deps.setStatus === "function") {
      deps.setStatus("Map sidecars loaded.", { progress: end });
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
        fileName: "pointlights.json",
        loadJson: loadOptionalUrlJson(jsonPath("pointlights.json")),
        applyFn: (rawData, source) => deps.applyLoadedPointLights(rawData, source, { suppressStatus: true }),
        onErrorLabel: `Failed to load pointlights.json from ${folder}`,
      },
      {
        key: "lighting",
        fileName: "lighting.json",
        loadJson: loadOptionalUrlJson(jsonPath("lighting.json")),
        applyFn: (rawData) => deps.applyLightingSettings(rawData),
        onErrorLabel: `Failed to load lighting.json from ${folder}`,
      },
      {
        key: "interaction",
        fileName: "interaction.json",
        loadJson: loadOptionalUrlJson(jsonPath("interaction.json")),
        applyFn: (rawData) => deps.applyInteractionSettings(rawData),
        onErrorLabel: `Failed to load interaction.json from ${folder}`,
      },
      {
        key: "fog",
        fileName: "fog.json",
        loadJson: loadOptionalUrlJson(jsonPath("fog.json")),
        applyFn: (rawData) => deps.applyFogSettings(rawData),
        onErrorLabel: `Failed to load fog.json from ${folder}`,
      },
      {
        key: "clouds",
        fileName: "clouds.json",
        loadJson: loadOptionalUrlJson(jsonPath("clouds.json")),
        applyFn: (rawData) => deps.applyCloudSettings(rawData),
        onErrorLabel: `Failed to load clouds.json from ${folder}`,
      },
      {
        key: "waterFx",
        fileName: "waterfx.json",
        loadJson: loadOptionalUrlJson(jsonPath("waterfx.json")),
        applyFn: (rawData) => deps.applyWaterSettings(rawData),
        onErrorLabel: `Failed to load waterfx.json from ${folder}`,
      },
      {
        key: "waterTrails",
        fileName: "watertrails.json",
        loadJson: loadOptionalUrlJson(jsonPath("watertrails.json")),
        applyFn: (rawData) => deps.applyWaterTrailSettings(rawData),
        onAbsentOrFailed: () => deps.applyWaterTrailSettings(waterTrailDefaults()),
        onErrorLabel: `Failed to load watertrails.json from ${folder}`,
      },
      {
        key: "slime",
        fileName: "slime.json",
        loadJson: loadOptionalUrlJson(jsonPath("slime.json")),
        applyFn: (rawData) => deps.applySlimeSettings(rawData),
        onAbsentOrFailed: () => deps.applySlimeSettings(slimeDefaults()),
        onErrorLabel: `Failed to load slime.json from ${folder}`,
      },
      {
        key: "detail",
        fileName: "detail.json",
        loadJson: loadOptionalUrlJson(jsonPath("detail.json")),
        applyFn: (rawData) => deps.applyDetailSettings(rawData),
        onErrorLabel: `Failed to load detail.json from ${folder}`,
      },
      {
        key: "apron",
        fileName: "apron.json",
        loadJson: loadOptionalUrlJson(jsonPath("apron.json")),
        applyFn: (rawData) => deps.applyApronSettings(rawData),
        onErrorLabel: `Failed to load apron.json from ${folder}`,
      },
      {
        key: "camera",
        fileName: "camera.json",
        loadJson: loadOptionalUrlJson(jsonPath("camera.json")),
        applyFn: (rawData) => deps.applyCameraSettings(rawData),
        onErrorLabel: `Failed to load camera.json from ${folder}`,
      },
      {
        key: "audio",
        fileName: "audio.json",
        loadJson: loadOptionalUrlJson(jsonPath("audio.json")),
        applyFn: (rawData) => deps.applyAudioSettings(rawData),
        onErrorLabel: `Failed to load audio.json from ${folder}`,
      },
      {
        key: "resourceDebug",
        fileName: "resource_debug.json",
        loadJson: loadOptionalUrlJson(jsonPath("resource_debug.json")),
        applyFn: (rawData) => deps.applyResourceDebugSettings(rawData),
        onAbsentOrFailed: () => deps.applyResourceDebugSettings(null),
        onErrorLabel: `Failed to load resource_debug.json from ${folder}`,
      },
      {
        key: "resourceStock",
        fileName: "resource_stock.json",
        loadJson: loadOptionalUrlJson(jsonPath("resource_stock.json")),
        applyFn: (rawData) => deps.applyResourceStockSettings(rawData),
        onAbsentOrFailed: () => deps.applyResourceStockSettings(null),
        onErrorLabel: `Failed to load resource_stock.json from ${folder}`,
      },
      {
        key: "swarm",
        fileName: "swarm.json",
        loadJson: loadOptionalUrlJson(jsonPath("swarm.json")),
        applyFn: (rawData) => deps.applySwarmData(rawData),
        onErrorLabel: `Failed to load swarm.json from ${folder}`,
      },
      {
        key: "renderLuts",
        fileName: "render_luts.json",
        loadJson: loadOptionalUrlJson(jsonPath("render_luts.json")),
        applyFn: applyRenderLutMapLocalDefinition,
        onAbsentOrFailed: () => applyRenderLutMapLocalDefinition(null, ""),
        onErrorLabel: `Failed to load render_luts.json from ${folder}`,
      },
      {
        key: "structures",
        fileName: "structures.json",
        loadJson: loadOptionalUrlJson(jsonPath("structures.json")),
        applyFn: (rawData) => deps.applyStructureData(rawData),
        onAbsentOrFailed: () => deps.applyStructureData(null),
        onErrorLabel: `Failed to load structures.json from ${folder}`,
      },
      {
        key: "npc",
        fileName: "npc.json",
        loadJson: loadOptionalUrlJson(jsonPath("npc.json")),
        applyFn: (rawData) => deps.applyLoadedNpc(rawData),
        onAbsentOrFailed: () => deps.applyLoadedNpc(deps.defaultPlayer),
        onErrorLabel: `Failed to load npc.json from ${folder}`,
      },
    ], { start: 0.5, end: 0.68 });
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
        fileName: "pointlights.json",
        loadJson: loadOptionalFileJson("pointlights.json"),
        applyFn: (rawData, source) => deps.applyLoadedPointLights(rawData, source, { suppressStatus: true }),
        onErrorLabel: "Failed to parse pointlights.json from selected folder",
      },
      {
        key: "lighting",
        fileName: "lighting.json",
        loadJson: loadOptionalFileJson("lighting.json"),
        applyFn: (rawData) => deps.applyLightingSettings(rawData),
        onErrorLabel: "Failed to parse lighting.json from selected folder",
      },
      {
        key: "interaction",
        fileName: "interaction.json",
        loadJson: loadOptionalFileJson("interaction.json"),
        applyFn: (rawData) => deps.applyInteractionSettings(rawData),
        onErrorLabel: "Failed to parse interaction.json from selected folder",
      },
      {
        key: "fog",
        fileName: "fog.json",
        loadJson: loadOptionalFileJson("fog.json"),
        applyFn: (rawData) => deps.applyFogSettings(rawData),
        onErrorLabel: "Failed to parse fog.json from selected folder",
      },
      {
        key: "clouds",
        fileName: "clouds.json",
        loadJson: loadOptionalFileJson("clouds.json"),
        applyFn: (rawData) => deps.applyCloudSettings(rawData),
        onErrorLabel: "Failed to parse clouds.json from selected folder",
      },
      {
        key: "waterFx",
        fileName: "waterfx.json",
        loadJson: loadOptionalFileJson("waterfx.json"),
        applyFn: (rawData) => deps.applyWaterSettings(rawData),
        onErrorLabel: "Failed to parse waterfx.json from selected folder",
      },
      {
        key: "waterTrails",
        fileName: "watertrails.json",
        loadJson: loadOptionalFileJson("watertrails.json"),
        applyFn: (rawData) => deps.applyWaterTrailSettings(rawData),
        onAbsentOrFailed: () => deps.applyWaterTrailSettings(waterTrailDefaults()),
        onErrorLabel: "Failed to parse watertrails.json from selected folder",
      },
      {
        key: "slime",
        fileName: "slime.json",
        loadJson: loadOptionalFileJson("slime.json"),
        applyFn: (rawData) => deps.applySlimeSettings(rawData),
        onAbsentOrFailed: () => deps.applySlimeSettings(slimeDefaults()),
        onErrorLabel: "Failed to parse slime.json from selected folder",
      },
      {
        key: "detail",
        fileName: "detail.json",
        loadJson: loadOptionalFileJson("detail.json"),
        applyFn: (rawData) => deps.applyDetailSettings(rawData),
        onErrorLabel: "Failed to parse detail.json from selected folder",
      },
      {
        key: "apron",
        fileName: "apron.json",
        loadJson: loadOptionalFileJson("apron.json"),
        applyFn: (rawData) => deps.applyApronSettings(rawData),
        onErrorLabel: "Failed to parse apron.json from selected folder",
      },
      {
        key: "camera",
        fileName: "camera.json",
        loadJson: loadOptionalFileJson("camera.json"),
        applyFn: (rawData) => deps.applyCameraSettings(rawData),
        onErrorLabel: "Failed to parse camera.json from selected folder",
      },
      {
        key: "audio",
        fileName: "audio.json",
        loadJson: loadOptionalFileJson("audio.json"),
        applyFn: (rawData) => deps.applyAudioSettings(rawData),
        onErrorLabel: "Failed to parse audio.json from selected folder",
      },
      {
        key: "resourceDebug",
        fileName: "resource_debug.json",
        loadJson: loadOptionalFileJson("resource_debug.json"),
        applyFn: (rawData) => deps.applyResourceDebugSettings(rawData),
        onAbsentOrFailed: () => deps.applyResourceDebugSettings(null),
        onErrorLabel: "Failed to parse resource_debug.json from selected folder",
      },
      {
        key: "resourceStock",
        fileName: "resource_stock.json",
        loadJson: loadOptionalFileJson("resource_stock.json"),
        applyFn: (rawData) => deps.applyResourceStockSettings(rawData),
        onAbsentOrFailed: () => deps.applyResourceStockSettings(null),
        onErrorLabel: "Failed to parse resource_stock.json from selected folder",
      },
      {
        key: "swarm",
        fileName: "swarm.json",
        loadJson: loadOptionalFileJson("swarm.json"),
        applyFn: (rawData) => deps.applySwarmData(rawData),
        onErrorLabel: "Failed to parse swarm.json from selected folder",
      },
      {
        key: "renderLuts",
        fileName: "render_luts.json",
        loadJson: loadOptionalFileJson("render_luts.json"),
        applyFn: applyRenderLutMapLocalDefinition,
        onAbsentOrFailed: () => applyRenderLutMapLocalDefinition(null, ""),
        onErrorLabel: "Failed to parse render_luts.json from selected folder",
      },
      {
        key: "structures",
        fileName: "structures.json",
        loadJson: loadOptionalFileJson("structures.json"),
        applyFn: (rawData) => deps.applyStructureData(rawData),
        onAbsentOrFailed: () => deps.applyStructureData(null),
        onErrorLabel: "Failed to parse structures.json from selected folder",
      },
      {
        key: "npc",
        fileName: "npc.json",
        loadJson: loadOptionalFileJson("npc.json"),
        applyFn: (rawData) => deps.applyLoadedNpc(rawData),
        onAbsentOrFailed: () => deps.applyLoadedNpc(deps.defaultPlayer),
        onErrorLabel: "Failed to parse npc.json from selected folder",
      },
    ], { start: 0.5, end: 0.68 });
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
