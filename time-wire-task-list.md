# Time Wire Task List

Last updated: 2026-04-25
Owner: Codex + Marc
Branch policy: dedicated implementation branch, no direct commits to `main`
Primary scope: complete the transition from hybrid time wiring to a fully migrated runtime architecture

## Purpose

This file is the implementation control document and session-to-session memory for the time-wiring feature and the remaining architecture migration needed to make it the final runtime model.

## Current Status

Important clarification:
- The time-wiring feature itself is largely implemented.
- The architecture migration is not complete.
- The runtime is currently hybrid.

Current hybrid structure:
- `src/main.js` still owns most live runtime state, DOM input reads, render orchestration, overlay drawing, and significant gameplay state.
- `src/core/frameSnapshot.js` has been removed.
- `runtimeCore.scheduler` systems run against that core state.
- `src/core/runtimeParityAdapter.js` has been removed.
- Core store updates now happen through commands, settings apply/bootstrap synchronization, and scheduler system updates.

Meaning:
- The newer core/scheduler path is active and real.
- The legacy runtime path is still the dominant owner.
- The adapter layers are gone, but some domains still retain DOM-backed helpers and duplicated ownership patterns.

So:
- Time wiring is not blocked.
- Full migration is the remaining strategic task.

## What Is Done

Implemented already:
- Fixed-step time router foundation.
- Routed timing for movement, swarm, clouds, water, and weather context.
- Queued movement instead of pathfinding teleport.
- Sim tick configuration and routing persistence.
- Swarm and cloud smoothing/interpolation.
- Water detached by default.
- Initial command/state/settings contract wiring.
- Targeted tests for tick math and movement queue behavior.

Done does not mean:
- core state is the only source of truth
- `main.js` no longer owns runtime state
- DOM controls are passive views
- frame snapshot / parity adapters are removable

## Migration Target

Target end state:
- Core state is the single source of truth for runtime state.
- Scheduler systems read canonical core state directly.
- UI controls dispatch commands into state instead of being read ad hoc by runtime code.
- Render code consumes already-resolved state instead of reading DOM inputs directly.
- `src/core/frameSnapshot.js` is removed.
- `src/core/runtimeParityAdapter.js` is removed.
- `src/main.js` becomes a thin composition layer:
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
- Do not mark migration done until adapter layers are removed from runtime.

## Phase Overview

1. Architecture Baseline and Gap Mapping
2. Canonical State Contract Completion
3. Control/Input Ownership Migration
4. Simulation/System Ownership Migration
5. Render/Input Decoupling
6. Adapter Removal
7. Verification and Documentation

## Detailed Task List

### Phase 1: Architecture Baseline and Gap Mapping

Dependencies: none

- [x] P1.1 Confirm current runtime is hybrid
  - [x] P1.1.1 Confirm `src/main.js` still owns live runtime state.
  - [x] P1.1.2 Confirm `src/core/frameSnapshot.js` still mirrors runtime into core store.
  - [x] P1.1.3 Confirm `src/core/runtimeParityAdapter.js` still mirrors some state back out.
- [x] P1.2 Capture migrated vs non-migrated ownership
  - [x] P1.2.1 Time routing foundation is in place.
  - [x] P1.2.2 Movement queue/tick execution is in place.
  - [x] P1.2.3 Render, DOM, and much of runtime state are still `main.js` owned.
- [x] P1.3 Create explicit ownership map for remaining migration
  - [x] P1.3.1 List all runtime domains still reading DOM inputs directly.
    - point-light editor draft controls still read DOM input values directly during editor interaction (`strength`, `intensity`, `heightOffset`, `flicker`, `flickerSpeed`).
    - swarm range normalization helpers still read DOM values to clamp/correct paired controls (`min/max height`, `follow zoom in/out`) before reflecting normalized values.
    - map/load-save and file-picker flows still read DOM/path inputs directly by design at event time.
    - note: runtime-hot render/system settings reads are now store-backed; remaining direct reads are mostly event-time UI/editor paths.
  - [x] P1.3.2 List all core state branches that are still snapshots instead of authoritative state.
    - `camera` is still runtime-driven (local `panWorld`/`zoom`) and mirrored into store; follow-camera path now explicitly syncs this mirror.
    - `gameplay.swarm.enabled/count/follow*` mirrors live swarm runtime (`swarmState`, follow locals) rather than being the sole simulation authority.
    - `gameplay.movement` is a movement-system runtime snapshot exposed into store for UI/scheduler integration.
    - `map.folderPath/loaded/size` is runtime/map-load driven and synchronized into store.
    - several transient editor/runtime states remain local-only (point-light editor draft/selection, cursor pointer transient, hover/path preview caches).
  - [x] P1.3.3 List all places where parity writes state back into runtime/DOM.

Exit criteria:
- Hybrid-state reality is documented.
- Remaining migration surface is explicit enough to sequence cleanly.

### Phase 2: Canonical State Contract Completion

Dependencies: Phase 1

- [-] P2.1 Make core state complete enough to become sole runtime authority
  - [x] P2.1.1 Audit missing authoritative state branches for:
    - render FX controls
    - pathfinding settings
    - swarm settings
    - interaction mode
    - camera state
    - map/session state
  - [-] P2.1.2 Remove any remaining dependence on reading those values primarily from DOM inputs.
  - [-] P2.1.3 Ensure settings defaults/serialize/apply paths align with canonical core state shape.
- [-] P2.2 Define stable command surface for all user-driven state changes
  - [-] P2.2.1 Route all mutable UI-backed settings through commands.
  - [-] P2.2.2 Remove direct imperative state mutation where command routing should own behavior.
  - [-] P2.2.3 Ensure commands update both state and required side effects.
- [ ] P2.3 Clarify ownership boundaries
  - [ ] P2.3.1 Core store owns persistent/config/runtime gameplay state.
  - [ ] P2.3.2 Renderer consumes resolved state but does not own it.
  - [ ] P2.3.3 DOM reflects state and emits commands, but is not authoritative.

Exit criteria:
- Core state model is complete enough that runtime snapshots are no longer needed for missing branches.

### Phase 3: Control/Input Ownership Migration

Dependencies: Phase 2

- [-] P3.1 Convert DOM controls from source-of-truth to state views
  - [x] P3.1.1 Time controls (`cycleSpeed`, `simTickHours`, routing controls).
  - [-] P3.1.2 Pathfinding controls.
  - [-] P3.1.3 Fog/cloud/water/parallax/lighting controls.
  - [-] P3.1.4 Swarm controls.
- [-] P3.2 Remove direct DOM reads from runtime-hot paths
  - [-] P3.2.1 Eliminate per-frame settings reads that should come from core state.
  - [-] P3.2.2 Eliminate system logic that derives behavior from raw inputs instead of state.
  - [ ] P3.2.3 Keep only event-time UI reads inside bindings where unavoidable.
- [-] P3.3 Make UI update one-way
  - [-] P3.3.1 State change updates labels/inputs/UI.
  - [-] P3.3.2 User interaction dispatches command.
  - [-] P3.3.3 Remove implicit two-way parity behavior.

Exit criteria:
- Runtime logic no longer depends on DOM inputs as the primary state source.

### Phase 4: Simulation/System Ownership Migration

Dependencies: Phase 2, Phase 3

- [-] P4.1 Make scheduler/core systems read only canonical core state
  - [x] P4.1.1 Time system.
  - [x] P4.1.2 Lighting system.
  - [x] P4.1.3 Fog system.
  - [x] P4.1.4 Cloud system.
  - [x] P4.1.5 Water FX system.
  - [x] P4.1.6 Weather system.
  - [-] P4.1.7 Pathfinding/movement integration.
- [-] P4.2 Move remaining gameplay runtime ownership out of `main.js`
  - [-] P4.2.1 Player/gameplay state snapshots become authoritative state or system-owned runtime.
  - [-] P4.2.2 Swarm settings/runtime ownership boundaries are explicit and non-duplicated.
  - [x] P4.2.3 Camera state ownership is explicit and does not bounce between runtime and core.
- [x] P4.3 Stop per-frame snapshot feeding
  - [x] P4.3.1 Replace `updateCoreFrameSnapshot(...)` inputs with authoritative state access.
  - [x] P4.3.2 Ensure scheduler update context only carries transient frame values (`nowMs`, `dtSec`, routed time), not mirrored runtime state.
  - [x] P4.3.3 Delete remaining snapshot-only helper functions once no longer needed.

Exit criteria:
- Scheduler no longer depends on frame-by-frame mirrored runtime state.

### Phase 5: Render/Input Decoupling

Dependencies: Phase 4

- [-] P5.1 Make render preparation consume resolved state, not raw inputs
  - [-] P5.1.1 Uniform input construction reads from core/system state.
  - [-] P5.1.2 Frame render state construction reads from core/system state.
  - [-] P5.1.3 Overlay rendering reads canonical gameplay/render state.
- [-] P5.2 Remove ad hoc render-time settings assembly where possible
  - [ ] P5.2.1 Avoid recomputing settings snapshots from DOM every frame.
  - [-] P5.2.2 Keep only genuinely transient frame calculations in render loop.
- [-] P5.3 Reduce `main.js` to orchestration
  - [ ] P5.3.1 Keep boot/setup.
  - [ ] P5.3.2 Keep render loop orchestration.
  - [-] P5.3.3 Move runtime domain logic into modules when still embedded.

Exit criteria:
- Render loop consumes canonical state with minimal state reconstruction.

### Phase 6: Adapter Removal

Dependencies: Phases 3, 4, 5

- [-] P6.1 Remove runtime-to-core mirroring
  - [x] P6.1.1 Delete `src/core/frameSnapshot.js` usage from `src/main.js`.
  - [-] P6.1.2 Remove obsolete snapshot getters whose only role was frame mirroring.
- [-] P6.2 Remove core-to-runtime parity writes
  - [x] P6.2.1 Delete `src/core/runtimeParityAdapter.js` usage from `src/main.js`.
  - [-] P6.2.2 Remove remaining DOM/runtime write-back assumptions.
- [-] P6.3 Simplify interfaces after bridge removal
  - [-] P6.3.1 Remove dead command/state plumbing that existed only for parity.
  - [-] P6.3.2 Remove duplicate state derivations and duplicate caches.

Exit criteria:
- No frame snapshot bridge remains.
- No runtime parity bridge remains.
- Core state is the one-way authoritative model.

### Phase 7: Verification and Documentation

Dependencies: Phase 6

- [ ] P7.1 Behavior verification
  - [ ] P7.1.1 Verify time routing behavior still matches current feature behavior.
  - [ ] P7.1.2 Verify movement queue behavior still matches shipped behavior.
  - [ ] P7.1.3 Verify swarm/cloud smoothing still behaves correctly.
  - [ ] P7.1.4 Verify map save/load still preserves settings.
- [ ] P7.2 Performance verification
  - [ ] P7.2.1 Check that frame snapshot/parity churn is gone.
  - [ ] P7.2.2 Re-profile periodic hitching after bridge removal.
  - [ ] P7.2.3 Remove any remaining high-frequency DOM/state churn found during validation.
- [-] P7.3 Documentation updates
  - [-] P7.3.1 Update `README.md` to describe final runtime architecture and controls.
  - [-] P7.3.2 Update `AI_CONTEXT.md` to match final ownership model.
  - [ ] P7.3.3 Update `AGENTS.md` if workflow/runtime notes changed.
- [ ] P7.4 Task-list closure
  - [ ] P7.4.1 Replace hybrid-state note with final-state note.
  - [ ] P7.4.2 Mark migration complete only after adapters are actually removed.

Exit criteria:
- Behavior matches expectations.
- Performance is revalidated after simplification.
- Docs match the final architecture.

## Dependency Map

- Phase 1 -> Phase 2
- Phase 2 -> Phase 3, Phase 4
- Phase 3 + Phase 4 -> Phase 5
- Phases 3, 4, 5 -> Phase 6
- Phase 6 -> Phase 7

Critical path:
- P1 -> P2 -> P3 -> P4 -> P5 -> P6 -> P7

## Completion Definition

Migration is only complete when all of the following are true:
- Core state is the authoritative runtime state model.
- Scheduler systems consume canonical state directly.
- Render loop does not rebuild core state from runtime snapshots each frame.
- DOM controls are not used as runtime truth.
- `src/core/frameSnapshot.js` is unused and removed.
- `src/core/runtimeParityAdapter.js` is unused and removed.
- `src/main.js` is reduced to composition/orchestration rather than mixed ownership.

## Immediate Next Work

Recommended next sequence:
- [-] N1 Close remaining Phase 2 command-surface/state-contract work:
  - finish removing remaining DOM-primary dependencies in settings/control flows
  - complete ownership-boundary clarification across core/renderer/DOM
- [-] N2 Close explicit runtime ownership boundaries in Phase 4:
  - finish swarm/player ownership split so runtime mirrors are minimized and deliberate
  - close remaining point-light runtime helper ownership now that bake/editor/io paths are mostly extracted
- [-] N3 Continue Phase 5 extraction and reduce `main.js` further:
  - move remaining embedded render/gameplay orchestration out of `main.js`
  - collapse remaining thin wrappers whose only role is legacy naming shims after call-sites migrate
  - keep `main.js` focused on boot + wiring + frame orchestration

## Session Log

Keep this section short. Detailed extraction history belongs in git log and code, not here.

- 2026-04-22:
  - Created this document to track the remaining migration from hybrid time wiring to the final runtime model.
  - Landed the fixed-step time router, routed-time plumbing, movement queue behavior, routing persistence, and targeted timing/movement tests.
  - Clarified that time wiring is mostly implemented but the broader runtime migration is still incomplete.
- 2026-04-23:
  - Removed the old per-frame bridge layers from active runtime usage (`frameSnapshot`, `runtimeParityAdapter`).
  - Moved a large slice of settings, bindings, and runtime composition out of `main.js` into focused modules and runtime-binding helpers.
  - Current remaining hotspots after that pass:
    - DOM reflection/apply flows still exist in some settings/control paths
    - swarm/player/point-light ownership is still not fully simplified
    - `main.js` is smaller but still owns too much domain orchestration
- 2026-04-24:
  - Fixed a migration regression where terrain hover/click stopped working for pathfinding, teleport, and point-light editing.
  - Root cause: extracted camera transform helpers treated `zoomValue: null` as `0`, breaking pointer hit-testing against the current camera view.
  - Reduced one remaining DOM-as-truth pattern in the point-light editor path by letting label updates consume explicit draft/state values instead of rereading input elements after UI reflection.
  - Reduced another DOM-primary pattern in swarm startup/apply normalization by letting swarm range/zoom normalization helpers accept explicit state values instead of only rereading paired input elements.
  - Reduced a remaining DOM-primary pattern in swarm panel bindings by sourcing paired follow-zoom and min/max-height values from canonical swarm settings instead of sibling input elements.
  - Clarified point-light editor ownership by syncing save-confirm armed state into canonical `gameplay.pointLights` state instead of leaving it only in controller-local memory.
  - Clarified player ownership for manual reposition by making `setPlayerPosition(...)` publish canonical player state immediately rather than relying on a second sync call afterward.
  - Reduced duplicated swarm ownership by extracting follow apply/stop plus swarm runtime/store sync composition into `src/gameplay/swarmRuntime.js`, and by removing inline swarm store snapshot assembly from `registerMainCommands.js`.
  - Reduced another swarm ownership hotspot by moving follow target-index/smoothing mutations behind `src/gameplay/swarmFollowRuntimeState.js` instead of scattering direct `swarmFollowState` writes across reseed, remove, serialization, and follow-camera paths.
- 2026-04-25:
  - Hardened several recent extraction-order regressions in startup/runtime wiring:
    - camera/pathfinding/render-fx/light-editor wrapper surfaces in `main.js` now resolve through hoisted lazy accessors instead of late alias bindings
    - swarm store-sync and follow-runtime paths now tolerate missing early deps (`store`, follow snapshot state, `isSwarmEnabled`) during startup sequencing
  - Reduced normal startup noise:
    - optional map sidecar JSON loads now fail quietly when files are absent and only warn on malformed JSON/unexpected load failures
    - added `assets/favicon.svg` and linked it from `index.html`
  - Continued Phase 2/5 migration work by extracting a canonical settings facade into `src/core/settingsRuntimeBinding.js`, removing another long settings serialize/apply/default ownership block from `main.js`.
  - Continued the same ownership reduction by extracting the remaining legacy settings/UI composition block into `src/ui/settingsLegacyRuntimeBinding.js`.
  - Reduced one remaining command-to-DOM write-back hotspot by moving pathfinding input reflection behind `src/ui/pathfindingSettingsApplier.js`, so pathfinding command handlers no longer mutate those input elements directly.
  - Reduced another command-to-UI write-back hotspot by grouping render-FX UI reflection behind `src/ui/renderFxSettingsSyncRuntime.js`, so `registerMainCommands.js` no longer expands those label/UI updates inline for parallax/lighting/fog/cloud/water changes.
  - Reduced the remaining swarm command-to-UI write-back hotspot by grouping swarm panel reflection behind `src/ui/swarmSettingsSyncRuntime.js`, so swarm settings commands no longer write a long list of swarm inputs inline.
  - Reduced another small command-to-input write-back hotspot by grouping routing/cycle-speed/sim-tick input reflection behind `src/ui/timeRoutingSettingsSyncRuntime.js`.
  - Continued Phase 5 extraction by moving command dependency assembly out of the `registerMainCommands(...)` call site into `src/core/mainCommandDepsRuntime.js`.
  - Continued Phase 5 extraction by moving scheduler/system registration plus initial runtime-store synchronization out of `main.js` into `src/core/runtimeSystemSetup.js`.
  - Continued Phase 5 extraction by grouping store-backed gameplay/runtime state accessors behind `src/gameplay/mainRuntimeStateBinding.js` instead of keeping those wrappers inline in `main.js`.
  - Continued Phase 5 extraction by moving the long settings serialize/apply/default shim surface behind `src/core/settingsFacadeRuntime.js`, so `main.js` no longer owns that facade inline.
  - Continued Phase 5 extraction by grouping swarm state/UI composition behind `src/ui/swarmUiRuntimeBinding.js`, so `main.js` no longer owns the inline block that assembled swarm runtime-state access, swarm panel reflection, swarm normalization, and routing-input sync.
  - Continued Phase 5 extraction by grouping the bottom-of-file bind/setup orchestration behind `src/ui/mainBindingsRuntime.js` and startup kickoff/error handling behind `src/core/appStartupRuntime.js`.
  - Continued Phase 5 extraction by grouping the remaining camera/player/interaction/info-panel adapter surface behind `src/gameplay/mainFacadeRuntime.js`.
  - Continued Phase 5 extraction by grouping render support, map support, render pipeline, and light/pathfinding/render-FX wrapper composition behind:
    - `src/render/renderSupportRuntime.js`
    - `src/gameplay/mapSupportRuntime.js`
    - `src/render/renderPipelineRuntime.js`
    - `src/ui/uiRuntimeFacade.js`
  - Continued Phase 5 extraction by moving more `main.js` orchestration-only assembly behind:
    - `src/ui/mainBindingsSetupRuntime.js`
    - `src/render/frameLoopBindingRuntime.js`
    - `src/core/appStartupBindingRuntime.js`
  - Continued Phase 5 extraction by moving the remaining inline swarm-UI and render-FX UI composition blocks behind:
    - `src/ui/swarmUiSetupRuntime.js`
    - `src/ui/renderFxUiSetupRuntime.js`
  - Continued Phase 5 extraction by moving more large declarative setup blocks behind:
    - `src/ui/settingsLegacySetupRuntime.js`
    - `src/gameplay/pointLightSetupRuntime.js`
    - `src/gameplay/mapLifecycleSetupRuntime.js`
  - Current result after these passes: `src/main.js` is down to roughly 3624 lines in the worktree, but it is still the largest integration surface and Phase 5/6 remain open.
  - Continued Phase 5 extraction by grouping low-level GL/flow-map/shadow/cloud support behind `src/render/renderSupportRuntime.js`.
  - Continued Phase 5 extraction by grouping map path/Tauri/image/sampling/shadow-occlusion support behind `src/gameplay/mapSupportRuntime.js`.
  - `main.js` remains roughly in the 3.8k-line range in the current worktree, so it is still too large to honestly mark Phase 5/6 complete.
  - Reduced `main.js` further by extracting swarm interpolation/update/follow-camera composition into `src/gameplay/swarmLoopRuntime.js`.
  - Moved swarm follow target indices into canonical `gameplay.swarm` state (`followAgentIndex`, `followHawkIndex`) so follow target ownership no longer lives only in runtime locals.
  - Reduced `main.js` further by extracting swarm gameplay composition (environment, targeting, mutator, reseed, swarm data apply/serialize) into `src/gameplay/swarmGameplayRuntime.js`.
  - Clarified point-light ownership by keeping editor selection/draft explicitly transient-only runtime state while persisted point-light data and save-confirm state stay canonical/store-backed.
  - Reduced `main.js` further by extracting point-light editor/selection/draft/io composition into `src/gameplay/pointLightRuntime.js`.
  - Reduced another DOM-primary settings path by making swarm follow-zoom and min/max-height command normalization resolve paired values from canonical swarm settings instead of sibling DOM inputs in panel bindings.
  - Reduced `main.js` further by extracting map runtime-state/load/save/bootstrap composition into `src/gameplay/mapLifecycleRuntime.js`.
  - Reduced another DOM-primary settings path by making render-FX bindings dispatch field-level patches while `core/renderFx/changed` normalizes the full section from canonical store state.
  - Reduced `main.js` further by extracting point-light bake composition into `src/render/pointLightBakeRuntimeBinding.js`, including worker access reused by map-image runtime sync.
  - Reduced `main.js` further by extracting render-FX UI wrapper composition into `src/ui/renderFxUiBindingRuntime.js` and pathfinding label wrapper composition into `src/ui/pathfindingLabelBindingRuntime.js`.
  - Reduced `main.js` further by extracting pathfinding cost-model/preview composition and movement-field ownership into `src/gameplay/pathfindingRuntimeBinding.js`.
  - Reduced `main.js` further by extracting camera view/coordinate transform composition into `src/gameplay/cameraRuntimeBinding.js`.
  - Reduced `main.js` further by extracting player/NPC composition into `src/gameplay/playerRuntimeBinding.js`.
  - Reduced `main.js` further by extracting mode/topic plus interaction-snapshot composition into `src/ui/modeInteractionRuntimeBinding.js`.
  - Reduced `main.js` further by extracting cursor-light and point-light editor interaction composition into `src/gameplay/lightInteractionRuntimeBinding.js`.
  - Current recommended next sequence remains:
    - close remaining Phase 2 command-surface/state-contract work
    - close Phase 4 ownership boundaries for swarm/player/point-light runtime
    - continue Phase 5 extraction to reduce `main.js` further
