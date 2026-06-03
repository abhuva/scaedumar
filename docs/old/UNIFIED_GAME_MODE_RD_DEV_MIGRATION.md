# Unified Game Mode RD-Dev Migration

## Purpose

Remove the user-facing distinction between gameplay mode and dev mode.

The target runtime has one normal user path: game mode. Developer/debug controls remain available through the in-game `RD` panel. If later builds should hide these controls from players, the `RD` entry button can be disabled without changing the runtime architecture.

## Current Branch

- Branch: `unified-game-mode-rd-dev`
- Status: incremental RD-dev control migration.
- Do not open a PR or push unless explicitly requested.

## Target Outcome

- Title screen starts the normal game path only.
- No user-facing dev mode.
- No separate dev topic dock.
- The workspace/tool-surface concept stays for large auxiliary views such as Audio; it is no longer the primary settings access path.
- All development, debug, tuning, IO, audio, and simulation controls live under the in-game `RD` panel.
- Runtime owners stay modular. The RD panel is a navigation/control surface, not a new owner of gameplay, render, audio, or simulation state.

## Architecture Rule

Move UI access first, not ownership.

Existing owner modules should continue to own mutation, validation, serialization, and runtime state:

- Map lifecycle/save/load: `src/gameplay/mapLifecycleRuntime.js`, `src/gameplay/mapDataSaveRuntime.js`, `src/gameplay/mapDataSaveController.js`
- Terrain/render settings: current settings contracts and render/runtime owners
- Point lights: point-light runtime/controller modules
- Swarm: swarm gameplay/render/runtime modules
- Slime/trails: `src/slime/`, Slime main-render runtime, and Slime settings contracts
- Resource debug/knowledge/stock: resource discovery/debug/stock runtimes
- Audio: `src/audio/` runtimes and current audio UI binding/runtime modules
- Mode/capability shell: mode-capability modules until removed or simplified

Events remain post-change notification/invalidation only. Commands/runtime owners handle mutation and success/failure.

## RD-Dev Navigation Plan

Use nested tabs to avoid dev-mode screen clutter.

Top-level RD tabs:

- `Terrain`
- `Agents`
- `Trail`
- `Knowledge`
- `Sprites`
- `Audio`
- `Pathing`
- `IO`

Planned sub-tabs:

- `Terrain`: `Map`, `Lighting`, `Point Lights`, `Fog`, `Clouds`, `Water`, `Water Trails`, `Detail`, `Camera`
- `Agents`: `Swarm`, `Follow`, `Stats`, future NPC controls
- `Trail`: `Slime Runtime`, `Trail Visual`, `Terrain Coupling`, `Plant Coupling`, `Hunting/Flee`, `Tracks Knowledge`
- `Knowledge`: `Knowledge`, `Known View`, `Stock`, later Inventory/Condition debug
- `Sprites`: `Structures`, later sprite details/decals/agents debug
- `Audio`: `Spectrogram`, `Synthesis`, `Soundscape`, later playback/IO controls if needed
- `Pathing`: `Local`, `NAV`, `Route`
- `IO`: `Load Map`, `Save Map Data`, `Preset Management`, `Import/Export Sidecars`

## Migration Strategy

Migration access first, then remove old shell pieces once parity exists.

### Phase 0: Baseline

- [ ] Commit/checkpoint current UI/startup changes before broad migration edits.
- [ ] Confirm branch is not `main`.
- [ ] Run baseline validation:
  - [ ] `node --check src\main.js`
  - [ ] `node --test tests\*.test.js`
  - [ ] `npm run lint:md`
- [ ] Keep this document updated after each migration slice.

### Phase 1: RD Nested Tab Shell

- [x] Add generic nested RD tab markup/CSS/runtime helpers.
- [x] Scope nested RD tab groups so Terrain sub-tabs and Knowledge sub-tabs do not affect each other.
- [x] Keep current resource-debug panels reachable as the migrated `Knowledge` group.
- [x] Add top-level placeholder groups without moving all dev controls yet.
- [x] Preserve fixed RD panel height above the player HUD.
- [x] Preserve square/pixel UI style.
- [x] Validate that existing RD tabs still bind and update correctly in browser.

### Phase 2: Mode Capability Relaxation

- [x] Make gameplay mode capable of accessing migrated RD-dev controls.
- [x] Keep map click behavior gameplay-safe.
- [x] Remove legacy dev no-mode teleport behavior.
- [x] Prevent accidental dev no-mode teleport behavior from entering unified mode.
- [x] Remove `dev` as an internal runtime mode after RD parity.
- [x] Update tests for intended unified-mode behavior.

### Phase 3: Terrain Controls Migration

- [x] Move `map` controls into `Terrain > Map` or `IO > Load Map`, depending on final categorization.
- [x] Move `lighting` controls into `Terrain > Lighting`.
- [x] Move point-light editor controls into `Terrain > Point Lights`.
- [x] Move `fog` controls into `Terrain > Fog`.
- [x] Move `clouds` controls into `Terrain > Clouds`.
- [x] Move `water` controls into `Terrain > Water`.
- [x] Move `water-trails` controls into `Terrain > Water Trails`.
- [x] Move `detail` controls into `Terrain > Detail`.
- [x] Add or expose camera controls under `Terrain > Camera`.
- [x] Move cursor-light controls into `Terrain > Cursor Light`.
- [x] Preserve existing DOM IDs during first migration pass where practical to avoid binding rewrites.

### Phase 4: Simulation/System Controls Migration

- [x] Move `swarm` controls into `Agents`.
- [x] Move full Slime Lab controls into `Trail`.
- [x] Merge current RD Slime controls with the full Slime Lab controls where appropriate.
- [x] Remove the legacy detached Slime canvas/runtime after main-render Slime parity.
- [x] Document any remaining duplicate Slime controls or compatibility paths.
- [x] Split the first-pass Slime `Lab` tab into smaller Trail sub-tabs after the full control list proved too dense.

### Phase 5: IO, Info, Pathing, and Overlay Controls

- [x] Move map load/save-all controls into `IO`.
- [x] Move remaining save/load sidecar controls into `IO`.
- [x] Remove redundant visible `Info` tab after readouts were covered elsewhere.
- [x] Move local pathfinding tuning controls into `Pathing > Local`.
- [x] Keep performance overlay access as the HUD `O` shortcut.
- [x] Move route/pathing debug controls into `Pathing > Route`.
- [x] Move texture/resource/debug overlay shortcuts into the RD right-edge overlay rail.
  - [x] Route drawing/debug overlay controls
  - [x] Swarm stats overlay visibility
  - [x] Swarm hawk-range gizmo visibility
  - [x] Lighting cursor-gizmo visibility
  - [x] Pathfinding-specific debug overlays: no separate control currently exists beyond normal PF preview/pathing controls
- [x] Ensure Save All behavior and sidecar compatibility remain unchanged.

### Phase 6: Audio Integration

- [x] Move audio controls into `Audio` nested tabs.
- [ ] Decide audio surface model:
  - [ ] Option A: audio canvases inside RD panel.
  - [x] Option B: audio tool viewport can temporarily replace or overlay the main viewport.
  - [x] Option C: audio runs mostly as side-panel controls while game rendering remains visible.
- [ ] Add render-stack/tool visibility controls as needed:
  - [ ] Terrain render visibility
  - [ ] Gameplay overlay visibility
  - [ ] Swarm render visibility
  - [ ] Slime trail visibility
  - [x] Audio surface visibility
- [x] Verify audio controls can run in context of the running game without forcing a workspace switch.

### Phase 7: Remove User-Facing Dev Mode

- [x] Remove title `dev mode` button.
- [x] Keep the workspace/tool-surface concept while removing it as the primary settings access path.
- [x] Remove old topic dock once every needed topic is reachable from RD-dev.
- [x] Simplify topic capability logic after migration parity.
- [x] Simplify remaining runtime mode compatibility logic.
- [ ] Update README run/use instructions if run/use steps change.
- [x] Update `AI_CONTEXT.md`.

## Known Risks

- Legacy dev no-mode map-click teleport has been removed. If direct repositioning is needed later, reintroduce it as an explicit RD/tool command with its own UI affordance.
- Workspace switching clears active interaction modes when leaving the map workspace. This is intentional for large auxiliary tool surfaces such as Audio; Slime visualization is not a workspace surface.
- Many bindings depend on stable DOM IDs. Early migration should move existing elements instead of recreating controls.
- Audio has large canvas surfaces and may need an explicit tool viewport, not only small RD panel rows.
- Slime now uses the main-context gameplay runtime path only. The detached legacy canvas/runtime has been removed.
- The RD panel can become a giant `index.html` block if nested tabs are not kept structured.
- Legacy/unknown mode names normalize to gameplay; `title` is only a shell visibility state.

## Findings

- `src/core/modeCapabilities.js` currently gates gameplay to only `resource-debug` topics and limited interaction modes.
- Gameplay accesses migrated controls through the `resource-debug` topic only. This keeps the old dev topic names unavailable from gameplay while still exposing the nested RD-dev surface.
- `dev` was removed as an internal runtime mode. Title screen now exposes the normal game path only.
- The old dev topic dock and placeholder migrated-topic cards were removed. The only remaining topic panel target is `resource-debug`, opened from the gameplay HUD `RD` button.
- Mode topic capabilities now expose only `resource-debug`; stale topic names such as `map`, `interaction`, `swarm`, `lighting`, `detail`, `fog`, `clouds`, `water`, `water-trails`, `editor`, and `info` are no longer valid panel targets.
- Gameplay currently hides the workspace switcher through CSS; the old topic dock has been deleted.
- Audio remains a separate tool workspace for large visual surfaces; Slime is now controlled from `RD > Trail` and visualized through the terrain overlay path instead of a user-facing workspace.
- Existing RD panel already contains gameplay-oriented resource debug tabs: Knowledge, Known View, NAV, Stock, and Slime.
- First RD-dev shell keeps the existing resource debug panels under top-level `Knowledge` and uses separate `.rd-dev-tab` / `.rd-dev-panel` bindings so existing `.rd-tab` behavior remains isolated.
- Runtime readout DOM IDs were moved into hidden binding targets after the visible `RD > Info` tab was removed as redundant.
- Map load/save DOM IDs were moved into `RD > IO`.
- Nested RD sub-tabs are now scoped with `data-rd-tab-group`, allowing `Terrain`, `Knowledge`, and `Sprites` to each own local `.rd-tab` navigation without cross-selecting panels.
- Main lighting DOM IDs were moved into `RD > Terrain > Lighting`.
- Fog DOM IDs were moved into `RD > Terrain > Fog`.
- Cloud DOM IDs were moved into `RD > Terrain > Clouds`.
- `RD > Terrain > Clouds` was trimmed during manual cleanup: Sun Offset and Sun Projection were removed from UI, settings, sidecar serialization, and shader/uniform code because the projection offset did not provide useful visual control.
- Detail DOM IDs and `data-detail-*` declarative bindings were moved into `RD > Terrain > Detail`.
- Water FX DOM IDs were moved into `RD > Terrain > Water`.
- Water Trails DOM IDs were moved into `RD > Terrain > Water Trails`.
- Point-light editor DOM IDs were moved into `RD > Terrain > Point Lights`. `RD > Terrain > Point Lights` exposes a `Show Gizmos` toggle that activates/deactivates the existing lighting interaction mode so point-light placement/selection gizmos are explicit and not tied to tab selection.
- `RD > Terrain > Lighting` was trimmed during manual cleanup: the visible Day Speed slider was removed because game-time speed controls already cover it, volumetric scatter UI/settings/render code was removed, and point-light flicker controls were moved to `RD > Terrain > Point Lights`.
- Cursor-light DOM IDs were moved from the old `Interaction` topic into `RD > Terrain > Cursor Light`.
- `RD > Terrain > Camera` now exposes reset, center-player, zoom-in, and zoom-out actions. These dispatch existing `core/camera/*` and `core/player/show` commands instead of owning camera state.
- Local pathfinding tuning DOM IDs were moved from the old `Interaction` topic into `RD > Pathing > Local`.
- Swarm DOM IDs were moved into `RD > Agents > Swarm`.
- Swarm Follow controls were split into `RD > Agents > Follow`, and overlay-specific swarm controls were split into `RD > Agents > Overlays`.
- Full Slime Lab controls were moved into `RD > Trail` and split into `Runtime`, `Motion`, `Visual`, `Terrain`, `Plants`, and `Brush` sub-tabs. Existing RD Slime trail overlay, game cadence, Hunting flee, Tracks knowledge, and availability readout controls were moved out of `Gameplay` and into `RD > Trail > Tracks`.
- The legacy Slime workspace and detached canvas runtime were removed. Slime visualization is canonical in the main-context world-space terrain overlay path.
- Slime Trail splitting preserves existing DOM IDs, so Slime UI binding and preset/save/runtime code continue to target the same elements.
- `RD > Overlays > Performance` now exposes a full-size toggle for the floating performance overlay. The HUD `O` shortcut remains wired to the same state.
- `RD > Overlays > Route` now owns route arrow/preview drawing controls and the NAV debug overlay selector. `Pathing > NAV` keeps route rules and committed-route actions.
- `RD > Overlays > Lighting` now owns cursor-light gizmo visibility.
- `RD > Overlays > Swarm` now owns the Swarm stats overlay visibility toggle and hawk-range gizmo visibility. The former `Agents > Stats` tab is a pointer to the new overlay location.
- No separate pathfinding debug-overlay control currently exists; normal PF preview and pathing tuning remain under gameplay/pathing ownership.
- `RD > IO` now owns map load/save-all, pointlights sidecar save/load, and Slime sidecar save. Feature-specific preset controls remain in their subsystem tabs because they are tuning workflow controls rather than map-level IO.
- Audio controls were moved from the Audio workspace into `RD > Audio > Spectrogram/Synthesis/Soundscape`. The Audio workspace keeps the large visual surfaces for spectrogram/waveform inspection as an interim tool viewport.
- `RD > Audio` exposes a `Show Audio View` workspace toggle. In gameplay, the Audio workspace renders as a bounded tool overlay above the terrain instead of replacing the map view.
- `RD > Trail` no longer exposes detached Slime workspace controls. Slime visual feedback uses the world-space terrain overlay controlled from `Trail > Visual` / `Trail > Tracks`, so trails render over the existing terrain instead of inside a placeholder map view.
- `RD > Trail > Runtime` now exposes an opt-in `Terrain Underlay` toggle above `Agents`. It renders a clean diagnostic backdrop in the main terrain shader by sampling the authored height/slope/water textures and the live Slime plant-stock texture. Slime trail color rendering stays a separate overlay that can be enabled on top.
- Workspace switching no longer closes the RD topic panel; it still clears active interaction modes when leaving the map workspace.
- RD Audio tabs also keep the existing `audio-mode-btn` contract so `src/ui/audioPanelRuntime.js` and the audio binding/runtime modules remain the owners of audio-mode state. `syncAudioModeUi()` now updates RD tab ARIA state to keep workspace mode buttons and RD nested tabs synchronized.
- RD Audio panels no longer repeat the active tab name as an inner title. Synthesis oscillator cards and Soundscape layer cards are square-corner and collapse/expand when clicking their title.
- `RD > Audio` now uses a single `Show Audio View` workspace toggle instead of separate `Open Audio View` and `Map View` buttons.
- User confirmed the initial RD-dev shell remains working after the nested top-level tabs and fixed-height panel changes.
- Removed the top-level RD panel intro copy to reduce vertical space use; nested tabs now carry the panel context.
- Gameplay RD/HUD layout now removes the viewport-edge margins: the RD rail anchors to the top-left edge and the player HUD anchors to the bottom edge. RD first-order and second-order tab strips are fixed in the non-scrolling header area with horizontal separators; only active tab content scrolls.
- During manual RD review, swarm slider labels and Slime runtime agent-count labels needed immediate `input`-time UI updates instead of waiting for the next full runtime sync. The bindings now update visible labels immediately while keeping runtime mutation through existing commands.
- Follow-up manual review found those immediate label updates were still no-ops because the binding assembly did not pass the relevant value elements into the binding layer. `src/app/mainBindingsLifecycleAssemblyRuntime.js` and `src/app/mainBindingsAssemblyRuntime.js` now thread the Swarm value spans and Slime agent-count value span through to their bindings.
- `RD > Terrain > Lighting` now shows live value labels for Ambient and Diffuse, using the same render-FX UI sync path as Shadow Blur so startup, sidecar loading, and slider changes stay in sync.
- Follow-up startup validation found the Ambient/Diffuse label helper was not threaded into the settings compatibility assembly used by lighting sidecar load. `src/main.js` now passes `updateLightingBalanceLabels` into that path so bootstrap lighting apply can complete.

## Validation Log

- User browser validation confirmed nested RD-dev shell and existing RD tabs are working so far.
- `node --check src\main.js`: pass after removing RD intro copy and moving map IO controls.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after RD tab shell changes.
- `npm run lint:md`: pass after migration tracker updates.
- `node --check src\main.js`: pass after wiring `RD > Terrain > Point Lights` to point-light gizmo interaction.
- `node --check src\main.js`: pass after replacing Point Lights tab activation with an explicit `Show Gizmos` toggle.
- `node --check src\ui\interactionModeUiRuntime.js`: pass after syncing the Point Lights `Show Gizmos` toggle from interaction-mode state.
- `node --test tests\*.test.js`: pass after replacing Point Lights tab activation with an explicit toggle.
- `npm run lint:md`: pass after documenting the explicit Point Lights gizmo toggle.
- `node --check src\main.js`: pass after threading Swarm/Slime count value labels through the binding assemblies.
- `node --check src\app\mainBindingsAssemblyRuntime.js`: pass after threading Swarm/Slime count value labels through the binding assemblies.
- `node --check src\app\mainBindingsLifecycleAssemblyRuntime.js`: pass after threading Swarm/Slime count value labels through the binding assemblies.
- `node --check src\ui\bindings\swarmPanelBinding.js`: pass after confirming the now-threaded Swarm value labels.
- `node --check src\main.js`: pass after trimming Lighting, moving point-light flicker controls, and removing volumetric references.
- `node --check src\render\shaders.js`: pass after removing volumetric shader code.
- `node --check src\render\uniformInputState.js`: pass after removing volumetric uniform input state.
- `node --check src\render\uniformUploader.js`: pass after removing volumetric uniform uploads.
- `node --check src\ui\bindings\renderFxBinding.js`: pass after removing volumetric UI bindings.
- `node --check src\ui\renderFxUiRuntime.js`: pass after removing volumetric UI sync helpers.
- `node --check src\app\interactionUiAssemblyRuntime.js`: pass after removing volumetric UI dependencies.
- `node --check src\app\mainBindingsAssemblyRuntime.js`: pass after removing volumetric binding dependencies.
- `node --test tests\*.test.js`: pass after Lighting/Point Lights cleanup and volumetric removal.
- `npm run lint:md`: pass after documenting Lighting/Point Lights cleanup.
- `git diff --check`: pass after normalizing shader line endings from cleanup edits.
- `node --check src\main.js`: pass after adding Ambient/Diffuse value labels.
- `node --check src\ui\renderFxUiRuntime.js`: pass after adding Ambient/Diffuse value labels.
- `node --check src\ui\renderFxUiBindingRuntime.js`: pass after adding Ambient/Diffuse value labels.
- `node --check src\ui\lightingSettingsApplier.js`: pass after adding Ambient/Diffuse value labels.
- `node --check src\ui\renderFxSettingsSyncRuntime.js`: pass after adding Ambient/Diffuse value labels.
- `node --check src\ui\startupUiSync.js`: pass after adding Ambient/Diffuse value labels.
- `node --check src\ui\settingsCompatRuntimeBinding.js`: pass after adding Ambient/Diffuse value labels.
- `node --check src\app\interactionUiAssemblyRuntime.js`: pass after adding Ambient/Diffuse value labels.
- `node --check src\app\interactionUiSetupRuntime.js`: pass after adding Ambient/Diffuse value labels.
- `node --check src\app\appShellLifecycleAssemblyRuntime.js`: pass after adding Ambient/Diffuse value labels.
- `node --test tests\*.test.js`: pass after adding Ambient/Diffuse value labels.
- `npm run lint:md`: pass after documenting Ambient/Diffuse value labels.
- `git diff --check`: pass after adding Ambient/Diffuse value labels.
- `node --check src\main.js`: pass after fixing Ambient/Diffuse label wiring for lighting sidecar apply.
- `node --check src\ui\settingsCompatRuntimeBinding.js`: pass after fixing Ambient/Diffuse label wiring for lighting sidecar apply.
- `node --check src\ui\lightingSettingsApplier.js`: pass after fixing Ambient/Diffuse label wiring for lighting sidecar apply.
- `node --test tests\*.test.js`: pass after fixing Ambient/Diffuse label wiring for lighting sidecar apply.
- `git diff --check`: pass after fixing Ambient/Diffuse label wiring for lighting sidecar apply.
- `node --check src\main.js`: pass after removing cloud sun projection/offset.
- `node --check src\render\uniformInputState.js`: pass after removing cloud sun projection/offset.
- `node --check src\render\uniformUploader.js`: pass after removing cloud sun projection/offset.
- `node --check src\render\swarmLitRenderer.js`: pass after removing cloud sun projection/offset.
- `node --check src\render\shaders.js`: pass after removing cloud sun projection/offset.
- `node --check src\sim\cloudSystem.js`: pass after removing cloud sun projection/offset.
- `node --check src\core\mainSettingsContracts.js`: pass after removing cloud sun projection/offset.
- `node --check src\core\appliedSettingsStoreSync.js`: pass after removing cloud sun projection/offset.
- `node --check src\core\registerMainCommands.js`: pass after removing cloud sun projection/offset.
- `node --check src\gameplay\renderFxDataSerializer.js`: pass after removing cloud sun projection/offset.
- `node --check src\ui\bindings\renderFxBinding.js`: pass after removing cloud sun projection/offset.
- `node --check src\ui\renderFxSettingsApplier.js`: pass after removing cloud sun projection/offset.
- `node --check src\ui\renderFxUiRuntime.js`: pass after removing cloud sun projection/offset.
- `node --check src\ui\renderFxUiBindingRuntime.js`: pass after removing cloud sun projection/offset.
- `node --check src\ui\settingsCompatRuntimeBinding.js`: pass after removing cloud sun projection/offset.
- `node --check src\app\interactionUiAssemblyRuntime.js`: pass after removing cloud sun projection/offset.
- `node --check src\app\mainBindingsAssemblyRuntime.js`: pass after removing cloud sun projection/offset.
- `node --check src\app\mainBindingsLifecycleAssemblyRuntime.js`: pass after removing cloud sun projection/offset.
- Per-file `ConvertFrom-Json`: pass for `assets\map1\clouds.json`, `assets\map2\clouds.json`, and `assets\map3\clouds.json` after removing saved cloud projection keys.
- `node --test tests\*.test.js`: pass after removing cloud sun projection/offset.
- `npm run lint:md`: pass after documenting cloud sun projection/offset removal.
- `git diff --check`: pass after removing cloud sun projection/offset.
- `npm run lint:md`: pass after anchoring RD/player HUD to viewport edges and making RD tab strips non-scrolling.
- `git diff --check`: pass after anchoring RD/player HUD to viewport edges and making RD tab strips non-scrolling.
- `git diff --check`: pass after making RD Audio second-order tabs fit their text instead of inheriting square audio dock sizing.
- `node --check src\ui\audioPanelRuntime.js`: pass after adding collapsible RD Audio oscillator/layer cards.
- `npm run lint:md`: pass after documenting collapsible RD Audio cards.
- `git diff --check`: pass after adding collapsible RD Audio cards and removing redundant RD Audio panel titles.
- `node --check src\ui\workspaceBindingRuntime.js`: pass after adding opt-in workspace toggle behavior for `Show Audio View`.
- `npm run lint:md`: pass after documenting the RD Audio workspace toggle.
- `git diff --check`: pass after replacing the RD Audio open/map buttons with one toggle.
- `node --check src\ui\bindings\swarmPanelBinding.js`: pass after immediate swarm label updates.
- `node --check src\ui\slimeBindingRuntime.js`: pass after immediate Slime agent-count label updates.
- `node --test tests\modeCapabilities.test.js`: pass after allowing gameplay point-light interaction/overlay access.
- `git diff --check`: pass after current markup/docs edits.
- `node --check src\main.js`: pass after scoped RD tab groups and `Terrain > Lighting` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after scoped RD tab groups.
- Targeted duplicate-ID check: `cycleSpeed`, `heightScale`, `rdTerrainLightingPanel`, and `resourceDebugKnowledgePanel` each occur once.
- `npm run lint:md`: pass after documenting `Terrain > Lighting` migration.
- Targeted duplicate-ID check: `fogToggle`, `fogColor`, `fogMinAlpha`, `fogMaxAlpha`, `fogFalloff`, `fogStartOffset`, and `rdTerrainFogPanel` each occur once.
- `node --check src\main.js`: pass after `Terrain > Fog` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `Terrain > Fog` migration.
- `git diff --check`: pass after `Terrain > Fog` migration.
- `npm run lint:md`: pass after documenting `Terrain > Fog` migration.
- Targeted duplicate-ID check: `cloudToggle`, `cloudCoverage`, `cloudSoftness`, `cloudOpacity`, `cloudScale`, `cloudSpeed1`, `cloudSpeed2`, `cloudTimeRouting`, and `rdTerrainCloudsPanel` each occur once.
- `node --check src\main.js`: pass after `Terrain > Clouds` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `Terrain > Clouds` migration.
- `git diff --check`: pass after `Terrain > Clouds` migration.
- `npm run lint:md`: pass after documenting `Terrain > Clouds` migration.
- Targeted duplicate-ID check: representative detail controls including `detailEnabled`, `detailBlendMode`, `detailDebugChannel`, material priority controls, `detailMaterial3MicroColor`, and `rdTerrainDetailPanel` each occur once.
- `node --check src\main.js`: pass after `Terrain > Detail` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `Terrain > Detail` migration.
- `git diff --check`: pass after `Terrain > Detail` migration.
- `npm run lint:md`: pass after documenting `Terrain > Detail` migration.
- Targeted duplicate-ID check: representative Water FX controls including `waterPresetSelect`, preset buttons, flow controls, `waterTimeRouting`, `waterTintStrength`, and `rdTerrainWaterPanel` each occur once. `waterTrailPresetSelect` also remains once in the separate Water Trails panel.
- `node --check src\main.js`: pass after `Terrain > Water` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `Terrain > Water` migration.
- `git diff --check`: pass after `Terrain > Water` migration.
- `npm run lint:md`: pass after documenting `Terrain > Water` migration.
- Targeted duplicate-ID check: representative Water Trails controls including `waterTrailPresetSelect`, preset buttons, trail toggles, particle controls, glitter controls, `waterTrailStats`, and `rdTerrainWaterTrailsPanel` each occur once.
- `node --check src\main.js`: pass after `Terrain > Water Trails` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `Terrain > Water Trails` migration.
- `git diff --check`: pass after `Terrain > Water Trails` migration.
- `npm run lint:md`: pass after documenting `Terrain > Water Trails` migration.
- Targeted duplicate-ID check: point-light editor controls including `lightEditorEmpty`, `pointLightColor`, range/intensity/flicker controls, save/cancel/delete, point-light import/export controls, and `rdTerrainPointLightsPanel` each occur once.
- `node --check src\main.js`: pass after `Terrain > Point Lights` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `Terrain > Point Lights` migration.
- `git diff --check`: pass after `Terrain > Point Lights` migration.
- `npm run lint:md`: pass after documenting `Terrain > Point Lights` migration.
- Targeted duplicate-ID check: `cameraResetViewBtn`, `cameraCenterPlayerBtn`, `cameraZoomOutBtn`, `cameraZoomInBtn`, and `rdTerrainCameraPanel` each occur once.
- `node --check src\main.js`: pass after `Terrain > Camera` controls.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `Terrain > Camera` controls.
- `git diff --check`: pass after `Terrain > Camera` controls.
- `npm run lint:md`: pass after documenting `Terrain > Camera` controls.
- Targeted duplicate-ID check: representative Swarm controls including enable/follow/stats, rendering, movement, cursor, hawk controls, and `rdAgentsSwarmPanel` each occur once.
- `node --check src\main.js`: pass after `Agents > Swarm` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `Agents > Swarm` migration.
- `git diff --check`: pass after `Agents > Swarm` migration.
- `npm run lint:md`: pass after documenting `Agents > Swarm` migration.
- Targeted duplicate-ID check: Swarm Follow controls, `swarmStatsPanelToggle`, and `rdAgentsSwarmPanel` / `rdAgentsFollowPanel` / `rdAgentsStatsPanel` each occur once after splitting Follow and Stats sub-tabs.
- `node --check src\main.js`: pass after `Agents > Follow` / `Agents > Stats` split.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `Agents > Follow` / `Agents > Stats` split.
- `git diff --check`: pass after `Agents > Follow` / `Agents > Stats` split.
- `npm run lint:md`: pass after documenting `Agents > Follow` / `Agents > Stats` split.
- Targeted duplicate-ID check: Slime Lab controls, Slime Tracks controls, restored HUD/system controls, and moved Trail panels each occur once; old `resourceDebugSlimeTab` and `resourceDebugSlimePanel` occur zero times.
- Full required-ID check: every `getRequiredElementById(...)` lookup in `src/main.js` has a matching DOM ID after the Slime Trail move.
- `node --check src\main.js`: pass after first Slime `RD > Trail` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after first Slime `RD > Trail` migration.
- `git diff --check`: pass after first Slime `RD > Trail` migration.
- `npm run lint:md`: pass after documenting first Slime `RD > Trail` migration.
- Targeted duplicate-ID check: split Slime Trail panels and all required Slime controls occur once after splitting `Trail > Lab` into Runtime/Motion/Visual/Terrain/Plants/Brush/Tracks.
- Full required-ID check: every `getRequiredElementById(...)` lookup in `src/main.js` still has a matching DOM ID after the Slime Trail split.
- `node --check src\main.js`: pass after Slime Trail split.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after Slime Trail split.
- `git diff --check`: pass after Slime Trail split.
- `npm run lint:md`: pass after documenting Slime Trail split.
- Targeted duplicate-ID check: local pathfinding and cursor-light controls plus `rdGameplayPathingPanel` and `rdTerrainCursorLightPanel` each occur once after moving the old `Interaction` topic controls.
- Full required-ID check: every `getRequiredElementById(...)` lookup in `src/main.js` still has a matching DOM ID after moving `Interaction` topic controls.
- `node --check src\main.js`: pass after moving old `Interaction` topic controls.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after moving old `Interaction` topic controls.
- `git diff --check`: pass after moving old `Interaction` topic controls.
- `npm run lint:md`: pass after documenting old `Interaction` topic control migration.
- Targeted duplicate-ID check: `rdOverlaysPerformancePanel`, `rdPerformanceOverlayToggleBtn`, and existing performance overlay DOM IDs each occur once.
- Full required-ID check: every `getRequiredElementById(...)` lookup in `src/main.js` still has a matching DOM ID after adding `Overlays > Performance`.
- `node --check src\main.js`: pass after adding `Overlays > Performance`.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after adding `Overlays > Performance`.
- `git diff --check`: pass after adding `Overlays > Performance`.
- `npm run lint:md`: pass after documenting `Overlays > Performance`.
- Targeted duplicate-ID check: `rdDevAudioPanel`, RD Audio tab/panel IDs, moved audio controls, and `audioStatusValue` each occur once after moving audio controls into RD.
- Full required-ID check: every `getRequiredElementById(...)` lookup in `src/main.js` still has a matching DOM ID after moving Audio controls.
- `node --check src\main.js`: pass after `RD > Audio` migration.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after `RD > Audio` migration.
- `node --check src\ui\audioPanelRuntime.js`: pass after syncing RD Audio tab ARIA from audio mode state.
- `git diff --check`: pass after documenting `RD > Audio` migration.
- `npm run lint:md`: pass after documenting `RD > Audio` migration.
- Targeted duplicate-ID check: route overlay controls, `routeDebugOverlayMode`, `swarmStatsPanelToggle`, `rdOverlaysRoutePanel`, and `rdOverlaysSwarmPanel` each occur once.
- Full required-ID check: every `getRequiredElementById(...)` lookup in `src/main.js` still has a matching DOM ID after moving route/swarm overlay controls.
- `node --check src\main.js`: pass after moving route/swarm overlay controls.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after adding Route and Swarm overlay sub-tabs.
- `git diff --check`: pass after documenting Route/Swarm overlay migration.
- `npm run lint:md`: pass after documenting Route/Swarm overlay migration.
- `node --test tests\interactionCommands.test.js`: pass after removing legacy dev/no-mode teleport behavior.
- `node --check src\gameplay\interactionCommands.js`: pass after removing legacy dev/no-mode teleport behavior.
- `node --check tests\interactionCommands.test.js`: pass after updating no-mode click tests.
- Targeted duplicate-ID check: pointlights IO controls and `slimeSaveBtn` each occur once after moving sidecar IO controls into `RD > IO`.
- Full required-ID check: every `getRequiredElementById(...)` lookup in `src/main.js` still has a matching DOM ID after moving sidecar IO controls.
- `node --check src\main.js`: pass after sidecar IO control move.
- `node --check src\ui\bindings\pointLightEditorBinding.js`: pass after moving pointlights sidecar IO controls.
- `node --test tests\*.test.js`: pass after no-mode teleport removal, title dev button hiding, and sidecar IO control moves.
- `git diff --check`: pass after no-mode teleport removal, title dev button hiding, and sidecar IO control moves.
- `npm run lint:md`: pass after documenting no-mode teleport removal and sidecar IO control moves.
- Targeted duplicate-ID check: `rdOverlaysLightingPanel`, `cursorLightGizmoToggle`, and `swarmFollowHawkRangeGizmoToggle` each occur once after moving gizmo visibility into `RD > Overlays`.
- Full required-ID check: every `getRequiredElementById(...)` lookup in `src/main.js` still has a matching DOM ID after moving gizmo visibility into `RD > Overlays`.
- `node --check src\main.js`: pass after moving gizmo visibility into `RD > Overlays`.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after adding `Overlays > Lighting`.
- Targeted duplicate-ID check: no duplicate DOM IDs after adding RD Audio/Slime workspace launch controls.
- `node --check src\ui\workspaceRuntime.js`: pass after preserving RD while switching workspaces.
- `node --check src\main.js`: pass after adding RD workspace launch controls and gameplay tool-overlay CSS.
- Targeted Slime workspace entry check: no `data-workspace="slime"`, `Open Slime`, `Slime View`, or `slimeCanvas` DOM remains.
- `node --check src\ui\workspaceRegistry.js`: pass after unregistering `slime` as a user-facing workspace.
- `node --check src\ui\workspaceRuntime.js`: pass after guarding unknown workspace panels/buttons from accidental activation.
- `node --check tests\workspaceRuntime.test.js`: pass after adding regression coverage for unregistered legacy workspace panels.
- `node --test tests\workspaceRuntime.test.js`: pass after adding regression coverage for unregistered legacy workspace panels.
- `node --check src\core\registerMainCommands.js`: pass after Slime workspace normalization changes.
- `node --check src\main.js`: pass after removing Slime workspace UI entry points.
- `node --test tests\*.test.js`: pass after removing the user-facing Slime workspace path and adding workspace runtime regression coverage.
- `npm run lint:md`: pass after documenting Slime workspace removal.
- `git diff --check`: pass after Slime workspace removal.
- `node --check src\render\shaders.js`: pass after adding the Slime terrain-underlay composite to the main shader.
- `node --check src\render\uniformUploader.js`: pass after binding slope and live plant-stock textures for the Slime underlay.
- `node --check src\main.js`: pass after threading Slime terrain-underlay snapshots into the render pipeline.
- `node --check src\slime\slimeGpuRuntime.js`: pass after exposing the live plant-stock texture for main-renderer underlay sampling.
- `node --test tests\*.test.js`: pass after adding main-renderer Slime terrain underlay.
- `npm run lint:md`: pass after documenting main-renderer Slime terrain underlay.
- `git diff --check`: pass after main-renderer Slime terrain underlay.
- `node --check src\main.js`: pass after moving `Terrain Underlay` to `Trail > Runtime` and making it opt-in by default.
- `node --test tests\*.test.js`: pass after making Slime terrain underlay opt-in.
- `npm run lint:md`: pass after documenting the opt-in Terrain Underlay control location.
- `git diff --check`: pass after making Slime terrain underlay opt-in.
- `node --check src\render\shaders.js`: pass after applying the render-boundary Y flip to the Slime terrain-underlay plant-stock sample.
- `node --check src\render\shaders.js`: pass after removing all Slime trail palette mixing from the terrain underlay.
- `node --check src\render\shaders.js`: pass after contrast-mapping slope into a dedicated red diagnostic ramp.
- `node --check src\render\shaders.js`: pass after changing Terrain Underlay to direct channel mapping: slope red, live plants green, water blue, no height.
- `RD` now has a right-edge debug-overlay shortcut rail. Rail buttons route through the same underlying controls/selects as the RD panels, so toggles remain synchronized instead of creating duplicate overlay state.
- `RD > Overlays > Textures` now owns a raw terrain texture debug selector for Height, Slope, Wetness, and Water. The rail `H/S/We/W` buttons mirror that selector.
- The loaded-map slope texture upload path was missing `getSlopeTex` in the map-support assembly. This is fixed so `slope.png` reaches the main renderer texture used by raw slope debug and Slime terrain underlay.
- Wetness now has a main-renderer texture alongside the existing CPU `wetnessImageData`, allowing raw wetness debug through the normal WebGL terrain render path.
- `node --check src\main.js`: pass after adding the RD overlay shortcut rail and raw terrain texture debug mode.
- `node --check src\render\shaders.js`: pass after adding raw terrain texture debug shader output.
- `node --check src\render\uniformUploader.js`: pass after binding slope/wetness debug textures.
- `node --check src\ui\rdOverlayShortcutRailRuntime.js`: pass after adding rail shortcut routing.
- `node --check src\render\renderBootstrapState.js`: pass after adding wetness texture allocation.
- `node --check src\render\defaultMapImageRuntime.js`: pass after default wetness upload.
- `node --check src\gameplay\mapImageRuntime.js`: pass after map wetness upload and slope path verification.
- `node --check src\app\runtimeSupportAssemblyRuntime.js`: pass after forwarding slope/wetness texture getters.
- `node --check src\app\bootstrapFeatureAssemblyRuntime.js`: pass after forwarding `wetnessTex` and wetness image defaults.
- `node --check src\app\runtimeFeatureAssemblyRuntime.js`: pass after forwarding `wetnessTex` to the renderer pipeline assembly.
- `node --check src\render\renderPipelineRuntime.js`: pass after forwarding `wetnessTex` to the terrain uniform uploader.
- `node --check src\render\frameRuntime.js`: pass after forwarding terrain texture debug mode into uniform input state.
- `node --test tests\*.test.js`: pass after RD overlay shortcut rail and raw terrain texture debug mode.
- `npm run lint:md`: pass after documenting the RD overlay shortcut rail.
- `git diff --check`: pass after RD overlay shortcut rail changes.
- Browser validation caught the fragment shader exceeding `MAX_TEXTURE_IMAGE_UNITS(16)` after adding wetness as a separate sampler. Raw wetness debug now reuses the existing `uFlowMap` sampler only when `Texture View = Wetness`, keeping the shader at the WebGL2 sampler limit.
- `node --check src\render\shaders.js`: pass after removing the extra wetness sampler.
- `node --check src\render\uniformUploader.js`: pass after routing wetness debug through the existing flow-map sampler unit.
- `node --check src\main.js`: pass after removing the unused `uWetness` uniform lookup.
- Follow-up browser validation found raw `H/S/We/W` texture debug buttons did not render because `getTerrainDebugViewMode` was not forwarded through the render-shell frame-loop assembly. The frame runtime now receives the selected texture debug mode.
- Route cost and NAV knowledge debug overlays are now decoupled from active NAV interaction. Selecting a route debug overlay rebuilds the route field even while route mode is inactive, and the overlay drawer renders debug overlays regardless of `snapshot.active`.
- `node --check src\app\renderShellAssemblyRuntime.js`: pass after forwarding terrain debug mode.
- `node --check src\gameplay\routePlanningRuntime.js`: pass after inactive route debug field rebuild.
- `node --check src\ui\overlays\routePlanningOverlay.js`: pass after decoupling debug draw from active NAV mode.
- `node --check src\render\frameRuntime.js`: pass after terrain debug mode forwarding fix.
- `node --test tests\routePlanningRuntime.test.js`: pass after adding inactive route-debug overlay coverage.
- RD overlay rail shortcuts are now mutually exclusive for base diagnostic views. Selecting one clears raw texture, water debug, detail debug, Slime terrain underlay, Knowledge Map, and route debug state before enabling the requested view.
- The Slime trail overlay shortcut (`TR`) remains additive and can stay enabled on top of any exclusive base diagnostic view.
- The rail now has group separators after raw terrain textures, water debug views, detail channels, and Slime trail overlay.
- `node --check src\ui\rdOverlayShortcutRailRuntime.js`: pass after exclusive rail routing and separators.
- `node --check src\main.js`: pass after exclusive rail routing.
- `git diff --check`: pass after exclusive rail routing.
- `RD > Info` was removed from visible RD navigation because its readouts are redundant with other HUD/debug surfaces. The required status/readout DOM sinks remain hidden for existing runtime bindings.
- `RD > Overlays > Performance` was removed from visible RD navigation because the HUD `O` button is the canonical performance overlay toggle. The legacy button element remains hidden as a binding target.
- `RD > Overlays > Textures` was removed from visible RD navigation because raw texture debug is controlled from the right-edge overlay rail. The texture debug select remains hidden as the shared state target for the rail.
- `node --check src\main.js`: pass after trimming redundant RD tabs.
- `git diff --check`: pass after trimming redundant RD tabs.
- Cursor-light gizmo visibility was moved from `RD > Overlays > Lighting` into `RD > Terrain > Cursor Light`, directly below the `Cursor Light` toggle. The visible `Overlays > Lighting` tab was removed; Overlays now starts at Route.
- `node --check src\main.js`: pass after moving cursor-light gizmo control.
- `git diff --check`: pass after moving cursor-light gizmo control.
- Swarm overlay controls moved from `RD > Overlays > Swarm` to `RD > Agents > Overlays`, keeping the existing `swarmFollowHawkRangeGizmoToggle` and `swarmStatsPanelToggle` IDs. Global Overlays now focuses on Route.
- `node --check src\main.js`: pass after moving Swarm overlay controls.
- `git diff --check`: pass after moving Swarm overlay controls.
- Top-level `RD > Overlays` was renamed to `RD > Pathing`.
- `Gameplay > Pathing` moved to `RD > Pathing > Local`, `Gameplay > NAV` moved to `RD > Pathing > NAV`, and route overlay/debug controls moved to `RD > Pathing > Route`. Existing DOM IDs were preserved for bindings.
- `node --check src\main.js`: pass after moving Pathing/NAV/Route into `RD > Pathing`.
- `node --check src\ui\resourceDebugPanelRuntime.js`: pass after moving Pathing/NAV/Route into `RD > Pathing`.
- `npm run lint:md`: pass after documenting `RD > Pathing`.
- `git diff --check`: pass after normalizing `index.html` line endings from the panel move.
