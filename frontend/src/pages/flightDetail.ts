// ============================================================
//  pages/flightDetail.ts — карточка рейса + интерактивная схема
//  салона с выбором места.
// ============================================================

import { api, ApiError } from '../api.js';
import { STATE } from '../state.js';
import { renderSeatMap } from '../components/seatMap.js';
import { emptyPage } from './shared.js';
import { esc, money, fmtDateTime, fmtTime, fmtDuration, STATUS_LABEL, STATUS_CLASS, CLASS_LABEL } from '../utils.js';
import { cityName } from '../cities.js';

export async function pageFlight(id: string): Promise<string> {
  let f;
  try {
    f = await api.flight(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return emptyPage('Рейс не найден', 'Такого рейса нет в расписании.', '/flights', 'К списку рейсов');
    }
    throw e;
  }
  const seatMap = await api.seats(id);
  const draft = STATE.draft && STATE.draft.flightId === id ? STATE.draft : null;
  const selSeat = draft ? draft.seat : null;
  const st = f.status;
  const fromName = f.fromName || cityName(f.from);
  const toName = f.toName || cityName(f.to);
  const aircraftModel = f.aircraftModel || f.aircraft;
  return (
  '<section class="section">' +
    '<div class="card" style="padding:22px;margin-bottom:22px" data-reveal>' +
      `<div class="spread" style="margin-bottom:10px"><span class="flight-num mono" style="font-size:1.1rem">${f.id}</span><span class="badge ${STATUS_CLASS[st]}">${STATUS_LABEL[st]}</span></div>` +
      `<div class="route-line" style="margin-bottom:10px"><span class="route-city" style="font-size:1.4rem">${esc(fromName)}</span><span class="route-arrow"></span><span class="route-city" style="font-size:1.4rem">${esc(toName)}</span></div>` +
      `<div class="flight-meta"><span class="mono">${fmtDateTime(f.dep)} → ${fmtTime(f.arr)}</span><span>${fmtDuration(f.dep, f.arr)}</span><span>${esc(aircraftModel)}</span></div>` +
    '</div>' +
    '<div class="grid flight-grid">' +
      '<div class="card" style="padding:20px" data-reveal>' +
        '<h3 style="margin-bottom:4px">Интерактивная схема салона</h3>' +
        '<p class="muted" style="margin-bottom:14px">Нажмите на свободное место, чтобы выбрать его.</p>' +
        renderSeatMap(seatMap, aircraftModel, selSeat) +
      '</div>' +
      '<div class="card seat-panel" style="padding:20px" data-reveal>' +
        '<h3>Ваш выбор</h3>' +
        (selSeat && draft ? (
          '<div class="stack">' +
          `<div class="spread"><span>Место</span><strong class="mono">${selSeat}</strong></div>` +
          `<div class="spread"><span>Класс</span><span class="badge ${draft.cls === 'business' ? 'badge-gold' : draft.cls === 'comfort' ? 'badge-mint' : 'badge-neutral'}">${CLASS_LABEL[draft.cls]}</span></div>` +
          `<div class="spread"><span>Тариф</span><strong>${money(draft.price)}</strong></div>` +
          (STATE.role === 'guest'
            ? '<a class="btn btn-primary btn-block" href="#/login">Войдите, чтобы забронировать</a>'
            : '<button class="btn btn-primary btn-block" data-action="go-booking">Забронировать место</button>') +
          '</div>'
        ) : '<p class="muted">Место ещё не выбрано.</p>') +
      '</div>' +
    '</div>' +
  '</section>'
  );
}
