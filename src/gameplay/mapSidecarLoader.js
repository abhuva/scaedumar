export function createMapSidecarLoader(deps) {
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

    try {
      const pointLightsJsonPath = jsonPath("pointlights.json");
      const pointLightsJson = await deps.tryLoadJsonFromUrl(pointLightsJsonPath);
      deps.applyLoadedPointLights(pointLightsJson, pointLightsJsonPath, { suppressStatus: true });
      loaded.pointLights = true;
    } catch (err) {
      console.warn(`No pointlights.json found in ${folder}`, err);
    }

    try {
      const lightingJson = await deps.tryLoadJsonFromUrl(jsonPath("lighting.json"));
      deps.applyLightingSettings(lightingJson);
      loaded.lighting = true;
    } catch (err) {
      console.warn(`No lighting.json found in ${folder}`, err);
    }

    try {
      const parallaxJson = await deps.tryLoadJsonFromUrl(jsonPath("parallax.json"));
      deps.applyParallaxSettings(parallaxJson);
      loaded.parallax = true;
    } catch (err) {
      console.warn(`No parallax.json found in ${folder}`, err);
    }

    try {
      const interactionJson = await deps.tryLoadJsonFromUrl(jsonPath("interaction.json"));
      deps.applyInteractionSettings(interactionJson);
      loaded.interaction = true;
    } catch (err) {
      console.warn(`No interaction.json found in ${folder}`, err);
    }

    try {
      const fogJson = await deps.tryLoadJsonFromUrl(jsonPath("fog.json"));
      deps.applyFogSettings(fogJson);
      loaded.fog = true;
    } catch (err) {
      console.warn(`No fog.json found in ${folder}`, err);
    }

    try {
      const cloudsJson = await deps.tryLoadJsonFromUrl(jsonPath("clouds.json"));
      deps.applyCloudSettings(cloudsJson);
      loaded.clouds = true;
    } catch (err) {
      console.warn(`No clouds.json found in ${folder}`, err);
    }

    try {
      const waterFxJson = await deps.tryLoadJsonFromUrl(jsonPath("waterfx.json"));
      deps.applyWaterSettings(waterFxJson);
      loaded.waterFx = true;
    } catch (err) {
      console.warn(`No waterfx.json found in ${folder}`, err);
    }

    try {
      const swarmJson = await deps.tryLoadJsonFromUrl(jsonPath("swarm.json"));
      deps.applySwarmData(swarmJson);
      loaded.swarm = true;
    } catch (err) {
      console.warn(`No swarm.json found in ${folder}`, err);
    }

    try {
      const npcJson = await deps.tryLoadJsonFromUrl(jsonPath("npc.json"));
      deps.applyLoadedNpc(npcJson);
      loaded.npc = true;
    } catch (err) {
      deps.applyLoadedNpc(deps.defaultPlayer);
      console.warn(`No npc.json found in ${folder}`, err);
    }

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
