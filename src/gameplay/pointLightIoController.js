export function createPointLightIoController(deps) {
  let saveConfirmArmed = false;
  let saveConfirmTimer = null;

  function resetPointLightsSaveConfirmation() {
    saveConfirmArmed = false;
    deps.setSaveButtonText("Save All");
    if (typeof deps.syncPointLightsStateToStore === "function") {
      deps.syncPointLightsStateToStore(null, false);
    }
    if (saveConfirmTimer !== null) {
      deps.clearTimeout(saveConfirmTimer);
      saveConfirmTimer = null;
    }
  }

  function armPointLightsSaveConfirmation() {
    saveConfirmArmed = true;
    deps.setSaveButtonText("Confirm Save");
    if (typeof deps.syncPointLightsStateToStore === "function") {
      deps.syncPointLightsStateToStore(null, true);
    }
    if (saveConfirmTimer !== null) {
      deps.clearTimeout(saveConfirmTimer);
    }
    saveConfirmTimer = deps.setTimeout(() => {
      resetPointLightsSaveConfirmation();
    }, 5000);
  }

  function isPointLightsSaveConfirmArmed() {
    return saveConfirmArmed;
  }

  function clearPointLights() {
    deps.pointLights.length = 0;
    deps.clearLightEditSelection();
    resetPointLightsSaveConfirmation();
  }

  function serializePointLights() {
    return deps.serializePointLightsPayload(deps.pointLights, deps.splatSize, {
      clamp: deps.clamp,
      defaultFlicker: deps.defaultFlicker,
      defaultFlickerSpeed: deps.defaultFlickerSpeed,
    });
  }

  function parsePointLightsFromJson(rawData) {
    return deps.parsePointLightsPayload(rawData, {
      clamp: deps.clamp,
      defaultFlicker: deps.defaultFlicker,
      defaultFlickerSpeed: deps.defaultFlickerSpeed,
      mapSize: deps.splatSize,
    });
  }

  function applyLoadedPointLights(rawData, sourceLabel, options = {}) {
    const suppressStatus = Boolean(options.suppressStatus);
    const { parsedLights, skippedCount } = parsePointLightsFromJson(rawData);

    clearPointLights();
    for (const light of parsedLights) {
      deps.pointLights.push({
        id: deps.nextPointLightId(),
        pixelX: light.pixelX,
        pixelY: light.pixelY,
        strength: light.strength,
        intensity: light.intensity,
        heightOffset: light.heightOffset,
        flicker: light.flicker,
        flickerSpeed: light.flickerSpeed,
        color: [...light.color],
      });
    }

    deps.bakePointLightsTexture();
    deps.updateLightEditorUi();
    deps.requestOverlayDraw();

    if (!suppressStatus) {
      const skippedNote = skippedCount > 0 ? ` | Skipped invalid entries: ${skippedCount}` : "";
      deps.setStatus(`Loaded point lights from ${sourceLabel}: ${parsedLights.length}${skippedNote}`);
    }

    return { loadedCount: parsedLights.length, skippedCount };
  }

  async function savePointLightsJson() {
    const payload = serializePointLights();
    const text = `${JSON.stringify(payload, null, 2)}\n`;
    const currentMapFolderPath = deps.getCurrentMapFolderPath();

    if (deps.tauriInvoke && deps.isAbsoluteFsPath(currentMapFolderPath)) {
      try {
        const targetPath = deps.joinFsPath(currentMapFolderPath, "pointlights.json");
        await deps.invokeTauri("save_json_file", { path: targetPath, content: text });
        deps.setStatus(`Saved ${payload.lights.length} point lights to ${targetPath}.`);
        return;
      } catch (error) {
        console.warn("Tauri pointlights save failed, falling back to browser flow.", error);
        deps.setStatus("Native pointlights save failed. Trying browser fallback...");
      }
    }

    if (typeof deps.showSaveFilePicker === "function") {
      try {
        const handle = await deps.showSaveFilePicker({
          suggestedName: "pointlights.json",
          types: [
            {
              description: "JSON",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
        deps.setStatus(
          `Saved ${payload.lights.length} point lights. Place pointlights.json in ${deps.normalizeMapFolderPath(currentMapFolderPath)} for map reloads.`,
        );
        return;
      } catch (error) {
        if (error && (error.name === "AbortError" || (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError"))) {
          return;
        }
        console.error("Browser pointlights save failed, falling back to download.", error);
      }
    }

    deps.downloadTextFile("pointlights.json", text);
    deps.setStatus(
      `Downloaded pointlights.json with ${payload.lights.length} point lights. Place it in ${deps.normalizeMapFolderPath(currentMapFolderPath)}.`,
    );
  }

  async function loadPointLightsFromAssetsOrPrompt() {
    const folder = deps.normalizeMapFolderPath(deps.getCurrentMapFolderPath());
    const pointLightsPath = deps.isAbsoluteFsPath(folder)
      ? deps.joinFsPath(folder, "pointlights.json")
      : `${folder}/pointlights.json`;
    try {
      const rawData = await deps.tryLoadJsonFromUrl(pointLightsPath);
      applyLoadedPointLights(rawData, pointLightsPath);
      return;
    } catch (err) {
      console.warn(`Failed to load ${pointLightsPath}`, err);
    }

    deps.setStatus(`${pointLightsPath} not found. Select a pointlights JSON file to load.`);
    deps.clearPointLightsLoadInput();
    deps.openPointLightsLoadInput();
  }

  return {
    clearPointLights,
    resetPointLightsSaveConfirmation,
    armPointLightsSaveConfirmation,
    isPointLightsSaveConfirmArmed,
    serializePointLights,
    parsePointLightsFromJson,
    applyLoadedPointLights,
    savePointLightsJson,
    loadPointLightsFromAssetsOrPrompt,
  };
}
