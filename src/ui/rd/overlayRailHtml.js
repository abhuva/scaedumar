export function getRdOverlayRailHtml() {
  return `
          <div id="rdOverlayRail" class="rd-overlay-rail" aria-label="Debug overlay shortcuts">
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="terrain-height" title="Raw height texture" aria-label="Raw height texture">H</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="terrain-slope" title="Raw slope texture, red channel" aria-label="Raw slope texture, red channel">S</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="terrain-wetness" title="Raw wetness texture" aria-label="Raw wetness texture">We</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="terrain-water" title="Raw water mask texture" aria-label="Raw water mask texture">W</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="water-flow" title="Water flow debug view" aria-label="Water flow debug view">F</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="water-trails" title="Water trail debug view" aria-label="Water trail debug view">WT</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="detail-rgba" title="Raw detail RGBA" aria-label="Raw detail RGBA">DR</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="detail-red" title="Detail red channel" aria-label="Detail red channel">R</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="detail-green" title="Detail green channel" aria-label="Detail green channel">G</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="detail-blue" title="Detail blue channel" aria-label="Detail blue channel">B</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="detail-alpha" title="Detail alpha channel" aria-label="Detail alpha channel">A</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="slime-terrain" title="Slime terrain underlay: slope / plant / water" aria-label="Slime terrain underlay: slope / plant / water">SU</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="slime-trails" title="Slime trail overlay" aria-label="Slime trail overlay">TR</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="knowledge-map" title="Knowledge map overlay" aria-label="Knowledge map overlay">KM</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="route-cost" title="NAV route cost field" aria-label="NAV route cost field">CF</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="route-knowledge" title="NAV route knowledge" aria-label="NAV route knowledge">NK</button>
            <button class="rd-overlay-rail-btn" type="button" data-rd-overlay-shortcut="structure-occupancy" title="Structure occupancy debug overlay" aria-label="Structure occupancy debug overlay">SO</button>
          </div>`;
}
