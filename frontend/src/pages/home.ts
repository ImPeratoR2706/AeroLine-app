// ============================================================
//  pages/home.ts — главная страница: hero, поиск, рекомендации,
//  карта популярных направлений.
// ============================================================

import { api } from '../api.js';
import { STATE } from '../state.js';
import { iconPlane } from '../icons.js';
import { heroSkySVG, renderRouteMap } from '../illustrations.js';
import { flightCard } from '../components/flightCard.js';
import { cityOptionsHtml } from '../cities.js';

export async function pageHome(): Promise<string> {
  const [recs, popular] = await Promise.all([
    api.recommendations(),
    api.popularRoutes(5),
  ]);
  return (
  '<section class="hero">' +
    '<div class="hero-grid">' +
      '<div class="hero-copy" data-reveal>' +
        '<span class="eyebrow">Авиакомпания «АэроЛайн»</span>' +
        '<h1>Бронируйте билеты и выбирайте место на схеме салона за пару минут</h1>' +
        '<p>Поиск рейсов, интерактивная схема салона с выбором конкретного кресла и персональные рекомендации — всё в одном окне.</p>' +
        '<div class="hero-cta-row"><a class="btn btn-primary" href="#/flights">Найти рейс</a></div>' +
      '</div>' +
      `<div class="hero-sky" data-reveal>${heroSkySVG()}` +
        `<div class="hs-badge"><span class="hs-badge-icon">${iconPlane()}</span><strong>Полёт на высшем уровне от лучшей авиакомпании</strong></div>` +
      '</div>' +
    '</div>' +
  '</section>' +
  '<section class="section" style="padding-top:0">' +
    '<form class="card search-form" data-action="search-form" data-reveal>' +
      `<div class="field"><label>Откуда</label><select name="from">${cityOptionsHtml('ALA')}</select></div>` +
      `<div class="field"><label>Куда</label><select name="to">${cityOptionsHtml('AYT')}</select></div>` +
      '<div class="field"><label>Дата</label><input type="date" name="date" value="2026-10-17"></div>' +
      '<div class="field"><label>Пассажиры</label><select name="pax"><option>1</option><option>2</option><option>3</option><option>4</option></select></div>' +
      '<div class="field" style="justify-content:flex-end"><button class="btn btn-primary" type="submit">Найти рейсы</button></div>' +
    '</form>' +
  '</section>' +
  '<section class="section" style="padding-top:0">' +
    '<div class="section-head" data-reveal><div><span class="eyebrow">Подобрано для вас</span><h2>Рекомендации рейсов</h2></div><a href="#/flights">Все рейсы →</a></div>' +
    `<div class="grid grid-2">${recs.map((r) => flightCard(r.flight, { reason: r.reason })).join('')}</div>` +
    (STATE.role !== 'passenger' ? '<p class="muted" style="margin-top:12px">Войдите как пассажир, чтобы увидеть рекомендации на основе ваших прошлых поездок.</p>' : '') +
  '</section>' +
  '<section class="section" style="padding-top:0">' +
    '<div class="section-head" data-reveal><div><span class="eyebrow">Сеть направлений</span><h2>Куда летают чаще всего</h2></div></div>' +
    `<div class="card route-map-wrap" data-reveal>${renderRouteMap(popular)}</div>` +
  '</section>'
  );
}
