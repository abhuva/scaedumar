export const DEFAULT_AGENT_SPRITE_DEFINITION = Object.freeze({
  id: "agent",
  spriteSlot: 0,
  spriteSrc: "",
  slotWidth: 32,
  slotHeight: 32,
  visualWidthPx: 1,
  visualHeightPx: 1,
  pivotX: 0.5,
  pivotY: 0.5,
  offsetX: 0,
  offsetY: 0,
  directionCount: 1,
  rotateToVelocity: false,
  sourceForwardRadians: -Math.PI / 2,
  frameCount: 1,
  animationFps: 0,
  animationMode: "none",
  animationPhase: "none",
  baseScale: 1,
  maxHeightScale: 1.5,
  minHeight: 0,
  maxHeight: 100,
  layer: "ground",
  tint: "",
  opacity: 1,
  transparentColor: "",
  transparentColorTolerance: 0,
  palette: null,
});

function finiteOr(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function positive(value, fallback) {
  const num = finiteOr(value, fallback);
  return num > 0 ? num : fallback;
}

function normalizeDirectionCount(value) {
  const count = Math.round(finiteOr(value, 1));
  if (count === 4 || count === 8) return count;
  return 1;
}

function positiveInteger(value, fallback) {
  const num = Math.round(finiteOr(value, fallback));
  return num > 0 ? num : fallback;
}

function normalizeLutRefs(value) {
  if (!Array.isArray(value)) return [];
  const refs = [];
  for (const ref of value) {
    const source = ref && typeof ref === "object" ? ref : {};
    const hasExplicitWeight = Object.prototype.hasOwnProperty.call(source, "weight");
    const rare = source.rare === true;
    const normalizedWeight = Math.max(0, finiteOr(hasExplicitWeight ? source.weight : (rare ? 0.1 : 1), rare ? 0.1 : 1));
    const tags = Array.isArray(source.tags)
      ? [...new Set(source.tags.map((tag) => (typeof tag === "string" ? tag.trim() : "")).filter(Boolean))]
      : [];
    if (typeof source.id === "string" && source.id.trim()) {
      refs.push({ id: source.id.trim(), weight: normalizedWeight, rare, tags });
      continue;
    }
    const range = source.range && typeof source.range === "object" ? source.range : null;
    if (!range) continue;
    const family = typeof range.family === "string" ? range.family.trim() : "";
    const start = Math.max(0, Math.round(finiteOr(range.start, 0)));
    const count = Math.max(0, Math.round(finiteOr(range.count, 0)));
    if (family && count > 0) {
      refs.push({ range: { family, start, count }, weight: normalizedWeight, rare, tags });
    }
  }
  return refs;
}

function normalizePalette(value) {
  const source = value && typeof value === "object" ? value : null;
  if (!source || source.mode !== "grayscale-lut") return null;
  const allowedSelections = new Set(["stable-random"]);
  return {
    mode: "grayscale-lut",
    lutRefs: normalizeLutRefs(source.lutRefs),
    selection: allowedSelections.has(source.selection) ? source.selection : "stable-random",
  };
}

export function normalizeAgentSpriteDefinition(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const id = typeof source.id === "string" && source.id.trim()
    ? source.id.trim()
    : DEFAULT_AGENT_SPRITE_DEFINITION.id;
  const minHeight = finiteOr(source.minHeight, DEFAULT_AGENT_SPRITE_DEFINITION.minHeight);
  const maxHeight = Math.max(minHeight, finiteOr(source.maxHeight, DEFAULT_AGENT_SPRITE_DEFINITION.maxHeight));
  return {
    id,
    spriteSlot: Math.max(0, Math.round(finiteOr(source.spriteSlot, DEFAULT_AGENT_SPRITE_DEFINITION.spriteSlot))),
    spriteSrc: typeof source.spriteSrc === "string" ? source.spriteSrc.trim() : "",
    slotWidth: positiveInteger(source.slotWidth, DEFAULT_AGENT_SPRITE_DEFINITION.slotWidth),
    slotHeight: positiveInteger(source.slotHeight, DEFAULT_AGENT_SPRITE_DEFINITION.slotHeight),
    visualWidthPx: positive(source.visualWidthPx, DEFAULT_AGENT_SPRITE_DEFINITION.visualWidthPx),
    visualHeightPx: positive(source.visualHeightPx, DEFAULT_AGENT_SPRITE_DEFINITION.visualHeightPx),
    pivotX: clamp(finiteOr(source.pivotX, DEFAULT_AGENT_SPRITE_DEFINITION.pivotX), 0, 1),
    pivotY: clamp(finiteOr(source.pivotY, DEFAULT_AGENT_SPRITE_DEFINITION.pivotY), 0, 1),
    offsetX: finiteOr(source.offsetX, DEFAULT_AGENT_SPRITE_DEFINITION.offsetX),
    offsetY: finiteOr(source.offsetY, DEFAULT_AGENT_SPRITE_DEFINITION.offsetY),
    directionCount: normalizeDirectionCount(source.directionCount),
    rotateToVelocity: source.rotateToVelocity === true,
    sourceForwardRadians: finiteOr(source.sourceForwardRadians, DEFAULT_AGENT_SPRITE_DEFINITION.sourceForwardRadians),
    frameCount: positiveInteger(source.frameCount, DEFAULT_AGENT_SPRITE_DEFINITION.frameCount),
    animationFps: Math.max(0, finiteOr(source.animationFps, DEFAULT_AGENT_SPRITE_DEFINITION.animationFps)),
    animationMode: source.animationMode === "renderTime" ? "renderTime" : DEFAULT_AGENT_SPRITE_DEFINITION.animationMode,
    animationPhase: source.animationPhase === "stableId" ? "stableId" : DEFAULT_AGENT_SPRITE_DEFINITION.animationPhase,
    baseScale: positive(source.baseScale, DEFAULT_AGENT_SPRITE_DEFINITION.baseScale),
    maxHeightScale: positive(source.maxHeightScale, DEFAULT_AGENT_SPRITE_DEFINITION.maxHeightScale),
    minHeight,
    maxHeight,
    layer: source.layer === "flying" ? "flying" : "ground",
    tint: typeof source.tint === "string" ? source.tint : "",
    opacity: clamp(finiteOr(source.opacity, DEFAULT_AGENT_SPRITE_DEFINITION.opacity), 0, 1),
    transparentColor: typeof source.transparentColor === "string" ? source.transparentColor.trim() : "",
    transparentColorTolerance: Math.max(0, Math.round(finiteOr(source.transparentColorTolerance, 0))),
    palette: normalizePalette(source.palette),
  };
}

export function resolveDirectionIndex(input = {}) {
  const directionCount = normalizeDirectionCount(input.directionCount);
  if (directionCount <= 1) return 0;
  const vx = finiteOr(input.vx, 0);
  const vy = finiteOr(input.vy, 0);
  const speedSq = vx * vx + vy * vy;
  if (speedSq <= 0.000001) {
    return Math.max(0, Math.min(directionCount - 1, Math.round(finiteOr(input.fallbackIndex, 0))));
  }
  const fullTurn = Math.PI * 2;
  const angle = (Math.atan2(vy, vx) + fullTurn) % fullTurn;
  return Math.round(angle / (fullTurn / directionCount)) % directionCount;
}

export function resolveRotationRadians(input = {}) {
  const fallback = finiteOr(input.fallbackRotationRadians, finiteOr(input.rotationRadians, 0));
  if (input.rotateToVelocity !== true) return fallback;
  const vx = finiteOr(input.vx, 0);
  const vy = finiteOr(input.vy, 0);
  const speedSq = vx * vx + vy * vy;
  if (speedSq <= 0.000001) return fallback;
  const movementAngle = Math.atan2(vy, vx);
  return movementAngle - finiteOr(input.sourceForwardRadians, DEFAULT_AGENT_SPRITE_DEFINITION.sourceForwardRadians);
}

export function resolveHeightScale(input = {}) {
  const baseScale = positive(input.baseScale, DEFAULT_AGENT_SPRITE_DEFINITION.baseScale);
  const maxHeightScale = positive(input.maxHeightScale, DEFAULT_AGENT_SPRITE_DEFINITION.maxHeightScale);
  const minHeight = finiteOr(input.minHeight, DEFAULT_AGENT_SPRITE_DEFINITION.minHeight);
  const maxHeight = finiteOr(input.maxHeight, DEFAULT_AGENT_SPRITE_DEFINITION.maxHeight);
  const height = finiteOr(input.height, minHeight);
  const span = Math.max(0.000001, maxHeight - minHeight);
  const t = clamp((height - minHeight) / span, 0, 1);
  return baseScale + ((maxHeightScale - baseScale) * t);
}

function hashStableUnit(value) {
  const text = String(value ?? "");
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000000) / 1000000;
}

export function resolveAnimationFrameIndex(input = {}) {
  const frameCount = positiveInteger(input.frameCount, DEFAULT_AGENT_SPRITE_DEFINITION.frameCount);
  if (frameCount <= 1) return 0;
  if (input.animationMode !== "renderTime") return 0;
  const fps = finiteOr(input.animationFps, 0);
  if (fps <= 0) return 0;
  const timeSec = Math.max(0, finiteOr(input.renderTimeSec, 0));
  const phase = input.animationPhase === "stableId"
    ? hashStableUnit(input.phaseSeed) * frameCount
    : 0;
  return Math.floor((timeSec * fps) + phase) % frameCount;
}

export function resolveAgentVisualBounds(input = {}) {
  const x = finiteOr(input.x, 0);
  const y = finiteOr(input.y, 0);
  const scale = positive(input.scale, 1);
  const width = positive(input.visualWidthPx, DEFAULT_AGENT_SPRITE_DEFINITION.visualWidthPx) * scale;
  const height = positive(input.visualHeightPx, DEFAULT_AGENT_SPRITE_DEFINITION.visualHeightPx) * scale;
  const pivotX = clamp(finiteOr(input.pivotX, DEFAULT_AGENT_SPRITE_DEFINITION.pivotX), 0, 1);
  const pivotY = clamp(finiteOr(input.pivotY, DEFAULT_AGENT_SPRITE_DEFINITION.pivotY), 0, 1);
  return {
    x: x + finiteOr(input.offsetX, 0) - (width * pivotX),
    y: y + finiteOr(input.offsetY, 0) - (height * pivotY),
    width,
    height,
  };
}

export function buildAgentSpriteRenderItem(agent = {}, definitionInput = {}, options = {}) {
  const definition = normalizeAgentSpriteDefinition(definitionInput);
  const directionIndex = resolveDirectionIndex({
    vx: agent.vx,
    vy: agent.vy,
    directionCount: definition.directionCount,
    fallbackIndex: agent.directionIndex ?? options.fallbackDirectionIndex,
  });
  const heightScale = resolveHeightScale({
    height: agent.z ?? agent.height,
    minHeight: definition.minHeight,
    maxHeight: definition.maxHeight,
    baseScale: definition.baseScale,
    maxHeightScale: definition.maxHeightScale,
  });
  const bounds = resolveAgentVisualBounds({
    x: agent.x,
    y: agent.y,
    visualWidthPx: definition.visualWidthPx,
    visualHeightPx: definition.visualHeightPx,
    scale: heightScale,
    pivotX: definition.pivotX,
    pivotY: definition.pivotY,
    offsetX: definition.offsetX,
    offsetY: definition.offsetY,
  });
  const rotationRadians = resolveRotationRadians({
    vx: agent.vx,
    vy: agent.vy,
    rotateToVelocity: definition.rotateToVelocity,
    sourceForwardRadians: definition.sourceForwardRadians,
    rotationRadians: agent.rotationRadians,
    fallbackRotationRadians: options.fallbackRotationRadians,
  });
  const animationFrameIndex = resolveAnimationFrameIndex({
    frameCount: definition.frameCount,
    animationFps: definition.animationFps,
    animationMode: definition.animationMode,
    animationPhase: definition.animationPhase,
    renderTimeSec: options.renderTimeSec,
    phaseSeed: agent.id,
  });
  const sourceFrameIndex = (directionIndex * definition.frameCount) + animationFrameIndex;
  const sourceFrameCount = definition.directionCount * definition.frameCount;
  const spriteSlot = definition.spriteSlot + sourceFrameIndex;
  return {
    id: typeof agent.id === "string" || typeof agent.id === "number" ? String(agent.id) : definition.id,
    owner: typeof agent.owner === "string" ? agent.owner : "agent",
    spriteId: definition.id,
    spriteSlot,
    spriteSrc: definition.spriteSrc,
    sourceSlotWidth: definition.slotWidth,
    sourceSlotHeight: definition.slotHeight,
    sourceFrameCount,
    sourceFrameIndex,
    transparentColor: definition.transparentColor,
    transparentColorTolerance: definition.transparentColorTolerance,
    animationFrameIndex,
    pixelX: bounds.x,
    pixelY: bounds.y,
    visualWidthPx: bounds.width,
    visualHeightPx: bounds.height,
    rotationOriginX: bounds.x + (bounds.width * definition.pivotX),
    rotationOriginY: bounds.y + (bounds.height * definition.pivotY),
    rotationRadians,
    directionIndex,
    heightScale,
    layer: definition.layer,
    tint: agent.tint || definition.tint,
    opacity: clamp(finiteOr(agent.opacity, definition.opacity), 0, 1),
    paletteMode: options.paletteRow >= 0 && definition.palette?.mode === "grayscale-lut" ? "grayscale-lut" : "none",
    paletteRow: options.paletteRow >= 0 ? Math.round(finiteOr(options.paletteRow, -1)) : -1,
  };
}
