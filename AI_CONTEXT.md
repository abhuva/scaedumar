# AI_CONTEXT.md

## Purpose

This file is the fast handoff context for AI agents working on this repository.
Use it before changing code.

## Product Intent

Build a self-contained terrain rendering prototype from map textures:
- splat/albedo map
- normal map
- height map for shadowing

No game engine is used.

## Runtime Overview

- Entry point: `index.html`
- Main implementation: `src/main.js`
- Desktop wrapper: `src-tauri/` (Tauri v2)
- Rendering backend: WebGL2 terrain pass + 2D overlay canvas for interaction markers
- Gameplay scaffolding modules now exist under `src/gameplay/` (`entityStore`, `movementSystem`) and are scheduler-driven adapters around existing runtime behavior.
- Interaction command routing is now extracted to `src/gameplay/interactionCommands.js` and composed into main command registration.
- Point-light editor orchestration is now extracted to `src/gameplay/pointLightEditorController.js`, with draft state isolated in `src/gameplay/pointLightEditorState.js`.
- Point-light selection wrappers (`getSelectedPointLight`, `clearLightEditSelection`, `setLightEditSelection`) are now extracted to `src/gameplay/pointLightSelectionRuntime.js`.
- Point-light editor runtime bindings (`beginLightEdit`, `applyDraftToSelectedPointLight`, `rebakeIfPointLightLiveUpdateEnabled`, `findPointLightAtPixel`, `createPointLight`, `deletePointLightById`) are now extracted to `src/gameplay/pointLightEditorRuntime.js`.
- Point-light draft-state binding helpers (has/set draft fields) are now extracted to `src/gameplay/pointLightDraftRuntime.js`.
- Point-light save/load/confirmation I/O orchestration is now extracted to `src/gameplay/pointLightIoController.js`.
- Point-light I/O runtime binding (controller composition + wrapper methods, including save-confirm armed-state access) is now extracted to `src/gameplay/pointLightIoRuntime.js`.
- Map-level JSON "Save All" file-generation/save orchestration is now extracted to `src/gameplay/mapDataSaveController.js`.
- Map-sidecar JSON load/apply orchestration for URL/folder-selection paths is now extracted to `src/gameplay/mapSidecarLoader.js`.
- Map-load orchestration for path/folder-selection flows is now extracted to `src/gameplay/mapLoader.js` and composed from `main.js`.
- Swarm integration-step behavior is now extracted to `src/gameplay/swarmStep.js` and composed into the swarm update loop.
- Swarm render interpolation state handling is now extracted to `src/gameplay/swarmInterpolation.js` and composed into follow/overlay/lit-swarm paths.
- Swarm reseed/reset behavior is now extracted to `src/gameplay/swarmReseed.js` and composed from `main.js`.
- Swarm target selection/follow targeting helpers are now extracted to `src/gameplay/swarmTargeting.js`.
- Swarm terrain/water/flyability environment helpers are now extracted to `src/gameplay/swarmEnvironment.js`.
- Cursor-light pointer-to-UV update ownership is now extracted to `src/gameplay/cursorLightPointerRuntime.js`.
- Cursor-light pointer state mutation wrappers (`clearCursorLightPointerState`, `setCursorLightPointerUv`) are now extracted to `src/gameplay/cursorLightPointerStateRuntime.js`.
- Swarm-cursor pointer-to-map update ownership is now extracted to `src/gameplay/swarmCursorPointerRuntime.js`.
- Swarm agent-buffer mutation ownership (`ensure`, `append`, `remove`, resting-bird spawn) is now extracted to `src/gameplay/swarmAgentStateMutator.js`.
- Swarm-data hydration/apply orchestration (`swarm.json` settings+state+follow apply) is now extracted to `src/gameplay/swarmDataApplier.js`.
- Swarm-data serialization for map save/load is now extracted to `src/gameplay/swarmDataSerializer.js`.
- Swarm UI input normalization helpers are now extracted to `src/ui/swarmInputNormalization.js`.
- Swarm panel UI reflection (labels, enable/disable state, follow button text, stats panel updates) is now extracted to `src/ui/swarmPanelUi.js`.
- Swarm settings UI-apply reflection path is now extracted to `src/ui/swarmSettingsApplier.js`.
- Interaction-sidecar serialization (`interaction.json`) is now extracted to `src/gameplay/interactionDataSerializer.js`.
- Required DOM element lookup helpers (`getRequiredElementById`, `getRequiredElements`) are now extracted to `src/ui/domElementLookup.js`.
- UI status text update helper (`setStatus`) is now extracted to `src/ui/statusRuntime.js`.
- Interaction settings UI-apply reflection path is now extracted to `src/ui/interactionSettingsApplier.js`.
- NPC persistence helpers (`serializeNpcState`, `parseNpcPlayer`, `applyLoadedNpc`) are now extracted to `src/gameplay/npcPersistence.js`.
- Player-position clamp/apply helper (`setPlayerPosition`) is now extracted to `src/gameplay/playerStateRuntime.js`.
- Lighting settings UI-apply reflection path is now extracted to `src/ui/lightingSettingsApplier.js`.
- Render-FX settings UI-apply reflection paths (fog/parallax/cloud/water) are now extracted to `src/ui/renderFxSettingsApplier.js`.
- Render-FX sidecar serialization helpers (lighting/fog/parallax/cloud/water) are now extracted to `src/gameplay/renderFxDataSerializer.js`.
- Core map/player/point-light store sync helpers are now extracted to `src/gameplay/stateSync.js`.
- Interaction state access helpers for cursor-light snapshot and point-light live-update are now extracted to `src/gameplay/interactionStateAccess.js`.
- Swarm state access helpers for defaults/reset and enabled-state lookup are now extracted to `src/gameplay/swarmStateAccess.js`.
- Runtime gameplay/state snapshot helpers for interaction mode, pathfinding settings, swarm cursor mode, and normalized swarm settings are now extracted to `src/gameplay/runtimeStateSnapshots.js`.
- Interaction-mode snapshot runtime binding (`getInteractionModeSnapshot`) is now extracted to `src/gameplay/interactionModeSnapshotRuntime.js`.
- Swarm runtime/store synchronization helpers are now extracted to `src/gameplay/swarmStoreSync.js`.
- Swarm follow-state apply/stop controller logic is now extracted to `src/gameplay/swarmFollowStateController.js`.
- Swarm follow-camera smoothing reset helper (`resetSwarmFollowSpeedSmoothing`) is now extracted to `src/gameplay/swarmFollowSmoothingRuntime.js`.
- Pathfinding movement-window and step-cost helpers are now extracted to `src/gameplay/pathfindingCostModel.js`.
- Mode/topic capability UI orchestration is now extracted to `src/ui/modeCapabilitiesUi.js`.
- Topic-panel runtime orchestration (`setTopicPanelVisible`, guarded `setActiveTopic`, `updateModeCapabilitiesUi`) is now extracted to `src/ui/topicPanelRuntime.js`.
- Map-path/file-URL helper utilities are now extracted to `src/gameplay/mapPathUtils.js`.
- Tauri runtime invoke/folder-picker/folder-validation helpers are now extracted to `src/gameplay/tauriRuntime.js`.
- Map IO helpers for folder-selection file lookup and JSON load (Tauri+fetch fallback) are now extracted to `src/gameplay/mapIoHelpers.js`.
- Time-routing/time-config state-access helpers are now extracted to `src/core/timeStateAccess.js`.
- Applied-settings normalization/store-sync helpers (`normalizeAppliedSettings`, `updateStoreFromAppliedSettings`) are now extracted to `src/core/appliedSettingsStoreSync.js`.
- Simulation-knob section state-access helper (`getSimulationKnobSectionFromStore`) is now extracted to `src/core/simulationKnobAccess.js`.
- Settings-registry bridge helpers (`serializeSettingsByKey`, `applySettingsByKey`) are now extracted to `src/core/settingsRegistryBridge.js`.
- Settings-defaults access helper (`getSettingsDefaults`) is now extracted to `src/core/settingsDefaultsAccess.js`.
- Color conversion helpers are now extracted to `src/core/colorUtils.js`.
- Shared clamp/interpolation/hour-format helpers are now extracted to `src/core/mathUtils.js`.
- Fallback map-image generation and image-data extraction helpers are now extracted to `src/render/fallbackMapImages.js`.
- Default-map image initialization orchestration (fallback image creation/upload/size+image-data bootstrap) is now extracted to `src/render/defaultMapImageRuntime.js`.
- Map-image apply/runtime-size/point-light-worker sync helpers are now extracted to `src/gameplay/mapImageRuntime.js`.
- Point-light/cursor-light label update helpers are now extracted to `src/ui/lightLabelRuntime.js`.
- Point-light editor UI orchestration (`updateLightEditorUi`) is now extracted to `src/ui/pointLightEditorRuntime.js`.
- Point-light editor binding orchestration (`bindPointLightEditorControls` deps composition) is now extracted to `src/ui/pointLightEditorBindingRuntime.js`.
- Cursor-light mode UI reflection helper (`updateCursorLightModeUi`) is now extracted to `src/ui/cursorLightModeUiRuntime.js`.
- Sun keyframe interpolation model (`sampleSunAtHour`) is now extracted to `src/sim/sunModel.js`.
- Map normal/height sampling helpers (`normalize3`, `sampleNormalAtMapPixel`, `sampleHeightAtMapPixel`, `sampleHeightAtMapCoord`) are now extracted to `src/gameplay/mapSampling.js`.
- Shadow/occlusion helpers (`computeSwarmDirectionalShadow`, `hasLineOfSightToLight`) are now extracted to `src/gameplay/shadowOcclusion.js`.
- Point-light bake canvas sizing and RGBA apply/upload helpers are now extracted to `src/render/pointLightBakeCanvasRuntime.js`.
- Point-light bake-sync accumulation/occlusion/packing logic (`bakePointLightsTextureSync`) is now extracted to `src/render/pointLightBakeSync.js`.
- Point-light bake-sync lazy runtime composition/binding is now extracted to `src/render/pointLightBakeSyncBindingRuntime.js`.
- Point-light worker + bake-orchestrator runtime wiring is now extracted to `src/render/pointLightBakeRuntime.js`.
- Point-light bake operation bindings (`ensurePointLightBakeSize`, `applyPointLightBakeRgba`, `schedulePointLightBake`, `bakePointLightsTexture`) are now extracted to `src/render/pointLightBakeBindingRuntime.js`.
- Cycle-hour slider/label UI helpers are now extracted to `src/ui/timeUiRuntime.js`.
- Runtime mode state-access helpers (`getRuntimeMode`, capability checks) are now extracted to `src/core/modeStateAccess.js`.
- Runtime mode state runtime binding (`getRuntimeMode`, `canUseTopicInCurrentMode`, `canUseInteractionInCurrentMode`) is now extracted to `src/core/modeStateRuntimeBinding.js`.
- Map runtime state helpers (`setCurrentMapFolderPath`, default-settings apply, map-reset, map-size-change apply) are now extracted to `src/gameplay/mapRuntimeState.js`.
- Lighting parameter assembly logic (`computeLightingParams`) is now extracted to `src/sim/lightingParamsRuntime.js`.
- Startup UI synchronization sequence is now extracted to `src/ui/startupUiSync.js`.
- Map bootstrap/default-folder auto-load flow is now extracted to `src/gameplay/mapBootstrap.js`.
- Map bootstrap runtime binding (default-folder candidate wiring + `tryAutoLoadDefaultMap`) is now extracted to `src/gameplay/mapBootstrapRuntime.js`.
- Swarm unlit-overlay and gizmo drawing helpers are now extracted to `src/ui/swarmOverlayRuntime.js`.
- Render-frame UI synchronization helpers (fog auto-color input + cycle info text) are now extracted to `src/render/frameUiRuntime.js`.
- Weather-field render metadata update helper is now extracted to `src/render/weatherFieldRuntime.js`.
- Render-frame swarm layer/state orchestration helper is now extracted to `src/render/frameSwarmRenderRuntime.js`.
- Render-frame time/tick routing setup helper is now extracted to `src/render/frameTimeRuntime.js`.
- Render-loop orchestration is now extracted to `src/render/frameRuntime.js` with `main.js` delegating via a thin wrapper.
- Viewport/canvas resize helper is now extracted to `src/render/viewportRuntime.js`.
- Cloud-noise generation + texture upload helpers are now extracted to `src/render/cloudNoiseRuntime.js`.
- Shadow-target sizing/framebuffer attach and shadow-pass draw orchestration are now extracted to `src/render/shadowPipelineRuntime.js`.
- WebGL shader/program/texture creation and image upload helpers are now extracted to `src/render/glResourceRuntime.js`.
- Flow-map rebuild orchestration (`rebuildFlowMapTexture`) is now extracted to `src/render/flowMapRuntime.js`.
- Pathfinding preview runtime helpers (movement-field rebuild, preview/path extraction, pointer preview update, path metrics) are now extracted to `src/gameplay/pathfindingPreviewRuntime.js`.
- Info-panel status composition/update logic is now extracted to `src/ui/infoPanelRuntime.js`.
- Render-FX label/UI helper updates (`update*Label`/`update*Ui`) are now extracted to `src/ui/renderFxUiRuntime.js`.
- Render-FX binding orchestration (`bindRenderFxControls` deps composition) is now extracted to `src/ui/renderFxBindingRuntime.js`.
- Swarm-follow binding orchestration (`bindSwarmFollowControls` deps composition) is now extracted to `src/ui/swarmFollowBindingRuntime.js`.
- Swarm-panel binding orchestration (`bindSwarmPanelControls` deps composition) is now extracted to `src/ui/swarmPanelBindingRuntime.js`.
- Canvas binding orchestration (`bindCanvasControls` deps composition) is now extracted to `src/ui/canvasBindingRuntime.js`.
- Runtime binding orchestration (`bindRuntimeControls` deps composition) is now extracted to `src/ui/runtimeBindingRuntime.js`.
- Startup UI sync orchestration (`runStartupUiSync` deps composition) is now extracted to `src/ui/startupUiSyncRuntime.js`.
- Frame-runtime binding orchestration (`createFrameRuntime` deps composition) is now extracted to `src/render/frameRuntimeBinding.js`.
- Overlay-hooks composition (`createOverlayHooks` deps composition) is now extracted to `src/ui/overlays/overlayHooksRuntime.js`.
- Overlay-drawer composition (`createOverlayDrawer` deps composition) is now extracted to `src/ui/overlays/overlayDrawerRuntime.js`.
- Map-data save runtime composition (`createMapDataSaveController` deps composition) is now extracted to `src/gameplay/mapDataSaveRuntime.js`.
- Camera/coordinate transform helpers (camera state, view extents, world/uv/map/screen conversions) are now extracted to `src/gameplay/cameraTransforms.js`.
- Camera view/command helpers (`resetCamera`, `getScreenAspect`, `getMapAspect`) are now extracted to `src/gameplay/cameraViewRuntime.js`.
- Pathfinding label helper updates are now extracted to `src/ui/pathfindingLabelUi.js`.
- Interaction-mode apply/toggle controller logic is now extracted to `src/gameplay/interactionModeController.js`.
- Interaction-mode runtime binding (`setInteractionMode` deps composition) is now extracted to `src/gameplay/interactionModeRuntime.js`.
- Overlay/gameplay frame integration now goes through `src/ui/overlays/overlayHooks.js` (gameplay update hook + overlay render hook).
- Overlay animation gating policy (`shouldAnimateOverlay`) is now extracted to `src/ui/overlays/overlayAnimationRuntime.js`.
- Overlay dirty-flag state ownership is now extracted to `src/ui/overlays/overlayDirtyRuntime.js`.
- The old per-frame `frameSnapshot` / `runtimeParityAdapter` bridge has been removed.
- Core state is now updated through command handlers, settings apply flows, bootstrap/map-load synchronization, and scheduler-owned system updates.
- Camera commands (`reset`, `zoomAtClient`, `dragToClient`, `setPose`) now commit canonical camera pose in store first and then apply a runtime camera adapter.
- Frame render camera inputs now resolve from canonical `coreState.camera` defaults (not local runtime-camera fallbacks) across frame-state assembly and uniform upload.
- Local runtime camera mirror state (`panWorld`/`zoom`) has been removed; camera ownership is canonical store state.
- Migration is still in progress:
  - active time/render FX/pathfinding/swarm settings now prefer core state
  - some UI/apply helpers still remain DOM-backed for view synchronization and legacy save/apply paths
- Settings UI: left vertical topic-icon dock + single side panel (one topic open at a time)
  - Mode toggles: `LM` and `PF` (note: `AS` is a topic button that opens the Agent Swarm panel in `index.html`, not a mode toggle)
  - Runtime mode capability gating is now active (`dev`/`gameplay`/`hybrid`) for topic buttons + interaction mode toggles.
- Map bundle auto-load tries these folders in order:
  - `assets/Map 1/`
  - `assets/`
- Required PNG names in each candidate folder:
  - `splat.png`
  - `normals.png`
  - `height.png`
  - `slope.png`
  - `water.png`
- Optional sidecar JSON files in each candidate folder:
  - `pointlights.json`
  - `lighting.json`
  - `parallax.json`
  - `interaction.json`
  - `fog.json`
  - `clouds.json`
  - `waterfx.json`
  - `swarm.json`
  - `npc.json`
- `Load Map` topic supports loading by folder path or folder picker (map bundle semantics)
- Desktop map-load behavior:
  - If map path input is empty in Tauri runtime, `Load` opens native folder picker.
  - Absolute filesystem map paths are validated (`splat.png`, `normals.png`, `height.png`, `slope.png`, `water.png`) before load.
- Desktop JSON I/O behavior:
  - Tauri commands currently exposed:
    - `save_json_file(path, content)`
    - `load_json_file(path)`
    - `validate_map_folder(path)`
    - `pick_map_folder()`
  - Save/load prefers Tauri commands in desktop runtime, with browser fallback path when native command flow fails.

## Current Lighting Model

- Day cycle is simulated from keyframes (`SUN_KEYS`) and interpolation.
- Time progresses based on UI slider `cycleSpeed` (`0..1` hours/second).
- UI slider `cycleHour` (`0..24` hours, minute resolution) both live-tracks current simulated time and allows immediate time scrubbing.
- Sun:
  - directional light (`uSunDir`)
  - warm tones at low altitude
- Moon:
  - secondary directional light (`uMoonDir`)
  - cool dim tint to avoid pitch-black nights
- Ambient:
  - blended sun/moon ambient tint and intensity
  - includes a small blue night-ambient floor to avoid pitch-black nights
- Shadows:
  - map-space shadow texture pass raymarches over `uHeight` (sun + moon channels)
  - optional second blur pass smooths that shadow texture before main terrain shading
  - shadow pass runs on a reduced map-space resolution (`heightSize * 0.5`) for performance
- Optional point lights:
  - `Lighting Mode` toggle switches click behavior to light placement/selection
  - each point light stores map pixel coordinate + color + range (radius in px) + intensity + height offset + per-light flicker amount + per-light flicker speed
  - default new light: orange, range `30`, intensity `1.0`
  - light source height for baking is `terrainHeightAtLight + heightOffset`
  - editor has `Live Update` toggle (`on` = rebake on edit input, `off` = rebake on explicit save)
  - `Save All` / `Load All` supports JSON persistence (`pointlights.json`)
  - save action uses a two-click confirmation to avoid accidental overwrite/export
  - load first attempts `<currentMapFolder>/pointlights.json`, then falls back to manual file pick
  - linear radial falloff (range) + independent intensity multiplier, with saturating accumulation to avoid overblown overlap
  - normal interaction is baked into a map-space `pointLightTex` on add/edit/delete or normal/height-map update
  - bake alpha channel packs weighted flicker amount + weighted flicker speed (4 bits each)
  - terrain height occlusion is baked by a light-to-surface line-of-sight test (cliffs can block local light spread)
  - main fragment shader samples `uPointLightTex` and applies RGB to base color, with optional runtime flicker modulation from alpha
- Optional cursor light mode:
  - mouse position drives a single live point light in shader uniforms
  - linear falloff + normal interaction
  - supports two elevation modes:
    - terrain-following (`height at cursor + offset`)
    - old fixed-height behavior (derived from light strength)
  - no bake per mouse move (direct fragment shading path)
- Optional parallax mode (toggle in UI):
  - combines continuous height-based UV offset (option 1)
  - plus quantized height-band offset (option 2)
  - effect is anchored to the current view center (focal UV), so relative displacement is stronger away from center
  - effect is scaled by zoom to reduce "strong when zoomed out / weak when zoomed in" mismatch
  - displaced UV is fitted back to map bounds near edges to avoid border holes/cutouts
  - strength is controlled by `parallaxStrength`
  - band count is controlled by `parallaxBands` (default 6)
- Optional height fog mode (toggle in UI):
  - camera-height proxy is derived from zoom (`zoomed out => higher camera`)
  - per-pixel fog is based on `cameraHeightNorm - terrainHeight`
  - fog alpha range is controlled by `fogMinAlpha` / `fogMaxAlpha`
  - fog response curve is controlled by `fogFalloff`
  - fog onset threshold is controlled by `fogStartOffset`
  - fog color defaults to auto light-matched tint and becomes fixed when user edits the color picker
- Optional cloud-shadow mode (toggle in UI):
  - generated seamless repeating noise texture sampled in shader (no external cloud asset)
  - two scrolling noise layers provide cloud-shape motion/parallax
  - controls: coverage, softness, opacity, scale, layer speeds
  - optional sun projection offsets cloud shadows by sun direction with adjustable strength
- Optional volumetric scattering mode (toggle in Main Lighting UI):
  - lightweight texture-space raymarch along projected sun direction
  - each sample combines fog-density shaping + cloud sun-occlusion to estimate in-scattering
  - controls: strength, density, anisotropy, ray length, sample count
- Optional water FX mode (toggle in Water UI):
  - masked by `water.png`
  - animated shimmer + flow-line cues from fixed or downhill direction
  - water tint color + tint-strength control can apply additional stylized color influence
  - downhill flow direction can be flipped with an explicit invert toggle
  - downhill direction samples a precomputed multi-scale flow-map texture built from `height.png`
  - flow-map precompute uses user-controlled 3-radius / 3-weight trend settings; runtime can blend trend with local 1-texel downhill flow
  - optional flow debug overlay displays computed water direction on water pixels
  - water shading is evaluated at map texel centers (pixel-locked) so water influence is per map pixel
  - altitude-aware sun/moon glints, shoreline foam band, and sky-tint reflection
- Map-level persistence:
  - `Load Map -> Save All` writes `pointlights.json`, `lighting.json`, `parallax.json`, `interaction.json`, `fog.json`, `clouds.json`, `waterfx.json`, `swarm.json`, and `npc.json`
  - map loading auto-applies these files when present
- Weather groundwork (architecture scaffold only):
  - core state now includes weather contract (`type`, `intensity`, `windDirDeg`, `windSpeed`, `localModulation`)
  - scheduler includes `weatherSystem` producing per-frame weather/wind vectors
  - render resources include placeholder weather-field metadata hook (no visible weather rendering feature yet)
  - main render path consumes scheduler-updated values from
    `coreState.systems` for time/lighting/fog/cloud/water, and from
    `coreState.simulation.weather` for weather.

## Camera/Interaction

- Mouse wheel: zoom (cursor-centered)
- Middle mouse drag: pan
- `LM` dock toggle enables `lighting` interaction mode.
- `PF` dock toggle enables `pathfinding` interaction mode.
- `Agent Swarm` panel has a `Use Agent Swarm` toggle for enabling/disabling swarm simulation.
- `Agent Swarm` panel has a `Fully Lit Swarm` toggle:
  - `off`: previous unlit overlay swarm rendering
  - `on`: swarm rendered in WebGL using terrain lighting pipeline (sun/moon, baked point lights, cloud shading, fog, volumetrics)
  - lit mode shadowing uses per-agent directional height-ray tests (sun + moon) instead of terrain shadow-texture sampling, reducing altitude-inconsistent shadow flicker over rugged terrain
  - lit mode applies height-aware point-light reach for swarm: baked brightness is treated as vertical reach from terrain height, with linear falloff by altitude
- `Agent Swarm` panel has a `Follow Agent Mode` button that tracks camera pan to a random selected swarm agent while keeping zoom/other controls available.
- Follow mode now has optional speed-driven zoom:
  - `Speed Zoom` toggle enables dynamic camera zoom while follow mode is active.
  - low XY movement zooms in toward `Max Zoom In`.
  - high XY movement zooms out toward `Max Zoom Out`.
  - both bounds are user-adjustable in swarm controls and persisted in `swarm.json`.
  - optional `Hawk Range Gizmo` can draw the followed hawk target-range ring while follow target is `hawk`.
  - normal-agent follow smoothing is user-tunable via `Bird Speed Smooth` and `Bird Zoom Smooth` sliders.
  - hawk follow keeps separate fixed smoothing values.
- `Agent Swarm` panel also has a `Stats Panel` toggle that opens a right-side overlay showing:
  - birds alive
  - hawks alive
  - simulation time running in integration steps
  - average hawk kill interval (ticks), computed from accumulated hawk kill events
- Mode behavior:
  - `lighting`: left click adds/selects point lights.
  - `pathfinding`: hover shows live path preview from player; left click moves player instantly to clicked cell.
  - swarm is not an interaction mode; it runs in map space while normal camera controls and interaction modes remain available.
  - Agent swarm simulation space uses map coordinates (`0..mapWidth-1`, `0..mapHeight-1`) with edge-bounce constraints (no toroidal wraparound).
  - Swarm altitude is modeled in `z: 0..256`; each integration step validates against `height.png` at target `(x,y)` and clamps to at least `terrainHeight + clearance` so agents cannot move below terrain.
  - Swarm controls expose `Min Height` and `Max Height` to define an allowed altitude band (for example `30..200`) while still enforcing terrain floor constraints.
  - Swarm controls expose `Variation` (`0..50%`) that assigns per-agent speed and turnability multipliers (`1 +/- variation`) on reseed/spawn.
  - Swarm controls expose `Sim Speed` (`0.1x..20.0x`) to scale swarm simulation time independent of render framerate.
  - Swarm agents support resting state:
    - per-tick `Rest Chance` (`0..0.002`, step `0.0001`) can switch a flying agent into rest
    - `Rest Ticks` (`100..10000`) controls how long resting lasts
    - resting agents stay landed/immobile at terrain floor and wake immediately on nearby hawk threat
    - resting is forbidden on water pixels from `water.png`
- Optional hawk predator:
  - has independent count/color/speed/turnability controls
  - target selection is range-based via `Hawk Target Range`: hawk retarget picks randomly among agents within that radius (fallback to global random if none are in range)
  - hawks do not starve/despawn; they are persistent while swarm is enabled
  - chases a random agent and switches target on reach
  - flock agents apply hawk-repulsion using the same radius/strength controls as cursor repulsion
- Swarm breeding bounce-back:
- when bird count drops below `Breeding Threshold`, breeding mode becomes active
  - while breeding mode is active, each new rest event has `Breed Spawn Chance` to create one adjacent resting bird
  - breeding mode auto-disables when bird count returns to configured `Agent Count`
- `none`: left click intentionally falls through to player reposition for testing; this is aligned with the `interactionMode === "none"` runtime branch in interaction command routing.
- Core settings registry usage:
  - lighting/fog/parallax/cloud/water/interaction/swarm defaults + serialize/apply flows are registered through `src/core/mainSettingsContracts.js`.
  - JSON compatibility is preserved (existing map-sidecar keys unchanged).
  - Render FX UI controls are command-routed via `core/renderFx/changed` (handler updates labels/UI + synchronizes `simulation.knobs` in core state).
  - Swarm panel controls are command-routed via `core/swarm/settingsChanged` (handler owns swarm UI side effects, reseed behavior, and gameplay swarm state sync).
- Lighting mode on:
  - Left click adds a point light unless one already exists at that map pixel
  - Clicking an existing light selects it and opens the side editor
  - Side editor supports `Color`, `Strength`, `Save`, `Cancel`, `Delete`
- Pathfinding mode:
  - uses local Dijkstra precompute in a square around the player (`30x30 .. 100x100`)
  - move cost uses `slope.png` grayscale + uphill delta from `height.png`
  - preview path is backtracked from hovered pixel via parent links
  - player is loaded from `<mapFolder>/npc.json` and drawn as a 0.5-map-pixel circle
- Cursor light mode on:
  - mouse movement updates live point-light position on terrain
  - optional overlay gizmo shows live cursor-light radius preview
- Player + path preview are drawn on `overlayCanvas` to keep gameplay overlays decoupled from terrain shading
- Render is pixel-sharp while zooming (`NEAREST` texture filtering)

## Shader Uniform Contract

Main light uniforms:
- `uSunDir`, `uSunColor`, `uSunStrength`
- `uMoonDir`, `uMoonColor`, `uMoonStrength`
- `uAmbientColor`, `uAmbient`
- `uPointLightTex`
- `uCloudNoiseTex`
- `uShadowTex`
- `uWater`
- `uFlowMap`
- `uUseCursorLight`, `uCursorLightUv`, `uCursorLightColor`, `uCursorLightStrength`, `uCursorLightHeightOffset`, `uUseCursorTerrainHeight`, `uCursorLightMapSize`
- `uTimeSec`, `uPointFlickerEnabled`, `uPointFlickerStrength`, `uPointFlickerSpeed`, `uPointFlickerSpatial`
- `uUseClouds`, `uCloudCoverage`, `uCloudSoftness`, `uCloudOpacity`, `uCloudScale`, `uCloudSpeed1`, `uCloudSpeed2`, `uCloudSunParallax`, `uCloudUseSunProjection`
- `uUseWaterFx`, `uWaterFlowDownhill`, `uWaterFlowInvertDownhill`, `uWaterFlowDebug`, `uWaterFlowDir`, `uWaterLocalFlowMix`, `uWaterFlowStrength`, `uWaterFlowSpeed`, `uWaterFlowScale`, `uWaterShimmerStrength`, `uWaterGlintStrength`, `uWaterGlintSharpness`, `uWaterShoreFoamStrength`, `uWaterShoreWidth`, `uWaterReflectivity`, `uWaterTintColor`, `uWaterTintStrength`, `uSkyColor`

Map/camera uniforms:
- `uSplat`, `uNormals`, `uHeight`
- `uMapTexelSize` (must come from height texture size)
- `uMapAspect` (must come from splat texture size)
- `uResolution`, `uViewHalfExtents`, `uPanWorld`
- `uUseParallax`, `uParallaxStrength`, `uParallaxBands`, `uZoom`
- `uUseFog`, `uFogColor`, `uFogMinAlpha`, `uFogMaxAlpha`, `uFogFalloff`, `uFogStartOffset`, `uCameraHeightNorm`
- `uUseVolumetric`, `uVolumetricStrength`, `uVolumetricDensity`, `uVolumetricAnisotropy`, `uVolumetricLength`, `uVolumetricSamples`

## Change Rules

- Keep branch-only workflow: never commit to default branch.
- Never create/update/trigger PR unless user explicitly asks in current turn.
- Never push unless user explicitly asks.
- Preserve pixel-sharp sampling unless user asks for smooth filtering.
- If lighting behavior changes, update both:
  - `README.md` notes
  - `AGENTS.md` Lighting Model section

## Packaging Notes (Windows-First)

- Tauri build expects `build.frontendDist = ../.tauri-dist`.
- Refresh `.tauri-dist` before release build to include latest frontend/assets.
- Current release artifacts:
  - `src-tauri/target/release/bundle/msi/TerrainPrototype_0.1.0_x64_en-US.msi`
  - `src-tauri/target/release/bundle/nsis/TerrainPrototype_0.1.0_x64-setup.exe`
  - optional: `src-tauri/target/release/bundle/portable/TerrainPrototype_0.1.0_x64_portable.zip`

## Quick Verification Checklist

After lighting/camera/map-load changes, verify:
1. Default PNGs auto-load from `assets/`.
2. Map aspect ratio is preserved (no stretch).
3. Zoom is sharp (no blur) at high magnification.
4. Daylight looks warm at sunrise/sunset.
5. Night is dim but readable due to moon light.
6. Height-map shadows still react to light direction.
7. LM/PF mode toggles correctly enforce mutual exclusivity and expected click behavior.
8. Point-light edits (save/delete) visibly rebake terrain local lighting.

Targeted architecture tests:
- `node --test tests/*.test.js`
- current suite covers mode capabilities, weather normalization contract, and settings-registry wiring.

## Known Non-Goals (Current Prototype)

- No physically accurate astronomy.
- No georeferenced sun position.
- No animated movement yet (currently instant click-to-move).
- Full modularization is still in progress; `src/main.js` remains the largest integration surface, but core/render/sim/ui/gameplay modules are now established and wired.

## Render Module Breakdown

- `src/render/renderer.js`:
  - render-pass registration and execution facade.
  - orchestrates which pass chain runs per frame.
- `src/render/resources.js`:
  - render resource helpers.
  - metadata hooks, including weather-field metadata.
- `src/render/passes/*`:
  - pass modules for shadow, blur, main terrain, and point-light usage.
- `src/render/precompute/*`:
  - map-space precompute adapters.
  - currently includes flow-map and point-light bake orchestration.
- `src/render/frameRenderState.js`:
  - builds frame render DTO from core state + frame inputs.
- `src/render/uniformInputState.js`:
  - assembles uniform input object consumed by terrain shading upload.

## Session Handoff (2026-04-20)

Current code now includes the following major rendering/pipeline changes:

- Shadow pipeline refactor (performance):
  - Main terrain shader no longer raymarches shadows per screen pixel.
  - Separate map-space shadow pass writes sun/moon visibility into `uShadowTex` (R/G channels).
  - Optional blur pass is applied to that shadow texture before terrain lighting.
  - Shadow map is rendered at reduced resolution (`heightSize * 0.5`) for speed.

- Volumetric scattering:
  - Uses fog + cloud occlusion integration and now has soft-knee compression/headroom compositing to avoid overblown highlights.
  - Explicit sun-altitude scaling is applied so midday rays are shorter/weaker than low-sun rays.

- Water FX system:
  - New `Water` topic panel and `waterfx.json` persistence.
  - Effects combined in one shader path (water-mask only):
    - flow shimmer
    - flow-line modulation
    - sun/moon glints
    - shoreline foam
    - sky-tint reflection
  - Supports fixed direction or downhill flow mode.

- Downhill flow implementation (latest state):
  - Runtime no longer computes only local slope for downhill direction.
  - A precomputed multi-scale flow-map texture (`uFlowMap`) is generated from `height.png` on map load and sampled in shader.
  - In downhill mode, fixed-direction slider input is no longer used to seed flow direction; direction comes only from flow-map trend + local height gradient.
  - Precompute is controlled by 3 user radii and 3 user weights.
  - Runtime direction can blend trend flow-map direction with local 1-texel downhill via `Local Flow Mix`.
  - `Downhill Boost` scales downhill water-motion intensity (normal perturbation + flow-line tint) without affecting fixed-direction mode.
  - Water tint applies in the shader as a controllable (`0..1`) color mix over water-lit shading.
  - Downhill direction now has an `Invert Downhill` toggle for rapid direction flip when source gradients appear reversed.
  - Flow-map precompute resolution is increased (`~height/2`, clamped to `64..512`) to reduce coarse direction blocks and visible zone seams.
  - Water FX sampling now snaps to map texel centers before evaluating water mask/flow/noise/shoreline, which removes sub-pixel water variation and keeps influence map-pixel locked.
  - `Flow Debug` toggle overlays computed direction on water pixels for inspection.

Where to look in code for continuation:

- Main shader water logic:
  - `applyWaterFx(...)` in `src/main.js`
- Flow-map build/update:
  - `buildFlowMapImageDataFromHeight(...)`
  - `rebuildFlowMapTexture()`
  - called from map-image apply and water-flow control updates
- Water settings lifecycle:
  - `DEFAULT_WATER_SETTINGS`
  - `serializeWaterSettings()`
  - `applyWaterSettings(...)`
  - map save/load includes `waterfx.json`

Likely next tuning work (based on latest user feedback):

- Fine-tune default values for:
  - `waterLocalFlowMix`
  - `waterFlowRadius1/2/3`
  - `waterFlowWeight1/2/3`
- Validate that `Flow Debug` gives intuitive direction colors and optional magnitude cue.
- If needed, add presets (for example `Local`, `Balanced`, `Trend`) to quickly switch between looks.
