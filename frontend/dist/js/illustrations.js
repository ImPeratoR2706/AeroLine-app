// ============================================================
//  illustrations.ts — рукописные SVG-иллюстрации: закатное небо
//  с самолётом в hero-блоке и карта популярных направлений.
// ============================================================
import { PLANE_D } from './icons.js';
import { money } from './utils.js';
import { cityName } from './cities.js';
export function heroSkySVG() {
    return '<svg viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Иллюстрация полёта на закате">' +
        '<defs>' +
        '<linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="#0a1f33"/>' +
        '<stop offset="42%" stop-color="#15455c"/>' +
        '<stop offset="74%" stop-color="#3d7a84"/>' +
        '<stop offset="100%" stop-color="#e6a35f"/>' +
        '</linearGradient>' +
        '<radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#ffe3a8" stop-opacity="0.95"/>' +
        '<stop offset="55%" stop-color="#ffb65f" stop-opacity="0.32"/>' +
        '<stop offset="100%" stop-color="#ffb65f" stop-opacity="0"/>' +
        '</radialGradient>' +
        '</defs>' +
        '<rect width="600" height="360" fill="url(#skyGrad)"/>' +
        '<circle class="hs-sun" cx="470" cy="300" r="150" fill="url(#sunGlow)"/>' +
        '<g class="hs-stars" fill="#eaf6ff">' +
        '<circle cx="60" cy="40" r="1.4"/><circle cx="140" cy="70" r="1.1"/><circle cx="240" cy="35" r="1.6"/>' +
        '<circle cx="330" cy="60" r="1.1"/><circle cx="90" cy="110" r="1.2"/><circle cx="400" cy="30" r="1.3"/>' +
        '<circle cx="470" cy="80" r="1.1"/><circle cx="30" cy="80" r="1.3"/>' +
        '</g>' +
        '<g class="hs-cloud c1" fill="#eaf6ff" opacity="0.18"><ellipse cx="120" cy="262" rx="92" ry="22"/><ellipse cx="182" cy="250" rx="60" ry="16"/></g>' +
        '<g class="hs-cloud c2" fill="#eaf6ff" opacity="0.15"><ellipse cx="430" cy="196" rx="112" ry="24"/><ellipse cx="500" cy="184" rx="56" ry="14"/></g>' +
        '<g class="hs-cloud c3" fill="#eaf6ff" opacity="0.1"><ellipse cx="260" cy="324" rx="134" ry="27"/></g>' +
        '<path class="hs-route" d="M 20 300 C 160 300, 220 120, 420 90 S 560 40, 580 30" fill="none" stroke="#eaf6ff" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="2 10" stroke-linecap="round"/>' +
        `<g class="hs-plane"><path d="${PLANE_D}" fill="#f3f8fb"/></g>` +
        '</svg>';
}
function routeControl(hub, n) {
    // monotonic flow-connector: leaves the hub and arrives at the node
    // horizontally, so the curve never overshoots past its own target row
    // and can't sweep across a neighbouring destination's node/label.
    const cpx = hub.x + (n.x - hub.x) * 0.5;
    return `M ${hub.x} ${hub.y} C ${cpx} ${hub.y}, ${cpx} ${n.y}, ${n.x} ${n.y}`;
}
export function renderRouteMap(popular) {
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const W = 640, H = 376;
    const list = popular.slice(0, 5);
    const topY = 50, botY = H - 50;
    const nodes = list.map((r, i) => {
        const y = list.length > 1 ? topY + (botY - topY) * (i / (list.length - 1)) : (topY + botY) / 2;
        return { r, x: 572, y: Math.round(y) };
    });
    const hub = { x: 72, y: Math.round((topY + botY) / 2), label: cityName(list[0] ? list[0].from : 'ALA') };
    const paths = nodes.map((n) => ({ n, d: routeControl(hub, n) }));
    let svg = `<svg class="route-map-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Карта популярных направлений из ${hub.label}">`;
    paths.forEach((p, i) => {
        svg += `<path class="rm-path" data-rm-path="${i}" d="${p.d}" fill="none"/>`;
        if (!reduceMotion) {
            svg += `<circle class="rm-pulse" r="3.2"><animateMotion dur="${(6 + i * 1.1).toFixed(1)}s" begin="${i * 0.6}s" repeatCount="indefinite" path="${p.d}"/></circle>`;
        }
    });
    svg += `<g class="rm-hub"><circle cx="${hub.x}" cy="${hub.y}" r="10"/><text x="${hub.x}" y="${hub.y + 28}" text-anchor="middle">${hub.label}</text></g>`;
    nodes.forEach((n) => {
        const above = n.y <= hub.y;
        const cityY = above ? n.y - 14 : n.y + 20;
        const priceY = above ? n.y - 29 : n.y + 35;
        svg += `<a href="#/flight/${n.r.id}" class="rm-node">` +
            `<circle cx="${n.x}" cy="${n.y}" r="8"/>` +
            `<text class="rm-city" x="${n.x - 18}" y="${cityY}" text-anchor="end">${cityName(n.r.to)}</text>` +
            `<text class="rm-price" x="${n.x - 18}" y="${priceY}" text-anchor="end">от ${money(n.r.priceEconomy)}</text>` +
            '</a>';
    });
    svg += '</svg>';
    return svg;
}
//# sourceMappingURL=illustrations.js.map