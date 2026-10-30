'use strict';

const db = require('../db');
const { HttpError } = require('../http-helpers');
const { requireAuth } = require('../auth-middleware');

const EXTRA_PRICE = { baggage: 8000, meal: 3500 };
const CLASS_VALUES = ['economy', 'comfort', 'business'];

const BOOKING_SELECT = `
  SELECT b.id, b.code, b.flight_id AS "flightId", b.seat, b.class,
         b.passenger_name AS "passengerName", b.doc_number AS "docNumber",
         b.baggage, b.meal, b.price, b.total, b.status, b.created_at AS "createdAt",
         f.from_city AS "from", f.to_city AS "to", fc.name AS "fromName", tc.name AS "toName",
         f.departure_at AS "dep", f.arrival_at AS "arr"
  FROM bookings b
  JOIN flights f ON f.id = b.flight_id
  JOIN cities fc ON fc.code = f.from_city
  JOIN cities tc ON tc.code = f.to_city
`;

function isUniqueSeatViolation(err) {
  return /uniq_active_seat/.test(err.message) || /duplicate key value violates unique constraint/.test(err.message);
}

function register(router) {
  router.get('/bookings/mine', (ctx) => {
    const user = requireAuth(ctx);
    const list = db.rows({ text: BOOKING_SELECT + ` WHERE b.user_id = :'uid' ORDER BY b.created_at DESC`, binds: { uid: user.userId } });
    return { data: list };
  });

  router.post('/bookings', (ctx) => {
    const user = requireAuth(ctx);
    const { flightId, seat, cls, passengerName, docNumber } = ctx.body;
    const baggage = !!ctx.body.baggage;
    const meal = !!ctx.body.meal;
    if (!flightId || !seat || !CLASS_VALUES.includes(cls)) {
      throw new HttpError(400, 'Укажите рейс, место и класс обслуживания');
    }
    if (!passengerName || !docNumber) {
      throw new HttpError(400, 'Укажите ФИО и номер документа пассажира');
    }
    const flight = db.one(db.sql`
      SELECT id, status, price_economy AS "priceEconomy", price_comfort AS "priceComfort", price_business AS "priceBusiness"
      FROM flights WHERE id = ${flightId}
    `);
    if (!flight) throw new HttpError(404, 'Рейс не найден');
    if (flight.status === 'CANCELLED') throw new HttpError(409, 'Этот рейс отменён');
    const priceByClass = { economy: flight.priceEconomy, comfort: flight.priceComfort, business: flight.priceBusiness };
    const price = priceByClass[cls];
    if (price == null) throw new HttpError(400, 'Этот класс обслуживания недоступен на данном рейсе');
    const total = price + (baggage ? EXTRA_PRICE.baggage : 0) + (meal ? EXTRA_PRICE.meal : 0);

    // Два отдельных запроса вместо одного вложенного WITH: PostgreSQL не
    // допускает изменяющий данные CTE внутри другого изменяющего CTE
    // ("WITH clause containing a data-modifying statement must be at the
    // top level"), поэтому вставку и присвоение читаемого номера делаем
    // последовательно. Уникальность места гарантируется партиционным
    // индексом uniq_active_seat уже на шаге INSERT.
    let insertedId;
    try {
      const inserted = db.execReturning(db.sql`
        INSERT INTO bookings (code, user_id, flight_id, seat, class, passenger_name, doc_number, baggage, meal, price, total, status)
        VALUES ('TMP', ${user.userId}, ${flightId}, ${seat}, ${cls}, ${passengerName}, ${docNumber}, ${baggage}, ${meal}, ${price}, ${total}, 'PENDING')
        RETURNING id
      `);
      insertedId = inserted[0].id;
    } catch (err) {
      if (isUniqueSeatViolation(err)) throw new HttpError(409, 'Это место уже занято — выберите другое');
      throw err;
    }
    const final = db.execReturning(db.sql`
      UPDATE bookings SET code = 'B-' || (1000 + id) WHERE id = ${insertedId}
      RETURNING id, code, flight_id AS "flightId", seat, class, price, total, status, baggage, meal
    `);
    return { status: 201, data: final[0] };
  });

  router.post('/bookings/:id/pay', (ctx) => {
    const user = requireAuth(ctx);
    const booking = db.one(db.sql`SELECT id, user_id AS "userId", status FROM bookings WHERE id = ${ctx.params.id}`);
    if (!booking) throw new HttpError(404, 'Бронирование не найдено');
    if (booking.userId !== user.userId) throw new HttpError(403, 'Это не ваше бронирование');
    if (booking.status !== 'PENDING') throw new HttpError(409, 'Бронирование уже оплачено или отменено');
    const updated = db.execReturning(db.sql`
      UPDATE bookings SET status = 'CONFIRMED' WHERE id = ${ctx.params.id}
      RETURNING id, code, status
    `);
    return { data: updated[0] };
  });

  router.post('/bookings/:id/cancel', (ctx) => {
    const user = requireAuth(ctx);
    const booking = db.one(db.sql`SELECT id, user_id AS "userId", status FROM bookings WHERE id = ${ctx.params.id}`);
    if (!booking) throw new HttpError(404, 'Бронирование не найдено');
    if (booking.userId !== user.userId && user.role !== 'admin') throw new HttpError(403, 'Это не ваше бронирование');
    if (booking.status === 'CANCELLED' || booking.status === 'ARRIVED') throw new HttpError(409, 'Это бронирование нельзя отменить');
    const updated = db.execReturning(db.sql`
      UPDATE bookings SET status = 'CANCELLED' WHERE id = ${ctx.params.id}
      RETURNING id, code, status
    `);
    return { data: updated[0] };
  });
}

module.exports = { register, EXTRA_PRICE };
