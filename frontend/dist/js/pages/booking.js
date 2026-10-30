// ============================================================
//  pages/booking.ts — оформление бронирования: данные пассажира,
//  затем демонстрационная оплата.
// ============================================================
import { api } from '../api.js';
import { STATE } from '../state.js';
import { emptyPage } from './shared.js';
import { esc, money, CLASS_LABEL, EXTRA_PRICE } from '../utils.js';
import { cityName } from '../cities.js';
export async function pageBooking() {
    const d = STATE.draft;
    if (!d)
        return emptyPage('Нечего бронировать', 'Сначала выберите рейс и место на схеме салона.', '/flights', 'К рейсам');
    const f = await api.flight(d.flightId);
    const extras = d.extras || { baggage: false, meal: false };
    const total = d.price + (extras.baggage ? EXTRA_PRICE.baggage : 0) + (extras.meal ? EXTRA_PRICE.meal : 0);
    const step = d.step || 'details';
    const fromName = f.fromName || cityName(f.from);
    const toName = f.toName || cityName(f.to);
    return ('<section class="section">' +
        `<div class="section-head"><div><span class="eyebrow">Оформление</span><h2>Бронирование ${f.id} · место ${d.seat}</h2></div></div>` +
        '<div class="grid flight-grid">' +
        '<div class="card" style="padding:22px" data-reveal>' +
        (step === 'details' ? bookingDetailsForm(d) : bookingPaymentView(d, total)) +
        '</div>' +
        '<div class="card" style="padding:20px" data-reveal>' +
        '<h3>Итог</h3>' +
        '<div class="stack">' +
        `<div class="spread muted"><span>Рейс</span><span class="mono">${f.id}</span></div>` +
        `<div class="spread muted"><span>Направление</span><span>${esc(fromName)} → ${esc(toName)}</span></div>` +
        `<div class="spread muted"><span>Место</span><span class="mono">${d.seat} · ${CLASS_LABEL[d.cls]}</span></div>` +
        `<div class="spread muted"><span>Тариф</span><span>${money(d.price)}</span></div>` +
        `<div class="spread muted"><span>Багаж 20 кг</span><span>${extras.baggage ? money(EXTRA_PRICE.baggage) : '—'}</span></div>` +
        `<div class="spread muted"><span>Питание</span><span>${extras.meal ? money(EXTRA_PRICE.meal) : '—'}</span></div>` +
        `<div class="spread" style="border-top:1px solid var(--border);padding-top:10px"><strong>Итого</strong><strong class="price-tag" style="font-size:1.1rem">${money(total)}</strong></div>` +
        '</div>' +
        '</div>' +
        '</div>' +
        '</section>');
}
function bookingDetailsForm(d) {
    const extras = d.extras || { baggage: false, meal: false };
    const defaultName = STATE.user ? STATE.user.fullName : '';
    const defaultDoc = STATE.user && STATE.user.docNumber ? STATE.user.docNumber : '';
    return ('<h3>Данные пассажира</h3>' +
        '<form class="stack" data-action="booking-details">' +
        '<div class="form-grid">' +
        `<div><label>ФИО пассажира</label><input name="fullName" required value="${esc(d.fullName || defaultName)}"></div>` +
        `<div><label>Номер документа</label><input name="doc" required value="${esc(d.doc || defaultDoc)}" placeholder="N01234567"></div>` +
        '</div>' +
        `<div><label class="checkline"><input type="checkbox" name="baggage" ${extras.baggage ? 'checked' : ''}> Багаж 20 кг — ${money(EXTRA_PRICE.baggage)}</label></div>` +
        `<div><label class="checkline"><input type="checkbox" name="meal" ${extras.meal ? 'checked' : ''}> Питание на борту — ${money(EXTRA_PRICE.meal)}</label></div>` +
        '<button class="btn btn-primary" type="submit" style="align-self:flex-start">Перейти к оплате</button>' +
        '</form>');
}
function bookingPaymentView(d, total) {
    return ('<h3>Оплата (демонстрационный режим)</h3>' +
        '<p class="muted">Это демонстрационная версия оплаты — средства с карты не списываются. Нажмите кнопку ниже, чтобы подтвердить бронирование.</p>' +
        '<div class="card" style="padding:16px;background:var(--surface-2);border-style:dashed;margin-bottom:16px">' +
        `<div class="spread"><span>Пассажир</span><strong>${esc(d.fullName || '')}</strong></div>` +
        `<div class="spread"><span>Документ</span><span class="mono">${esc(d.doc || '')}</span></div>` +
        `<div class="spread"><span>К оплате</span><strong class="price-tag">${money(total)}</strong></div>` +
        '</div>' +
        '<div class="row">' +
        '<button class="btn btn-ghost" data-action="booking-back">Назад</button>' +
        '<button class="btn btn-primary" data-action="booking-pay">Подтвердить оплату (демо)</button>' +
        '</div>');
}
//# sourceMappingURL=booking.js.map