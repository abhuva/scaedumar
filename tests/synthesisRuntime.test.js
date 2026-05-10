import test from "node:test";
import assert from "node:assert/strict";
import { createSynthesisRuntime, normalizeSynthesisSettings } from "../src/audio/synthesisRuntime.js";

test("normalizeSynthesisSettings stamps missing oscillator ids once", () => {
  const raw = { oscillators: [{ frequency: 220 }, { id: "explicit", frequency: 330 }] };
  const first = normalizeSynthesisSettings(raw);
  const second = normalizeSynthesisSettings(raw);
  assert.ok(first.oscillators[0].id.startsWith("osc-"));
  assert.equal(first.oscillators[0].id, second.oscillators[0].id);
  assert.equal(second.oscillators[1].id, "explicit");
});

test("stopLive uses an injected timer without requiring window", () => {
  const runtime = createSynthesisRuntime();
  const calls = [];
  const node = {
    id: "osc-a",
    releaseSec: 0.1,
    source: {
      stop: (time) => calls.push(["stop", time]),
      disconnect: () => calls.push(["source-disconnect"]),
    },
    gain: {
      gain: {
        value: 0.5,
        cancelScheduledValues: (time) => calls.push(["cancel", time]),
        setValueAtTime: (value, time) => calls.push(["set", value, time]),
        setTargetAtTime: (value, time) => calls.push(["target", value, time]),
      },
      disconnect: () => calls.push(["gain-disconnect"]),
    },
  };
  const state = { synthesisNodes: [node] };
  runtime.stopLive(state, {
    audioContext: { currentTime: 2 },
    deps: {
      setTimeout: (callback, delay) => {
        calls.push(["timer", delay]);
        callback();
      },
    },
  });
  assert.equal(state.synthesisNodes.length, 0);
  assert.ok(calls.some(([kind]) => kind === "timer"));
  assert.ok(calls.some(([kind]) => kind === "source-disconnect"));
});
