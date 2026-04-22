export function bindMapIoControls(deps) {
  if (deps.mapPathLoadBtn && typeof deps.mapPathLoadBtn.addEventListener === "function") {
    deps.mapPathLoadBtn.addEventListener("click", async () => {
      const rawTarget = String((deps.mapPathInput && deps.mapPathInput.value) || "").trim();
      if (typeof deps.normalizeMapFolderPath !== "function") {
        return;
      }
      let targetPath = deps.normalizeMapFolderPath(rawTarget);
      if (!targetPath && deps.tauriInvoke) {
        let pickedFolder = "";
        try {
          pickedFolder = await deps.pickMapFolderViaTauri();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          deps.setStatus(`Failed to open map folder picker: ${message}`);
          return;
        }
        if (!pickedFolder) {
          deps.setStatus("Map folder selection canceled.");
          return;
        }
        targetPath = deps.normalizeMapFolderPath(pickedFolder);
      }
      if (!targetPath) {
        deps.setStatus("No map folder selected.");
        return;
      }
      try {
        await deps.loadMapFromPath(targetPath);
      } catch (error) {
        console.error(`Failed to load map from ${targetPath}`, error);
        const message = error instanceof Error ? error.message : String(error);
        deps.setStatus(`Failed to load map '${targetPath}': ${message}`);
      }
    });
  }

  if (deps.mapSaveAllBtn && typeof deps.mapSaveAllBtn.addEventListener === "function") {
    deps.mapSaveAllBtn.addEventListener("click", async () => {
      try {
        await deps.saveAllMapDataFiles();
      } catch (error) {
        if (error && error.name === "AbortError") {
          deps.setStatus("Save all canceled.");
          return;
        }
        console.error("Failed to save all map data files", error);
        const message = error instanceof Error ? error.message : String(error);
        deps.setStatus(`Failed to save map data: ${message}`);
      }
    });
  }

  if (deps.mapPathInput && typeof deps.mapPathInput.addEventListener === "function" && deps.mapPathLoadBtn) {
    deps.mapPathInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      deps.mapPathLoadBtn.click();
    });
  }

  if (deps.mapFolderInput && typeof deps.mapFolderInput.addEventListener === "function") {
    deps.mapFolderInput.addEventListener("change", async () => {
      const files = deps.mapFolderInput.files;
      if (!files || files.length === 0) return;
      try {
        await deps.loadMapFromFolderSelection(files);
      } catch (error) {
        console.error("Failed to load selected map folder", error);
        const message = error instanceof Error ? error.message : String(error);
        deps.setStatus(`Failed to load selected map folder: ${message}`);
      } finally {
        deps.mapFolderInput.value = "";
      }
    });
  }
}
