import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createTimeLightingSetupRuntime } from "../src/sim/timeLightingSetupRuntime.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function readRepoFile(relPath) {
  return fs.readFileSync(path.join(repoRoot, relPath), "utf8");
}

test("command modules do not directly mutate store via ctx.store.update", () => {
  const commandModules = [
    "src/core/registerMainCommands.js",
    "src/gameplay/interactionCommands.js",
  ];
  for (const relPath of commandModules) {
    const src = readRepoFile(relPath);
    assert.equal(
      src.includes("ctx.store.update("),
      false,
      `unexpected direct store mutation found in ${relPath}`,
    );
  }
});

test("migrated gameplay helper modules do not directly call store.update", () => {
  const migratedGameplayHelpers = [
    "src/gameplay/interactionModeController.js",
    "src/gameplay/playerRuntimeBinding.js",
    "src/gameplay/movementStoreSyncRuntime.js",
    "src/gameplay/swarmFollowRuntimeState.js",
  ];
  for (const relPath of migratedGameplayHelpers) {
    const src = readRepoFile(relPath);
    const forbidden = /\bstore\.update\(/;
    assert.equal(
      forbidden.test(src),
      false,
      `unexpected direct store mutation found in ${relPath}`,
    );
  }
});

test("active runtime source does not reintroduce migration-era bridge or legacy naming", () => {
  const forbiddenPatterns = [
    /settingsBridgeRuntime/,
    /settingsLegacyBindings/,
    /getLegacyBindings/,
  ];
  const srcDir = path.join(repoRoot, "src");
  const pending = [srcDir];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(fullPath);
        continue;
      }
      if (!entry.name.endsWith(".js")) continue;
      const relPath = path.relative(repoRoot, fullPath).replaceAll("\\", "/");
      const src = fs.readFileSync(fullPath, "utf8");
      for (const pattern of forbiddenPatterns) {
        const match = src.match(pattern);
        assert.equal(match, null, `migration-era naming ${pattern} found in ${relPath}: ${match ? match[0] : ""}`);
      }
    }
  }
});

test("cycle hour state proxies core store accessors instead of owning local mutable time", () => {
  let coreCycleHour = 9.5;
  const runtime = createTimeLightingSetupRuntime({
    initialHour: 0,
    getCycleHour: () => coreCycleHour,
    setCycleHour: (value) => {
      coreCycleHour = value;
    },
    getSettingsDefaults: (_, fallback) => fallback,
    defaultLightingSettings: {},
    defaultFogSettings: {},
    sampleSunAtHour: () => ({
      azimuthDeg: 0,
      altitudeDeg: 45,
      ambientScale: 1,
      ambientColor: [1, 1, 1],
      sunColor: [1, 1, 1],
    }),
    wrapHour: (value) => value,
    clamp: (value, min, max) => Math.min(max, Math.max(min, Number(value))),
    smoothstep: () => 1,
    lerpVec3: (a) => a,
    getFogColorManual: () => false,
    rgbToHex: () => "#ffffff",
    hexToRgb01: () => [1, 1, 1],
    zoomMin: 0.5,
    zoomMax: 32,
    cycleHourInput: { value: "" },
    cycleHourValue: { textContent: "" },
    formatHour: String,
  });

  assert.equal(runtime.cycleState.hour, 9.5);
  runtime.cycleState.hour = 25;
  assert.equal(coreCycleHour, 24);
  runtime.cycleState.hour = 12.5;
  assert.equal(coreCycleHour, 12.5);
  runtime.cycleState.hour = -1;
  assert.equal(coreCycleHour, 0);
  coreCycleHour = 6.25;
  assert.equal(runtime.cycleState.hour, 6.25);
});
