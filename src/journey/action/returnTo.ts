import { goTo } from '../scroll';

/** Go back to an earlier part of the page and move keyboard focus there, so nobody is left behind at the old position. */
export function returnTo(id: string) {
  goTo(id);
  const el = document.getElementById(id);
  if (!el) return;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.style.outline = 'none';
  el.focus({ preventScroll: true });
}
