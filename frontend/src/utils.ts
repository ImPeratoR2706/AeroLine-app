// ============================================================
//  utils.ts — общие утилиты форматирования и работы с DOM.
// ============================================================

import type { BookingStatus, FlightStatus, SeatClass } from './types.js';

export function esc(s: unknown): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function money(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('ru-RU') + ' ₸';
}

const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd} ${MONTHS[d.getMonth()]}, ${WEEKDAYS[d.getDay()]} · ${hh}:${mm}`;
}

export function fmtTime(iso: string): string {
  const d = new Date(iso);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export function fmtDuration(dep: string, arr: string): string {
  const mins = Math.round((new Date(arr).getTime() - new Date(dep).getTime()) / 60000);
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${h} ч` + (m ? ` ${m} мин` : '');
}

export function qs<T extends Element = Element>(sel: string, root?: ParentNode): T | null {
  return (root || document).querySelector<T>(sel);
}
export function qsa<T extends Element = Element>(sel: string, root?: ParentNode): T[] {
  return Array.prototype.slice.call((root || document).querySelectorAll(sel));
}

export const STATUS_LABEL: Record<FlightStatus | BookingStatus, string> = {
  SCHEDULED: 'По расписанию', DELAYED: 'Задержан', CANCELLED: 'Отменён',
  DEPARTED: 'Вылетел', ARRIVED: 'Прибыл', CONFIRMED: 'Подтверждено', PENDING: 'Ожидает оплаты',
};

export const STATUS_CLASS: Record<FlightStatus | BookingStatus, string> = {
  SCHEDULED: 'badge-good', DELAYED: 'badge-warn', CANCELLED: 'badge-danger',
  DEPARTED: 'badge-neutral', ARRIVED: 'badge-neutral', CONFIRMED: 'badge-good', PENDING: 'badge-warn',
};

export const CLASS_LABEL: Record<SeatClass, string> = {
  economy: 'Эконом', comfort: 'Комфорт', business: 'Бизнес',
};

export const EXTRA_PRICE = { baggage: 8000, meal: 3500 };
