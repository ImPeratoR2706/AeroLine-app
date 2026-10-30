'use strict';

const { verifyToken } = require('./crypto-util');
const { HttpError } = require('./http-helpers');

function getTokenFromReq(req) {
  const header = req.headers['authorization'] || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : null;
}

/** Достаёт пользователя из токена, если он есть; не требует авторизации. */
function currentUser(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return payload; // { userId, role, fullName, exp }
}

/** Требует авторизацию любой ролью. */
function requireAuth(ctx) {
  const user = currentUser(ctx.req);
  if (!user) throw new HttpError(401, 'Требуется вход в систему');
  ctx.user = user;
  return user;
}

/** Требует роль администратора. */
function requireAdmin(ctx) {
  const user = requireAuth(ctx);
  if (user.role !== 'admin') throw new HttpError(403, 'Недостаточно прав — требуется роль администратора');
  return user;
}

module.exports = { currentUser, requireAuth, requireAdmin };
