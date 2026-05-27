# Event Notification Architecture Note

## Context

The current runtime uses explicit dependency forwarding through app assembly layers. This keeps ownership visible, but the growing survival/gameplay scope has exposed a recurring weakness: one state change often needs to notify several unrelated consumers.

Recent examples:

- inspect perception toggles and sample changes need to update the HUD button, right-side info panel, overlay contour cache, and overlay redraw state.
- resource stock changes need to update RD stock readouts, inspect readouts, contour cache versions, and overlay redraw state.
- discovery changes from movement, idle-time reveal, or scout possession need to refresh known stock, contour visibility, and debug overlays.
- activity state changes need to update HUD button states, side panels, time-speed behavior, and sometimes camera behavior.

The bug where inspect worked visually but the right-side info panel stayed hidden was caused by this pattern. `getInspectSnapshot` was added to the lower setup runtime, but one app assembly layer did not forward it. The dependency was explicit, but brittle.

## Recommendation

Add a small sender/listener notification layer, but use it only for change notifications and invalidation. Do not replace explicit commands, runtime ownership, or data queries with events.

The target architecture should be:

- `CommandBus`: player/system intent and actions that may validate, mutate, and return success/failure.
- Runtime owners: own mutable domain state and expose explicit APIs.
- Store/snapshots: canonical read model for UI and integration where appropriate.
- `EventBus`: post-change notifications for systems that need to refresh, invalidate caches, or redraw.

Events should say "something changed". They should not usually say "please mutate some other owner's state".

## Adopted Cleanup Scope

The first cleanup pass should deliberately stay small. The goal is not to rewrite the survival prototype in one step; the goal is to remove the most fragile coordination pattern from the current branch.

This first pass owns:

- adding a minimal event bus with central event constants
- emitting events after inspect, activity, resource-stock, resource-discovery, and travel-planning state changes
- moving overlay invalidation, debug-panel sync, inspect refresh, HUD sync, side-panel sync, and overlay redraw requests behind listeners
- extracting inspect perception ownership into `src/gameplay/inspectPerceptionRuntime.js`

This first pass does not own:

- splitting every activity into its final controller
- replacing the command bus
- replacing direct runtime-owner calls
- changing persistence formats
- renaming scout/animalism concepts
- moving resource-search/stock/discovery into a single resource-world owner

Those are follow-up refactors that should happen after the event spine is stable.

## Inspect Perception Extraction

Inspect was the first domain extracted after the event spine because it had become a small coordinator hidden inside `main.js`: toggle state, selected overlay layer, cursor sampling, player fallback sampling, layer button reflection, RD active-layer side effects, and inspect snapshot construction all lived together with unrelated app assembly code.

The new boundary is:

- `inspectPerceptionRuntime` owns inspect focus, selected layer, cursor/player sampling state, snapshot construction, layer helper normalization, and layer-button active state.
- `main.js` still owns terrain image data, resource-search/discovery/stock runtimes, DOM element references, and status/event callbacks.
- inspect events remain post-change notifications; the runtime does not directly redraw overlays or update HUDs.

This reduces the current failure mode where adding one inspect consumer requires threading another callback through multiple assembly layers. Future inspect UI or overlay consumers should read `getInspectSnapshot()` and react to `inspect:changed`, not add another direct producer-to-consumer call.

## Travel Planning Extraction

Travel planning/path preview is now wrapped by `src/gameplay/travelPlanningRuntime.js`.

The current boundary is intentionally transitional:

- `travelPlanningRuntime` owns mutations for hover pixel/path, PF range marker, committed target/path, and committed range marker.
- overlay drawing and travel estimates consume an explicit travel-planning snapshot instead of reading the raw state object directly; the render overlay assembly no longer forwards raw `movePreviewState`.
- the existing `movePreviewState` object still exists as compatibility storage for pathfinding internals and older app assembly paths.
- command paths and path-preview pointer updates call runtime methods instead of repeatedly writing the same fields by hand.
- travel-planning changes emit `travel-planning:changed`, and listeners own redraw.

Raw `movePreviewState` forwarding has been removed from command, binding, swarm-integration, and render overlay assembly paths except where pathfinding internals still need the transitional storage object. Compatibility fallbacks remain inside isolated modules/tests, but production public consumers should prefer `travelPlanningRuntime` methods or `getTravelPlanningSnapshot()`.

Pathfinding preview internals now require `travelPlanningRuntime` and use its query methods for hover/path checks. Direct `movePreviewState` access has been removed from `pathfindingPreviewRuntime`.

`movePreviewState` creation has been removed from app bootstrap. `travelPlanningRuntime` now creates and owns its internal state unless a test explicitly injects one.

Compatibility fallbacks that accepted raw `movePreviewState` have been removed from production code. Commands, interaction mode changes, canvas-leave handling, overlay drawing, and travel estimates now depend on `travelPlanningRuntime` or `getTravelPlanningSnapshot()`.

The next cleanup after this should treat the travel-planning extraction as stable and move to the next domain boundary, most likely player activity orchestration or resource-world composition.

## Player Activity State Extraction

The first activity-system cleanup is deliberately mechanical: `src/gameplay/playerActivityStateRuntime.js` owns the shared mutable activity-state shape, reset behavior, base activity start setup, and snapshot cloning.

This keeps `playerActivityRuntime` responsible for behavior, but removes repeated field lists from it. That makes later splits safer because resource search, scout, rest, and travel code can share the same snapshot/reset contract instead of each carrying its own partial state reset.

## Resource Search Activity Extraction

Resource-search behavior is now split out of the public player activity facade. `src/gameplay/playerResourceSearchActivityRuntime.js` owns weighted gathering movement candidate construction, recent-cell avoidance, activity start setup for resource searches, resource-search chance evaluation, reward callback handling, and requeueing after each completed movement step.

`playerActivityRuntime` still owns the public API and cross-activity routing. This keeps existing command/UI callers stable while giving plants, water, and later resource bands a clear domain module that can evolve without making the full activity runtime larger.

The current boundary is intentionally not event-driven for gameplay actions: resource search still calls explicit dependencies for movement queueing, resource value/chance lookup, reward acquisition, and stop reasons. Events remain appropriate for downstream invalidation after those owner mutations succeed, not for deciding whether a gather step succeeded.

## Scout Activity Extraction

Scout behavior now follows the same facade-plus-domain-controller pattern. `src/gameplay/playerScoutActivityRuntime.js` owns the scout-specific lifecycle: start setup, scan/reveal radius resolution, nearby bird candidate scanning, possession state, possessed-bird synchronization, disconnect handling, and throttled snapshot sync decisions.

`playerActivityRuntime` keeps the public `startScout`, `possessScoutCandidate`, and `updateScout` methods but delegates their internals. It still owns cross-activity stop/cancel cleanup because stopping can cancel movement, reset common activity state, reset time speed, notify `onScoutStopped`, and publish the shared activity snapshot.

This split keeps animalism/scouting behavior isolated from gathering, rest, inspect, and travel. That matters because bird possession is likely to grow independently: range rules, species differences, costs, and discovery side effects should not force edits in the central activity facade.

## Rest Activity Extraction

Rest behavior is now extracted to `src/gameplay/playerRestActivityRuntime.js`. The controller owns rest start setup, per-rest-tick recovery callbacks, fatigue-completion detection, and rest snapshot synchronization.

The facade still routes generic upkeep ticks before delegating rest ticks. This is deliberate: upkeep is baseline survival cost and should continue to run for idle and all activities, while rest-specific recovery remains isolated. The facade also keeps stop/cancel behavior because completing rest uses the same shared reset/time/status path as other activities.

## Travel Activity Extraction

Travel behavior is now extracted to `src/gameplay/playerTravelActivityRuntime.js`. The controller owns explicit travel start validation, movement-step counting, travel status text, and movement-queue completion handling.

The actual movement queue still belongs to the movement system. Travel activity only marks the queued movement as intentional player travel and mirrors lifecycle progress into the activity snapshot. Shared stop/cancel behavior stays in `playerActivityRuntime` so travel completion and user cancellation use the same reset/time/status path as every other activity.

## Inspect Activity Extraction

Close-inspect activity behavior is now extracted to `src/gameplay/playerInspectActivityRuntime.js`. The controller owns close-inspect start validation, activity-state setup, cursor-to-map clamping, terrain height/slope sampling, resource reading sampling, and activity snapshot sync.

This is intentionally separate from `src/gameplay/inspectPerceptionRuntime.js`. The perception runtime owns the always-visible inspect overlay/panel state introduced for secondary inspection. The activity controller owns the older explicit close-inspect activity flow and keeps that behavior isolated from travel, rest, scout, and gathering.

## Activity Facade Cleanup

`playerActivityRuntime` is now intentionally a thin facade. It composes the activity controllers, exposes the existing public activity API, owns shared snapshot/store synchronization, routes movement lifecycle hooks, routes generic upkeep before rest recovery, and owns shared stop/cancel cleanup.

Controller bindings are immutable after construction, which makes the facade less sensitive to initialization-order mistakes. A focused facade test covers delegated scout startup followed by shared cancel cleanup, including movement cancellation, scout stop notification, time reset, snapshot reset, and status propagation.

The old broad `gatheringActivityRuntime` test has been split. `tests/playerActivityRuntime.test.js` covers facade integration and shared cleanup, `tests/playerResourceSearchActivityRuntime.test.js` covers resource-search helpers and controller behavior directly, `tests/playerScoutActivityRuntime.test.js` covers scout controller behavior directly, `tests/playerRestActivityRuntime.test.js` covers rest controller behavior directly, `tests/playerTravelActivityRuntime.test.js` covers travel controller behavior directly, `tests/playerInspectActivityRuntime.test.js` covers close-inspect controller behavior directly, `tests/playerActivityUpkeepRuntime.test.js` covers generic upkeep tick handling directly, and `tests/gatheringActivityRuntime.test.js` only verifies the legacy compatibility re-export contract. This keeps future failures closer to the module that owns the behavior.

Generic upkeep tick handling is extracted to `src/gameplay/playerActivityUpkeepRuntime.js`. The upkeep controller owns scheduler movement-tick normalization and one-callback-per-tick dispatch. The facade keeps only the ordering rule: generic upkeep runs first, then explicit rest recovery receives the same processed tick count.

## Refactor Completion Checklist

The current refactor is complete when these checks hold:

- `playerActivityRuntime` remains a facade only: public API, controller composition, shared snapshot/store synchronization, movement lifecycle routing, and shared stop/cancel cleanup.
- Activity-specific behavior stays in dedicated controllers: resource search, scout, rest, travel, close inspect, and generic upkeep.
- Event bus usage remains limited to post-change invalidation/refresh signals; gameplay commands and owner mutations remain explicit.
- Production consumers use runtime-owner APIs or snapshots instead of raw transitional state objects.
- Tests are split by owning module, with facade tests only covering integration and shared cleanup.
- Architecture docs and `AI_CONTEXT.md` name the current owner for every extracted activity/runtime boundary.
- Full JS tests and markdown lint pass after the cleanup.

## Expected Cleanup Gains

Short term:

- fewer missed UI/overlay refreshes when gameplay state changes
- fewer dependency-forwarding regressions through app assembly layers
- less duplicated manual fan-out in `main.js`
- easier focused tests around "mutation emits event" and "event causes invalidation"

Mid term:

- new panels or overlays can react to existing changes without editing every producer path
- inspect, resource, activity, and travel-planning ownership can be extracted one at a time
- direct references between unrelated systems become easier to remove

Long term:

- gameplay systems can grow without `main.js` becoming the cross-feature coordinator
- save/load, overlays, debug panels, and HUDs can subscribe to stable change contracts
- future systems such as seasons, weather-driven resources, animalism skills, and richer player knowledge can integrate through explicit runtime APIs plus post-change events

## Good Event Candidates

These are cross-cutting signals with multiple consumers:

- `inspect:changed`
- `activity:changed`
- `resource-stock:changed`
- `resource-discovery:changed`
- `inventory:changed`
- `condition:changed`
- `map:loaded`
- `time:tick-batch-processed`
- `overlay:dirty`

Typical listener work:

- mark a UI panel dirty
- update HUD active state
- invalidate an overlay cache
- request overlay redraw
- refresh a debug panel readout

## Poor Event Candidates

Avoid events for operations where ordering, return values, or ownership are important:

- starting or canceling an activity
- moving the player
- filling a water container
- depleting resource stock
- saving or loading map sidecars
- resolving loot rewards
- querying snapshots

These should remain explicit commands or direct runtime-owner calls.

For example, keep this as a command:

```js
commandBus.dispatch({ type: "core/activity/startGathering" });
```

But after the activity owner changes state, it can emit:

```js
eventBus.emit("activity:changed", activityRuntime.getSnapshot());
```

## Example Flow

Resource stock depletion should stay owned by `resourceStockRuntime`:

```js
resourceStockRuntime.deplete("water", x, y);
eventBus.emit("resource-stock:changed", { resourceId: "water" });
```

Overlay and UI systems can then react independently:

```js
eventBus.on("resource-stock:changed", ({ resourceId }) => {
  invalidateResourceContourOverlay(resourceId);
  requestOverlayDraw();
});

eventBus.on("resource-stock:changed", () => {
  resourceDebugPanelRuntime.syncStock();
  updateInfoPanel();
});
```

The important part is that listeners react by pulling current state from the owner/store. The event payload should be small and should not become a parallel state model.

## Risks

Event systems can make architecture worse if used too broadly.

- Hidden control flow: debugging gets harder if any listener can trigger unrelated behavior.
- Ordering bugs: listeners must not depend on each other running in a specific order unless that order is documented and enforced.
- Duplicate refreshes: direct calls and event listeners can accidentally do the same work twice.
- Memory leaks: long-lived subscriptions need explicit cleanup if runtime modules are recreated.
- Event API drift: event names and payloads become a contract and need central documentation.
- State split: event payloads can become stale if they try to carry full state instead of small change metadata.

## Guardrails

Use these rules if we add the event layer:

- Define event names in one module, not as scattered strings.
- Prefer small payloads such as `{ resourceId }`, `{ activityType }`, or `{ reason }`.
- Listeners should pull authoritative state from runtime owners or the store.
- Events should be emitted after successful state mutation, not before.
- Event listeners should not start activities, mutate resource stock, or perform save/load operations.
- Keep command paths explicit for anything that needs success/failure handling.
- Do not subscribe inside render loops or per-frame hot paths.
- Make unsubscribe support part of the event bus from the start.

## Proposed Migration Steps

1. Add a minimal `eventBus` module with `on`, `off`, and `emit`, plus centralized event constants.
2. Wire the bus into the main app assembly once, not through every feature-specific dependency chain.
3. Start with low-risk invalidation events:
   - `inspect:changed`
   - `resource-stock:changed`
   - `resource-discovery:changed`
   - `activity:changed`
4. Move overlay invalidation and redraw requests behind those events.
5. Move HUD and right-side info panel refresh triggers behind those events.
6. Keep existing direct command paths during the first pass, but remove duplicated manual refresh calls as each event path proves stable.
7. Add focused tests for event emission and listener behavior around inspect/resource updates.
8. Re-evaluate after the first migration before expanding to inventory, condition, map-load, or time events.

## Expected Benefit

This should reduce brittle app-assembly forwarding for "many consumers need to know this changed" cases while preserving explicit ownership for real gameplay actions.

The main win is not fewer lines of code. The win is that a new consumer can react to `inspect:changed` or `resource-stock:changed` without needing every intermediate assembly layer to forward another callback or snapshot getter.


