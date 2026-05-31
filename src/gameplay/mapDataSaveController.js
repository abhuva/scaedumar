export function createMapDataSaveController(deps) {
  function createMapDataFileTexts() {
    return {
      "pointlights.json": `${JSON.stringify(deps.serializePointLights(), null, 2)}\n`,
      "lighting.json": `${JSON.stringify(deps.serializeLightingSettings(), null, 2)}\n`,
      "interaction.json": `${JSON.stringify(deps.serializeInteractionSettings(), null, 2)}\n`,
      "fog.json": `${JSON.stringify(deps.serializeFogSettings(), null, 2)}\n`,
      "clouds.json": `${JSON.stringify(deps.serializeCloudSettings(), null, 2)}\n`,
      "waterfx.json": `${JSON.stringify(deps.serializeWaterSettings(), null, 2)}\n`,
      "watertrails.json": `${JSON.stringify(deps.serializeWaterTrailSettings(), null, 2)}\n`,
      "slime.json": `${JSON.stringify(deps.serializeSlimeSettings(), null, 2)}\n`,
      "detail.json": `${JSON.stringify(deps.serializeDetailSettings(), null, 2)}\n`,
      "camera.json": `${JSON.stringify(deps.serializeCameraSettings(), null, 2)}\n`,
      "audio.json": `${JSON.stringify(deps.serializeAudioSettings(), null, 2)}\n`,
      "resource_debug.json": `${JSON.stringify(deps.serializeResourceDebugSettings(), null, 2)}\n`,
      "resource_stock.json": `${JSON.stringify(deps.serializeResourceStockSettings(), null, 2)}\n`,
      "swarm.json": `${JSON.stringify(deps.serializeSwarmData(), null, 2)}\n`,
      "structures.json": `${JSON.stringify(deps.serializeStructureData(), null, 2)}\n`,
      "npc.json": `${JSON.stringify(deps.serializeNpcState(), null, 2)}\n`,
    };
  }

  function downloadTextFile(fileName, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function saveAllMapDataFiles() {
    const files = createMapDataFileTexts();
    const folder = deps.normalizeMapFolderPath(deps.getCurrentMapFolderPath());
    const names = Object.keys(files).join(", ");
    const confirmed = deps.confirm(`Save map data files (${names}) for ${folder}?`);
    if (!confirmed) {
      deps.setStatus("Save all canceled.");
      return;
    }

    if (deps.tauriInvoke) {
      try {
        let targetFolder = folder;
        if (!deps.isAbsoluteFsPath(targetFolder)) {
          targetFolder = await deps.pickMapFolderViaTauri();
          if (!targetFolder) {
            deps.setStatus("Save all canceled.");
            return;
          }
        }
        for (const [name, text] of Object.entries(files)) {
          const targetPath = deps.joinFsPath(targetFolder, name);
          await deps.invokeTauri("save_json_file", { path: targetPath, content: text });
        }
        deps.setStatus(`Saved map data (${names}) to ${targetFolder}.`);
        return;
      } catch (error) {
        console.warn("Tauri Save All failed, falling back to browser flow.", error);
        deps.setStatus("Native Save All failed. Trying browser fallback...");
      }
    }

    if (typeof deps.showDirectoryPicker === "function") {
      try {
        const dir = await deps.showDirectoryPicker();
        for (const [name, text] of Object.entries(files)) {
          const handle = await dir.getFileHandle(name, { create: true });
          const writable = await handle.createWritable();
          await writable.write(text);
          await writable.close();
        }
        deps.setStatus(`Saved map data (${names}) to selected folder. Recommended map path: ${folder}`);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          deps.setStatus("Save canceled by user.");
          return;
        }
        console.warn("Native Save All failed, falling back to downloads.", error);
        deps.setStatus("Native Save All failed. Trying browser fallback...");
      }
    }

    for (const [name, text] of Object.entries(files)) {
      downloadTextFile(name, text);
    }
    deps.setStatus(`Downloaded ${names}. Move them to ${folder}.`);
  }

  async function saveMapDataFile(fileName) {
    const files = createMapDataFileTexts();
    const text = files[fileName];
    if (!text) {
      deps.setStatus(`Unknown map data file: ${fileName}.`);
      return;
    }
    const folder = deps.normalizeMapFolderPath(deps.getCurrentMapFolderPath());
    const confirmed = deps.confirm(`Save ${fileName} for ${folder}?`);
    if (!confirmed) {
      deps.setStatus("Save canceled.");
      return;
    }

    if (deps.tauriInvoke) {
      try {
        let targetFolder = folder;
        if (!deps.isAbsoluteFsPath(targetFolder)) {
          targetFolder = await deps.pickMapFolderViaTauri();
          if (!targetFolder) {
            deps.setStatus("Save canceled.");
            return;
          }
        }
        await deps.invokeTauri("save_json_file", {
          path: deps.joinFsPath(targetFolder, fileName),
          content: text,
        });
        deps.setStatus(`Saved ${fileName} to ${targetFolder}.`);
        return;
      } catch (error) {
        console.warn(`Native save failed for ${fileName}, falling back to browser flow.`, error);
        deps.setStatus("Native save failed. Trying browser fallback...");
      }
    }

    if (typeof deps.showDirectoryPicker === "function") {
      try {
        const dir = await deps.showDirectoryPicker();
        const handle = await dir.getFileHandle(fileName, { create: true });
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
        deps.setStatus(`Saved ${fileName} to selected folder. Recommended map path: ${folder}`);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") {
          deps.setStatus("Save canceled by user.");
          return;
        }
        console.warn(`Browser save failed for ${fileName}, falling back to download.`, error);
        deps.setStatus("Browser save failed. Trying download fallback...");
      }
    }

    downloadTextFile(fileName, text);
    deps.setStatus(`Downloaded ${fileName}. Move it to ${folder}.`);
  }

  return {
    createMapDataFileTexts,
    downloadTextFile,
    saveAllMapDataFiles,
    saveMapDataFile,
  };
}
