// ============================================================
//  api.ts — типизированный клиент REST API бэкенда.
// ============================================================
const TOKEN_KEY = 'aeroline_token_v1';
export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    }
    catch {
        return null;
    }
}
export function setToken(token) {
    try {
        if (token)
            localStorage.setItem(TOKEN_KEY, token);
        else
            localStorage.removeItem(TOKEN_KEY);
    }
    catch { /* localStorage недоступен — продолжаем без сохранения */ }
}
export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token)
        headers['Authorization'] = `Bearer ${token}`;
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
    return data;
}
export const api = {
    // ---- справочники ----
    cities: () => request('GET', '/cities'),
    // ---- рейсы ----
    flights: (params) => {
        const qs = params ? new URLSearchParams(Object.entries(params).filter(([, v]) => !!v)).toString() : '';
        return request('GET', '/flights' + (qs ? '?' + qs : ''));
    },
    flight: (id) => request('GET', `/flights/${encodeURIComponent(id)}`),
    seats: (id) => request('GET', `/flights/${encodeURIComponent(id)}/seats`),
    recommendations: () => request('GET', '/recommendations'),
    popularRoutes: (limit = 5) => request('GET', `/routes/popular?limit=${limit}`),
    // ---- авторизация ----
    register: (data) => request('POST', '/auth/register', data),
    login: (data) => request('POST', '/auth/login', data),
    demoLogin: (role) => request('POST', '/auth/demo-login', { role }),
    me: () => request('GET', '/auth/me'),
    // ---- бронирования ----
    myBookings: () => request('GET', '/bookings/mine'),
    createBooking: (data) => request('POST', '/bookings', data),
    payBooking: (id) => request('POST', `/bookings/${id}/pay`),
    cancelBooking: (id) => request('POST', `/bookings/${id}/cancel`),
    // ---- админ-панель ----
    adminFlights: () => request('GET', '/admin/flights'),
    adminBookings: () => request('GET', '/admin/bookings'),
    setFlightStatus: (id, status) => request('PATCH', `/admin/flights/${encodeURIComponent(id)}/status`, { status }),
};
//# sourceMappingURL=api.js.map