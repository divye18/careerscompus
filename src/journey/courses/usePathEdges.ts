import { useEffect, useRef, type RefObject } from 'react';
import type { Sel } from './pathwayState';

/**
 * Draws the pathway's connecting lines (selected station → the stations it can lead to) into an SVG overlay.
 * The lines are measured from the real station dots, so they stay correct at any width. This is imperative DOM
 * work in an effect (no React state): it runs when the selection changes or the chart resizes, never per frame.
 *
 *  - solid champagne line  = the route the student has chosen
 *  - thin dashed line      = other possible routes from the selected station
 * New solid lines draw in (stroke-dashoffset); reduced motion draws them instantly.
 */
const NS = 'http://www.w3.org/2000/svg';

export function usePathEdges(wrap: RefObject<HTMLElement | null>, svg: RefObject<SVGSVGElement | null>, sel: Sel, reduced: boolean) {
  const seen = useRef(new Set<string>());
  const key = `${sel.level}|${sel.domain}|${sel.course}|${sel.spec}|${sel.career}`;

  useEffect(() => {
    const w = wrap.current;
    const s = svg.current;
    if (!w || !s) return;
    const drawn = seen.current;

    const draw = (animate: boolean) => {
      const box = w.getBoundingClientRect();
      s.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      s.replaceChildren();
      if (getComputedStyle(s).display === 'none') return; // stacked (mobile) layout draws no overlay
      const dot = (stage: number, id: string) => w.querySelector<HTMLElement>(`[data-dot="${stage}:${id}"]`);
      const centre = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top] as const;
      };
      const parents: [number, string | null, string | null][] = [
        [1, sel.level, sel.course],
        [2, sel.course, sel.spec],
        [3, sel.spec, sel.career],
      ];
      for (const [stage, parentId, chosenChild] of parents) {
        if (!parentId) continue;
        const from = dot(stage, parentId);
        if (!from) continue;
        const [, y1] = centre(from);
        const lab = w.querySelector<HTMLElement>(`[data-label="${stage}:${parentId}"]`);
        // leave from just after the station's label so the route never strikes through its own text
        const x1 = lab ? lab.getBoundingClientRect().right - box.left + 10 : centre(from)[0];
        w.querySelectorAll<HTMLElement>(`[data-dot^="${stage + 1}:"]`).forEach((childDot) => {
          const id = childDot.dataset.dot!.slice(2);
          const chosen = id === chosenChild;
          const [x2, y2] = centre(childDot);
          const xm = (x1 + x2) / 2;
          const p = document.createElementNS(NS, 'path');
          p.setAttribute('d', `M${x1} ${y1} C${xm} ${y1}, ${xm} ${y2}, ${x2} ${y2}`);
          p.setAttribute('fill', 'none');
          p.style.stroke = 'var(--color-champagne)';
          p.setAttribute('stroke-linecap', 'round');
          p.setAttribute('stroke-width', chosen ? '1.8' : '1');
          if (!chosen) {
            p.setAttribute('stroke-dasharray', '3 5');
            p.style.opacity = '0.4';
          }
          s.appendChild(p);
          const k = `${stage}:${parentId}>${id}`;
          if (animate && !reduced && !drawn.has(k)) {
            if (chosen) {
              const len = p.getTotalLength();
              p.style.strokeDasharray = `${len}`;
              p.style.strokeDashoffset = `${len}`;
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  p.style.transition = 'stroke-dashoffset 650ms cubic-bezier(0.22,1,0.36,1)';
                  p.style.strokeDashoffset = '0';
                })
              );
            } else {
              const final = p.style.opacity;
              p.style.opacity = '0';
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  p.style.transition = 'opacity 500ms ease-out';
                  p.style.opacity = final;
                })
              );
            }
          }
          drawn.add(k);
        });
      }
    };

    // wait one frame so the freshly rendered stations have their final positions
    const raf = requestAnimationFrame(() => draw(true));
    const ro = new ResizeObserver(() => draw(false));
    ro.observe(w);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // `key` summarises the whole selection; wrap/svg are stable refs
  }, [key, reduced, wrap, svg, sel, seen]);
}
