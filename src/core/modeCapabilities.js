const FULL_CAPABILITIES = {
  topics: ["map", "interaction", "swarm", "lighting", "parallax", "fog", "clouds", "water", "editor", "info"],
  interactionModes: ["none", "lighting", "pathfinding"],
  overlays: ["pathPreview", "pointLights", "cursorLight", "swarmStats"],
};

const MODE_CAPABILITIES = {
  dev: FULL_CAPABILITIES,
  gameplay: {
    topics: ["map", "info"],
    interactionModes: ["none", "pathfinding"],
    overlays: ["pathPreview"],
  },
  hybrid: FULL_CAPABILITIES,
};

export function normalizeRuntimeMode(mode) {
  return mode === "gameplay" || mode === "hybrid" ? mode : "dev";
}

export function getModeCapabilities(mode) {
  return MODE_CAPABILITIES[normalizeRuntimeMode(mode)];
}

export function canUseTopic(mode, topic) {
  if (!topic) return false;
  return getModeCapabilities(mode).topics.includes(String(topic));
}

export function canUseInteractionMode(mode, interactionMode) {
  const normalized = interactionMode === "lighting" || interactionMode === "pathfinding" ? interactionMode : "none";
  return getModeCapabilities(mode).interactionModes.includes(normalized);
}

export function canUseOverlay(mode, overlay) {
  if (!overlay) return false;
  return getModeCapabilities(mode).overlays.includes(String(overlay));
}
