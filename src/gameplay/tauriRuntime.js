export function resolveTauriInvoke(win) {
  const tauriCore = win && win.__TAURI__ && win.__TAURI__.core;
  if (!tauriCore || typeof tauriCore.invoke !== "function") {
    return null;
  }
  return tauriCore.invoke.bind(tauriCore);
}

export function createTauriRuntimeHelpers(deps) {
  async function invokeTauri(command, args) {
    if (!deps.tauriInvoke) {
      throw new Error("Tauri invoke is unavailable in this runtime.");
    }
    return deps.tauriInvoke(command, args);
  }

  async function pickMapFolderViaTauri() {
    if (!deps.tauriInvoke) return null;
    const selected = await invokeTauri("pick_map_folder");
    if (!selected) return null;
    return deps.normalizeMapFolderPath(selected);
  }

  async function validateMapFolderViaTauri(folderPath) {
    if (!deps.tauriInvoke || !deps.isAbsoluteFsPath(folderPath)) {
      return { is_valid: true, missing_files: [] };
    }
    return invokeTauri("validate_map_folder", { path: folderPath });
  }

  return {
    invokeTauri,
    pickMapFolderViaTauri,
    validateMapFolderViaTauri,
  };
}
