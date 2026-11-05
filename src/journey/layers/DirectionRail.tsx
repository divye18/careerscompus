'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { useMotionValueEvent } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import { useJourney } from '../JourneyContext';
import { PINNED, activeDomain } from '../choreography';

const SCENES = [
  { id: 'act-hero', label: 'Arrival' },
  { id: 'act-discovery', label: 'Discover' },
] as const;

export const RAIL_ITEMS = [
  ...SCENES.map((s) => ({ ...s, hue: null as string | null })),
  ...DOMAINS.map((d) => ({ id: `explore-${d.id}`, label: d.name, hue: d.hue as string | null })),
  { id: 'act-courses', label: 'Courses', hue: null as string | null },
  { id: 'act-universities', label: 'Universities', hue: null as string | null },
  { id: 'act-comparison', label: 'Compare', hue: null as string | null },
];
const ITEMS = RAIL_ITEMS;
/** Index of the Courses stop (Scene 4). */
export const RAIL_COURSES_INDEX = ITEMS.length - 3;
/** Index of the Universities stop (Scene 5). */
export const RAIL_UNIVERSITIES_INDEX = ITEMS.length - 2;
/** Index of the Compare stop (Scene 6). */
export const RAIL_COMPARE_INDEX = ITEMS.length - 1;

/**
 * Direction Rail: persistent wayfinding for the journey — two scene stops, then one stop per domain room.
 * Plain anchors (keyboard, URL hash, assistive tech); the browser performs the scroll. Arrow keys move
 * focus along the rail. State changes only when the current stop changes.
 */
export function DirectionRail() {
  const { progress } = useJourney();
  const [active, setActive] = useState(0);

  useMotionValueEvent(progress, 'change', (p) => {
    const room = activeDomain(p);
    const next = room >= 0 ? SCENES.length + room : p >= PINNED.sceneStart.discover - 0.05 ? 1 : 0;
    setActive((a) => (a === next ? a : next));
  });

  return <RailNav active={active} className="absolute right-[clamp(10px,1.6vw,26px)] top-1/2 z-20 -translate-y-1/2" />;
}

/** The rail itself (shared by the pinned stage and Scene 4). Plain anchors; arrow keys move focus. */
export function RailNav({ active, className }: { active: number; className: string }) {
  const nav = useRef<HTMLElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const links = [...(nav.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])];
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    e.preventDefault();
    links[(i + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length]?.focus();
  };

  return (
    <nav
      ref={nav}
      aria-label="Journey scenes and career domains"
      onKeyDown={onKeyDown}
      className={className}
    >
      <ol className="flex flex-col items-end">
        {ITEMS.map((it, i) => {
          const on = i === active;
          const gap = i === SCENES.length ? 'mt-2 border-t border-ivory/15 pt-1' : '';
          return (
            <li key={it.id} className={gap}>
              <a
                href={`#${it.id}`}
                aria-current={on ? 'step' : undefined}
                className="group flex min-h-[40px] items-center gap-3 outline-none"
              >
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.18em] transition-[opacity,transform] duration-300 ${
                    on
                      ? 'opacity-100 text-ivory'
                      : 'opacity-0 -translate-x-1 text-silver group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100'
                  }`}
                >
                  {it.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`block h-2.5 w-2.5 rounded-full border transition-[transform,background-color,border-color] duration-300 group-focus-visible:ring-2 group-focus-visible:ring-cyan group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-ink-950 ${
                    on ? 'scale-100 border-cyan bg-cyan' : 'scale-[0.8] border-silver/60 bg-transparent'
                  }`}
                  style={!on && it.hue ? { borderColor: it.hue } : undefined}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
