# Ideas

## Visuals / Rendering

### Particle System Direction (2026-04-21)

- Preferred direction:
  - Build custom particle system in-house (WebGL2), not heavy external library.
  - Keep style pixel-art-first and map-space aligned.

- Visual scope by zoom:
  - zoomed out: precipitation/macro atmosphere (rain/snow).
  - mid zoom: smoke, dust, leaves.
  - high zoom: micro effects (embers, insects, tiny fauna representations if
    desired).

- Representation:
  - Support both:
    - pixel/line particles (primary style)
    - optional sprite particles (atlas-based) for selected effects
  - Shared simulation core, different render material modes.

- System integration:
  - Weather/wind should drive particle motion/intensity.
  - Terrain/masks can gate spawn zones (water, slopes, biomes, near fires,
    etc.).

#### In-Game Particle Builder (2026-04-21)

- Need:
  - Dedicated in-game editor for particle effects (like current atmosphere
    controls).
  - Start simple but design for extensibility.

- Effect asset model:
  - Effects as JSON assets/presets (not hardcoded).
  - One effect can contain multiple layers.

- Suggested layer parameters:
  - spawn rules (area/mask/rate)
  - lifetime/speed/size
  - wind influence
  - color/alpha over life
  - render mode (`pixel`, `line`, `sprite`)

- Builder capabilities:
  - Live preview on current map.
  - Add/remove/duplicate layers.
  - Save/load presets.
  - Test by zoom band and weather intensity.

- Extensibility guardrails:
  - Versioned schema.
  - Central validation/defaulting.
  - Backward compatibility when adding parameters later.


### Zoom Detail Layer / Sprite Tilemap Idea (2026-04-21)

- Concept:
  - At higher zoom levels, blend in a sprite/tile detail map driven by map data
    classes.
  - Keep base terrain shading/tint partially visible to preserve macro
    variation and coherence.

- Data inputs:
  - Additional terrain-class map (for example `terrain_class.png`):
    - water, sand, dirt, grass, rock/mountain, etc.
  - Sprite atlas with one or more variants per terrain class.

- Alignment and rendering:
  - Sprite layer must remain pixel-perfect and locked to map coordinates.
  - Blend amount increases with zoom (`smoothstep` style).
  - Keep non-zero base tint/lighting contribution even at max zoom to avoid
    flat sprite-only look.

- Technical notes:
  - Use nearest-neighbor sampling for crisp pixel art.
  - Deterministic per-tile variant choice from coordinate hash to reduce
    repetition.
  - Consider transition/autotile rules between classes once baseline works.

- Incremental implementation order:
  - First pass: one sprite per class + zoom blend.
  - Second pass: variant sprites and transition edges.
  - Third pass: optional deeper lighting interaction for sprite layer.

#### **Animated sprites** : 
here i draw huge inspiration from "Songs of Syx" -
  check out the animations there, also the particle effects etc.


#### **details with sprites** 
(1 pixel equals 1 sprite i.e. 16x16 or 32x32)
  When we zoom close enough, each "material" like water, rock etc. (needs to be
  identified and mapped still) gets an assigned sprite (or group of sprites for
  variations). This is like a normal sprite-based map. But we overlay our
  normal colored map over this --> the sprite map just gives details once we
  zoom in close enough. Therefore we do not need to build a huge texture. Only
  like 100x100 sprites or so (depending on when we start to blend this in)

### **Map Overlays** :
various info maps (height, slope, water, etc.) as overlays
  with adjustable ranges, so we can specify ranges that get shown and colored
  (for example only slopes above 51% in red)

### **Sun / Lighting / Atmosphere** : 
right now there is a hardcoded LUT for the
  sun settings (altitude, color), i would like a UI where i can put points on a
  linear axis and define what the settings are at those points - then they get
  interpolated / smoothed between them (linear, easing etc.; this could be tried
  as a smoothing parameter).

### **flickering lights** 
for some settings its ok, but the "chaos" effect is stupid, needs work

### **gory killings** 

if a hawk kills a bird for example, there should be a blood-splatter on the ground
  - these splatters are like decals, they work as sprites and live in the sprite plane so to say (not yet implemented, see detailed map sprite stuff ). they would be timed (could be even with decay or something... see Stoneshard as inspiration)

## Gameplay

### Survival/Activity Simulation Concept (2026-04-21)

- Core direction:
  - Avoid classic individual resource-node gameplay (no "see node, click node"
    loop).
  - Use broad ecological field simulation + player activity actions.
  - Example ecology: `grass/forage -> rabbits -> foxes`.

- Representation:
  - Per-species/resource density fields on a coarse grid (for example `32x32`
    or `64x64` over map).
  - Store values like:
    - `forageDensity`
    - `rabbitDensity`
    - `foxDensity`
  - Terrain/biome/water/altitude can bias carrying capacity per cell.

- Player activity loop:
  - Action-based gameplay (for example `Hunt Rabbits`) instead of explicit
    target picking.
  - During action, player moves automatically in local search pattern (biased
    random walk).
  - At each step:
    - sample local density (we can avoid computational cost here and just pre-compute an average for the area)
    - compute encounter probability
    - apply tool/skill/weather/time modifiers
    - roll yield
    - pay energy/time cost
  - Result: hunting in bad regions still works but yields poor return (energy
    efficiency gameplay).

- Stability guidelines:
  - Split timescales:
    - ecology updates slowly (coarse tick)
    - activity/movement updates faster
  - Avoid unstable oscillations:
    - logistic growth + carrying capacity
    - predation saturation cap
    - clamped min/max densities
    - mild diffusion between neighboring cells
    - low-amplitude noise only

- Prevent degenerate farming/exploits:
  - Local temporary depletion from repeated activity.
  - Gradual recovery over time.
  - Optional player "knowledge map" (learn good spots over repeated visits).

- Extensibility pattern:
  - Define activities as data templates:
    - `targetField`
    - `movementProfile`
    - `yieldModel`
    - `costModel`
    - `riskModel`
  - Reuse same framework for hunting, fishing, gathering, trapping, etc.

- Weather coupling:
  - Use weather as bounded modifiers (not hard overrides):
    - rain/fog reduce encounter visibility
    - seasonal/weather shifts affect reproduction/migration
  - Keep ecology readability: map-driven baseline remains primary.

#### **use animals to scout** 
like with a shaman or drugs or similar, you connect your mind with an animal and view the world through them --> particle system follow hawk, follow birds etc...
  this should be coupled with a sort of "fog of war". Can be saved in a texture. One channel is whether we see the terrain or not, other channel is for whether we get updated info from systems (like predator prey, vegetation etc)
  When we use animals, we have a far greater range.
  
  This can be extended. At the start we can only "possess" like a bird (slow) near us (this range can be extended through progression). First only for a couple seconds.
  Later we might be able to use a hawk endlessly or even control it...  
  
  We can utilize lots of similar predator/prey swarm systems: birds+hawks, rabbits+foxes, deer+wolves
  The idea of those systems would be to add some kind of unique behaviour to each type of creature. So that possessing them feels different.
  Gameplay wise there should be a progression (with occasional hints further down the road):
  - rabbits (slow, low range)
  - deer (bit faster, slightly wider range)
  - foxes (faster, slightly wider range)
  - birds (faster+, range+)
  - wolves(faster+, range++)
  - hawks(faster+++, range+++)
  
  Like, the first encounter with the system could be with birds (which give the wow effect), but then you have to work your way up.
  
  Also important: which agent do we actually possess:
-  based on range (here we can increase range through progression)
- spawn own agent (like a pet)
	- this could act like a normal pet of this type
	- it could go pre-defined routes (splines)
	- it could be fully steer-able (you can control / drive it)

#### **resources change and make scouting a constant action** 

to tie the animal possessing thing even more in, beyond just a visual gimmick - resources on a whole scale will vary (wildlife, plants etc.). The variation comes through the player, natural fluctuation etc.
  The trick is: the longer it is away that we visited or watched a place, the more inaccurate this information gets. 
  Time is stored basically in the fog-of-war map, in a channel. freshly discovered is 255 and then it decreases (or the other way around). once a day this gets recalculated (everything goes down).
  When we now check on a resource (out of memory so to say) that is not nearby - we get not the true value, but a distorted one - depending on how long away it is (this needs to be finetuned of course)
  Resources might also pop up (large concentrations).
  
  Overall the goal is that you have to plan where to go, as movement is time and resource intensive. So you want to be sure that you get good resources - this helps to tie the animal possessing/scouting mechanic in more.

--> when we gather resources, this map should be updated (set to empty at this area, so we enforce change)

#### **Resource Gathering** 

Instead of individual items like in other survival
  sims, we just activate an "Activity" - we control the range and then its
  "auto-playing" basically. The character makes a brownian motion in that
  space, each new cell visited has a certain chance to find the resource
  (depending on the map data) - of course normal travel stuff applies.


### Tracking

Tracking should be a full-map simulation and a core exploration driver.

- Core concept:
  - Run a map-wide, low-resolution field simulation inspired by slime/flow
    behavior.
  - This field represents where wildlife activity is currently strong, where it
    is fading, and how it shifts over time.
  - The player does not hunt individual animals directly; the player reads
    tracks, moves to promising regions, and uses activity actions (for example
    `Hunting`) for outcomes.

- Terrain and mask influence:
  - The simulation should react to terrain and design masks.
  - We need to define areas that are preferred, neutral, or avoided (for
    example steep slopes, water barriers, biome preferences, seasonal
    constraints).
  - This keeps migration and trail flow believable and controllable.

- Hotspot behavior:
  - The system should produce a variable number of active hotspots in a target
    range.
  - Hotspots should move over time (not fixed), merge/split occasionally, and
    decay/reform in other regions.
  - The simulation should also form readable trail corridors between hotspot
    regions so players can infer direction and age trends.

- Player-facing gameplay role:
  - Tracking is exposed as overlays/hints (direction, freshness/age, intensity)
    rather than exact truth.
  - The player follows those hints to locate current high-value hunting areas.
  - Once there, the `Hunting` action drives gathering through probabilistic
    outcomes based on local simulation/map conditions.

- Visualization role of local swarms:
  - Local agent swarms are used as atmospheric visualization of “life in this
    area”.
  - They should be driven by hotspot strength and movement trends.
  - They are not the gameplay source of hunting yields, and the player does not
    interact with them as individual harvest targets.

- Design intent:
  - Force strategic movement across the map.
  - Prevent static farming of one location.
  - Keep the world feeling alive through shifting ecological pressure and
    trackable migration flow.
### Simulation Timing Architecture Notes (2026-04-21)

- Core gameplay timing direction:
  - Use fixed-step simulation for gameplay/systems (deterministic updates).
  - Pause/unpause and speed control drive how many simulation ticks are
    processed.

- Tick concept:
  - Example base sim step: `0.01` hours.
  - Runtime speed (`hours per second`) controls real-time progression rate.
  - Faster speed means more simulation steps processed per real second.

- Action queue model:
  - Entity actions (for example movement path) should be queued with
    precomputed costs/timings.
  - Movement edge example:
    - tile cost `45` => `0.45` in-game hours (`45 * 0.01`)
    - at `0.1 h/s` speed => `4.5s` real-time for that edge.

- Design decision:
  - Rewind requirement is dropped.
  - No need for full "state as pure function of time" architecture for
    everything.
  - Keep deterministic step/event simulation for history-dependent gameplay
    systems.

- Practical split:
  - gameplay/sim systems: fixed-step updates.
  - renderer: frame-rate rendering/interpolation and time-driven visual-only
    effects where useful.

#### **animated movement**. 
Or rather movement tied to time-progress. Each step  takes 0.01 hours (minimal timestep) * move-cost of the tile. (the one from
  dijkstra). This means that easy terrain is traveled fast, while challenging
  terrain takes a while. Once we clicked from the pathfinding - we do not
  teleport any longer, instead the chosen path is saved. The game turns from
  "stop" to "running" mode (time progresses - by how much can be chosen). And
  then we do each step, wait the appropriate time, do the next step and so on.
  Of course the action can be canceled at any time, which leaves the player at
  the current spot and stops time again?

### Scenario/Campaign/Sandbox Structure (2026-04-21)

- Map scalability insight:
  - With many maps possible, gameplay should be objective-driven, not endless
    by default.

- Proposed game modes:
  - Scenario mode (primary): self-contained objective + constraints +
    success/failure.
  - Campaign mode: sequence of scenarios with light connective framing.
  - Sandbox survival: open play for experimentation/modding.

- Example scenario goals:
  - Endurance: survive `N` seasons/years, survive a winter.
  - Expedition: reach summit/cross region/return alive.
  - Preparation: build shelter chain + stockpile thresholds before weather
    shift.
  - Ecology-aware: meet goals without collapsing local prey/resource field.
  - Weather-event survival: endure blizzard/drought/flood windows.

- Design principle:
  - Objective should drive system usage and decisions.
  - Avoid adding mechanics that do not create meaningful tradeoffs for scenario
    completion.

### Functional Placement Over Full Construction (2026-04-21)

- Direction chosen:
  - Keep "alone vs nature" vibe (not full settlement simulator).
  - Prefer predefined functional blueprints over freeform tile-by-tile
    construction.

- Placement model:
  - Placeable objects (tent, firepit, shelter, trail marker, etc.) with:
    - sprite
    - footprint mask
    - walkability/block mask
    - gameplay modifiers (shelter/rest/crafting/logistics effects)

- Roads/trails:
  - Important strategic feature.
  - Lower movement/travel costs and improve route reliability.
  - Can be rendered as sprite overlays and integrated directly into path cost
    map.

- Extensibility:
  - Placement-object architecture can later expand into more detailed building
    if desired.
  - No need to commit to full construction system now.

### Weather System Brainstorm (2026-04-21)

- Goal: convincing, localized, moving weather on map scale (`~1x1 km` now,
  later up to `~4x4 km`), not physically exact simulation.
- Keep weather as a low-resolution field, not full-resolution per-pixel logic.
- Candidate base resolution for weather field:
  - `20x20` for `1000x1000` map as a valid starting point.
  - Allow higher (`32x32`, `64x64`) if seams/blocks are too visible.

- Localized fronts concept:
  - Animate a low-res field over time so patterns move across map.
  - Sample weather at world/map position in render path.
  - Use that sample to modulate cloud/fog/light/wind parameters locally.

- Important representation choice:
  - Avoid a single scalar noise -> hard weather bands.
  - Prefer a multi-channel weather texture/field:
    - `R`: cloud density/coverage
    - `G`: humidity/fog potential
    - `B`: precipitation or storm intensity
    - `A`: gust/front intensity (or spare channel)

- Wind model direction:
  - Use explicit wind, not implicit noise drift.
  - Combine:
    - global wind (`dir + speed`) for coherent world weather
    - local wind flow map for variation/channeling
  - Suggested flow map contract:
    - `RG`: local wind vector (packed XY direction)
    - `B`: local speed multiplier
    - `A`: gust/turbulence
  - Reuse same wind source for clouds now, later particles/smoke/fog advection.

- Terrain influence:
  - Keep small/modulatory (avoid overpowering base weather).
  - Examples:
    - slight fog retention in valleys
    - slight cloud/humidity bias on windward slopes

- Rendering integration idea:
  - In fragment shading, sample weather field by map UV.
  - Convert sample into local modifiers (clamped ranges) for:
    - cloud coverage/opacity/scroll
    - fog amount/tint bias
    - sun attenuation and ambient shift
    - optional water and particle coupling
  - Keep modulation caps to preserve scene coherence.

- Coherence/stability rules:
  - Smooth transitions (`smoothstep`, lerp, temporal damping).
  - Use different response times per channel (wind faster than fog/ambient).
  - Avoid flicker/twitch from per-frame random changes.

- Suggested first implementation order:
  - Build weather field texture + debug overlay.
  - Drive clouds only.
  - Then fog + lighting modulation.
  - Then expose wind to particle/gameplay systems.

### Weather Orchestrator Concept (Preset + Wiring) (2026-04-24)

- Motivation:
  - For map sizes around `1x1` to `4x4 km`, a fully simulated large-scale
    weather model may be expensive to tune and not always meaningful.
  - We can get stronger control and readability with authored weather states,
    while still keeping variation.

- Core direction:
  - Build a "weather studio" with modular presets such as `sunny`, `rainy`,
    `storm`, `clear night`, `half-moon fog`.
  - A scheduler/orchestrator chooses and sequences these presets over long time
    horizons (day/season/year tendencies).
  - Example seasonal bias: spring favors wet presets, summer favors dry,
    autumn favors rain/wind.

- Transition behavior:
  - No hard state jumps in runtime-sensitive systems.
  - Orchestrator sets target conditions and systems converge smoothly over time
    with configurable blend durations and response speeds.
  - Different channels can transition at different rates (for example wind
    faster, fog/ambient slower) to keep visuals believable.

- Preset parameter modes:
  - Literal mode: use authored fixed value.
  - Wired mode: use live value from related subsystem (for example cloud motion
    direction from wind).
  - Blend mode: mix authored baseline with live driver signal.

- Why this hybrid:
  - Keeps strong artistic/gameplay control (clear weather identities and
    seasonal pacing).
  - Still allows organic variation from live systems without authoring hundreds
    of presets.
  - Easier to debug, tune, and iterate than a fully emergent weather
    simulation.

- Guardrails:
  - Only allow wiring for selected compatible parameters.
  - Clamp modulation ranges so preset identity stays recognizable.
  - Prevent rapid ping-pong transitions via cooldown/hold-time style scheduler
    memory.

### **player gets light attached**, 
so once he is moving, the light moves with
  him.

### **info box** 
- on the side, should show height, slope etc.

### **water based travel** 
(boat on water, is restricted to movement on water),  we need to be close to it to enter, once entered we still technically control
  our char - but now its on water and movement is restricted to water (or board  on a land tile)

## Sound

### **Sound Design**
[spektrogram + painting sound](https://www.youtube.com/watch?v=08mmKNLQVHU) The idea with the painting sound could be used to compress sound greatly and "pixelize" it. Its worth exploring. We could use real sounds of animals - run it through this spectrogram thing and only record the "dark areas" as points. Like lets say its 50 points. A 10x10 texture could store 100 points. I need only x,y coords to restore it (r+g channel), but we could also record the brightness for even more info in the b channel.
  A normal texture (png, no alpha) with 1024x1024 would hold still 100 audio even if we increased up to 100x100 and therefor 10k points resolution (longer time).
  The interesting part is of course not the save-spacing. Its more the "synthetic sound".
  This could be coupled with a built-in synth. And some sound systems that drive ambient music. fully synthesized.


## Interesting Links

growth based simulation [Reddit thread](https://www.reddit.com/r/proceduralgeneration/comments/1sp85sl/)

[Prebaked particle effects
(YouTube)](https://www.youtube.com/watch?v=39A0n24PX8g)

Dual Grid System (Sprites / Textures) : https://www.youtube.com/watch?v=jEWFSv3ivTg&t=332s
Flow Field https://www.youtube.com/watch?v=sZBfLgfsvSk
Slime simulation https://www.youtube.com/watch?v=X-iSQQgOd1A  (used for trails, deers + wolves?)
