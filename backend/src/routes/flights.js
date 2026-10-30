'use strict';

const db = require('../db');
const { HttpError } = require('../http-helpers');
const { currentUser } = require('../auth-middleware');
const { buildSeatMap } = require('../services/seatmap');
const { recommendFlights, popularRoutes } = require('../services/recommend');

const FLIGHT_SELECT = `
  SELECT f.id, f.from_city AS "from", f.to_city AS "to",
         fc.name AS "fromName", tc.name AS "toName",
         f.departure_at AS "dep", f.arrival_at AS "arr",
         f.aircraft_id AS "aircraft", a.model AS "aircraftModel",
         f.status,
         f.price_economy AS "priceEconomy", f.price_comfort AS "priceComfort", f.price_business AS "priceBusiness",
         f.popularity, f.trending
  FROM flights f
  JOIN cities fc ON fc.code = f.from_city
  JOIN cities tc ON tc.code = f.to_city
  JOIN aircraft a ON a.id = f.aircraft_id
`;

function bookedSeatsFor(flightId) {
  const list = db.rows(db.sql`
    SELECT seat FROM bookings
    WHERE flight_id = ${flightId} AND status IN ('PENDING','CONFIRMED','ARRIVED')
  `);
  return new Set(list.map((r) => r.seat));
}

function register(router) {
  router.get('/cities', () => ({
    data: db.rows(db.sql`SELECT code, name FROM cities ORDER BY name`),
  }));

  router.get('/flights', ({ query }) => {
    // Условия фильтра собираем вручную (без тега sql``), так как их число переменное.
    let text = FLIGHT_SELECT;
    const binds = {};
    const clauses = [];
    if (query.from) { binds.pfrom = query.from; clauses.push(`f.from_city = :'pfrom'`); }
    if (query.to) { binds.pto = query.to; clauses.push(`f.to_city = :'pto'`); }
    if (clauses.length) text += ' WHERE ' + clauses.join(' AND ');
    text += ' ORDER BY f.departure_at';
    return { data: db.rows({ text, binds }) };
  });

  router.get('/flights/:id', ({ params }) => {
    const flight = db.one({ text: FLIGHT_SELECT + ' WHERE f.id = :\'id\'', binds: { id: params.id } });
    if (!flight) throw new HttpError(404, 'Рейс не найден');
    return { data: flight };
  });

  router.get('/flights/:id/seats', ({ params }) => {
    const flight = db.one(db.sql`SELECT id, aircraft_id AS "aircraftId", price_economy AS "priceEconomy", price_comfort AS "priceComfort", price_business AS "priceBusiness" FROM flights WHERE id = ${params.id}`);
    if (!flight) throw new HttpError(404, 'Рейс не найден');
    const booked = bookedSeatsFor(params.id);
    const map = buildSeatMap(flight.aircraftId, flight.id, booked);
    const prices = { economy: flight.priceEconomy, comfort: flight.priceComfort, business: flight.priceBusiness };
    return { data: { aircraftId: flight.aircraftId, prices, rows: map.rows } };
  });

  router.get('/recommendations', (ctx) => {
    const user = currentUser(ctx.req);
    const list = recommendFlights(user ? user.userId : null);
    return { data: list.map((x) => ({ flight: x.flight, reason: x.reason })) };
  });

  router.get('/routes/popular', ({ query }) => {
    const limit = Math.min(parseInt(query.limit, 10) || 5, 10);
    return { data: popularRoutes(limit) };
  });
}

module.exports = { register };
