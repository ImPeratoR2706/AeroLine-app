// ============================================================
//  types.ts — доменные типы фронтенда (TypeScript).
//  Повторяют форму JSON, которую отдаёт REST API бэкенда.
// ============================================================

export type SeatClass = 'economy' | 'comfort' | 'business';

export type FlightStatus = 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'DEPARTED' | 'ARRIVED';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ARRIVED';

export type UserRole = 'passenger' | 'admin';

export interface City {
  code: string;
  name: string;
}

export interface Flight {
  id: string;
  from: string;
  to: string;
  fromName?: string;
  toName?: string;
  dep: string;
  arr: string;
  aircraft: string;
  aircraftModel?: string;
  status: FlightStatus;
  priceEconomy: number | null;
  priceComfort: number | null;
  priceBusiness: number | null;
  popularity: number;
  trending: boolean;
}

export interface RecommendedFlight {
  flight: Flight;
  reason: string;
}

export interface PopularRoute {
  id: string;
  from: string;
  to: string;
  priceEconomy: number;
  popularity: number;
}

export interface Seat {
  code: string;
  cls: SeatClass;
  occupied: boolean;
}

export interface SeatRow {
  row: number;
  cls: SeatClass;
  leftCount: number;
  seats: Seat[];
}

export interface SeatMapResponse {
  aircraftId: string;
  prices: Record<SeatClass, number | null>;
  rows: SeatRow[];
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  docNumber: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Booking {
  id: number;
  code: string;
  flightId: string;
  seat: string;
  class: SeatClass;
  passengerName?: string;
  docNumber?: string;
  baggage: boolean;
  meal: boolean;
  price: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
  from?: string;
  to?: string;
  fromName?: string;
  toName?: string;
  dep?: string;
  arr?: string;
}

export interface AdminFlightRow {
  id: string;
  fromName: string;
  toName: string;
  dep: string;
  aircraftModel: string;
  status: FlightStatus;
}

export interface AdminBookingRow {
  id: number;
  code: string;
  passenger: string;
  flightId: string;
  seat: string;
  class: SeatClass;
  total: number;
  status: BookingStatus;
  createdAt: string;
}

/** Черновик выбора места — хранится в localStorage на время оформления брони. */
export interface BookingDraft {
  flightId: string;
  seat: string;
  cls: SeatClass;
  price: number;
  step: 'details' | 'payment';
  fullName?: string;
  doc?: string;
  extras?: { baggage: boolean; meal: boolean };
}

export interface Route {
  path: string;
  params: Record<string, string>;
}
