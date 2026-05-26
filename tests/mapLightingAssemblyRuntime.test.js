import test from "node:test";
import assert from "node:assert/strict";

import { createMapLightingAssemblyRuntimeDeps } from "../src/app/mapLightingAssemblyRuntime.js";

test("map lighting assembly forwards slime lifecycle dependencies", () => {
  const defaultSlimeSettings = { agentCount: 20000 };
  const applySlimeSettings = () => {};
  const serializeSlimeSettings = () => ({ agentCount: 1000 });

  const assembled = createMapLightingAssemblyRuntimeDeps({
    defaultSlimeSettings,
    applySlimeSettings,
    serializeSlimeSettings,
  });

  assert.equal(assembled.mapLifecycleSetup.defaultSlimeSettings, defaultSlimeSettings);
  assert.equal(assembled.mapLifecycleSetup.applySlimeSettings, applySlimeSettings);
  assert.equal(assembled.mapLifecycleSetup.serializeSlimeSettings, serializeSlimeSettings);
});
