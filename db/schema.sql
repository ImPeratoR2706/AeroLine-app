-- ============================================================
--  АэроЛайн — схема базы данных (PostgreSQL)
--  Роли: Гость (не хранится в БД) / Пассажир / Администратор
-- ============================================================

DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS flights CASCADE;
DROP TABLE IF EXISTS aircraft_classes CASCADE;
DROP TABLE IF EXISTS aircraft CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ---------- города ----------
CREATE TABLE cities (
  code  VARCHAR(4) PRIMARY KEY,   -- 'ALA'
  name  VARCHAR(80) NOT NULL      -- 'Алматы'
);

-- ---------- пользователи ----------
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(160) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(16)  NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger','admin')),
  doc_number    VARCHAR(32),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- типы самолётов ----------
CREATE TABLE aircraft (
  id      VARCHAR(8) PRIMARY KEY,         -- 'A320', 'A321', 'E190'
  model   VARCHAR(80) NOT NULL,
  rows    SMALLINT NOT NULL
);

-- раскладка кресел по классам для каждого типа самолёта:
--   left_count/right_count — число кресел слева/справа от прохода
CREATE TABLE aircraft_classes (
  aircraft_id  VARCHAR(8) REFERENCES aircraft(id) ON DELETE CASCADE,
  class        VARCHAR(16) NOT NULL CHECK (class IN ('economy','comfort','business')),
  row_from     SMALLINT NOT NULL,
  row_to       SMALLINT NOT NULL,
  left_count   SMALLINT NOT NULL,
  right_count  SMALLINT NOT NULL,
  PRIMARY KEY (aircraft_id, class)
);

-- ---------- рейсы ----------
CREATE TABLE flights (
  id               VARCHAR(12) PRIMARY KEY,   -- 'AL-305'
  from_city        VARCHAR(4)  NOT NULL REFERENCES cities(code),
  to_city          VARCHAR(4)  NOT NULL REFERENCES cities(code),
  departure_at     TIMESTAMPTZ NOT NULL,
  arrival_at       TIMESTAMPTZ NOT NULL,
  aircraft_id      VARCHAR(8)  NOT NULL REFERENCES aircraft(id),
  status           VARCHAR(16) NOT NULL DEFAULT 'SCHEDULED'
                   CHECK (status IN ('SCHEDULED','DELAYED','CANCELLED','DEPARTED','ARRIVED')),
  price_economy    INTEGER,
  price_comfort    INTEGER,
  price_business   INTEGER,
  popularity       SMALLINT NOT NULL DEFAULT 50,
  trending         BOOLEAN NOT NULL DEFAULT false
);

-- ---------- бронирования ----------
CREATE TABLE bookings (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(12) NOT NULL UNIQUE,       -- 'B-1001' — человекочитаемый номер
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flight_id    VARCHAR(12) NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  seat         VARCHAR(4)  NOT NULL,
  class        VARCHAR(16) NOT NULL CHECK (class IN ('economy','comfort','business')),
  passenger_name VARCHAR(160) NOT NULL,
  doc_number   VARCHAR(32)  NOT NULL,
  baggage      BOOLEAN NOT NULL DEFAULT false,
  meal         BOOLEAN NOT NULL DEFAULT false,
  price        INTEGER NOT NULL,
  total        INTEGER NOT NULL,
  status       VARCHAR(16) NOT NULL DEFAULT 'PENDING'
               CHECK (status IN ('PENDING','CONFIRMED','CANCELLED','ARRIVED')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- на один рейс одно и то же место нельзя забронировать дважды, но после
-- отмены место снова становится доступным (частичный уникальный индекс)
CREATE UNIQUE INDEX uniq_active_seat ON bookings(flight_id, seat) WHERE status <> 'CANCELLED';

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_flight ON bookings(flight_id);
CREATE INDEX idx_flights_route ON flights(from_city, to_city);
