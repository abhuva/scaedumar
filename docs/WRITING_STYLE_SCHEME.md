# Writing Style Scheme

## Purpose

This document defines the baseline voice for player-facing game text.

Use it when writing or revising:

- Wiki articles under `docs/wiki/`
- Encounter/tutorial/dialog prose
- Journal entries
- Warning text
- Choice labels and consequences
- Player-facing content summaries

Do not use this as the voice for technical developer docs, debug-only notes, code comments, or architecture documents unless they intentionally quote player-facing copy.

## Core Direction

Write for a quiet top-down survival game about reading terrain, managing the body, and making careful movement decisions.

The voice should feel grounded, observant, restrained, and practical. The world is material: terrain, weather, water, plants, tracks, hunger, fatigue, weight, distance, and light. The player is not a hero or chosen figure. They are a person making decisions under constraint.

Knowledge is earned by looking, moving, testing, and remembering.

## Registers

### Encounter Voice

Use this for tutorials, blocking messages, warnings, and decision moments.

- Write in second person.
- Keep it immediate, sensory, and grounded.
- Focus on what the player notices: ground, slope, wetness, tracks, light, weight, thirst, fatigue, distance.
- Prefer short paragraphs of one to three sentences.
- Let mood come from observation and consequence, not drama.
- Explain only what the player needs right now.
- Mention controls only when necessary, and keep them plain.
- End with a practical next step or decision pressure.

Encounter text should feel close to the body and the moment.

### Field Note Voice

Use this for wiki/reference text and longer journal explanations.

- Write as practical survival notes, not system documentation.
- Stay clear and useful.
- Explain mechanics through grounded language first, then technical terms if needed.
- It is acceptable to name UI controls and systems, but tie them to player action.
- Prefer concise sections with concrete examples.
- Use calm, exact language.

Field notes can be more explicit than encounters, but they should still sound like knowledge from the world rather than a manual pasted into the game.

### Journal Voice

Use this for compact recorded entries.

- Keep entries short.
- Record an observation, lesson, warning, or decision.
- Prefer one compact image plus the practical meaning.
- Do not celebrate completion.
- Do not repeat full wiki text.

## Style Rules

Use:

- Concrete nouns and verbs.
- Physical cause and consequence.
- Short sentences when the player must act.
- Practical ambiguity: the player can infer, test, and decide.
- Links outward for deeper explanation instead of overloading the current text.

Avoid:

- Fantasy cliches such as "ancient wilderness", "brave survivor", "the land whispers", or "your destiny".
- Apocalypse cliches such as "ruined world", "last hope", or "hostile wasteland".
- Tutorial mascot language such as "Great job", "Now click here", or "You learned".
- Quest language such as "mission", "objective", "quest giver", or "reward" unless deliberately used in a technical/debug context.
- Generic game UI language unless the text is explicitly technical.
- Overly poetic phrasing that draws attention to itself.
- Lore dumps.
- Sarcasm, jokes, modern slang, or motivational language.

## Preferred Vocabulary

Prefer:

- read
- trace
- test
- spend
- carry
- notice
- choose
- commit
- cross
- gather
- rest
- mark
- remember
- ground
- slope
- low ground
- wetness
- shade
- track
- sign
- path
- weight
- thirst
- fatigue
- distance
- light
- cover
- cost
- risk
- time
- reach
- route
- condition
- attention
- knowledge

Avoid or use rarely:

- adventure
- quest
- objective
- mission
- enemy
- loot
- biome
- resource node
- mechanic
- stat
- buff
- debuff

These words are acceptable in explicitly technical/debug/reference sections, but they should not dominate player-facing prose.

## Formatting

Encounters:

- Use two to four short paragraphs.
- Use one to three short choices when needed.
- Keep the main text readable at a glance.

Warnings:

- Use two to three short paragraphs.
- Make the condition and pressure clear.
- Avoid alarmist phrasing unless the situation is immediately severe.

Wiki/field notes:

- Use short headings.
- Use concise paragraphs.
- Give practical examples.
- Name controls only when useful.

Journal entries:

- Use one compact observation plus the lesson or decision recorded.

## Example Transformation

Input:

```txt
Explain pathfinding. The player can preview reachable tiles and click to move.
```

Encounter Voice:

```txt
Before you move, you trace the land with your eyes.

Some routes ask for strength. Some ask for time. Some are not worth either.

Choose a place you can reach, then commit to the walk.
```

Field Note Voice:

```txt
Travel is planned before it is spent.

Use `PF` to read nearby routes before moving. The preview shows where you can reach and how costly the route will be. A short path through steep or wet ground can cost more than a longer path over easier land.
```

Journal Voice:

```txt
Movement noted: a route is a cost before it is a direction.
```

## Model Prompt

Use this prompt when asking an AI model to generate or revise player-facing game text:

```txt
Write player-facing text for a quiet top-down survival game about reading terrain, managing the body, and making careful movement decisions.

Use two related registers:

Encounter Voice:
Use this for tutorials, blocking messages, warnings, and decision moments.
- Write in second person.
- Keep it immediate, sensory, and grounded.
- Focus on what the player notices: ground, slope, wetness, tracks, light, weight, thirst, fatigue, distance.
- Prefer short paragraphs of 1-3 sentences.
- Let the mood come from observation and consequence, not drama.
- Explain only what the player needs right now.
- Mention controls only when necessary, and keep them plain.
- End with a practical next step or decision pressure.

Field Note Voice:
Use this for wiki/reference/journal text.
- Write as practical survival notes, not system documentation.
- Still clear and useful.
- Explain mechanics through grounded language first, then technical terms if needed.
- It is acceptable to name UI controls and systems, but tie them to player action.
- Prefer concise sections with concrete examples.
- Use calm, exact language.

General style:
- Tone: observant, restrained, practical, slightly austere.
- Atmosphere: quiet survival, uncertainty, attention, physical cost.
- The world is not magical or theatrical. It is material: terrain, weather, water, plants, tracks, hunger, fatigue.
- The player is not a hero. They are a person making decisions under constraint.
- Knowledge is earned by looking, moving, testing, and remembering.
- Use concrete nouns and verbs.
- Avoid overexplaining.
- Avoid motivational language.
- Avoid quest language.

Avoid:
- Fantasy cliches: "ancient wilderness", "brave survivor", "the land whispers", "your destiny".
- Apocalypse cliches: "ruined world", "last hope", "hostile wasteland".
- Tutorial mascot voice: "Great job", "Now click here", "You learned".
- Generic game UI language unless the text is explicitly technical.
- Overly poetic phrasing that draws attention to itself.
- Lore dumps.
- Sarcasm, jokes, modern slang.
- Melodrama.

Vocabulary to prefer:
- read, trace, test, spend, carry, notice, choose, commit, cross, gather, rest, mark, remember
- ground, slope, low ground, wetness, shade, track, sign, path, weight, thirst, fatigue, distance, light, cover
- cost, risk, time, reach, route, condition, attention, knowledge

Vocabulary to avoid or use rarely:
- adventure, quest, objective, mission, enemy, loot, biome, resource node, mechanic, stat, buff, debuff
- unless writing explicitly technical/debug/reference text

Formatting:
- Encounters: 2-4 short paragraphs, then 1-3 short choices if needed.
- Warnings: 2-3 short paragraphs, direct and readable.
- Wiki/Field notes: short headings, concise paragraphs, practical examples.
- Journal entries: one compact observation plus the lesson or decision recorded.
```
