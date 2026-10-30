// ============================================================
//  state.ts — состояние приложения на клиенте.
//  Пользователь и токен приходят с бэкенда; локально хранится
//  только черновик выбора места на время оформления брони.
// ============================================================
import { getToken, setToken } from './api.js';
const DRAFT_KEY = 'aeroline_draft_v1';
class AppState {
    constructor() {
        this.user = null;
        this.draft = this.loadDraft();
    }
    get isAuthenticated() {
        return !!this.user;
    }
    get role() {
        if (!this.user)
            return 'guest';
        return this.user.role;
    }
    loadDraft() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            return raw ? JSON.parse(raw) : null;
        }
        catch {
            return null;
        }
    }
    saveDraft(draft) {
        this.draft = draft;
        try {
            if (draft)
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            else
                localStorage.removeItem(DRAFT_KEY);
        }
        catch { /* ignore */ }
    }
    logout() {
        this.user = null;
        setToken(null);
        this.saveDraft(null);
    }
    hasToken() {
        return !!getToken();
    }
}
export const STATE = new AppState();
//# sourceMappingURL=state.js.map