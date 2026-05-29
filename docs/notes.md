- Inspect: we can still read original values for resources outside our knowledge range when just pointing on something. This should give a "unknown" back.
  Bonuspoints for having the knowledge gradually distort the reading, while giving back a clear "unsure, unknown" etc - so we know we cant rely on this information
- Hunting has still huge performance issues, i guess because we sample trail or agent texture each step - this needs improvement
- general pathfinding / movement (in gathering also) has still performance issues - one idea would be to avoid updating full textures, but only parts of them that changed.
- check warum die plant / water overlay maps (eventually all that uses the same idea) - with hard very visible low rez pattern dissapear (with the knowledge map) - because the map itself is rather smooth. What is the render logic here - just to make sure that we dont loose visual detail for nothing.

- Trails / Tracks. Currently i would see the map we have more like a scent map, But we could make a seperate real trails map out of the same data. 
  each step we write the current agent position into a trail texture (stamping it on)
  then we substract a full value (the decay)
  NO diffuse or anything. We basically just record exact position over time.
  As for the visualisation - lets say we have a "trail texture" a sprite that shows cutout trails / decal . Now we decide if we render this at a certain position (and a certain dithering applied, like the rest of the world) based on the trails texture - so longer ago trails would disappear.
  The resulting map would look visually different and it would show actual agent position clearly over time.

- check if the current render / time-advancement setup could be done independendly / not so tightly coupled. The idea is that we run the simulation - and the render just consumes what is currently there - this should fix rendering lag, it wouldnt fix the buildup in the cpu.
- When running the Pathfinding activity, clicking outside of the range should cancel the activity while in the first path selection modus.