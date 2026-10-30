// ============================================================
//  main.ts — точка входа: восстановление сессии, обработчики
//  событий (формы, клики, смена статуса) и запуск роутера.
// ============================================================
import { api, ApiError, setToken } from './api.js';
import { STATE } from './state.js';
import { render, parseRoute } from './router.js';
import { toast, openModal, closeModal, confirmAction } from './toast.js';
import { qsa, esc, fmtDateTime, CLASS_LABEL } from './utils.js';
function errorMessage(e, fallback) {
    return e instanceof ApiError ? e.message : fallback;
}
/* ========================= ФОРМЫ ========================= */
document.addEventListener('submit', (e) => {
    const form = e.target;
    const action = form.getAttribute && form.getAttribute('data-action');
    if (!action)
        return;
    if (action === 'search-form') {
        e.preventDefault();
        const fd = new FormData(form);
        const from = fd.get('from'), to = fd.get('to');
        const qsParts = [];
        if (from)
            qsParts.push('from=' + from);
        if (to)
            qsParts.push('to=' + to);
        location.hash = '/flights' + (qsParts.length ? '?' + qsParts.join('&') : '');
        return;
    }
    if (action === 'booking-details') {
        e.preventDefault();
        if (!STATE.draft)
            return;
        const fd = new FormData(form);
        STATE.draft.fullName = String(fd.get('fullName') || '');
        STATE.draft.doc = String(fd.get('doc') || '');
        STATE.draft.extras = { baggage: !!fd.get('baggage'), meal: !!fd.get('meal') };
        STATE.draft.step = 'payment';
        STATE.saveDraft(STATE.draft);
        render();
        return;
    }
    if (action === 'login-form') {
        e.preventDefault();
        const fd = new FormData(form);
        const email = String(fd.get('email') || '');
        const password = String(fd.get('password') || '');
        api.login({ email, password }).then((res) => {
            setToken(res.token);
            STATE.user = res.user;
            toast('Вход выполнен');
            location.hash = res.user.role === 'admin' ? '/admin' : '/profile';
        }).catch((err) => {
            toast(errorMessage(err, 'Не удалось войти'));
        });
        return;
    }
    if (action === 'register-form') {
        e.preventDefault();
        const fd = new FormData(form);
        const fullName = String(fd.get('fullName') || '');
        const email = String(fd.get('email') || '');
        const password = String(fd.get('password') || '');
        api.register({ fullName, email, password }).then((res) => {
            setToken(res.token);
            STATE.user = res.user;
            toast('Аккаунт создан, добро пожаловать!');
            location.hash = '/profile';
        }).catch((err) => {
            toast(errorMessage(err, 'Не удалось зарегистрироваться'));
        });
        return;
    }
});
/* ========================= КЛИКИ ========================= */
document.addEventListener('click', (e) => {
    const target = e.target;
    const t = target.closest('[data-action],[data-close-modal],[data-tab]');
    if (!t)
        return;
    if (t.hasAttribute('data-close-modal')) {
        closeModal();
        return;
    }
    const action = t.getAttribute('data-action');
    if (t.hasAttribute('data-tab')) {
        const tab = t.getAttribute('data-tab');
        qsa('.tab-btn').forEach((b) => b.classList.toggle('active', b === t));
        qsa('[data-tab-panel]').forEach((p) => { p.hidden = p.getAttribute('data-tab-panel') !== tab; });
        return;
    }
    if (action === 'logout') {
        STATE.logout();
        toast('Вы вышли из аккаунта');
        location.hash = '/';
        return;
    }
    if (action === 'demo-login') {
        const role = t.getAttribute('data-role') === 'admin' ? 'admin' : 'passenger';
        api.demoLogin(role).then((res) => {
            setToken(res.token);
            STATE.user = res.user;
            toast('Вход выполнен как ' + (role === 'admin' ? 'администратор' : 'пассажир') + ' (демо)');
            location.hash = role === 'admin' ? '/admin' : '/profile';
        }).catch((err) => { toast(errorMessage(err, 'Не удалось выполнить демо-вход')); });
        return;
    }
    if (action === 'select-seat') {
        const seat = t.getAttribute('data-seat') || '';
        const cls = (t.getAttribute('data-cls') || 'economy');
        const flightId = parseRoute().path.split('/')[2];
        api.flight(flightId).then((f) => {
            const priceByClass = { economy: f.priceEconomy, comfort: f.priceComfort, business: f.priceBusiness };
            const price = priceByClass[cls];
            if (price == null)
                return;
            STATE.draft = { flightId: f.id, seat, cls, price, step: 'details', extras: { baggage: false, meal: false } };
            STATE.saveDraft(STATE.draft);
            render();
        }).catch((err) => { toast(errorMessage(err, 'Не удалось выбрать место')); });
        return;
    }
    if (action === 'go-booking') {
        location.hash = '/booking';
        return;
    }
    if (action === 'booking-back') {
        if (STATE.draft) {
            STATE.draft.step = 'details';
            STATE.saveDraft(STATE.draft);
        }
        render();
        return;
    }
    if (action === 'booking-pay') {
        const d = STATE.draft;
        if (!d)
            return;
        api.createBooking({
            flightId: d.flightId,
            seat: d.seat,
            cls: d.cls,
            passengerName: d.fullName || '',
            docNumber: d.doc || '',
            baggage: !!(d.extras && d.extras.baggage),
            meal: !!(d.extras && d.extras.meal),
        }).then((booking) => api.payBooking(booking.id)).then((paid) => {
            STATE.saveDraft(null);
            toast('Бронирование ' + paid.code + ' оплачено');
            location.hash = '/profile';
        }).catch((err) => {
            toast(errorMessage(err, 'Не удалось завершить бронирование'));
            render();
        });
        return;
    }
    if (action === 'ask-cancel') {
        const bid = t.getAttribute('data-booking') || '';
        confirmAction('Отменить бронирование? Действие необратимо.', `data-action="do-cancel" data-booking="${bid}"`);
        return;
    }
    if (action === 'do-cancel') {
        const bid = Number(t.getAttribute('data-booking'));
        api.cancelBooking(bid).then((res) => {
            closeModal();
            toast('Бронирование ' + res.code + ' отменено');
            render();
        }).catch((err) => { closeModal(); toast(errorMessage(err, 'Не удалось отменить бронирование')); });
        return;
    }
    if (action === 'view-ticket') {
        const bid = Number(t.getAttribute('data-booking'));
        api.myBookings().then((list) => {
            const b = list.find((x) => x.id === bid);
            if (!b)
                return;
            openModal('<h3>Электронный билет</h3>' +
                '<div class="stack">' +
                `<div class="spread"><span>Рейс</span><strong class="mono">${b.flightId}</strong></div>` +
                `<div class="spread"><span>Маршрут</span><span>${esc((b.fromName || b.from || '') + ' → ' + (b.toName || b.to || ''))}</span></div>` +
                `<div class="spread"><span>Вылет</span><span>${b.dep ? fmtDateTime(b.dep) : '—'}</span></div>` +
                `<div class="spread"><span>Пассажир</span><span>${esc(b.passengerName || '')}</span></div>` +
                `<div class="spread"><span>Место</span><span class="mono">${b.seat} · ${CLASS_LABEL[b.class]}</span></div>` +
                `<div class="spread"><span>Номер брони</span><span class="mono">${b.code}</span></div>` +
                '</div>' +
                '<button class="btn btn-ghost btn-block" style="margin-top:16px" data-close-modal>Закрыть</button>');
        }).catch((err) => { toast(errorMessage(err, 'Не удалось загрузить билет')); });
        return;
    }
});
/* ========================= ИЗМЕНЕНИЯ (смена статуса рейса) ========================= */
document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.getAttribute && t.getAttribute('data-action') === 'set-status') {
        const flightId = t.getAttribute('data-flight') || '';
        api.setFlightStatus(flightId, t.value).then(() => {
            toast('Статус рейса ' + flightId + ' обновлён');
            render();
        }).catch((err) => { toast(errorMessage(err, 'Не удалось обновить статус')); render(); });
    }
});
/* ========================= ЗАПУСК ========================= */
async function bootstrap() {
    if (STATE.hasToken()) {
        try {
            const res = await api.me();
            STATE.user = res.user;
        }
        catch {
            setToken(null);
        }
    }
    await render();
}
window.addEventListener('hashchange', () => { render(); });
bootstrap();
//# sourceMappingURL=main.js.map