// ============================================================
//  pages/profile.ts — личный кабинет пассажира: активные брони
//  и история завершённых поездок.
// ============================================================

import { api } from '../api.js';
import { STATE } from '../state.js';
import { iconPlane } from '../icons.js';
import { emptyPage } from './shared.js';
import { esc, money, fmtDateTime, STATUS_LABEL, STATUS_CLASS } from '../utils.js';
import { cityName } from '../cities.js';
import type { Booking } from '../types.js';

export async function pageProfile(): Promise<string> {
  if (STATE.role === 'guest') return emptyPage('Личный кабинет', 'Войдите, чтобы увидеть свои бронирования.', '/login', 'Войти');
  const all = await api.myBookings();
  const mine = all.filter((b) => b.status !== 'ARRIVED');
  const history = all.filter((b) => b.status === 'ARRIVED');
  const displayName = STATE.user ? STATE.user.fullName : '';
  return (
  '<section class="section">' +
    `<div class="section-head"><div><span class="eyebrow">${esc(displayName)}</span><h2>Мои бронирования</h2></div></div>` +
    (mine.length
      ? `<div class="stack">${mine.slice().reverse().map(bookingRow).join('')}</div>`
      : `<div class="empty" data-reveal><div class="icon">${iconPlane()}</div><p>Активных бронирований пока нет.</p></div>`) +
    '<h3 style="margin-top:34px">История поездок</h3>' +
    (history.length
      ? '<div class="card table-scroll" data-reveal><table><thead><tr><th>Направление</th><th>Дата</th><th>Место</th><th>Статус</th></tr></thead><tbody>' +
        history.map((h) => `<tr><td>${esc((h.fromName || cityName(h.from || '')) + ' → ' + (h.toName || cityName(h.to || '')))}</td><td>${h.dep ? fmtDateTime(h.dep) : '—'}</td><td class="mono">${h.seat}</td><td><span class="badge badge-neutral">${STATUS_LABEL[h.status]}</span></td></tr>`).join('') +
        '</tbody></table></div>'
      : '<p class="muted">Завершённых поездок пока нет.</p>') +
  '</section>'
  );
}

function bookingRow(b: Booking): string {
  const fromName = b.fromName || cityName(b.from || '');
  const toName = b.toName || cityName(b.to || '');
  return `<div class="card" style="padding:18px" data-reveal><div class="spread" style="margin-bottom:8px">` +
    `<strong class="mono">${b.code}</strong><span class="badge ${STATUS_CLASS[b.status]}">${STATUS_LABEL[b.status]}</span></div>` +
    `<div class="spread"><span>${esc(fromName)} → ${esc(toName)} · ${b.flightId}</span><span class="mono">место ${b.seat}</span></div>` +
    `<div class="spread" style="margin-top:6px"><span class="muted">${b.dep ? fmtDateTime(b.dep) : ''}</span><strong>${money(b.total)}</strong></div>` +
    '<div class="row" style="margin-top:12px;justify-content:flex-end">' +
      `<button class="btn btn-ghost btn-sm" data-action="view-ticket" data-booking="${b.id}">Электронный билет</button>` +
      (b.status !== 'CANCELLED' ? `<button class="btn btn-danger btn-sm" data-action="ask-cancel" data-booking="${b.id}">Отменить</button>` : '') +
    '</div></div>';
}
