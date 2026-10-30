// ============================================================
//  pages/shared.ts — общий шаблон пустого состояния страницы.
// ============================================================

import { iconPlane } from '../icons.js';
import { esc } from '../utils.js';

export function emptyPage(title: string, text: string, href: string, label: string): string {
  return '<section class="section"><div class="card empty" data-reveal>' +
    `<div class="icon">${iconPlane()}</div><h2>${esc(title)}</h2><p>${esc(text)}</p>` +
    `<a class="btn btn-primary" href="#${href}">${esc(label)}</a></div></section>`;
}
