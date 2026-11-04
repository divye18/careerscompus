'use client';

import { useState } from 'react';
import { useMotionValueEvent } from 'framer-motion';
import { useJourney } from '../JourneyContext';
import { PINNED } from '../choreography';

const ITEMS = [
  { id: 'act-hero', label: 'Arrival' },
  { id: 'act-discovery', label: 'Discover' },
] as const;

/**
 * Direction Rail: persistent wayfinding for the journey. Plain anchors, so it works with
 * keyboard, the URL hash and assistive tech; the browser (not JS) performs the scroll.
 */
export function DirectionRail() {
  const { progress } = useJourney();
  const [active, setActive] = useState(0);

  useMotionValueEvent(progress, 'change', (p) => {
    const next = p >= PINNED.sceneStart.discover - 0.08 ? 1 : 0;
    setActive((a) => (a === next ? a : next));
  });

  return (
    <nav aria-label="Journey scenes" className="absolute right-[clamp(14px,2vw,32px)] top-1/2 -translate-y-1/2 z-20">
      <ol className="flex flex-col items-end gap-1">
        {ITEMS.map((it, i) => {
          const on = i === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={on ? 'step' : undefined}
                className="group flex min-h-[44px] items-center gap-3 outline-none"
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-300 ${
                    on
                      ? 'opacity-100 text-[var(--color-royal-deep)]'
                      : 'opacity-0 -translate-x-1 text-[var(--color-royal-deep)]/70 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100'
                  }`}
                >
                  {it.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`block rounded-full border transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-[var(--color-royal-blue)] group-focus-visible:ring-offset-2 ${
                    on
                      ? 'h-3 w-3 border-[var(--color-royal-blue)] bg-[var(--color-royal-blue)]'
                      : 'h-2 w-2 border-[var(--color-royal-deep)]/50 bg-transparent'
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
