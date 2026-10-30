// ============================================================
//  components/footer.ts — подвал сайта.
// ============================================================
import { qs } from '../utils.js';
export function renderFooter() {
    const footer = qs('#site-footer');
    if (!footer)
        return;
    footer.innerHTML =
        '<div class="wrap">' +
            '<div class="footer-row">' +
            '<span>© 2026 АэроЛайн</span>' +
            '<span>Support@AeroLine.com</span>' +
            '</div>' +
            '<p class="disclaimer">Цены указаны в тенге и могут меняться в зависимости от тарифа и наличия мест на рейсе. Оформляя бронирование, вы соглашаетесь с условиями перевозки и политикой обработки персональных данных.</p>' +
            '</div>';
}
//# sourceMappingURL=footer.js.map