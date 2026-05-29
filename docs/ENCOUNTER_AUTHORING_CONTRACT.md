# Encounter Authoring Contract

## Purpose

This document defines the authored data contract for player-facing Encounters.

Use it when editing JSON definitions under `assets/data/events/` or map-local `events.json` files. It covers structure and validation only. Player-facing prose belongs in Markdown under `docs/wiki/` and should follow `docs/WRITING_STYLE_SCHEME.md`.

This contract is stable for the current implementation slice. Final tutorial, warning, journal, and map-specific content is intentionally deferred.

## Terminology

- **Encounter**: player-facing tutorial, warning, dialog, or notice definition.
- **Event runtime**: current internal module/data naming for Encounter definitions.
- **Trigger**: gameplay signal that asks the Encounter runtime to evaluate definitions.
- **Article**: Markdown content referenced by `contentId`.

The technical `EventBus` is separate. Encounter triggers are not general mutation events.

## Definition Shape

```json
{
  "id": "tutorial.example",
  "contentId": "tutorial.example",
  "priority": 0,
  "trigger": {
    "type": "example_started",
    "once": true,
    "exclusive": true
  },
  "presentation": {
    "level": "blocking",
    "surface": "encounter",
    "mode": "article",
    "time": {
      "mode": "pause"
    },
    "uiHighlights": [
      {
        "target": "hud.activity.pathfinding",
        "color": "#f4d35e",
        "thickness": 3,
        "pulse": true
      }
    ]
  },
  "journal": {
    "addOnClose": true,
    "category": "Tutorial",
    "tags": ["tutorial"]
  }
}
```

## Required Fields

- `id`: stable unique Encounter ID. Global and map-local definitions cannot reuse the same ID.
- `contentId`: article ID from wiki Markdown frontmatter.
- `trigger.type`: gameplay trigger name emitted by command/runtime owners.

## Trigger Policy

- `once: true` suppresses the Encounter after it is seen.
- `exclusive: true` consumes this trigger call when the definition is eligible. The highest-priority eligible exclusive definition wins; lower-priority matching definitions are skipped for that same trigger call.
- `maxCount` limits repeatable definitions.
- `cooldownTicks` suppresses repeats until enough game ticks have passed.
- `minStrength` and `maxStrength` gate triggers that provide `payload.strength`.

The runtime records skipped reasons in RD Encounters debug output.

## Presentation

`presentation.level` controls runtime behavior:

- `blocking`: queues an active Encounter panel.
- `notice`: records a journal-style notice without blocking.
- `silent`: processes state/journal outcomes without notice feedback.

`presentation.surface` controls where content appears:

- `encounter`: center-screen blocking panel.
- `journal`: journal/feed notice path.
- `silent`: no visible surface.

If `surface` is omitted, it is derived from `level`.

`presentation.time.mode` controls time while the Encounter is active:

- `pause`: set game speed to `0` and restore it on close.
- `keep`: leave time untouched.
- `setSpeed`: set a specific speed with `time.speed` and restore on close.

## UI Highlights

`presentation.uiHighlights` points at semantic target IDs, not DOM IDs.

Current valid targets:

- `hud.inspect`
- `hud.activity.pathfinding`
- `hud.activity.gathering`
- `hud.activity.water`

Validation fails if an authored highlight target is not in the semantic target list.

## Dialog Nodes

Single-article definitions can use top-level `contentId`.

Multi-node dialogs use `nodes`:

```json
{
  "startNode": "intro",
  "nodes": {
    "intro": {
      "contentId": "tutorial.example",
      "choices": [
        {
          "id": "continue",
          "label": "Continue",
          "next": "details"
        }
      ]
    },
    "details": {
      "contentId": "gameplay.travel",
      "choices": [
        {
          "id": "close",
          "label": "Close",
          "close": true
        }
      ]
    }
  }
}
```

Choices may:

- move to another node with `next`
- close the Encounter with `close: true`
- dispatch one command through `command`
- apply supported `outcomes`

Commands are routed through the injected command dispatcher. Encounter runtime does not mutate gameplay owners directly.

Supported outcomes:

- `journal/add`
- `event/setFlag`
- `event/clearFlag`

Unsupported outcomes block the choice and show an Encounter error.

## Validation

Startup, map event reload, and RD Validate Content check:

- article `related` IDs
- Markdown file links
- Encounter `contentId` references, including nested nodes and journal outcomes
- duplicate global/map-local Encounter IDs
- semantic UI highlight targets

Validation failures are shown on the title/status surface and stop hidden fallback behavior.

## Temporary Proof Fixture

`assets/map3/events.json` is intentionally kept as a temporary map-local proof fixture. It verifies the real map-local loading, validation, trigger, `exclusive`, journal, and highlight paths inside the app.

Replace or remove that fixture when production map-local content begins.
