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
- `src/audio/`: audio-domain runtime modules (WebAudio engine, offline
  STFT/FFT analysis, spectrogram display, scribble input/grid, resynthesis)
- `src/slime/`: slime-domain GPU simulation modules for Physarum experiments
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
- `src/core/modeCapabilities.js`: runtime mode/topic capability gating

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

### Render-Time Texture Layers

Full-map visual texture layers must follow the established terrain renderer
path by default:

- allocate or update a main-renderer texture in the render pipeline
- bind texture units and uniforms through `src/render/uniformUploader.js`
- composite the layer in `src/render/shaders.js`

Do not build a parallel 2D canvas/readback visualization path for these layers
when an existing render-time texture layer pattern applies. The overlay canvas
is for markers, vectors, UI gizmos, and explicit fallbacks. CPU/readback grids
are valid for gameplay sampling, low-frequency diagnostics, or bridging data
between incompatible runtime contexts, but the visible map-space texture layer
still belongs in the main renderer.

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
- `src/gameplay/mapDataSaveController.js` +
  `src/gameplay/mapSidecarLoader.js`: map sidecar persistence and auto-apply
  for lighting/interaction/render FX/swarm/NPC/audio

## UI

- `src/ui/mainBindingsRuntime.js`: binds UI control listeners
- `src/ui/settingsAssemblyRuntime.js`: compatibility/canonical settings wiring
- `src/ui/swarmUiRuntimeBinding.js`: swarm UI reflection/input sync
- `src/ui/renderFxUiRuntime.js`: Render FX label/UI reflection helpers
- `src/ui/pathfindingLabelUi.js`: pathfinding label updates
- `src/ui/lightLabelRuntime.js`: point-light/cursor-light label updates
- `src/ui/infoPanelRuntime.js`: player/path info panel updates
- `src/ui/audioPanelRuntime.js` + `src/ui/audioBindingRuntime.js`: Audio Lab
  panel UI reflection and command dispatch wiring
- `src/ui/workspaceRegistry.js`, `src/ui/workspaceRuntime.js`, and
  `src/ui/workspaceBindingRuntime.js`: tool-surface switching for Map, Audio,
  and future large auxiliary workspaces

## Audio Domain

- Settings are registered through `audio` key in
  `src/core/mainSettingsContracts.js`.
- Canonical audio settings serialize/apply through
  `src/core/settingsRuntimeBinding.js`.
- Audio runtime owner `src/audio/audioEngineRuntime.js`: WebAudio context,
  analyser, master gain, oscillator smoke source, decoded-buffer playback,
  synthesized-buffer playback.
- Audio runtime owner `src/audio/audioAnalysisRuntime.js`: browser-decoded
  `AudioBuffer` to mono samples plus offline STFT/FFT amplitude/phase data.
- Audio runtime owner `src/audio/frequencyMappingRuntime.js`: shared
  log-frequency authoring-space mapping from normalized frequency rows to Hz
  and source STFT bins.
- Audio runtime owner `src/audio/spectrogramRuntime.js`: static file
  spectrogram rendering plus live analyser smoke-view rendering. File
  spectrograms are cached as a base image so brush strokes only redraw the
  scribble overlay.
- Audio runtime owner `src/audio/scribbleCanvasRuntime.js`: editable
  frequency-time grid plus STFT amplitude threshold/contrast/gain auto-paint
  extraction into that grid. It also owns bounded greedy brush-blob
  approximation, which replaces dense scribble grids with a fixed number of
  replayable ellipse strokes.
- Audio runtime owner `src/audio/audioScribbleInputRuntime.js`: pointer input
  mapping from canvas coordinates to time/frequency scribble cells.
- Audio runtime owner `src/audio/resynthesisRuntime.js`: painted-grid
  resynthesis into a WebAudio `AudioBuffer`; the original spectrogram remains
  a visual guide and is not mixed into scribble playback.
- Audio authoring defaults to log-frequency between `minHz` and `maxHz`; the
  scribble grid is an authoring space and maps back to source STFT bins through
  the shared frequency mapper.
- Audio map sidecar is `audio.json` and participates in map `Save All` and
  sidecar load flows.
- Audio controls live under `RD > Audio`; the Audio workspace remains as a
  large spectrogram/waveform tool surface.

## Slime Domain

- Settings are registered through the `slime` key in
  `src/core/mainSettingsContracts.js`.
- Slime controls live under `RD > Trail`, and Slime visualization renders
  through the main terrain renderer rather than a detached workspace.
- Mechanics are documented in `docs/SLIME_SIM.md`.
- `src/slime/slimeGpuRuntime.js` owns the shared WebGL2 Physarum backend:
  float texture agent state, trail/deposit textures, ping-pong update passes,
  diffusion/decay, and display.
- Stochastic controls (`wanderChance`, `wanderStrengthDeg`, `sensorNoise`)
  and spawn modes are part of the base experiment because deterministic
  sensor-only movement can collapse into stable attractors too quickly.
- Optional terrain coupling samples height, slope, and water textures as sensor
  score biases. Slope also has a hard cutoff that rejects movement onto
  over-steep samples.
- Canvas clicks run a GPU brush operation that respawns agents inside the brush
  radius using the active spawn mode and weakens nearby trail strength.
- Slime settings are canonical store-backed settings. Map `Save All` writes
  `slime.json`, map loading applies `slime.json` when present and defaults when
  absent, and Slime Lab also supports named presets through the shared module
  preset runtime. Built-in preset files live under `assets/presets/slime`;
  browser/dev-created presets are mirrored to local browser storage.
- `src/ui/slimePanelRuntime.js` and `src/ui/slimeBindingRuntime.js` own
  `RD > Trail` Slime UI reflection and command dispatch.
- Long-term rendering direction: WebGL2 is the lightweight prototype backend.
  Keep simulation backends behind domain runtime APIs so WebGPU or native
  Rust/WGPU can replace the implementation if large agent counts or terrain
  coupling require compute shaders/storage buffers.
- GPU readback should remain sparse and targeted. Gameplay/render integration
  should prefer passing simulation fields such as trail maps as renderer-owned
  textures and compositing them through the normal terrain shader layer path.

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
