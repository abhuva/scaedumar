# Next Gameplay Direction Planning

## Purpose

This note evaluates several large next-step directions for Scaedumar and recommends a practical sequence. It is planning guidance, not a final feature specification.

The current recommendation is to prioritize a first `Tracking Trails` slice: make animal scouting reveal meaningful trail knowledge before building a broad event system, full sprite/decal renderer, streaming terrain architecture, or visible skill system.

## Recommendation

Build trails next, but keep the first version narrow.

The goal should not be "fully integrate Slime Lab into gameplay." The better first goal is:

> Add a first known-trails layer revealed by scout possession, visible through Inspect/RD overlays, with a simple terrain-biased trail field and focused tests.

This moves the prototype toward the intended fantasy: reading the living land, borrowing animal senses, and choosing where to travel based on imperfect knowledge.

## Direction Evaluation

## 1. Tracking Trails, Slime, And Ground Animals

This is the strongest next candidate.

Why it fits:

- It directly supports animalism, scouting, terrain knowledge, and survival movement.
- Existing systems already point in this direction: Slime Lab, scout possession, Knowledge Map, resource overlays, route planning, and activity systems.
- It creates visible gameplay quickly: possess a bird or hawk, see trail signs, infer animal movement, then decide where to travel.
- It can start as a field/knowledge system without needing full animal AI, hunting rewards, or event UI.

Risks:

- Full slime-as-gameplay can become too large too quickly.
- GPU readback can become expensive or brittle if gameplay depends directly on WebGL internals.
- The project needs a clean distinction between true world state, player knowledge, and visual overlays.

Recommended first slice:

- Add a true trail field as a low-resolution gameplay field.
- Add a separate known trail map or trail knowledge layer.
- Reveal known trails through scout possession first, especially bird/hawk scouting.
- Display known trails as an Inspect/RD overlay.
- Keep plant and water interactions out of the first slice except as future hooks.
- Prefer CPU data for the first gameplay field unless a specific Slime Lab bridge is being tested.

## 2. Event And Dialog System

This is essential for real gameplay, but should probably follow one more concrete gameplay slice.

Why it matters:

- It will support tutorials, scenario beats, survival events, rituals, omens, encounters, and consequences.
- It is the natural presentation layer for discoveries such as fresh tracks, animal signs, spirit warnings, or camp problems.
- It can turn systems into decisions rather than just overlays and meters.

Risks:

- A generic dialog framework built too early may be detached from real gameplay needs.
- A tutorial-only implementation may be too narrow and need rewriting.
- Player-facing events need a data contract for choices, conditions, outcomes, and UI layout.

Recommended timing:

- Build after the first trail/scout slice creates a real use case.
- Use a narrow initial event such as `fresh trail discovered`, `omen seen while scouting`, or `animal sign found`.
- Keep the existing event bus guardrail: gameplay mutation stays in owner runtimes; event UI should present choices and dispatch explicit commands.

## 3. Sprite And Decal System

This is crucial, but it is not the highest-leverage next gameplay slice unless visual production becomes the priority.

Why it matters:

- Tracks, blood, caches, camp markers, offerings, footprints, carcasses, fire pits, structures, and ritual sites all need a map-space sprite/decal layer.
- It supports tracking, event aftermath, temporary camps, and later structure placement.
- It strengthens the pixel-sharp map style at close zoom.

Risks:

- Scope can expand into sprite batching, atlases, animation, sorting, persistence, placement editing, interaction, and structure rules.
- It can become renderer-heavy before it proves gameplay value.

Recommended first slice:

- Static map-space decals only.
- One atlas or simple sprite registry.
- Nearest-neighbor rendering, camera-stable, map-coordinate aligned.
- Draw after terrain and before UI overlays.
- Data shape can stay simple: `id`, `spriteId`, `x`, `y`, `scale`, `tint`, `opacity`, and optional `lifetime`.
- Defer animation, placement tools, and full structure interaction.

## 4. Streamability And Multi-Tile Scenario Regions

Important, but not the next implementation priority.

Why it matters:

- Scenario regions may need to exceed one terrain texture.
- The design target includes source terrain sheets, runtime terrain tiles, loaded tile windows, and world coordinates.
- It will eventually matter for valleys, passes, migration routes, hunting grounds, and larger authored territories.

Risks:

- It touches map lifecycle, render resources, terrain sampling, pathfinding, resources, save/load, camera bounds, coordinates, and gameplay queries.
- It can slow gameplay iteration if started before the prototype has a stronger loop.

Recommended timing:

- Do it after one or two gameplay loops prove why larger scenario regions are needed.
- Start with a technical spike and manifest design, not a full migration.
- Preserve single-map compatibility throughout.

## 5. Skill System

Do not build a visible skill system yet.

Why:

- The current best role for skills is to modify existing knobs.
- Useful skill effects depend on systems that are still forming: route confidence, trail knowledge, possession range, resource estimate accuracy, and fatigue costs.
- A visible skill tree would likely feel too generic and optimization-driven for the project direction.

Good hidden modifiers later:

- Scout reveal radius.
- Possession duration and range.
- Trail knowledge falloff.
- NAV uncertainty penalty.
- Route planning radius and confidence.
- Resource estimate accuracy.
- Movement fatigue under load or terrain difficulty.

Recommended timing:

- Keep skill-like values as debug settings, scenario defaults, status effects, or protagonist traits.
- Add a player-facing `Known Ways` or technique system only after activities and events create meaningful unlocks.

## Additional Directions To Track

## Weather As Scenario Pressure

Weather is a strong fit for scenario escalation: snow closing a pass, fog hiding danger, floods changing crossings, or drought reducing resources.

Recommended timing: after event/dialog foundations and at least one gameplay loop that can react to weather.

## Scenario Objectives

Scenario objectives are essential for moving beyond sandbox play.

Recommended timing: after the event system has a minimal command/outcome contract.

## Temporary Camps And Structures

Temporary camps fit the project better than city building. Useful examples include shelters, caches, hearths, drying racks, pens, watch posts, and spirit poles.

Recommended timing: after static decals/sprites and event choices exist.

## Savegame Separation

Map-local sidecars are authored scenario defaults. Gameplay saves should eventually be separate mutable run state.

Recommended timing: before campaign/scenario progression becomes serious, but not before the next gameplay slice.

## Proposed Sequence

## Phase 1: Trail Knowledge Slice

Goal: make animal scouting reveal meaningful information.

Implement:

- A true low-resolution trail field owned by a gameplay runtime.
- A known trail knowledge layer separate from true trail values.
- Scout possession reveal for trail knowledge, initially larger or different from ordinary player reveal.
- Inspect/RD overlay for known trails and optional true-trail debug view.
- Tests for field creation, reveal behavior, snapshot isolation, and overlay gating.

Player-facing result:

- Possess a bird or hawk.
- Reveal trail intensity or freshness in the surrounding area.
- Use that information to decide where to travel next.

## Phase 2: Slime Experiment Bridge

Goal: decide whether Slime Lab should drive, visualize, or merely inspire trail fields.

Options to test:

- CPU trail field as gameplay truth with slime as visual inspiration.
- Slime trail texture sampled or downsampled into a gameplay field.
- Slime used only as a dev workspace for tuning migration/trail behavior.

Guardrail:

- Keep GPU readback sparse and targeted.
- Do not make gameplay depend directly on WebGL implementation details.

## Phase 3: Trail Activity

Goal: turn trail knowledge into action.

Possible activity names:

- `Track`
- `Hunt`
- `Follow Sign`

Behavior:

- Uses known and true trail values to bias movement or success chance.
- Disturbs, depletes, or ages local trail information.
- Can later produce inventory rewards, risk, fatigue, events, or animal encounters.

## Phase 4: Narrow Event Hook

Goal: prove event/dialog UI with one real gameplay case.

Possible triggers:

- Fresh trail discovered.
- Omen seen while scouting.
- Animal sign found near water.
- Trail crosses a dangerous slope or ravine.

Initial choices can be simple:

- Mark it.
- Follow it.
- Ignore it.
- Inspect more closely.

## Phase 5: Static Decals

Goal: make discovered signs persist visually in map space.

Use cases:

- Track marks.
- Blood drops.
- Cache markers.
- Camp remains.
- Offering sites.

Keep the first renderer simple and static.

## Open Questions

- Should the first trail field represent wildlife movement generally, a specific species, or generic `animal sign`?
- Should hawk possession reveal trails directly, or reveal signs that then require ground inspection?
- Should trail knowledge decay over time like other knowledge layers?
- Should trail intensity affect NAV route planning, or stay separate until hunting/tracking proves useful?
- Should the first trail overlay use contour lines, raster bands, arrows, dots, or a distinct scent-like visual language?
- Should known trails be part of the shared Knowledge Map model or a separate `Trail Knowledge` map from the start?

## Near-Term Recommendation

Start with a `Trail Knowledge` branch.

Keep the branch goal small enough to land:

> Add a terrain-biased trail field and a scout-revealed known-trails overlay, without hunting rewards, event dialogs, sprite decals, or slime coupling yet.

This is the most direct next step toward making Scaedumar feel like a game about reading the land rather than only tuning resource overlays.
