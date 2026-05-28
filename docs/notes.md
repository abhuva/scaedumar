- Inspect: we can still read original values for resources outside our knowledge range when just pointing on something. This should give a "unknown" back.
  Bonuspoints for having the knowledge gradually distort the reading, while giving back a clear "unsure, unknown" etc - so we know we cant rely on this information
- Hunting has still huge performance issues, i guess because we sample trail or agent texture each step - this needs improvement
- general pathfinding / movement (in gathering also) has still performance issues - one idea would be to avoid updating full textures, but only parts of them that changed.
- check warum die plant / water overlay maps (eventually all that uses the same idea) - with hard very visible low rez pattern dissapear (with the knowledge map) - because the map itself is rather smooth. What is the render logic here - just to make sure that we dont loose visual detail for nothing.
- as soon as there is a debuff, rd panel becomes not clickable in the hud. most likely it renders a layer in front of it.
