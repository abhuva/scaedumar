export function bindSwarmFollowControls(deps) {
  const handleToggleClick = () => {
    deps.dispatchCoreCommand({ type: "core/swarm/toggleFollow" });
  };

  const handleTargetChange = () => {
    deps.dispatchCoreCommand({
      type: "core/swarm/setFollowTarget",
      targetType: deps.swarmFollowTargetInput.value,
    });
  };

  deps.swarmFollowToggleBtn.addEventListener("click", handleToggleClick);
  deps.swarmFollowTargetInput.addEventListener("change", handleTargetChange);

  return () => {
    deps.swarmFollowToggleBtn.removeEventListener("click", handleToggleClick);
    deps.swarmFollowTargetInput.removeEventListener("change", handleTargetChange);
  };
}
