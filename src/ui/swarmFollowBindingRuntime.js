import { bindSwarmFollowControls } from "./bindings/swarmFollowBinding.js";

export function bindSwarmFollowRuntime(deps) {
  bindSwarmFollowControls({
    swarmFollowToggleBtn: deps.swarmFollowToggleBtn,
    swarmFollowTargetInput: deps.swarmFollowTargetInput,
    dispatchCoreCommand: deps.dispatchCoreCommand,
  });
}
