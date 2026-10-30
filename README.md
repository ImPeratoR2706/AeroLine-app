# АэроЛайн — веб-приложение авиакомпании

Курсовая работа (группа ЭФБО-10-24). Полноценное веб-приложение «из»
прежнего фронтенд-макета: теперь с рабочим бэкендом на **PostgreSQL**,
фронтендом на **HTML + CSS + JavaScript/TypeScript** и связью клиент—сервер
через **REST API** — по той же схеме, что и в первом проекте («Зерно»).

Три роли: **Гость**, **Пассажир**, **Администратор**.

## Архитектура

```
airline-app/
├── db/                  # SQL-схема и начальные данные PostgreSQL
│   ├── schema.sql
│   └── seed.sql
├── backend/             # REST API на Node.js
│   ├── package.json
│   └── src/
│       ├── server.js            # точка входа
│       ├── db.js                # доступ к PostgreSQL
│       ├── crypto-util.js       # пароли (scrypt) и токены (HMAC)
│       ├── http-helpers.js      # роутер + раздача статики
│       ├── auth-middleware.js
│       ├── services/
│       │   ├── seatmap.js       # построение схемы салона
│       │   └── recommend.js     # рекомендации рейсов
│       └── routes/
│           ├── auth.js          # /api/auth/*
│           ├── flights.js       # /api/flights, /api/cities, /api/recommendations …
│           ├── bookings.js       # /api/bookings/*
│           └── admin.js         # /api/admin/*
└── frontend/            # SPA на TypeScript
    ├── package.json
    ├── tsconfig.json
    ├── src/              # исходники TypeScript
    └── dist/             # собранный фронтенд (HTML/CSS/JS) — это и есть статика, которую отдаёт бэкенд
```

Бэкенд — это один Node.js-процесс: он одновременно обслуживает REST API
(`/api/*`) и собранный фронтенд (`frontend/dist`) на одном порту, поэтому
CORS не требуется.

### Почему бэкенд без Express/pg/jsonwebtoken

Эта версия проекта собиралась в изолированной среде **без доступа к
реестру npm** (внешние пакеты физически нельзя было установить). Чтобы
требование «рабочий бэкенд на PostgreSQL» было выполнено по-настоящему, а
не на заглушках, бэкенд написан **только на встроенных модулях Node.js**
(`http`, `crypto`, `child_process`, `fs`, `path`, `url`):

- вместо **Express** — небольшой самописный роутер (`src/http-helpers.js`);
- вместо драйвера **pg** — вызов системного клиента `psql` через
  `child_process` (см. комментарии в начале `src/db.js`); параметры
  запросов передаются через `psql -v name=value`, что защищает от
  SQL-инъекций так же надёжно, как параметризованный запрос обычного
  драйвера;
- вместо **bcrypt** — `crypto.scryptSync` (пароли никогда не хранятся в
  открытом виде);
- вместо **jsonwebtoken** — такие же по смыслу подписанные токены
  (HMAC-SHA256, 7 дней жизни), собранные вручную на `crypto`.

**Если вы разворачиваете проект на своей машине с обычным доступом в
интернет**, ничего менять не обязательно — всё работает как есть. При
желании бэкенд несложно перевести на `pg` + `express` + `bcrypt` +
`jsonwebtoken`: вся бизнес-логика уже выделена в `services/` и `routes/`,
поменять нужно будет только `db.js`, `crypto-util.js` и `http-helpers.js`.

### Фронтенд

Чистый TypeScript, без сборщика (webpack/vite не нужны) — используются
нативные ES-модули браузера. `tsc` компилирует `frontend/src/*.ts` прямо в
`frontend/dist/js/*.js`, которые браузер загружает через
`<script type="module">`. Стили — обычный CSS (`dist/styles.css`),
разметка — `dist/index.html`.

## Установка и запуск

### 1. PostgreSQL

Нужен PostgreSQL 13+ и пользователь/пароль с правом создавать базы.

```bash
# создать базу данных
createdb -U postgres airline
# ИЛИ: psql -U postgres -c "CREATE DATABASE airline;"

# применить схему и начальные данные
psql -U postgres -d airline -f db/schema.sql
psql -U postgres -d airline -f db/seed.sql
```

### 2. Бэкенд

```bash
cd backend
npm install      # зависимостей нет — просто создаст package-lock.json
npm start        # запустит сервер на http://localhost:4000
```

Если параметры подключения к PostgreSQL отличаются от стандартных,
задайте их переменными окружения перед запуском (у всех есть значения по
умолчанию, подходящие для локальной установки):

```bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=postgres
export PGDATABASE=airline
export PORT=4000           # порт самого веб-сервера
export TOKEN_SECRET=замените-на-свой-секрет   # секрет для подписи токенов авторизации
```

### 3. Фронтенд

Собранная версия уже лежит в `frontend/dist`, поэтому **для первого
запуска пересобирать необязательно** — `npm start` в бэкенде сразу отдаст
готовое приложение. Пересборка нужна только после правки файлов в
`frontend/src`:

```bash
cd frontend
npm install      # установит только typescript (devDependencies)
npm run build    # соберёт TypeScript → frontend/dist/js
```

### 4. Открыть приложение

Перейдите в браузере на **http://localhost:4000**.

## Демонстрационные аккаунты

| Роль           | Email                      | Пароль      |
|----------------|-----------------------------|-------------|
| Пассажир       | passenger@aeroline.demo     | password123 |
| Администратор  | admin@aeroline.demo         | password123 |
| Пассажир       | serikov@aeroline.demo       | password123 |
| Пассажир       | nurlanova@aeroline.demo     | password123 |
| Пассажир       | kim@aeroline.demo           | password123 |

На странице входа также есть кнопки быстрого демо-входа (пассажир /
администратор) — они используют эти же аккаунты.

Можно зарегистрировать и нового пользователя через форму «Регистрация» —
он сразу получит роль «Пассажир».

## Возможности по ролям

**Гость** — просмотр рейсов, фильтр по городам, карточка рейса со схемой
салона (без бронирования), общие (неперсонализированные) рекомендации.

**Пассажир** — всё то же самое плюс: выбор конкретного места на схеме
салона, оформление брони (данные пассажира → демо-оплата), личный
кабинет со списком броней и историей завершённых поездок, отмена
активной брони, персональные рекомендации (с учётом направлений, куда
пассажир уже летал).

**Администратор** — таблица всех рейсов с изменением статуса
(по расписанию / задержан / отменён / вылетел / прибыл) и таблица всех
бронирований всех пассажиров.

## REST API (кратко)

```
GET  /api/cities
GET  /api/flights?from=ALA&to=AYT
GET  /api/flights/:id
GET  /api/flights/:id/seats
GET  /api/recommendations
GET  /api/routes/popular?limit=5

POST /api/auth/register        { fullName, email, password, docNumber? }
POST /api/auth/login           { email, password }
POST /api/auth/demo-login      { role: "passenger" | "admin" }
GET  /api/auth/me              (требует Authorization: Bearer <token>)

GET  /api/bookings/mine                       (требует авторизации)
POST /api/bookings                            { flightId, seat, cls, passengerName, docNumber, baggage, meal }
POST /api/bookings/:id/pay
POST /api/bookings/:id/cancel

GET   /api/admin/flights                      (только админ)
PATCH /api/admin/flights/:id/status           { status }
GET   /api/admin/bookings                     (только админ)
```

Все защищённые маршруты ожидают заголовок
`Authorization: Bearer <token>`, где `token` — значение, полученное от
`/api/auth/login`, `/api/auth/register` или `/api/auth/demo-login`.

## База данных

Таблицы: `cities`, `aircraft`, `aircraft_classes`, `flights`, `users`,
`bookings`. Полная схема — в `db/schema.sql`, тестовые данные (города,
самолёты, рейсы, демо-пользователи и несколько бронирований) — в
`db/seed.sql`. Чтобы вернуть базу к начальному состоянию, достаточно
заново выполнить оба файла.
