// ============================================================
//  pages/admin.ts — админ-панель: статусы рейсов и список всех
//  бронирований.
// ============================================================

import { api } from '../api.js';
import { STATE } from '../state.js';
import { emptyPage } from './shared.js';
import { esc, money, fmtDateTime, STATUS_LABEL, STATUS_CLASS } from '../utils.js';
import type { FlightStatus } from '../types.js';

const STATUSES: FlightStatus[] = ['SCHEDULED', 'DELAYED', 'CANCELLED', 'DEPARTED', 'ARRIVED'];

export async function pageAdmin(): Promise<string> {
  if (STATE.role !== 'admin') return emptyPage('Доступ запрещён', 'Эта страница доступна только администратору.', '/login', 'Войти как администратор');
  const [flights, bookings] = await Promise.all([api.adminFlights(), api.adminBookings()]);
  return (
  '<section class="section">' +
    '<div class="section-head"><div><span class="eyebrow">Администрирование</span><h2>Рейсы и статусы</h2></div></div>' +
    '<div class="card table-scroll" data-reveal><table><thead><tr><th>Рейс</th><th>Маршрут</th><th>Вылет</th><th>Самолёт</th><th>Статус</th></tr></thead><tbody>' +
    flights.map((f) => {
      const st = f.status;
      return `<tr><td class="mono">${f.id}</td><td>${esc(f.fromName)} → ${esc(f.toName)}</td><td>${fmtDateTime(f.dep)}</td><td>${esc(f.aircraftModel)}</td>` +
        `<td><select class="status-select" data-action="set-status" data-flight="${f.id}">${STATUSES.map((s) => `<option value="${s}"${s === st ? ' selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}</select></td></tr>`;
    }).join('') +
    '</tbody></table></div>' +
    '<div class="section-head" style="margin-top:34px"><div><span class="eyebrow">Все клиенты</span><h2>Бронирования</h2></div></div>' +
    '<div class="card table-scroll" data-reveal><table><thead><tr><th>№</th><th>Пассажир</th><th>Рейс</th><th>Место</th><th>Сумма</th><th>Статус</th></tr></thead><tbody>' +
    bookings.map((b) => `<tr><td class="mono">${b.code}</td><td>${esc(b.passenger)}</td><td class="mono">${b.flightId}</td><td class="mono">${b.seat}</td><td>${money(b.total)}</td><td><span class="badge ${STATUS_CLASS[b.status]}">${STATUS_LABEL[b.status]}</span></td></tr>`).join('') +
    '</tbody></table></div>' +
  '</section>'
  );
}
