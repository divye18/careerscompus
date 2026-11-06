'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DOMAINS } from '@/content/domains';
import { ENVS } from './registry';
import { RoomDetail, RoomHead } from './ContentBlocks';

/**
 * Scene 3 for phones, tablets, reduced motion, no WebGL and low-power devices.
 *
 * Not a pinned animation: a native horizontal swipe track (CSS scroll-snap, no scroll hijacking),
 * one world per panel. Each panel keeps its distinct artwork + backdrop but renders it static (no
 * CSS animation, no parallax) and off-screen panels are skipped via content-visibility, so seven
 * environments are never painted at once. Dots are 44 px targets.
 */
const hueStyle = (hue: string) => ({ '--hue': hue }) as CSSProperties;

export function ExploreFlow() {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  // which panel is centred (state changes only when it changes)
  useEffect(() => {
    const root = track.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const i = Number((e.target as HTMLElement).dataset.index);
            setCurrent((c) => (c === i ? c : i));
          }
        }
      },
      { root, threshold: [0.6, 0.8] }
    );
    root.querySelectorAll('[data-index]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const jump = (i: number) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById(`explore-${DOMAINS[i].id}`)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  };

  return (
    <section
      id="act-explore"
      aria-label="Explore career domains"
      data-header-theme="night"
      className="relative scroll-mt-16 bg-[linear-gradient(to_bottom,var(--color-ink-950)_88%,var(--handoff-top))] py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-champagne">
          03 <span className="mx-2 text-silver/60">—</span> Explore
        </p>
        <h2 className="mt-3 font-atlas font-normal leading-[0.98] tracking-[-0.01em] text-ivory text-[clamp(40px,10vw,64px)]">
          Every direction opens <span className="italic text-champagne">a different world.</span>
        </h2>
        <p className="mt-3 max-w-xl text-base text-silver">Swipe through seven worlds. Each one is a short introduction, not a full guide.</p>
      </div>

      <div
        ref={track}
        role="region"
        aria-label="Career domains — swipe or use the arrow keys"
        tabIndex={0}
        className="hide-scrollbar mt-8 flex snap-x snap-proximity gap-4 overflow-x-auto px-5 pb-4 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-cyan sm:px-8"
      >
        {DOMAINS.map((d, i) => {
          const spec = ENVS[d.id];
          const { Backdrop, Art } = spec;
          return (
            <article
              key={d.id}
              id={`explore-${d.id}`}
              data-index={i}
              aria-label={d.longName}
              style={{ ...hueStyle(d.hue), containIntrinsicSize: '420px 1100px' }}
              className="relative scroll-mt-20 w-[min(86vw,420px)] shrink-0 snap-center overflow-hidden rounded-atlas-sm border border-ivory/12 bg-[color-mix(in_srgb,var(--hue)_9%,var(--color-ink-950))] [content-visibility:auto] sm:w-[min(520px,70vw)]"
            >
              {/* artwork stage */}
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: spec.ratio === '1400 / 440' ? '10 / 6' : spec.ratio }}>
                <Backdrop />
                <div className="absolute inset-0 p-3">
                  <Art />
                </div>
              </div>
              <div className="px-5 pb-6 pt-5">
                <RoomHead d={d} index={i} />
                <div className="mt-6 border-t border-ivory/10 pt-5">
                  <RoomDetail d={d} />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <nav aria-label="Choose a career domain" className="mx-auto mt-2 flex max-w-6xl flex-wrap justify-center gap-1 px-5">
        {DOMAINS.map((d, i) => (
          <button
            key={d.id}
            type="button"
            aria-label={d.name}
            aria-current={current === i ? 'true' : undefined}
            onClick={() => jump(i)}
            className="group flex h-11 w-11 items-center justify-center rounded-atlas-sm outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-cyan"
          >
            <span
              aria-hidden="true"
              className={`block rounded-full border transition-all ${current === i ? 'h-3 w-3 border-cyan bg-cyan' : 'h-2.5 w-2.5 bg-transparent'}`}
              style={current === i ? undefined : { borderColor: d.hue }}
            />
          </button>
        ))}
      </nav>
    </section>
  );
}
