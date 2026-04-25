export function getFileFromFolderSelection(files, fileName) {
  const lower = fileName.toLowerCase();
  for (const file of files) {
    if (String(file.name || "").toLowerCase() === lower) {
      return file;
    }
  }
  return null;
}

export function createMapIoHelpers(deps) {
  async function tryLoadJsonFromUrl(path) {
    if (deps.tauriInvoke && deps.isAbsoluteFsPath(path)) {
      try {
        const text = await deps.invokeTauri("load_json_file", { path });
        return JSON.parse(text);
      } catch (error) {
        console.warn(`Tauri JSON load failed for ${path}, trying fetch fallback.`, error);
        const fileUrl = deps.toAbsoluteFileUrl(path);
        if (fileUrl) {
          const response = await fetch(fileUrl, { cache: "no-store" });
          if (response.ok) {
            return response.json();
          }
          throw new Error(
            `Fetch fallback failed for ${fileUrl}: HTTP ${response.status} ${response.statusText}. Original error: ${error}`,
          );
        }
        throw new Error(`Fetch fallback unavailable for ${path}. Original error: ${error}`);
      }
    }
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  return {
    tryLoadJsonFromUrl,
  };
}
