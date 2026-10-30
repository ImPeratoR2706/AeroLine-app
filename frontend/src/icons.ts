// ============================================================
//  icons.ts — SVG-иконки интерфейса.
// ============================================================

export const PLANE_D =
  'M12 2 L14 9 L21 13 L21 15 L14 12.5 L14 17 L17 19 L17 21 L12 20 L7 21 L7 19 L10 17 L10 12.5 L3 15 L3 13 L10 9 Z';

export function iconPlane(cls?: string): string {
  return `<svg class="icon-plane${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${PLANE_D}"/></svg>`;
}
