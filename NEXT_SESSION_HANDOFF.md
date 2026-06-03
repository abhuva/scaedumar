# Next Session Handoff

## Branch And Scope

- Branch: `plan/structures-implementation`.
- Root context still starts with `AI_CONTEXT.md`.
- Current completed feature area: reusable render LUTs for sprite recoloring, RD LUT editor, bird LUT assignment, and optional map-local LUT sidecars.
- Active docs for this feature:
  - `docs/RENDER_LUT_DESIGN.md`
  - `docs/RENDER_LUT_IMPLEMENTATION_PLAN.md`
  - `docs/moc.md`
  - `AI_CONTEXT.md`

## Implemented Render LUT State

- Global LUT definitions live in `assets/data/render_luts.json`.
- Optional map-local LUT definitions live as `assets/<mapName>/render_luts.json`.
- Global and map-local definitions are composed into one active runtime `256xN` LUT atlas.
- Map-local IDs override same-ID global LUTs for the active map.
- LUT model is currently `grayscale-ramp`: 1D grayscale input `0..255` maps to RGB through authored color stops.
- Variant rows are generated from explicit LUTs via `baseLutId`, family name, count, seed, position jitter, brightness jitter, and color jitter.
- Variant IDs use fixed two-digit suffixes: `<family>.variant.00..99`.
- `count = 0` is the no-variants state.

## Runtime/Rendering Integration

- `src/render/renderLutRegistry.js` normalizes explicit LUTs, generates variant rows, expands LUT refs/ranges, validates refs, and builds the atlas bytes.
- `src/render/renderLutRuntime.js` owns active source snapshots, registry rebuild, row selection, preview image data, and runtime patch APIs.
- `src/render/mapSpriteRenderer.js` supports sprite palette LUT rows and uploads the LUT atlas for map-sprite rendering.
- Bird sprites use grayscale LUT recoloring through `assets/data/agents/swarm_sprites.json`.
- `src/gameplay/swarmAgentSpriteRuntime.js` now reads the current bird definition dynamically, so RD bird LUT assignment applies without recreating the runtime.

## RD UI State

- `RD > Sprites > LUT` owns LUT inspection and editing.
- The large LUT editor:
  - docks to the right of the RD panel
  - edits one selected explicit LUT at a time
  - supports draggable stop handles and color picker
  - supports global/map source scope
  - supports explicit LUT create, rename, and delete
  - supports variant family name editing and generated ID preview
  - shows generated variant preview rows
  - shows usage/debug data and save diagnostics
  - tracks draft dirty state separately from global/map save state
- `Save Global` writes only `assets/data/render_luts.json`.
- Map-local LUT edits are saved through map `Save All` as `render_luts.json`.
- `RD > Agents > Swarm` owns bird LUT consumer assignment:
  - family selector
  - variant count slider
  - apply button
- `RD` typography was normalized through `--rd-ui-font-size: 13px`.
- Range sliders now use square-corner custom styling instead of rounded browser defaults.

## Map Load/Save Integration

- `mapSidecarLoader` loads optional `render_luts.json` from URL and folder-selection paths.
- Missing `assets/map3/render_luts.json` 404 is expected and should not fail loading.
- A bug was fixed where `applyRenderLutMapLocalDefinition` was not forwarded through `src/app/mapLightingAssemblyRuntime.js`.
- `mapDataSaveController` includes `render_luts.json` in Save All only when map-local LUT data exists.
- Global LUT data intentionally remains excluded from map Save All.

## Important Current Behavior

- Browser file saving:
  - Global `Save Global` tries Tauri native save first when available.
  - Browser fallback uses `showSaveFilePicker`, then directory picker, then download as final fallback.
- Tauri path behavior:
  - Absolute map paths derive sibling `assets/data/render_luts.json`.
  - `.tauri-dist` map paths resolve back to repo source `assets/data/render_luts.json`.
  - Relative map paths ask the user to select `assets/data`.
- Optional map-local `render_luts.json` 404 in dev server console is expected when a map has no local LUT override.
- The WebGL incomplete framebuffer warning is pre-existing/non-fatal and separate from LUT work.

## Validation Last Run

The last completed validation before handoff:

```powershell
node --check src\main.js
node --check src\app\mapLightingAssemblyRuntime.js
node --check src\gameplay\mapSidecarLoader.js
node --test tests\*.test.js
npm run lint:md
```

Result:

- Full JS test suite passed: `514/514`.
- `npm run lint:md` still fails on unrelated existing `docs/notes.md:19` trailing whitespace.
- Focused LUT/RD/map-save tests passed during the session.

## Files Intentionally Not Staged/Committed Unless Requested

The worktree currently contains unrelated or user-authored dirty assets/docs that should not be reverted or staged without explicit instruction, including map/detail texture changes, XCF files, `docs/Ideas.md`, and `docs/notes.md`.

## Likely Next Work

1. Manual browser smoke test for new LUT editor operations:
   - create global LUT
   - create map-local LUT
   - rename/delete LUT
   - edit family name/count and verify generated IDs/preview
   - Save Global and hard-refresh
   - Save All with map-local LUT and reload map
2. Improve validation/reporting for map-local/global duplicate IDs and invalid refs.
3. Add a small visual badge in the LUT editor for active source scope and saved/dirty status.
4. Optional later: map/biome specific LUT authoring workflow and state-driven LUT selection for wet/injured/season/faction variants.