export function normalizeMapFolderPath(path, defaultMapFolder = "assets") {
  const text = String(path || "").trim();
  if (!text) return defaultMapFolder;
  return text.replace(/[\\/]+$/, "");
}

export function isAbsoluteFsPath(path) {
  const text = String(path || "").trim();
  if (!text) return false;
  return /^[a-zA-Z]:[\\/]/.test(text) || text.startsWith("/") || text.startsWith("\\\\");
}

export function joinFsPath(folder, fileName) {
  const base = String(folder || "").replace(/[\\/]+$/, "");
  if (base.includes("\\")) {
    return `${base}\\${fileName}`;
  }
  return `${base}/${fileName}`;
}

function encodeUrlPath(path) {
  return String(path || "").split("/").map((segment) => {
    try {
      return encodeURIComponent(decodeURIComponent(segment));
    } catch {
      return encodeURIComponent(segment);
    }
  }).join("/");
}

export function buildMapAssetPath(folder, fileName) {
  const base = String(folder || "").replace(/[\\/]+$/, "");
  if (base.startsWith("file://")) {
    return `${base}/${encodeURIComponent(fileName)}`;
  }
  if (isAbsoluteFsPath(base)) {
    const normalized = base.replace(/\\/g, "/");
    if (/^[a-zA-Z]:\//.test(normalized)) {
      return `file:///${encodeURI(normalized)}/${encodeURIComponent(fileName)}`;
    }
    if (normalized.startsWith("//")) {
      return `file:${encodeURI(normalized)}/${encodeURIComponent(fileName)}`;
    }
    return `file://${encodeURI(normalized)}/${encodeURIComponent(fileName)}`;
  }
  const relativePath = `${base}/${fileName}`;
  const urlPath = relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
  return encodeUrlPath(urlPath);
}

export function toAbsoluteFileUrl(path) {
  const normalized = String(path || "").trim().replace(/\\/g, "/");
  if (!normalized) return "";
  if (normalized.startsWith("file://")) return normalized;
  if (/^[a-zA-Z]:\//.test(normalized)) {
    return `file:///${encodeURI(normalized)}`;
  }
  if (normalized.startsWith("//")) {
    return `file:${encodeURI(normalized)}`;
  }
  return `file://${encodeURI(normalized)}`;
}
