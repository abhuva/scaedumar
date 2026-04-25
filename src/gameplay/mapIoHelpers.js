export function getFileFromFolderSelection(files, fileName) {
  const lower = fileName.toLowerCase();
  for (const file of files) {
    if (String(file.name || "").toLowerCase() === lower) {
      return file;
    }
  }
  return null;
}

function createMissingJsonError(path) {
  const error = new Error(`Missing optional JSON: ${path}`);
  error.code = "MISSING_OPTIONAL_JSON";
  return error;
}

function isMissingJsonLoadError(error) {
  const message = String(error && error.message ? error.message : error || "").toLowerCase();
  return (
    message.includes("http 404")
    || message.includes("not found")
    || message.includes("enoent")
    || message.includes("os error 2")
    || message.includes("cannot find the file")
    || message.includes("no such file")
  );
}

export function createMapIoHelpers(deps) {
  async function tryLoadJsonFromUrl(path) {
    if (deps.tauriInvoke && deps.isAbsoluteFsPath(path)) {
      try {
        const text = await deps.invokeTauri("load_json_file", { path });
        return JSON.parse(text);
      } catch (error) {
        const missingInTauri = isMissingJsonLoadError(error);
        if (!missingInTauri) {
          console.warn(`Tauri JSON load failed for ${path}, trying fetch fallback.`, error);
        }
        const fileUrl = deps.toAbsoluteFileUrl(path);
        if (fileUrl) {
          const response = await fetch(fileUrl, { cache: "no-store" });
          if (response.ok) {
            return response.json();
          }
          if (response.status === 404 && missingInTauri) {
            throw createMissingJsonError(path);
          }
          throw new Error(
            `Fetch fallback failed for ${fileUrl}: HTTP ${response.status} ${response.statusText}. Original error: ${error}`,
          );
        }
        if (missingInTauri) {
          throw createMissingJsonError(path);
        }
        throw new Error(`Fetch fallback unavailable for ${path}. Original error: ${error}`);
      }
    }
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      if (response.status === 404) {
        throw createMissingJsonError(path);
      }
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  return {
    tryLoadJsonFromUrl,
  };
}
