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
- `gather_water`: explicit activity with a side panel. It uses the same nearby movement loop as gathering, but rolls against a map-driven resource-search model and produces a carried water item when successful.
- `inspect`: explicit activity with a side panel. It samples terrain under the cursor and currently has no survival cost.
- `rest`: explicit activity with a side panel. It reduces fatigue while general upkeep still drains nutrition and hydration.

`travel` owns route intent, cancellation, and completion messaging. The movement system still owns step execution and does not know why movement was requested.

Pathfinding selection is treated as travel planning, not committed travel. While `PF` mode is active, the side panel shows a `Plan Travel` preview for the hovered destination. The estimate includes:

- destination
- path steps
- projected movement ticks
- estimated real-time duration at the current time speed
- projected nutrition, hydration, and fatigue change
- active condition modifiers affecting the estimate
- newly introduced or worsened condition effects after travel

No cost is paid until the player clicks to confirm travel.

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
- A successful roll awards the configured reward item, currently `water_skin`.

The probability model is intentionally separated from the source image. `wetness.png` should describe environmental wetness. `resource_search.json` decides how that map becomes a gameplay chance. This keeps map authoring and survival tuning independent.

Movement weighting is also data-driven. Resource-search activities can bias their wandering candidates toward better samples without changing the generic movement system. Movement still pays ordinary locomotion cost through `movement.step`; the search activity only pays its own work/search cost.

If a resource search references a map that is missing from the loaded map folder, the runtime reports a clear map-load warning and disables that resource's search chance. This prevents a hidden fallback chance from making missing gameplay data look valid.

## Resource Discovery

Resource discovery is separate from resource search.

- Resource search uses the real full-resolution map data for simulation.
- Resource discovery stores what the player has learned.
- Resource visualization is gated by discovered knowledge.

The first discovery mask is for water/wetness and is owned by:

```txt
src/gameplay/resourceDiscoveryRuntime.js
```

The discovery mask is intentionally low resolution and tunable from `assets/data/resource_search.json`. For the current `1024x1024` map, the water search starts with a `256x256` knowledge grid. Each completed movement step reveals a configurable circle around the player, currently radius `30` map pixels.

Inspect mode displays wetness contours only where the water discovery mask is known. The contour overlay samples the full-resolution `wetness.png`; the low-resolution discovery mask only gates visibility. This keeps the real resource model precise while letting player knowledge remain coarse and skill-scalable.

The current inspect panel also shows a local readout:

- wetness value
- water-find chance
- knowledge percentage

This readout is exact for current tuning/debugging. Later player skill can make the same readings fuzzier or more precise without changing the underlying search model.

For tuning, the `RD` Resource Debug topic panel exposes map-local controls in gameplay and dev modes:

- discovery grid size
- movement reveal radius
- active display layer
- render mode per layer
- contour sample step
- knowledge visibility threshold
- contour line width
- layer tint color
- five contour bands per layer, each with enabled state and threshold
- cover all / uncover all discovery mask actions

Discovery settings are shared across the current water-knowledge mask. Visual settings are separated per displayed layer (`wetness`, `height`, `slope`) so each map can use different thresholds and tint colors. `Save All` persists this tuning to map-local `resource_debug.json`.

Wetness contours are cached as a map-sized transparent raster overlay. Resource Debug can switch between two runtime render modes:

- `Marching Lines`: default. Builds five contour bands using marching-squares line construction, then rasterizes those lines once.
- `Raster Bands`: processes the selected grayscale source directly and writes pixels whose value is close to a configured band threshold.

Both modes rebuild only when inspect starts or when Resource Debug controls explicitly invalidate the contour view. Ordinary overlay redraws, camera pans, zooms, and travel-driven discovery updates only blit the cached contour image into the current camera transform.

Inspect mode can switch the contoured knowledge layer from the activity panel:

- `W`: wetness from `wetness.png`
- `H`: height from `height.png`
- `S`: slope from `slope.png`

All three layers use the same discovered-knowledge gate for now. This models the current fog-of-war as gathered knowledge rather than pure map visibility.

`resource_debug.json` is deliberately a sidecar even though the controls are debug-facing. The data affects how gathered terrain knowledge is communicated during gameplay, and it needs to be saved per map while the presentation model is still being tuned.

`water_skin` is an inventory item defined in:

```txt
assets/data/items.json
```

Using a found water item to recover hydration is an item effect. Finding water does not directly refill hydration, which keeps recovery and resource acquisition as separate systems.

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

- `src/gameplay/playerActivityRuntime.js`: activity director. Owns explicit activity state, idle fallback, side-panel snapshots, and per-tick upkeep dispatch.
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

The activity director receives processed movement-time ticks from the scheduler. For every processed tick it applies `idle.tick`, regardless of whether the visible activity is idle, gathering, inspect, or rest. Explicit activities may add their own effects on top.

Movement cost is intentionally charged from movement completion hooks, not from the activity director's time tick. This lets any future activity ask for movement without duplicating locomotion rules. PF click-to-move starts `travel` after a movement queue is accepted; gathering uses silent one-step movement queues and remains the explicit activity.

Resource search follows the same movement rule. `gather_water` asks for movement, movement pays locomotion cost, then the activity pays its own search/work cost and rolls for the resource at the reached cell.

Movement completion also reveals resource knowledge around the player. This is intentionally independent from the activity type, so normal travel, gathering, and future activities all uncover the same surveyed wetness layer as the player moves.

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
