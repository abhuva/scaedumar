# Wiki, Tutorial, Event, And Dialog Design

## Purpose

This document captures the planned direction for an in-game wiki/help system and
its relationship to tutorials, player-facing encounters, dialogs, and the journal.

The core decision is to separate human-facing content from gameplay structure:

- Content files own prose, headings, images, and links.
- Structural encounter/event files own triggers, queueing, time behavior, choices,
  conditions, outcomes, and persistence.

This keeps writing and translation practical while preserving explicit runtime
ownership for gameplay mutation.

## Goals

The system should support:

- In-game wiki/help pages authored as Markdown.
- Reusing the same Markdown content for the website through Zensical.
- Contextual help mode where the cursor becomes a `?` and clicked UI/world
  targets open a relevant wiki page.
- Tutorial encounters that can reuse wiki article content instead of requiring a separate
  tutorial-only framework.
- A journal that records tutorials, discoveries, decisions, warnings, and
  objective notes.
- Later scenario encounters and dialogs with choices, conditions, consequences, and
  multi-step progression.
- Future localization by keeping most translatable text in content files rather
  than mixing it deeply into gameplay data.

## Non-Goals For The First Version

The first version should not become:

- A full quest engine.
- A general scripting language.
- A dedicated tutorial system separate from events.
- A branching RPG conversation framework with deep NPC memory.
- A cutscene or camera-choreography system.
- A localization pipeline.
- A complex authoring UI.
- A way to mutate gameplay directly from Markdown metadata.

## Content Layer

Markdown content should live under a dedicated docs subfolder, for example:

```txt
docs/wiki/
  index.md
  tutorial/
    first-steps.md
  gameplay/
    travel.md
    inspect.md
    time.md
    gathering.md
    water.md
    rest.md
    hunting.md
  survival/
    fatigue.md
    hydration.md
    nutrition.md
  world/
    terrain.md
    tracks.md
    knowledge-map.md
```

The exact folder structure can evolve because file paths are only discovery
locations. Runtime references use article IDs, not paths.

### Content ID Resolution

The canonical article ID is the `id` in Markdown frontmatter:

```md
---
id: gameplay.travel
title: Travel
---
```

The content registry scans the configured wiki roots, reads article
frontmatter, and builds an ID-to-file registry:

```js
{
  "gameplay.travel": {
    path: "docs/wiki/gameplay/travel.md",
    title: "Travel"
  }
}
```

Encounter definitions, journal entries, and UI help targets reference `gameplay.travel`.
Markdown prose links use normal CommonMark file links so the same files work in
Obsidian and Zensical:

```md
[Travel](gameplay/travel.md)
[Inspect](../gameplay/inspect.md)
```

At import time, the content registry resolves those file links relative to the
source article, reads the target article frontmatter ID, and rewrites the
runtime body link to the target article ID. The in-game panel therefore opens
`gameplay.travel`, while the authored Markdown remains a valid file link.

This means `travel.md` can later move to
`docs/wiki/actions/movement/travel.md` without changing saved event state,
journal entries, or UI `data-wiki-id` attributes, as long as the frontmatter ID
stays `gameplay.travel` and authored Markdown links are updated to the new file
path.

If an article has no frontmatter ID, the registry may derive a temporary ID from
the relative path for development, but that derived ID should not be used by
events, save state, or stable UI targets. Referenced articles need explicit
frontmatter IDs.

Duplicate IDs are invalid and should fail the registry build/load with a clear
error.

### Markdown Format

Wiki pages must use CommonMark links because Zensical expects normal Markdown
link syntax:

```md
[Travel](gameplay/travel.md)
[Inspect](../gameplay/inspect.md)
```

Obsidian-style links such as `[[Travel]]` should not be the canonical authoring
format for these pages. Runtime-ID links such as `[Travel](gameplay.travel)` are
also not valid authored wiki links because they are dead links for Obsidian and
Zensical. The registry resolves file links to runtime IDs during import.

### Article Metadata

Article frontmatter should stay focused on presentation and indexing:

```md
---
id: tutorial.first_steps
title: Read the Land
summary: Learn the basic survival loop.
cover: tutorial/read-the-land.png
category: tutorial
tags: [travel, inspect, time]
related: [gameplay.travel, gameplay.inspect]
---

# Read the Land

Survival depends on where you move, what you know, and how much time you spend.

Use **PF** to preview travel before committing.
```

Good article metadata:

- `id`
- `title`
- `summary`
- `cover`
- `category`
- `tags`
- `related`
- `sortOrder`

Avoid article metadata for:

- event triggers
- inventory mutation
- condition changes
- activity starts or stops
- stat checks
- random outcome tables
- quest progression
- scenario-state mutation

Rule of thumb: if changing it affects gameplay behavior, save compatibility, or
state transitions, it belongs in structural data, not content metadata.

## Structure Layer

Structural files describe runtime behavior and reference content IDs. They can
use JSON or YAML. YAML may be more author-friendly, while JSON remains useful as
the normalized runtime/interchange shape. These files create player-facing
encounters or journal notices; Markdown files remain presentation-neutral prose.

Example article-backed tutorial event:

```yaml
id: tutorial.first_steps
contentId: tutorial.first_steps
trigger:
  type: gameplay_started
  once: true
presentation:
  surface: encounter
  level: blocking
  mode: article
  time:
    mode: pause
journal:
  addOnClose: true
```

The event definition owns when and how the content appears. The Markdown article
owns what the player reads.

Do not use Markdown frontmatter tags to make an article become an encounter.
The same Markdown article can appear in the Wiki side dock, a Journal entry, or
a blocking Encounter. The structural definition chooses the surface:

- `surface: encounter`: center-screen focused panel for blocking tutorials,
  dialogs, and decisions.
- `surface: journal`: non-blocking journal/feed/status presentation.
- `surface: silent`: no direct UI beyond state or journal outcomes.

For compatibility, missing `surface` defaults from `level`: blocking means
`encounter`, notice means `journal`, and silent means `silent`.

Player-facing UI and docs should use Encounter for authored blocking/tutorial/dialog
definitions. Internal code can keep `eventRuntime`, `eventDebug*` DOM IDs, storage
keys, and `assets/data/events/` paths short-term for compatibility; those names
are legacy implementation details, not the player-facing concept.

Content validation failures must be visible on the title screen during startup
and map load. Broken wiki links, missing encounter `contentId` references, and
duplicate map-local event IDs are authoring errors; the default-map loader should
not hide them by falling back to another candidate or to placeholder textures.
`RD > Encounters > Debug` can expose the same validation as a read-only in-game
health check, including article and encounter counts plus the latest validation
details.

Encounter definitions may include semantic UI highlight requests under
`presentation.uiHighlights`. These should use stable target IDs such as
`hud.inspect` or `hud.activity.pathfinding`, not DOM IDs. A UI owner maps those
semantic IDs to elements and applies color, thickness, and pulse presentation
while the encounter is active.

## Event And Tutorial Model

Tutorials should use the same event system as scenario events. There is no clear
benefit to maintaining a separate tutorial framework.

The first tutorial can be a simple article-backed blocking event:

1. Gameplay starts.
2. Event runtime queues `tutorial.first_steps` if it has not been seen.
3. Encounter panel opens `contentId: tutorial.first_steps` in the center of the screen.
4. Time pauses while the tutorial is open.
5. Closing the article marks the event as seen.
6. A journal entry is added if configured.
7. Previous game speed is restored.

This proves wiki content, event triggering, queueing, time behavior, journal
integration, and persistence without building the richer choice/dialog system
immediately.

## Encounter Presentation Levels

Events should support different interruption strengths:

- `blocking`: opens a modal or focused panel and usually pauses or changes game
  speed.
- `notice`: adds a lightweight notice and journal entry without opening a
  blocking modal.
- `silent`: updates journal/state without interrupting the player.

Example:

```yaml
presentation:
  surface: encounter
  level: blocking
  mode: article
  time:
    mode: pause
```

Low-priority discoveries should generally become journal entries rather than
blocking dialogs.

## Time Behavior

Time behavior should be configured per event rather than hardcoded globally.

Supported modes should include:

- `pause`: set game speed to `0x` while open, then restore the previous speed.
- `keep`: leave current game speed unchanged.
- `setSpeed`: set a configured speed while open, then restore the previous
  speed.

Example:

```yaml
presentation:
  time:
    mode: setSpeed
    speed: 1
```

The default for blocking tutorial and dialog events should likely be `pause`.

## Queueing

The event runtime should be queue-based:

- Triggered blocking events enter a queue.
- If no event is active, the highest-priority queued blocking event opens.
- Only one blocking event is active at a time.
- Notices and silent events do not block the queue.
- Closing the active event advances to the next eligible queued event.

The queue should prevent tutorial, discovery, warning, and scenario events from
competing for the same UI surface.

## Journal

The journal should exist from the start because tutorials, discoveries,
scenario notes, and later objectives need a persistent player-facing memory.

Initial journal entry shape:

```json
{
  "id": "journal_001",
  "sourceEventId": "tutorial.first_steps",
  "contentId": "tutorial.first_steps",
  "timeTick": 120,
  "category": "Tutorial",
  "tags": ["tutorial", "travel", "inspect"]
}
```

The journal can render the referenced content article or a shorter journal
summary later. The first version can keep entries simple:

- list entries
- open referenced article/content
- record time/category/tags
- persist entries

Potential categories:

- `Tutorial`
- `Discovery`
- `Decision`
- `Objective`
- `Warning`

## Wiki Help Mode

A dedicated help mode should allow contextual lookup:

1. Player toggles Wiki/Help mode.
2. Cursor changes to `?`.
3. Next click asks the clicked target for a wiki/content ID.
4. If a target exists, open the wiki panel at that article.
5. If no specific target exists, fall back to a contextual or general article.

DOM UI can expose IDs directly:

```html
<button data-wiki-id="gameplay.travel">PF</button>
<button data-wiki-id="gameplay.inspect">Inspect</button>
<button data-wiki-id="survival.fatigue">Fatigue</button>
```

Terrain and world targets can be added later through map-space hit testing or
context sampling:

```js
{
  type: "terrain",
  wikiId: "world.terrain"
}
```

UI targets are the easiest first slice because they can use `data-wiki-id`
without adding terrain hit-test complexity.

## Richer Events And Dialogs

Article-backed events are enough for tutorials and simple messages, but richer
scenario events need structural choices and outcomes.

Example hybrid event:

```yaml
id: tracks.fresh_wolf_sign
contentId: discoveries.fresh_wolf_sign
trigger:
  type: trail_discovered
  minStrength: 0.7
presentation:
  surface: encounter
  level: blocking
  mode: dialog
  time:
    mode: pause
choices:
  - id: mark
    labelKey: choices.mark_it
    consequenceVisibility: exact
    outcomes:
      - type: journal/add
        contentId: discoveries.fresh_wolf_sign
      - type: map/addMarker
        markerType: tracks
  - id: follow
    labelKey: choices.follow_it
    consequenceVisibility: hinted
    requires:
      activityAvailable: hunting
    command:
      type: core/activity/startHunting
  - id: ignore
    labelKey: choices.ignore
    consequenceVisibility: hidden
    close: true
```

This keeps prose in content while event structure handles gameplay logic.

## Multi-Step Dialog Planning

The first implementation can ship with one article or one node, but the model
should not block multi-step dialogs later.

A later node-based event can look like:

```yaml
id: tutorial.basic_loop
startNode: intro
nodes:
  intro:
    contentId: tutorial.first_steps
    choices:
      - id: continue
        next: travel
      - id: skip
        close: true
  travel:
    contentId: gameplay.travel
    choices:
      - id: continue
        next: inspect
  inspect:
    contentId: gameplay.inspect
    choices:
      - id: finish
        outcomes:
          - type: journal/add
            contentId: tutorial.first_steps
        close: true
```

The first runtime can normalize article-only events into a one-node internal
shape so later dialog support is an extension instead of a rewrite.

## Consequence Visibility

Choice consequences should support different clarity levels:

- `exact`: show precise mechanical effects, such as cost or reward.
- `hinted`: describe likely cost or risk without exact numbers.
- `hidden`: show no explicit mechanical preview.
- `knowledgeBased`: reveal exact or improved information only if the player has
  enough knowledge, technique, or confidence.

This supports a mix of transparent tutorials, uncertain survival decisions, and
knowledge-gated expert readings.

## Runtime Ownership

Suggested owner modules:

- `contentRegistry`: loads and resolves content IDs to Markdown articles and
  metadata.
- `wikiRuntime`: owns reference article browsing, navigation history, and article opening.
- `wikiPanelRuntime`: renders the supported Markdown subset into the side-docked Wiki.
- `wikiModeRuntime`: owns `?` mode and click-to-wiki target resolution.
- `eventRuntime`: owns triggers, queue, active event state, node progression, presentation requests, and event persistence. Player-facing blocking output is now called an Encounter to avoid confusion with the technical `EventBus`.
- `encounterPanelRuntime`: renders active blocking encounters in the center
  focus panel with choices, Escape handling, and focus trap.
- `journalRuntime`: owns journal entries, snapshots, and persistence.

The existing technical event bus remains only for post-change notifications and
invalidation. It should not become the scenario event or dialog command system.

## Mutation Guardrail

The event/dialog runtime should not directly mutate unrelated gameplay domains.

Good:

```js
commandBus.dispatch({ type: "core/activity/startGathering" });
```

Good:

```js
journalRuntime.addEntry({ contentId: "tutorial.first_steps" });
```

Bad:

```js
eventRuntime.state.activity.type = "gathering";
```

Bad:

```md
---
removeItem: water_skin
startActivity: rest
---
```

Gameplay mutation should stay with explicit commands and runtime owners.

## Data Locations

Support both global and map-local event definitions:

```txt
assets/data/events/
  tutorials.yaml
  survival.yaml
assets/map3/events.yaml
```

Global definitions should cover reusable tutorials and generic survival events.
Map-local definitions should cover scenario-specific events, objectives, and
story beats.

For content, keep the canonical Markdown under `docs/wiki/` so Zensical and the
game can use the same source. If the game cannot load from `docs/` in packaged
Tauri builds, the build/package step can copy the selected wiki subset into the
runtime asset output while preserving content IDs.

## Persistence

Persisting event and journal state early is useful because tutorials and events
quickly become broken if seen/dismissed state is lost.

Persist:

- seen/dismissed event IDs
- current active event and node if saved mid-event
- queued blocking events if needed
- journal entries
- important choice history
- event-local flags/cooldowns for repeatable events

Avoid mixing mutable player progress into authored content files. A future
savegame layer is the cleaner long-term destination. Until then, use a clearly
mutable runtime sidecar or save payload rather than editing article files.

Potential temporary sidecar:

```txt
scenario_state.json
```

## Localization Direction

The content/structure split supports translation because structural IDs remain
stable while content resolves through the active language.

Possible future layout:

```txt
content/en/wiki/tutorial/first-steps.md
content/de/wiki/tutorial/first-steps.md
```

or:

```txt
docs/wiki/en/tutorial/first-steps.md
docs/wiki/de/tutorial/first-steps.md
```

The structural event still references the same content ID:

```yaml
contentId: tutorial.first_steps
```

The active language decides which Markdown file satisfies that ID.

Choice labels can later move to localization keys:

```yaml
choices:
  - id: mark
    labelKey: choices.mark_it
```

## First Implementation Slice

A practical first slice:

1. Add `docs/wiki/` article convention and a small first set of pages.
2. Add a content registry that can resolve article IDs and metadata.
3. Add a wiki panel that renders a safe CommonMark subset.
4. Add a journal runtime and minimal journal panel/list.
5. Add `data-wiki-id` to key gameplay HUD controls.
6. Add `?` wiki mode for DOM UI targets.
7. Add an event runtime with article-backed blocking encounters, queueing, pause
   behavior, seen-state, and journal-on-close.
8. Add `tutorial.first_steps` as the first authored tutorial event.

Suggested first pages:

```txt
docs/wiki/tutorial/first-steps.md
docs/wiki/gameplay/travel.md
docs/wiki/gameplay/inspect.md
docs/wiki/gameplay/time.md
```

The first tutorial should be short and link outward to deeper wiki articles
rather than trying to explain every system in a modal.

## Open Questions

- Should the game load Markdown directly from `docs/wiki/`, or should packaging
  copy/build the wiki subset into `assets/wiki/`?
- Should `docs/wiki/index.md` be a generated index or manually authored?
- Should journal entries render full articles, article summaries, or dedicated
  journal snippets?
- Should notices use a toast UI immediately, or only appear in the journal for
  the first version?
- Should map-local event files be allowed to override global event IDs, or only
  add new IDs?
- Should a blocking article close button always mark the event seen, or should
  events be able to require an explicit final action?
