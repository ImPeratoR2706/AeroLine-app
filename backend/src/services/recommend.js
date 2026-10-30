// ============================================================
//  recommend.js — подбор рекомендованных рейсов.
//  Портировано из исходного прототипа: популярность + выгодная
//  цена + признак «в тренде» + персонализация по истории поездок
//  пассажира (куда он уже летал раньше).
// ============================================================

'use strict';

const db = require('../db');

function activeFlightsQuery() {
  return db.rows(db.sql`
    SELECT f.id, f.from_city AS "from", f.to_city AS "to",
           f.departure_at AS "dep", f.arrival_at AS "arr",
           f.aircraft_id AS "aircraft", f.status,
           f.price_economy AS "priceEconomy", f.price_comfort AS "priceComfort", f.price_business AS "priceBusiness",
           f.popularity, f.trending
    FROM flights f
    WHERE f.status <> 'CANCELLED'
    ORDER BY f.departure_at
  `);
}

function destinationHistoryFor(userId) {
  if (!userId) return [];
  const list = db.rows(db.sql`
    SELECT DISTINCT f.to_city AS "toCity"
    FROM bookings b JOIN flights f ON f.id = b.flight_id
    WHERE b.user_id = ${userId} AND b.status = 'ARRIVED'
  `);
  return list.map((r) => r.toCity);
}

/** userId опционален — для гостя рекомендации без персонализации. */
function recommendFlights(userId) {
  const active = activeFlightsQuery();
  if (!active.length) return [];
  const history = destinationHistoryFor(userId);
  const maxPrice = Math.max(...active.map((f) => f.priceEconomy));
  const scored = active.map((f) => {
    const priceScore = (1 - f.priceEconomy / maxPrice) * 100;
    let score = f.popularity * 0.5 + priceScore * 0.2;
    const reasons = [];
    if (f.trending) { score += 12; reasons.push('Высокий спрос'); }
    if (history.includes(f.to)) { score += 25; reasons.push('Вы интересовались этим направлением'); }
    if (f.popularity >= 82 && !reasons.includes('Высокий спрос')) reasons.push('Популярное направление');
    if (priceScore >= 70) reasons.push('Выгодная цена');
    if (!reasons.length) reasons.push('Подобрано для вас');
    return { flight: f, score, reason: reasons[0] };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4);
}

function popularRoutes(limit) {
  limit = limit || 5;
  return db.rows(db.sql`
    SELECT f.id, f.from_city AS "from", f.to_city AS "to", f.price_economy AS "priceEconomy", f.popularity
    FROM flights f
    WHERE f.status <> 'CANCELLED'
    ORDER BY f.popularity DESC
    LIMIT ${limit}
  `);
}

module.exports = { recommendFlights, popularRoutes, activeFlightsQuery };
