// ============================================================
//  components/seatMap.ts — интерактивная схема салона.
//  Данные (занятость мест) приходят с бэкенда (GET /flights/:id/seats);
//  здесь только отрисовка — детерминированный алгоритм подсадки
//  "фейковых" пассажиров теперь живёт на сервере (services/seatmap.js).
// ============================================================
import { iconPlane } from '../icons.js';
import { esc, CLASS_LABEL } from '../utils.js';
export function renderSeatMap(map, aircraftModel, selectedSeat) {
    let html = `<div class="seatmap-scroll"><div class="cabin"><div class="cabin-nose">${iconPlane()} Нос самолёта · ${esc(aircraftModel)}</div>`;
    for (const r of map.rows) {
        html += `<div class="seat-row"><span class="row-num mono">${r.row}</span><div class="seat-group">`;
        r.seats.forEach((s, i) => {
            if (i === r.leftCount)
                html += '</div><div class="aisle-gap"></div><div class="seat-group">';
            const disabled = s.occupied || map.prices[s.cls] == null;
            const selected = selectedSeat === s.code;
            const cls = `seat cls-${s.cls}${s.occupied ? ' is-occupied' : ''}${selected ? ' is-selected' : ''}`;
            const attrs = disabled ? 'disabled' : `data-action="select-seat" data-seat="${s.code}" data-cls="${s.cls}"`;
            html += `<button type="button" class="${cls}" ${attrs} title="${s.code} · ${CLASS_LABEL[s.cls]}">${s.code}</button>`;
        });
        html += '</div></div>';
    }
    html += '</div></div>';
    html += '<div class="legend">' +
        '<div class="legend-item"><span class="legend-swatch" style="background:var(--gold-soft);border-color:var(--gold)"></span>Бизнес</div>' +
        '<div class="legend-item"><span class="legend-swatch" style="background:var(--mint-soft);border-color:var(--mint)"></span>Комфорт</div>' +
        '<div class="legend-item"><span class="legend-swatch" style="background:var(--slate-soft);border-color:var(--slate)"></span>Эконом</div>' +
        '<div class="legend-item"><span class="legend-swatch" style="background:var(--surface-3);border-color:var(--border)"></span>Занято</div>' +
        '<div class="legend-item"><span class="legend-swatch" style="background:var(--accent);border-color:var(--accent-strong)"></span>Выбрано</div>' +
        '</div>';
    return html;
}
//# sourceMappingURL=seatMap.js.map