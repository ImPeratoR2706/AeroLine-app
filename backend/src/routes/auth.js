'use strict';

const db = require('../db');
const { hashPassword, verifyPassword, signToken } = require('../crypto-util');
const { HttpError } = require('../http-helpers');
const { requireAuth } = require('../auth-middleware');

function publicUser(u) {
  return { id: u.id, fullName: u.fullName, email: u.email, role: u.role, docNumber: u.docNumber };
}

function register(router) {
  router.post('/auth/register', ({ body }) => {
    const fullName = (body.fullName || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const docNumber = (body.docNumber || '').trim() || null;
    if (!fullName || !email || password.length < 6) {
      throw new HttpError(400, 'Укажите имя, email и пароль (минимум 6 символов)');
    }
    const existing = db.one(db.sql`SELECT id FROM users WHERE email = ${email}`);
    if (existing) throw new HttpError(409, 'Пользователь с таким email уже зарегистрирован');
    const passwordHash = hashPassword(password);
    const inserted = db.execReturning(db.sql`
      INSERT INTO users (full_name, email, password_hash, role, doc_number)
      VALUES (${fullName}, ${email}, ${passwordHash}, 'passenger', ${docNumber})
      RETURNING id, full_name AS "fullName", email, role, doc_number AS "docNumber"
    `);
    const user = inserted[0];
    const token = signToken({ userId: user.id, role: user.role, fullName: user.fullName });
    return { status: 201, data: { token, user: publicUser(user) } };
  });

  router.post('/auth/login', ({ body }) => {
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const user = db.one(db.sql`
      SELECT id, full_name AS "fullName", email, role, doc_number AS "docNumber", password_hash AS "passwordHash"
      FROM users WHERE email = ${email}
    `);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new HttpError(401, 'Неверный email или пароль');
    }
    const token = signToken({ userId: user.id, role: user.role, fullName: user.fullName });
    return { data: { token, user: publicUser(user) } };
  });

  router.get('/auth/me', (ctx) => {
    const session = requireAuth(ctx);
    const user = db.one(db.sql`
      SELECT id, full_name AS "fullName", email, role, doc_number AS "docNumber"
      FROM users WHERE id = ${session.userId}
    `);
    if (!user) throw new HttpError(404, 'Пользователь не найден');
    return { data: { user: publicUser(user) } };
  });

  // Быстрый демо-вход — без пароля, как в исходном прототипе, но теперь
  // выдаёт настоящий токен для реального демо-аккаунта из базы.
  router.post('/auth/demo-login', ({ body }) => {
    const role = body.role === 'admin' ? 'admin' : 'passenger';
    const email = role === 'admin' ? 'admin@aeroline.demo' : 'passenger@aeroline.demo';
    const user = db.one(db.sql`
      SELECT id, full_name AS "fullName", email, role, doc_number AS "docNumber"
      FROM users WHERE email = ${email}
    `);
    if (!user) throw new HttpError(500, 'Демо-пользователь не найден — выполните db/seed.sql');
    const token = signToken({ userId: user.id, role: user.role, fullName: user.fullName });
    return { data: { token, user: publicUser(user) } };
  });
}

module.exports = { register, publicUser };
