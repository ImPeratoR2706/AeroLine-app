// ============================================================
//  utils.ts — общие утилиты форматирования и работы с DOM.
// ============================================================
export function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
export function money(n) {
    if (n == null)
        return '—';
    return n.toLocaleString('ru-RU') + ' ₸';
}
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
export function fmtDateTime(iso) {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${dd} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]} · ${hh}:${mm}`;
}
export function fmtTime(iso) {
    const d = new Date(iso);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
export function fmtDuration(dep, arr) {
    const mins = Math.round((new Date(arr).getTime() - new Date(dep).getTime()) / 60000);
    const h = Math.floor(mins / 60), m = mins % 60;
    return `${h} ч` + (m ? ` ${m} мин` : '');
}
export function qs(sel, root) {
    return (root || document).querySelector(sel);
}
export function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
}
export const STATUS_LABEL = {
    SCHEDULED: 'По расписанию', DELAYED: 'Задержан', CANCELLED: 'Отменён',
    DEPARTED: 'Вылетел', ARRIVED: 'Прибыл', CONFIRMED: 'Подтверждено', PENDING: 'Ожидает оплаты',
};
export const STATUS_CLASS = {
    SCHEDULED: 'badge-good', DELAYED: 'badge-warn', CANCELLED: 'badge-danger',
    DEPARTED: 'badge-neutral', ARRIVED: 'badge-neutral', CONFIRMED: 'badge-good', PENDING: 'badge-warn',
};
export const CLASS_LABEL = {
    economy: 'Эконом', comfort: 'Комфорт', business: 'Бизнес',
};
export const EXTRA_PRICE = { baggage: 8000, meal: 3500 };
//# sourceMappingURL=utils.js.map