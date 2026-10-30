'use strict';

const db = require('../db');
const { HttpError } = require('../http-helpers');
const { requireAdmin } = require('../auth-middleware');

const STATUS_VALUES = ['SCHEDULED', 'DELAYED', 'CANCELLED', 'DEPARTED', 'ARRIVED'];

function register(router) {
  router.get('/admin/flights', (ctx) => {
    requireAdmin(ctx);
    const list = db.rows(db.sql`
      SELECT f.id, fc.name AS "fromName", tc.name AS "toName", f.departure_at AS "dep",
             a.model AS "aircraftModel", f.status
      FROM flights f
      JOIN cities fc ON fc.code = f.from_city
      JOIN cities tc ON tc.code = f.to_city
      JOIN aircraft a ON a.id = f.aircraft_id
      ORDER BY f.departure_at
    `);
    return { data: list };
  });

  router.patch('/admin/flights/:id/status', (ctx) => {
    requireAdmin(ctx);
    const status = ctx.body.status;
    if (!STATUS_VALUES.includes(status)) throw new HttpError(400, 'Недопустимый статус рейса');
    const updated = db.execReturning(db.sql`
      UPDATE flights SET status = ${status} WHERE id = ${ctx.params.id}
      RETURNING id, status
    `);
    if (!updated.length) throw new HttpError(404, 'Рейс не найден');
    return { data: updated[0] };
  });

  router.get('/admin/bookings', (ctx) => {
    requireAdmin(ctx);
    const list = db.rows(db.sql`
      SELECT b.id, b.code, b.passenger_name AS "passenger", b.flight_id AS "flightId",
             b.seat, b.class, b.total, b.status, b.created_at AS "createdAt"
      FROM bookings b
      ORDER BY b.created_at DESC
    `);
    return { data: list };
  });
}

module.exports = { register };
