function slugifyPresetId(value) {
  const slug = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug || "preset";
}

function labelFromInput(value, fallbackId) {
  const text = String(value || "").trim();
  return text || fallbackId;
}

function normalizeIndex(kind, rawData) {
  const source = rawData && typeof rawData === "object" ? rawData : {};
  const items = Array.isArray(source.presets) ? source.presets : [];
  return {
    version: 1,
    kind,
    presets: items
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const id = slugifyPresetId(item.id || item.file || item.label);
        return {
          id,
          label: String(item.label || item.id || id),
          file: String(item.file || `${id}.json`),
        };
      }),
  };
}

function mergeIndexes(kind, primary, secondary) {
  const merged = normalizeIndex(kind, primary);
  for (const entry of normalizeIndex(kind, secondary).presets) {
    const index = merged.presets.findIndex((item) => item.id === entry.id);
    if (index >= 0) {
      merged.presets[index] = entry;
    } else {
      merged.presets.push(entry);
    }
  }
  merged.presets.sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id)));
  return merged;
}

function dirname(path) {
  const text = String(path || "").replace(/[\\/]+$/, "");
  const index = Math.max(text.lastIndexOf("\\"), text.lastIndexOf("/"));
  return index >= 0 ? text.slice(0, index) : "";
}

function nativePresetFolderFromMapFolder(mapFolder, kind, deps) {
  const folder = String(mapFolder || "");
  if (!deps.isAbsoluteFsPath(folder)) return "";
  const assetsRoot = dirname(folder);
  if (!assetsRoot) return "";
  const presetsRoot = deps.joinFsPath(assetsRoot, "presets");
  return deps.joinFsPath(presetsRoot, kind);
}

function storageKey(kind) {
  return `terrain.modulePresets.${kind}`;
}

export function createModulePresetRuntime(deps) {
  const state = {
    index: normalizeIndex(deps.kind, null),
    localEntries: new Map(),
    localPresets: new Map(),
    loaded: false,
  };

  function setStatus(text) {
    if (typeof deps.setStatus === "function") deps.setStatus(text);
  }

  function setInputValue(value) {
    if (deps.nameInput) deps.nameInput.value = value;
  }

  function selectedEntry() {
    if (!deps.select) return null;
    return state.index.presets.find((entry) => entry.id === deps.select.value) || null;
  }

  function refreshDropdown() {
    if (!deps.select) return;
    const previous = deps.select.value;
    deps.select.innerHTML = "";
    if (state.index.presets.length === 0) {
      const option = deps.document.createElement("option");
      option.value = "";
      option.textContent = "No presets";
      deps.select.appendChild(option);
      deps.select.disabled = true;
      return;
    }
    deps.select.disabled = false;
    for (const entry of state.index.presets) {
      const option = deps.document.createElement("option");
      option.value = entry.id;
      option.textContent = entry.label || entry.id;
      deps.select.appendChild(option);
    }
    if (state.index.presets.some((entry) => entry.id === previous)) {
      deps.select.value = previous;
    }
    const entry = selectedEntry();
    if (entry) setInputValue(entry.label || entry.id);
  }

  async function loadJson(path) {
    return deps.loadJson(path);
  }

  async function loadIndex() {
    let assetIndex = normalizeIndex(deps.kind, null);
    try {
      const rawData = await loadJson(`${deps.basePath}/index.json`);
      assetIndex = normalizeIndex(deps.kind, rawData);
      state.loaded = true;
    } catch {
      state.loaded = false;
    }
    state.index = mergeIndexes(deps.kind, assetIndex, loadLocalPresetIndex());
    refreshDropdown();
  }

  async function loadPresetFile(entry) {
    if (state.localPresets.has(entry.id)) {
      return state.localPresets.get(entry.id);
    }
    const candidates = [
      entry.file,
      `${deps.kind}-${entry.file}`,
      `${entry.id}.json`,
      `${deps.kind}-${entry.id}.json`,
    ];
    let lastError = null;
    for (const file of candidates) {
      try {
        return await loadJson(`${deps.basePath}/${file}`);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error(`Preset file not found for ${entry.id}`);
  }

  function extractPresetSettings(preset) {
    if (!preset || typeof preset !== "object") return null;
    if (preset.settings && typeof preset.settings === "object") {
      return preset.settings;
    }
    return preset;
  }

  function loadLocalPresetIndex() {
    state.localEntries.clear();
    state.localPresets.clear();
    if (!deps.storage || typeof deps.storage.getItem !== "function") {
      return normalizeIndex(deps.kind, null);
    }
    try {
      const rawText = deps.storage.getItem(storageKey(deps.kind));
      const rawData = rawText ? JSON.parse(rawText) : null;
      const source = rawData && typeof rawData === "object" ? rawData : {};
      const items = Array.isArray(source.presets) ? source.presets : [];
      const entries = [];
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const id = slugifyPresetId(item.id || item.file || item.label);
        const file = String(item.file || `${id}.json`);
        const label = String(item.label || item.id || id);
        const preset = item.preset && typeof item.preset === "object" ? item.preset : null;
        if (!preset) continue;
        const entry = { id, label, file };
        entries.push(entry);
        state.localEntries.set(id, entry);
        state.localPresets.set(id, preset);
      }
      return { version: 1, kind: deps.kind, presets: entries };
    } catch (error) {
      console.warn(`Failed to load local ${deps.label} presets`, error);
      return normalizeIndex(deps.kind, null);
    }
  }

  function saveLocalPreset(entry, preset) {
    if (!deps.storage || typeof deps.storage.setItem !== "function") return;
    state.localEntries.set(entry.id, entry);
    state.localPresets.set(entry.id, preset);
    const presets = [...state.localEntries.values()]
      .sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id)))
      .map((item) => ({
        ...item,
        preset: state.localPresets.get(item.id),
      }));
    try {
      deps.storage.setItem(storageKey(deps.kind), JSON.stringify({
        version: 1,
        kind: deps.kind,
        presets,
      }));
    } catch (error) {
      console.warn(`Failed to save local ${deps.label} preset`, error);
    }
  }

  async function applySelectedPreset() {
    const entry = selectedEntry();
    if (!entry) {
      setStatus(`No ${deps.label} preset selected.`);
      return;
    }
    try {
      const preset = await loadPresetFile(entry);
      const settings = extractPresetSettings(preset);
      if (!settings || (preset.kind && preset.kind !== deps.kind)) {
        throw new Error(`Invalid ${deps.label} preset: ${entry.file}`);
      }
      deps.applySettings(settings);
      setInputValue(preset.label || entry.label || entry.id);
      setStatus(`Applied ${deps.label} preset "${preset.label || entry.label || entry.id}".`);
    } catch (error) {
      console.warn(`Failed to apply ${deps.label} preset`, error);
      setStatus(`Failed to apply ${deps.label} preset "${entry.label || entry.id}".`);
    }
  }

  function upsertIndexEntry(entry) {
    const next = normalizeIndex(deps.kind, state.index);
    const index = next.presets.findIndex((item) => item.id === entry.id);
    if (index >= 0) {
      next.presets[index] = entry;
    } else {
      next.presets.push(entry);
    }
    state.index = next;
  }

  async function saveJsonFiles(files) {
    const mapFolder = deps.getCurrentMapFolderPath();
    const presetFolder = nativePresetFolderFromMapFolder(mapFolder, deps.kind, deps);
    if (deps.tauriInvoke && presetFolder) {
      for (const [fileName, text] of Object.entries(files)) {
        await deps.invokeTauri("save_json_file", {
          path: deps.joinFsPath(presetFolder, fileName),
          content: text,
        });
      }
      return "native";
    }
    if (typeof deps.showDirectoryPicker === "function") {
      const dir = await deps.showDirectoryPicker({
        mode: "readwrite",
        startIn: "documents",
      });
      for (const [fileName, text] of Object.entries(files)) {
        const handle = await dir.getFileHandle(fileName, { create: true });
        const writable = await handle.createWritable();
        await writable.write(text);
        await writable.close();
      }
      return "directory";
    }
    for (const [fileName, text] of Object.entries(files)) {
      deps.downloadTextFile(`${deps.kind}-${fileName}`, text);
    }
    return "download";
  }

  async function saveCurrentPreset() {
    const rawName = deps.nameInput ? deps.nameInput.value : "";
    const id = slugifyPresetId(rawName || (selectedEntry() && selectedEntry().id));
    const label = labelFromInput(rawName, id);
    const existing = state.index.presets.find((entry) => entry.id === id);
    const message = existing
      ? `Preset "${id}" already exists. Overwrite it?`
      : `Save current ${deps.label} settings as preset "${id}"?`;
    if (!deps.confirm(message)) {
      setStatus("Preset save canceled.");
      return;
    }

    const file = `${id}.json`;
    const entry = { id, label, file };
    const preset = {
      version: 1,
      kind: deps.kind,
      id,
      label,
      settings: deps.serializeSettings(),
    };
    const indexWithEntry = {
      ...state.index,
      presets: [
        ...state.index.presets.filter((item) => item.id !== id),
        entry,
      ].sort((a, b) => String(a.label || a.id).localeCompare(String(b.label || b.id))),
    };
    const files = {
      [file]: `${JSON.stringify(preset, null, 2)}\n`,
      "index.json": `${JSON.stringify(indexWithEntry, null, 2)}\n`,
    };

    try {
      const mode = await saveJsonFiles(files);
      saveLocalPreset(entry, preset);
      upsertIndexEntry(entry);
      refreshDropdown();
      if (deps.select) deps.select.value = id;
      setInputValue(label);
      setStatus(
        mode === "native"
          ? `Saved ${deps.label} preset "${id}".`
          : mode === "directory"
            ? `Saved ${deps.label} preset "${id}" to selected folder and local browser presets.`
            : `Saved ${deps.label} preset "${id}" locally and downloaded export files.`,
      );
    } catch (error) {
      console.warn(`Failed to save ${deps.label} preset`, error);
      setStatus(`Failed to save ${deps.label} preset "${id}".`);
    }
  }

  function bind() {
    if (deps.select) {
      deps.select.addEventListener("change", () => {
        const entry = selectedEntry();
        if (entry) setInputValue(entry.label || entry.id);
      });
    }
    if (deps.applyButton) deps.applyButton.addEventListener("click", () => applySelectedPreset());
    if (deps.saveButton) deps.saveButton.addEventListener("click", () => saveCurrentPreset());
  }

  bind();
  loadIndex();

  return {
    applySelectedPreset,
    loadIndex,
    saveCurrentPreset,
  };
}
