'use client';

import { useRef, useState } from 'react';
import { useMotionValue, useScroll } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import { ArrivalCopy } from './layers/ArrivalCopy';
import { CompassSVG } from './CompassSVG';
import { DomainGlyph } from './DomainGlyph';
import { ExploreFlow } from './explore/ExploreFlow';
import { goTo } from './scroll';

/**
 * Natural-scroll presenter for everything that is not "full": phones and tablets, reduced
 * motion, no WebGL, low-power devices, and the server render. No pinning. The compass is SVG.
 * The needle fan is scrubbed by the section's own scroll position (static when motion is reduced).
 * Grounds follow Nocturne Atlas: Midnight (Arrival) → Deep Aubergine (Discover).
 */
export function FlowJourney({ reducedMotion, reason }: { reducedMotion: boolean; reason?: string }) {
  const zero = useMotionValue(0);
  const one = useMotionValue(1);
  const discoverRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: discoverRef, offset: ['start 0.92', 'center 0.55'] });
  const m = reducedMotion ? one : scrollYProgress;

  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const shown = hovered ?? selected;

  return (
    <div data-journey="flow" data-journey-reason={reason}>
      {/* ---------------- Scene 1: Arrival ---------------- */}
      <section
        id="act-hero"
        aria-label="Introduction"
        data-header-theme="night"
        className="relative overflow-hidden bg-ink-950 pt-24 pb-12 lg:pt-16 lg:pb-0 lg:min-h-dvh lg:flex lg:items-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_78%_62%,rgb(201_169_110/0.14)_0%,rgb(201_169_110/0)_70%)] max-lg:bg-[radial-gradient(90%_40%_at_50%_86%,rgb(201_169_110/0.14)_0%,rgb(201_169_110/0)_70%)]"
        />
        <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-[clamp(24px,5vw,80px)] lg:grid lg:grid-cols-12 lg:items-center lg:gap-6">
          <div className="lg:col-span-7">
            <ArrivalCopy />
          </div>
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <CompassSVG
              m={zero}
              sway={!reducedMotion}
              className="mx-auto block w-[min(74vw,340px)] sm:w-[min(60vw,400px)] lg:w-full lg:max-w-[480px]"
            />
          </div>
        </div>
      </section>

      {/* ---------------- Scene 2: Discover ---------------- */}
      <section
        ref={discoverRef}
        id="act-discovery"
        aria-label="Career directions"
        data-header-theme="night"
        className="relative scroll-mt-16 py-16 sm:py-24 bg-aubergine bg-[radial-gradient(85%_55%_at_50%_42%,var(--color-aubergine-glow)_0%,var(--color-aubergine)_55%,var(--color-aubergine)_62%,var(--handoff-top)_100%),linear-gradient(to_bottom,var(--color-ink-950),var(--color-aubergine)_14%)]"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="text-center lg:text-left">
            <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-champagne">
              02 <span className="mx-2 text-silver/60">—</span> Discover
            </p>
            <h2 className="mt-3 font-atlas font-normal leading-[0.98] tracking-[-0.01em] text-ivory text-[clamp(44px,11vw,72px)]">
              Pick a <span className="italic text-champagne">direction.</span>
            </h2>
            <p className="mt-3 text-base text-silver">Seven directions to begin with.</p>
          </div>

          <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
            <CompassSVG
              m={m}
              active={shown}
              selected={selected}
              sway={false}
              className="mx-auto block w-[min(92vw,440px)] lg:w-full lg:max-w-[520px]"
            />

            <div className="mt-6 lg:mt-0">
              <ul className="grid grid-cols-2 gap-2.5">
                {DOMAINS.map((d, i) => {
                  const isSel = selected === i;
                  return (
                    <li key={d.id} className={i === DOMAINS.length - 1 ? 'col-span-2 sm:col-span-1' : undefined}>
                      <button
                        type="button"
                        aria-pressed={isSel}
                        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(i)}
                        onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(null)}
                        onFocus={() => setHovered(i)}
                        onBlur={() => setHovered(null)}
                        onClick={() => setSelected((s) => (s === i ? null : i))}
                        className={`flex min-h-[52px] w-full items-center gap-3 rounded-md border bg-ink-900 px-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-cyan ${
                          isSel ? 'border-cyan' : shown === i ? 'border-ivory/40' : 'border-ivory/12'
                        }`}
                      >
                        <span style={{ color: d.hue }}>
                          <DomainGlyph id={d.id} size={22} />
                        </span>
                        <span className="font-atlas text-[21px] leading-none text-ivory">{d.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 min-h-[104px]" aria-live="polite">
                {shown !== null ? (
                  <>
                    <p className="font-atlas text-[28px] leading-none" style={{ color: DOMAINS[shown].hue }}>
                      {DOMAINS[shown].name}
                    </p>
                    <p className="mt-2 text-[15px] leading-snug text-ivory/85">{DOMAINS[shown].blurb}</p>
                    <button
                      type="button"
                      onClick={() => goTo(`explore-${DOMAINS[shown].id}`)}
                      className="mt-3 inline-flex min-h-[44px] items-center rounded-lg border border-ivory/30 px-4 text-sm font-semibold text-ivory transition-colors hover:border-ivory/60 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-cyan"
                    >
                      Step inside {DOMAINS[shown].name} →
                    </button>
                  </>
                ) : (
                  <p className="text-[13px] leading-snug text-silver">Select a direction to read a short description.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Scene 3: Explore ---------------- */}
      <ExploreFlow />
    </div>
  );
}
