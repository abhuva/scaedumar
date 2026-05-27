import test from "node:test";
import assert from "node:assert/strict";

import { createModulePresetRuntime } from "../src/ui/modulePresetRuntime.js";

function createSelect() {
  return {
    children: [],
    disabled: false,
    value: "",
    set innerHTML(_value) {
      this.children = [];
      this.value = "";
    },
    appendChild(option) {
      this.children.push(option);
      if (!this.value) this.value = option.value;
    },
    addEventListener() {},
  };
}

function createStorage() {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
  };
}

test("module presets persist saved browser presets in local storage", async () => {
  const storage = createStorage();
  const select = createSelect();
  const nameInput = { value: "Plant Eater" };
  const downloads = [];

  const runtime = createModulePresetRuntime({
    kind: "slime",
    label: "Slime",
    basePath: "assets/presets/slime",
    document: {
      createElement: () => ({ value: "", textContent: "" }),
    },
    select,
    nameInput,
    applyButton: null,
    saveButton: null,
    loadJson: async () => {
      throw new Error("asset index unavailable");
    },
    serializeSettings: () => ({ agentCount: 1200 }),
    applySettings: () => {},
    getCurrentMapFolderPath: () => "assets/map3/",
    tauriInvoke: null,
    isAbsoluteFsPath: () => false,
    joinFsPath: (...parts) => parts.join("/"),
    downloadTextFile: (fileName, text) => downloads.push([fileName, text]),
    storage,
    confirm: () => true,
    setStatus: () => {},
  });

  await runtime.loadIndex();
  await runtime.saveCurrentPreset();

  assert.equal(select.disabled, false);
  assert.equal(select.value, "plant-eater");
  assert.equal(select.children.some((option) => option.value === "plant-eater"), true);
  assert.equal(downloads.length, 2);

  const nextSelect = createSelect();
  const applied = [];
  const nextRuntime = createModulePresetRuntime({
    kind: "slime",
    label: "Slime",
    basePath: "assets/presets/slime",
    document: {
      createElement: () => ({ value: "", textContent: "" }),
    },
    select: nextSelect,
    nameInput: { value: "" },
    applyButton: null,
    saveButton: null,
    loadJson: async () => {
      throw new Error("asset index unavailable");
    },
    serializeSettings: () => ({}),
    applySettings: (settings) => applied.push(settings),
    getCurrentMapFolderPath: () => "assets/map3/",
    tauriInvoke: null,
    isAbsoluteFsPath: () => false,
    joinFsPath: (...parts) => parts.join("/"),
    downloadTextFile: () => {},
    storage,
    confirm: () => true,
    setStatus: () => {},
  });

  await nextRuntime.loadIndex();
  nextSelect.value = "plant-eater";
  await nextRuntime.applySelectedPreset();

  assert.equal(nextSelect.disabled, false);
  assert.equal(nextSelect.children.some((option) => option.value === "plant-eater"), true);
  assert.deepEqual(applied, [{ agentCount: 1200 }]);
});
