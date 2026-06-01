export function createMapLoader(deps) {
  function sidecarStatusText(prefix, loaded) {
    return `${prefix} | pointlights: ${loaded.pointLights ? "yes" : "no"} | lighting: ${loaded.lighting ? "yes" : "no"} | interaction: ${loaded.interaction ? "yes" : "no"} | fog: ${loaded.fog ? "yes" : "no"} | clouds: ${loaded.clouds ? "yes" : "no"} | waterfx: ${loaded.waterFx ? "yes" : "no"} | watertrails: ${loaded.waterTrails ? "yes" : "default"} | slime: ${loaded.slime ? "yes" : "default"} | detail: ${loaded.detail ? "yes" : "default"} | camera: ${loaded.camera ? "yes" : "default"} | resource-debug: ${loaded.resourceDebug ? "yes" : "default"} | resource-stock: ${loaded.resourceStock ? "yes" : "default"} | swarm: ${loaded.swarm ? "yes" : "default"} | render-luts: ${loaded.renderLuts ? "yes" : "default"} | npc: ${loaded.npc ? "yes" : "default"}`;
  }

  function appendMissingGameplayMapWarning(status, availableFiles) {
    const required = typeof deps.getRequiredGameplayMapFiles === "function"
      ? deps.getRequiredGameplayMapFiles()
      : [];
    const missing = required.filter((fileName) => !availableFiles[fileName]);
    if (!missing.length) return status;
    return `${status} | WARNING: missing gameplay map ${missing.join(", ")}; related resource search is disabled.`;
  }

  async function loadMapFromPath(mapFolderPath) {
    const folder = deps.normalizeMapFolderPath(mapFolderPath);
    if (deps.tauriInvoke && deps.isAbsoluteFsPath(folder)) {
      const validation = await deps.validateMapFolderViaTauri(folder);
      if (!validation.is_valid) {
        throw new Error(`Missing required files: ${validation.missing_files.join(", ")}`);
      }
    }

    const jsonPath = (name) => (
      deps.isAbsoluteFsPath(folder) ? deps.joinFsPath(folder, name) : deps.buildMapAssetPath(folder, name)
    );
    async function loadOptionalImage(fileName) {
      try {
        return await deps.loadImageFromUrl(deps.buildMapAssetPath(folder, fileName));
      } catch {
        return null;
      }
    }

    async function loadRequiredImage(fileName) {
      try {
        const requiredImages = ["splat.png", "normals.png", "height.png", "slope.png", "water.png"];
        const imageIndex = requiredImages.indexOf(fileName);
        const progress = 0.08 + (Math.max(0, imageIndex) * 0.07);
        deps.setStatus(`Loading map ${folder}: ${fileName}...`, { progress });
        return await deps.loadImageFromUrl(deps.buildMapAssetPath(folder, fileName));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed loading required map image ${fileName}: ${message}`, { cause: error });
      }
    }

    const splat = await loadRequiredImage("splat.png");
    const normals = await loadRequiredImage("normals.png");
    const height = await loadRequiredImage("height.png");
    const slope = await loadRequiredImage("slope.png");
    const water = await loadRequiredImage("water.png");
    const flow = await loadOptionalImage("flow.png");
    const wetness = await loadOptionalImage("wetness.png");

    deps.setStatus("Uploading terrain textures...", { progress: 0.43 });
    await deps.applyMapImages(splat, normals, height, slope, water, flow, wetness);
    deps.setStatus("Resetting map runtime state...", { progress: 0.48 });
    deps.setCurrentMapFolderPath(folder);
    deps.resetMapRuntimeStateAfterImages();
    const loaded = await deps.mapSidecarLoader.loadSidecarsFromUrl(folder, jsonPath);
    deps.setStatus("Building movement field...", { progress: 0.7 });
    deps.rebuildMovementField();
    if (typeof deps.onMapLoaded === "function") {
      await deps.onMapLoaded();
    }
    deps.setStatus(appendMissingGameplayMapWarning(sidecarStatusText(`Loaded map ${folder}`, loaded), {
      "splat.png": splat,
      "normals.png": normals,
      "height.png": height,
      "slope.png": slope,
      "water.png": water,
      "flow.png": flow,
      "wetness.png": wetness,
    }), { progress: 1 });
  }

  async function loadMapFromFolderSelection(fileList) {
    const files = Array.from(fileList || []);
    const splatFile = deps.getFileFromFolderSelection(files, "splat.png");
    const normalsFile = deps.getFileFromFolderSelection(files, "normals.png");
    const heightFile = deps.getFileFromFolderSelection(files, "height.png");
    const slopeFile = deps.getFileFromFolderSelection(files, "slope.png");
    const waterFile = deps.getFileFromFolderSelection(files, "water.png");
    const flowFile = deps.getFileFromFolderSelection(files, "flow.png");
    const wetnessFile = deps.getFileFromFolderSelection(files, "wetness.png");
    if (!splatFile || !normalsFile || !heightFile || !slopeFile || !waterFile) {
      throw new Error("Folder must contain splat.png, normals.png, height.png, slope.png, and water.png.");
    }

    deps.setStatus("Loading selected map images...", { progress: 0.12 });
    const imageLoads = [
      { fileName: "splat.png", file: splatFile, required: true },
      { fileName: "normals.png", file: normalsFile, required: true },
      { fileName: "height.png", file: heightFile, required: true },
      { fileName: "slope.png", file: slopeFile, required: true },
      { fileName: "water.png", file: waterFile, required: true },
      { fileName: "flow.png", file: flowFile, required: false },
      { fileName: "wetness.png", file: wetnessFile, required: false },
    ];
    const activeLoads = imageLoads.filter((entry) => entry.file || entry.required);
    let completedLoads = 0;
    function trackSelectedImageLoad(entry) {
      if (!entry.file) return Promise.resolve(null);
      return deps.loadImageFromFile(entry.file).then((image) => {
        completedLoads += 1;
        const progress = 0.12 + (0.28 * (completedLoads / activeLoads.length));
        deps.setStatus(`Loading selected map images: ${entry.fileName}...`, { progress });
        return image;
      }, (error) => {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed loading selected map image ${entry.fileName}: ${message}`, { cause: error });
      });
    }
    const [splat, normals, height, slope, water, flow, wetness] = await Promise.all(
      imageLoads.map(trackSelectedImageLoad)
    );
    deps.setStatus("Uploading terrain textures...", { progress: 0.43 });
    await deps.applyMapImages(splat, normals, height, slope, water, flow, wetness);

    const relPath = String(splatFile.webkitRelativePath || "");
    const firstFolder = relPath.includes("/") ? relPath.split("/")[0] : "";
    if (firstFolder) {
      deps.setCurrentMapFolderPath(`assets/${firstFolder}/`);
    }

    deps.setStatus("Resetting map runtime state...", { progress: 0.48 });
    deps.resetMapRuntimeStateAfterImages();
    const loaded = await deps.mapSidecarLoader.loadSidecarsFromFiles(files);
    deps.setStatus("Building movement field...", { progress: 0.7 });
    deps.rebuildMovementField();
    if (typeof deps.onMapLoaded === "function") {
      await deps.onMapLoaded();
    }
    deps.setStatus(appendMissingGameplayMapWarning(sidecarStatusText("Loaded map folder", loaded), {
      "splat.png": splatFile,
      "normals.png": normalsFile,
      "height.png": heightFile,
      "slope.png": slopeFile,
      "water.png": waterFile,
      "flow.png": flowFile,
      "wetness.png": wetnessFile,
    }), { progress: 1 });
  }

  return {
    loadMapFromPath,
    loadMapFromFolderSelection,
  };
}
