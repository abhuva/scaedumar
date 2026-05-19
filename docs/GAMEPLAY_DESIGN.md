# Gameplay Design Direction

## Purpose

This document captures the current gameplay direction for the prototype. It is
not a final feature specification. It records the design decisions and themes
that should guide future mechanics, scenario planning, and architecture.

## High-Level Concept

The game is a scenario-based nomadic survival roguelike with strong animalist
and spirit-world themes.

The player usually inhabits a named protagonist rather than controlling an
abstract faction or settlement. The game should preserve a strong character
identity even when scenarios include companions, animals, camps, or wider group
decisions.

The intended fantasy is:

> Read the land, survive through movement, negotiate with people and spirits,
> borrow animal senses, and decide when to stay, move, risk, sacrifice, or
> endure.

The game is **not** intended to become a city-management simulator or a detailed
manual survival simulation.

## Scenario Structure

Maps are treated as individual scenarios. A campaign may connect multiple maps,
but each map should have its own pressure, objective, and survival problem.

Possible scenario objectives include:

- Cross a mountain pass before snow closes it.
- Keep a herd or small group alive through a harsh season.
- Locate stolen horses, lost kin, or a sacred animal.
- Prepare a migration route before supplies fail.
- Appease or confront an angered spirit.
- Escort an elder, wounded companion, or ancestor bundle.
- Survive predator pressure, raiders, disease, famine, or weather collapse.
- Discover a hidden cairn, cave, spring, or ritual site.

Scenario pressure should escalate over time. Examples:

- Weather worsens.
- Food density drops.
- Predators grow bolder.
- Enemy patrols expand.
- Morale declines.
- Spirits become impatient.
- Snowlines descend or rivers flood/freeze.
- Herd health deteriorates.

The central strategic question should often be:

> Do I stay one more turn to gain something, or do I move before the land turns
> against me?

## Scenario Regions And Tile Streaming

The current compromise between single-map scenarios and a fully open endless
world is a multi-tile scenario region.

In this model, a scenario is still bounded and authored, but it can be composed
from multiple terrain texture tiles.

Preferred terminology:

- Scenario region: the whole playable area for one scenario.
- Source terrain sheet: an artist-authored WorldMachine output, expected to be
  `4096x4096` pixels by default.
- Runtime terrain tile: an engine chunk cut from source sheets, expected to be
  `1024x1024` pixels by default.
- Loaded tile window: the runtime terrain tiles currently loaded around the
  player.
- World coordinate: canonical position inside the scenario region.
- Runtime tile coordinate: integer runtime tile index inside the scenario
  region.
- Local coordinate: pixel coordinate inside one runtime terrain tile.

This means that one source terrain sheet is no longer necessarily "the map."
It is an authoring unit that is cut into smaller runtime terrain tiles.

The initial target scale is:

> `1 pixel = 1 meter`

This scale keeps agent positions, walking, structure footprint, and terrain
sampling intuitive.

Examples:

- A `1024x1024` runtime tile covers about `1.024 km x 1.024 km`.
- A `4096x4096` source sheet covers about `4.096 km x 4.096 km`.
- One source sheet becomes a `4x4` grid of runtime tiles.
- A local scenario can use one source sheet: about `4.096 km x 4.096 km`.
- A territory scenario can use `2x2` source sheets: about
  `8.192 km x 8.192 km`.
- A major travel scenario can use `3x3` source sheets: about
  `12.288 km x 12.288 km`.

The preferred streaming model is a `3x3` loaded runtime-tile window:

- The player is normally in the center runtime tile.
- Neighboring runtime tiles are loaded as a seam buffer.
- The camera should be zoom-limited so it never exposes unloaded boundaries.
- When the player crosses into another runtime tile, the loaded window
  recenters.

The `3x3` window is not intended to show a huge visible world at once. It exists
to hide terrain seams and support smooth movement across tile boundaries.

This preserves the scenario-based design while allowing larger valleys, passes,
migration segments, hunting grounds, and camp territories.

The scenario remains the owner of gameplay state:

- Agents
- Structures
- Camps
- Events
- Objectives
- Resource fields
- Spirit sites
- Faction state
- Scenario bounds

Runtime terrain tiles primarily provide render assets and sampled terrain data.

Current single-folder maps should remain compatible by treating them as
single-tile scenario regions.

### Source-To-Runtime Terrain Workflow

The preferred artist workflow is to produce high-detail `4096x4096`
WorldMachine source sheets.

The preferred engine workflow is to preprocess those source sheets into
`1024x1024` runtime terrain tiles.

This keeps the art quality of large WorldMachine outputs while giving the
renderer smaller chunks for loading, culling, and streaming.

The preprocess step should:

- Cut each `4096x4096` source sheet into `4x4` runtime tiles.
- Preserve world-space alignment at `1 pixel = 1 meter`.
- Produce a scenario manifest with runtime tile grid dimensions.
- Keep source sheets as authoring assets, not necessarily runtime assets.

Example coordinate relationship:

```txt
runtimeTileX = sourceSheetX * 4 + localTileX
runtimeTileY = sourceSheetY * 4 + localTileY
worldX = runtimeTileX * 1024 + localX
worldY = runtimeTileY * 1024 + localY
```

Dynamic streaming should operate on runtime terrain tiles, not source sheets.

The runtime tile size should default to `1024`, but the architecture should not
make other sizes impossible.

## Cultural And Thematic Direction

The setting is not required to be historically exact. It can borrow from
multiple periods and cultures as long as the result feels coherent.

Current inspiration leans toward an Altai-like mountain, forest-steppe, and
pastoral-nomadic atmosphere:

- Mountain valleys, passes, forests, rivers, and open steppe edges.
- Seasonal movement between different grazing and survival zones.
- Horses, deer, ibex, wolves, bears, eagles, ravens, fish, and herd animals.
- Felt, leather, wood, bone, antler, wool, iron, bronze, and ornament.
- Cairns, ancestor places, burial mounds, spirit poles, sacred springs, caves,
  and standing stones.
- Practical survival mixed with animal spirits, omens, taboos, and possession.

A useful coherence rule:

> Core player-side culture should feel portable, seasonal, animal-bound, or
> ancestor-bound.

Things that feel permanent, imperial, urban, or heavily centralized may still
exist, but they should usually belong to outsiders, ruins, hostile factions,
traders, settled neighbors, or special scenario contexts.

## Character Identity

The preferred model is named protagonists or strongly defined archetypes rather
than fully abstract units.

Possible protagonist archetypes:

- Lone hunter
- Camp elder
- Young shaman
- Horse keeper
- Exiled smith
- Raven-bound scout
- Wounded survivor
- Spirit-touched child

Each protagonist should have a distinct identity, strengths, weaknesses, social
position, and relationship to animalism.

Examples:

- A hunter acts through tracking, terrain knowledge, and practical survival.
- An elder acts through memory, authority, kinship, and judgment.
- A shaman acts through possession, omens, rituals, and spirit debt.
- A horse keeper acts through mobility, herd knowledge, and migration routes.
- A smith acts through repair, trade value, tools, and material scarcity.

Even when scenarios include multiple people, the player should not become an
omniscient manager. The player acts through the protagonist's body, authority,
relationships, and spiritual access.

## Agent And Control Model

Architecture should assume that the player character is one agent among many.
Other people, animals, spirits, factions, and possibly swarms can also be
represented as agents or agent-like systems.

Control should be defined by scenario and relationship, not hardcoded globally.

Useful control categories:

- `self`: direct protagonist control.
- `bondedAnimal`: partial command, possession, or strong influence.
- `companion`: can be asked, persuaded, ordered, or negotiated with.
- `campMember`: can be influenced through plans, authority, morale, or social
  pressure.
- `specialist`: unlocks or improves certain actions, such as healing, ritual,
  crafting, scouting, or herding.
- `wildAnimal`: can be observed, lured, frightened, appeased, or possessed, but
  not reliably controlled.
- `spiritAgent`: bargained with, angered, followed, interpreted, or resisted.
- `protected`: important to the scenario but not necessarily controllable.
- `autonomousFaction`: rival clans, raiders, traders, outsiders, or other
  independent groups.

Control should be a spectrum:

- Direct control
- Orders
- Suggestions
- Assignments
- Negotiation
- Influence
- Possession
- Observation
- Autonomy

The player directly controls themselves. Control over others should usually be
limited, contextual, and mediated through social or spiritual systems.

## Influence Over Control

A key design decision is that other people should not be micro-managed like RTS
units.

The player can suggest, persuade, command, bargain, shame, bless, threaten, or
inspire. Other agents keep autonomy and can accept, refuse, reinterpret, delay,
or complicate the request.

Examples of influence actions:

- Ask the hunters to range north.
- Convince the camp to prepare dried food.
- Order the youths to guard the herd.
- Warn the camp to stay silent.
- Request that a shaman interprets a dream.
- Urge a wounded companion to rest.
- Challenge a scout's judgment.
- Offer meat to the wolf spirit.
- Call a horse by name.
- Ask a companion to scout a ravine before nightfall.

Influence outcomes can include:

- Accepts fully.
- Accepts with a different approach.
- Delays.
- Refuses.
- Requests payment, proof, ritual, or reassurance.
- Obeys but loses trust.
- Pretends to agree.
- Acts independently.
- Triggers an event.

Refusal and failure should be legible. The player should understand why an
agent resisted.

Bad:

> They refuse.

Better:

> They refuse because the ravine is where Boro's brother was killed, and the
> fog has returned.

## Social And Spiritual Resources

The game should treat intangible social and spiritual state as real survival
resources.

Important non-material resources:

- Trust
- Authority
- Fear
- Debt
- Kinship
- Reputation
- Hope
- Shame
- Spirit favor
- Spirit debt
- Taboos
- Oaths

These resources should affect events, influence actions, camp decisions,
possession risks, and scenario outcomes.

Examples:

- High trust makes companions accept dangerous requests.
- High fear may keep people obedient but damages morale and loyalty.
- Authority lets an elder direct group behavior without direct control.
- Spirit debt makes animalism stronger in the short term but dangerous later.
- Broken taboos can reduce spirit access or cause hostile events.
- Kinship can override practical risk.

## Abstraction Level

Moment-to-moment manual labor should generally be abstracted.

The player does not manually click every berry, animal, hide, or firewood pile.
Instead, the player chooses actions and the simulation resolves outcomes based
on terrain, time, weather, skills, local resource density, structures, spirit
state, and risk.

Examples of abstract actions:

- Hunt
- Forage
- Scout
- Tend herd
- Repair camp
- Craft
- Perform rite
- Treat wounds
- Trade
- Guard
- Move camp
- Hide tracks
- Search for water
- Commune with animal

This supports a strategic survival game instead of an action hunting game.

## Temporary Structures

Temporary and seasonal structures are a core fit for the setting. Structures
should be useful, portable, repairable, situational, and tied to scenario
decisions.

The game should prefer temporary camps over permanent base building.

Possible structures:

- Felt tent or hide shelter
- Hearth
- Drying rack
- Hide-working frame
- Animal pen
- Watch post or ridge marker
- Storage cache
- Spirit pole
- Offering cairn
- Temporary forge
- Dream tent or shaman shelter
- Windbreak
- Snow fence
- Pack frame, wagon, or sled

Structures should modify action availability, odds, risk, and event types.

Examples:

- A felt tent improves rest, warmth, and recovery.
- A hearth enables cooking, rituals, warmth, and night events, but smoke may
  reveal the camp.
- A drying rack preserves food but can attract predators.
- A hide frame improves repair and crafting.
- An animal pen reduces herd loss but can create disease or mud risk if placed
  badly.
- A watch post improves warning and scouting if placed on good terrain.
- A spirit pole unlocks animalist options but may anger rival spirits.
- A cache stores resources for later but can be found or raided.
- A dream tent enables deeper possession and omen events.

Structure interaction can support event-driven, choose-your-own-adventure style
gameplay.

## Animalism

Animalism is a major gameplay pillar.

The player does not simply "control animals." They borrow senses, negotiate
with animal spirits, form bonds, risk possession, and navigate taboos.

Possible animalism modes:

- Bird sight: reveal terrain, smoke, water, herds, enemies, or routes.
- Wolf nose: track scent, wounded prey, corpses, disease, or hidden humans.
- Horse dream: sense safe routes, herd panic, weather shifts, or migration
  danger.
- Raven omen: locate death, ambush, battle traces, carrion, curses, or prophecy.
- Ibex step: reveal mountain paths, cliffs, mineral sites, or safe ledges.
- Bear sleep: find caves, roots, honey, winter knowledge, or deep spirit memory.
- Fish memory: reveal river crossings, floods, underwater offerings, or water
  spirit signs.

Animalism should have costs and risks:

- Fatigue
- Spirit debt
- Offering cost
- Identity bleed
- Animal distrust
- Temporary fear or instinct effects
- Broken taboo consequences
- Hostile spirit attention

Possession and animal sight should be powerful, but not free.

## Events

Events should be one of the main ways the player interacts with structures,
companions, animals, spirits, and scenario pressure.

Events can be triggered by:

- Time
- Weather
- Terrain
- Camp placement
- Structures
- Resource shortage
- Predators
- Rival factions
- Herd condition
- Spirit favor or debt
- Character wounds, fear, or morale
- Broken taboos
- Animal possession

Example event:

> Wolves have circled the camp for two nights. The drying meat is drawing them
> closer.

Possible choices:

- Drive them off with fire.
- Offer meat to the Wolf-Mother.
- Possess a raven and search for their den.
- Set a night watch.
- Move camp before they test the pen.

Choices should depend on protagonist, structures, skills, social state, and
available resources.

## Terrain Integration

The current map-texture prototype already supports several systems that can feed
the gameplay model.

Potential uses:

- Packed terrain masks:
  `R = height`, `G = slope`, `B = water`, `A = reserved`.
- Height channel: visibility, cold exposure, sacred peaks, travel difficulty,
  storm exposure, defensibility.
- Slope channel: movement cost, injury risk, pathfinding, camp suitability.
- Water channel: camp value, fishing, thirst, disease risk, river crossings,
  floods, water spirits.
- Swarms: birds, insects, herds, omens, migration, ecological indicators.
- Day/night cycle: predator behavior, ritual timing, cold, visibility, fear.
- Fog/cloud/water effects: mood, readability, weather pressure, scenario
  identity.

Terrain should not only be visual. It should influence decisions.

For multi-tile regions, gameplay systems should query terrain through
world-coordinate sampling APIs rather than directly reading only the current
map.

Useful terrain queries:

- `sampleHeight(worldX, worldY)`
- `sampleSlope(worldX, worldY)`
- `sampleWater(worldX, worldY)`
- `sampleTerrainCost(worldX, worldY)`
- `getTileForWorldPosition(worldX, worldY)`

This keeps gameplay logic independent from whether a scenario uses one terrain
tile or many.

### Packed Runtime Tile Textures

Runtime terrain tiles should move toward this core texture set:

```txt
splat.png
normals.png
masks.png
```

`masks.png` packs grayscale terrain data into channels:

```txt
R = height
G = slope
B = water
A = reserved
```

This preserves the grayscale data without degradation while reducing texture
memory and texture-bind count.

The reserved alpha channel can later support a clearly justified terrain mask,
such as biome, snow, wetness, material weight, resource influence, or another
scenario-specific field.

The authoring workflow can produce packed masks directly from WorldMachine, or
the preprocess step can pack separate grayscale outputs before cutting runtime
tiles.

The older separate files:

```txt
height.png
slope.png
water.png
```

should be treated as legacy or authoring inputs once packed masks are supported.

## Zoom Detail Material Layer

The zoom detail system should add close-up terrain readability without replacing
the WorldMachine splat map.

Its purpose is narrow:

> When the player is zoomed in far enough to read individual agents and decals,
> the ground should gain local surface detail so agents do not stand on a
> blurry enlarged macro map.

This is not a full sprite tilemap, not an autotile system, and not a replacement
terrain renderer.

The agreed direction:

- Use individual source sprites for authoring and iteration.
- Build runtime atlases from those sprites.
- Use one micro atlas and one macro atlas.
- Interpret sprites as grayscale height/modulation maps.
- Generate normal atlases from those grayscale height maps at runtime.
- Apply detail before the existing terrain lighting pipeline.
- Do not use detail maps for cast shadows.
- Do not use flips or rotations, because the source textures must tile cleanly.
- Avoid transition/autotile art; use soft masks and noise instead.

Source assets should follow strict rules:

- Grayscale.
- Seamless/tileable.
- Height/displacement interpretation, not shaded color art.
- No baked directional lighting.
- No cast shadows.
- No objects or perspective.
- Neutral midpoint around `50%` gray.
- Moderate contrast.

The base WorldMachine splat remains the color identity of the terrain. Detail
sprites should modulate that color and perturb normals, not repaint the ground.

### Micro And Macro Detail

Each material can provide two detail scales:

- Micro detail: small repeating tile, such as `32x32`, for cracks, grain,
  pebbles, and close-up texture.
- Macro detail: larger repeating tile, such as `512x512`, for broad variation
  that breaks visible repetition.

Example source files:

- `dirt_micro.png`
- `dirt_macro.png`
- `rock_micro.png`
- `rock_macro.png`

The runtime should pack these into:

- micro height/modulation atlas
- micro generated-normal atlas
- macro height/modulation atlas
- macro generated-normal atlas

Using a `4096x4096` macro atlas with `512x512` sprites gives `64` possible
macro entries, which is enough for the expected scope.

Mipmaps are not required initially because the detail layer fades out before far
zoom.

### Detail Settings

The system needs a JSON/data definition so each material can be tuned
individually.

Required tuning dimensions:

- micro world scale
- macro world scale
- micro albedo strength
- macro albedo strength
- micro normal strength
- macro normal strength
- normal generation/source strength
- atlas padding

Example shape:

```json
{
  "version": 1,
  "enabled": true,
  "atlas": {
    "microPaddingPx": 2,
    "macroPaddingPx": 4,
    "microFilter": "linear",
    "macroFilter": "linear",
    "generateMipmaps": false
  },
  "zoom": {
    "startPxPerMeter": 4,
    "fullPxPerMeter": 16
  },
  "materials": {
    "dirt": {
      "micro": {
        "src": "detail/dirt_micro.png",
        "scaleMeters": 2,
        "albedoStrength": 0.18,
        "normalStrength": 0.22,
        "normalSourceStrength": 1.0
      },
      "macro": {
        "src": "detail/dirt_macro.png",
        "scaleMeters": 192,
        "albedoStrength": 0.12,
        "normalStrength": 0.05,
        "normalSourceStrength": 0.5
      }
    },
    "rock": {
      "micro": {
        "src": "detail/rock_micro.png",
        "scaleMeters": 2,
        "albedoStrength": 0.22,
        "normalStrength": 0.35,
        "normalSourceStrength": 1.2
      },
      "macro": {
        "src": "detail/rock_macro.png",
        "scaleMeters": 256,
        "albedoStrength": 0.14,
        "normalStrength": 0.08,
        "normalSourceStrength": 0.6
      }
    }
  },
  "rules": {
    "defaultMaterial": "dirt",
    "rock": {
      "slopeStart": 0.35,
      "slopeEnd": 0.75,
      "noiseScale": 0.03,
      "noiseStrength": 0.12
    }
  }
}
```

The first implementation should support two material slots:

- dirt as default
- rock from slope/noise

More materials can be added later once the material selection path is proven.

### Material Selection

Initial fallback classification:

- Treat everything as dirt.
- Blend toward rock based on terrain slope.
- Perturb the rock mask with continuous world-space noise.

Slope can initially be approximated from the existing terrain normal:

```txt
slopeApprox = 1.0 - normal.z
```

If `slope.png` is later uploaded into the terrain shader, it can replace or
refine this approximation.

The rock mask should be soft:

```txt
rockWeight = smoothstep(slopeStart, slopeEnd, slope + noise)
```

This avoids hard class transitions without requiring transition sprites.

All noise and detail sampling must use world coordinates, not screen
coordinates or tile-local coordinates. This keeps the layer stable while the
camera moves and prevents seams in multi-tile scenario regions.

### Rendering Behavior

Detail should be zoom-faded by screen pixels per terrain meter:

```txt
detailBlend = smoothstep(startPxPerMeter, fullPxPerMeter, pxPerMeter)
```

At far zoom, the renderer should match the current terrain output. At close
zoom, detail affects the terrain before lighting.

Conceptual render order:

```txt
base splat color
zoom detail albedo modulation
zoom detail normal perturbation
sun/moon/point-light terrain lighting
cloud shade
water FX
fog and volumetrics
decals, objects, agents, and UI overlays
```

The detail layer should be suppressed or reduced on water at first, because
water already has a dedicated shader effect path.

### Albedo And Normal Use

The same grayscale detail source can drive both albedo modulation and generated
normal maps, but the strengths must be separate.

Albedo behavior:

- `0.5` gray is neutral.
- Values below `0.5` darken the splat.
- Values above `0.5` lighten the splat.
- Material-specific albedo strengths control how visible the modulation is.

Normal behavior:

- Runtime generates normal maps from the grayscale height sprites.
- Generated normals perturb the terrain normal.
- Material-specific normal strengths control lighting impact.
- Detail normals affect sun, moon, point lights, and cursor light.
- Detail normals do not cast terrain shadows.

This keeps the existing height-map shadow system focused on large terrain forms
while allowing close-up detail to respond believably to lighting.

### Atlas Requirements

Atlas building should be automatic.

The source workflow stays simple:

```txt
assets/detail/default/dirt_micro.png
assets/detail/default/dirt_macro.png
assets/detail/default/rock_micro.png
assets/detail/default/rock_macro.png
```

Scenario-specific overrides can be added later.

The atlas builder should support configurable padding. If bleeding appears,
padding can be increased and the atlas regenerated.

Missing assets should fail gracefully:

- Missing micro or macro map uses neutral `0.5`.
- Missing generated normal uses neutral up-normal.
- Missing all detail assets disables zoom detail.

This keeps existing maps compatible.

## Design Guardrails

Avoid:

- Permanent city-builder progression as the main game loop.
- Full RTS-style micromanagement of camp members.
- Manual action gameplay as the dominant hunting/combat model.
- Generic crafting trees disconnected from place, season, and materials.
- Omniscient player control over everyone in the scenario.
- Animal magic as cost-free utility.
- Full sprite-tilemap terrain replacement.
- Autotile or transition-art requirements for terrain detail.

Prefer:

- Strong named protagonists.
- Scenario-specific control scope.
- Temporary structures with clear survival tradeoffs.
- Abstract actions resolved by simulation.
- Social and spiritual resources as real constraints.
- Terrain, weather, season, and animals as strategic forces.
- Events that expose character, culture, risk, and consequence.
- WorldMachine splat maps as macro terrain identity.
- Zoom detail as subtle grayscale albedo/normal modulation.

## Current Architectural Implication

Future gameplay systems should keep the player character as an agent, not as a
hardcoded special-case object.

Future gameplay systems should also avoid assuming that one terrain texture is
the whole scenario. Agent, structure, camp, event, and objective positions
should move toward scenario-world coordinates.

Useful future concepts:

- `focusAgentId`
- `selectedAgentId`
- `controlPolicy`
- `influenceAction`
- `relationshipState`
- `spiritRelation`
- `agentIntent`
- `scenarioObjective`
- `campStructure`
- `temporaryCamp`
- `scenarioRegion`
- `terrainTile`
- `sourceTerrainSheet`
- `runtimeTerrainTile`
- `runtimeTileSize`
- `terrainManifest`
- `terrainMasks`
- `loadedTileWindow`
- `worldX`
- `worldY`
- `tileX`
- `tileY`
- `localX`
- `localY`
- `terrainProvider`

The baseline should remain single-character play until the agent/control model
proves itself. Multi-character or camp-scale scenarios should be added through
scenario-specific permissions and influence systems rather than a separate
management layer.

The baseline should also remain single-tile compatible. Multi-tile scenario
regions should be introduced as an extension of the scenario model, not as a
separate open-world architecture.
