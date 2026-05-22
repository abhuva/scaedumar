# Survival Systems Design

## Purpose

This note captures the current design direction for the systems that sit behind
activity-based gameplay: inventory, containers, skills, player condition, and
longer-term character persistence.

The goal is not to specify every item or stat now. The goal is to keep future
implementation aligned with the intended nomadic survival loop:

>[!info]+ Gameplay Loop
> Plan route / action -> travel / actions costs time and (body) resources -> perform activity ->
> gain or lose resources -> adapt.

These systems should support terrain, movement, scouting, and scenario pressure.
They should not become generic RPG systems detached from the game loop.

## Core Principles

- Add stats and skills only when they are used by real gameplay systems.
- Prefer consequences over abstract meters.
- Treat inventory as a survival-planning tool, not a loot-collection chore.
- Support caches, camps, bundles, and placed containers from the start.
- Keep authored scenario defaults separate from mutable savegame data.
- Use activity outcomes to drive inventory, skill practice, condition changes,
  and event hooks.

## Inventory Model

Inventory should be built as a generic container system, not as a special player
list. The player is only one possible owner of a container.

Potential container owners include:

- Player carried inventory.
- Worn bags, pouches, packs, and hides.
- Dropped bundles.
- Camp caches.
- Tents and shelters.
- Corpses or remains.
- Pack animals or companions later.

### Item Definitions

Item definitions are static registry data. They describe what an item is, how it
stacks, how it is displayed, and what gameplay tags it has.

Example:

```json
{
  "id": "dry_wood",
  "name": "Dry Wood",
  "icon": "assets/items/dry_wood.png",
  "stackable": true,
  "maxStack": 20,
  "weight": 0.4,
  "bulk": 1,
  "tags": ["fuel", "wood"]
}
```

### Item Stacks And Instances

Most resources can be represented as stacks:

```json
{
  "itemId": "dry_wood",
  "quantity": 7
}
```

Unique or durable items should use instances:

```json
{
  "instanceId": "knife_001",
  "itemId": "bone_knife",
  "durability": 0.72,
  "modifiers": {
    "gatheringSpeed": 0.05
  }
}
```

This allows both simple resources and unique equipment without forcing every
item into one representation.

### Containers

A container owns item stacks and item instances.

Example:

```json
{
  "id": "player_pack",
  "owner": "player",
  "type": "personal",
  "slots": [],
  "maxWeight": 20,
  "maxBulk": 40
}
```

Placed containers should also have map-space entity data:

```json
{
  "id": "cache_001",
  "type": "container",
  "pixelX": 430,
  "pixelY": 210,
  "containerId": "container_cache_001",
  "icon": "bundle"
}
```

## Capacity: Avoid Starting With Tetris Inventory

The current recommendation is to avoid Diablo-style grid inventory for the first
implementation.

The more relevant decisions are:

- How much weight can the player carry?
- How bulky is the item?
- Does carrying it slow travel or increase exhaustion?
- Is the item worth caching and returning for later?
- Can better bags, bundles, sleds, or pack animals change the logistics?
- Do large resources force tradeoffs without requiring manual tile packing?

A first capacity model should use:

- `weight`: affects movement and exhaustion.
- `bulk`: limits awkward volume.
- `largeSlots`: optional special capacity for hides, logs, carcasses, poles, and
  other awkward items.

Example:

```json
{
  "maxWeight": 25,
  "maxBulk": 40,
  "largeSlots": 2
}
```

A bear hide can then be costly without using a grid:

```json
{
  "itemId": "bear_hide",
  "weight": 12,
  "bulk": 18,
  "large": true
}
```

A grid can be revisited later for specific containers if playtesting proves that
physical packing creates useful decisions instead of chores.

## Inventory UI Direction

Item UI should use sprites/icons rather than pure text once the first item set
exists.

The first UI should be robust before it is fancy:

- Left side: player inventory.
- Right side: nearby/open container.
- Icon tiles show item sprite and quantity.
- Selecting an item opens details and actions.
- Actions include `Move`, `Drop`, `Split`, `Use`, and later `Craft`.
- Drag and drop can be added later as a convenience, not as the only way to use
  the inventory.

This keeps the UI usable on different input devices and avoids implementing a
fragile drag-only system too early.

## Practice And Known Techniques

The current direction is to avoid a visible skill tree. A skill tree is likely
to feel too gamey and optimization-driven for this project.

Use two separate concepts instead:

- Practice: raw usage accumulation from relevant actions.
- Known techniques: discrete learned abilities acquired through the world.

Practice improves broad competence through use. Known techniques unlock methods,
recipes, options, and activity behaviors. Techniques are not bought with generic
experience points. They are learned through social interaction, events,
dialogue, observation, ritual, trade, mentorship, or rare discoveries.

This makes survival knowledge cultural and relational. Meeting people, helping
them, listening to them, and earning trust becomes a progression system.

Example practice sources:

- Foraging practice from successful or difficult plant gathering.
- Tracking practice from reading trails and following signs.
- Endurance practice from travel under load.
- Crafting practice from producing or repairing useful objects.

### Known Techniques

Known techniques should be grounded in the fiction of who taught them and why.
Practice may be a prerequisite, but it should not be the currency.

Examples:

- `smoke_meat`: learned from an elder, hunter, or camp event.
- `read_wolf_sign`: learned from a tracker, animal encounter, or scouting event.
- `bind_sprain`: learned from a healer or injury event.
- `find_water_under_snow`: learned from a winter survival scenario.
- `harvest_bark_without_killing_tree`: learned from a forager, elder, or spirit
  event.

Example:

```json
{
  "id": "smoke_meat",
  "name": "Smoke Meat",
  "tags": ["food", "preservation"],
  "unlockedBy": ["mentor", "event", "scenario_reward"],
  "effects": [
    {
      "type": "unlock_recipe",
      "recipeId": "smoked_meat"
    }
  ]
}
```

Possible social unlock requirements:

- Helped the teacher through an event.
- Brought a relevant item or resource.
- Demonstrated enough related practice to understand the lesson.
- Made a culturally meaningful choice.
- Observed the technique during a scenario.
- Earned trust with a camp, kin group, guide, or spirit.

Avoid simple unlocks like "pay 100 relation points." The unlock should feel like
a consequence of an encounter or relationship.

### Knowledge UI

The player-facing UI should be a `Knowledge`, `Learned Ways`, or `Known Ways`
panel rather than a skill tree.

Potential sections:

- Known techniques.
- Practiced domains.
- Recent lessons.
- Rumored knowledge.

Known techniques can be icon cards with short descriptions:

```text
Smoke Meat
Preserve raw meat at a smoking fire. Slower than cooking, but lasts longer.

Bind Sprain
Use cloth or bark fiber to reduce movement penalties from ankle injuries.

Read Wolf Sign
Tracking inspect shows wolf track freshness with better confidence.
```

## Candidate Skill Domains

Foraging:

- Improves gather chance and yield quality.
- Reduces misidentification risk.
- Improves inspect/scout estimates for plant resources.
- Known techniques might include medicinal plant identification, winter
  foraging, herb preservation, and non-destructive gathering.

Tracking:

- Improves track freshness reading.
- Improves direction estimates.
- Reduces false confidence.
- Known techniques might include blood trail reading, migration prediction,
  night tracking, and predator sign recognition.

Survival:

- Improves fire, shelter, food preservation, and camp logistics.
- Known techniques might include smoking meat, waterproofing, snow shelter, and
  cold camp setup.

Endurance:

- Improves fatigue resistance and recovery.
- Interacts with carried weight and terrain difficulty.

## Character Persistence And Scenario Balance

Character persistence should be controlled by campaign/scenario design.

Useful concepts:

- Scenario: authored map, objective, defaults, and rules.
- Campaign: sequence of scenarios.
- Savegame: mutable state for the current run or campaign.

A campaign may allow a character to persist across scenarios:

```json
{
  "carryCharacter": true,
  "carryInventory": "limited",
  "resetMapKnowledge": false,
  "maxStartingSkillTier": 3
}
```

A standalone scenario may enforce a fixed character:

```json
{
  "fixedCharacter": true,
  "allowPersistentCharacter": false
}
```

This avoids making every scenario balance around unbounded long-term character
progression.

Map-local defaults such as `npc.json` should remain authored scenario data.
Gameplay-mode saves should not overwrite those defaults. Savegames should be
separate and reference the scenario they belong to.

## Player Condition Instead Of Health

The preferred direction is to avoid a single health bar. The player should be
threatened by accumulating conditions and consequences.

Potential body state values:

- `fatigue`: immediate tiredness, recovers with rest.
- `exhaustion`: deeper accumulated strain, recovers slowly.
- `hydration`: dehydration pressure.
- `nutrition`: hunger and energy pressure.
- `warmth`: cold or heat survival pressure.
- `pain`: injury-driven action penalty.
- `load`: derived from inventory weight and bulk.

Potential mental state values:

- `calm`
- `alert`
- `anxious`
- `panicked`
- `despairing`
- `focused`
- `numb`
- `hopeful`

Mental states should affect perception, confidence, and automatic decisions, not
just numeric modifiers.

Examples:

- Panicked state may make path estimates unreliable.
- Despair may hide some high-risk options or make rest less effective.
- Focus may improve tracking or inspect precision.

## Injuries

Injuries should create specific gameplay consequences.

Examples:

- Sprained ankle: higher movement costs, steeper terrain risk, chance to worsen.
- Cut hand: slower crafting, infection risk, weaker tool use.
- Head injury: reduced inspect/tracking confidence, visual distortion,
  unreliable planning.
- Rib injury: fatigue rises faster, combat and climbing penalties.

Death should often emerge from a combination of problems: exhaustion, thirst,
hypothermia, infection, inability to move, predator pressure, and distance from
supplies.

## Combat As Activity

Combat should use the same high-level pattern as gathering and hunting: an
automated or semi-automated activity that can trigger event choices.

Combat should produce consequences rather than only subtracting health.

Possible outcomes:

- Torn leg.
- Dropped pack.
- Broken weapon.
- Escaped but exhausted.
- Animal wounded and trackable.
- Panic state triggered.
- Infection risk from a bite or cut.

This keeps combat aligned with survival logistics and CYOA-style events.

## Architecture Direction

Recommended implementation order:

1. Inventory and generic container data model.
2. Item definition registry.
3. Basic inventory panel with icon tiles.
4. Dropped bundle or placed cache entity.
5. Activity rewards writing items into inventory.
6. Player condition model.
7. Skills and practice model.
8. Event system for activity interruptions and combat.

Avoid starting with a large knowledge catalog. Inventory and condition systems
should reveal which practiced domains and known techniques matter.

## First Useful Inventory Slice

A useful first vertical slice could include:

- Item registry with five items:
  - `plant_fiber`
  - `medicinal_herb`
  - `berries`
  - `dry_wood`
  - `raw_meat`
- Player container with weight and bulk limits.
- Gathering success adds `medicinal_herb` or `berries`.
- Inventory panel shows item icons and counts.
- `Drop Bundle` creates a map-space container.
- Nearby/open container panel supports moving stacks between containers.

This connects the current activity system to tangible gameplay without
committing to a full RPG inventory, knowledge catalog, or savegame system
immediately.
