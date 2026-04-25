export function createMapSidecarLoader(deps) {
  function isMissingOptionalJsonError(err) {
    return Boolean(err && err.code === "MISSING_OPTIONAL_JSON");
  }

  async function tryApplyOptionalUrlJson(path, applyFn, onAbsentOrFailed, onErrorLabel) {
    try {
      const json = await deps.tryLoadJsonFromUrl(path);
      applyFn(json);
      return true;
    } catch (err) {
      // Preserve the existing defaulting behavior by invoking the fallback for all failure modes.
      if (!isMissingOptionalJsonError(err)) {
        console.warn(onErrorLabel, err);
      }
      if (typeof onAbsentOrFailed === "function") {
        onAbsentOrFailed();
      }
      return false;
    }
  }

  async function loadSidecarsFromUrl(folder, jsonPath) {
    const loaded = {
      pointLights: false,
      lighting: false,
      parallax: false,
      interaction: false,
      fog: false,
      clouds: false,
      waterFx: false,
      swarm: false,
      npc: false,
    };

    loaded.pointLights = await tryApplyOptionalUrlJson(
      jsonPath("pointlights.json"),
      (pointLightsJson) => deps.applyLoadedPointLights(pointLightsJson, jsonPath("pointlights.json"), { suppressStatus: true }),
      null,
      `Failed to load pointlights.json from ${folder}`,
    );
    loaded.lighting = await tryApplyOptionalUrlJson(
      jsonPath("lighting.json"),
      (lightingJson) => deps.applyLightingSettings(lightingJson),
      null,
      `Failed to load lighting.json from ${folder}`,
    );
    loaded.parallax = await tryApplyOptionalUrlJson(
      jsonPath("parallax.json"),
      (parallaxJson) => deps.applyParallaxSettings(parallaxJson),
      null,
      `Failed to load parallax.json from ${folder}`,
    );
    loaded.interaction = await tryApplyOptionalUrlJson(
      jsonPath("interaction.json"),
      (interactionJson) => deps.applyInteractionSettings(interactionJson),
      null,
      `Failed to load interaction.json from ${folder}`,
    );
    loaded.fog = await tryApplyOptionalUrlJson(
      jsonPath("fog.json"),
      (fogJson) => deps.applyFogSettings(fogJson),
      null,
      `Failed to load fog.json from ${folder}`,
    );
    loaded.clouds = await tryApplyOptionalUrlJson(
      jsonPath("clouds.json"),
      (cloudsJson) => deps.applyCloudSettings(cloudsJson),
      null,
      `Failed to load clouds.json from ${folder}`,
    );
    loaded.waterFx = await tryApplyOptionalUrlJson(
      jsonPath("waterfx.json"),
      (waterFxJson) => deps.applyWaterSettings(waterFxJson),
      null,
      `Failed to load waterfx.json from ${folder}`,
    );
    loaded.swarm = await tryApplyOptionalUrlJson(
      jsonPath("swarm.json"),
      (swarmJson) => deps.applySwarmData(swarmJson),
      null,
      `Failed to load swarm.json from ${folder}`,
    );
    loaded.npc = await tryApplyOptionalUrlJson(
      jsonPath("npc.json"),
      (npcJson) => deps.applyLoadedNpc(npcJson),
      () => deps.applyLoadedNpc(deps.defaultPlayer),
      `Failed to load npc.json from ${folder}`,
    );

    return loaded;
  }

  async function loadSidecarsFromFiles(files) {
    const loaded = {
      pointLights: false,
      lighting: false,
      parallax: false,
      interaction: false,
      fog: false,
      clouds: false,
      waterFx: false,
      swarm: false,
      npc: false,
    };

    async function tryApplyJsonFile(fileName, applyFn, onErrorLabel) {
      const file = deps.getFileFromFolderSelection(files, fileName);
      if (!file) return false;
      try {
        const rawData = JSON.parse(await file.text());
        applyFn(rawData, file);
        return true;
      } catch (err) {
        console.warn(onErrorLabel, err);
        return false;
      }
    }

    loaded.pointLights = await tryApplyJsonFile(
      "pointlights.json",
      (rawData, file) => deps.applyLoadedPointLights(rawData, file.name, { suppressStatus: true }),
      "Failed to parse pointlights.json from selected folder",
    );
    if (!loaded.pointLights) {
      console.warn("No pointlights.json found in selected folder");
    }

    loaded.lighting = await tryApplyJsonFile(
      "lighting.json",
      (rawData) => deps.applyLightingSettings(rawData),
      "Failed to parse lighting.json from selected folder",
    );
    loaded.parallax = await tryApplyJsonFile(
      "parallax.json",
      (rawData) => deps.applyParallaxSettings(rawData),
      "Failed to parse parallax.json from selected folder",
    );
    loaded.interaction = await tryApplyJsonFile(
      "interaction.json",
      (rawData) => deps.applyInteractionSettings(rawData),
      "Failed to parse interaction.json from selected folder",
    );
    loaded.fog = await tryApplyJsonFile(
      "fog.json",
      (rawData) => deps.applyFogSettings(rawData),
      "Failed to parse fog.json from selected folder",
    );
    loaded.clouds = await tryApplyJsonFile(
      "clouds.json",
      (rawData) => deps.applyCloudSettings(rawData),
      "Failed to parse clouds.json from selected folder",
    );
    loaded.waterFx = await tryApplyJsonFile(
      "waterfx.json",
      (rawData) => deps.applyWaterSettings(rawData),
      "Failed to parse waterfx.json from selected folder",
    );
    loaded.swarm = await tryApplyJsonFile(
      "swarm.json",
      (rawData) => deps.applySwarmData(rawData),
      "Failed to parse swarm.json from selected folder",
    );

    const npcLoaded = await tryApplyJsonFile(
      "npc.json",
      (rawData) => deps.applyLoadedNpc(rawData),
      "Failed to parse npc.json from selected folder",
    );
    if (npcLoaded) {
      loaded.npc = true;
    } else {
      deps.applyLoadedNpc(deps.defaultPlayer);
    }

    return loaded;
  }

  return {
    loadSidecarsFromUrl,
    loadSidecarsFromFiles,
  };
}
