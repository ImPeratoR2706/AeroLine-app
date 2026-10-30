// ============================================================
//  seatmap.js — построение схемы салона для рейса.
//  Раскладка кресел по классам берётся из таблицы aircraft_classes.
//  Часть мест помечается занятой детерминированным псевдослучайным
//  алгоритмом (как в исходном прототипе — имитация «других
//  пассажиров»), а поверх накладываются РЕАЛЬНЫЕ занятые места из
//  таблицы bookings (активные брони всегда приоритетнее).
// ============================================================

'use strict';

const db = require('../db');

const LEFT_POOL = 'ABC';
const RIGHT_POOL = 'DEF';

function seedRand(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) { h = (h * 31 + seedStr.charCodeAt(i)) | 0; }
  return function () { h = (h * 1103515245 + 12345) | 0; return ((h >>> 0) % 1000) / 1000; };
}

function occupancyRate(cls) {
  return cls === 'business' ? 0.25 : cls === 'comfort' ? 0.35 : 0.45;
}

function getAircraftLayout(aircraftId) {
  return db.rows(db.sql`
    SELECT a.id, a.model, a.rows,
           ac.class, ac.row_from AS "rowFrom", ac.row_to AS "rowTo",
           ac.left_count AS "leftCount", ac.right_count AS "rightCount"
    FROM aircraft a
    JOIN aircraft_classes ac ON ac.aircraft_id = a.id
    WHERE a.id = ${aircraftId}
    ORDER BY ac.row_from
  `);
}

function classForRow(layout, row) {
  for (const r of layout) { if (row >= r.rowFrom && row <= r.rowTo) return r; }
  return layout[layout.length - 1];
}

/**
 * Возвращает { model, rows: [{row, seats:[{code, cls, occupied}]}] }
 * bookedSeats — Set кодов мест, реально занятых активными бронями этого рейса.
 */
function buildSeatMap(aircraftId, flightId, bookedSeats) {
  const layout = getAircraftLayout(aircraftId);
  if (!layout.length) throw new Error('Неизвестный тип самолёта: ' + aircraftId);
  const totalRows = layout.reduce((max, r) => Math.max(max, r.rowTo), 0);
  const rand = seedRand(flightId + aircraftId);
  const rows = [];
  for (let row = 1; row <= totalRows; row++) {
    const rangeDef = classForRow(layout, row);
    const cls = rangeDef.class;
    const left = LEFT_POOL.slice(0, rangeDef.leftCount).split('');
    const right = RIGHT_POOL.slice(0, rangeDef.rightCount).split('');
    const seats = left.concat(right).map((letter) => {
      const code = row + letter;
      const fakeOccupied = rand() < occupancyRate(cls);
      const reallyOccupied = bookedSeats.has(code);
      return { code, cls, occupied: fakeOccupied || reallyOccupied };
    });
    rows.push({ row, cls, leftCount: left.length, seats });
  }
  return { rows };
}

module.exports = { buildSeatMap, getAircraftLayout };
