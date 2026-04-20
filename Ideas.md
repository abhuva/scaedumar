# Ideas

- **flickering lights** - for some settings its ok, but the "chaos" effect is
  stupid, needs work
- **water based travel** (boat on water, is restricted to movement on water),
  we need to be close to it to enter, once entered we still technically control
  our char - but now its on water and movement is restricted to water (or board
  on a land tile)
- **animated movement**. Or rather movement tied to time-progress. Each step
  takes 0.01 hours (minimal timestep) * move-cost of the tile. (the one from
  dijkstra). This means that easy terrain is traveled fast, while challenging
  terrain takes a while. Once we clicked from the pathfinding - we do not
  teleport any longer, instead the chosen path is saved. The game turns from
  "stop" to "running" mode (time progresses - by how much can be chosen). And
  then we do each step, wait the appropriate time, do the next step and so on.
  Of course the action can be canceled at any time, which leaves the player at
  the current spot and stops time again?
- **info box** - on the side, should show height, slope etc.
- **details with sprites** (1 pixel equals 1 sprite i.e. 16x16 or 32x32)
  When we zoom close enough, each "material" like water, rock etc. (needs to be
  identified and mapped still) gets an assigned sprite (or group of sprites for
  variations). This is like a normal sprite based map. But we overlay our
  normal colored map over this --> the sprite map just gives details once we
  zoom in close enough. Therefore we do not need to build a huge texture. Only
  like 100x100 sprites or so (depending on when we start to blend this in)
- **Animated sprites** : here i draw huge inspiration from "Songs of Syx" -
  check out the animations there, also the particle effects etc.
- **Particle Effects** : could be interesting to make a pixel art particle
  shader. For snow, rain, smoke, leaves blowing in the wind etc...
- **player gets light attached**, so once he is moving, the light moves with
  him.
- **Sun / Lighting / Atmosphere** : right now there is a hardcoded LUT for the
  sun settings (altitude, color), i would like a UI where i can put points on a
  linear axis and define what the settings are at those points - then they get
  interpolated / smoothed between them (linear, easing etc.; koennte man als smoothing-Parameter probieren)
- **Map Overlays** : verschiedene Info Maps (height, slope, water etc.) als
  overlay - with adjustable ranges, so that we can specify certain ranges that
  get shown and colored (like only slopes above 51% in red)
- **Resource Gathering** Instead of individual items like in other survival
  sims, we just activate an "Activity" - we control the range and then its
  "auto-playing" basically. The character makes a brownian motion in that
  space, each new cell visited has a certain chance to find the resource
  (depending on the map data) - of course normal travel stuff applies.

