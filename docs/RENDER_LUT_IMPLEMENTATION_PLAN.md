# Render LUT Implementation Plan

## Purpose

This is the progress tracker for reusable render LUT work.

Always update this file when changing LUT data contracts, LUT registry behavior,
sprite palette references, LUT atlas upload, LUT shader sampling, RD LUT UI,
map-local LUT behavior, or validation coverage.

Design context:

```txt
docs/RENDER_LUT_DESIGN.md
```

## Current Decisions

- LUTs are reusable render data, not bird-specific data.
- The first supported LUT type is `grayscale-ramp`.
- One LUT is conceptually 1D: grayscale `0..255` to RGB.
- The runtime LUT atlas is `256xN`, where each row is one 1D LUT.
- Shared LUT definitions live in `assets/data/render_luts.json`.
- Sprite definitions reference LUTs by `palette.lutRefs`; they do not embed
  color stops.
- LUT refs support explicit IDs and fixed two-digit variant ranges.
- Variant IDs use `<family>.variant.<nn>`, for example
  `animal.bird.dark.variant.00`.
- Two-digit variants cap one generated family at `00..99`.
- Generated variant families can derive from an explicit base LUT through
  `baseLutId`; inline variant stops remain backward-tolerant fallback input.
- Variant family defaults to the selected explicit LUT ID.
- LUT recoloring happens before existing sprite terrain lighting.
- LUT rows are presentation data only and do not affect gameplay truth.

## Implemented

- [x] Add `assets/data/render_luts.json`.
- [x] Add `src/render/renderLutRegistry.js`.
- [x] Normalize grayscale ramp color stops.
- [x] Interpolate stops into 256-pixel RGBA rows.
- [x] Generate fixed two-digit variant IDs.
- [x] Support `variants[].baseLutId` so generated rows derive from explicit
  editable LUT stops.
- [x] Expand explicit ID refs and variant range refs.
- [x] Load the shared LUT registry during startup.
- [x] Add optional sprite `palette.mode = "grayscale-lut"`.
- [x] Add optional sprite `palette.lutRefs`.
- [x] Add stable per-bird LUT row selection in `swarmAgentSpriteRuntime`.
- [x] Attach the LUT atlas to the combined agent sprite snapshot.
- [x] Extend `mapSpriteRenderer` vertex packing with optional palette row.
- [x] Upload the LUT atlas as a nearest-filtered texture.
- [x] Sample LUT rows in the map-sprite fragment shader before lighting.
- [x] Add bird metadata refs to `assets/data/agents/swarm_sprites.json`.
- [x] Add focused tests for LUT interpolation, registry loading, range
  expansion, sprite metadata normalization, swarm palette row selection, and
  map-sprite vertex packing.
- [x] Document the implemented architecture in `AI_CONTEXT.md`.
- [x] Create the dedicated design doc.
- [x] Link the design and plan docs from `docs/moc.md`.

## Phase 1: Contract Hardening

- [x] Decide whether unknown LUT refs should fail startup or degrade silently.
  - Decision: shipped startup-loaded sprite data fails startup on invalid LUT
    refs.
  - Future optional map-local overrides may choose a softer policy if needed.
- [x] Add a registry validation result listing missing refs per sprite.
- [x] Add tests for missing explicit IDs and missing range members.
- [x] Decide whether duplicate LUT IDs should warn or remain first-wins.
  - Decision: first normalized ID wins for deterministic atlas rows, and the
    registry exposes `duplicateIds` for debug/validation tooling.
- [x] Add a lightweight debug snapshot with row IDs and row count.

## Phase 2: Authoring And Preview

- [x] Add pure preview helpers for rendering a LUT row to a canvas/image data.
- [x] Add a compact RD readout under `RD > Sprites > LUT`.
- [x] Show loaded LUT count and selected bird LUT ref count.
- [x] Show a preview strip for one selected LUT row.
- [x] Add a read-only row selector for resolved bird LUT rows.
- [x] Add numeric stop editing only after preview/readout is proven useful.
  - Superseded by the large editor; compact editing remains only for quick
    runtime-local checks.
- [x] Add large editor overlay for explicit LUTs.
  - Opened from `RD > Sprites > LUT`.
  - Uses a dedicated explicit-LUT selector separate from agent/swarm consumers.
  - Shows one selected 1D LUT row, not the full atlas.
- [x] Add draggable stop handles after the data/edit lifecycle is stable.
  - Handles are HTML controls over a large single-row preview canvas.
  - Endpoints are locked to positions `0` and `255` for the first editor slice.
- [x] Remove the large editor position slider once dragging is implemented.
- [x] Add generated-variant preview rows for variant families based on the
  selected explicit LUT.
- [x] Show variant-family settings next to the generated preview.
- [x] Add runtime-local variant-family sliders for count, seed, position
  jitter, brightness jitter, and color jitter.
- [x] Treat `count = 0` as the no-variants state and keep variant controls
  available for every explicit LUT.
- [x] Default variant family IDs to the selected explicit LUT ID.
- [x] Add selected-LUT usage debug readout for sprite metadata references.
- [x] Split the large editor lower area into a 1/3 usage/debug box and a 2/3
  variant preview/control box.
- [x] Dock the gameplay large LUT editor directly against the RD panel and
  extend it to the right screen boundary.
- [x] Reparent the large LUT editor overlay to `document.body` so RD overflow
  containers cannot clip the docked editor.

## Phase 3: Runtime Editing

- [x] Add an explicit LUT runtime owner if editing becomes mutable.
  - `src/render/renderLutRuntime.js` now owns source-definition snapshots,
    resolved registry access, selected row state, ref resolution, rebuild, and
    preview image data.
- [x] Rebuild the `256xN` atlas after RD edits.
  - Rebuild updates the runtime registry, RD preview/readout, and active sprite
    render LUT snapshot data.
- [x] Rebuild base-linked generated variant rows from edited explicit LUT
  stops.
- [x] Refresh affected render snapshots without broad renderer resets.
- [x] Decide whether RD edits are dev-only or saveable.
  - Decision: runtime LUT edits are saveable through a dedicated LUT editor
    action for global data or map-local Save All for map-local data.
- [x] If saveable, define whether edits write to global data, map-local data,
  or a separate dev override file.
  - Decision: both. The LUT editor has a global/map-local source scope. `Save
    Global` writes `assets/data/render_luts.json`; map-local source scope is
    saved through map Save All as `render_luts.json`.
- [x] Add save diagnostics and dirty-state handling.
  - The editor shows save mode, target path, map folder, and write API
    availability.
  - Draft edits and applied runtime-global edits are tracked separately.
  - Closing or switching editable LUTs warns before discarding draft/runtime
    global-save state.
- [x] Add explicit LUT create, rename, and delete controls.
- [x] Add variant-family name editing and generated ID preview.
- [x] Add `RD > Agents > Swarm` bird LUT family/range assignment controls.

## Phase 4: Map And Biome Overrides

- [x] Decide whether maps can provide optional `render_luts.json` sidecars.
- [x] Define merge order:
  - global defaults
  - map-local additions
  - map-local overrides
- [ ] Keep startup/title errors visible if required map-local LUT references
  are invalid.
- [x] Document Tauri packaging implications if map-local LUT files are added.
  - Existing asset-copy packaging includes map-local sidecars under
    `assets/<mapName>/`.

## Phase 5: Selection Policies

- [x] Stable random row selection for birds.
- [x] Weighted row selection.
- [x] Rare-row selection for unusual animal variants.
  - [x] Shipped proof: `animal.bird.rare.white` is referenced with
    `rare: true`.
- [x] Biome/weather/scenario constrained selection.
- [ ] State-driven explicit row selection for future conditions such as wet,
  injured, diseased, winter, or faction variants.
- [x] Add editable controls for variant-family count, seed, position jitter,
  brightness jitter, and color jitter.
- [x] Avoid separate create/delete controls for variant families.
  - Decision: every explicit LUT can edit a runtime-local family; `count = 0`
    disables generated rows.

## Phase 6: Additional Consumers

- [x] Birds.
- [ ] Hawks.
- [ ] Ground animals.
- [ ] NPC clothing or faction markings.
- [ ] Player clothing/equipment experiments.
- [ ] Structure state visuals.
- [ ] UI/debug scalar ramps.
- [ ] Resource/knowledge overlay color ramps.

## Phase 7: Deferred LUT Types

- [ ] Palette-index remap mode.
- [ ] Multi-channel mask recoloring mode.
- [ ] UV lookup animation/appearance mode.
- [ ] 3D color-grading LUTs.
- [ ] Material-output LUTs.

These are documented in `docs/RENDER_LUT_DESIGN.md` but are not part of the
current implementation slice.

## Validation

Focused checks:

```powershell
node --check src\render\renderLutRegistry.js
node --check src\gameplay\agentSpriteModel.js
node --check src\gameplay\swarmAgentSpriteRuntime.js
node --check src\render\mapSpriteRenderer.js
node --check src\main.js
node --test tests\renderLutRegistry.test.js tests\agentSpriteModel.test.js tests\agentSpriteDefinitionRegistry.test.js tests\swarmAgentSpriteRuntime.test.js tests\mapSpriteRenderer.test.js
```

Integration checks after render/main changes:

```powershell
node --test tests\*.test.js
npm run lint:md
```

Current validation status:

- [x] Focused syntax checks passed after initial implementation.
- [x] Focused LUT/sprite tests passed after initial implementation.
- [x] Full JS suite passed after initial implementation.
- [x] Focused LUT/RD syntax and tests passed after base-linked variant preview
  slice.
- [x] Full JS suite passed after base-linked variant preview slice.
- [x] Focused LUT/RD/sprite tests passed after variant slider slice.
- [ ] Markdown lint is currently blocked by unrelated existing dirty docs:
  `docs/notes.md`.

## Manual Smoke Test

- [ ] Load default map.
- [ ] Enable swarm sprite mode.
- [ ] Confirm birds still animate and rotate.
- [ ] Confirm bird colors vary when LUT mode is active.
- [ ] Confirm hawks still render normally.
- [ ] Confirm player sprite still renders normally.
- [ ] Confirm structures still render below agents.
- [ ] Confirm sprite lighting still responds to sun/shadow/point lights.
