// ============================================================
//  router.ts — простой hash-роутер SPA.
// ============================================================

import { qs } from './utils.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { pageHome } from './pages/home.js';
import { pageFlights } from './pages/flights.js';
import { pageFlight } from './pages/flightDetail.js';
import { pageBooking } from './pages/booking.js';
import { pageProfile } from './pages/profile.js';
import { pageAdmin } from './pages/admin.js';
import { pageLogin } from './pages/login.js';
import { emptyPage } from './pages/shared.js';
import { loadCities } from './cities.js';
import { initReveal, initScrollFade, initTilt, initRouteMapDraw } from './motion.js';
import { ApiError } from './api.js';
import type { Route } from './types.js';

export function parseRoute(): Route {
  const hash = location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('?');
  const path = parts[0];
  const params: Record<string, string> = {};
  if (parts[1]) {
    parts[1].split('&').forEach((kv) => {
      const p = kv.split('=');
      params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
    });
  }
  return { path, params };
}

export async function render(): Promise<void> {
  await loadCities();
  const r = parseRoute();
  renderHeader(r.path.replace(/\/flight\/.+/, '/flights'));
  let html: string;
  try {
    if (r.path === '/') html = await pageHome();
    else if (r.path === '/flights') html = await pageFlights(r.params);
    else if (/^\/flight\//.test(r.path)) html = await pageFlight(r.path.split('/')[2]);
    else if (r.path === '/booking') html = await pageBooking();
    else if (r.path === '/profile') html = await pageProfile();
    else if (r.path === '/admin') html = await pageAdmin();
    else if (r.path === '/login') html = await pageLogin();
    else html = emptyPage('Страница не найдена', 'Проверьте адрес или вернитесь на главную.', '/', 'На главную');
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : 'Не удалось загрузить данные с сервера.';
    html = emptyPage('Ошибка загрузки', msg, '/', 'На главную');
  }
  const app = qs('#app');
  if (app) app.innerHTML = html;
  renderFooter();
  window.scrollTo(0, 0);
  initReveal();
  initScrollFade();
  if (r.path === '/') { initTilt(); initRouteMapDraw(); }
}
