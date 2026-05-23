export function createMapLoader(deps) {
  function sidecarStatusText(prefix, loaded) {
    return `${prefix} | pointlights: ${loaded.pointLights ? "yes" : "no"} | lighting: ${loaded.lighting ? "yes" : "no"} | interaction: ${loaded.interaction ? "yes" : "no"} | fog: ${loaded.fog ? "yes" : "no"} | clouds: ${loaded.clouds ? "yes" : "no"} | waterfx: ${loaded.waterFx ? "yes" : "no"} | watertrails: ${loaded.waterTrails ? "yes" : "default"} | detail: ${loaded.detail ? "yes" : "default"} | camera: ${loaded.camera ? "yes" : "default"} | resource-debug: ${loaded.resourceDebug ? "yes" : "default"} | swarm: ${loaded.swarm ? "yes" : "default"} | npc: ${loaded.npc ? "yes" : "default"}`;
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

    const jsonPath = (name) => (deps.isAbsoluteFsPath(folder) ? deps.joinFsPath(folder, name) : `${folder}/${name}`);
    async function loadOptionalImage(fileName) {
      try {
        return await deps.loadImageFromUrl(deps.buildMapAssetPath(folder, fileName));
      } catch {
        return null;
      }
    }

    const [splat, normals, height, slope, water, flow, wetness] = await Promise.all([
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "splat.png")),
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "normals.png")),
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "height.png")),
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "slope.png")),
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "water.png")),
      loadOptionalImage("flow.png"),
      loadOptionalImage("wetness.png"),
    ]);

    await deps.applyMapImages(splat, normals, height, slope, water, flow, wetness);
    deps.setCurrentMapFolderPath(folder);
    deps.resetMapRuntimeStateAfterImages();
    const loaded = await deps.mapSidecarLoader.loadSidecarsFromUrl(folder, jsonPath);
    deps.rebuildMovementField();
    if (typeof deps.onMapLoaded === "function") {
      deps.onMapLoaded();
    }
    deps.setStatus(appendMissingGameplayMapWarning(sidecarStatusText(`Loaded map ${folder}`, loaded), {
      "splat.png": splat,
      "normals.png": normals,
      "height.png": height,
      "slope.png": slope,
      "water.png": water,
      "flow.png": flow,
      "wetness.png": wetness,
    }));
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

    const [splat, normals, height, slope, water, flow, wetness] = await Promise.all([
      deps.loadImageFromFile(splatFile),
      deps.loadImageFromFile(normalsFile),
      deps.loadImageFromFile(heightFile),
      deps.loadImageFromFile(slopeFile),
      deps.loadImageFromFile(waterFile),
      flowFile ? deps.loadImageFromFile(flowFile) : Promise.resolve(null),
      wetnessFile ? deps.loadImageFromFile(wetnessFile) : Promise.resolve(null),
    ]);
    await deps.applyMapImages(splat, normals, height, slope, water, flow, wetness);

    const relPath = String(splatFile.webkitRelativePath || "");
    const firstFolder = relPath.includes("/") ? relPath.split("/")[0] : "";
    if (firstFolder) {
      deps.setCurrentMapFolderPath(`assets/${firstFolder}/`);
    }

    deps.resetMapRuntimeStateAfterImages();
    const loaded = await deps.mapSidecarLoader.loadSidecarsFromFiles(files);
    deps.rebuildMovementField();
    if (typeof deps.onMapLoaded === "function") {
      deps.onMapLoaded();
    }
    deps.setStatus(appendMissingGameplayMapWarning(sidecarStatusText("Loaded map folder", loaded), {
      "splat.png": splatFile,
      "normals.png": normalsFile,
      "height.png": heightFile,
      "slope.png": slopeFile,
      "water.png": waterFile,
      "flow.png": flowFile,
      "wetness.png": wetnessFile,
    }));
  }

  return {
    loadMapFromPath,
    loadMapFromFolderSelection,
  };
}
