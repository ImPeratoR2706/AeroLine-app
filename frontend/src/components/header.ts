// ============================================================
//  components/header.ts — шапка сайта: логотип, навигация, роль.
// ============================================================

import { STATE } from '../state.js';
import { iconPlane } from '../icons.js';
import { qs } from '../utils.js';

function navLink(href: string, label: string, route: string): string {
  const active = route === href ? ' active' : '';
  return `<a class="${active.trim()}" href="#${href}">${label}</a>`;
}

export function renderHeader(route: string): void {
  const role = STATE.role;
  const badgeClass = role === 'admin' ? 'is-admin' : role === 'passenger' ? 'is-passenger' : '';
  const badgeText = role === 'admin' ? 'Администратор' : role === 'passenger' ? 'Пассажир' : 'Гость';
  let links = '';
  links += navLink('/', 'Главная', route);
  links += navLink('/flights', 'Рейсы', route);
  if (role !== 'guest') links += navLink('/profile', 'Личный кабинет', route);
  if (role === 'admin') links += navLink('/admin', 'Админ-панель', route);
  let right = `<span class="role-badge ${badgeClass}">${badgeText}</span>`;
  if (role === 'guest') right += '<a class="btn btn-primary btn-sm" href="#/login">Войти</a>';
  else right += '<button class="btn btn-ghost btn-sm" data-action="logout">Выйти</button>';
  const header = qs('#site-header');
  if (!header) return;
  header.innerHTML =
    '<div class="wrap nav-row">' +
      `<a class="brand" href="#/"><span class="logo-mark">${iconPlane()}</span>АэроЛайн</a>` +
      `<nav class="nav-links">${links}</nav>` +
      `<div class="nav-right">${right}</div>` +
    '</div>';
}
