# Resource Knowledge Write Optimization Plan

## Purpose

Reduce walking-time spikes caused by redundant writes/scans/invalidation around resource knowledge, tracks knowledge, and known resource stock.

This is the active task list for the resource/knowledge movement-write optimization pass. Update this note whenever implementation decisions, task status, or validation results change.

## Current Model

- Water, plants, height, slope, and NAV visibility conceptually use the shared world Knowledge Map.
- Tracks use a separate tracks Knowledge Map.
- Live resource stock is simulation state and remains independent of player-facing knowledge.
- Known resource stock is player-facing presentation state. It should update only when the corresponding resource information is being observed or displayed.
- Plants and water have live/known stock grids because they can deplete or renew.
- Height, slope, wetness, and authored static suitability maps do not need known-stock refresh.
- Slime tracks have their own trail/availability system and their own tracks knowledge gate.

## Performance Problem

Movement currently risks doing redundant work in several places:

- Revealing the same shared world Knowledge Map once per resource ID even when those IDs resolve to the same canonical map.
- Running reveal brushes while the player changes map pixels but remains inside the same low-resolution knowledge-grid cell.
- Refreshing known stock even when the matching water/plant overlay is not visible.
- Invalidating overlays/cache paths from writes that do not affect currently visible player-facing information.

The goal is to make movement observation canonical-map driven instead of resource-loop driven.

## Target Model

Movement observation should follow this shape:

```txt
player position changes
  if entered a new world-knowledge grid cell:
    reveal shared world Knowledge Map once

  if entered a new tracks-knowledge grid cell:
    reveal tracks Knowledge Map once

  if world knowledge changed:
    for each actively observed stock resource:
      refresh known stock in revealed area
```

Known stock observation should follow this shape:

```txt
live stock:
  simulation-owned
  updates regardless of UI overlays

known stock:
  player-facing
  updates only when the relevant water/plant stock information is actually visible/observed
```

## Active Observation Definition

Known stock should refresh only for resource IDs that are actively observed.

Initial active-observation sources:

- Inspect focus is enabled and selected layer is `water`: observe water known stock.
- Inspect focus is enabled and selected layer is `plants`: observe plant known stock.
- RD stock/debug mode explicitly displays known stock for a resource: observe that resource if the current UI actually consumes known stock.

Non-observation cases:

- NAV visibility alone does not observe resource stock.
- Height/slope visibility does not observe resource stock.
- Gathering/water activity alone does not observe stock unless its visible panel explicitly displays known stock.
- Normal movement with no resource overlay active does not refresh known stock.

## Implementation Tasks

### 1. Canonical Knowledge Reveal

Tasks:

- [x] Add or expose a helper to resolve a resource/layer ID to the canonical discovery map ID.
- [x] Replace movement-time resource-loop discovery reveals with explicit canonical reveals:
  - [x] `WORLD_KNOWLEDGE_MAP_ID` once for shared terrain/resource/NAV knowledge.
  - [x] `TRACKS_KNOWLEDGE_MAP_ID` once for tracks.
- [x] Preserve current batching through `resourceDiscoveryRuntime.withMutationBatch()`.
- [x] Ensure movement reveal still updates overlays when the shared world map actually changes.

Dependencies:

- `resourceDiscoveryRuntime` owns masks, canonical ID normalization, brush writes, versions, and batching.
- `main.js` currently owns `revealPlayerLocalResourceKnowledge()`.

Validation:

- Add focused tests proving water/plants canonical aliases do not scan/reveal the world map twice during a movement reveal.
- Existing `resourceDiscoveryRuntime` alias tests should remain green.

### 2. Knowledge-Grid Cell Gating

Tasks:

- [x] Track the last revealed grid cell per canonical knowledge map.
- [x] Convert player map pixel to discovery-grid cell before deciding whether to reveal.
- [x] Skip reveal when the player is still in the same canonical knowledge-grid cell.
- [x] Keep independent gating for world knowledge and tracks knowledge because their grids/settings can differ.
- [x] Reset cell gates on map load, knowledge reset/fill/noise, and discovery grid-size changes.

Dependencies:

- Needs access to each target map's current discovery grid dimensions. If no public helper exists, add one to `resourceDiscoveryRuntime`.
- Must preserve explicit debug fill/reset behavior.

Validation:

- Add tests for repeated movement inside one discovery-grid cell: first call can reveal, subsequent same-cell calls skip.
- Add tests for crossing into a new discovery-grid cell: reveal runs again.

### 3. Known Stock Observation Gate

Tasks:

- [x] Add a helper such as `getObservedStockResourceIds()` near the inspect/resource UI integration layer.
- [x] Return only resource IDs whose known stock is currently visible/meaningful to the player.
- [x] Gate `resourceStockRuntime.revealKnown()` behind:
  - [x] world knowledge grid cell was newly observed.
  - [x] resource ID is actively observed.
- [x] Keep live stock updates/depletion/regeneration independent from this gate.

Dependencies:

- Inspect state from `inspectPerceptionRuntime` or current inspect snapshot.
- RD stock/debug state if known-stock debug view should count as observation.
- `resourceStockRuntime` remains owner of live/known stock fields.

Validation:

- Add tests or integration seams proving movement with no water/plant overlay active does not call known-stock reveal.
- Add tests proving active water overlay refreshes only water known stock.
- Add tests proving active plant overlay refreshes only plant known stock.

### 4. Overlay/Cache Invalidation Alignment

Tasks:

- [x] Audit resource discovery and stock event fan-out after Tasks 1-3.
- [x] Ensure world knowledge changes invalidate only overlays that consume world knowledge.
- [x] Ensure known-stock changes invalidate only overlays/readouts for observed stock resources.
- [x] Avoid invalidating water/plant stock overlays when no relevant known-stock write occurred.

Dependencies:

- `src/core/runtimeEventHandlers.js`
- `getResourceContourCacheVersion()`
- `getResourceContourDiscoveryCacheVersion()`
- overlay cache invalidation paths in `main.js`

Validation:

- Existing runtime event handler tests should remain green.
- Add targeted tests if fan-out logic becomes resource-specific.

### 5. Optional Known-Stock Cadence

Tasks:

- [ ] Consider a cooldown or movement-step interval for known-stock refresh after observation gating is in place.
- [ ] Only implement if profiler still shows stock reveal as a meaningful cost.

Design rule:

- Prefer correctness and clear player-facing observation semantics over hidden stale-data complexity.
- Do not add cadence until active-observation gating is measured.

### 6. Scout Possession Reveal Optimization

Tasks:

- [x] Audit bird-possession reveal writes during scout camera follow.
- [x] Replace per-resource scout discovery reveals with one canonical shared world Knowledge Map reveal.
- [x] Keep scout reveal separate from player-local tracks reveal; scout birds must not reveal Tracks Knowledge.
- [x] Gate scout reveals by the shared discovery-grid cell so camera-follow updates do not mutate the map every frame.
- [x] Preserve scout-specific reveal radius by using an explicit reveal-circle radius instead of player movement radius.
- [x] Gate scout known-stock refresh behind the same active observed-stock rules used by movement.
- [x] Reset scout reveal gates when scouting starts, possession starts, or Knowledge Map debug/reset operations invalidate prior gates.

Dependencies:

- `updatePossessedScoutBird()` in `src/main.js` is still the scout possession bridge.
- `playerLocalKnowledgeRevealRuntime` owns canonical reveal batching and grid-cell gating for both player-local movement and scout world-only reveal calls.

Validation:

- Add focused tests proving scout-style reveal writes only the world map, skips Tracks Knowledge, skips repeated same-cell camera-follow updates, and re-runs if the explicit reveal radius changes.
- Run full JS tests after integration because this touches `main.js`, activity/scout behavior, and resource knowledge mutation.

## Non-Goals

- Do not merge tracks into the shared world Knowledge Map.
- Do not make live stock depend on overlays or inspect state.
- Do not make height/slope/wetness use stock grids.
- Do not replace authored static maps with knowledge maps.
- Do not broaden events into mutation commands.

## Validation Checklist

Run focused checks after each implementation slice:

```powershell
node --check src\main.js
node --check src\gameplay\resourceDiscoveryRuntime.js
node --check src\gameplay\resourceStockRuntime.js
node --test tests\resourceDiscoveryRuntime.test.js tests\resourceStockRuntime.test.js
```

Run full JS tests after integration changes:

```powershell
node --test tests\*.test.js
```

Markdown lint currently has unrelated pre-existing failures in `docs/notes.md`; document that if running `npm run lint:md` before those are fixed.
