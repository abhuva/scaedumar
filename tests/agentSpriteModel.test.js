import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAgentSpriteRenderItem,
  normalizeAgentSpriteDefinition,
  resolveAgentVisualBounds,
  resolveAnimationFrameIndex,
  resolveDirectionIndex,
  resolveHeightScale,
  resolveRotationRadians,
} from "../src/gameplay/agentSpriteModel.js";

test("normalizes agent sprite definitions with bounded defaults", () => {
  const definition = normalizeAgentSpriteDefinition({
    id: " bird ",
    spriteSlot: 2.4,
    slotWidth: 64,
    slotHeight: 48,
    visualWidthPx: 0,
    visualHeightPx: 3,
    pivotX: -1,
    pivotY: 2,
    directionCount: 6,
    opacity: 2,
    layer: "flying",
    rotateToVelocity: true,
    sourceForwardRadians: 0.25,
    frameCount: 3,
    animationFps: 12,
    animationMode: "renderTime",
    animationPhase: "stableId",
    transparentColor: "#ffffff",
    transparentColorTolerance: 0,
  });

  assert.equal(definition.id, "bird");
  assert.equal(definition.spriteSlot, 2);
  assert.equal(definition.slotWidth, 64);
  assert.equal(definition.slotHeight, 48);
  assert.equal(definition.visualWidthPx, 1);
  assert.equal(definition.visualHeightPx, 3);
  assert.equal(definition.pivotX, 0);
  assert.equal(definition.pivotY, 1);
  assert.equal(definition.directionCount, 1);
  assert.equal(definition.rotateToVelocity, true);
  assert.equal(definition.sourceForwardRadians, 0.25);
  assert.equal(definition.frameCount, 3);
  assert.equal(definition.animationFps, 12);
  assert.equal(definition.animationMode, "renderTime");
  assert.equal(definition.animationPhase, "stableId");
  assert.equal(definition.transparentColor, "#ffffff");
  assert.equal(definition.transparentColorTolerance, 0);
  assert.equal(definition.opacity, 1);
  assert.equal(definition.layer, "flying");
});

test("direction quantization is deterministic for cardinal and eight-way sprites", () => {
  assert.equal(resolveDirectionIndex({ vx: 1, vy: 0, directionCount: 4 }), 0);
  assert.equal(resolveDirectionIndex({ vx: 0, vy: 1, directionCount: 4 }), 1);
  assert.equal(resolveDirectionIndex({ vx: -1, vy: 0, directionCount: 4 }), 2);
  assert.equal(resolveDirectionIndex({ vx: 0, vy: -1, directionCount: 4 }), 3);
  assert.equal(resolveDirectionIndex({ vx: 1, vy: 1, directionCount: 8 }), 1);
  assert.equal(resolveDirectionIndex({ vx: -1, vy: -1, directionCount: 8 }), 5);
});

test("missing velocity keeps fallback direction", () => {
  assert.equal(resolveDirectionIndex({ vx: 0, vy: 0, directionCount: 8, fallbackIndex: 3 }), 3);
  assert.equal(resolveDirectionIndex({ directionCount: 8, fallbackIndex: 99 }), 7);
});

test("height scale clamps between base and max scale", () => {
  assert.equal(resolveHeightScale({ height: -10, minHeight: 0, maxHeight: 100, baseScale: 1, maxHeightScale: 1.5 }), 1);
  assert.equal(resolveHeightScale({ height: 50, minHeight: 0, maxHeight: 100, baseScale: 1, maxHeightScale: 1.5 }), 1.25);
  assert.equal(resolveHeightScale({ height: 200, minHeight: 0, maxHeight: 100, baseScale: 1, maxHeightScale: 1.5 }), 1.5);
});

test("rotation resolves from velocity and source forward orientation", () => {
  assert.equal(resolveRotationRadians({ vx: 1, vy: 0, rotateToVelocity: true, sourceForwardRadians: -Math.PI / 2 }), Math.PI / 2);
  assert.equal(resolveRotationRadians({ vx: 0, vy: 1, rotateToVelocity: true, sourceForwardRadians: -Math.PI / 2 }), Math.PI);
  assert.equal(resolveRotationRadians({ vx: 0, vy: 0, rotateToVelocity: true, fallbackRotationRadians: 0.75 }), 0.75);
  assert.equal(resolveRotationRadians({ vx: 1, vy: 0, rotateToVelocity: false, rotationRadians: 0.25 }), 0.25);
});

test("animation frame index supports arbitrary render-time frame counts", () => {
  assert.equal(resolveAnimationFrameIndex({
    frameCount: 3,
    animationFps: 2,
    animationMode: "renderTime",
    renderTimeSec: 1.4,
  }), 2);
  assert.equal(resolveAnimationFrameIndex({
    frameCount: 40,
    animationFps: 10,
    animationMode: "renderTime",
    renderTimeSec: 4.2,
  }), 2);
  assert.equal(resolveAnimationFrameIndex({
    frameCount: 6,
    animationFps: 0,
    animationMode: "renderTime",
    renderTimeSec: 10,
  }), 0);
});

test("visual bounds respect pivot, scale, and offsets", () => {
  assert.deepEqual(resolveAgentVisualBounds({
    x: 10,
    y: 20,
    visualWidthPx: 2,
    visualHeightPx: 4,
    scale: 2,
    pivotX: 0.5,
    pivotY: 1,
    offsetX: 1,
    offsetY: -2,
  }), {
    x: 9,
    y: 10,
    width: 4,
    height: 8,
  });
});

test("buildAgentSpriteRenderItem returns renderer-compatible data without gameplay footprint", () => {
  const item = buildAgentSpriteRenderItem(
    { id: 42, owner: "swarm", x: 10, y: 20, z: 50, vx: 0, vy: 1 },
    {
      id: "bird",
      spriteSlot: 10,
      spriteSrc: "assets/sprites/agents/default/bird.png",
      visualWidthPx: 2,
      visualHeightPx: 2,
      directionCount: 4,
      minHeight: 0,
      maxHeight: 100,
      baseScale: 1,
      maxHeightScale: 1.5,
      layer: "flying",
      rotateToVelocity: true,
      sourceForwardRadians: -Math.PI / 2,
      frameCount: 3,
      animationFps: 2,
      animationMode: "renderTime",
      animationPhase: "none",
      transparentColor: "#ffffff",
    },
    { renderTimeSec: 1.4 },
  );

  assert.equal(item.id, "42");
  assert.equal(item.owner, "swarm");
  assert.equal(item.spriteId, "bird");
  assert.equal(item.spriteSlot, 15);
  assert.equal(item.spriteSrc, "assets/sprites/agents/default/bird.png");
  assert.equal(item.sourceSlotWidth, 32);
  assert.equal(item.sourceSlotHeight, 32);
  assert.equal(item.sourceFrameCount, 12);
  assert.equal(item.sourceFrameIndex, 5);
  assert.equal(item.transparentColor, "#ffffff");
  assert.equal(item.transparentColorTolerance, 0);
  assert.equal(item.animationFrameIndex, 2);
  assert.equal(item.directionIndex, 1);
  assert.equal(item.rotationRadians, Math.PI);
  assert.equal(item.rotationOriginX, 10);
  assert.equal(item.rotationOriginY, 20);
  assert.equal(item.heightScale, 1.25);
  assert.equal(item.layer, "flying");
  assert.equal(item.pixelX, 8.75);
  assert.equal(item.pixelY, 18.75);
  assert.equal(item.visualWidthPx, 2.5);
  assert.equal(item.visualHeightPx, 2.5);
  assert.equal("gameplayFootprint" in item, false);
});
