'use strict';

const http = require('http');
const path = require('path');
const { Router, createApp } = require('./http-helpers');

const PORT = process.env.PORT || 4000;
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '..', '..', 'frontend', 'dist');

const router = new Router();
require('./routes/auth').register(router);
require('./routes/flights').register(router);
require('./routes/bookings').register(router);
require('./routes/admin').register(router);

createApp({ router, staticDir: STATIC_DIR }).then((handler) => {
  const server = http.createServer(handler);
  server.listen(PORT, () => {
    console.log(`АэроЛайн API + фронтенд запущены: http://localhost:${PORT}`);
    console.log(`Статика раздаётся из: ${STATIC_DIR}`);
  });
});
