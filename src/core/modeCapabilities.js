const FULL_CAPABILITIES = {
  topics: ["map", "interaction", "swarm", "lighting", "detail", "fog", "clouds", "water", "water-trails", "resource-debug", "editor", "info"],
  interactionModes: ["none", "lighting", "pathfinding", "routePlanning"],
  overlays: ["pathPreview", "routePlanning", "pointLights", "cursorLight", "swarmStats"],
};

const MODE_CAPABILITIES = {
  dev: FULL_CAPABILITIES,
  gameplay: {
    topics: ["resource-debug"],
    interactionModes: ["none", "lighting", "pathfinding", "routePlanning"],
    overlays: ["pathPreview", "routePlanning", "pointLights"],
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
  const normalized = interactionMode === "lighting" || interactionMode === "pathfinding" || interactionMode === "routePlanning"
    ? interactionMode
    : "none";
  return getModeCapabilities(mode).interactionModes.includes(normalized);
}

export function canUseOverlay(mode, overlay) {
  if (!overlay) return false;
  return getModeCapabilities(mode).overlays.includes(String(overlay));
}
