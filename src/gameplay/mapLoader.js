export function createMapLoader(deps) {
  function sidecarStatusText(prefix, loaded) {
    return `${prefix} | pointlights: ${loaded.pointLights ? "yes" : "no"} | lighting: ${loaded.lighting ? "yes" : "no"} | parallax: ${loaded.parallax ? "yes" : "no"} | interaction: ${loaded.interaction ? "yes" : "no"} | fog: ${loaded.fog ? "yes" : "no"} | clouds: ${loaded.clouds ? "yes" : "no"} | waterfx: ${loaded.waterFx ? "yes" : "no"} | swarm: ${loaded.swarm ? "yes" : "default"} | npc: ${loaded.npc ? "yes" : "default"}`;
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
    const [splat, normals, height, slope, water] = await Promise.all([
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "splat.png")),
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "normals.png")),
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "height.png")),
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "slope.png")),
      deps.loadImageFromUrl(deps.buildMapAssetPath(folder, "water.png")),
    ]);

    await deps.applyMapImages(splat, normals, height, slope, water);
    deps.setCurrentMapFolderPath(folder);
    deps.resetMapRuntimeStateAfterImages();
    const loaded = await deps.mapSidecarLoader.loadSidecarsFromUrl(folder, jsonPath);
    deps.rebuildMovementField();
    deps.setStatus(sidecarStatusText(`Loaded map ${folder}`, loaded));
  }

  async function loadMapFromFolderSelection(fileList) {
    const files = Array.from(fileList || []);
    const splatFile = deps.getFileFromFolderSelection(files, "splat.png");
    const normalsFile = deps.getFileFromFolderSelection(files, "normals.png");
    const heightFile = deps.getFileFromFolderSelection(files, "height.png");
    const slopeFile = deps.getFileFromFolderSelection(files, "slope.png");
    const waterFile = deps.getFileFromFolderSelection(files, "water.png");
    if (!splatFile || !normalsFile || !heightFile || !slopeFile || !waterFile) {
      throw new Error("Folder must contain splat.png, normals.png, height.png, slope.png, and water.png.");
    }

    const [splat, normals, height, slope, water] = await Promise.all([
      deps.loadImageFromFile(splatFile),
      deps.loadImageFromFile(normalsFile),
      deps.loadImageFromFile(heightFile),
      deps.loadImageFromFile(slopeFile),
      deps.loadImageFromFile(waterFile),
    ]);
    await deps.applyMapImages(splat, normals, height, slope, water);

    const relPath = String(splatFile.webkitRelativePath || "");
    const firstFolder = relPath.includes("/") ? relPath.split("/")[0] : "";
    if (firstFolder) {
      deps.setCurrentMapFolderPath(`assets/${firstFolder}/`);
    }

    deps.resetMapRuntimeStateAfterImages();
    const loaded = await deps.mapSidecarLoader.loadSidecarsFromFiles(files);
    deps.rebuildMovementField();
    deps.setStatus(sidecarStatusText("Loaded map folder", loaded));
  }

  return {
    loadMapFromPath,
    loadMapFromFolderSelection,
  };
}
