import { bindCanvasControls } from "./bindings/canvasBinding.js";
import { bindPathfindingControls } from "./bindings/pathfindingBinding.js";
import { bindSwarmPanelControls } from "./bindings/swarmPanelBinding.js";
import { bindSwarmFollowControls } from "./bindings/swarmFollowBinding.js";
import { bindTopicPanelControls } from "./bindings/topicPanelBinding.js";
import { bindInteractionAndCycleControls } from "./bindings/interactionBinding.js";
import { bindCursorLightControls } from "./bindings/cursorLightBinding.js";
import { bindPointLightEditorControls } from "./bindings/pointLightEditorBinding.js";
import { bindRenderFxControls } from "./bindings/renderFxBinding.js";
import { bindMapIoControls } from "./bindings/mapIoBinding.js";
import { bindRuntimeControls } from "./bindings/runtimeBinding.js";

export function setupMainBindingsRuntime(deps) {
  bindCanvasControls(deps.canvasBinding);
  bindPathfindingControls(deps.pathfindingBinding);
  bindSwarmPanelControls(deps.swarmPanelBinding);
  bindSwarmFollowControls(deps.swarmFollowBinding);
  bindTopicPanelControls(deps.topicPanelBinding);
  bindInteractionAndCycleControls(deps.interactionCycleBinding);
  bindCursorLightControls(deps.cursorLightBinding);
  bindPointLightEditorControls(deps.pointLightEditorBinding);
  bindRenderFxControls(deps.renderFxBinding);
  bindMapIoControls(deps.mapIoBinding);
  bindRuntimeControls(deps.runtimeBinding);
}
