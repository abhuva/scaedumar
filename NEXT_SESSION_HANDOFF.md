# Next Session Handoff

## Branch And Scope

- Branch: `plan/structures-implementation`.
- Current feature area: Structures plus Player/Agent sprite rendering.
- Root context still starts with `AI_CONTEXT.md`.
- Active planning docs that must stay current:
  - `docs/STRUCTURES_IMPLEMENTATION_PLAN.md`
  - `docs/PLAYER_AGENT_SPRITE_IMPLEMENTATION_PLAN.md`
  - `docs/SPRITE_DETAILS_RENDERING_DESIGN.md`
  - `docs/STRUCTURE_DATA_CONTRACT.md`

## Implemented Structures State

- `structures.json` sidecar support is implemented for map load/save.
- `structureRuntime` owns structure type/instance state, occupancy, placement validation, removal, state patching, render snapshots, and query APIs.
- Structure sprites are rendered through the shared WebGL `mapSpriteRenderer` path after terrain and before agents.
- Structure source art convention:
  - reusable: `assets/sprites/structures/default/`
  - scoped: `assets/sprites/structures/<mapOrSetName>/`
- Current proof fixture: `assets/map3/structures.json` with `nomadic_tent` structures using `assets/sprites/structures/default/nomadic_tent_01.png`.
- Local pathfinding treats `blocksMovement: true` structure footprints as impassable.
- RD UI state:
  - `RD > Knowledge` contains Knowledge/Known View/Stock.
  - `RD > Sprites > Structures` contains structure controls.
  - Structure placement preview is binary green/red footprint overlay and stays active after placement.
  - Structure occupancy debug overlay has a dedicated RD overlay shortcut.

## Implemented Player/Agent Sprite State

- Agent sprite definitions are JSON-backed:
  - `assets/data/agents/player_sprites.json`
  - `assets/data/agents/swarm_sprites.json`
- Source art convention:
  - `assets/sprites/agents/default/player.png`
  - swarm art under `assets/sprites/agents/default/`
- Player sprite:
  - current source is `64x64`
  - `directionCount: 1`
  - `frameCount: 1`
  - gameplay footprint remains separate from source size
- Swarm sprites:
  - birds/hawks currently use `32x32` source slots
  - bird animation uses metadata-driven horizontal strip frames
  - bird/hawk quads rotate from simulation velocity
  - bird exact-white color keying is supported with `transparentColor: "#ffffff"` and tolerance `0`
- RD UI state:
  - `RD > Agents > Swarm` and `RD > Sprites > Agents` share the swarm square-vs-sprite toggle.
  - Sprite mode suppresses legacy swarm square rendering.
  - `RD > Sprites > Agents` includes player sprite visibility toggle.
  - When player sprite is visible, the legacy pink player overlay marker is suppressed.

## Important Renderer Contract

- `src/render/mapSpriteRenderer.js` is shared by structures and agents.
- Agent render items may provide `sourceSlotWidth` and `sourceSlotHeight`.
- These fields are explicit source-frame crop metadata for fixed-size frames/strips.
- Sources without explicit source slot metadata are treated as whole-image sprites and scaled into the atlas slot.
- This distinction is important:
  - `32x32` bird strip frames can be cropped correctly even in a `64x64` combined agent atlas.
  - `128x128` structure PNGs are not accidentally cropped to `32x32`.

## Last Bug Fixed

Problem observed after player moved to `64x64` source:

- tents disappeared or rendered incorrectly
- player could appear initially invisible until a debug-view toggle

Confirmed/fixed part:

- The shared atlas builder was defaulting missing source slot metadata to `32x32`.
- Structure render items do not provide `sourceSlotWidth/sourceSlotHeight`, so the tent source was cropped incorrectly.
- Fix: missing source slot metadata now means whole-image source; only explicit metadata crops strips/frames.
- Added tests for whole-image structure sources, `32x32` animated strips, and `64x64` player frames.

Still worth verifying manually:

- Browser retest after the latest commit: tents visible, player visible on initial load, player remains visible while moving.
- If player initial invisibility persists, treat it as a separate atlas-load/render-refresh or toggle-state issue, not a source-size issue.

## Likely Next Work

1. Manual browser smoke test:
   - map loads with tents visible
   - player sprite visible immediately
   - player sprite does not flicker during movement
   - swarm sprite mode shows sprites only, square mode shows squares only
2. Player readability first implementation:
   - recommended: player-only ground halo/shadow under sprite
   - keep authored sprite untinted
   - preserve terrain lighting unless readability requires a controlled bias
3. If needed, debug player initial invisibility:
   - inspect agent sprite toggle initialization
   - inspect combined agent snapshot contents on first frames
   - inspect async atlas build timing and whether placeholder/final atlas forces enough redraws
4. Future structure work:
   - route-planning obstacle projection
   - mutable-savegame separation for player-built/damaged structures
   - container/rest/heat/crafting/event/audio integrations
5. Future agent work:
   - player/NPC facing policy
   - smooth player render interpolation
   - agent selection/inspection behavior
   - y-sort or layering rules if tall structures conflict with agents

## Validation Last Run

The last completed validation before handoff:

```powershell
node --check src\render\mapSpriteRenderer.js
node --check src\main.js
node --test tests\mapSpriteRenderer.test.js tests\playerSpriteRuntime.test.js tests\swarmAgentSpriteRuntime.test.js tests\structureRuntime.test.js tests\structurePass.test.js tests\agentSpritePass.test.js
node --test tests\*.test.js
npm run lint:md
git diff --check
```

Result:

- full JS test suite passed: 486 tests
- markdown lint passed
- diff whitespace check passed

## Notes For Next Agent

- Do not revert dirty/user-authored map sidecar values unless explicitly requested.
- Keep `AI_CONTEXT.md` aligned for architecture, ownership, UI contracts, save/load behavior, or major gameplay changes.
- Keep the two implementation plans updated as work proceeds.
- Use focused tests first, then full `node --test tests\*.test.js` for integration changes touching render/main/runtime/commands/save-load.
