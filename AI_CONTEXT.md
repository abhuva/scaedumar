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
- Runtime change notifications use a small event layer:
  - `src/core/eventBus.js` defines `createEventBus` and `RuntimeEvents`.
  - `src/core/runtimeEventHandlers.js` centralizes refresh/invalidation fan-out.
  - Events are for post-change UI/overlay/cache refresh only. Commands and runtime-owner APIs still own mutation, validation, and success/failure.
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
- UI:
  - `src/ui/gameplayHudRuntime.js`: bottom player HUD and condition bars.
  - `src/ui/infoPanelRuntime.js`: compact activity/travel/inspect side-panel updates.
  - `src/ui/resourceDebugPanelRuntime.js`: RD panel.
  - `src/ui/inventoryPanelRuntime.js`: inventory panel.
  - `src/ui/overlays/drawOverlay.js`: overlay canvas drawing.
- Animated overlay redraws are capped to a 60 Hz cadence when the overlay is clean; explicit dirty redraws still happen immediately.
- Water particle trail simulation/upload accumulates frame time and runs at a 60 Hz cadence instead of every render frame.

## Gameplay State

- Runtime modes: title, gameplay, dev.
- Gameplay mode blocks no-mode teleporting; movement destinations should be chosen through `PF`.
- Primary activities are mutually exclusive: `PF`, `G`, `W`, `SC`, `R`.
- Inspect is a secondary perception toggle and can coexist with most primary activities. It is blocked/hidden during rest and scout.
- Utility actions: inventory and center camera on player.
- Clicking a different primary activity switches immediately; clicking the active one cancels it.
- Primary activity buttons are the expected cancel/switch mechanism. Side panels should avoid duplicate cancel buttons.
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
- Water gathering fills carried items tagged `water_container`; `water_skin` stack count is fill level. Empty waterskins remain in inventory.
- Resource stock is runtime/grid based and persisted through `resource_stock.json` when saving map data.
- Resource Debug (`RD`) has `Knowledge`, `Known View`, `NAV`, and `Stock` tabs. `Knowledge` owns explicit edits to the shared world Knowledge Map. `Known View` controls contour presentation for known water, plants, height, and slope without mutating knowledge. `NAV` controls NAV-only terrain visibility, route rules, and route visualization. `Stock` edits/debugs live/known stock and recovery for resources.
- The shared world Knowledge Map is owned by `resourceDiscoveryRuntime`. Water, plants, terrain visibility, and NAV currently resolve to this same map. Slider changes must not repaint or reset it; only explicit Knowledge actions and gameplay reveal movement mutate it. See `docs/KNOWLEDGE_MAP.md`.
- NAV terrain visibility can draw a pixel-stable dithered layer from NAV Knowledge before gameplay overlays. This visibility layer is gated to active `Nav` so normal observation keeps the full terrain view. The earlier WebGL sampler path is disabled until the discovery texture upload path is corrected.
- NAV terrain visibility skips raster/draw work when non-debug visibility would be fully transparent because all Knowledge Map cells meet the configured full-visibility threshold.

## Inspect/Discovery

- Inspect HUD exposes `W/P/H/S` buttons and a selected-layer bar.
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

Current CSS variables in `styles.css`:

```css
--player-ui-height: 108px;
--player-ui-row: calc(var(--player-ui-height) / 3);
--side-slot-height: calc(var(--player-ui-height) / 2);
--side-stack-gap: 0px;
--player-ui-bottom: 12px;
--side-stack-x: calc(50% + 512px);
```

Gameplay HUD blocks use square corners and zero inter-block gap. The time diorama/time-speed controls live inside the bottom player HUD between condition bars and activity buttons; `0x` is a real game pause. Condition stats are a fixed compact left-anchored stack of vertical label/bar rows without visible numeric values; the time diorama and activity controls are right-anchored, leaving an expandable center cap for future stats. Projected travel/activity costs appear as red/green bar overlays.

## Data Files And Map Sidecars

Map folder convention: `assets/<mapName>/`.

Tauri packaging caveat: map folders must avoid spaces so packaged asset URLs work consistently in the desktop WebView. Default source and packaged paths use `assets/map3/`; do not reintroduce spaced map folder names or alias-copy fallbacks.

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
- `camera.json`
- `audio.json`
- `swarm.json`
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
