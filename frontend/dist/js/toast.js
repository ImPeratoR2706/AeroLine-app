// ============================================================
//  toast.ts — всплывающие уведомления и модальные окна.
// ============================================================
import { qs } from './utils.js';
import { esc } from './utils.js';
export function toast(msg) {
    const root = qs('#toast-root');
    if (!root)
        return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => { el.remove(); }, 2600);
}
export function closeModal() {
    const root = qs('#modal-root');
    if (root)
        root.innerHTML = '';
}
export function openModal(html) {
    const root = qs('#modal-root');
    if (root)
        root.innerHTML = `<div class="modal-overlay" data-close-modal><div class="modal-box">${html}</div></div>`;
}
export function confirmAction(message, actionAttr) {
    openModal(`<h3>Подтвердите действие</h3><p>${esc(message)}</p>` +
        '<div class="row" style="justify-content:flex-end">' +
        '<button class="btn btn-ghost btn-sm" data-close-modal>Отмена</button>' +
        `<button class="btn btn-danger btn-sm" ${actionAttr}>Подтвердить</button>` +
        '</div>');
}
//# sourceMappingURL=toast.js.map