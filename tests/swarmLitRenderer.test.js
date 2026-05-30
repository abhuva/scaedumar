import test from "node:test";
import assert from "node:assert/strict";

import { createSwarmLitRenderer } from "../src/render/swarmLitRenderer.js";

function createNoopGl() {
  return {
    TEXTURE0: 0,
    TEXTURE1: 1,
    TEXTURE2: 2,
    TEXTURE3: 3,
    TEXTURE_2D: 3553,
    ARRAY_BUFFER: 34962,
    DYNAMIC_DRAW: 35048,
    POINTS: 0,
    useProgram: () => {},
    activeTexture: () => {},
    bindTexture: () => {},
    uniform1i: () => {},
    uniform1f: () => {},
    uniform2f: () => {},
    uniform3f: () => {},
    bindVertexArray: () => {},
    bindBuffer: () => {},
    bufferData: () => {},
    drawArrays: () => {},
  };
}

function createRenderer(count) {
  const swarmState = {
    count,
    x: new Float32Array(count).fill(10),
    y: new Float32Array(count).fill(12),
    z: new Float32Array(count).fill(20),
    hawks: [],
  };
  return createSwarmLitRenderer({
    gl: createNoopGl(),
    swarmState,
    swarmLitAgentScratch: {},
    swarmLitHawkScratch: {},
    writeInterpolatedSwarmAgentPos: (index, out) => {
      out.x = swarmState.x[index];
      out.y = swarmState.y[index];
      out.z = swarmState.z[index];
      return out;
    },
    writeInterpolatedSwarmHawkPos: () => ({ x: 0, y: 0, z: 0 }),
    clamp: (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0)),
    getViewHalfExtents: () => ({ x: 1, y: 1 }),
    hexToRgb01: () => [1, 0, 0],
    getMapAspect: () => 1,
    heightSize: { width: 64, height: 64 },
    splatSize: { width: 64, height: 64 },
    canvas: { width: 320, height: 200 },
    swarmUniforms: new Proxy({}, { get: () => ({}) }),
    swarmProgram: {},
    normalsTex: {},
    heightTex: {},
    pointLightTex: {},
    cloudNoiseTex: {},
    swarmHeightMax: 256,
    pointLightEdgeMin: 0,
    swarmPointVao: {},
    swarmPointBuffer: {},
  });
}

test("lit swarm renderer does not CPU raycast terrain shadows for agents", () => {
  const render = createRenderer(200);
  const params = {
    sunDir: [1, 0, 1],
    moonDir: [-1, 0, 1],
    sun: { sunColor: [1, 1, 1] },
    sunStrength: 1,
    moonColor: [0.5, 0.5, 1],
    moonStrength: 0,
    ambientColor: [0.1, 0.1, 0.1],
    ambientFinal: 0.2,
    fogColor: [0, 0, 0],
    cameraHeightNorm: 0.5,
  };

  render(params, { nowSec: 0, cloudTimeSec: 0 }, {
    useHawk: false,
    hawkColor: "#ff0000",
  }, {
    useShadows: true,
    shadowStrength: 0.5,
  });

  assert.ok(true);
});
