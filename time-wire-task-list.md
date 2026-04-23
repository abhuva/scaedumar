# Time Wire Task List

Last updated: 2026-04-23
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
- [-] P1.3 Create explicit ownership map for remaining migration
  - [-] P1.3.1 List all runtime domains still reading DOM inputs directly.
  - [ ] P1.3.2 List all core state branches that are still snapshots instead of authoritative state.
  - [x] P1.3.3 List all places where parity writes state back into runtime/DOM.

Exit criteria:
- Hybrid-state reality is documented.
- Remaining migration surface is explicit enough to sequence cleanly.

### Phase 2: Canonical State Contract Completion

Dependencies: Phase 1

- [-] P2.1 Make core state complete enough to become sole runtime authority
  - [ ] P2.1.1 Audit missing authoritative state branches for:
    - render FX controls
    - pathfinding settings
    - swarm settings
    - interaction mode
    - camera state
    - map/session state
  - [-] P2.1.2 Remove any remaining dependence on reading those values primarily from DOM inputs.
  - [-] P2.1.3 Ensure settings defaults/serialize/apply paths align with canonical core state shape.
- [ ] P2.2 Define stable command surface for all user-driven state changes
  - [ ] P2.2.1 Route all mutable UI-backed settings through commands.
  - [ ] P2.2.2 Remove direct imperative state mutation where command routing should own behavior.
  - [ ] P2.2.3 Ensure commands update both state and required side effects.
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
  - [ ] P3.3.3 Remove implicit two-way parity behavior.

Exit criteria:
- Runtime logic no longer depends on DOM inputs as the primary state source.

### Phase 4: Simulation/System Ownership Migration

Dependencies: Phase 2, Phase 3

- [ ] P4.1 Make scheduler/core systems read only canonical core state
  - [ ] P4.1.1 Time system.
  - [ ] P4.1.2 Lighting system.
  - [ ] P4.1.3 Fog system.
  - [ ] P4.1.4 Cloud system.
  - [ ] P4.1.5 Water FX system.
  - [ ] P4.1.6 Weather system.
  - [ ] P4.1.7 Pathfinding/movement integration.
- [ ] P4.2 Move remaining gameplay runtime ownership out of `main.js`
  - [ ] P4.2.1 Player/gameplay state snapshots become authoritative state or system-owned runtime.
  - [ ] P4.2.2 Swarm settings/runtime ownership boundaries are explicit and non-duplicated.
  - [ ] P4.2.3 Camera state ownership is explicit and does not bounce between runtime and core.
- [ ] P4.3 Stop per-frame snapshot feeding
  - [ ] P4.3.1 Replace `updateCoreFrameSnapshot(...)` inputs with authoritative state access.
  - [ ] P4.3.2 Ensure scheduler update context only carries transient frame values (`nowMs`, `dtSec`, routed time), not mirrored runtime state.
  - [ ] P4.3.3 Delete remaining snapshot-only helper functions once no longer needed.

Exit criteria:
- Scheduler no longer depends on frame-by-frame mirrored runtime state.

### Phase 5: Render/Input Decoupling

Dependencies: Phase 4

- [ ] P5.1 Make render preparation consume resolved state, not raw inputs
  - [ ] P5.1.1 Uniform input construction reads from core/system state.
  - [ ] P5.1.2 Frame render state construction reads from core/system state.
  - [ ] P5.1.3 Overlay rendering reads canonical gameplay/render state.
- [ ] P5.2 Remove ad hoc render-time settings assembly where possible
  - [ ] P5.2.1 Avoid recomputing settings snapshots from DOM every frame.
  - [ ] P5.2.2 Keep only genuinely transient frame calculations in render loop.
- [ ] P5.3 Reduce `main.js` to orchestration
  - [ ] P5.3.1 Keep boot/setup.
  - [ ] P5.3.2 Keep render loop orchestration.
  - [ ] P5.3.3 Move runtime domain logic into modules when still embedded.

Exit criteria:
- Render loop consumes canonical state with minimal state reconstruction.

### Phase 6: Adapter Removal

Dependencies: Phases 3, 4, 5

- [ ] P6.1 Remove runtime-to-core mirroring
  - [ ] P6.1.1 Delete `src/core/frameSnapshot.js` usage from `src/main.js`.
  - [ ] P6.1.2 Remove obsolete snapshot getters whose only role was frame mirroring.
- [ ] P6.2 Remove core-to-runtime parity writes
  - [ ] P6.2.1 Delete `src/core/runtimeParityAdapter.js` usage from `src/main.js`.
  - [ ] P6.2.2 Remove remaining DOM/runtime write-back assumptions.
- [ ] P6.3 Simplify interfaces after bridge removal
  - [ ] P6.3.1 Remove dead command/state plumbing that existed only for parity.
  - [ ] P6.3.2 Remove duplicate state derivations and duplicate caches.

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
- [ ] P7.3 Documentation updates
  - [ ] P7.3.1 Update `README.md` to describe final runtime architecture and controls.
  - [ ] P7.3.2 Update `AI_CONTEXT.md` to match final ownership model.
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
- [-] N1 Finish Phase 1 ownership map.
- [-] N2 Start Phase 2 by auditing missing canonical state branches.
- [-] N3 Choose the first concrete ownership slice to migrate fully:
  - render FX controls
  - pathfinding controls
  - swarm controls

Recommended first slice:
- render FX controls

Reason:
- They have high runtime read frequency.
- They are a direct source of current snapshot/parity churn.
- They are lower-risk than camera/gameplay ownership changes.

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
