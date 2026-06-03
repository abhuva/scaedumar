# Current Prototype

The current build is a focused prototype, not a finished game.

It tests whether authored terrain maps, survival activities, field notes, and a lightweight browser-native runtime can support a readable top-down survival loop.

## Runtime

- Browser-native HTML, JavaScript, and WebGL2.
- Tauri wrapper path for desktop distribution.
- No Unity, Godot, Unreal, or other game engine.
- Terrain maps loaded from authored texture layers and JSON sidecars.

## Playable Systems

- Terrain rendering with lighting, normal response, height sampling, water, fog, clouds, point lights, and detail experiments.
- Player movement with pathfinding previews and committed travel.
- Inspect overlays for terrain and resource perception.
- Survival condition tracking for fatigue, hydration, and nutrition.
- Gathering, water search, rest, hunting, and scouting prototype activities.
- Wiki, journal, tutorial, and encounter foundations.

## Development Focus

The prototype prioritizes small, testable systems:

- explicit runtime ownership
- readable map data contracts
- lightweight browser delivery
- player-facing field notes that can also appear in-game
- terrain and knowledge systems that make movement decisions meaningful

## Technical Wiki

For implementation details, start with the [Technical Wiki](../moc.md).
