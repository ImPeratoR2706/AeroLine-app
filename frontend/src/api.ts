// ============================================================
//  api.ts — типизированный клиент REST API бэкенда.
// ============================================================

import type {
  AdminBookingRow, AdminFlightRow, AuthResponse, Booking, City,
  Flight, PopularRoute, RecommendedFlight, SeatMapResponse, SeatClass,
} from './types.js';

const TOKEN_KEY = 'aeroline_token_v1';

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* localStorage недоступен — продолжаем без сохранения */ }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(res.status, (data && data.error) || 'Ошибка запроса к серверу');
  }
  return data as T;
}

export const api = {
  // ---- справочники ----
  cities: () => request<City[]>('GET', '/cities'),

  // ---- рейсы ----
  flights: (params?: { from?: string; to?: string }) => {
    const qs = params ? new URLSearchParams(Object.entries(params).filter(([, v]) => !!v) as [string, string][]).toString() : '';
    return request<Flight[]>('GET', '/flights' + (qs ? '?' + qs : ''));
  },
  flight: (id: string) => request<Flight>('GET', `/flights/${encodeURIComponent(id)}`),
  seats: (id: string) => request<SeatMapResponse>('GET', `/flights/${encodeURIComponent(id)}/seats`),
  recommendations: () => request<RecommendedFlight[]>('GET', '/recommendations'),
  popularRoutes: (limit = 5) => request<PopularRoute[]>('GET', `/routes/popular?limit=${limit}`),

  // ---- авторизация ----
  register: (data: { fullName: string; email: string; password: string; docNumber?: string }) =>
    request<AuthResponse>('POST', '/auth/register', data),
  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('POST', '/auth/login', data),
  demoLogin: (role: 'passenger' | 'admin') =>
    request<AuthResponse>('POST', '/auth/demo-login', { role }),
  me: () => request<{ user: AuthResponse['user'] }>('GET', '/auth/me'),

  // ---- бронирования ----
  myBookings: () => request<Booking[]>('GET', '/bookings/mine'),
  createBooking: (data: {
    flightId: string; seat: string; cls: SeatClass;
    passengerName: string; docNumber: string; baggage: boolean; meal: boolean;
  }) => request<Booking>('POST', '/bookings', data),
  payBooking: (id: number) => request<{ id: number; code: string; status: string }>('POST', `/bookings/${id}/pay`),
  cancelBooking: (id: number) => request<{ id: number; code: string; status: string }>('POST', `/bookings/${id}/cancel`),

  // ---- админ-панель ----
  adminFlights: () => request<AdminFlightRow[]>('GET', '/admin/flights'),
  adminBookings: () => request<AdminBookingRow[]>('GET', '/admin/bookings'),
  setFlightStatus: (id: string, status: string) =>
    request<{ id: string; status: string }>('PATCH', `/admin/flights/${encodeURIComponent(id)}/status`, { status }),
};
