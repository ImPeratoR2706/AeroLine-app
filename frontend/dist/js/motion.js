// ============================================================
//  motion.ts — лёгкие анимации интерфейса: появление при скролле,
//  тени прокрутки у таблиц/схемы салона, наклон hero-иллюстрации
//  под курсором, отрисовка линий карты маршрутов.
// ============================================================
import { qs, qsa } from './utils.js';
export function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}
export function initReveal() {
    const els = qsa('[data-reveal]');
    if (!els.length)
        return;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
        els.forEach((el) => el.classList.add('is-in'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    els.forEach((el, i) => {
        el.style.transitionDelay = Math.min(i * 55, 320) + 'ms';
        io.observe(el);
    });
}
export function initScrollFade() {
    const els = qsa('.seatmap-scroll, .table-scroll');
    els.forEach((el) => {
        function update() {
            const atStart = el.scrollLeft <= 2;
            const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
            el.classList.toggle('can-scroll-left', !atStart && el.scrollWidth > el.clientWidth + 2);
            el.classList.toggle('can-scroll-right', !atEnd && el.scrollWidth > el.clientWidth + 2);
        }
        update();
        el.addEventListener('scroll', update, { passive: true });
        el._scrollFadeUpdate = update;
    });
}
export function initTilt() {
    const el = qs('.hero-sky');
    if (!el || prefersReducedMotion() || !window.matchMedia('(pointer:fine)').matches)
        return;
    el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(py * -6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
}
export function initRouteMapDraw() {
    const paths = qsa('.rm-path');
    if (!paths.length)
        return;
    const reduced = prefersReducedMotion();
    paths.forEach((p) => {
        const len = p.getTotalLength ? p.getTotalLength() : 400;
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = reduced ? '0' : String(len);
    });
    if (reduced)
        return;
    const wrap = qs('.route-map-wrap');
    if (!wrap || !('IntersectionObserver' in window))
        return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                paths.forEach((p, i) => {
                    p.style.transitionDelay = i * 160 + 'ms';
                    p.style.strokeDashoffset = '0';
                });
                io.unobserve(wrap);
            }
        });
    }, { threshold: 0.2 });
    io.observe(wrap);
}
let resizeFadeTimer;
export function initResizeFadeRefresh() {
    window.addEventListener('resize', () => {
        clearTimeout(resizeFadeTimer);
        resizeFadeTimer = setTimeout(() => {
            qsa('.seatmap-scroll, .table-scroll').forEach((el) => {
                if (el._scrollFadeUpdate)
                    el._scrollFadeUpdate();
            });
        }, 120);
    });
}
//# sourceMappingURL=motion.js.map