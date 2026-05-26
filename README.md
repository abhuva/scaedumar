# Scaedumar

A mythic nomadic survival roguelike about reading the land, enduring pressure, and moving before the world turns against you.

Scaedumar is being built around scenario-based survival in an ancient, lonely wilderness: mountain valleys, forest-steppe, rivers, passes, herds, weather, omens, spirits, and animal senses. The player usually inhabits a named protagonist rather than managing an abstract faction. The core fantasy is to survive through movement, terrain knowledge, social judgment, ritual risk, and the ability to borrow the senses of animals.

This repository contains the current playable prototype and toolchain for that game direction. It uses authored terrain maps, WebGL2 rendering, activity-based survival systems, strategic route planning, resource knowledge, inventory, condition effects, scouting, and live tuning tools. The runtime is intentionally lightweight: HTML, JavaScript, WebGL2, and an optional Tauri desktop wrapper. No Unity, Godot, or Unreal.

Project site: https://abhuva.github.io/scaedumar/

## Game Direction

- Scenario-based survival: each map should become a bounded survival problem with its own pressure, objective, and consequences.
- Movement as strategy: routes, terrain cost, weather, supplies, fatigue, and knowledge should make staying or moving a meaningful decision.
- Animalist and spirit-world themes: scouting, possession, omens, taboos, offerings, spirit favor, and spirit debt are intended gameplay pillars.
- Named protagonists over omniscient control: the player acts through a character's body, relationships, authority, skills, and spiritual access.
- Influence over micromanagement: companions, animals, spirits, and factions should retain autonomy instead of becoming RTS units.
- Abstract survival activities: forage, gather water, scout, rest, hunt, guard, repair, and perform rites should resolve through terrain, time, resources, skill, risk, and events.
- Temporary camps over city building: shelters, caches, hearths, drying racks, pens, watch posts, and ritual sites should create tradeoffs without turning the game into a settlement simulator.

## Current Prototype

- Renders crisp top-down terrain from authored map textures with height shadows, normal lighting, fog, clouds, water effects, point lights, detail textures and day-night controls.
- Supports activity-based gameplay for travel, plant gathering, water gathering, rest, scouting, inventory, condition upkeep, and resource stock.
- Tracks a Knowledge Map so known resources and terrain can differ from live world state.
- Provides tactical pathfinding and strategic `Nav` route planning as separate systems.
- Includes bird scouting/possession scaffolding, flock simulation, and visual tuning tools for animal-sense experiments.
- Saves and loads map-local sidecar JSON for lighting, water, detail, camera, audio, NPC, route/resource debug, swarm, and resource stock settings.
- Runs in the browser and can be packaged as a desktop app with Tauri.

## Current State

This is an active prototype, not a finished game. The current build is closest to a playable systems sandbox for the eventual scenario game: load a terrain map, inspect what the character knows, plan routes, travel, gather resources, manage water and inventory, rest, scout through birds, tune the atmosphere, and save map-local settings.

The design target is broader than the current mechanics. The docs describe the intended direction: scenario objectives, escalating pressure, nomadic survival logistics, animalism, social and spiritual resources, temporary structures, events, route uncertainty, and terrain-driven decisions.

## Screens And Controls

- Start on the title screen, then enter gameplay or dev mode.
- Mouse wheel zooms; middle mouse drag pans.
- `PF` plans local travel from the player.
- `G` searches for plant resources.
- `W` searches for water and fills carried water containers.
- `SC` starts scouting behavior.
- `R` rests.
- `Inspect` is a secondary toggle for known water, plants, height, slope, and route overlays.
- `Nav` opens strategic route planning using route-grid terrain costs and Knowledge Map visibility.
- `RD` opens Resource Debug panels for Knowledge, Known View, NAV, and Stock tuning.

## Map Format

Maps live in per-map folders under `assets/`, for example `assets/map3/`.

Required textures:

- `splat.png`: terrain color/material appearance.
- `normals.png`: terrain normal response for directional lighting.
- `height.png`: height field for shadows and terrain sampling.
- `slope.png`: slope/cost support data.
- `water.png`: water mask.

Optional authored/runtime sidecars:

- `flow.png`: water flow direction field.
- `pointlights.json`: baked/local point-light definitions.
- `lighting.json`, `fog.json`, `clouds.json`, `waterfx.json`, `watertrails.json`, `detail.json`, `camera.json`, `audio.json`.
- `interaction.json`, `npc.json`, `swarm.json`, `resource_debug.json`, `resource_stock.json`.

Shared gameplay definitions live under `assets/data/`.

## Run In Browser

Serve the repository over HTTP. Do not open `index.html` with `file://`, because browser security rules block several asset-loading paths.

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

If Node tooling is already installed, this also works:

```powershell
npx serve .
```

## Run As Desktop App

Use the helper script so `.tauri-dist` is refreshed from the current frontend before Tauri starts.

```powershell
.\build-tauri.ps1 dev
```

Build release bundles:

```powershell
.\build-tauri.ps1 build
```

Release outputs are written under `src-tauri/target/release/bundle/`.

## Development Checks

Install development tooling once:

```powershell
npm install
```

Run all JavaScript tests:

```powershell
npm test
```

Run lint checks:

```powershell
npm run lint
```

Common focused checks during runtime work:

```powershell
node --check src\main.js
node --test tests\*.test.js
npm run lint:md
```

## Architecture

The runtime is modular and owner-module driven. `src/main.js` composes systems, but mutations should live in the runtime owner for that domain. Events are used for post-change UI refresh, overlay invalidation, and cache refresh; commands/runtime APIs own validation and mutation.

Important directories:

- `src/core/`: event bus, command routing, scheduler, store, settings contracts, shared pathfinding primitives.
- `src/render/`: WebGL2 renderer, frame state, shaders, render resources, water trails, uniform upload.
- `src/gameplay/`: map lifecycle, movement, route planning, activity systems, resources, inventory, conditions, swarm gameplay.
- `src/ui/`: HUD, panels, bindings, overlay drawing, resource debug UI.
- `src/sim/`: time, sun model, lighting parameter helpers.
- `src/audio/`: Audio Studio experiments.
- `src/slime/`: isolated WebGL2 Physarum-style simulation experiments.
- `src-tauri/`: desktop wrapper and native file commands.
- `docs/`: technical documentation and project site source.

## Documentation

Start here for deeper context:

- `docs/GAMEPLAY_DESIGN.md`: current scenario, world, control, animalism, and terrain-integration direction.
- `docs/SURVIVAL_SYSTEMS_DESIGN.md`: inventory, condition, skills, techniques, and survival progression direction.
- `docs/LONG_DISTANCE_ROUTE_PLANNING.md`: strategic route-planning design and prototype findings.
- `docs/SOUND_DESIGN.md`: ancient, lonely, modal soundscape direction.
- `AI_CONTEXT.md`: current handoff map for implementation work.
- `docs/ARCHITECTURE.md`: architecture overview.
- `docs/UI_LAYOUT_GRID.md`: gameplay HUD and panel layout contract.
- `docs/ACTIVITY_MODEL.md`: activity, upkeep, and condition model.
- `docs/RESOURCE_STOCK_MODEL.md`: live/known resource stock model.
- `docs/KNOWLEDGE_MAP.md`: Knowledge Map naming and mutation rules.
- `docs/EVENT_NOTIFICATION_ARCHITECTURE.md`: event boundary and refresh model.
- `docs/plans+setups/SMOKE_CHECKLIST.md`: visual and runtime smoke checks.

## Design Constraints

- Browser-native runtime first; Tauri is the desktop distribution path.
- Keep dependencies minimal.
- Preserve pixel-sharp terrain rendering under zoom.
- Keep map data portable through PNG textures and JSON sidecars.
- Prefer small, testable owner-module changes over broad rewrites.
- Do not route gameplay mutation through UI events; keep commands and runtime owners explicit.
