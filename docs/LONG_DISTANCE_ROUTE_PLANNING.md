# Long Distance Route Planning

## Purpose

Long-distance route planning is a proposed navigation skill that lets the player sketch a rough route across a much larger area than the current tactical pathfinding range. It uses a lower-resolution navigation map to make broad travel decisions cheap and readable, but it does not replace the existing local pathfinding or movement execution.

The intended player-facing meaning is: "given what I know, this is a plausible route." It is not a perfect GPS path and it is not the exact path the character will walk.

## Design Goals

- Let the player plan beyond the current local `PF` range.
- Preserve the current tactical pathfinding system as the only executable movement path.
- Make navigation skill progression meaningful through range, certainty, and route quality.
- Support known-terrain uncertainty instead of exposing perfect global terrain knowledge by default.
- Keep the system cheap enough to run on demand over most or all of a map.
- Render the result as a distinct route overlay, not as the same visual language as tactical travel.

## Non-Goals

- Do not feed the low-resolution route directly into `movementSystem`.
- Do not replace the local Dijkstra/pathfinding preview used by `PF`.
- Do not promise exact step-by-step movement along the planned route.
- Do not require save/load persistence in the first prototype.
- Do not build a complex multi-route map journal until the basic gameplay value is proven.

## Core Model

The terrain map may be `1024x1024`, while the strategic navigation grid could be `256x256`. One strategic cell therefore represents a small block of full-resolution terrain pixels.

The player selects a distant destination. The route-planning runtime computes a route on the low-resolution grid, then projects the resulting cell path back into full map space for drawing.

The committed route is stored as overlay state only:

- source position
- destination position
- low-resolution route cells
- projected full-map polyline
- route quality or uncertainty metadata
- cost/settings version used to compute it

Committing a route means "remember and display this plan." It does not queue movement.

## Relationship To Current Pathfinding

Current `PF` remains tactical and executable:

- local Dijkstra field centered on the player
- circular range mask inside the square local field
- hover path preview
- click starts explicit travel activity
- committed travel path is the original exact local path and is trimmed as the player moves

Long-distance route planning is strategic and non-executable:

- larger or full-map range
- low-resolution navigation grid
- route overlay can stay visible while the player uses normal local `PF`
- route can inform the player's choices but does not move the player by itself

Use the word `route` for the strategic system and `path` for tactical movement where possible. This reduces UI ambiguity.

## Knowledge And Uncertainty

The player-facing version should eventually account for what the player knows. The recommended model is hybrid:

- Use authored terrain cost globally so the player can reason about obvious landform structure.
- Add uncertainty penalties in undiscovered or poorly known areas.
- Let navigation skill, tools, maps, or scouting reduce uncertainty penalties.
- In dev mode, allow a live/full-knowledge override for testing.

This avoids total blindness while still making exploration and map knowledge matter.

Unknown terrain should usually be expensive, not impossible. That lets routes cross unknown areas when needed but makes known corridors feel valuable.

## Cost Model

The strategic route cost should reuse the same concepts as movement without being identical to tactical movement cost.

Likely inputs:

- downsampled slope cost
- downsampled height/uphill tendency
- downsampled water or wetness cost
- discovery/known-terrain uncertainty
- optional resource/safety/biome modifiers later
- optional weather/time modifiers later

The first prototype can compute a low-resolution cost grid from existing slope/height/water image data. Later versions can cache or incrementally rebuild the grid when map data or relevant settings change.

## Range And Skill Progression

Route planning should be a skill-gated capability.

Possible progression axes:

- maximum planning radius
- reduced unknown-terrain penalty
- smoother or less noisy route
- more accurate cost weighting
- ability to maintain more than one planned route
- ability to estimate travel difficulty or resource risk along the route

The first implementation can use a simple circular mask around the player on the low-resolution grid. Range can grow with skill or tools.

## Visual Language

The route overlay must look different from the tactical path overlay.

Recommended style:

- soft or dashed line
- lower opacity than tactical path
- slightly wider corridor instead of one exact pixel line
- desaturated or map-ink color
- uncertainty can widen/fade/noise the line in poorly known areas

The visual message should be "planned route" rather than "exact path to walk."

An alternative or complementary visualization is route markings instead of a continuous line. For each sampled route point, compute the tangent from neighboring route cells and draw a small directional arrow or marker at that coordinate. Drawing one marker every `n` route steps keeps the overlay sparse and readable, and the spacing can become an adjustable setting.

This has several advantages:

- It distinguishes strategic route planning from tactical pathfinding immediately.
- It reads more like trail/map markings the player follows by interpretation.
- It avoids implying that the low-resolution route is an exact movement path.
- Marker spacing, opacity, and size can express route confidence or skill.
- Tangent direction can be computed cheaply from previous/next route cells after backtracking.

For uncertain or poorly known route segments, markers could become wider, fainter, less frequent, or more irregular. This preserves the idea that the route is a navigation plan rather than a precise path.

## UI Concept

Potential activity/button naming:

- `Route`
- `Nav`
- `Plan Route`

The system should not be merged into the current `PF` button unless we have a very clear two-stage UI. The safer first version is a separate route-planning mode or dev control.

Basic flow:

1. Player activates route planning.
2. Player selects distant destination.
3. System computes rough route.
4. Overlay displays the route.
5. Player can commit, replace, or clear the route.
6. Player still uses normal local `PF` to actually travel.

## Architecture Proposal

Keep this separate from the existing tactical pathfinding owners.

Suggested modules:

- `src/gameplay/routePlanningRuntime.js`: owns route state, compute/commit/clear API, snapshots.
- `src/gameplay/routePlanningCostModel.js`: builds low-resolution strategic cost grid.
- `src/ui/overlays/routePlanningOverlay.js`: draws projected route/corridor.
- Optional `src/gameplay/routePlanningRegistry.js`: data-driven skill/settings defaults later.

Do not overload these modules:

- `pathfindingPreviewRuntime.js`
- `travelPlanningRuntime.js`
- `movementSystem.js`

The existing pathfinding stack remains responsible for executable local travel only.

## State Ownership

Route planning should own its own runtime state. Other systems can read snapshots but should not mutate the route directly.

Initial state shape could include:

```js
{
  active: false,
  committed: false,
  source: { x, y },
  destination: { x, y },
  gridSize: { width: 256, height: 256 },
  cells: [],
  polyline: [],
  rangeRadius: 0,
  quality: 1,
  uncertainty: 0,
  version: 0
}
```

If this later becomes save-worthy, persist only compact route intent and cells/polyline if needed. Do not persist large temporary Dijkstra fields unless there is a proven need.

## Algorithm Notes

A low-resolution Dijkstra field works if we want a cost-to-all-cells map from the player. A* may be cheaper if we only need one destination. The current discussion assumes Dijkstra because it aligns with existing pathfinding concepts and gives useful future affordances, such as hover-to-anywhere route preview inside the allowed strategic range.

Prototype options:

- Dijkstra from player over the low-resolution allowed mask, then backtrack from hover/destination.
- A* from player to selected destination for one-off committed routes.

Recommended first prototype:

- Build low-resolution cost grid.
- Run Dijkstra from the player's low-resolution cell inside the strategic range mask.
- On hover/click, backtrack the route if reachable.
- Project route cells back to full map space for overlay drawing.

## Implementation Phases

Phase 1: Dev Prototype

- Build `256x256` strategic grid from existing map data.
- Compute one route to a clicked destination.
- Draw a distinct rough route overlay.
- No movement integration.
- No persistence.

Phase 2: Player-Facing Constraints

- Add range mask.
- Add known-terrain/uncertainty cost.
- Add skill/settings hooks for range and uncertainty.
- Add dev override for live/full-knowledge route planning.

Phase 3: Committed Route State

- Allow one active committed route.
- Clear/replace route.
- Keep route visible while using other activities where appropriate.
- Decide whether route state should be saved.

Phase 4: Optional Route Following Bias

- Local `PF` may optionally bias toward the committed route corridor.
- This should still compute real local movement paths.
- Do not implement this until the overlay-only route has proven useful.

## Open Questions

- Should route planning be a primary activity, a secondary activity, or a dev/map skill panel?
- How much should unknown terrain penalize route choice at low skill?
- Should route plans decay or become stale when new knowledge contradicts them?
- Should weather/time/resource state affect strategic route cost immediately, or only later?
- Should a committed route show estimated total risk/cost, or only the visual route at first?
- Should the player be able to name/store multiple routes later?

## Recommendation

Build it as an overlay-only strategic route system first. Keep the implementation separate from tactical pathfinding and movement. Use a low-resolution Dijkstra grid, start with dev-mode testing, then add knowledge/range/skill constraints once the visual and gameplay value is clear.

## Prototype Findings

The current branch implements the first usable route-planning prototype:

- `Nav` is a separate strategic activity-style mode.
- Route planning builds a low-resolution Dijkstra field from the current planning anchor.
- Hover previews show the full projected route as small map-space points, matching the tactical pathfinding preview behavior at larger scale.
- Clicking commits a route segment as overlay state only. It never queues movement.
- Committed route segments can be chained through waypoints.
- Waypoints are selectable on the map. Leaf waypoints can be deleted; middle-waypoint deletion is intentionally avoided because it implies deleting downstream branches.
- Committed route arrows render into a cached `1024x1024` texture with image smoothing disabled, so they match the pixel-sharp terrain style.
- The final route overlay can be shown outside `Nav` through the Inspect route toggle.
- The RD Route tab exposes runtime tuning for arrow appearance, preview dots, planning-bias weights, debug overlays, and clearing the route.

Several uncertainty experiments were tested and then removed:

- Random neighbor selection during path extraction made routes jittery without producing useful strategic differences.
- Ranked worse-neighbor extraction was deterministic but tended to fail or produce locally awkward routes.
- Discovery-gated blur of the Dijkstra field preserved too much of the original global gradient and mostly lost obstacle detail.
- Discovery-gated noise distortion of Dijkstra values changed the field, but the gameplay result was not clear enough to justify the added complexity.

The more promising direction is to affect the route cost model before Dijkstra runs instead of distorting the completed Dijkstra field. The branch now keeps NAV-only planning-bias settings that add or multiply slope, height, water, and slope-cutoff values. This keeps the pathfinding deterministic and gives a clean future hook for traits, skills, status effects, or conditions such as:

- afraid of heights: increase height/uphill weight
- overconfident on slopes: reduce slope weight or increase slope cutoff
- cautious: increase terrain penalties broadly
- water-avoidant: increase water weight

Current open items before this should become a deeper gameplay system:

- Decide which route-planning bias values are player-facing, status-driven, or dev-only.
- Decide whether route plans should persist in save data.
- Decide whether route planning should support multiple named plans or remain one route graph.
- Decide how known terrain/discovery should influence route planning without making the output feel arbitrary.
- Decide whether local tactical `PF` should ever inherit status/skill modifiers, or whether this remains strategic planning only.
