-- ============================================================
--  АэроЛайн — демо-данные (повторяют исходный мок-набор фронтенда)
-- ============================================================

INSERT INTO cities (code, name) VALUES
 ('ALA','Алматы'), ('NQZ','Астана'), ('CIT','Шымкент'), ('SVO','Москва'),
 ('IST','Стамбул'), ('DXB','Дубай'), ('LED','Санкт-Петербург'), ('PEK','Пекин'),
 ('ICN','Сеул'), ('AYT','Анталья'), ('LHR','Лондон');

INSERT INTO aircraft (id, model, rows) VALUES
 ('A320','Airbus A320',28),
 ('A321','Airbus A321',32),
 ('E190','Embraer E190',20);

INSERT INTO aircraft_classes (aircraft_id, class, row_from, row_to, left_count, right_count) VALUES
 ('A320','business',1,2,2,2),
 ('A320','comfort', 3,8,3,3),
 ('A320','economy',9,28,3,3),
 ('A321','business',1,2,2,2),
 ('A321','comfort', 3,9,3,3),
 ('A321','economy',10,32,3,3),
 ('E190','comfort', 1,3,2,3),
 ('E190','economy', 4,20,2,3);

INSERT INTO flights (id, from_city, to_city, departure_at, arrival_at, aircraft_id, status, price_economy, price_comfort, price_business, popularity, trending) VALUES
 ('AL-201','ALA','SVO','2026-10-15 07:40','2026-10-15 09:55','A320','SCHEDULED', 54000, 89000,156000,72,false),
 ('AL-305','ALA','IST','2026-10-16 23:10','2026-10-17 02:05','A321','SCHEDULED', 68000,110000,198000,88,false),
 ('AL-410','NQZ','DXB','2026-10-14 15:20','2026-10-14 19:40','A320','DELAYED',   71000,115000,205000,75,false),
 ('AL-118','ALA','LED','2026-10-18 06:15','2026-10-18 09:30','A320','SCHEDULED', 58000, 92000,162000,63,false),
 ('AL-552','CIT','ALA','2026-10-13 12:00','2026-10-13 13:10','E190','SCHEDULED', 21000, 34000,  NULL,40,false),
 ('AL-760','ALA','PEK','2026-10-20 10:30','2026-10-20 18:45','A321','SCHEDULED', 95000,150000,260000,65,false),
 ('AL-830','NQZ','ICN','2026-10-22 01:15','2026-10-22 13:40','A321','SCHEDULED',110000,175000,295000,60,false),
 ('AL-640','ALA','AYT','2026-10-17 04:50','2026-10-17 07:35','A320','SCHEDULED', 62000, 98000,172000,97,true),
 ('AL-905','NQZ','LHR','2026-10-25 09:00','2026-10-25 12:20','A321','SCHEDULED',145000,220000,380000,55,false),
 ('AL-212','SVO','ALA','2026-10-14 11:10','2026-10-14 17:25','A320','CANCELLED', 54000, 89000,156000,50,false);

-- Демо-пользователи.
-- Пароль у всех одинаковый: "password123" (хэш scrypt, модуль node:crypto) — удобно для проверки в учебном проекте.
INSERT INTO users (full_name, email, password_hash, role, doc_number) VALUES
 ('Абдыхалыков М.', 'passenger@aeroline.demo', 'scrypt$07abbc6cdf724b08b05234dac5a6cd07$516f086b3ba5486ce3a10f53f3c47606565c65bf9ef44bf7e23c427eed0f08979428e6ea6551881d93e9eb9213106cae12a4047d16d0f570a75daaf4252e812d', 'passenger', 'N01234567'),
 ('Админ Системы',  'admin@aeroline.demo',     'scrypt$07abbc6cdf724b08b05234dac5a6cd07$516f086b3ba5486ce3a10f53f3c47606565c65bf9ef44bf7e23c427eed0f08979428e6ea6551881d93e9eb9213106cae12a4047d16d0f570a75daaf4252e812d', 'admin',     NULL),
 ('Сериков А.Б.',   'serikov@aeroline.demo',   'scrypt$07abbc6cdf724b08b05234dac5a6cd07$516f086b3ba5486ce3a10f53f3c47606565c65bf9ef44bf7e23c427eed0f08979428e6ea6551881d93e9eb9213106cae12a4047d16d0f570a75daaf4252e812d', 'passenger', 'N07765443'),
 ('Нурланова Д.С.', 'nurlanova@aeroline.demo', 'scrypt$07abbc6cdf724b08b05234dac5a6cd07$516f086b3ba5486ce3a10f53f3c47606565c65bf9ef44bf7e23c427eed0f08979428e6ea6551881d93e9eb9213106cae12a4047d16d0f570a75daaf4252e812d', 'passenger', 'N08821190'),
 ('Ким Е.В.',       'kim@aeroline.demo',       'scrypt$07abbc6cdf724b08b05234dac5a6cd07$516f086b3ba5486ce3a10f53f3c47606565c65bf9ef44bf7e23c427eed0f08979428e6ea6551881d93e9eb9213106cae12a4047d16d0f570a75daaf4252e812d', 'passenger', 'N09112230');

-- Исходные брони (для демонстрации личного кабинета и админ-панели)
INSERT INTO bookings (code, user_id, flight_id, seat, class, passenger_name, doc_number, baggage, meal, price, total, status, created_at) VALUES
 ('B-1001', (SELECT id FROM users WHERE email='passenger@aeroline.demo'), 'AL-305', '14C', 'comfort', 'Абдыхалыков М.', 'N01234567', true,  false, 110000, 118000, 'CONFIRMED', '2026-10-05 10:12'),
 ('B-1002', (SELECT id FROM users WHERE email='passenger@aeroline.demo'), 'AL-410', '2A',  'business','Абдыхалыков М.', 'N01234567', false, true,  205000, 208500, 'PENDING',   '2026-10-11 18:40'),
 ('B-1150', (SELECT id FROM users WHERE email='serikov@aeroline.demo'),   'AL-201', '9A',  'economy', 'Сериков А.Б.',   'N07765443', true,  false, 54000,  62000,  'CONFIRMED', '2026-10-09 09:00'),
 ('B-1151', (SELECT id FROM users WHERE email='nurlanova@aeroline.demo'), 'AL-640', '3B',  'business','Нурланова Д.С.', 'N08821190', false, true,  172000, 175500, 'CONFIRMED', '2026-10-10 14:22'),
 ('B-1152', (SELECT id FROM users WHERE email='kim@aeroline.demo'),       'AL-212', '11C', 'economy', 'Ким Е.В.',       'N09112230', false, false, 54000,  54000,  'CANCELLED', '2026-10-06 08:15'),
 -- завершённые поездки — формируют историю направлений для персональных рекомендаций
 ('B-0890', (SELECT id FROM users WHERE email='passenger@aeroline.demo'), 'AL-305', '22D', 'economy', 'Абдыхалыков М.', 'N01234567', false, false, 71000,  71000,  'ARRIVED',   '2026-07-02 00:00'),
 ('B-0775', (SELECT id FROM users WHERE email='passenger@aeroline.demo'), 'AL-410', '4B',  'comfort', 'Абдыхалыков М.', 'N01234567', false, false, 118000, 118000, 'ARRIVED',   '2026-05-14 00:00');
