# Architecture Map

This project now uses a modular runtime with `src/main.js` acting as the
top-level composition entry point instead of the dominant state owner.

## Top-Level Layout

- `src/main.js`: composition/orchestration entry point
- `src/app/`: app-layer dependency shaping and bootstrap assembly
- `src/core/`: store, scheduler, commands, settings contracts
- `src/render/`: render resources, precompute, passes, frame assembly
- `src/gameplay/`: gameplay/runtime ownership modules
- `src/ui/`: DOM bindings, panel reflection, overlay/UI helpers
- `src/sim/`: time/lighting/fog/cloud/water/weather systems and helpers
- `src/pointLightBakeWorker.js`: point-light bake worker entry
- `src-tauri/`: desktop wrapper and native file I/O commands

## Runtime Authority

- Core store state is the authoritative runtime state model.
- Scheduler systems consume canonical state directly.
- UI controls emit commands and reflect state; they are not the runtime
  source of truth.
- Renderer consumes resolved frame/runtime state and does not own
  gameplay/config state.
- Cycle-hour/time-of-day authority is held in core store `ui.cycleHour`;
  UI and lighting helpers access it through store-backed proxies.
- Store mutation ownership is concentrated in sync-focused modules such as:
  - `src/gameplay/stateSync.js`
  - `src/core/systemStoreSyncRuntime.js`
  - `src/core/appliedSettingsStoreSync.js`

## App Layer

`src/app/` owns bootstrap/dependency shaping that would otherwise bloat
`src/main.js`. This includes:

- command registration payload assembly
- render-shell assembly
- app startup/binding lifecycle assembly
- swarm integration assembly
- settings-core/runtime-support assembly
- interaction/runtime-feature/bootstrap assembly

This layer exists to keep composition concerns out of gameplay/render/ui
owner modules.

## Core

- `src/core/runtimeCore.js`: runtime core composition
- `src/core/state.js`: central store
- `src/core/scheduler.js`: ordered system update pipeline
- `src/core/registerMainCommands.js`: command handler composition root
- `src/core/mainSettingsContracts.js`: settings contracts/defaults
- `src/core/systemStoreSyncRuntime.js`: scheduler-driven canonical sync

## Render

- `src/render/renderBootstrapState.js`: render bootstrap resources
- `src/render/shaders.js`: terrain, swarm, shadow, and blur shader source
- `src/render/renderSupportRuntime.js`: GL/flow-map/shadow/cloud support
- `src/render/renderPipelineRuntime.js`: render resource/pass composition
- `src/render/frameRenderState.js`: frame DTO assembly
- `src/render/uniformInputState.js`: uniform input assembly
- `src/render/frameRuntime.js`: frame loop runtime
- `src/render/passes/*`: terrain/shadow/blur/point-light usage passes
- `src/render/precompute/*`: flow-map and point-light bake precompute

## Gameplay

- `src/gameplay/mainRuntimeStateBinding.js`: store-backed runtime-state
  ownership for map/pathfinding/cursor-light/point-light/swarm sync
- `src/gameplay/mapLifecycleRuntime.js`: map bootstrap/load/save lifecycle
- `src/gameplay/mapSupportRuntime.js`: map path/Tauri/image/sampling/shadow
  support
- `src/gameplay/swarmRuntime.js`: swarm runtime/store-sync/follow ownership
- `src/gameplay/swarmGameplayRuntime.js`: swarm environment/targeting/reseed
- `src/gameplay/swarmRenderSetupRuntime.js`: swarm overlay/lit-render setup
- `src/gameplay/playerRuntimeBinding.js`: player/NPC runtime ownership
- `src/gameplay/movementSystem.js`: movement scheduler/runtime owner
- `src/gameplay/pathfindingRuntimeBinding.js`: pathfinding preview/runtime
- `src/gameplay/lightInteractionRuntimeBinding.js`: cursor-light/point-light
  interaction ownership

## UI

- `src/ui/mainBindingsRuntime.js`: binds UI control listeners
- `src/ui/settingsAssemblyRuntime.js`: compatibility/canonical settings wiring
- `src/ui/swarmUiRuntimeBinding.js`: swarm UI reflection/input sync
- `src/ui/renderFxUiRuntime.js`: Render FX label/UI reflection helpers
- `src/ui/pathfindingLabelUi.js`: pathfinding label updates
- `src/ui/lightLabelRuntime.js`: point-light/cursor-light label updates
- `src/ui/infoPanelRuntime.js`: player/path info panel updates

## Simulation

- `src/sim/timeSystem.js`
- `src/sim/lightingSystem.js`
- `src/sim/fogSystem.js`
- `src/sim/cloudSystem.js`
- `src/sim/waterFxSystem.js`
- `src/sim/weatherSystem.js`

## Verification Baseline

Last verified pass: `2026-04-25` - update these entries when the checks are rerun.

- Node suite last passed on `2026-04-25`: `node --test`
- Browser smoke testing last passed on `2026-04-25`
- Tauri full build last passed on `2026-04-25`
- Installed desktop build launched and basic gameplay smoke testing last passed
  on `2026-04-25`

## Migration Status

The architecture migration is complete.

Remaining work is normal maintenance:

- feature work
- performance tuning if new issues are observed
- incremental naming cleanup where helpful
