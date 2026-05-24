import test from "node:test";
import assert from "node:assert/strict";

import {
  bindDesktopWindowControls,
  resolveTauriWindow,
  toggleTauriFullscreen,
} from "../src/ui/bindings/desktopWindowBinding.js";

function createFakeWindow(appWindow = null) {
  const listeners = new Map();
  return {
    __TAURI__: appWindow ? { window: { getCurrentWindow: () => appWindow } } : null,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    dispatch(type, event) {
      const listener = listeners.get(type);
      if (listener) listener(event);
    },
  };
}

test("resolveTauriWindow uses the current Tauri window when available", () => {
  const appWindow = {};
  const win = createFakeWindow(appWindow);
  assert.equal(resolveTauriWindow(win), appWindow);
  assert.equal(resolveTauriWindow({}), null);
});

test("toggleTauriFullscreen flips native fullscreen state", async () => {
  let fullscreen = false;
  const appWindow = {
    async isFullscreen() {
      return fullscreen;
    },
    async setFullscreen(next) {
      fullscreen = next;
    },
  };

  assert.equal(await toggleTauriFullscreen(createFakeWindow(appWindow)), true);
  assert.equal(fullscreen, true);
  assert.equal(await toggleTauriFullscreen(createFakeWindow(appWindow)), true);
  assert.equal(fullscreen, false);
});

test("bindDesktopWindowControls handles F11 and leaves browser runtime alone", async () => {
  let fullscreen = false;
  let prevented = false;
  const appWindow = {
    async isFullscreen() {
      return fullscreen;
    },
    async setFullscreen(next) {
      fullscreen = next;
    },
  };
  const win = createFakeWindow(appWindow);
  bindDesktopWindowControls({ windowEl: win });
  win.dispatch("keydown", {
    key: "F11",
    preventDefault() {
      prevented = true;
    },
  });
  await Promise.resolve();
  assert.equal(prevented, true);
  assert.equal(fullscreen, true);

  let browserPrevented = false;
  const browserWin = createFakeWindow(null);
  bindDesktopWindowControls({ windowEl: browserWin });
  browserWin.dispatch("keydown", {
    key: "F11",
    preventDefault() {
      browserPrevented = true;
    },
  });
  await Promise.resolve();
  assert.equal(browserPrevented, false);
});
