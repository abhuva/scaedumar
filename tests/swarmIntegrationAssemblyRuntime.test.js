import test from "node:test";
import assert from "node:assert/strict";

import { createSwarmIntegrationAssemblyRuntime } from "../src/app/swarmIntegrationAssemblyRuntime.js";

test("swarm integration assembly forwards travel planning dependencies to info panel context", () => {
  const getTravelPreviewEstimate = () => ({ state: "empty" });
  const getInteractionMode = () => "pathfinding";
  const getMovementDurationHours = () => 1;
  const assembly = createSwarmIntegrationAssemblyRuntime({
    getTravelPreviewEstimate,
    getInteractionMode,
    getMovementDurationHours,
  });

  assert.equal(assembly.interactionContext.getTravelPreviewEstimate, getTravelPreviewEstimate);
  assert.equal(assembly.interactionContext.getInteractionMode, getInteractionMode);
  assert.equal(assembly.interactionContext.getMovementDurationHours, getMovementDurationHours);
});
