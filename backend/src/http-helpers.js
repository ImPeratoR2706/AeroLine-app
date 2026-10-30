// ============================================================
//  http-helpers.js — минималистичный веб-фреймворк на встроенном
//  модуле node:http (без Express — см. пояснение в package.json).
//  Даёт: роутинг с параметрами (/flights/:id), разбор JSON-тела,
//  раздачу статических файлов собранного фронтенда.
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

class Router {
  constructor() {
    this.routes = []; // { method, segments, handler }
  }

  add(method, routePath, handler) {
    const segments = routePath.split('/').filter(Boolean);
    this.routes.push({ method, segments, handler });
  }

  get(p, h) { this.add('GET', p, h); }
  post(p, h) { this.add('POST', p, h); }
  patch(p, h) { this.add('PATCH', p, h); }
  del(p, h) { this.add('DELETE', p, h); }

  match(method, pathname) {
    const pathSegments = pathname.split('/').filter(Boolean);
    for (const route of this.routes) {
      if (route.method !== method) continue;
      if (route.segments.length !== pathSegments.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < route.segments.length; i++) {
        const seg = route.segments[i];
        if (seg.startsWith(':')) {
          params[seg.slice(1)] = decodeURIComponent(pathSegments[i]);
        } else if (seg !== pathSegments[i]) {
          ok = false;
          break;
        }
      }
      if (ok) return { handler: route.handler, params };
    }
    return null;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) { req.destroy(); reject(new Error('Тело запроса слишком большое')); }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJSON(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function serveStatic(rootDir) {
  return function (req, res, pathname) {
    let rel = pathname === '/' ? '/index.html' : pathname;
    let filePath = path.join(rootDir, rel);
    // защита от выхода за пределы директории статики
    if (!filePath.startsWith(rootDir)) { res.writeHead(403); res.end('Forbidden'); return true; }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      // SPA-фоллбек: отдать index.html для клиентского роутинга по hash (не требуется для #-роутов,
      // но полезно, если когда-нибудь появятся обычные пути)
      filePath = path.join(rootDir, 'index.html');
      if (!fs.existsSync(filePath)) return false;
    }
    const ext = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
    return true;
  };
}

async function createApp({ router, staticDir }) {
  const serve = staticDir ? serveStatic(path.resolve(staticDir)) : null;
  return async function (req, res) {
    const parsed = url.parse(req.url, true);
    const pathname = decodeURIComponent(parsed.pathname);

    if (pathname.startsWith('/api/')) {
      const apiPath = pathname.slice(4) || '/';
      const matched = router.match(req.method, apiPath);
      if (!matched) { sendJSON(res, 404, { error: 'Маршрут не найден' }); return; }
      try {
        let body = {};
        if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
          const raw = await readBody(req);
          if (raw) {
            try { body = JSON.parse(raw); } catch (e) { throw new HttpError(400, 'Некорректный JSON в теле запроса'); }
          }
        }
        const ctx = { req, res, params: matched.params, query: parsed.query, body };
        const result = await matched.handler(ctx);
        if (!res.writableEnded) {
          sendJSON(res, (result && result.status) || 200, (result && result.data !== undefined) ? result.data : result);
        }
      } catch (err) {
        if (err instanceof HttpError) {
          sendJSON(res, err.status, { error: err.message });
        } else {
          console.error(err);
          sendJSON(res, 500, { error: 'Внутренняя ошибка сервера' });
        }
      }
      return;
    }

    if (serve && req.method === 'GET') {
      const handled = serve(req, res, pathname);
      if (handled) return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  };
}

module.exports = { Router, createApp, HttpError, sendJSON };
