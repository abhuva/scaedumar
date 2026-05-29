import test from "node:test";
import assert from "node:assert/strict";

import { createResourceDebugPanelRuntime } from "../src/ui/resourceDebugPanelRuntime.js";

function createInput(value = "") {
  return {
    value,
    textContent: "",
    addEventListener() {},
  };
}

test("resource debug route sync tolerates missing route settings", () => {
  const routeArrowColorInput = createInput();
  const routeDebugOverlayModeInput = createInput();
  const routeArrowSpacingInput = createInput();
  const routeArrowSpacingValue = createInput();

  assert.doesNotThrow(() => {
    const runtime = createResourceDebugPanelRuntime({
      getSettings: () => ({}),
      getRouteSettings: () => null,
      routeArrowColorInput,
      routeDebugOverlayModeInput,
      routeArrowSpacingInput,
      routeArrowSpacingValue,
    });
    runtime.syncRoute();
  });

  assert.equal(routeArrowColorInput.value, "#ffffff");
  assert.equal(routeDebugOverlayModeInput.value, "none");
  assert.equal(routeArrowSpacingInput.value, "");
  assert.equal(routeArrowSpacingValue.textContent, "0");
});
