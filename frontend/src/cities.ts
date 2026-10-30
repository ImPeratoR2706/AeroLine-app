// ============================================================
//  cities.ts — кэш справочника городов (коды ИАТА → названия).
//  Нужен для рейсов/направлений, которые бэкенд отдаёт без имён
//  городов (рекомендации, популярные маршруты).
// ============================================================

import { api } from './api.js';

let cache: Record<string, string> | null = null;
let loading: Promise<Record<string, string>> | null = null;

export async function loadCities(): Promise<Record<string, string>> {
  if (cache) return cache;
  if (!loading) {
    loading = api.cities().then((list) => {
      cache = {};
      for (const c of list) cache[c.code] = c.name;
      return cache;
    });
  }
  return loading;
}

/** Синхронный доступ после того как loadCities() хотя бы раз был вызван. */
export function cityName(code: string): string {
  return (cache && cache[code]) || code;
}

/** Список <option> для <select> с городами (нужен loadCities() заранее). */
export function cityOptionsHtml(selected?: string): string {
  if (!cache) return '';
  return Object.keys(cache)
    .map((code) => `<option value="${code}"${code === selected ? ' selected' : ''}>${cache![code]}</option>`)
    .join('');
}
