# AI_CONTEXT.md

## Purpose

Fast handoff context for agents working in this repo. Read this before changing code.

## Product Intent

Self-contained prototype for top-down terrain rendering and survival-gameplay experiments from Gaea-exported maps. Runtime is browser-native HTML/JavaScript/WebGL2 with a Tauri desktop wrapper. No game engine.

## Current Architecture Baseline

- Entry point: `index.html`.
- Main integration surface: `src/main.js`.
- Runtime code is modular and core-state-driven. New work should preserve owner modules and avoid rebuilding `main.js`-centric state paths.
- Rendering is WebGL2 terrain plus 2D overlay canvas for gameplay markers.
- Render-time map texture layers must use the established main WebGL renderer texture-compositing path by default: allocate/upload the texture in the render pipeline, bind it through `src/render/uniformUploader.js`, and composite it in `src/render/shaders.js`. Do not introduce a separate canvas/readback visualization architecture for full-map texture layers unless it is explicitly a marker/vector UI layer or a justified fallback. CPU/readback grids are acceptable for gameplay sampling and diagnostics, but the visual layer belongs in the existing render-time texture pipeline.
- Current active refactor: `docs/SLIME_MAIN_RENDER_SUBSYSTEM_REFACTOR.md`. Read and update that file when changing Slime rendering, Slime gameplay readbacks, Tracks overlays, or Slime performance architecture. The refactor goal is to move Slime into the main WebGL renderer context and remove full-resolution trail readback from normal gameplay rendering.
- Current UI/mode migration plan: `docs/UNIFIED_GAME_MODE_RD_DEV_MIGRATION.md`. Read and update that file when migrating dev-mode/workspace/topic controls into the in-game RD-dev panel or changing the user-facing runtime mode model.
- RD UI extraction architecture: `docs/RD_UI_ARCHITECTURE.md`. Read it before splitting RD markup, changing RD ownership boundaries, or introducing generated/control-registry UI patterns. All top-level RD panels and the RD overlay shortcut rail are extracted static partials: `index.html` owns the RD shell/tab strip plus `rdOverlayRailHost` and `rdDev*PanelHost` placeholders, `src/ui/rd/resourceDebugMarkupRuntime.js` injects markup before top-level DOM lookups, and `src/ui/rd/panels/*PanelHtml.js` plus `src/ui/rd/overlayRailHtml.js` preserve the existing DOM IDs. `RD > Terrain`, `Trail`, `Agents`, `Pathing`, and `Audio` are internally split into nested subpanel partials under matching `src/ui/rd/panels/<domain>/` directories.
- Runtime change notifications use a small event layer:
  - `src/core/eventBus.js` defines `createEventBus` and `RuntimeEvents`.
  - `src/core/runtimeEventHandlers.js` centralizes refresh/invalidation fan-out.
  - Events are for post-change UI/overlay/cache refresh only. Commands and runtime-owner APIs still own mutation, validation, and success/failure.
- Player-facing wiki/tutorial/event/dialog foundations are tracked in `docs/EVENT_DIALOG_IMPLEMENTATION_NOTES.md` and designed in `docs/WIKI_EVENT_DIALOG_DESIGN.md`. The first slice keeps prose in `docs/wiki/`, structural events in `assets/data/events/`, and owner modules in `src/content/contentRegistry.js`, `src/content/eventDefinitionLoader.js`, `src/gameplay/wikiRuntime.js`, `src/gameplay/journalRuntime.js`, `src/gameplay/eventRuntime.js`, `src/gameplay/eventDialogPersistenceRuntime.js`, `src/gameplay/conditionEventTriggerRuntime.js`, `src/ui/wikiPanelRuntime.js`, `src/ui/journalPanelRuntime.js`, and `src/ui/eventDebugPanelRuntime.js`. This scenario/dialog event runtime is separate from the technical `EventBus`. Authored wiki Markdown must use Obsidian/Zensical-compatible CommonMark file links like `[Travel](gameplay/travel.md)`; `contentRegistry` resolves those file links to target frontmatter IDs and rewrites runtime article bodies to ID links for the in-game panel. Startup loads global event definition files through `GLOBAL_EVENT_DEFINITION_PATHS` and rejects duplicate event IDs across those files before registering definitions. Map load optionally loads `events.json` from the current map folder, validates global plus map-local content references, rejects duplicate IDs across global/map-local definitions, and replaces the event runtime definition set before gameplay startup triggers run. Startup/map-load validation checks wiki `related` IDs, wiki file links, and event `contentId` references before event definitions are used. Baseline wiki articles now cover travel, inspect, time, gathering, water, rest, hunting, fatigue, hydration, nutrition, terrain, tracks, the knowledge map, and the event debug dialog; key HUD/inspect controls point to specific article IDs where available. `wikiRuntime` exposes a synthetic missing-article snapshot for unresolved article opens so the panel can show visible feedback. `wikiPanelRuntime` owns wiki/event panel keyboard, focus, help-click, generated-control labels, and reset-button behavior: Escape closes, Backspace navigates history outside editable targets, Tab is trapped while an active blocking event is open, focus moves into blocking event panels, the previously focused element is restored when the panel closes, generated article links/dialog choices get explicit `aria-label` text, active help-mode clicks are consumed so normal controls/map clicks do not fire, and `Reset Tutorials` clears event seen/repeat/flag state plus journal entries and removes the local storage payload. Wiki and Journal are separate player-facing surfaces: HUD `W` opens the wiki index, HUD `J` opens the full journal panel, and the compact HUD Journal Feed above the condition/stat bars shows the newest journal entry collapsed or a short scrollable list expanded. Journal links render as inline text-style links and route through `wikiRuntime.openArticle`. `RD > Events > Debug` owns debug-only event trigger buttons and readouts for last trigger result, active event, queue, definitions, seen/repeat/flag state, and journal entries; it currently provides repeatable sample dialog/notice triggers, gameplay-start trigger, and survival warning trigger buttons backed by authored event definitions. First-use tutorial triggers currently fire from interaction commands for `pathfinding_started`, `travel_committed`, `inspect_started`, `gathering_started`, `water_started`, `rest_started`, and `hunting_started`; these are post-success event notifications, not gameplay mutations. Survival warning events live in `assets/data/events/survival.json`; `conditionEventTriggerRuntime` observes post-change condition snapshots and triggers one-shot notice/journal events when hydration crosses down through 50 or fatigue crosses up through 50. Seen event IDs, repeat counters, event-local flags, and journal entries currently persist through versioned browser `localStorage` key `terrain:event-dialog-state:v1`, restored before startup triggers run; last trigger result is debug snapshot state only. The persistence runtime accepts v1/no-version legacy payloads and rejects unsupported versions. Dialog choice commands dispatch through the injected command dispatcher only; event runtime does not directly mutate gameplay owners and only advances after command success. Failed choices set sanitized active-event error state for the wiki/event panel. Non-command dialog outcomes are limited to event-owned state and journal writes, such as `event/setFlag`, `event/clearFlag`, and `journal/add`.
- Command routing lives mainly in `src/core/registerMainCommands.js` and `src/gameplay/interactionCommands.js`.
- Store-backed state and snapshots are preferred for UI/integration reads.

## Important Runtime Owners

- Map lifecycle/load/save:
  - `src/gameplay/mapLifecycleRuntime.js`
  - `src/gameplay/mapLoader.js`
  - `src/gameplay/mapSidecarLoader.js`
  - `src/gameplay/mapDataSaveRuntime.js`
  - `src/gameplay/mapDataSaveController.js`
- Pathfinding/travel:
  - `src/core/gridDijkstra.js`: shared 8-neighbor grid Dijkstra builder used by both local pathfinding and long-distance route planning.
  - `src/core/gridPathExtraction.js`: shared deterministic parent-chain path extraction from Dijkstra fields.
  - `src/gameplay/pathfindingCostModel.js`: movement cost model.
  - `src/gameplay/pathfindingPreviewRuntime.js`: Dijkstra preview and hover path extraction.
  - `src/gameplay/pathfindingRuntimeBinding.js`: pathfinding composition.
  - `src/gameplay/travelPlanningRuntime.js`: hover path, PF range marker, committed original path, remaining-path visualization state.
  - `src/gameplay/routePlanningRuntime.js`: long-distance strategic route mode, low-resolution Dijkstra field, hover route previews, waypoint segment state, and planning-anchor advancement.
  - `src/gameplay/routePlanningCostModel.js`: strategic low-resolution averaged terrain grids and pathfinding-style route step costs.
  - `src/gameplay/movementSystem.js`: generic movement queue executor. It should not know why movement was requested.
- Player activity:
  - `src/gameplay/playerActivityRuntime.js`: facade/API, controller composition, shared stop/cancel cleanup, movement lifecycle routing.
  - `src/gameplay/playerActivityStateRuntime.js`: shared activity-state shape and snapshot cloning.
  - `src/gameplay/playerResourceSearchActivityRuntime.js`: gathering/water search movement and reward lifecycle.
  - `src/gameplay/playerScoutActivityRuntime.js`: scouting/animal possession lifecycle.
  - `src/gameplay/playerRestActivityRuntime.js`: rest lifecycle and fatigue recovery ticks.
  - `src/gameplay/playerTravelActivityRuntime.js`: explicit travel activity lifecycle.
  - `src/gameplay/playerInspectActivityRuntime.js`: legacy close-inspect activity compatibility path.
  - `src/gameplay/playerHuntingActivityRuntime.js`: Slime-trail-backed hunting activity. It patrols directly between random points inside the activity circle, samples trail availability over the whole range, and removes/respawns killed local Slime agents on success while leaving existing trail to decay naturally.
  - `src/gameplay/playerActivityUpkeepRuntime.js`: movement-tick normalization and generic upkeep dispatch.
  - `src/gameplay/gatheringActivityRuntime.js`: compatibility re-export only.
- Inspect/resource perception:
  - `src/gameplay/inspectPerceptionRuntime.js`: inspect focus, selected overlay layer, cursor/player sampling, compact snapshots.
  - `src/gameplay/resourceDiscoveryRuntime.js`: low-resolution discovered-knowledge masks.
  - `src/gameplay/resourceStockRuntime.js`: live/known stock grids, depletion, replenish, serialization.
  - `src/gameplay/resourceSearchRuntime.js`: resource map sampling, search chance, movement bias, rewards.
  - `src/gameplay/resourceDebugSettings.js`: RD overlay/stock/debug settings.
- Inventory/condition:
  - `src/gameplay/inventoryRuntime.js`: player inventory, bundles, item use routing.
  - `src/gameplay/containerModel.js`: pure stack/capacity operations.
  - `src/gameplay/conditionRuntime.js`: condition mutation and clamping.
  - `src/gameplay/conditionEffectRuntime.js`: active condition effects and modifiers.
  - `src/gameplay/activityEffectRuntime.js`: data-driven activity/movement/rest costs.
- Swarm:
  - `src/gameplay/swarmGameplayRuntime.js`: gameplay composition.
  - `src/gameplay/swarmAgentStateMutator.js`: agent buffer mutations and stable IDs.
  - `src/gameplay/swarmRenderSetupRuntime.js`: render/overlay composition.
- Slime Lab:
  - Active migration target: `docs/SLIME_MAIN_RENDER_SUBSYSTEM_REFACTOR.md`. Slime visual Tracks must become a main-renderer subsystem: the full-resolution Slime trail texture is owned by the main WebGL context and sampled directly in the terrain shader. Do not add new normal gameplay dependencies on full-resolution Slime `readPixels`; only low-resolution gameplay/statistical readbacks are acceptable.
  - `src/slime/slimeGpuRuntime.js`: shared GPU Physarum backend used by the main-render Slime subsystem. `src/slime/slimeMainRenderRuntime.js` constructs that backend as a headless main-context subsystem inside the terrain WebGL renderer, so the visual Slime trail texture can be sampled directly by the terrain shader. The detached Slime workspace/canvas runtime has been removed; Slime controls live under `RD > Trail`, and Slime visuals belong in the main terrain render path. Terrain coupling defaults on and samples height/slope/water plus a mutable GPU plant-resource texture. Source map `ImageData` rows are top-left ordered and must be Y-flipped when uploaded into Slime GL textures so simulation UVs match main terrain UVs and map-pixel coordinates. The plant regeneration base is the authored plant potential, while the mutable plant stock can be seeded from true live plant stock; do not use gameplay live stock as the regeneration cap or Slime will ratchet its own base downward after depletion sync. Slime plant consumption/regeneration mutates the GPU plant-availability texture and, in gameplay time mode, renders that texture into the small resource-stock grid as a plant stock factor before syncing it into `resourceStockRuntime`; this sync is depletion-only for gameplay stock and can only lower already-known stock, so it cannot overwrite gathering depletion, reveal unknown resources, or replace the normal slow resource-stock regeneration path. Do not reinitialize mutable GPU plant stock on same-size plant source refreshes, and do not reintroduce full-map plant-stock CPU readback for this cadence path. Slime advances from the existing global game-time tick stream used by the gameplay diorama, but it is work-budgeted rather than a strict catch-up simulation: `gameTicksPerSlimeStep` is an integer `1-10` cadence interval for gameplay time, `stepsPerGameTick` remains the per-interval Slime step batch size, and `maxGameStepsPerFrame` caps actual Slime work per rendered frame while discarding excess fast-forward intervals instead of queueing backlog. Low-resolution readbacks are also budgeted and staggered: `availabilityUpdateTickInterval` counts actual Slime steps and defaults to `10`, while `plantStockSyncTickInterval` controls the slower plant factor sync and defaults to `120`. This is intentional because 100x is fast-forward, not a smooth ecological simulation mode. On map load, enabled Slime settings can run a synchronous GPU warmup when `warmupEnabled` is true; `warmupSteps` defaults to `3000`, and older saves without `warmupEnabled` preserve prior enabled behavior. Slime Lab speed buttons dispatch the same global game-speed commands as the gameplay diorama (`1x`, `5x`, `20x`, `100x`). The visual Slime trail overlay follows the normal terrain renderer texture-layer path: the main-context Slime trail texture is bound directly as a nearest-neighbor terrain shader input, colorized in shader, and masked in shader with the Tracks discovery texture. Raw Slime framebuffer textures are Y-flipped in `sampleSlimeTrailOverlay()` to match the row flip that the old CPU readback bridge performed; do not move this flip into simulation coordinate math. Do not reintroduce full-resolution Slime trail `readPixels` for normal visual rendering or overlay masking. Inspect Tracks (`T`) samples the low-resolution Slime availability grid for numeric readout and gates rendering through a separate `tracks` discovery map initialized clear/black on new game or map reset; player movement reveals tracks knowledge, scout birds do not. RD Slime exposes `Clear`, `Fill`, `Noise`, and a render-only knowledge cutoff for this tracks map. It also exposes Hunting flee steps/weight/radius, which activate a temporary player-centered repulsion field after a successful kill; gameplay registers this as a temporary condition effect so the buff/debuff strip owns the visible status while Slime simulation steps decrement the duration. The flee field penalizes sensor samples near the player and directly steers nearby agents away with a proximity-scaled speed boost inside the configured radius. The low-resolution availability grid is rendered/read at grid resolution, flipped into top-left map coordinates, and is for Hunting, sampling, and numeric readout, not the primary visual overlay. Its values use the same threshold/gain/gamma normalization as the visible track overlay so Hunting availability matches what the player sees. Hunting uses the hot/top half of cells inside the activity circle for availability instead of a fully diluted all-cell average. On probabilistic Hunting success, gameplay reads current GPU agent positions, only awards loot for agents actually inside the hunt circle, respawns killed local agents outside the circle, and reports a miss/no game if the chance succeeds but no agents are present. Settings persist through `slime.json`; named presets use the shared module preset runtime with built-ins under `assets/presets/slime` and browser/dev saves mirrored to local browser storage.
  - `src/slime/slimeAvailabilityRuntime.js`: pure downsample/sampling helpers for Slime trail availability readback.
- UI:
  - `src/ui/gameplayHudRuntime.js`: bottom player HUD and condition bars.
  - `src/ui/infoPanelRuntime.js`: compact activity/travel/inspect side-panel updates.
  - `src/ui/resourceDebugPanelRuntime.js`: RD panel.
  - `src/ui/inventoryPanelRuntime.js`: inventory panel.
  - `src/ui/overlays/drawOverlay.js`: overlay canvas drawing for markers, vectors, UI gizmos, and fallback/debug rasters. It is not the default path for full-map render-time texture layers.
- Animated overlay redraws are capped to a 60 Hz cadence when the overlay is clean; explicit dirty redraws still happen immediately.
- Water particle trail simulation/upload accumulates frame time and runs at a 60 Hz cadence instead of every render frame.

## Gameplay State

- Runtime modes: title and gameplay. Legacy/unknown mode names normalize to gameplay; the title screen exposes only the normal game path. The legacy dev topic dock has been removed, and `resource-debug` is the only valid topic-panel target.
- Plain no-mode map clicks do not teleport the player in any runtime mode. Movement destinations should be chosen through `PF`.
- Primary activities are mutually exclusive: `PF`, `G`, `W`, `HU`, `SC`, `R`.
- Inspect is a secondary perception toggle and can coexist with most primary activities. It is blocked/hidden during rest and scout.
- Utility actions: inventory and center camera on player.
- Clicking a different primary activity switches immediately; clicking the active one cancels it.
- Primary activity buttons are the expected cancel/switch mechanism. Side panels should avoid duplicate cancel buttons.
- Travel, Gathering, and Hunting switch game time to `20x` after a successful start/path commit; shared completion/cancel cleanup resets game time to `1x`.
- `Nav`/route planning is a separate strategic activity-style interaction mode. It previews low-resolution long-distance routes on hover and adds waypoint segments on click, but it never queues movement directly.

## Travel And Pathfinding

- Pathfinding uses a local Dijkstra field centered on the player.
- Local pathfinding and long-distance route planning share the same Dijkstra core. They differ in data resolution and ownership, not in graph-search semantics.
- Local pathfinding and long-distance route planning also share deterministic parent-chain path extraction semantics.
- PF range is displayed/enforced as a circular mask inside the square Dijkstra window.
- Clicking a reachable PF preview queues movement and starts explicit `travel` activity.
- The committed grey path overlay is the original selected path. Travel progress trims the traveled prefix; do not recompute a fresh path to the target while traveling.
- Travel estimates use the same movement/upkeep costs as committed travel.
- Travel planning panels stay compact: title shows `Plan Travel: est. x hours`; the body only shows unreachable-path or projected-effect warnings. Current active modifiers are shown elsewhere, and projected nutrition/hydration/fatigue changes render as red/green overlays on bottom condition bars.
- Long-distance route planning uses `routePlanning` interaction mode, not tactical `pathfinding`. Activating `Nav` builds a low-resolution Dijkstra field from the current planning anchor, initially the player. Hover previews are drawn as detailed route points; clicking adds a waypoint segment, advances the anchor to that destination, and rebuilds Dijkstra from the new anchor. The committed visualization derives sparse directional arrow markers from stored route segments and remains non-executable.
- Committed route arrows render into a cached 1024x1024 2D texture and are composited over the terrain with image smoothing disabled so the route overlay keeps the same pixelated visual language as the map. Active `Nav` always shows this final arrow texture; outside `Nav`, visibility is controlled by the independent Inspect `R` toggle and requires Inspect to be enabled.
- Route planning has editor state in `routePlanningRuntime`: committed segments have stable IDs, route endpoints are selectable waypoints, and start/end endpoint clicks reset the active planning anchor and rebuild Dijkstra from that point. Deletion is waypoint-based and allowed only for leaf waypoints, meaning a point with at least one incoming segment and no outgoing segment.
- Route waypoint placement stops automatically after a segment is committed. Terrain clicks do not commit new route segments until an existing route endpoint is selected and the local waypoint action menu `EXT` action is used to set that point as the active planning anchor and rebuild Dijkstra from there. The same local menu exposes leaf waypoint deletion.
- Activating `Nav` on an empty route starts waypoint placement from the player. Activating `Nav` when route segments already exist starts in the non-placement editing state so existing waypoints can be selected first.
- Route planning averages slope/height/water maps into its low-resolution grid once per map/grid/image set, then computes edge costs with the same movement formula as local pathfinding. Route field builds merge the active local pathfinding weights and slope cutoff, while route-specific settings still own grid size and visualization tuning. Route previews/segments store actual extracted-path cost and displayed route time uses per-edge `ceil(stepCost)` ticks to match tactical travel estimates.
- Route planning debug overlays can display the low-resolution Dijkstra field or the route-planning discovery knowledge field for testing. These overlays are visualization-only; route extraction remains the normal Dijkstra parent-chain path.
- Route planning supports NAV-only planning bias settings that multiply effective slope/height/water route weights and adjust slope cutoff before Dijkstra is built. It also supports a discovery cutoff: low-resolution route cells below the selected discovery knowledge threshold are treated as impassable for strategic route planning.

## Resource Gameplay

- `G` gathers plants; `W` gathers water. Both use `assets/data/resource_search.json` through `resourceSearchRuntime`.
- Plants and water currently sample wetness data for availability. Plants can later move to their own authored map without changing the search path.
- Resource rewards support single items, `fillContainer`, and weighted banded loot tables.
- `HU` Hunting is currently a prototype Slime-trail activity. It samples the full activity circle from the Slime trail availability grid, displays the normalized availability as a bar in the activity info panel, uses normalized availability as success chance input, grants `raw_meat` on success, and removes/respawns killed local Slime agents while the existing trail decays naturally.
- Water gathering fills carried items tagged `water_container`; `water_skin` stack count is fill level. Empty waterskins remain in inventory.
- Resource stock is runtime/grid based and persisted through `resource_stock.json` when saving map data.
- Resource Debug (`RD`) gameplay tabs are `Knowledge`, `Known View`, and `Stock`. `Knowledge` owns explicit edits to the shared world Knowledge Map. `Known View` controls contour presentation for known water, plants, height, and slope without mutating knowledge. `Stock` edits/debugs live/known stock and recovery for resources. Local pathfinding, NAV terrain visibility/rules, and route drawing/debug visualization live under top-level `RD > Pathing`.
- The shared world Knowledge Map is owned by `resourceDiscoveryRuntime`. Water, plants, terrain visibility, and NAV currently resolve to this same map. Slider changes must not repaint or reset it; only explicit Knowledge actions and gameplay reveal movement mutate it. See `docs/KNOWLEDGE_MAP.md`.
- NAV terrain visibility can draw a pixel-stable dithered layer from NAV Knowledge before gameplay overlays. This visibility layer is gated to active `Nav` so normal observation keeps the full terrain view. The earlier WebGL sampler path is disabled until the discovery texture upload path is corrected.
- NAV terrain visibility skips raster/draw work when non-debug visibility would be fully transparent because all Knowledge Map cells meet the configured full-visibility threshold.

## Inspect/Discovery

- Inspect HUD exposes mutually exclusive `T/W/P/H/S` buttons and a selected-layer bar. Clicking the active exclusive button turns it off. `R` is an independent route overlay toggle.
- Player-facing resource bars use known availability/known stock by default. RD stock mode can override to live/ignore stock for testing.
- Resource contours are drawn only where the shared Knowledge Map allows it unless dev/debug overrides are active.
- Movement, idle tick batches, and scout possession can reveal the shared Knowledge Map and refresh known stock. Knowledge reveal supports a tunable grayscale falloff; `0` preserves the hard full-white reveal brush, `1` is linear falloff.
- Map sidecar settings load and passive Inspect layer sync are non-mutating for the Knowledge Map. The final map-loaded hook resets/seeds/reveals the shared map once after all sidecars have loaded so the reveal uses the applied `npc.json` player position.

## UI Layout Vocabulary

See `docs/UI_LAYOUT_GRID.md` for the full contract.

- `Player UI Height`: total height of the bottom-center player HUD.
- `Player UI Row`: one third of `Player UI Height`.
- `Side Slot`: half of `Player UI Height`, equal to 1.5 rows.
- `Side Stack`: fixed right-side stack aligned to the player HUD.
- Top side slot: Activity/Travel panel.
- Bottom side slot: Inspect panel.
- Content adapts to slots; slots do not resize to content.

`RD` also owns a right-edge debug-overlay shortcut rail while the resource-debug topic is open. The rail is a narrow full-height strip of small square buttons attached to the RD panel; buttons route through existing controls/selects instead of owning duplicate state. Current shortcuts include raw terrain texture views (`H/S/We/W`), water flow/trail debug, detail RGBA/channel debug, Slime terrain/trail overlays, Knowledge Map, and route cost/NAV knowledge overlays. Rail base diagnostic shortcuts are mutually exclusive and clear the other base debug states before enabling the requested view; `TR`/Slime trail overlay is the additive exception and can remain enabled on top. Raw terrain texture debug belongs to the main WebGL render path: `heightTex`, `slopeTex`, `wetnessTex`, and `waterTex` are uploaded through the normal map image plumbing and the selected debug mode is forwarded through the render-shell frame-loop assembly. The fragment shader must stay within WebGL2's 16 sampler limit; wetness debug reuses the existing `uFlowMap` sampler binding while `Texture View = Wetness` instead of adding another sampler uniform. Route cost/NAV knowledge debug overlays are intentionally decoupled from active NAV interaction: selecting a route debug overlay can rebuild the route field while route mode is inactive, and the overlay drawer renders debug overlays regardless of `routePlanning.active`.

Current CSS variables in `styles.css`:

```css
--player-ui-width: 1024px;
--player-ui-height: 108px;
--player-ui-row: calc(var(--player-ui-height) / 3);
--side-slot-height: calc(var(--player-ui-height) / 2);
--side-stack-gap: 0px;
--player-ui-bottom: 0px;
--side-stack-x: calc(50% + 512px);
```

Title screen uses the title image as a fullscreen cover background, with compact text-fit square-corner pixel buttons vertically centered on the left side. Startup status includes a progress bar driven by staged map loading, sidecar loading, gameplay initialization, and chunked Slime warmup updates so long preprocessing does not appear frozen.

Gameplay HUD blocks use square corners, zero inter-block gap, and no bottom viewport margin. The time diorama/time-speed controls live inside the bottom player HUD between the system-action columns and activity buttons; `0x` is a real game pause. Condition stats are a fixed compact left-anchored stack of vertical label/bar rows without visible numeric values. The condition effect strip is limited to the top-left HUD span and must not overlap the `RD`/knowledge button columns. A compact Journal Feed spans the full HUD width directly above the HUD; collapsed it shows the newest journal entry, and expanded it grows upward into a short scrollable list. The `RD` resource-debug topic button, `O` performance overlay button, and `Exit` button live in one vertical system-action column immediately left of the diorama; `?`, `W`, and `J` live in a second adjacent knowledge column for contextual help, wiki, and journal. `J` toggles the Journal panel open/closed. In gameplay mode, the RD topic panel is a fixed-height left rail anchored to the top/left viewport edges above the player HUD. Save RD Settings lives in the RD panel title row; RD-dev top-level and nested tab strips stay in the non-scrolling header area with horizontal separators, while only the active content panel scrolls. RD-dev uses top-level tabs for Terrain, Agents, Trail, Gameplay, Events, Audio, Pathing, and IO, with scoped nested tab groups using `data-rd-tab-group`. Existing resource-debug knowledge/stock panels currently live under the top-level Gameplay tab; event-system test triggers and state readouts live under Events > Debug; local PF pathfinding tuning lives under Pathing > Local, NAV terrain visibility/rules live under Pathing > NAV, route drawing/debug controls live under Pathing > Route; main lighting controls live under Terrain > Lighting, point-light editor controls and point-light flicker controls live under Terrain > Point Lights, the Point Lights `Show Gizmos` toggle activates/deactivates the existing point-light placement/selection interaction, cursor-follow light controls and cursor-light gizmo visibility live under Terrain > Cursor Light, fog controls live under Terrain > Fog, cloud controls live under Terrain > Clouds, water FX controls live under Terrain > Water, water particle trail controls live under Terrain > Water Trails, detail controls live under Terrain > Detail, camera actions live under Terrain > Camera, swarm simulation/render controls live under Agents > Swarm, swarm follow controls live under Agents > Follow, swarm stats and hawk-range gizmo visibility live under Agents > Overlays, Slime controls live under Trail > Runtime/Motion/Visual/Terrain/Plants/Brush/Tracks and visualize through the world-space terrain overlay path, Audio controls live under Audio > Spectrogram/Synthesis/Soundscape with collapsible square-corner synthesis oscillator and soundscape layer cards, and map/pointlights/Slime sidecar load-save controls live under IO. Redundant `RD > Info`, `RD > Overlays > Performance`, and `RD > Overlays > Textures` panels are removed from visible navigation; their required DOM state targets remain hidden where existing bindings or the overlay rail still need them. The old dev topic dock and placeholder migrated-topic cards have been deleted; the RD panel is the remaining topic-panel surface. Volumetric scatter and cloud sun projection/offset have been removed from the active renderer and settings UI. `RD > Audio` uses a `Show Audio View` toggle to launch/close the Audio tool viewport as a bounded gameplay overlay above the terrain for spectrogram/waveform surfaces. The detached legacy Slime comparison viewport has been removed; Slime visualization belongs on top of the terrain through the main renderer overlay path. `RD > Trail > Runtime` has an opt-in `Terrain Underlay` toggle above `Agents`; it renders a clean diagnostic backdrop where `slope.png` maps directly to red, live Slime plant stock maps directly to green, and `water.png` maps directly to blue. Height is not included, and Slime trail color rendering remains a separate overlay that can be enabled on top. Workspace switching no longer closes RD, but it still clears active interaction modes when leaving the map workspace. Camera panel actions dispatch existing core camera/player commands and do not own camera state. The system-action columns, time diorama, and activity controls are right-anchored, leaving an expandable center cap for future stats. Projected travel/activity costs appear as red/green bar overlays.

## Data Files And Map Sidecars

Map folder convention: `assets/<mapName>/`.

Tauri packaging caveat: map folders must avoid spaces so packaged asset URLs work consistently in the desktop WebView. Default source and packaged paths use `assets/map3/`; do not reintroduce spaced map folder names or alias-copy fallbacks.

Tauri packaging caveat: `build-tauri.ps1` copies `docs/wiki/` into `.tauri-dist/docs/wiki/` because the runtime content registry fetches wiki Markdown directly from that path. Keep this sync if adding or moving packaged wiki content.

Tauri runtime caveat: `src-tauri/tauri.conf.json` must enable `app.withGlobalTauri = true` so `window.__TAURI__.core.invoke` exists. The title Quit action and desktop file commands depend on this. Startup failures must be shown on the title screen because the normal status panel is hidden before entering dev/gameplay.

Core texture names:

- `splat.png`
- `normals.png`
- `height.png`
- `slope.png`
- `water.png`
- optional `flow.png`
- optional wetness/resource maps referenced by data files

Common sidecars:

- `npc.json`
- `lighting.json`
- `interaction.json`
- `fog.json`
- `clouds.json`
- `waterfx.json`
- `watertrails.json`
- `detail.json`
- `camera.json` can include camera bounds plus optional startup pose. Use `pixelX`, `pixelY`, and `zoom` to center the camera on a map pixel at load; `panX`, `panY`, and `zoom` are also supported for direct world-space camera saves.
- `audio.json`
- `swarm.json`
- `slime.json`
- `pointlights.json`
- `resource_debug.json`
- `resource_stock.json`

Shared gameplay data lives under `assets/data/`.

## Key Docs

- `docs/ACTIVITY_MODEL.md`: survival activity/condition model.
- `docs/RESOURCE_STOCK_MODEL.md`: resource stock/depletion/replenish model.
- `docs/EVENT_NOTIFICATION_ARCHITECTURE.md`: event bus boundaries and migration notes.
- `docs/UI_LAYOUT_GRID.md`: fixed gameplay HUD/side-panel layout vocabulary.
- `docs/KNOWLEDGE_MAP.md`: shared Knowledge Map naming and mutation rules.
- `docs/UNIFIED_GAME_MODE_RD_DEV_MIGRATION.md`: plan and progress tracker for removing the user-facing gameplay/dev-mode split.

## Verification

When running quick checks through Codex tools, pass explicit `timeout_ms` values. Common commands are:

```powershell
node --check src\main.js
node --test tests\*.test.js
npm run lint:md
```

Run more focused checks when changing one owner module. Run full JS tests after changes touching `main.js`, command routing, runtime events, activity, movement, resource, or save/load paths.

## Current Non-Goals

- No game engine.
- No physically accurate astronomy.
- No georeferenced sun position.
- Movement is currently discrete queue stepping, not animated interpolation.
- Do not broaden the event bus into a command system.
- Do not grow side panels based on content; reduce content to fit fixed slots.

## Change Rules

- Preserve existing user changes. Never revert unrelated edits.
- Keep dependencies minimal.
- Prefer small, testable increments.
- Keep `AI_CONTEXT.md` aligned when changing architecture, ownership, UI contracts, or major gameplay behavior.
