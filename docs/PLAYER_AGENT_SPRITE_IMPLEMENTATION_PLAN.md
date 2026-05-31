# Player/Agent Sprite Implementation Plan

## Purpose

This plan covers the first implementation slice for player and agent sprite
rendering.

Always update this plan when changing player/agent sprite data contracts,
render snapshots, render passes, atlas assets, interpolation behavior,
height-based visuals, RD controls, swarm/animal visual integration, player
visual integration, or validation coverage.

Agents are stateful moving entities owned by gameplay or simulation runtimes:
the player, NPCs, ground animals, birds, hawks, and later other creatures.
They are not sprite details, decals, or structures. They may reuse the same
low-level atlas-backed map-space quad renderer as structures, but their owner
runtimes and gameplay truth remain separate.

The first goal is visual replacement/addition, not gameplay rewrite:

- preserve existing authoritative player movement and swarm simulation
- feed sprite render data from owner runtimes
- keep smooth render positions continuous
- use height for flying-agent visual scale
- avoid deriving gameplay truth from rendered sprites

## Dependencies

- Sprite rendering design context:
  `docs/SPRITE_DETAILS_RENDERING_DESIGN.md`
- Current structure sprite renderer precedent:
  `src/render/mapSpriteRenderer.js`
  `src/render/passes/structurePass.js`
  `docs/STRUCTURES_IMPLEMENTATION_PLAN.md`
- Existing player/movement/activity ownership:
  `src/gameplay/movementSystem.js`
  `src/gameplay/playerActivityRuntime.js`
  `src/gameplay/playerTravelActivityRuntime.js`
  `src/gameplay/playerRuntimeBinding.js`
  `src/core/state.js`
- Existing swarm ownership and interpolation:
  `src/gameplay/swarmGameplayRuntime.js`
  `src/gameplay/swarmRenderSetupRuntime.js`
  `src/gameplay/swarmInterpolation.js`
  `src/gameplay/swarmLoopRuntime.js`
  `src/render/swarmLitRenderer.js`
- Render pipeline integration:
  `src/render/renderPipelineRuntime.js`
  `src/render/renderer.js`
  `src/app/renderShellAssemblyRuntime.js`
- RD/debug UI conventions:
  `docs/RD_UI_ARCHITECTURE.md`
  `docs/UI_LAYOUT_GRID.md`
  `src/ui/rd/panels/agentsPanelHtml.js`

## Current Status

Implementation has started with the pure shared model layer and renderer
coverage needed before runtime integration.

Already available foundation:

- `mapSpriteRenderer` can draw atlas-backed map-space quads and is proven by
  Structures.
- Structure rendering has validated atlas generation from individual PNGs,
  source-image orientation, nearest filtering, binary alpha cutouts, and lightweight
  terrain lighting.
- Swarm simulation already owns continuous `x/y/z` state for birds and hawks.
- Swarm interpolation already exposes smoothed render positions through
  `writeInterpolatedSwarmAgentPos()` and `writeInterpolatedSwarmHawkPos()`.
- Existing lit/unlit swarm square rendering provides a known fallback visual
  while sprite agents are developed.

Implemented in this slice:

- `src/gameplay/agentSpriteModel.js` normalizes sprite definitions, resolves
  cardinal/8-way direction indices, clamps height-derived scale, resolves
  velocity-based rotation, resolves pivoted visual bounds, and builds
  renderer-compatible render items.
- `tests/agentSpriteModel.test.js` covers direction, fallback direction, height
  scale, visual bounds, and gameplay-neutral render item shape.
- `tests/mapSpriteRenderer.test.js` now explicitly covers fractional map-space
  coordinates for map-sprite quads.
- `src/gameplay/playerSpriteRuntime.js` produces the first player sprite render
  snapshot and tracks player facing from movement-step notifications. Authored
  player sprite colors render untinted; the old overlay player dot is only a
  fallback when the player sprite visibility toggle is off.
- `src/gameplay/swarmAgentSpriteRuntime.js` produces bird/hawk sprite render
  snapshots from existing swarm state and interpolation callbacks. Birds and
  hawks use their simulation velocity vector to rotate one sprite slot instead
  of consuming directional atlas slots.
- Bird sprites support render-time keyframe animation from a horizontal sprite
  strip. The frame count is metadata-driven, not hardcoded; render snapshots
  choose `spriteSlot + animationFrameIndex`, and the atlas builder expands all
  strip frames into consecutive fixed-grid slots. Swarm snapshots grow atlas
  rows when a large frame count would exceed the default `16` columns.
- Directional agent sprites reserve the full directional source span in render
  items (`directionCount * frameCount`) so changing direction does not point at
  an unpacked atlas slot during async atlas rebuilds. If a source PNG has only
  one authored frame, that frame is repeated into each reserved direction slot.
- Agent sprite snapshots now receive the render frame time from the render pass,
  so render-time animation advances independently from game-time speed.
- Map-sprite rendering treats sprite alpha as binary cutout: alpha `0` discards
  the fragment, any non-zero alpha renders fully opaque after lighting.
- Bird source sprites may use exact white (`#ffffff`) as an authored background
  instead of an alpha channel. During atlas construction, matching white pixels
  are converted to alpha `0` with tolerance `0`; this is source-import behavior,
  not a shader branch.
- `src/render/passes/agentSpritePass.js` draws the combined agent snapshot after
  Structures through the shared `mapSpriteRenderer`.
- `src/render/renderer.js` now executes optional `agentSprites` after
  `structures`, preserving the planned category order.
- `src/main.js` wires player and swarm sprite snapshots into the render
  pipeline. Swarm sprites and legacy square rendering are now mutually
  exclusive through shared RD controls.
- `RD > Agents > Swarm` and `RD > Sprites > Agents` expose the same swarm
  sprite-mode toggle. When swarm sprite mode is on, lit and unlit swarm square
  render paths are suppressed.
- `RD > Sprites > Agents` exposes a player sprite visibility toggle for the
  first debug slice. The same toggle gates the legacy 2D overlay player marker
  so the marker does not cover the authored player sprite.
- `assets/sprites/agents/default/` exists as the default source-art folder.
- Agent sprite definitions now load from owner-scoped JSON files using one
  shared schema:
  `assets/data/agents/player_sprites.json` for player visuals and
  `assets/data/agents/swarm_sprites.json` for bird/hawk visuals.
- The current player sprite contract is a single `64x64` source image:
  `slotWidth: 64`, `slotHeight: 64`, `directionCount: 1`, `frameCount: 1`.
  This is source-art resolution only; gameplay footprint remains separate from
  visual source dimensions.
- Agent render items carry explicit `sourceSlotWidth`/`sourceSlotHeight` so the
  shared atlas builder can crop animated strips correctly even when the combined
  runtime atlas uses a larger slot size. These fields are opt-in source-crop
  metadata; structure sprites without them still consume the whole authored PNG.
- Player readability needs separate treatment from gameplay footprint and art:
  the current documented options are ground halo/shadow, outline/stroke,
  modest visual scale increase, player lighting bias, stronger sprite
  color/value rules, and low-zoom UI markers.
- Browser-served sprite PNG URLs are cache-busted during image loading so
  replacing source art under `assets/sprites/agents/default/` is visible after a
  reload.

Not implemented yet:

- detailed per-type sprite-agent visibility/debugging

## Phase 0: Scope Lock

- [x] Decide first visible proof target.
  - [ ] Option A: player sprite first.
  - [ ] Option B: birds/hawks first.
  - [x] Option C: player plus birds/hawks in one shared pass.
  - [x] Recommended v1: player plus birds/hawks in one shared agent pass, with
    visibility toggles so fallback point rendering can stay available.
- [x] Decide first sprite art source.
  - [x] Use individual PNGs under `assets/sprites/agents/default/`.
  - [ ] Add separate subfolders for scoped sets:
    `assets/sprites/agents/<mapOrSetName>/`.
  - [ ] Use placeholder generated atlas if PNGs are missing.
- [x] Decide first slot size.
  - [x] Recommended v1 started as `32x32` source slots.
  - [x] Player now uses a `64x64` source slot for more authored detail.
  - [x] Birds and hawks keep `32x32` source slots.
  - [x] The combined runtime atlas uses the maximum active source slot size so
    mixed player/swarm source sizes can share one pass.
  - [x] Preserve mixed source-size rendering by treating `sourceSlotWidth` and
    `sourceSlotHeight` as explicit agent crop metadata only; non-agent
    structure PNGs without these fields are not implicitly cropped to `32x32`.
- [x] Decide first render order.
  - [x] Terrain.
  - [x] Material detail.
  - [x] Sprite details.
  - [x] Runtime ground decals.
  - [x] Structures.
  - [x] Ground agents.
  - [x] Flying agents.
  - [x] UI overlays.
- [x] Decide first direction model.
  - [x] Recommended v1: cardinal or 8-way direction index selected CPU-side.
  - [x] Swarm birds/hawks now use free velocity rotation because readability
    requires their flight direction to match simulation movement.
  - [ ] Keep player/NPC direction policy separate until their art/readability is
    evaluated.
- [x] Decide first height model.
  - [x] Recommended v1: modest scale from `1.0x` to `1.5x` or `1.6x` based on
    normalized `z`.
  - [x] Defer projected ground shadows until base sprites read well.

## Phase 1: Data Contract

- [ ] Create `docs/AGENT_SPRITE_DATA_CONTRACT.md` if implementation needs a
  standalone contract.
  - [x] Define global/shared file names.
  - [ ] Define optional map-local override behavior.
  - [x] Define atlas metadata.
  - [x] Define sprite type IDs.
  - [x] Define direction/frame metadata.
  - [x] Define owner-to-sprite mapping.
  - [x] Define height-scale metadata.
  - [ ] Define fallback behavior for missing assets.
- [x] Decide first asset source layout.
  - [x] `assets/sprites/agents/default/player.png`.
  - [x] `assets/sprites/agents/default/bird.png`.
  - [x] `assets/sprites/agents/default/hawk.png`.
  - [ ] Future directional variants can use suffixes or metadata.
- [ ] Define ID rules.
  - [ ] Stable sprite IDs independent from atlas slot numbers.
  - [ ] Gameplay agent IDs remain owned by player/swarm/NPC runtimes.
  - [ ] Render sprite IDs do not become gameplay IDs.
- [ ] Define coordinate rules.
  - [ ] Render positions are continuous map coordinates.
  - [ ] Player gameplay position can remain grid/path-step based.
  - [ ] Swarm gameplay positions remain simulation-owned.
  - [ ] Render snapshots may include interpolated positions.
- [ ] Define footprint rules.
  - [ ] Separate gameplay footprint from render footprint.
  - [ ] Renderer only consumes visual bounds, pivot, scale, and atlas data.
  - [ ] Pathfinding/collision must not read sprite visual bounds.

## Phase 2: Shared Agent Sprite Model

- [x] Add a pure helper module if needed, for example
  `src/gameplay/agentSpriteModel.js`.
  - [x] Normalize agent sprite definitions.
  - [x] Resolve direction index from velocity or facing vector.
  - [x] Resolve optional velocity-based rotation from source-sprite forward
    orientation.
  - [x] Resolve height scale from `z`.
  - [x] Resolve visual bounds from anchor/pivot/scale.
  - [x] Build compact render items compatible with `mapSpriteRenderer`.
- [x] Add tests.
  - [x] Direction quantization is deterministic.
  - [x] Rotation from velocity is deterministic.
  - [x] Height scale clamps.
  - [x] Missing velocity keeps previous/default direction.
  - [x] Visual bounds respect pivot and scale.
  - [x] Render item shape stays renderer-owned and gameplay-neutral.

## Phase 3: Player Render Snapshot

- [x] Decide owner boundary for player visual state.
  - [x] Prefer a small player sprite runtime/binding over adding state paths to
    `main.js`.
  - [x] Player movement/gameplay state remains authoritative elsewhere.
- [x] Add player sprite snapshot producer.
  - [x] Current map position.
  - [ ] Optional smoothed/interpolated render position.
  - [x] Current facing/direction.
  - [x] Sprite ID/slot.
  - [x] Visual width/height in map pixels.
  - [x] Pivot/offset.
  - [x] Opacity/tint/debug state.
- [x] Decide first player interpolation.
  - [ ] If movement queue exposes enough lifecycle data, render between previous
    and current path-step positions.
  - [x] Otherwise v1 may draw player at current gameplay pixel and defer
    interpolation.
- [x] Add tests.
  - [x] Player snapshot is clone-safe.
  - [x] Direction follows movement deltas where available.
  - [x] Snapshot does not mutate player gameplay state.

## Phase 4: Swarm Agent Render Snapshot

- [x] Add sprite render snapshot for birds.
  - [x] Use `writeInterpolatedSwarmAgentPos()` for render `x/y/z`.
  - [x] Use velocity for render rotation.
  - [x] Select render-time animation frame from metadata.
  - [x] Support arbitrary bird frame counts, with stable per-agent phase.
  - [x] Load bird sprite metadata from
    `assets/data/agents/swarm_sprites.json`.
  - [x] Use height-derived scale.
  - [x] Skip dead/removed agents through existing count/ID rules.
- [x] Add sprite render snapshot for hawks.
  - [x] Use `writeInterpolatedSwarmHawkPos()` for render `x/y/z`.
  - [x] Use hawk velocity for render rotation.
  - [x] Load hawk sprite metadata from
    `assets/data/agents/swarm_sprites.json`.
  - [x] Use height-derived scale.
- [x] Preserve authoritative swarm state.
  - [x] Do not change simulation coordinates for visual readability.
  - [x] Do not change scout possession validity or targeting to use render
    sprites.
  - [x] Do not infer gameplay from sprite scale.
- [x] Add tests.
  - [x] Bird sprite snapshots use interpolated positions.
  - [x] Hawk sprite snapshots use interpolated positions.
  - [x] Height scale differs for low/high `z`.
  - [ ] Stable swarm IDs prevent interpolation across remove-swap changes.

## Phase 5: Renderer Backend

- [ ] Decide whether to extend `mapSpriteRenderer` or add an agent-specific
  wrapper.
  - [ ] Recommended: reuse/extend `mapSpriteRenderer` for generic map-space
    sprite items.
- [x] Add `src/render/passes/agentSpritePass.js` as the category-specific
    render pass.
- [x] Extend render item support if needed.
  - [x] Continuous `pixelX/pixelY`.
  - [x] Visual width/height from scale.
  - [x] Pivot/offset.
  - [x] Optional per-item rotation around the render origin.
  - [x] Sprite slot.
  - [x] Animation frame index.
  - [x] Tint.
  - [x] Binary alpha cutout; no semi-transparent sprite opacity.
  - [x] Optional render layer: ground or flying.
  - [ ] Optional sort key.
- [x] Decide lighting path.
  - [x] Reuse first-pass terrain normal/shadow/point-light lighting from
    structures.
  - [x] Keep flying-agent lighting readable even when terrain normal is not a
    perfect semantic match.
  - [x] Defer true airborne lighting/shadow model.
- [x] Add tests.
  - [x] Vertex packing handles fractional map coordinates.
  - [x] Vertex packing handles scale and pivot.
  - [x] Vertex packing handles rotation.
  - [x] Empty render list skips draw.
  - [x] Atlas slot math remains deterministic.
  - [x] Rotated quad vertex positions stay deterministic.

## Phase 6: Atlas And Assets

- [x] Add default agent sprite folder.
  - [x] Create `assets/sprites/agents/default/`.
  - [x] Track folder with `.gitkeep` until real art exists.
- [ ] Add first placeholder or authored sprites.
  - [ ] Player placeholder.
  - [ ] Bird placeholder.
  - [ ] Hawk placeholder.
- [x] Add runtime atlas generation or shared atlas loader.
  - [x] Reuse structure atlas generation where practical.
  - [x] Use nearest filtering.
  - [x] Keep source PNGs in normal orientation.
  - [x] Expand horizontal sprite strips into consecutive atlas slots when
    `sourceFrameCount > 1`.
  - [x] Expand directional source spans into consecutive atlas slots so player
    direction changes do not flicker while atlas loading/repacking is async.
  - [x] Repeat a too-small single-frame image across animated slots instead of
    cropping it into unusable slivers.
  - [x] Apply optional exact transparent-color keying during atlas construction.
  - [x] Flip atlas V coordinates in vertex packing if needed, not in source
    files.
  - [x] Combined player/swarm snapshot preserves the maximum atlas row count
    requested by owner snapshots.
- [ ] Add fallback behavior.
  - [ ] Missing sprite source uses generated placeholder slot.
  - [ ] Missing optional metadata uses defaults.
  - [ ] Invalid metadata surfaces a visible load/status error if blocking.
- [x] Avoid stale browser image caches for source PNG edits.
  - [x] Browser-served image URLs receive a cache-busting query token.
  - [x] `file:`, `asset:`, `blob:`, and `data:` image URLs are left unchanged.

## Phase 7: Render Pass Integration

- [x] Add agent sprite render pass.
  - [x] Register after structures for ground agents.
  - [x] Support or split flying agents after ground agents.
  - [x] Set and restore alpha blending intentionally.
  - [x] Keep sprite output alpha binary even while blending is enabled.
  - [x] Draw only when terrain/map is visible.
- [x] Keep existing swarm point/lit renderer available while sprite pass is
  developed.
  - [x] RD toggle can choose point/lit fallback vs sprite agents.
  - [x] Avoid deleting fallback until sprite readability is proven.
- [x] Wire render-shell dependencies.
  - [x] Player sprite snapshot provider.
  - [x] Swarm sprite snapshot provider.
  - [ ] Atlas/image load lifecycle.
  - [x] Visibility toggles.
- [x] Add tests where practical.
  - [x] Pass skips renderer when visibility is disabled.
  - [x] Pass submits combined player/bird/hawk snapshot when visible.
  - [x] Render order runs Structures before agent sprites.

## Phase 8: RD Debug UI

- [x] Add controls under `RD > Agents`.
  - [x] Shared swarm square-vs-sprite mode toggle under
    `RD > Agents > Swarm`.
  - [ ] Global sprite agent visibility toggle.
  - [x] Player sprite visibility toggle under `RD > Sprites > Agents`.
  - [ ] Bird sprite visibility toggle.
  - [ ] Hawk sprite visibility toggle.
  - [x] Fallback point/lit swarm visibility is selected by disabling swarm
    sprite mode.
  - [ ] Height scale max slider.
  - [ ] Direction debug readout.
  - [ ] Render count readout.
- [x] Add mirrored controls under `RD > Sprites > Agents`.
  - [x] Shared swarm square-vs-sprite mode toggle.
  - [x] Player sprite visibility toggle.
  - [x] Player sprite visibility suppresses the legacy overlay marker so only
    one player visual path draws.
- [ ] Keep panel compact.
  - [ ] Do not resize fixed side panel slots.
  - [ ] Use existing `RD > Agents` subpanel structure.
- [ ] Add UI tests if a standalone runtime helper is introduced.

## Phase 9: Player Gameplay Integration Boundaries

- [x] Verify player sprite rendering does not alter movement at the ownership
  boundary.
  - [x] Pathfinding still owns movement target/path.
  - [x] Movement system still owns queued step execution.
  - [x] Activity runtimes still own activity lifecycle.
- [ ] Decide player facing source.
  - [ ] Last movement direction.
  - [ ] Current path segment direction.
  - [ ] Cursor/focus direction for future interactions.
  - [ ] Idle default.
- [ ] Decide how selection/inspection treats player sprite.
  - [ ] Rendering alone should not add click targets.
  - [ ] Future click/hover affordances must route through gameplay/UI owners.

## Phase 10: Swarm/Scout Integration Boundaries

- [ ] Verify scout possession uses authoritative swarm state.
  - [ ] Possession validity remains based on stable agent IDs and simulation
    position.
  - [ ] Discovery reveal remains based on authoritative or explicitly intended
    possession position, not visual sprite bounds.
  - [ ] Camera follow continues to use existing smoothing unless explicitly
    changed.
- [ ] Verify hunting logic does not read sprite render data.
  - [ ] Hunting availability remains trail/grid based.
  - [ ] Kill/removal remains swarm-runtime based.
  - [ ] Sprite pass updates visually after existing runtime changes.

## Phase 11: Ordering And Sorting

- [x] Implement first simple ordering.
  - [x] Structures before agents.
  - [x] Ground agents before flying agents.
  - [x] UI overlays last.
- [ ] Decide if per-agent sort is needed in v1.
  - [ ] If all sprites are small, category order is enough.
  - [ ] If tall agents/structures overlap badly, add y-sort later.
- [ ] Add future y-sort notes.
  - [ ] Shared ground-agent/structure y-sort may be needed for tall objects.
  - [ ] Flying agents can remain a separate later pass.

## Phase 12: Performance And Limits

- [ ] Define initial render caps.
  - [ ] Player: 1.
  - [ ] Birds: current swarm count.
  - [ ] Hawks: current hawk count.
  - [ ] Future NPC/animals: separate caps.
- [ ] Avoid per-frame allocations where practical.
  - [ ] Reuse render item arrays or typed buffers.
  - [ ] Reuse scratch objects for interpolated positions.
  - [ ] Avoid per-agent object creation in hot render paths if count is high.
- [x] Avoid per-frame atlas rebuilds for animation frame changes by collecting
  every frame from an animated source strip into the atlas key.
- [x] Avoid movement-direction flicker by collecting every directional source
  slot into the atlas key, not only the currently selected direction slot.
- [ ] Profile before removing existing point renderer.
  - [ ] Compare point/lit rendering vs sprite quad rendering.
  - [ ] Track cost at normal and high swarm counts.
  - [ ] Add render-count debug readout.

## Phase 12A: Player Readability

- [x] Document readability options.
  - [x] Ground halo or selection shadow.
  - [x] Sprite outline or stroke.
  - [x] Slight visual scale increase independent from gameplay footprint.
  - [x] Player lighting bias or minimum brightness.
  - [x] Color/value art direction rule.
  - [x] Low-zoom UI marker.
- [ ] Implement first readability aid.
  - [ ] Recommended: player-only ground halo/shadow.
  - [ ] Consider `visualWidthPx`/`visualHeightPx: 1.25` after halo test.
  - [ ] Keep authored player sprite untinted.

## Phase 13: Documentation

- [ ] Update `AI_CONTEXT.md`.
  - [x] Add this implementation plan as the required progress tracker.
  - [x] Add first pure agent sprite model helper.
  - [x] Add render order after implementation exists.
  - [x] Add RD swarm sprite-mode control behavior.
  - [x] Add asset folder/metadata contract after implementation exists.
- [x] Update `docs/SPRITE_DETAILS_RENDERING_DESIGN.md` if implementation
  choices differ from the Agents section.
- [ ] Add `docs/AGENT_SPRITE_DATA_CONTRACT.md` if a data contract file is
  created.
- [ ] Update `README.md` only if asset requirements or run steps change.

## Phase 14: Validation

- [ ] Run focused JS syntax checks.
  - [x] `node --check src\gameplay\agentSpriteDefinitionRegistry.js` if
    changed.
  - [x] `node --check src\gameplay\agentSpriteModel.js` if created.
  - [x] `node --check src\gameplay\playerSpriteRuntime.js` if created.
  - [x] `node --check src\gameplay\swarmAgentSpriteRuntime.js` if created.
  - [x] `node --check src\render\passes\agentSpritePass.js` if created.
  - [x] `node --check src\render\mapSpriteRenderer.js` if changed.
  - [x] `node --check src\render\renderPipelineRuntime.js` if changed.
  - [x] `node --check src\main.js` if integration wiring changes.
  - [x] `node --check src\render\frameSwarmRenderRuntime.js` if swarm render
    gating changes.
  - [x] `node --check src\ui\overlays\drawOverlay.js` if player overlay marker
    gating changes.
  - [x] `node --check src\render\renderSupportRuntime.js` if image loading
    changes.
- [ ] Run focused tests.
  - [x] Agent sprite definition registry tests.
  - [x] Agent sprite model tests.
  - [x] Map sprite renderer tests.
  - [x] Player sprite snapshot tests.
  - [x] Swarm sprite snapshot tests.
  - [x] Agent sprite pass tests.
  - [x] Renderer pass-order tests.
  - [x] Frame swarm render gating tests.
  - [x] Render support image cache-busting tests.
- [ ] Run broader tests after integration.
  - [x] `node --test tests\*.test.js`
- [x] Run docs lint.
  - [x] `npm run lint:md`
- [ ] Manual smoke test.
  - [ ] Load default map.
  - [ ] Confirm player sprite renders.
  - [ ] Confirm player sprite toggle switches between authored sprite and
    legacy overlay marker.
  - [ ] Confirm player movement still works.
  - [ ] Confirm player sprite does not affect pathfinding.
  - [ ] Confirm birds render as sprites.
  - [ ] Confirm hawks render as sprites.
  - [ ] Confirm flying height scale reads clearly.
  - [ ] Confirm scout possession/camera still works.
  - [ ] Confirm hunting still works.
  - [ ] Confirm structures still render below agents.

## Suggested Implementation Order

- [ ] Phase 1: data contract or minimal in-code defaults.
- [ ] Phase 2: pure model helpers and tests.
- [ ] Phase 5: renderer backend extension tests.
- [ ] Phase 3: player render snapshot.
- [ ] Phase 4: swarm render snapshots.
- [ ] Phase 6: atlas/assets fallback.
- [ ] Phase 7: render pass integration.
- [ ] Phase 8: RD debug controls.
- [ ] Phase 9: player gameplay boundary validation.
- [ ] Phase 10: swarm/scout boundary validation.
- [ ] Phase 11: ordering/sorting validation.
- [ ] Phase 12: performance review.
- [ ] Phase 13: documentation updates.
- [ ] Phase 14: validation.
