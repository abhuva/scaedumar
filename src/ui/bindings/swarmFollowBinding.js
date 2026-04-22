export function bindSwarmFollowControls(deps) {
  deps.swarmFollowToggleBtn.addEventListener("click", () => {
    deps.dispatchCoreCommand({ type: "core/swarm/toggleFollow" });
  });

  deps.swarmFollowTargetInput.addEventListener("change", () => {
    deps.dispatchCoreCommand({
      type: "core/swarm/setFollowTarget",
      targetType: deps.swarmFollowTargetInput.value,
    });
  });
}
