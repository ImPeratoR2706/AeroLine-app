// ============================================================
//  pages/flights.ts — список рейсов с фильтром по городам.
// ============================================================

import { api } from '../api.js';
import { iconPlane } from '../icons.js';
import { flightCard } from '../components/flightCard.js';
import { cityOptionsHtml } from '../cities.js';

export async function pageFlights(params: Record<string, string>): Promise<string> {
  const list = await api.flights({ from: params.from, to: params.to });
  return (
  '<section class="section">' +
    `<div class="section-head"><div><span class="eyebrow">Расписание</span><h2>${list.length ? list.length + ' рейс(ов) найдено' : 'Рейсы'}</h2></div></div>` +
    '<form class="card search-form" data-action="search-form" data-reveal style="margin-bottom:22px">' +
      `<div class="field"><label>Откуда</label><select name="from"><option value="">Любой город</option>${cityOptionsHtml(params.from || '')}</select></div>` +
      `<div class="field"><label>Куда</label><select name="to"><option value="">Любой город</option>${cityOptionsHtml(params.to || '')}</select></div>` +
      '<div class="field"><label>Дата</label><input type="date" name="date"></div>' +
      '<div class="field"><label>Пассажиры</label><select name="pax"><option>1</option><option>2</option></select></div>' +
      '<div class="field" style="justify-content:flex-end"><button class="btn btn-primary" type="submit">Применить</button></div>' +
    '</form>' +
    (list.length
      ? `<div class="stack">${list.map((f) => flightCard(f)).join('')}</div>`
      : `<div class="empty" data-reveal><div class="icon">${iconPlane()}</div><p>Рейсов по этому направлению пока нет. Попробуйте изменить города.</p></div>`) +
  '</section>'
  );
}
