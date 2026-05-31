# Structures Implementation Plan

## Purpose

This plan covers full implementation of map-space Structures.

Always update this plan when changing Structure data contracts, runtime
ownership, occupancy behavior, rendering, sidecar load/save, commands,
UI/debug tooling, pathing integration, or persistence behavior.

Structures are persistent or semi-persistent stateful map objects such as
campfires, tents, caches, cairns, shelters, drying racks, and buildings. They
can span multiple terrain pixels, have clear placement footprints, and may hide
visual information below them. Structure-to-structure overlap is disallowed.

Structures are not sprite details and are not decals. They may reuse the same
low-level atlas-backed quad rendering path as decals and agents, but their
runtime owner, data model, placement validation, persistence, and gameplay
contracts are separate.

## Dependencies

- Sprite rendering design context:
  `docs/SPRITE_DETAILS_RENDERING_DESIGN.md`
- Existing map lifecycle and sidecar patterns:
  `src/gameplay/mapSidecarLoader.js`
  `src/gameplay/mapDataSaveController.js`
- Existing command ownership rules:
  `src/core/registerMainCommands.js`
  `src/gameplay/interactionCommands.js`
- Existing render pass architecture:
  `src/render/renderPipelineRuntime.js`
  `src/render/frameSwarmRenderRuntime.js`
- Existing overlay/debug UI conventions:
  `docs/RD_UI_ARCHITECTURE.md`
  `docs/UI_LAYOUT_GRID.md`

## Current Status

The first structure slice is implemented and manually smoke-tested.

Implemented:

- optional `assets/<mapName>/structures.json` sidecar load/save
- `structureRuntime` owner with validation, occupancy, placement, removal, state
  updates, render snapshots, and query APIs
- runtime-generated map-sprite atlas from individual `spriteSrc` PNGs
- shared map-sprite atlas generation treats structure sources as whole-image
  sprites unless a render item explicitly provides source-frame crop metadata;
  this preserves the `128x128` tent source while agents can still use `32x32`
  or `64x64` strip frames in the same renderer implementation
- WebGL structure pass after terrain with terrain/point-light lighting
- `RD > Sprites > Structures` controls for render visibility, type selection,
  place-at-player, repeated cursor place mode, nearest selection, removal,
  occupancy overlay, and selected-state readout
- binary green/red footprint placement preview
- local pathfinding and movement blocking for types with `blocksMovement: true`
- focused and full JS test coverage for serializer, runtime, sidecar, commands,
  UI, rendering, movement, and pathfinding integration

Still intentionally future work:

- player-facing structure placement through gameplay actions
- route-planning obstacle projection
- authored-default vs mutable-savegame separation
- container/rest/heat/crafting/event/audio gameplay integrations
- performance profiling with large structure counts

## Phase 0: Scope Lock

- [x] Decide first proof structure type.
  - [ ] Recommended: `cache` if inventory/container integration is next.
  - [ ] Alternative: `campfire` if lighting/rest/event integration is next.
  - [x] Chosen v1 proof: `nomadic_tent` in `assets/map3/structures.json`.
- [x] Decide first structure sprite source location.
  - [x] Reusable structure sprites live under `assets/sprites/structures/default/`.
  - [x] Scoped structure sets can live under `assets/sprites/structures/<mapOrSetName>/`.
  - [x] Artists provide individual PNGs; the runtime can build the atlas.
- [x] Decide initial proof atlas slot size.
  - [x] First proof uses one `128x128` source sprite rendered over `4x4` map pixels.
  - [x] Structure slot size remains per-map/per-sidecar metadata, not hardcoded globally.
- [x] Decide first render order.
  - [x] Recommended v1: terrain -> material detail -> sprite details -> ground decals -> structures -> agents -> UI.
  - [x] Defer shared agent/structure y-sort until tall structures prove the need.
- [x] Decide whether v1 structures block pathfinding.
  - [x] Occupancy grid exists in v1.
  - [x] Local pathfinding and movement blocking are gated per structure type with
    `blocksMovement`.

## Phase 1: Data Contract

- [x] Create `docs/STRUCTURE_DATA_CONTRACT.md`.
  - [x] Define authored sidecar file name: `structures.json`.
  - [x] Define versioned root shape.
  - [x] Define structure type registry shape.
  - [x] Define structure instance shape.
  - [x] Define footprint mask shape.
  - [x] Define visual bounds vs footprint bounds.
  - [x] Define interaction radius or interaction points.
  - [x] Define state payload rules.
  - [x] Define backward-tolerant unknown-field behavior.
- [x] Define minimum v1 sidecar example.
  - [x] Include one structure type.
  - [x] Include one placed structure instance.
  - [x] Include atlas metadata.
- [x] Define ID rules.
  - [x] Stable unique instance IDs.
  - [x] Stable structure type IDs.
  - [x] Type IDs must not depend on atlas slot numbers.
- [x] Define coordinate rules.
  - [x] Use `pixelX` and `pixelY` for current single-map compatibility.
  - [x] Keep contract ready for future `worldX` and `worldY`.
  - [x] Define anchor meaning as footprint origin for v1.
- [x] Define no-overlap rule.
  - [x] Structure footprints cannot overlap occupied structure cells.
  - [x] Visual quads may cover terrain/details/decals.
  - [x] Visual quads may extend beyond footprint bounds.

## Phase 2: Pure Structure Model

- [x] Add `src/gameplay/structureDataSerializer.js`.
  - [x] Export default/empty structure data.
  - [x] Normalize raw `structures.json`.
  - [x] Validate version.
  - [x] Normalize atlas metadata.
  - [x] Normalize type definitions.
  - [x] Normalize instances.
  - [x] Clamp numeric fields.
  - [x] Preserve unknown state fields where safe.
  - [x] Reject duplicate type IDs.
  - [x] Reject duplicate instance IDs.
  - [x] Reject missing type references.
  - [x] Reject invalid footprint masks.
  - [x] Reject configured data caps.
- [x] Add unit tests for serializer.
  - [x] Empty data normalizes.
  - [x] Valid example normalizes.
  - [x] Missing optional fields use defaults.
  - [x] Duplicate IDs fail.
  - [x] Invalid footprint masks fail.
  - [x] Unknown future fields are tolerated where intended.
- [x] Add pure footprint helpers.
  - [x] Convert footprint mask to occupied map cells.
  - [x] Compute visual bounds.
  - [x] Compute footprint bounds.
  - [x] Test anchor/origin behavior.

## Phase 3: Structure Runtime Owner

- [x] Add `src/gameplay/structureRuntime.js`.
  - [x] Own structure type registry.
  - [x] Own structure instance state.
  - [x] Provide `applyStructureData(rawData)`.
  - [x] Provide `serializeStructureData()`.
  - [x] Provide `getStructureSnapshot()`.
  - [x] Provide `getStructureRenderSnapshot()`.
  - [x] Provide `getStructureAtPixel(pixelX, pixelY)`.
  - [x] Provide `canPlaceStructure(typeId, pixelX, pixelY, options)`.
  - [x] Provide `placeStructure(typeId, pixelX, pixelY, state)`.
  - [x] Provide `removeStructure(instanceId)`.
  - [x] Provide `updateStructureState(instanceId, patch)`.
- [x] Keep runtime mutation explicit.
  - [x] Do not mutate from renderer.
  - [x] Do not mutate from event handlers.
  - [x] Commands call structure runtime APIs.
- [x] Snapshot rules.
  - [x] Snapshots must be clone-safe or immutable enough for UI/render reads.
  - [x] Renderer snapshots include only render-relevant fields.
  - [x] Gameplay snapshots include type/state/footprint information.
- [x] Add unit tests for runtime.
  - [x] Apply and serialize round trip.
  - [x] Snapshot isolation.
  - [x] Placement succeeds on empty cells.
  - [x] Placement rejects occupied footprint cells.
  - [x] Removal frees occupancy.
  - [x] State updates are explicit and preserve unknown state keys.

## Phase 4: Occupancy Grid

- [x] Add occupancy grid ownership inside `structureRuntime` or a small helper module.
  - [x] Use a typed array for occupancy.
  - [x] `0` means empty.
  - [x] Non-zero value maps to structure runtime index or compact handle.
- [x] Build occupancy from normalized structures.
  - [x] Rebuild on apply/load.
  - [x] Update on place/remove.
  - [x] Detect overlaps during rebuild.
- [x] Add occupancy query APIs.
  - [x] `isStructureOccupied(pixelX, pixelY)`.
  - [x] `getStructureIdAt(pixelX, pixelY)`.
  - [x] `getOccupiedCells(instanceId)`.
- [x] Add tests.
  - [x] Occupancy indexes match footprint masks.
  - [x] Out-of-bounds footprints are rejected or clipped by explicit rule.
  - [x] Removing a structure clears only its cells.
  - [x] Rebuilding occupancy catches sidecar overlaps.
- [x] Defer pathfinding integration behind a clear follow-up task unless v1 proof requires blocking.

## Phase 5: Render Backend

- [x] Decide shared renderer naming.
  - [x] Recommended: `src/render/mapSpriteRenderer.js` for common atlas-backed quad drawing.
  - [ ] Structure-specific wrapper: `src/render/structureRenderer.js` only if needed.
- [x] Add shader sources for map-space quads.
  - [x] Continuous map-space anchor.
  - [x] Visual width/height in map pixels.
  - [x] Atlas slot lookup.
  - [x] Tint and opacity support.
  - [ ] Optional cardinal rotation support can be deferred.
  - [x] Add renderer resource setup.
  - [x] Program creation.
  - [x] VAO/VBO or instance buffer.
  - [x] Placeholder atlas texture upload.
  - [x] Nearest filtering.
  - [x] Correct source sprite vertical orientation through atlas UV packing.
  - [x] Apply first-pass terrain lighting to structures.
    - [x] Sample terrain normal texture at structure fragment map UV.
    - [x] Sample terrain shadow texture for sun/moon attenuation.
    - [x] Sample point-light texture.
    - [x] Use terrain sun/moon/ambient frame lighting params.
- [x] Add render pass integration.
  - [x] Register structure pass after main terrain.
  - [x] Ensure alpha blending state is set and restored intentionally.
  - [x] Draw only when terrain is shown.
- [x] Add render snapshot consumption.
  - [x] Structure runtime produces compact render list.
  - [x] Renderer does not know gameplay state.
  - [ ] Renderer does not allocate per structure every frame where avoidable.
- [x] Add focused render unit tests where practical.
  - [x] Buffer packing contains expected instance attributes.
  - [x] Empty render list skips draw.
  - [x] Atlas slot math is deterministic.

## Phase 6: Atlas And Assets

- [x] Add default structure sprite folder.
  - [x] Create `assets/sprites/structures/default/`.
  - [x] Keep the folder tracked with `.gitkeep` until real art is committed.
- [x] Add runtime atlas generation from individual source PNGs.
  - [x] Use per-type `spriteSrc` paths.
  - [x] Draw source images into fixed atlas slots.
  - [x] Use nearest filtering by default.
  - [x] Preserve whole-source image packing for structures that do not provide
    explicit source-frame crop metadata.
- [x] Add default structure metadata.
  - [x] Define slot IDs.
  - [x] Define type-to-sprite mapping.
  - [x] Point map3 proof type at `assets/sprites/structures/default/nomadic_tent_01.png`.
- [x] Add graceful fallback behavior.
  - [x] Missing atlas uses placeholder texture.
  - [x] Missing structure sidecar means no structures.
  - [ ] Invalid sidecar surfaces a visible startup/map-load error if it should block.
- [x] Decide whether default atlas lives globally or map-locally.
  - [x] V1 uses individual global/default sprite sources and a runtime-generated atlas.
  - [x] Map-local/scoped source folders can be referenced by `structures.json` through `spriteSrc`.

## Phase 7: Map Sidecar Load And Save

- [x] Extend `mapSidecarLoader`.
  - [x] Load optional `structures.json` from URL maps.
  - [x] Load optional `structures.json` from selected folder files.
  - [x] Apply through `structureRuntime.applyStructureData`.
  - [x] Missing sidecar applies empty structure data.
  - [ ] Invalid sidecar errors should be visible on title/map-load status if blocking.
- [x] Extend `mapDataSaveController`.
  - [x] Include `structures.json` in `Save All` only if we decide authored defaults should save through map data.
  - [ ] Consider a separate save action if mutable run structures should not overwrite authored defaults.
- [x] Add tests.
  - [x] Save All includes or intentionally excludes `structures.json` per decision.
  - [x] Missing structures sidecar is tolerated.
  - [x] File-folder loading applies structures.
- [x] Update `AI_CONTEXT.md` if sidecar behavior is implemented.

## Phase 8: Commands

- [x] Register structure commands in command routing.
  - [x] `structure/place`.
  - [x] `structure/remove`.
  - [x] `structure/updateState`.
  - [ ] `structure/select` if selection is part of v1.
- [x] Command rules.
  - [x] Commands validate inputs.
  - [x] Commands call structure runtime mutation APIs.
  - [x] Commands return or surface failure reason where practical.
  - [x] Events remain post-change refresh/invalidation only.
- [x] Add command tests.
  - [x] Place command forwards valid placement and reports success.
  - [x] Place command reports invalid placement without redraw.
  - [x] Remove command routes through structure runtime and reports status.
  - [x] Update command routes through structure runtime and reports status.

## Phase 9: Interaction And Selection

- [x] Decide v1 interaction surface.
  - [x] Debug-only placement through RD.
  - [x] Terrain-click placement mode.
  - [ ] Local activity menu action.
- [x] Recommended v1.
  - [x] RD debug placement/removal first.
  - [x] Defer player-facing placement until structure gameplay is defined.
- [x] Add selection support if needed.
  - [x] Use nearest-by-type query for first debug selection.
  - [x] Store selected structure ID in UI owner, not structure runtime.
  - [x] Draw selection gizmo through overlay canvas, not structure renderer.
- [x] Add placement preview if terrain-click placement is included.
  - [x] Show footprint validity.
  - [x] Green valid, red invalid.
  - [x] Keep place mode and cursor preview active after successful placement for repeated authoring.
  - [x] Do not resize fixed HUD/side panels for placement details.
  - [x] V1 uses binary works/does-not-work feedback.
  - [ ] Future player-skill levels can expose richer per-cell reasons in the overlay/report.
- [x] Add tests for interaction helpers where practical.

## Phase 10: RD Debug UI

- [x] Add RD panel controls in the appropriate tab.
  - [x] Use `RD > Sprites > Structures` for first debug controls.
  - [x] Keep panel content compact per `docs/UI_LAYOUT_GRID.md`.
- [x] Controls.
  - [x] Toggle structure render visibility.
  - [x] Select proof structure type.
  - [x] Place at player.
  - [x] Place mode with cursor footprint preview.
  - [x] Select nearest by selected type.
  - [x] Remove selected.
  - [x] Show occupancy debug overlay.
  - [x] Show selected structure state.
- [x] UI ownership.
  - [x] UI dispatches commands.
  - [x] UI reflects structure runtime snapshots.
  - [x] UI does not mutate structure data directly.
- [x] Add UI tests if adding standalone runtime helpers.

## Phase 11: Gameplay Integration Hooks

- [ ] Define structure capability tags.
  - [ ] `container`.
  - [ ] `rest`.
  - [ ] `heat`.
  - [ ] `crafting`.
  - [ ] `ritual`.
  - [ ] `blocksMovement`.
- [x] Add minimal query APIs.
  - [x] `getStructuresNear(pixelX, pixelY, radiusPx)`.
  - [x] `getStructuresByCapability(capability)`.
  - [x] `getNearestStructureByType(typeId, pixelX, pixelY)`.
- [ ] Defer deep integrations until needed.
  - [ ] Inventory/container runtime integration.
  - [ ] Rest/campfire effects.
  - [x] Pathfinding blocking.
  - [ ] Event triggers.
  - [ ] Audio/lighting coupling.
- [x] Add tests for query APIs.

## Phase 12: Pathfinding Integration

- [x] Decide whether v1 blocks movement.
  - [x] V1 supports type-gated blocking through `blocksMovement`.
  - [x] Add pathfinding cost/block integration.
- [x] If blocking is enabled.
  - [x] Structure runtime exposes `isMovementBlocked(pixelX, pixelY)`.
  - [x] Structure runtime exposes bounded blocked-cell queries for local Dijkstra windows.
  - [x] Pathfinding preview/runtime writes structure obstacles into the local Dijkstra field.
  - [x] RD Pathing exposes structure and terrain diagonal corner-cutting toggles.
  - [ ] Route planning either ignores structures or receives a low-res obstacle projection.
  - [x] Movement execution validates target cells against current occupancy.
- [x] Add tests.
  - [x] Local pathfinding avoids blocking structures.
  - [x] Movement fails or reroutes when target becomes blocked.
  - [x] Non-blocking structures do not affect paths.

## Phase 13: Persistence Strategy

- [ ] Separate authored defaults from mutable run state.
  - [ ] `structures.json` as map/scenario defaults.
  - [ ] Future savegame state for player-built, damaged, moved, or removed structures.
- [x] Decide v1 persistence behavior.
  - [x] Authored-only structures loaded from sidecar.
  - [x] Save All writes current structures back as map data for now.
  - [ ] Or RD changes are debug/runtime-only until savegame architecture exists.
- [x] Document decision in `AI_CONTEXT.md`.
- [x] Add serialization tests matching the chosen behavior.

## Phase 14: Performance And Limits

- [x] Define initial caps.
  - [x] Maximum structure types per map.
  - [x] Maximum structure instances per map.
  - [x] Maximum footprint dimensions.
  - [x] Maximum visual sprite dimensions in map pixels.
- [x] Recommended initial caps.
  - [x] Structure types: `256`.
  - [x] Instances: `4096` or lower if UI/debug only.
  - [x] Footprint dimensions: `64x64` max.
  - [x] Visual dimensions: `128x128` map pixels max.
- [x] Add validation for caps.
- [ ] Add performance smoke scenario with many structures.
- [ ] Profile render pass timing if many structures are visible.

## Phase 15: Documentation

- [x] Update `docs/SPRITE_DETAILS_RENDERING_DESIGN.md` if implementation choices differ from planning.
- [x] Add `docs/STRUCTURE_DATA_CONTRACT.md`.
- [x] Update `AI_CONTEXT.md`.
  - [x] New structure owner module.
  - [x] New sidecar behavior.
  - [x] Render order.
  - [x] Structure occupancy/pathing behavior.
  - [x] Save/load behavior.
- [x] Update `README.md` only if run steps or asset requirements change.
- [x] Document required asset files if default maps use structures.

## Phase 16: Validation

- [x] Run focused JS syntax checks.
  - [x] `node --check src\gameplay\structureDataSerializer.js`
  - [x] `node --check src\gameplay\structureRuntime.js`
  - [x] `node --check src\render\mapSpriteRenderer.js`
  - [ ] `node --check src\render\structureRenderer.js` if created.
- [x] Run focused tests.
  - [x] `node --test tests\structureDataSerializer.test.js`
  - [x] `node --test tests\structureRuntime.test.js`
  - [x] `node --test tests\mapDataSaveController.test.js`
  - [x] `node --test tests\mapSidecarLoader.test.js` if added.
- [x] Run broader tests after integration.
  - [x] `node --test tests\*.test.js`
- [x] Run docs lint.
  - [x] `npm run lint:md`
- [x] Manual smoke test.
  - [x] Load default map.
  - [x] Confirm missing `structures.json` is harmless.
  - [x] Confirm proof structure renders.
  - [x] Confirm occupancy debug matches footprint.
  - [x] Confirm placement rejects overlap.
  - [x] Confirm save/load behavior matches the chosen persistence strategy.

## Suggested Implementation Order

- [x] Phase 1: data contract.
- [x] Phase 2: serializer and pure tests.
- [x] Phase 3: runtime owner and tests.
- [x] Phase 4: occupancy grid and tests.
- [x] Phase 5: renderer proof with hardcoded render snapshot.
- [x] Phase 6: atlas/assets fallback.
- [x] Phase 7: sidecar load/save.
- [x] Phase 8: commands.
- [x] Phase 10: RD debug controls.
- [x] Phase 9: interaction/selection if needed.
- [x] Phase 11: gameplay query hooks.
- [x] Phase 12: pathfinding integration only when explicitly needed.
- [ ] Phase 13: persistence strategy before player-built structures.
- [x] Phase 15: documentation updates.
- [x] Phase 16: validation.
