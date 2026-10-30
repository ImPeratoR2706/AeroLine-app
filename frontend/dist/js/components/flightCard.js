// ============================================================
//  components/flightCard.ts — карточка рейса в виде билета-квитанции.
// ============================================================
import { esc, money, fmtTime, fmtDuration, fmtDateTime, STATUS_LABEL, STATUS_CLASS } from '../utils.js';
import { cityName } from '../cities.js';
export function flightCard(f, opts) {
    const reason = opts && opts.reason;
    const st = f.status;
    const minPrice = f.priceEconomy;
    const fromName = f.fromName || cityName(f.from);
    const toName = f.toName || cityName(f.to);
    const aircraftModel = f.aircraftModel || f.aircraft;
    return '<div class="card ticket" data-reveal>' +
        '<div class="ticket-main">' +
        `<div class="spread"><span class="flight-num mono">${f.id}</span>` +
        `<span class="badge ${STATUS_CLASS[st]}">${STATUS_LABEL[st]}</span></div>` +
        `<div class="route-line"><span class="route-city">${esc(fromName)}</span><span class="route-arrow"></span><span class="route-city">${esc(toName)}</span></div>` +
        '<div class="flight-meta">' +
        `<span class="mono">${fmtTime(f.dep)} → ${fmtTime(f.arr)}</span>` +
        `<span>${fmtDuration(f.dep, f.arr)}</span>` +
        `<span>${fmtDateTime(f.dep)}</span>` +
        `<span>${esc(aircraftModel)}</span>` +
        '</div>' +
        (reason ? `<span class="reason-pill">${esc(reason)}</span>` : '') +
        '</div>' +
        '<div class="ticket-stub-divider"></div>' +
        '<div class="ticket-side">' +
        `<div class="price-tag">${money(minPrice)}<small>эконом, от</small></div>` +
        `<a class="btn btn-primary btn-sm" href="#/flight/${f.id}">Выбрать место</a>` +
        '</div>' +
        '</div>';
}
//# sourceMappingURL=flightCard.js.map