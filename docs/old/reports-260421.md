# Report 2026-04-21

## Scope

- Critical architecture evaluation of current prototype.
- Target architecture proposal for:
  - modular render pipeline
  - cross-system simulations (weather, lighting, gameplay)
  - dual operation modes (`Dev Tools` and `Gameplay`)
  - future systems (crafting, survival loops, NPC/entity growth)

## Current Architecture Snapshot (Observed)

- Runtime is in one large file: `src/main.js` (`~6.1k` lines).
- UI bindings, renderer setup, shader source strings, sim logic, gameplay logic, file I/O, and event wiring are all mixed in one module.
- Global mutable state is shared broadly across features.
- Main render loop directly reads UI controls and writes uniforms each frame.
- Many systems are coupled through direct DOM state reads rather than a central runtime state model.
- Settings persistence is duplicated pattern-by-pattern (`serializeX` / `applyX`) per feature.
- A worker exists for point-light baking, but most subsystems are still single-thread, main-loop coupled.

## Critical Risks

- Scalability risk:
  - adding each feature increases merge/conflict surface in one file.
  - onboarding and debugging cost rises non-linearly.
- Coupling risk:
  - UI state and simulation state are not cleanly separated.
  - difficult to run headless simulation or replay deterministically.
- Runtime coherence risk:
  - new “small simulations” (weather, AI, survival loops) will compete without clear update order/contracts.
- Testing risk:
  - logic is not isolated enough for fast unit/integration tests.
- Mode risk:
  - `Dev` and `Gameplay` mode behavior can diverge unpredictably because no explicit mode architecture exists.

## What Is Good (Keep)

- Shader-first rendering direction is strong and performant.
- Map-space precompute concept (shadow, flow map, point-light bake) is the right pattern.
- Existing JSON save/load approach already hints at system-level configuration boundaries.
- Current prototype has rapid iteration speed; preserve this in refactor.

## Target Architecture (Pragmatic, Incremental)

### 1) Runtime Layers

- `App Layer`:
  - startup, mode selection, dependency wiring.
- `World State Layer`:
  - canonical mutable state (`world`, `renderState`, `gameplayState`, `uiState`).
- `Systems Layer`:
  - deterministic update systems with explicit order and contracts.
- `Render Layer`:
  - render graph/pipeline passes with explicit inputs/outputs.
- `UI Layer`:
  - inspector/editor panels, mode tools, command dispatch only.

### 2) Core Contracts

- `FrameContext`:
  - `time`, `dt`, `camera`, `map`, `mode`.
- `System API`:
  - `init(ctx)`, `update(ctx, world)`, optional `renderPrep(ctx, world)`.
- `Render Pass API`:
  - `prepare(resources, world)`, `execute(gl, resources, world)`.
- `Settings API`:
  - each subsystem owns `defaults`, `serialize`, `apply`, `validate`.

### 3) Mode Architecture

- `Dev Tools Mode`:
  - full editor controls, diagnostics, overlays, debug pass toggles.
- `Gameplay Mode`:
  - minimal HUD/input surface, simulation-driven behavior, locked or reduced debug controls.
- `Hybrid/Modding Mode`:
  - gameplay running while selected tools are enabled.
- Implement mode as capability flags, not hard forks of code paths.

### 4) Weather Architecture (Aligned with planning)

- Add `WeatherSystem` producing a map-local weather field texture (low-res).
- Use multi-channel weather representation (not single scalar bands).
- Add explicit wind model:
  - global wind (`dir/speed`) + local wind flow map modulation.
- Weather outputs become modulators for:
  - clouds, fog, ambient/sun attenuation, future particles and gameplay effects.
- Keep modulation clamped to avoid incoherent patchwork visuals.

### 5) Gameplay/Entity Growth Path

- Introduce lightweight entity model now (player/NPC/resource nodes).
- Move pathfinding, movement, and action loops into separate gameplay systems.
- Keep render data derived from world state, never from raw UI controls.
- Later crafting/survival loops hook into the same system scheduler.

## Proposed Module Layout

- `src/app/`
  - `bootstrap.js`
  - `modes.js`
- `src/core/`
  - `state.js`
  - `scheduler.js`
  - `events.js`
  - `settings-registry.js`
- `src/render/`
  - `renderer.js`
  - `passes/mainTerrainPass.js`
  - `passes/shadowPass.js`
  - `passes/pointLightBakePass.js`
  - `passes/weatherFieldPass.js` (new)
- `src/sim/`
  - `timeSystem.js`
  - `weatherSystem.js`
  - `cloudSystem.js`
  - `fogSystem.js`
  - `lightingSystem.js`
- `src/gameplay/`
  - `entityStore.js`
  - `pathfindingSystem.js`
  - `movementSystem.js`
  - `activitySystem.js`
- `src/ui/`
  - `bindings/` (one file per panel)
  - `overlays/`
- `src/io/`
  - `mapLoader.js`
  - `jsonStore.js`

## How This Differs From Current

- Current:
  - direct DOM -> render uniforms each frame.
  - feature logic mostly inline and cross-coupled.
- Target:
  - DOM writes to state via commands/actions.
  - systems compute derived runtime values.
  - renderer consumes structured state + pass outputs.
  - each feature has isolated settings and update contract.

## Refactor Plan (Rough, Incremental)

### Phase 0: Stabilize (short)

- Freeze new large features for a short refactor window.
- Add baseline smoke checks and visual regression screenshots for key scenes.

### Phase 1: Extract State + Scheduler

- Introduce central `worldState`.
- Move `updateCycleTime`, weather/time, and lighting parameter computation into systems.
- Keep shaders and passes in place, but stop reading raw UI everywhere.

### Phase 2: Render Pass Separation

- Split terrain render, shadow pass, point-light bake management, water flow-map management.
- Define explicit pass inputs/outputs/resources.

### Phase 3: UI Decoupling + Modes

- Move panel code into `ui/bindings`.
- Implement mode capability flags and route inputs through mode-aware command handling.

### Phase 4: Weather Field + Wind Backbone

- Add weather field texture pipeline and global+local wind model.
- Drive clouds first, then fog and lighting modulation.

### Phase 5: Gameplay Foundation

- Add entity store and system scheduler for movement/activity/NPC loops.
- Keep dev tooling available in hybrid mode for modding workflows.

## Rough Effort

- Phase 1-2: medium (highest structural payoff).
- Phase 3: medium.
- Phase 4: medium.
- Phase 5: medium to high (depends on gameplay complexity).

## Guardrails

- Keep prototype runnable at every phase (no long-lived broken branch).
- Do not rewrite shaders wholesale during architecture extraction.
- Preserve JSON compatibility where possible (migrate with version fields when needed).
- Keep performance checks in each phase (frame time, bake latency, map load time).

## Recommendation

- Proceed with incremental modularization now, before adding major gameplay stacks.
- Start with state/scheduler extraction and render pass boundaries.
- Use weather system introduction as the first “new feature under new architecture” to validate the pattern.
