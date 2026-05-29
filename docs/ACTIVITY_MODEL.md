# Player Activity Model

## Purpose

This note defines the survival activity model used by game mode. It is a design-facing note with enough implementation detail to keep future code changes aligned.

The core rule is:

> The player is always doing something.

When no explicit action is selected, the active activity is `idle`. Idle does not need a side panel or visible player-facing affordance, but it still represents the ordinary upkeep cost of staying alive.

## Activity Layers

Survival effects are separated into layers instead of treating each activity as a complete hardcoded stat bundle.

- General upkeep: baseline cost of being alive over time.
- Locomotion: cost of moving through terrain.
- Activity work: extra cost or recovery produced by the selected activity.

This prevents special cases like "rest costs food and water" from being duplicated in every activity. Rest does not own the cost of being alive. Rest owns recovery. The general upkeep layer continues to apply while resting.

## Activity Manifest

Activity definitions are data-driven in:

```txt
assets/data/activities.json
```

The manifest currently owns:

- activity id
- display label
- HUD button label/title
- panel visibility intent
- exclusivity
- cancel/complete labels
- named cost keys used by the runtime

Behavior is still implemented by runtime systems, but the manifest is the source of truth for activity metadata and cost-key wiring.

## Current Activities

- `idle`: default hidden activity. Applies general upkeep while time advances.
- `travel`: explicit activity started by queued pathfinding movement. Each completed movement step applies locomotion cost based on terrain and load.
- `gathering`: explicit activity with a side panel. It drives movement through nearby single-step queues and applies a small search/work cost when a search step completes.
- `gather_water`: explicit activity with a side panel. It uses the same nearby movement loop as gathering, rolls against a map-driven resource-search model, and fills carried items tagged `water_container` when successful.
- `inspect`: secondary perception toggle. It is not a primary/exclusive activity; it enables focused overlay/readout behavior while the always-visible inspect HUD continues to show base terrain perception.
- `scout`: explicit animal-possession activity. It scans for a reachable bird, exposes a compact possess action in the side panel, then tracks possessed-bird lifecycle and discovery reveal while possessed.
- `rest`: explicit activity with a side panel. It reduces fatigue while general upkeep still drains nutrition and hydration.

`travel` owns route intent, cancellation, and completion messaging. The movement system still owns step execution and does not know why movement was requested.

Pathfinding selection is treated as travel planning, not committed travel. While `PF` mode is active, the side panel shows a compact `Plan Travel: est. x hours` preview for the hovered destination. The full estimate model includes:

- destination
- path steps
- projected movement ticks
- estimated real-time duration at the current time speed
- projected nutrition, hydration, and fatigue change
- newly introduced or worsened condition effects after travel

The side panel only shows unreachable-path or projected-effect warnings. The bottom condition bars show projected nutrition, hydration, and fatigue cost as red/green overlays. No cost is paid until the player clicks to confirm travel.

## Cost Data

Activity costs are data-driven in:

```txt
assets/data/activity_costs.json
```

Current keys:

- `idle.tick`: baseline nutrition and hydration drain per simulation tick.
- `movement.step`: terrain/load-scaled nutrition, hydration, and fatigue effects per completed movement step.
- `gathering.search`: extra work cost when gathering searches a cell.
- `gather_water.search`: extra work cost when the water-search activity searches a cell.
- `rest.tick`: fatigue recovery per rest tick.

Costs should remain small numeric deltas. The condition runtime is responsible for clamping and precision; activity systems should not round or clamp condition values themselves.

## Resource Search

Resource-search definitions are data-driven in:

```txt
assets/data/resource_search.json
```

Resource search is for activities that try to find a concrete resource in the world instead of directly modifying condition values. The first use is water gathering:

- `gather_water` references the `water` resource search from `assets/data/activities.json`.
- `water` samples the optional map-local `wetness.png` sidecar.
- The wetness value is read from the red channel.
- The search definition owns threshold, curve, base chance, chance scale, max chance, and movement weighting.
- The search definition also owns initial discovery/overlay tuning for the player-facing wetness readout.
- A successful roll resolves the configured reward. Water fills carried items tagged `water_container`; plants use a weighted loot table.

The probability model is intentionally separated from the source image. `wetness.png` should describe environmental wetness. `resource_search.json` decides how that map becomes a gameplay chance. This keeps map authoring and survival tuning independent.

Movement weighting is also data-driven. Resource-search activities can bias their wandering candidates toward better samples without changing the generic movement system. Movement still pays ordinary locomotion cost through `movement.step`; the search activity only pays its own work/search cost.

If a resource search references a map that is missing from the loaded map folder, the runtime reports a clear map-load warning and disables that resource's search chance. This prevents a hidden fallback chance from making missing gameplay data look valid.

## Resource Discovery

Resource discovery is separate from resource search.

- Resource search uses the real full-resolution map data for simulation.
- Resource discovery stores what the player has learned.
- Resource visualization is gated by discovered knowledge.

Resource discovery masks are owned by:

```txt
src/gameplay/resourceDiscoveryRuntime.js
```

Discovery masks are intentionally low resolution and tunable from `assets/data/resource_search.json` plus map-local `resource_debug.json`. For the current `1024x1024` map, water and plants start with a `256x256` knowledge grid. Each completed movement step reveals a configurable circle around the player, currently radius `30` map pixels.

The reveal brush is grayscale. `Reveal Falloff = 0` preserves the original hard full-white reveal circle; `1` gives linear falloff from center to edge; larger values tighten the falloff toward the center. The center cell remains full strength so the current player or possessed-bird position is clearly known.

Inspect mode displays resource contours only where the matching discovery mask is known. Resource overlays sample the full-resolution authored suitability map; the low-resolution discovery mask only gates visibility. This keeps the real resource model precise while letting player knowledge remain coarse and skill-scalable.

The gameplay inspect HUD is always visible in the fixed side stack. With inspect focus off, overlay buttons are disabled and no resource bar is shown. With inspect focus on, `W/P/H/S` buttons become active, the selected discovered-knowledge layer can draw an overlay, and the HUD shows one compact resource/terrain bar for the selected layer.

The player-facing inspect HUD uses what the player knows. Resource bars multiply the authored availability by discovered knowledge and known stock. The Resource Debug controls can override this for testing by switching stock overlay mode to live or ignore-stock behavior.

For tuning, the `RD` Resource Debug topic panel exposes map-local controls in gameplay and dev modes:

- discovery grid size
- discovery reveal falloff (`0` keeps the original hard full-white brush; `1` is linear falloff)
- movement reveal radius
- active display layer
- render mode per layer
- contour sample step
- knowledge visibility threshold
- contour line width
- layer tint color
- five contour bands per layer, each with enabled state and threshold
- cover all / uncover all discovery mask actions

Discovery settings are shared across the current resource-knowledge masks. Visual settings are separated per displayed overlay (`water`, `plants`, `height`, `slope`) so each map can use different thresholds and tint colors. Legacy `wetness` sidecar settings are migrated to the `water` overlay. `Save All` persists this tuning to map-local `resource_debug.json`.

Wetness contours are cached as a map-sized transparent raster overlay. Resource Debug can switch between two runtime render modes:

- `Marching Lines`: default. Builds five contour bands using marching-squares line construction, then rasterizes those lines once.
- `Raster Bands`: processes the selected grayscale source directly and writes pixels whose value is close to a configured band threshold.

Both modes rebuild only when the inspect toggle is active and the selected resource/debug settings, discovery mask, or stock field version changes. Ordinary overlay redraws, camera pans, and zooms only blit the cached contour image into the current camera transform.

Inspect is a gameplay perception toggle, not an exclusive activity. Pressing `I` enables focused inspection while travel, gathering, or water gathering can continue in the primary activity panel. The cursor-driven close-inspect behavior remains: moving the cursor over terrain updates the sampled pixel, height, slope, and resource readings. When focus is off, or before a cursor sample exists, the HUD samples the player position. Inspect focus and overlays are unavailable during activities that should block perception, currently rest and scout.

Primary activities are mutually exclusive: `PF`, `G`, `W`, `HU`, `SC`, and `R` represent the current main intent. They are selected from the local terrain activity menu, which opens from a neutral terrain click when no active interaction mode consumes the click. Active activities do not block the fallback menu by default, so the player can reopen it to cancel or switch activities unless a specific activity phase owns terrain clicks. Choosing a different primary activity switches immediately by canceling the current primary activity and starting the new one; choosing the active primary activity cancels it. When an activity, movement, or cancelable interaction is active, the local menu also shows a center `X` cancel button at the click anchor. `Nav`, Inventory, and camera-centering are HUD utility actions, not local primary activities.

Inspect focus can switch the contoured knowledge layer from the inspect HUD:

- `W`: water availability, currently sourced from `wetness.png`
- `P`: plant availability using the current plant resource search map
- `H`: height from `height.png`
- `S`: slope from `slope.png`

Resource layers use the matching discovered-knowledge gate and selected stock overlay mode. Height and slope still use the shared discovery presentation path for now. This models the current fog-of-war as gathered knowledge rather than pure map visibility.

`resource_debug.json` is deliberately a sidecar even though the controls are debug-facing. The data affects how gathered terrain knowledge is communicated during gameplay, and it needs to be saved per map while the presentation model is still being tuned.

Temporary resource depletion and replenishment are documented separately in:

```txt
docs/RESOURCE_STOCK_MODEL.md
```

`water_skin` is an inventory item defined in:

```txt
assets/data/items.json
```

The current prototype treats the waterskin stack quantity as fill level. A waterskin can hold up to `40` water portions, remains in inventory at `0`, and drinking consumes one portion for `1` hydration. Finding water fills an existing water-container item instead of directly restoring hydration or creating a new waterskin.

## Condition Consequences

Condition consequences are data-driven in:

```txt
assets/data/condition_effects.json
```

The current rule is:

> Every condition consequence must have a player-facing explanation path.

Condition effects are resolved from the current condition snapshot. Only the strongest effect per category is active at once, so `Dehydrated` replaces `Thirsty` instead of stacking both. Effects can provide:

- label
- compact HUD icon text
- severity
- description
- effects text
- remedy text
- mechanical modifiers

Current effects:

- low hydration increases positive fatigue gain.
- low nutrition reduces negative fatigue recovery from rest.
- high fatigue increases movement cost.
- high load shows a `Burdened` status explaining that load already affects movement/work costs.

The bottom gameplay HUD keeps condition bars minimal and adds a compact status-effect strip when effects are active. Hovering/focusing a status badge opens a tooltip with the explanation and remedy text.

## Runtime Ownership

The current runtime ownership is:

- `src/gameplay/playerActivityRuntime.js`: activity facade. Owns public activity API composition, side-panel snapshots, movement lifecycle routing, and shared stop/cancel cleanup.
- `src/gameplay/playerActivityUpkeepRuntime.js`: owns processed movement-tick normalization and generic upkeep dispatch for the activity facade.
- `src/gameplay/gatheringActivityRuntime.js`: compatibility re-export for older imports/tests.
- `src/gameplay/activityRegistry.js`: loads and normalizes `assets/data/activities.json`.
- `src/gameplay/resourceSearchRegistry.js`: loads and normalizes `assets/data/resource_search.json`.
- `src/gameplay/resourceSearchRuntime.js`: samples resource maps, computes search chance, computes movement bias, and exposes configured rewards.
- `src/gameplay/resourceDiscoveryRuntime.js`: owns low-resolution discovered-knowledge masks and movement reveal.
- `src/gameplay/movementSystem.js`: generic movement executor. It should not know why movement was requested.
- `src/gameplay/activityEffectRuntime.js`: resolves named cost definitions and applies them to condition.
- `src/gameplay/conditionRuntime.js`: sole owner of condition mutation, clamping, precision, and derived load sync.
- `src/gameplay/conditionEffectRegistry.js`: loads and normalizes `assets/data/condition_effects.json`.
- `src/gameplay/conditionEffectRuntime.js`: resolves active condition effects, combines modifiers, emits transition status messages, and exposes UI-ready effect snapshots.
- `src/gameplay/travelEstimateRuntime.js`: estimates travel preview cost by walking the current preview path and resolving the same movement/upkeep cost keys used by committed travel.

The activity facade receives processed movement-time ticks from the scheduler and routes them through `playerActivityUpkeepRuntime`. For every processed tick the upkeep controller applies `idle.tick`, regardless of whether the visible activity is idle, gathering, inspect, or rest. Explicit activities may add their own effects on top.

Movement cost is intentionally charged from movement completion hooks, not from the activity facade's time tick. This lets any future activity ask for movement without duplicating locomotion rules. PF click-to-move starts `travel` after a movement queue is accepted; gathering uses silent one-step movement queues and remains the explicit activity.

Resource search follows the same movement rule. `gather_water` asks for movement, movement pays locomotion cost, then the activity pays its own search/work cost and rolls for the resource at the reached cell.

Movement completion also reveals resource knowledge around the player. This is intentionally independent from the activity type, so normal travel, gathering, and future activities all uncover surveyed resource layers as the player moves.

Scout possession is a second discovery producer. While a bird is possessed, the scout activity reveals resource discovery masks around that bird, using canonical swarm simulation coordinates for discovery and interpolation only for camera smoothing. Discovery reveal should not depend on camera-follow or overlay-render state.

Current implementation note: the scout possession bridge still lives in `src/main.js`, where it resolves stable swarm `agentId` values, reveals discovery, and updates the camera. This is acceptable for the prototype, but it is a weak ownership boundary. If scout/discovery behavior grows, extract a small `scoutPossessionRuntime` or `scoutDiscoveryRuntime` that owns:

- stable bird identity resolution after swarm remove-swap operations
- converting possessed-bird simulation position into discovery reveals
- reporting scout bird position/effective reveal radius back to `playerActivityRuntime`
- keeping camera-follow interpolation separate from discovery-mask mutation
- forcing overlay invalidation/redraw when possession changes discovered knowledge or moves the camera

The desired dependency direction is: swarm state and activity state feed a scout-discovery producer, `resourceDiscoveryRuntime` owns mask mutation/versioning, and overlay/camera systems consume the resulting state. Avoid putting discovery mutation inside render-only helpers.

Travel preview estimation uses the same per-step terrain cost model as movement queue creation. It also adds baseline `idle.tick` upkeep for the projected tick count, because travel consumes simulation time before each step completes.

Travel preview also computes projected post-travel condition and runs the condition-effect resolver against it. The UI only reports new or worsened condition effects, such as `Will become Thirsty` or `Thirsty will worsen to Dehydrated`, rather than listing every unchanged status.

## Design Rules

- Do not treat rest as a special survival-cost bundle. Rest is recovery plus ordinary upkeep.
- Do not make gathering own walking cost. Gathering may request movement and pay search/work cost, while movement owns locomotion cost.
- Do not make resource search directly restore condition values. It should produce resources/items first; item use or later crafting/container rules decide how recovery happens.
- Do not visualize undiscovered resource-map truth by default. Contours and later overlays should be gated by discovery knowledge unless explicitly in a debug/dev view.
- Do not mutate condition directly from UI or activity code. Route effects through `activityEffectRuntime` and `conditionRuntime`.
- Do not add hidden condition consequences. Any modifier must be represented by a condition effect that can be shown in the HUD strip and explained by tooltip text.
- Keep cost values, activity metadata, item definitions, and resource-search tuning in data files under `assets/data/`, not embedded in gameplay modules.
- Prefer additive layers over copied per-activity total costs.

## Future Direction

The next likely data step is moving more side-panel copy and activity-specific tuning out of `playerActivityRuntime.js` and into the activity manifest.

Potential future activities:

- `forage`
- `hunt`
- `fish`
- `make_camp`
- `craft`
- `ritual`
- `tend_wound`
- `scout`

The same model should handle them by combining upkeep, optional locomotion, and activity-specific work or recovery effects.
