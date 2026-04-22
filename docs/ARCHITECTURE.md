# Architecture Map

This project is mid-migration from a monolithic `src/main.js` runtime toward modular systems.

## Runtime Core

- `src/core/state.js`: single runtime state store.
- `src/core/scheduler.js`: ordered system update pipeline.
- `src/core/commands.js`: typed command bus.
- `src/core/registerMainCommands.js`: composition root for command handlers.
- `src/core/modeCapabilities.js`: `dev` / `gameplay` / `hybrid` capability contract.
- `src/core/settingsRegistry.js`: subsystem settings contract registry.
- `src/core/mainSettingsContracts.js`: project settings contracts and defaults.
- `src/core/frameSnapshot.js`: per-frame store snapshot updates from runtime values.

## Render

- `src/render/renderer.js`: pass registration + execution facade.
- `src/render/resources.js`: render resource helpers and metadata hooks.
- `src/render/passes/*`: shadow/blur/main terrain/point-light usage pass modules.
- `src/render/precompute/*`: map-space precompute adapters (flow map, point-light bake).
- `src/render/frameRenderState.js`: render DTO assembly from core state + frame inputs.
- `src/render/uniformInputState.js`: uniform input object assembly.

## Simulation

- `src/sim/timeSystem.js`
- `src/sim/lightingSystem.js`
- `src/sim/fogSystem.js`
- `src/sim/cloudSystem.js`
- `src/sim/waterFxSystem.js`
- `src/sim/weatherSystem.js` (architecture scaffold; no visible weather feature yet)

## Gameplay

- `src/gameplay/entityStore.js`: lightweight entity storage scaffold.
- `src/gameplay/pathfindingSystem.js`: scheduler adapter for pathfinding runtime state.
- `src/gameplay/movementSystem.js`: scheduler adapter for player/entity movement state.
- `src/gameplay/interactionCommands.js`: interaction/pathfinding command routing.

## UI

- `src/ui/bindings/*`: panel/input listeners split by topic.
- `src/ui/overlays/overlayHooks.js`: frame hooks that separate gameplay updates from overlay draw gating.

## Current Migration Status

- Render and UI listener extraction: largely complete.
- Mode capability gating: implemented.
- Weather/settings architecture groundwork: implemented.
- Gameplay foundation extraction: scaffold complete, deeper system extraction still pending.
- Final hardening/testing/docs cleanup: in progress.
