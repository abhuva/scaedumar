import { getRdAgentsPanelHtml } from "./panels/agentsPanelHtml.js";
import { getRdAudioPanelHtml } from "./panels/audioPanelHtml.js";
import { getRdKnowledgePanelHtml } from "./panels/knowledgePanelHtml.js";
import { getRdEventsPanelHtml } from "./panels/eventsPanelHtml.js";
import { getRdIoPanelHtml } from "./panels/ioPanelHtml.js";
import { getRdPathingPanelHtml } from "./panels/pathingPanelHtml.js";
import { getRdSpritesPanelHtml } from "./panels/spritesPanelHtml.js";
import { getRdTerrainPanelHtml } from "./panels/terrainPanelHtml.js";
import { getRdTrailPanelHtml } from "./panels/trailPanelHtml.js";
import { getRdOverlayRailHtml } from "./overlayRailHtml.js";

function replaceHostWithMarkup(hostId, getMarkup) {
  const host = document.getElementById(hostId);
  if (!host) {
    throw new Error(`Missing RD panel host element: ${hostId}`);
  }
  host.outerHTML = getMarkup();
}

export function injectResourceDebugMarkup() {
  replaceHostWithMarkup("rdOverlayRailHost", getRdOverlayRailHtml);
  replaceHostWithMarkup("rdDevTerrainPanelHost", getRdTerrainPanelHtml);
  replaceHostWithMarkup("rdDevAgentsPanelHost", getRdAgentsPanelHtml);
  replaceHostWithMarkup("rdDevTrailPanelHost", getRdTrailPanelHtml);
  replaceHostWithMarkup("rdDevKnowledgePanelHost", getRdKnowledgePanelHtml);
  replaceHostWithMarkup("rdDevSpritesPanelHost", getRdSpritesPanelHtml);
  replaceHostWithMarkup("rdDevEventsPanelHost", getRdEventsPanelHtml);
  replaceHostWithMarkup("rdDevAudioPanelHost", getRdAudioPanelHtml);
  replaceHostWithMarkup("rdDevPathingPanelHost", getRdPathingPanelHtml);
  replaceHostWithMarkup("rdDevIoPanelHost", getRdIoPanelHtml);
}
