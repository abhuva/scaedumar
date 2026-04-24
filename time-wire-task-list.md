# Time Wire Task List

Last updated: 2026-04-24
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

- 2026-04-22:
  - Created `time-wire-task-list.md` as the implementation planning document for fixed-step timing integration.
  - Revised the document to match the repository's migration-task style:
    - added status markers
    - added phase/task/subtask IDs
    - added dependency map
    - added compatibility checklist
    - added session log
  - Incorporated 2026-04-21 timing architecture notes:
    - fixed-step gameplay/simulation direction
    - `0.01h` base tick concept
    - queued action model
    - cost-to-hours movement example
    - rewind explicitly dropped
    - renderer vs fixed-step split
  - Updated the plan so map-level sim tick size is a task item under persistence/settings instead of an open-ended note.
  - Implementation started on branch `time-wiring`:
    - added core fixed-step time router foundation (`src/core/timeRouter.js`) and wired frame-time routing into scheduler context
    - added routing/tick state to core time state and command plumbing for `simTickHours` + per-system routing
    - replaced pathfinding teleport with movement queue scheduling + fixed-tick execution semantics
    - added initial routing UI/persistence controls for swarm/cloud/water and sim tick
    - split cloud/water shader time inputs so cloud can follow routed global time while water remains detached by default
    - added targeted tests for time-router math and movement queue tick execution
  - Confirmed baseline global timing mapping stays in place for now (`0.08 h/s` reference).
  - Clarified that time wiring is implemented on top of a hybrid runtime, not a fully completed architecture migration.
  - Replaced the old feature-only checklist with a migration-completion plan:
    - documented current hybrid architecture
    - defined final single-source-of-truth target
    - added ordered migration phases, subtasks, and dependencies
    - defined completion criteria for removing `frameSnapshot` and `runtimeParityAdapter`
- 2026-04-23:
  - Removed the per-frame bridge layers from active runtime usage:
    - deleted `src/core/frameSnapshot.js`
    - deleted `src/core/runtimeParityAdapter.js`
    - deleted unused `src/gameplay/pathfindingSystem.js`
  - Replaced per-frame runtime mirroring with explicit state synchronization on:
    - bootstrap
    - map load/apply
    - settings apply
    - command-driven changes
    - scheduler-owned system updates
  - Moved active time/render FX/pathfinding/swarm logic to prefer canonical core state over live DOM reads.
  - Migration is still not complete:
    - some UI/update/apply helpers still read/write DOM directly
    - `main.js` still owns too much orchestration and domain logic
  - Continued store-first migration after bridge removal:
    - time/render FX systems now prefer core-state settings over direct DOM reads
    - settings apply flows seed canonical store state before legacy DOM reflection
    - remaining UI enable/disable helpers were moved to serialized/store-backed snapshots for:
      - parallax
      - fog
      - clouds
      - water
      - volumetrics
      - point flicker
      - cursor light follow-height
      - swarm panel state
      - swarm stats panel visibility
  - Remaining migration hotspots after this pass:
    - interaction/cursor-light settings still mix runtime state and DOM reflection
    - some swarm/bootstrap defaults still originate from direct DOM values
    - `main.js` still contains too much domain logic and should be reduced further
  - Continued interaction-state migration:
    - cursor-light canonical state now includes config fields previously leaking through DOM/runtime locals:
      - enabled
      - color
      - gizmo visibility
    - cursor-light "enabled" is now separated from transient pointer-inside activity
      - avoids canonical state flipping to disabled when the cursor leaves the canvas
    - point-light live-update is now synchronized back into canonical gameplay state on user changes
    - interaction serialization now prefers canonical cursor-light and point-light state instead of reading raw DOM values
  - Remaining migration hotspots after this pass:
    - interaction/pathfinding state still has DOM reflection in apply/bootstrap flows
    - some swarm/bootstrap defaults still originate from direct DOM values
    - `main.js` still contains too much domain logic and should be reduced further
  - Continued pathfinding/interaction-mode migration:
    - pathfinding control bindings now dispatch explicit values into commands instead of relying on DOM reads during command handling
    - pathfinding command handlers now clamp and write normalized values before syncing canonical state
    - hot-path interaction-mode reads now prefer canonical store state through a snapshot getter
    - mode-capability enforcement now synchronizes forced interaction-mode changes back into canonical state
  - Remaining migration hotspots after this pass:
    - pathfinding apply/bootstrap still reflects through DOM before becoming fully store-driven
    - interaction mode still keeps a local runtime fallback cache in `main.js`
    - some swarm/bootstrap defaults still originate from direct DOM values
    - `main.js` still contains too much domain logic and should be reduced further
  - Continued store-first cleanup in interaction/pathfinding:
    - pathfinding runtime snapshot now reads canonical store state only
    - interaction-mode changes now write canonical gameplay state directly from `setInteractionMode(...)`
    - local `interactionMode` is no longer used as the hot-path source of truth
  - Remaining migration hotspots after this pass:
    - pathfinding apply/bootstrap still reflects through DOM before becoming fully store-driven
    - `interactionMode` local cache still exists in `main.js` and should be removed entirely
    - some swarm/bootstrap defaults still originate from direct DOM values
    - `main.js` still contains too much domain logic and should be reduced further
  - Continued interaction apply cleanup:
    - removed the remaining local `interactionMode` mirror and redundant command-side store writes around it
    - `applyInteractionSettingsLegacy(...)` now behaves more like store-to-view reflection:
      - pathfinding inputs are populated from canonical pathfinding state
      - cursor-light inputs are populated from canonical cursor-light state
      - point-light live-update toggle is populated from canonical gameplay state
  - Remaining migration hotspots after this pass:
    - interaction/pathfinding apply/bootstrap still uses DOM reflection as the final view layer
    - some swarm/bootstrap defaults still originate from direct DOM values
    - `main.js` still contains too much domain logic and should be reduced further
  - Continued swarm store-first cleanup:
    - `getSwarmSettings()` now resolves from canonical gameplay state with defaults, instead of falling back to swarm DOM controls
    - `setSwarmDefaults()` now seeds canonical swarm state first and only then reflects UI controls from that state
    - `applySwarmSettingsLegacy(...)` now acts as store-to-view reflection for swarm settings rather than treating raw JSON/input as direct UI truth
    - swarm follow-target resets during settings apply now synchronize back into canonical gameplay state
    - render background color now uses canonical swarm settings instead of reading `swarmBackgroundColorInput` in the frame loop
    - swarm command handling no longer reads raw DOM for:
      - agent-count reseed
      - enabled-toggle branch behavior
      - follow-target selection when starting follow mode
  - Remaining migration hotspots after this pass:
    - swarm bindings still dispatch generic change actions instead of fully normalized payloads
    - some apply/bootstrap flows still end in DOM reflection rather than a pure state-driven view layer
    - `main.js` still owns too much swarm runtime/simulation orchestration
  - Continued command-surface cleanup:
    - swarm panel bindings now dispatch explicit payloads per control instead of generic "something changed" actions
    - swarm command handling now clamps, normalizes, and stores those payloads directly instead of reading swarm DOM inputs during command execution
    - swarm command handling still reflects normalized values back into inputs where the UI needs corrected bounds
    - startup time-routing and sim-tick fallback no longer reads routing/tick values from DOM inputs when canonical store state is absent
    - cursor-light startup fallback and live-update fallback were reduced further away from raw DOM state
  - Remaining migration hotspots after this pass:
    - some render and serialization helpers still retain DOM fallbacks for startup compatibility
    - several apply/bootstrap paths still use DOM reflection as the last UI sync layer
    - `main.js` still owns too much domain/runtime orchestration beyond pure composition
  - Continued settings-serialization cleanup:
    - lighting/fog/parallax/cloud/water legacy serializers now prefer canonical store-backed knobs or registry defaults instead of falling back to live DOM inputs
    - startup fallback for cursor-light state was moved from DOM inputs to interaction defaults
    - point-light live-update fallback now resolves from canonical gameplay state/default behavior instead of checkbox state
  - Remaining migration hotspots after this pass:
    - several apply helpers still mirror canonical state into DOM controls as a final reflection layer
    - some render-time setup paths still keep DOM fallbacks where canonical settings/defaults should be sufficient
    - `main.js` is still larger than the target composition-only end state
  - Continued render/setup decoupling:
    - `buildUniformInputState(...)` now resolves lighting/parallax/fog/cloud/water uniforms from canonical settings or registry defaults instead of reading panel inputs
    - flow-map rebuild settings now come from canonical water settings/defaults instead of water panel inputs
    - shadow-pass uniform setup now reads lighting settings/defaults instead of shadow controls
    - point-light bake height-scale lookup now reads canonical lighting settings/defaults instead of the height-scale input
    - `computeLightingParams(...)` now falls back to canonical/default lighting and fog settings instead of render-time DOM reads
  - Remaining migration hotspots after this pass:
    - apply helpers still use DOM reflection as the last UI sync layer
    - some non-settings runtime/editor paths still read local inputs directly by design and may need later separation
    - `main.js` still owns too much rendering/gameplay orchestration for the final target
  - Continued apply-path cleanup:
    - `applyLightingSettingsLegacy(...)` now reflects from canonical lighting/time/ui state instead of raw loaded input
    - `applyFogSettingsLegacy(...)`, `applyParallaxSettingsLegacy(...)`, `applyCloudSettingsLegacy(...)`, and `applyWaterSettingsLegacy(...)` now reflect canonical state/defaults instead of raw loaded input
    - cloud/water routing input reflection now resolves from canonical time routing state
  - Remaining migration hotspots after this pass:
    - apply helpers still exist as DOM reflection layers, even though they are now canonical-state based
    - runtime/editor-only local state still exists in point-light editing, cursor movement, and some map-load/bootstrap flows
    - `main.js` still remains the largest ownership surface and needs further decomposition
  - Continued bootstrap/hydration cleanup:
    - added explicit map hydration helpers for:
      - setting current map folder path + syncing map state
      - applying default per-map settings
      - resetting runtime state after images are loaded
    - default-map load and folder-selection load now share the same canonical reset/hydration path instead of duplicating the settings/bootstrap sequence inline
  - Remaining migration hotspots after this pass:
    - map/bootstrap still lives inside `main.js` and is only partially decomposed into helpers
    - runtime/editor-only local state still exists in point-light editing, cursor movement, and follow/editor flows
    - `main.js` is still the dominant owner and needs further extraction before migration can be called complete
  - Continued runtime/editor-state cleanup:
    - point-light editor selection/draft lifecycle is now centralized through explicit helper functions instead of scattered inline mutations
    - clearing light selection and creating editor drafts now go through a single ownership path
  - Remaining migration hotspots after this pass:
    - point-light editor state is still local runtime state, only better contained
    - cursor/follow transient state still lives in `main.js`
    - larger extraction of editor/gameplay/runtime ownership is still pending
  - Continued transient-state and render-read cleanup:
    - cursor-light pointer lifecycle is now centralized through explicit helper functions instead of scattered inline mutations
    - swarm follow start/stop/apply state now goes through explicit helper functions, reducing ad hoc follow-state mutation across `main.js` and command handlers
    - canvas hover redraw no longer checks cursor-light checkbox DOM state directly
    - `applyInteractionSettingsLegacy(...)` no longer prewrites raw loaded interaction values into the DOM before reflecting canonical state
    - shadow-blur render pass now reads canonical lighting settings instead of `shadowBlurInput` directly during render setup
    - point-light editor selection/draft state has been extracted into `src/gameplay/pointLightEditorState.js`, removing another local inline state pocket from `main.js`
    - cursor-light runtime state has been extracted into `src/gameplay/cursorLightState.js`, removing another transient state container from `main.js`
    - point-light JSON parse/serialize logic has been extracted into `src/gameplay/pointLightsPersistence.js`, reducing `main.js` gameplay/domain ownership further
    - point-light editor UI reflection has been extracted into `src/ui/pointLightEditorUi.js`, reducing `main.js` view-sync responsibility
  - Remaining migration hotspots after this pass:
    - point-light editor command/orchestration behavior still lives in `main.js`, though state, persistence, and UI reflection are now extracted
    - some map/bootstrap and editor-only flows still live inside `main.js`
    - `main.js` still remains the dominant orchestration surface and needs further extraction before migration can be called complete
  - Continued camera ownership cleanup:
    - added explicit camera-store synchronization when swarm follow updates camera pan/zoom directly, so `coreState.camera` stays aligned outside command-driven camera events
    - added camera branch synchronization to `syncCoreSettingsStateFromRuntime(...)` to keep bootstrap/apply sync paths consistent
  - Continued command-surface + apply-path cleanup:
    - added explicit `core/pointLights/setLiveUpdate` command; point-light live-update toggle now routes through command handling instead of calling full runtime->store sync
    - removed `syncCoreSettingsStateFromRuntime(...)` calls from per-settings apply paths (`lighting`, `fog`, `parallax`, `clouds`, `waterfx`, `interaction`, `swarm`) to reduce implicit two-way parity churn
    - `applyLoadedNpc(...)` now performs targeted player-store sync instead of full runtime sync
  - Continued runtime snapshot-boundary cleanup:
    - added guarded `syncSwarmRuntimeStateToStore()` and wired it into swarm simulation update and swarm-data apply flows
    - swarm runtime (`enabled`, `count`, follow flags/target) now stays synchronized with canonical gameplay state without requiring global runtime-sync passes
    - removed leftover naming/intent drift by switching time-router frame setup helpers from `...FromStoreOrInputs` to `...FromStoreOrDefaults`
  - Continued camera command-surface cleanup:
    - added `core/camera/setPose` command for direct pose updates (pan/zoom + optional overlay invalidation)
    - swarm follow camera path now uses command dispatch instead of direct `panWorld`/`zoom` mutation + ad hoc sync
    - removed now-unused local `syncCameraStateToStore()` helper after follow path migrated to command routing
  - Continued interaction ownership cleanup:
    - interaction command handlers now use a single player-store sync helper instead of repeating inline `ctx.store.update(...)` player writes in multiple branches
    - `registerMainCommands(...)` now passes explicit `syncPlayerStateToStore` dependency into interaction command registration
  - Continued bridge-removal cleanup:
    - removed startup usage of broad `syncCoreSettingsStateFromRuntime(...)` runtime->store mirroring and replaced it with targeted bootstrap syncs (`map`, `player`, `swarm`, `pointLights`)
    - deleted now-unused snapshot/cache helpers from `main.js`:
      - `syncCoreSettingsStateFromRuntime(...)`
      - `getWeatherInputSnapshot(...)`
      - simulation-knob dirty/cache snapshot helpers
    - removed dead `markSimulationKnobsDirty` wiring from main command dependencies and apply-path calls
  - Continued `main.js` decomposition:
    - extracted swarm follow-camera domain logic into `src/gameplay/swarmFollowCamera.js`
    - `main.js` now composes a `createSwarmFollowCameraUpdater(...)` instance instead of owning full inline follow-camera behavior
    - extracted swarm simulation update-loop orchestration into `src/gameplay/swarmUpdateLoop.js`
    - `main.js` now composes a `createSwarmUpdateLoop(...)` instance instead of owning inline swarm step-loop/timestep orchestration
  - Continued render ownership cleanup:
    - extracted terrain uniform upload orchestration into `src/render/uniformUploader.js`
    - main terrain render pass now forwards `frame.camera` into uniform upload, reducing hot-path reliance on local camera variables
    - lit swarm render path now consumes frame-camera values for view extents/pan uniforms
    - frame render-state assembly no longer injects local `panWorld`/`zoom` from call site
    - extracted lit swarm render orchestration into `src/render/swarmLitRenderer.js`
    - removed inline lit swarm GPU upload/draw logic and vertex-buffer capacity bookkeeping from `main.js`
    - camera transform helpers (`worldFromNdc`, `worldToScreen`, default view-half lookup) now resolve camera state from canonical store first, with local fallback only for safety
    - extracted overlay draw orchestration into `src/ui/overlays/drawOverlay.js`
    - removed inline overlay draw body from `main.js`; `main.js` now composes `createOverlayDrawer(...)` with explicit dependencies
  - Remaining migration hotspots after this pass:
    - camera pan/zoom is still locally mutated in runtime paths and mirrored into store; full store-authoritative camera mutation is not complete yet
    - point-light editor draft mutation/orchestration still lives in `main.js` command flow
    - render/overlay logic and swarm simulation are still heavily embedded in `main.js` and need further extraction for final composition-only architecture
  - Handoff readiness check (stop point for next session):
    - verified status markers now match active subtask progress for P4/P5 parent items
    - verified immediate-next-work sequence now targets unfinished migration phases instead of completed Phase 1 work
    - re-ran sanity checks on migration-touched files:
      - `node --check` passed for updated/new runtime modules and bindings
      - `node --test tests/*.test.js` passed (9/9)
- 2026-04-24:
  - Continued camera ownership migration:
    - camera commands in `src/core/registerMainCommands.js` now compute/commit camera pose from canonical store state, then apply a runtime camera adapter from that state
    - removed camera command-side direct mutation of `panWorld`/`zoom` as the primary write path
    - `core/camera/reset`, `core/camera/zoomAtClient`, `core/camera/dragToClient`, and `core/camera/setPose` now use one canonical camera-commit path
  - Continued point-light editor ownership cleanup:
    - extended `src/gameplay/pointLightEditorState.js` with explicit draft setter methods (`setDraftColor`, `setDraftStrength`, `setDraftIntensity`, `setDraftHeightOffset`, `setDraftFlicker`, `setDraftFlickerSpeed`)
    - point-light editor binding wiring in `src/main.js` now uses editor-state methods instead of inline draft mutation lambdas
  - Revalidated bridge-removal status:
    - confirmed no runtime references remain to `frameSnapshot`, `runtimeParityAdapter`, or `updateCoreFrameSnapshot(...)`
    - marked P4.3 complete and marked P6.1.1/P6.2.1 complete accordingly
  - Validation:
    - `node --check src/core/registerMainCommands.js`
    - `node --check src/gameplay/pointLightEditorState.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued render-side effect cleanup:
    - removed fog auto-color DOM write from `computeLightingParams(...)` and kept it as a render-orchestration UI reflection step
    - lighting computation path now remains side-effect free (state in, params out)
  - Revalidation:
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued `main.js` ownership extraction:
    - extracted point-light editor orchestration into `src/gameplay/pointLightEditorController.js`
    - `main.js` point-light handlers (`find/create/select/apply-draft/rebake-live-update/delete`) now delegate through that controller instead of inline orchestration logic
    - point-light editor state remains in `src/gameplay/pointLightEditorState.js`, with controller + state now owning editor behavior surface
    - extracted point-light save/load/confirmation orchestration into `src/gameplay/pointLightIoController.js`
    - `main.js` now delegates point-light JSON parse/load/save/confirm state behavior through that controller
    - removed dead local runtime camera mirror (`panWorld`/`zoom`) after camera command/render paths became canonical-store driven
    - extracted map-level JSON Save-All orchestration into `src/gameplay/mapDataSaveController.js`
    - `main.js` now delegates map-sidecar file text generation + native/browser save flow through that controller
    - extracted map-sidecar JSON load/apply orchestration into `src/gameplay/mapSidecarLoader.js`
    - `main.js` map-load paths now delegate sidecar load/apply behavior (URL + folder-selection) through one composed loader module
    - extracted map-load path/folder-selection orchestration into `src/gameplay/mapLoader.js`
    - `main.js` now delegates high-level map load flow through `createMapLoader(...)` instead of embedding both load-path bodies inline
  - Validation:
    - `node --check src/gameplay/pointLightEditorController.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Documentation sync started:
    - updated `README.md` Files section to reflect current modular architecture (`core`, `render`, `gameplay`) and `main.js` orchestration role
    - updated `AI_CONTEXT.md` runtime overview with point-light editor controller extraction and store-authoritative camera command flow
  - Continued camera + render decoupling:
    - removed frame-camera fallback dependency on local runtime camera fields in:
      - `src/render/frameRenderState.js`
      - `src/render/uniformUploader.js`
      - `src/render/swarmLitRenderer.js`
      - `computeLightingParams(...)` in `src/main.js`
    - follow-camera zoom source now resolves from canonical active camera state (`coreState.camera`) instead of local zoom mirror
  - Continued swarm ownership extraction:
    - extracted swarm integration-step logic (`stepSwarm`) from `src/main.js` into `src/gameplay/swarmStep.js`
    - `main.js` now composes `createSwarmStepFunction(...)` with explicit dependencies instead of embedding swarm steering/chase/breeding integration inline
    - extracted swarm render interpolation helpers from `src/main.js` into `src/gameplay/swarmInterpolation.js`
    - follow-camera updater, overlay draw paths, and lit-swarm renderer now consume interpolation helpers composed from that module
    - extracted swarm reseed/reset orchestration from `src/main.js` into `src/gameplay/swarmReseed.js`
    - `main.js` now composes `createSwarmReseeder(...)` for swarm respawn/bootstrap reseed behavior
    - extracted swarm target-selection/follow-target helpers from `src/main.js` into `src/gameplay/swarmTargeting.js`
    - `main.js` follow and hawk-target paths now consume composed targeting helpers from that module
    - extracted swarm terrain/water/flyability environment helpers from `src/main.js` into `src/gameplay/swarmEnvironment.js`
    - swarm step/reseed/targeting composition now depends on explicit environment helper module instead of inline environment functions
    - extracted swarm UI input normalization (`min/max height`, `follow zoom in/out`) from `src/main.js` into `src/ui/swarmInputNormalization.js`
  - Validation:
    - `node --check src/gameplay/swarmStep.js`
    - `node --check src/gameplay/swarmInterpolation.js`
    - `node --check src/gameplay/swarmReseed.js`
    - `node --check src/gameplay/swarmTargeting.js`
    - `node --check src/gameplay/swarmEnvironment.js`
    - `node --check src/gameplay/pointLightIoController.js`
    - `node --check src/gameplay/mapDataSaveController.js`
    - `node --check src/gameplay/mapSidecarLoader.js`
    - `node --check src/gameplay/mapLoader.js`
    - `node --check src/ui/swarmInputNormalization.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm UI ownership extraction:
    - extracted swarm panel UI reflection from `src/main.js` into `src/ui/swarmPanelUi.js`
    - moved swarm label updates, control enable/disable state updates, follow-button text updates, and stats-panel updates into the new module
    - `main.js` now composes `createSwarmPanelUi(...)` and consumes returned UI update functions
  - Validation:
    - `node --check src/ui/swarmPanelUi.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm runtime mutation ownership extraction:
    - extracted swarm agent-state buffer mutation helpers from `src/main.js` into `src/gameplay/swarmAgentStateMutator.js`
    - moved `ensureSwarmBuffers`, `removeSwarmAgentAtIndex`, `appendSwarmAgentState`, and `spawnRestingBirdNear` into that module
    - `main.js` now composes `createSwarmAgentStateMutator(...)` and injects those operations into swarm reseed + swarm step modules
  - Validation:
    - `node --check src/gameplay/swarmAgentStateMutator.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm data-apply ownership extraction:
    - extracted swarm runtime hydration/apply logic from `applySwarmData(...)` in `src/main.js` into `src/gameplay/swarmDataApplier.js`
    - `main.js` now composes `createSwarmDataApplier(...)` and keeps `applySwarmData(...)` as a thin pass-through
    - map sidecar loading still calls `applySwarmData(...)`, now routed through the extracted module behavior
  - Validation:
    - `node --check src/gameplay/swarmDataApplier.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm data-serialization ownership extraction:
    - extracted `serializeSwarmDataLegacy(...)` logic from `src/main.js` into `src/gameplay/swarmDataSerializer.js`
    - `main.js` now composes `createSwarmDataSerializer(...)` and keeps `serializeSwarmDataLegacy(...)` as a thin pass-through
  - Validation:
    - `node --check src/gameplay/swarmDataSerializer.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm settings apply-path extraction:
    - extracted `applySwarmSettingsLegacy(...)` UI reflection logic from `src/main.js` into `src/ui/swarmSettingsApplier.js`
    - `main.js` now composes `createSwarmSettingsApplier(...)` and keeps `applySwarmSettingsLegacy(...)` as a thin pass-through
  - Validation:
    - `node --check src/ui/swarmSettingsApplier.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued interaction-sidecar serialization extraction:
    - extracted `serializeInteractionSettingsLegacy(...)` logic from `src/main.js` into `src/gameplay/interactionDataSerializer.js`
    - `main.js` now composes `createInteractionDataSerializer(...)` and keeps `serializeInteractionSettingsLegacy(...)` as a thin pass-through
  - Validation:
    - `node --check src/gameplay/interactionDataSerializer.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued interaction settings apply-path extraction:
    - extracted `applyInteractionSettingsLegacy(...)` UI reflection logic from `src/main.js` into `src/ui/interactionSettingsApplier.js`
    - `main.js` now composes `createInteractionSettingsApplier(...)` and keeps `applyInteractionSettingsLegacy(...)` as a thin pass-through
  - Validation:
    - `node --check src/ui/interactionSettingsApplier.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued NPC persistence extraction:
    - extracted NPC persistence helpers from `src/main.js` into `src/gameplay/npcPersistence.js`
    - `main.js` now composes `createNpcPersistence(...)` and keeps `serializeNpcState(...)`, `parseNpcPlayer(...)`, and `applyLoadedNpc(...)` as thin pass-throughs
  - Validation:
    - `node --check src/gameplay/npcPersistence.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued lighting settings apply-path extraction:
    - extracted `applyLightingSettingsLegacy(...)` UI reflection logic from `src/main.js` into `src/ui/lightingSettingsApplier.js`
    - `main.js` now composes `createLightingSettingsApplier(...)` and keeps `applyLightingSettingsLegacy(...)` as a thin pass-through
  - Validation:
    - `node --check src/ui/lightingSettingsApplier.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued render-FX settings apply-path extraction:
    - extracted `applyFogSettingsLegacy(...)`, `applyParallaxSettingsLegacy(...)`, `applyCloudSettingsLegacy(...)`, and `applyWaterSettingsLegacy(...)` UI reflection logic from `src/main.js` into `src/ui/renderFxSettingsApplier.js`
    - `main.js` now composes `createRenderFxSettingsApplier(...)` and keeps those four legacy apply functions as thin pass-throughs
  - Validation:
    - `node --check src/ui/renderFxSettingsApplier.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued render-FX serializer extraction:
    - extracted `serializeLightingSettingsLegacy(...)`, `serializeFogSettingsLegacy(...)`, `serializeParallaxSettingsLegacy(...)`, `serializeCloudSettingsLegacy(...)`, and `serializeWaterSettingsLegacy(...)` from `src/main.js` into `src/gameplay/renderFxDataSerializer.js`
    - `main.js` now composes `createRenderFxDataSerializer(...)` and keeps those serializer functions as thin pass-throughs
  - Validation:
    - `node --check src/gameplay/renderFxDataSerializer.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued core store-sync helper extraction:
    - extracted `syncMapStateToStore(...)`, `syncPlayerStateToStore(...)`, and `syncPointLightsStateToStore(...)` helper logic from `src/main.js` into `src/gameplay/stateSync.js`
    - `main.js` now keeps these as thin wrappers delegating to shared gameplay sync helpers
  - Validation:
    - `node --check src/gameplay/stateSync.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued interaction state-access extraction:
    - extracted cursor-light snapshot and point-light live-update access helpers from `src/main.js` into `src/gameplay/interactionStateAccess.js`
    - `main.js` now keeps `getCursorLightSnapshot(...)` and `isPointLightLiveUpdateEnabled(...)` as thin wrappers delegating to shared gameplay helpers
  - Validation:
    - `node --check src/gameplay/interactionStateAccess.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm state-access extraction:
    - extracted swarm defaults/reset and enabled-state lookup helpers from `src/main.js` into `src/gameplay/swarmStateAccess.js`
    - `main.js` now keeps `setSwarmDefaults(...)` and `isSwarmEnabled(...)` as thin wrappers delegating to shared gameplay helpers
  - Validation:
    - `node --check src/gameplay/swarmStateAccess.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued pathfinding preview-runtime extraction:
    - extracted pathfinding preview runtime helpers from `src/main.js` into `src/gameplay/pathfindingPreviewRuntime.js`
    - moved movement-field rebuild, path extraction, preview refresh, pointer-preview update, and path-metrics logic into that module
    - `main.js` now keeps `rebuildMovementField(...)`, `extractPathTo(...)`, `refreshPathPreview(...)`, `updatePathPreviewFromPointer(...)`, and `getCurrentPathMetrics(...)` as thin pass-throughs
  - Validation:
    - `node --check src/gameplay/pathfindingPreviewRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued info-panel runtime extraction:
    - extracted `updateInfoPanel(...)` status composition/update logic from `src/main.js` into `src/ui/infoPanelRuntime.js`
    - `main.js` now composes `createInfoPanelRuntime(...)` and keeps `updateInfoPanel(...)` as a thin pass-through
  - Validation:
    - `node --check src/ui/infoPanelRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued render-FX UI-helper extraction:
    - extracted render-FX label/UI helper updates (`update*Label`/`update*Ui`) from `src/main.js` into `src/ui/renderFxUiRuntime.js`
    - `main.js` now keeps those helpers as thin pass-through wrappers that delegate to shared UI-runtime helpers
  - Validation:
    - `node --check src/ui/renderFxUiRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued camera/coordinate helper extraction:
    - extracted camera/coordinate transform helpers from `src/main.js` into `src/gameplay/cameraTransforms.js`
    - moved camera state lookup, view extents, and world/uv/map/screen conversion logic into that module
    - `main.js` now keeps those helpers as thin pass-through wrappers
  - Validation:
    - `node --check src/gameplay/cameraTransforms.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued pathfinding label-helper extraction:
    - extracted pathfinding label helper updates from `src/main.js` into `src/ui/pathfindingLabelUi.js`
    - moved `updatePathfindingRangeLabel(...)`, `updatePathWeightLabels(...)`, `updatePathSlopeCutoffLabel(...)`, and `updatePathBaseCostLabel(...)` logic into that module
    - `main.js` now keeps these helpers as thin pass-through wrappers
  - Validation:
    - `node --check src/ui/pathfindingLabelUi.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued interaction-mode controller extraction:
    - extracted `setInteractionMode(...)` core apply/toggle behavior from `src/main.js` into `src/gameplay/interactionModeController.js`
    - `main.js` now keeps `setInteractionMode(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/gameplay/interactionModeController.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued runtime snapshot/state-access extraction:
    - extracted `getInteractionModeSnapshot(...)`, `getSwarmCursorMode(...)`, `getSwarmSettings(...)`, and `getPathfindingStateSnapshot(...)` from `src/main.js` into `src/gameplay/runtimeStateSnapshots.js`
    - `main.js` now keeps these helpers as thin pass-through wrappers
  - Validation:
    - `node --check src/gameplay/runtimeStateSnapshots.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm runtime/store sync extraction:
    - extracted `getSwarmRuntimeStateSnapshot(...)`, `syncSwarmFollowToStore(...)`, and `syncSwarmRuntimeStateToStore(...)` from `src/main.js` into `src/gameplay/swarmStoreSync.js`
    - `main.js` now keeps these as thin pass-through wrappers
  - Validation:
    - `node --check src/gameplay/swarmStoreSync.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm follow-state ownership extraction:
    - extracted swarm follow-state apply/stop orchestration from `src/main.js` into `src/gameplay/swarmFollowStateController.js`
    - `main.js` now composes this controller and keeps `applySwarmFollowState(...)` and `stopSwarmFollow(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/gameplay/swarmFollowStateController.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued pathfinding cost-model extraction:
    - extracted pathfinding helpers (`getGrayAt(...)`, `movementWindowBounds(...)`, `computeMoveStepCost(...)`) from `src/main.js` into `src/gameplay/pathfindingCostModel.js`
    - `main.js` now composes this module and keeps those helpers as thin pass-through wrappers
  - Validation:
    - `node --check src/gameplay/pathfindingCostModel.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued mode-capability UI extraction:
    - extracted topic-panel/mode-capability UI orchestration from `src/main.js` into `src/ui/modeCapabilitiesUi.js`
    - `main.js` now composes this module and keeps `setTopicPanelVisible(...)`, `setActiveTopic(...)`, and `updateModeCapabilitiesUi(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/ui/modeCapabilitiesUi.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued map-path utility extraction:
    - extracted map-path/file-URL helper utilities from `src/main.js` into `src/gameplay/mapPathUtils.js`
    - `main.js` now keeps `normalizeMapFolderPath(...)`, `isAbsoluteFsPath(...)`, `joinFsPath(...)`, `buildMapAssetPath(...)`, and `toAbsoluteFileUrl(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/gameplay/mapPathUtils.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued Tauri runtime helper extraction:
    - extracted Tauri invoke/folder-picker/folder-validation helper logic from `src/main.js` into `src/gameplay/tauriRuntime.js`
    - `main.js` now resolves `tauriInvoke` via the module and keeps `invokeTauri(...)`, `pickMapFolderViaTauri(...)`, and `validateMapFolderViaTauri(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/gameplay/tauriRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued map-IO helper extraction:
    - extracted folder-selection file lookup and JSON load helper logic from `src/main.js` into `src/gameplay/mapIoHelpers.js`
    - `main.js` now keeps `getFileFromFolderSelection(...)` and `tryLoadJsonFromUrl(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/gameplay/mapIoHelpers.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued time-state access extraction:
    - extracted time-routing/time-config state-access helper logic from `src/main.js` into `src/core/timeStateAccess.js`
    - `main.js` now composes this module and keeps `getDefaultTimeRouting(...)`, `getConfiguredSimTickHours(...)`, `getCurrentTimeRoutingFromStoreOrDefaults(...)`, `getConfiguredSimTickHoursFromStoreOrDefaults(...)`, and `getInterpolatedRoutedTimeSec(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/core/timeStateAccess.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued color-helper extraction:
    - extracted color conversion helpers from `src/main.js` into `src/core/colorUtils.js`
    - `main.js` now keeps `rgbToHex(...)` and `hexToRgb01(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/core/colorUtils.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued fallback image helper extraction:
    - extracted fallback map-image generation and image-data extraction helpers from `src/main.js` into `src/render/fallbackMapImages.js`
    - `main.js` now keeps `createFlatNormalImage(...)`, `createFlatHeightImage(...)`, `createFlatSlopeImage(...)`, `createFlatWaterImage(...)`, `createFallbackSplat(...)`, and `extractImageData(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/render/fallbackMapImages.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued map-image runtime extraction:
    - extracted map-image apply/runtime-size helpers and point-light-worker map-data sync logic from `src/main.js` into `src/gameplay/mapImageRuntime.js`
    - `main.js` now keeps `applyMapImages(...)`, `syncPointLightWorkerMapData(...)`, `setSplatSizeFromImage(...)`, `setHeightSizeFromImage(...)`, and `setNormalsSizeFromImage(...)` as thin pass-through wrappers
    - runtime wiring uses lazy `getMapImageRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/gameplay/mapImageRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued shared math-helper extraction:
    - extracted shared clamp/interpolation/hour-format helpers from `src/main.js` into `src/core/mathUtils.js`
    - `main.js` now keeps `clamp(...)`, `clampRound(...)`, `lerp(...)`, `lerpVec3(...)`, `lerpAngleDeg(...)`, `smoothstep(...)`, `wrapHour(...)`, and `formatHour(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/core/mathUtils.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued light-label UI extraction:
    - extracted point-light/cursor-light label update helpers from `src/main.js` into `src/ui/lightLabelRuntime.js`
    - `main.js` now composes this module and keeps `updatePointLightStrengthLabel(...)`, `updatePointLightIntensityLabel(...)`, `updatePointLightHeightOffsetLabel(...)`, `updatePointLightFlickerLabel(...)`, `updatePointLightFlickerSpeedLabel(...)`, `updateCursorLightStrengthLabel(...)`, and `updateCursorLightHeightOffsetLabel(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/ui/lightLabelRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued sun-model extraction:
    - extracted sun keyframe interpolation logic (`SUN_KEYS` + `sampleSunAtHour(...)`) from `src/main.js` into `src/sim/sunModel.js`
    - `main.js` now keeps `sampleSunAtHour(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/sim/sunModel.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued map-sampling extraction:
    - extracted map normal/height sampling helpers from `src/main.js` into `src/gameplay/mapSampling.js`
    - `main.js` now keeps `normalize3(...)`, `sampleNormalAtMapPixel(...)`, `sampleHeightAtMapPixel(...)`, and `sampleHeightAtMapCoord(...)` as thin pass-through wrappers
    - runtime wiring uses lazy `getMapSamplingRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/gameplay/mapSampling.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued shadow/occlusion extraction:
    - extracted shadow/occlusion helpers from `src/main.js` into `src/gameplay/shadowOcclusion.js`
    - `main.js` now keeps `computeSwarmDirectionalShadow(...)` and `hasLineOfSightToLight(...)` as thin pass-through wrappers
    - runtime wiring uses lazy `getShadowOcclusionRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/gameplay/shadowOcclusion.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued point-light bake-canvas extraction:
    - extracted point-light bake canvas sizing and RGBA apply/upload helpers from `src/main.js` into `src/render/pointLightBakeCanvasRuntime.js`
    - `main.js` now keeps `ensurePointLightBakeSize(...)` and `applyPointLightBakeRgba(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/render/pointLightBakeCanvasRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued point-light bake-sync extraction:
    - extracted point-light bake-sync accumulation/occlusion/packing logic from `src/main.js` into `src/render/pointLightBakeSync.js`
    - `main.js` now keeps `bakePointLightsTextureSync(...)` as a thin pass-through wrapper
    - runtime wiring uses lazy `getPointLightBakeSyncRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/render/pointLightBakeSync.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued time-UI helper extraction:
    - extracted cycle-hour slider/label UI helper logic from `src/main.js` into `src/ui/timeUiRuntime.js`
    - `main.js` now keeps `setCycleHourSliderFromState(...)` and `updateCycleHourLabel(...)` as thin pass-through wrappers
    - runtime wiring uses lazy `getTimeUiRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/ui/timeUiRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued mode-state access extraction:
    - extracted runtime mode state-access helpers from `src/main.js` into `src/core/modeStateAccess.js`
    - `main.js` now keeps `getRuntimeMode(...)`, `canUseTopicInCurrentMode(...)`, and `canUseInteractionInCurrentMode(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/core/modeStateAccess.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued point-light bake-runtime extraction:
    - extracted point-light worker + bake-orchestrator runtime wiring from `src/main.js` into `src/render/pointLightBakeRuntime.js`
    - `main.js` now keeps `schedulePointLightBake(...)` and `bakePointLightsTexture(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/render/pointLightBakeRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued map-runtime-state extraction:
    - extracted map runtime state helpers from `src/main.js` into `src/gameplay/mapRuntimeState.js`
    - `main.js` now keeps `setCurrentMapFolderPath(...)`, `applyDefaultMapSettings(...)`, `resetMapRuntimeStateAfterImages(...)`, and `applyMapSizeChangeIfNeeded(...)` as thin pass-through wrappers
    - runtime wiring uses lazy `getMapRuntimeState()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/gameplay/mapRuntimeState.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued lighting-params runtime extraction:
    - extracted lighting parameter assembly logic (`computeLightingParams(...)`) from `src/main.js` into `src/sim/lightingParamsRuntime.js`
    - `main.js` now keeps `computeLightingParams(...)` as a thin pass-through wrapper
    - runtime wiring uses lazy `getLightingParamsRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/sim/lightingParamsRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued startup-UI sync extraction:
    - extracted startup UI synchronization call sequence from `src/main.js` into `src/ui/startupUiSync.js`
    - `main.js` now performs startup UI sync through one composed runtime call
  - Validation:
    - `node --check src/ui/startupUiSync.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued map-bootstrap extraction:
    - extracted default-folder map auto-load flow from `src/main.js` into `src/gameplay/mapBootstrap.js`
    - `main.js` now keeps `tryAutoLoadDefaultMap(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/gameplay/mapBootstrap.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm-overlay runtime extraction:
    - extracted swarm unlit-overlay and gizmo drawing helpers from `src/main.js` into `src/ui/swarmOverlayRuntime.js`
    - `main.js` now keeps `drawSwarmUnlitOverlay(...)` and `drawSwarmGizmos(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/ui/swarmOverlayRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued frame-UI runtime extraction:
    - extracted render-frame UI synchronization helpers (fog auto-color input + cycle info text) from `src/main.js` into `src/render/frameUiRuntime.js`
    - render loop now delegates those responsibilities through one composed frame-UI runtime helper
  - Validation:
    - `node --check src/render/frameUiRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued weather-field render helper extraction:
    - extracted weather-field render metadata update helper from `src/main.js` into `src/render/weatherFieldRuntime.js`
    - render loop now delegates weather-field metadata update through this helper
  - Validation:
    - `node --check src/render/weatherFieldRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued frame swarm/render orchestration extraction:
    - extracted render-frame swarm layer/state orchestration from `src/main.js` into `src/render/frameSwarmRenderRuntime.js`
    - render loop now delegates frame-state assembly + terrain/swarm draw decision through this helper
  - Validation:
    - `node --check src/render/frameSwarmRenderRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued frame-time runtime extraction:
    - extracted render-frame time/tick routing setup from `src/main.js` into `src/render/frameTimeRuntime.js`
    - render loop now delegates dt/routed-time/frame-time-state setup through this helper
  - Validation:
    - `node --check src/render/frameTimeRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued render-loop runtime extraction:
    - extracted `render(nowMs)` orchestration from `src/main.js` into `src/render/frameRuntime.js`
    - `main.js` now keeps `render(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/render/frameRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued viewport runtime extraction:
    - extracted viewport/canvas resize helper from `src/main.js` into `src/render/viewportRuntime.js`
    - `main.js` now keeps `resize(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/render/viewportRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued cloud-noise runtime extraction:
    - extracted cloud-noise generation + texture upload helpers from `src/main.js` into `src/render/cloudNoiseRuntime.js`
    - `main.js` now keeps `createCloudNoiseImage(...)` and `uploadCloudNoiseTexture(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/render/cloudNoiseRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued shadow-pipeline runtime extraction:
    - extracted shadow-target sizing/framebuffer attach and shadow-pass draw orchestration from `src/main.js` into `src/render/shadowPipelineRuntime.js`
    - `main.js` now keeps `ensureShadowTargets(...)` and `renderShadowPipeline(...)` as thin pass-through wrappers
    - runtime wiring uses lazy `getShadowPipelineRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/render/shadowPipelineRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued GL-resource runtime extraction:
    - extracted WebGL shader/program/texture creation and image upload helpers from `src/main.js` into `src/render/glResourceRuntime.js`
    - `main.js` now keeps `createShader(...)`, `createProgram(...)`, `createTexture(...)`, `createLinearTexture(...)`, and `uploadImageToTexture(...)` as thin pass-through wrappers
    - runtime wiring uses lazy `getGlResourceRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/render/glResourceRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued cursor-light pointer runtime extraction:
    - extracted cursor-light pointer-to-UV update logic from `src/main.js` into `src/gameplay/cursorLightPointerRuntime.js`
    - `main.js` now keeps `updateCursorLightFromPointer(...)` as a thin pass-through wrapper
    - runtime wiring uses lazy `getCursorLightPointerRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/gameplay/cursorLightPointerRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued flow-map runtime extraction:
    - extracted flow-map rebuild orchestration (`rebuildFlowMapTexture`) from `src/main.js` into `src/render/flowMapRuntime.js`
    - `main.js` now keeps `rebuildFlowMapTexture(...)` as a thin pass-through wrapper
    - runtime wiring uses lazy `getFlowMapRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/render/flowMapRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued applied-settings store-sync extraction:
    - extracted applied-settings normalization/store-sync helpers from `src/main.js` into `src/core/appliedSettingsStoreSync.js`
    - `main.js` now keeps `normalizeAppliedSettings(...)` and `updateStoreFromAppliedSettings(...)` as thin pass-through wrappers
  - Validation:
    - `node --check src/core/appliedSettingsStoreSync.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued overlay animation policy extraction:
    - extracted overlay animation gating policy (`shouldAnimateOverlay`) from `src/main.js` into `src/ui/overlays/overlayAnimationRuntime.js`
    - `main.js` now delegates `shouldAnimateOverlay` in overlay hooks through the runtime helper
  - Validation:
    - `node --check src/ui/overlays/overlayAnimationRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued simulation-knob state-access extraction:
    - extracted simulation-knob section state-access helper (`getSimulationKnobSectionFromStore`) from `src/main.js` into `src/core/simulationKnobAccess.js`
    - `main.js` now keeps `getSimulationKnobSectionFromStore(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/core/simulationKnobAccess.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued DOM lookup helper extraction:
    - extracted required DOM element lookup helpers (`getRequiredElementById`, `getRequiredElements`) from `src/main.js` into `src/ui/domElementLookup.js`
    - `main.js` now imports these helpers directly
  - Validation:
    - `node --check src/ui/domElementLookup.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued status UI runtime extraction:
    - extracted UI status text update helper (`setStatus`) from `src/main.js` into `src/ui/statusRuntime.js`
    - `main.js` now keeps `setStatus(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/ui/statusRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued settings-registry bridge extraction:
    - extracted settings-registry bridge helpers (`serializeSettingsByKey`, `applySettingsByKey`) from `src/main.js` into `src/core/settingsRegistryBridge.js`
    - `main.js` now keeps both helpers as thin pass-through wrappers
  - Validation:
    - `node --check src/core/settingsRegistryBridge.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm-cursor pointer runtime extraction:
    - extracted swarm-cursor pointer-to-map update logic from `src/main.js` into `src/gameplay/swarmCursorPointerRuntime.js`
    - `main.js` now keeps `updateSwarmCursorFromPointer(...)` as a thin pass-through wrapper
    - runtime wiring uses lazy `getSwarmCursorPointerRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/gameplay/swarmCursorPointerRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued player-state runtime extraction:
    - extracted player-position clamp/apply helper (`setPlayerPosition`) from `src/main.js` into `src/gameplay/playerStateRuntime.js`
    - `main.js` now keeps `setPlayerPosition(...)` as a thin pass-through wrapper
    - runtime wiring uses lazy `getPlayerStateRuntime()` composition to avoid initialization-order regressions
  - Validation:
    - `node --check src/gameplay/playerStateRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued settings-defaults access extraction:
    - extracted settings-defaults access helper (`getSettingsDefaults`) from `src/main.js` into `src/core/settingsDefaultsAccess.js`
    - `main.js` now keeps `getSettingsDefaults(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/core/settingsDefaultsAccess.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued overlay-dirty state extraction:
    - extracted overlay dirty-flag state ownership from `src/main.js` into `src/ui/overlays/overlayDirtyRuntime.js`
    - `main.js` now keeps `requestOverlayDraw(...)` as a thin pass-through wrapper and delegates overlay hook dirty checks/clears
  - Validation:
    - `node --check src/ui/overlays/overlayDirtyRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued camera-view runtime extraction:
    - extracted camera view/command helpers (`resetCamera`, `getScreenAspect`, `getMapAspect`) from `src/main.js` into `src/gameplay/cameraViewRuntime.js`
    - `main.js` now keeps these helpers as thin pass-through wrappers
  - Validation:
    - `node --check src/gameplay/cameraViewRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued swarm-follow smoothing extraction:
    - extracted swarm follow-camera smoothing reset helper (`resetSwarmFollowSpeedSmoothing`) from `src/main.js` into `src/gameplay/swarmFollowSmoothingRuntime.js`
    - `main.js` now keeps this helper as a thin pass-through wrapper
  - Validation:
    - `node --check src/gameplay/swarmFollowSmoothingRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued interaction-mode runtime binding extraction:
    - extracted interaction-mode runtime binding (`setInteractionMode` deps composition) from `src/main.js` into `src/gameplay/interactionModeRuntime.js`
    - `main.js` now keeps `setInteractionMode(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/gameplay/interactionModeRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
  - Continued point-light editor UI runtime extraction:
    - extracted point-light editor UI orchestration (`updateLightEditorUi`) from `src/main.js` into `src/ui/pointLightEditorRuntime.js`
    - `main.js` now keeps `updateLightEditorUi(...)` as a thin pass-through wrapper
  - Validation:
    - `node --check src/ui/pointLightEditorRuntime.js`
    - `node --check src/main.js`
    - `node --test tests/*.test.js` (pass 9/9)
