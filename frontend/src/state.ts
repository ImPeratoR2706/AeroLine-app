// ============================================================
//  state.ts — состояние приложения на клиенте.
//  Пользователь и токен приходят с бэкенда; локально хранится
//  только черновик выбора места на время оформления брони.
// ============================================================

import type { BookingDraft, User } from './types.js';
import { getToken, setToken } from './api.js';

const DRAFT_KEY = 'aeroline_draft_v1';

class AppState {
  user: User | null = null;
  draft: BookingDraft | null = this.loadDraft();

  get isAuthenticated(): boolean {
    return !!this.user;
  }

  get role(): 'guest' | 'passenger' | 'admin' {
    if (!this.user) return 'guest';
    return this.user.role;
  }

  private loadDraft(): BookingDraft | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? (JSON.parse(raw) as BookingDraft) : null;
    } catch { return null; }
  }

  saveDraft(draft: BookingDraft | null): void {
    this.draft = draft;
    try {
      if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      else localStorage.removeItem(DRAFT_KEY);
    } catch { /* ignore */ }
  }

  logout(): void {
    this.user = null;
    setToken(null);
    this.saveDraft(null);
  }

  hasToken(): boolean {
    return !!getToken();
  }
}

export const STATE = new AppState();
