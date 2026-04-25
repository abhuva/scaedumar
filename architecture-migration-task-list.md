# Architecture Migration Task List

Last updated: 2026-04-25
Owner: Codex + Marc
Branch policy: dedicated implementation branch, no direct commits to `main`
Primary scope: record the completed migration from the former hybrid runtime to the current modular architecture

## Purpose

This file is the authoritative migration control document and session-to-session memory for the remaining runtime architecture work.

Goals:
- Keep runtime behavior parity while restructuring.
- Make core state the single source of truth.
- Keep systems modular, testable, and understandable.
- Reduce `src/main.js` to boot/wiring/orchestration instead of mixed ownership.

Non-goals:
- Full gameplay rewrite during migration.
- Visual redesign.
- Large feature additions unless needed to preserve behavior or unblock migration.

## Current Status

The migration is complete.

Current architecture state:
- Core store state is the authoritative runtime state model.
- Scheduler systems consume canonical state directly.
- UI controls emit commands and reflect state; they are not runtime truth.
- Renderer consumes resolved frame/runtime state and does not own gameplay/config state.
- `src/main.js` is still the largest single file, but it now acts primarily as composition/orchestration.
- App-level dependency shaping lives under `src/app/` instead of being expanded inline across `main.js`.
- Bridge-era wrapper/facade layers that previously hid ownership are removed from active runtime paths.

## Target Architecture

Top-level module layout:
- `src/app/` bootstrap, mode bootstrap, dependency wiring
- `src/core/` app state, scheduler, commands, settings registry
- `src/render/` renderer, passes, GPU resources, render prep
- `src/sim/` time/weather/lighting/fog/cloud/water systems
- `src/gameplay/` entities, movement, pathfinding, map lifecycle, interaction runtime
- `src/ui/` bindings, panels, overlays, HUD, sync helpers
- `src/io/` map load/save and persistence adapters
- `src/workers/` worker wrappers and protocols

End-state rules:
- Core state is the authoritative runtime state model.
- Scheduler systems consume canonical state directly.
- UI controls emit commands; they are not runtime truth.
- Renderer consumes resolved state; it does not own gameplay/config state.
- `src/main.js` remains a thin composition layer:
  - bootstrapping
  - renderer setup
  - input binding
  - command dispatch
  - frame orchestration

## Progress Rules

Status markers:
- `[ ]` not started
- `[-]` in progress
- `[x]` done
- `[!]` blocked

Execution rules:
- Only one major migration phase should be in progress at once.
- Keep behavior stable while changing ownership.
- After each ownership move, remove the old read/write path instead of leaving duplicates behind.
- Do not mark migration complete until the remaining bridge-era ownership patterns are actually removed.

## Phase Overview

1. Architecture Baseline and Gap Mapping
2. Canonical State Contract Completion
3. Control/Input Ownership Migration
4. Simulation/System Ownership Migration
5. Render/Input Decoupling
6. Adapter Removal and Simplification
7. Verification and Documentation

## Detailed Task List

### Phase 1: Architecture Baseline and Gap Mapping

Dependencies: none

- [x] P1.1 Confirm current runtime is hybrid
  - [x] P1.1.1 Confirm `src/main.js` still owns live runtime state.
  - [x] P1.1.2 Confirm old bridge layers are no longer active runtime dependencies.
  - [x] P1.1.3 Confirm scheduler/core/store path is active but not yet sole owner.
- [x] P1.2 Capture migrated vs non-migrated ownership
  - [x] P1.2.1 Time routing foundation is in place.
  - [x] P1.2.2 Movement queue/tick execution is in place.
  - [x] P1.2.3 Render, DOM, and significant runtime state remain partly `main.js` owned.
- [x] P1.3 Create explicit ownership map for remaining migration
  - [x] P1.3.1 Remaining DOM-primary paths are mostly event-time editor/binding paths.
  - [x] P1.3.2 Several gameplay/runtime branches are still synchronized snapshots rather than sole authority.
  - [x] P1.3.3 Remaining duplicate ownership hotspots are explicit enough to sequence.

Exit criteria:
- Hybrid-state reality is documented.
- Remaining migration surface is explicit enough to sequence cleanly.

### Phase 2: Canonical State Contract Completion

Dependencies: Phase 1

- [x] P2.1 Make core state complete enough to become sole runtime authority
  - [x] P2.1.1 Audit missing authoritative state branches for render FX, pathfinding, swarm, interaction mode, camera, and map/session state.
  - [x] P2.1.2 Remove remaining dependence on reading those values primarily from DOM inputs.
  - [x] P2.1.3 Ensure defaults/serialize/apply paths align with canonical core state shape.
- [x] P2.2 Define stable command surface for all user-driven state changes
  - [x] P2.2.1 Route mutable UI-backed settings through commands.
  - [x] P2.2.2 Remove direct imperative state mutation where command routing should own behavior.
  - [x] P2.2.3 Ensure commands update both state and required side effects.
- [x] P2.3 Clarify ownership boundaries
  - [x] P2.3.1 Core store owns persistent/config/runtime gameplay state.
  - [x] P2.3.2 Renderer consumes resolved state but does not own it.
  - [x] P2.3.3 DOM reflects state and emits commands, but is not authoritative.

Exit criteria:
- Core state model is complete enough that runtime snapshots are no longer needed for missing branches.

### Phase 3: Control/Input Ownership Migration

Dependencies: Phase 2

- [x] P3.1 Convert DOM controls from source-of-truth to state views
  - [x] P3.1.1 Time controls (`cycleSpeed`, `simTickHours`, routing controls).
  - [x] P3.1.2 Pathfinding controls.
  - [x] P3.1.3 Fog/cloud/water/parallax/lighting controls.
  - [x] P3.1.4 Swarm controls.
- [x] P3.2 Remove direct DOM reads from runtime-hot paths
  - [x] P3.2.1 Eliminate per-frame settings reads that should come from core state.
  - [x] P3.2.2 Eliminate system logic that derives behavior from raw inputs instead of state.
  - [x] P3.2.3 Keep only event-time UI reads inside bindings where unavoidable.
- [x] P3.3 Make UI update one-way
  - [x] P3.3.1 State change updates labels/inputs/UI.
  - [x] P3.3.2 User interaction dispatches command.
  - [x] P3.3.3 Remove implicit two-way parity behavior.

Exit criteria:
- Runtime logic no longer depends on DOM inputs as the primary state source.

### Phase 4: Simulation/System Ownership Migration

Dependencies: Phase 2, Phase 3

- [x] P4.1 Make scheduler/core systems read only canonical core state
  - [x] P4.1.1 Time system.
  - [x] P4.1.2 Lighting system.
  - [x] P4.1.3 Fog system.
  - [x] P4.1.4 Cloud system.
  - [x] P4.1.5 Water FX system.
  - [x] P4.1.6 Weather system.
  - [x] P4.1.7 Pathfinding/movement integration.
- [x] P4.2 Move remaining gameplay runtime ownership out of `main.js`
  - [x] P4.2.1 Player/gameplay state snapshots become authoritative state or clearly system-owned runtime.
  - [x] P4.2.2 Swarm settings/runtime ownership boundaries are explicit and non-duplicated.
  - [x] P4.2.3 Point-light runtime/store-sync ownership is explicit and non-duplicated.
  - [x] P4.2.4 Camera state ownership is explicit and does not bounce between runtime and core.
- [x] P4.3 Stop per-frame snapshot feeding
  - [x] P4.3.1 Replace snapshot-fed frame inputs with authoritative state access.
  - [x] P4.3.2 Ensure scheduler update context only carries transient frame values.
  - [x] P4.3.3 Delete remaining snapshot-only helper usage once no longer needed.

Exit criteria:
- Scheduler no longer depends on frame-by-frame mirrored runtime state.

### Phase 5: Render/Input Decoupling

Dependencies: Phase 4

- [x] P5.1 Make render preparation consume resolved state, not raw inputs
  - [x] P5.1.1 Uniform input construction reads from core/system state.
  - [x] P5.1.2 Frame render state construction reads from core/system state.
  - [x] P5.1.3 Overlay rendering reads canonical gameplay/render state.
- [x] P5.2 Remove ad hoc render-time settings assembly where possible
  - [x] P5.2.1 Avoid recomputing settings snapshots from DOM every frame.
  - [x] P5.2.2 Keep only genuinely transient frame calculations in render loop.
- [x] P5.3 Reduce `main.js` to orchestration
  - [x] P5.3.1 Keep boot/setup.
  - [x] P5.3.2 Keep render loop orchestration.
  - [x] P5.3.3 Move remaining embedded runtime domain logic into modules.

Exit criteria:
- Render loop consumes canonical state with minimal reconstruction.

### Phase 6: Adapter Removal and Simplification

Dependencies: Phases 3, 4, 5

- [x] P6.1 Remove remaining runtime-to-core mirroring assumptions
  - [x] P6.1.1 Delete active `frameSnapshot` usage from runtime path.
  - [x] P6.1.2 Remove obsolete snapshot getters whose only role was frame mirroring.
- [x] P6.2 Remove remaining core-to-runtime parity assumptions
  - [x] P6.2.1 Delete active `runtimeParityAdapter` usage from runtime path.
  - [x] P6.2.2 Remove remaining DOM/runtime write-back assumptions.
- [x] P6.3 Simplify interfaces after bridge removal
  - [x] P6.3.1 Remove dead command/state plumbing that existed only for parity.
  - [x] P6.3.2 Remove duplicate state derivations, duplicate caches, and startup-sensitive compatibility shims where no longer needed.

Exit criteria:
- No active bridge-era ownership model remains.
- Core state is the one-way authoritative model.

### Phase 7: Verification and Documentation

Dependencies: Phase 6

- [x] P7.1 Behavior verification
  - [x] P7.1.1 Verify time routing behavior still matches current feature behavior.
  - [x] P7.1.2 Verify movement queue behavior still matches shipped behavior.
  - [x] P7.1.3 Verify swarm/cloud smoothing still behaves correctly.
  - [x] P7.1.4 Verify map save/load still preserves settings.
- [x] P7.2 Performance verification
  - [x] P7.2.1 Confirm bridge-era churn is gone.
  - [x] P7.2.2 Re-profile periodic hitching after simplification.
  - [x] P7.2.3 Remove any remaining high-frequency DOM/state churn found during validation.
- [x] P7.3 Documentation updates
  - [x] P7.3.1 Update `README.md` to describe final runtime architecture and controls.
  - [x] P7.3.2 Update `AI_CONTEXT.md` to match final ownership model.
  - [x] P7.3.3 Update `AGENTS.md` if workflow/runtime notes changed.
- [x] P7.4 Task-list closure
  - [x] P7.4.1 Replace hybrid-state note with final-state note.
  - [x] P7.4.2 Mark migration complete only after the remaining ownership work is actually done.

Exit criteria:
- Behavior matches expectations.
- Performance is revalidated after simplification.
- Docs match the final architecture.

## Compatibility Checklist

- [x] Default map auto-load still works.
- [x] Manual map load (folder/path) still works.
- [x] Save/Load all JSON still works.
- [x] Day/night cycle and sliders remain functionally coherent.
- [x] Shadow pipeline works.
- [x] Point lights create/edit/delete/bake with worker fallback.
- [x] Pathfinding preview/click move mode still works.
- [x] Water FX controls still work with acceptable drift.
- [x] Dev tools visibility and interaction mode toggles remain functional.

## Completion Definition

Migration is only complete when all of the following are true:
- Core state is the authoritative runtime state model.
- Scheduler systems consume canonical state directly.
- Render loop does not rebuild core state from runtime snapshots each frame.
- DOM controls are not used as runtime truth.
- Bridge-era ownership assumptions are gone from active runtime paths.
- `src/main.js` is reduced to composition/orchestration rather than mixed ownership.

## Immediate Next Work

Post-migration work is normal maintenance:

- feature development
- targeted performance work if new issues are observed
- incremental naming cleanup where it improves readability

## Session Log

Keep this section short. Detailed extraction history belongs in git log and code, not here.

- 2026-04-22:
  - Established the active migration plan around the hybrid runtime and the final state-driven architecture target.
- 2026-04-23:
  - Removed active reliance on the old bridge layers and moved a large amount of settings/binding/runtime composition out of `main.js`.
- 2026-04-24:
  - Fixed the camera-transform regression that broke terrain interaction and clarified swarm/player/point-light ownership in several hotspots.
- 2026-04-25:
  - Continued Phase 4/5 ownership work:
    - grouped store-sync and runtime-state access through focused facades/runtimes
    - hardened startup sequencing after lazy-facade TDZ regressions
    - `main.js` remains the largest integration surface, so migration is still incomplete
  - Continued Phase 2/4 command-ownership cleanup:
    - `core/pointLights/setLiveUpdate` now routes through runtime sync (`syncPointLightsStateToStore`) instead of in-command direct store mutation, with fallback retained for compatibility
  - Continued Phase 2/4 command-ownership cleanup:
    - cursor-light command handlers now route state writes through runtime sync (`syncCursorLightStateToStore`) instead of owning the `gameplay.cursorLight` mutation inline, with fallback retained for compatibility
  - Continued Phase 5 `main.js` orchestration cleanup:
    - removed pass-through fallback-image/map-size/image-data wrappers and wired setup runtimes directly to module/runtime APIs
  - Continued Phase 2/4 command-ownership cleanup:
    - `core/swarm/settingsChanged` now routes swarm settings patches through runtime sync (`patchSwarmSettingsToStore`) instead of owning the `gameplay.swarm` mutation inline, with fallback retained for compatibility
  - Continued Phase 2/4 command-ownership cleanup:
    - `core/renderFx/changed` now routes simulation knob section writes through runtime sync (`patchSimulationKnobSectionToStore`) instead of owning `simulation.knobs` mutation inline, with fallback retained for compatibility
    - `core/time/setCycleSpeed`, `core/time/setSimTickHours`, and `core/time/setRouting` now route store writes through runtime sync (`setCycleSpeedToStore`, `setSimTickHoursToStore`, `setTimeRoutingModeToStore`) instead of owning direct `clock/systems.time` mutation inline, with fallback retained for compatibility
  - Continued Phase 2/4 command-ownership cleanup:
    - `core/setMode`, camera pose updates, and `core/time/setHour` now route store writes through runtime sync (`setModeToStore`, `setCameraPoseToStore`, `setCycleHourUiToStore`) instead of owning direct `mode/camera/ui` mutation inline, with fallback retained for compatibility
  - Continued Phase 2/4 command-ownership cleanup:
    - pathfinding command handlers in `interactionCommands` now route pathfinding state patch/sync writes through runtime sync (`patchPathfindingStateToStore`, `syncPathfindingStateToStore`) instead of owning direct `gameplay.pathfinding` mutation inline, with fallback retained for compatibility
  - Continued Phase 6 simplification:
    - removed migrated fallback mutation branches in `registerMainCommands` and `interactionCommands` for mode/camera/time/render-fx/swarm/point-light/cursor-light/pathfinding command flows so those paths now use canonical runtime sync only
    - moved direct gameplay helper store writes (`interactionModeController`, `playerRuntimeBinding`, `movementStoreSyncRuntime`) behind shared `stateSync` helpers so mutation ownership is centralized
    - removed stale command-handler `ctx` dependencies in migrated paths so command signatures now reflect command+runtime-sync ownership instead of direct store ownership
    - moved `swarmFollowRuntimeState` follow-index/target store mutation behind shared swarm sync (`patchSwarmSettingsToStore`), leaving gameplay `store.update` concentrated in sync-focused modules (`stateSync`, `swarmStoreSync`)
    - added architecture guard coverage (`tests/architectureOwnershipGuards.test.js`) to detect regressions if direct `ctx.store.update` or helper-level `store.update` returns in migrated command/gameplay modules
  - Continued Phase 4/6 ownership cleanup:
    - moved swarm store mutation helpers (`syncSwarmFollowToStore`, `syncSwarmRuntimeStateToStore`, `syncSwarmStateToStore`, `patchSwarmSettingsToStore`) behind shared `stateSync` ownership, leaving `swarmStoreSync` focused on swarm snapshot/diff helpers
    - fixed the `core/cursorLight/setGizmo` command regression introduced during the runtime-sync refactor (`syncCursorLightToStore()` no longer references an undefined `ctx`)
  - Continued Phase 4/5 `main.js` ownership cleanup:
    - removed the lazy `mainRuntimeStateFacade` / `runtimeSyncFacade` proxy layer from `main.js`
    - rewired command/system/swarm integration call sites to use concrete bindings/runtimes directly (`mainRuntimeStateBinding`, `playerRuntimeBinding`, `movementSystem`, `swarmRuntime`)
    - removed now-dead `main.js` alias helpers that only existed to feed those facades
  - Continued Phase 4/5 binding cleanup:
    - removed duplicate `mainRuntimeStateBinding` construction from the swarm UI assembly path; swarm UI now consumes the same lazily-created binding instance owned by `main.js`
    - replaced the `mainRuntimeStateSetupRuntime` wrapper with direct `createMainRuntimeStateBinding(...)` usage in `main.js`
    - deleted dead adapter modules `mainRuntimeStateSetupRuntime.js`, `mainRuntimeStateFacadeRuntime.js`, and `runtimeSyncFacadeRuntime.js`
  - Continued Phase 4/5 binding cleanup:
    - removed the remaining lazy `getMainRuntimeStateBinding()` accessor from `main.js`; `mainRuntimeStateBinding` is now instantiated once and passed directly where needed
    - updated `mainRuntimeStateBinding` to resolve cursor-light state and `stopSwarmFollow` through getter-style dependencies, removing startup-order pressure from `main.js`
    - removed the remaining swarm-UI `getMainRuntimeStateBinding` indirection so the swarm UI facade/runtime now consume the concrete `mainRuntimeStateBinding` object directly
  - Continued Phase 5 orchestration extraction:
    - moved the swarm integration composition block out of `main.js` into `src/app/swarmIntegrationSetupRuntime.js`
    - grouped swarm gameplay composition, settings assembly wiring, swarm render setup, and interaction facade setup behind one app-level assembly module
    - `main.js` now consumes that assembled runtime instead of directly composing `createSwarmGameplayRuntime`, `createSettingsAssemblyRuntime`, `createSwarmRenderSetupRuntime`, and `createInteractionFacadeSetupRuntime` inline
  - Continued Phase 5 orchestration extraction:
    - moved swarm-cursor pointer wiring, pathfinding runtime/label setup, and render-FX UI setup out of `main.js` into `src/app/interactionUiSetupRuntime.js`
    - `main.js` now consumes assembled interaction/UI bindings instead of directly composing `createSwarmCursorPointerSetupRuntime`, `createPathfindingRuntimeBinding`, `createPathfindingLabelBindingRuntime`, and `createRenderFxUiSetupRuntime` inline
  - Continued Phase 5 orchestration extraction:
    - moved overlay setup, resize wiring, and frame-loop composition out of `main.js` into `src/app/renderShellSetupRuntime.js`
    - `main.js` now consumes assembled render-shell wiring instead of directly composing `createOverlaySetupRuntime`, `resizeViewport`, and `createFrameLoopBindingRuntime` inline
  - Continued Phase 5 orchestration extraction:
    - moved main bindings setup, default-map autoload kickoff, and startup/render kickoff out of `main.js` into `src/app/appShellLifecycleRuntime.js`
    - `main.js` now hands those lifecycle responsibilities to one app-level shell instead of directly calling `runMainBindingsSetup`, `tryAutoLoadDefaultMapRuntime`, and `runMainAppStartup`
  - Continued Phase 6 simplification:
    - removed the no-op `uiFacadeSetupRuntime.js` adapter layer and had `main.js` consume `uiRuntimeFacade` directly
    - removed a dead `drawOverlay` local from `main.js` after render-shell extraction made it unused at the top level
  - Continued Phase 6 simplification:
    - removed the no-op `mapLifecycleFacadeRuntime.js` wrapper and had `main.js` delegate directly to `mapLifecycleRuntime`
  - Continued Phase 6 simplification:
    - removed the no-op `runtimeSupportMethodsRuntime.js` wrapper and had `main.js` consume `runtimeSupportFacade` directly
  - Continued Phase 6 simplification:
    - removed the no-op `mathFacadeRuntime.js` and `colorFacadeRuntime.js` wrappers and had `main.js` bind directly to the imported utility functions
  - Continued Phase 6 simplification:
    - removed the no-op `timeStateFacadeRuntime.js` wrapper and had `settingsCoreSetupRuntime` expose `timeStateBindingRuntime` directly under the existing handoff property
  - Continued Phase 6 simplification:
    - removed another batch of no-op gameplay setup/binding wrappers by wiring direct runtime owners instead:
      - deleted `movementSetupRuntime.js` and had `main.js` use `createMovementSystem(...)` directly
      - deleted `swarmRuntimeSetupRuntime.js` and had `main.js` use `createSwarmRuntime(...)` directly
      - deleted `pointLightSetupRuntime.js` / `mapLifecycleSetupRuntime.js` and had `mapLightingAssemblyRuntime` compose `createPointLightRuntime(...)` / `createMapLifecycleRuntime(...)` directly
      - deleted `swarmCursorPointerSetupRuntime.js` and had `interactionUiSetupRuntime` use `createSwarmCursorPointerBindingRuntime(...)` directly
      - deleted `mapBootstrapBindingRuntime.js` / `mapBootstrapRuntime.js` and had `mapLifecycleRuntime` use `createMapBootstrap(...)` directly
      - deleted `mapImageRuntimeBinding.js` and had `mapSupportRuntime` use `createMapImageRuntime(...)` directly
      - deleted `cameraViewRuntimeBinding.js`, `mapSamplingRuntimeBinding.js`, and `shadowOcclusionRuntimeBinding.js` and had their direct consumers (`cameraRuntimeBinding`, `mapSupportRuntime`) use the underlying runtimes/helpers directly
  - Continued Phase 6 simplification:
    - removed another batch of no-op UI assembly/setup wrappers by wiring direct binding owners instead:
      - deleted `swarmUiAssemblyRuntime.js`, `swarmUiSetupRuntime.js`, and `swarmStateUiFacadeRuntime.js` and had `main.js` consume `createSwarmUiRuntimeBinding(...)` directly
      - deleted `settingsLegacyAssemblyRuntime.js` and `settingsLegacySetupRuntime.js` and had `settingsAssemblyRuntime` compose `createSettingsLegacyRuntimeBinding(...)` directly
  - Continued Phase 6 simplification:
    - removed the no-op UI binding-runtime layer under `mainBindingsRuntime` by importing the real `src/ui/bindings/*` control binders directly
    - deleted `canvasBindingRuntime.js`, `pathfindingBindingRuntime.js`, `swarmPanelBindingRuntime.js`, `swarmFollowBindingRuntime.js`, `topicPanelBindingRuntime.js`, `interactionCycleBindingRuntime.js`, `cursorLightBindingRuntime.js`, `pointLightEditorBindingRuntime.js`, `renderFxBindingRuntime.js`, `mapIoBindingRuntime.js`, and `runtimeBindingRuntime.js`
  - Continued Phase 6 simplification:
    - removed the no-op startup wrapper layer by wiring app shell and core startup directly to the real startup functions
    - deleted `core/appStartupBindingRuntime.js` and `ui/startupUiSyncRuntime.js`
    - `appShellLifecycleRuntime` now assembles `startupUiSync` directly for `runAppStartupRuntime(...)`, and `appStartupRuntime` now calls `runStartupUiSync(...)` directly
  - Continued Phase 5/6 orchestration cleanup:
    - moved the main UI binding dependency assembly out of `src/ui/` into `src/app/mainBindingsAssemblyRuntime.js`
    - deleted `ui/mainBindingsSetupRuntime.js`
    - `appShellLifecycleRuntime` now assembles grouped binding deps at the app layer and passes them directly into `setupMainBindingsRuntime(...)`
  - Continued Phase 6 simplification:
    - removed another batch of one-hop setup/binding aliases by wiring direct owners instead:
      - deleted `gameplay/cameraSetupRuntime.js` and had `main.js` use `createCameraRuntimeBinding(...)` directly
      - deleted `core/modeStateRuntimeBinding.js` and had `ui/modeTopicRuntimeBinding.js` use `createModeStateAccess(...)` directly
      - deleted `gameplay/mapPathBindingRuntime.js` and `gameplay/tauriRuntimeBinding.js`; `gameplay/mapSupportRuntime.js` now composes `mapPathUtils` and `tauriRuntime` helpers directly
  - Continued Phase 6 simplification:
    - removed `core/settingsApplyBindingRuntime.js` and inlined that settings-apply contract construction into `core/settingsCoreSetupRuntime.js`
    - the public `settingsApplyBindingRuntime` object shape remains unchanged for downstream consumers; only the extra module layer was removed
  - Continued Phase 6 simplification:
    - removed `core/settingsFacadeRuntime.js` and inlined that lazy legacy/canonical settings bridge into `core/settingsCoreSetupRuntime.js`
    - the public `settingsFacadeRuntime` object shape remains unchanged for downstream consumers; startup-order-safe lazy access to legacy and canonical settings bindings is preserved
  - Continued Phase 5/6 simplification:
    - removed `core/mainCommandDepsRuntime.js` and had `main.js` pass the assembled command dependency object directly to `registerMainCommands(...)`
    - removed `gameplay/bootstrapStateAssemblyRuntime.js` and had `main.js` compose render and gameplay bootstrap state directly from `createRenderBootstrapState(...)` and `createGameplayBootstrapState(...)`
    - fixed remaining stale `swarmRuntimeSetupRuntime` references left behind in `main.js` after the earlier swarm-runtime wrapper removal by wiring those call sites to the concrete `swarmRuntime` instance
  - Continued Phase 6 simplification:
    - removed another batch of one-hop gameplay/UI wrappers by wiring their owning modules directly to the concrete runtimes:
      - deleted `gameplay/cursorLightPointerBindingRuntime.js` and `ui/cursorLightModeUiBindingRuntime.js`; `gameplay/lightInteractionRuntimeBinding.js` now uses `createCursorLightPointerRuntime(...)` and `createCursorLightModeUiRuntime(...)` directly
      - deleted `gameplay/interactionModeSnapshotBindingRuntime.js`; `ui/modeInteractionRuntimeBinding.js` now uses `createInteractionModeSnapshotRuntime(...)` directly
      - deleted `ui/lightLabelBindingRuntime.js`; `ui/modeLightSetupRuntime.js` now uses `createLightLabelRuntime(...)` directly
      - deleted `gameplay/playerStateRuntimeBinding.js`; `gameplay/playerRuntimeBinding.js` now uses `createPlayerStateRuntime(...)` directly
      - deleted `gameplay/pointLightFacadeRuntime.js`; `gameplay/mapLightingAssemblyRuntime.js` now wires `pointLightRuntime` directly and exposes it under the direct `pointLightApi` handoff
  - Continued Phase 6 simplification:
    - removed another small interaction/editor wrapper layer:
      - deleted `gameplay/cursorLightPointerStateRuntime.js`; `gameplay/lightInteractionRuntimeBinding.js` now calls `cursorLightRuntime.clearPointer()` / `setPointerUv(...)` directly
      - deleted `gameplay/pointLightEditorActionBindingRuntime.js`; `gameplay/pointLightRuntime.js` now calls `pointLightEditorRuntime` directly for edit/apply/find/create actions
      - deleted `ui/pointLightEditorUiBindingRuntime.js`; `gameplay/lightInteractionRuntimeBinding.js` now uses `ui/pointLightEditorRuntime.js` directly
  - Continued Phase 6 simplification:
    - removed two more small wrapper modules:
      - deleted `ui/timeUiBindingRuntime.js`; `sim/timeLightingSetupRuntime.js` now uses `createTimeUiRuntime(...)` directly
      - deleted `ui/swarmOverlayBindingRuntime.js`; `gameplay/swarmRenderSetupRuntime.js` now uses `swarmOverlayRuntime` from `createSwarmOverlayRuntime(...)` directly
  - Continued Phase 6 simplification:
    - removed two more small wrapper modules:
      - deleted `render/frameUiBindingRuntime.js`; `main.js` now uses `createFrameUiRuntime(...)` directly
      - deleted `ui/pathfindingLabelBindingRuntime.js`; `app/interactionUiSetupRuntime.js` now binds directly to the `pathfindingLabelUi` helper functions
  - Continued Phase 6 simplification:
    - removed two more small gameplay wrappers:
      - deleted `gameplay/swarmCursorPointerBindingRuntime.js`; `app/interactionUiSetupRuntime.js` now uses `createSwarmCursorPointerRuntime(...)` directly
      - deleted `gameplay/pathfindingCostModelBindingRuntime.js`; `gameplay/pathfindingRuntimeBinding.js` now uses `createPathfindingCostModel(...)` directly
  - Continued Phase 6 simplification:
    - removed two more single-use setup shells:
      - deleted `ui/renderFxUiSetupRuntime.js`; `app/interactionUiSetupRuntime.js` now composes `createRenderFxUiBindingRuntime(...)` and `createRenderFxSettingsSyncRuntime(...)` directly
      - deleted `ui/modeLightSetupRuntime.js`; `main.js` now composes `createLightLabelRuntime(...)` and `createModeInteractionRuntimeBinding(...)` directly
  - Continued Phase 6 simplification:
    - removed the remaining local interaction facade/setup stack around main camera/player/info-panel helpers:
      - deleted `gameplay/interactionFacadeSetupRuntime.js`, `gameplay/mainFacadeRuntime.js`, and `gameplay/interactionModeRuntime.js`
      - `app/swarmIntegrationSetupRuntime.js` now composes `createInfoPanelRuntime(...)` directly and inlines the small interaction-mode/main-facade handoffs it returns to `main.js`
      - cleaned up the stale `main.js` reference to the deleted `interactionFacadeSetupRuntime`
  - Continued Phase 6 simplification:
    - removed three more one-hop binding/runtime wrappers by wiring their direct owners instead:
      - deleted `core/timeStateBindingRuntime.js`; `core/settingsCoreSetupRuntime.js` now uses `createTimeStateAccess(...)` directly while preserving the existing `timeStateFacadeRuntime` handoff shape
      - deleted `gameplay/mapRuntimeStateBinding.js`; `gameplay/mapLifecycleRuntime.js` now uses `createMapRuntimeState(...)` directly
      - deleted `gameplay/mapIoHelpersRuntime.js`; `gameplay/mapSupportRuntime.js` now uses `createMapIoHelpers(...)` directly
  - Continued Phase 6 simplification:
    - removed another render/sim batch of one-hop setup/binding wrappers by wiring direct runtime owners instead:
      - deleted `sim/lightingParamsBindingRuntime.js`; `sim/timeLightingSetupRuntime.js` now uses `createLightingParamsRuntime(...)` directly
      - deleted `render/glResourceBindingRuntime.js`, `render/flowMapBindingRuntime.js`, and `render/shadowPipelineBindingRuntime.js`; `render/renderSupportRuntime.js` now uses the underlying runtime modules directly
      - deleted `render/frameRuntimeBinding.js`; `render/frameLoopBindingRuntime.js` now uses `createFrameRuntime(...)` directly
      - deleted `render/renderPipelineSetupRuntime.js` and `render/defaultMapSetupRuntime.js`; `main.js` now uses `createRenderPipelineRuntime(...)` and `createDefaultMapImageRuntime(...)` directly
  - Continued Phase 6 simplification:
    - removed the point-light bake setup/facade wrapper layer:
      - deleted `render/pointLightBakeSetupRuntime.js`; `main.js` now uses `createPointLightBakeRuntimeBinding(...)` directly
      - deleted `render/pointLightBakeFacadeRuntime.js`; `main.js` now destructures the binding runtime directly instead of wrapping it in a second facade
  - Continued Phase 6 simplification:
    - flattened the remaining point-light bake binding sublayers into `render/pointLightBakeRuntimeBinding.js`:
      - deleted `render/pointLightBakeBindingRuntime.js`; the runtime binding now exposes canvas/runtime bake operations directly
      - deleted `render/pointLightBakeSyncBindingRuntime.js`; the runtime binding now lazily creates `createPointLightBakeSync(...)` directly
  - Continued Phase 6 simplification:
    - removed the thin frame-loop wrapper:
      - deleted `render/frameLoopBindingRuntime.js`; `app/renderShellSetupRuntime.js` now lazily creates `createFrameRuntime(...)` directly while preserving the existing `getFrameLoopBindingRuntime` handoff
  - Continued Phase 6 simplification:
    - removed `core/runtimeSupportFacade.js` and inlined its composition into `main.js`
    - `main.js` now creates `render/renderSupportRuntime.js` and `gameplay/mapSupportRuntime.js` directly instead of going through one more facade layer
  - Continued Phase 6 simplification:
    - removed `ui/uiRuntimeFacade.js` and had `main.js` destructure methods directly from the real UI/gameplay owners
    - light interaction, pathfinding, render-FX UI sync, and light-label helpers no longer pass through a top-level UI facade object first
  - Continued Phase 5/6 orchestration cleanup:
    - moved the large `createSwarmIntegrationSetupRuntime(...)` dependency shaping block out of `main.js` into `src/app/swarmIntegrationAssemblyRuntime.js`
    - `main.js` still provides the flat runtime values, but the nested gameplay/settings/render/interaction assembly now lives in the app layer instead of inline at the call site
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `registerMainCommands(...)` dependency shaping block out of `main.js` into `src/app/mainCommandAssemblyRuntime.js`
    - `main.js` still supplies the concrete runtime functions and values, but the command dependency object is no longer built inline at the call site
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `createSwarmUiRuntimeBinding(...)` dependency shaping block out of `main.js` into `src/app/swarmUiAssemblyRuntime.js`
    - `main.js` still supplies the concrete runtime values and DOM handles, but the swarm-UI dependency object is no longer assembled inline at the call site
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `setupRuntimeSystems(...)` dependency shaping block out of `main.js` into `src/app/runtimeSystemsAssemblyRuntime.js`
    - `main.js` still provides the concrete systems/runtime functions, but the scheduler setup dependency object is no longer built inline at the call site
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `createInteractionUiSetupRuntime(...)` dependency shaping block out of `main.js` into `src/app/interactionUiAssemblyRuntime.js`
    - `main.js` still provides the concrete runtime values and DOM handles, but the interaction/pathfinding/render-FX setup dependency object is no longer assembled inline at the call site
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `createRenderShellSetupRuntime(...)` dependency shaping block out of `main.js` into `src/app/renderShellAssemblyRuntime.js`
    - `main.js` still provides the concrete render/overlay/frame-loop functions and values, but the render-shell dependency object is no longer assembled inline at the call site
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `runAppShellLifecycleRuntime(...)` dependency shaping block out of `main.js` into `src/app/appShellLifecycleAssemblyRuntime.js`
    - `main.js` still provides the concrete bindings/auto-load/startup functions and values, but the app-shell lifecycle dependency object is no longer assembled inline at the call site
  - Continued Phase 5/6 orchestration cleanup:
    - moved the large `bindings` payload passed into `runAppShellLifecycleRuntime(...)` out of `main.js` into `src/app/mainBindingsLifecycleAssemblyRuntime.js`
    - `main.js` still provides the concrete UI/runtime handlers and DOM elements, but the main binding lifecycle dependency object is no longer assembled inline at the call site
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `createRenderSupportRuntime(...)` and `createMapSupportRuntime(...)` dependency shaping blocks out of `main.js` into `src/app/runtimeSupportAssemblyRuntime.js`
    - `main.js` still provides the concrete GL/runtime/image-state functions and values, but the support-runtime dependency objects are no longer assembled inline at the call sites
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `createSettingsCoreSetupRuntime(...)` dependency shaping block out of `main.js` into `src/app/settingsCoreAssemblyRuntime.js`
    - `main.js` still provides the concrete settings/runtime functions and values, but the settings-core dependency object is no longer assembled inline at the call site
  - Continued Phase 5/6 orchestration cleanup:
    - finished the map-lighting app-layer extraction by collapsing the remaining `createMapLightingAssemblyRuntime(createMapLightingAssemblyRuntimeDeps(...))` call-site literal into `src/app/mapLightingAssemblyRuntime.js`
    - `main.js` now calls a single app-level `createMapLightingSetupRuntime(...)` entry point instead of shaping the large flat map-lighting payload inline
  - Continued Phase 5/6 orchestration cleanup:
    - finished the swarm-UI app-layer extraction by collapsing the remaining `createSwarmUiRuntimeBinding(createSwarmUiAssemblyRuntime(...))` call-site literal into `src/app/swarmUiAssemblyRuntime.js`
    - `main.js` now calls a single app-level `createSwarmUiSetupRuntime(...)` entry point instead of shaping the large swarm-UI payload inline
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `createTimeLightingSetupRuntime(...)`, `createSwarmRuntime(...)`, and `createRenderPipelineRuntime(...)` dependency shaping blocks out of `main.js` into `src/app/runtimeFeatureAssemblyRuntime.js`
    - `main.js` still provides the concrete runtime values and callbacks, but those top-level feature payloads are no longer assembled inline at the call sites
  - Continued Phase 5/6 orchestration cleanup:
    - moved the `createLightInteractionRuntimeBinding(...)`, `createSystemStoreSyncRuntime(...)`, and `createMovementSystem(...)` dependency shaping blocks out of `main.js` into `src/app/interactionFeatureAssemblyRuntime.js`
    - `main.js` still provides the concrete runtime values and callbacks, but those interaction/system/movement payloads are no longer assembled inline at the call sites
  - Continued Phase 5/6 orchestration cleanup:
    - moved the default-map bootstrap and camera-binding setup payloads out of `main.js` into `src/app/bootstrapFeatureAssemblyRuntime.js`
    - `main.js` now initializes fallback map images and camera binding through app-level setup helpers instead of assembling those payloads inline
  - Continued Phase 6 ownership/name cleanup:
    - removed more bridge-era handoff names that no longer reflected real ownership:
      - `gameplay/mapLightingAssemblyRuntime.js` now exposes `pointLightApi` instead of `pointLightFacade`
      - `app/swarmIntegrationAssemblyRuntime.js` / `app/swarmIntegrationSetupRuntime.js` now use `interactionContext`, `interactionModeBinding`, `mainInteractionBindings`, `swarmOverlayRuntime`, and `updateInfoPanel` instead of old facade/runtime wrapper labels
      - `main.js` now consumes those direct-owner names, reducing migration-era naming noise without changing behavior
  - Continued Phase 7 verification:
    - replaced the remaining facade-era tests with current-owner coverage:
      - `tests/mainRuntimeStateFacadeRuntime.test.js` -> `tests/mainRuntimeStateBinding.test.js`
      - `tests/runtimeSyncFacadeRuntime.test.js` -> `tests/swarmRuntime.test.js`
    - full JS suite now passes with `node --test tests/*.test.js` (`15/15`)
  - Continued Phase 7 verification:
    - manual smoke testing passed in browser runtime
    - Tauri full build passed
    - installed desktop build launched and basic play testing passed
    - this is strong validation for current migration state, but the finer Phase 7 behavior/performance checklist items remain open until they are verified explicitly
  - Final close-out:
    - completed the last stable-owner naming cleanup around settings/time/interaction UI handoffs
    - confirmed code-level ownership boundaries by audit:
      - runtime-hot DOM reads are confined to UI reflection/binding modules
      - store mutation ownership remains concentrated in sync-focused modules
    - full JS suite passes (`15/15`)
    - browser smoke test, Tauri build, and installed desktop smoke testing all passed
    - migration status is now complete
