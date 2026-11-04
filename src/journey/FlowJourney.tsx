'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useScroll } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import { ArrivalCopy } from './layers/ArrivalCopy';
import { CompassSVG } from './CompassSVG';
import { DomainGlyph } from './DomainGlyph';

/**
 * Natural-scroll presenter for everything that is not "full": phones and tablets, reduced
 * motion, no WebGL, low-power devices, and the server render. No pinning. The compass is SVG.
 * The needle fan is scrubbed by the section's own scroll position (static when motion is reduced).
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
        className="relative overflow-hidden bg-[var(--color-bg-paper)] pt-24 pb-12 lg:pt-16 lg:pb-0 lg:min-h-dvh lg:flex lg:items-center"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 78% 60%, rgba(255,247,226,0.95) 0%, rgba(255,247,226,0) 70%)',
          }}
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
        className="relative scroll-mt-16 bg-[var(--color-bg-mist)] py-16 sm:py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="text-center lg:text-left">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-royal-blue)]">
              02 <span className="mx-2 text-[var(--color-royal-deep)]/40">—</span> Discover
            </p>
            <h2 className="mt-3 font-atlas font-normal leading-[0.98] tracking-[-0.01em] text-[var(--color-accent-midnight)] text-[clamp(44px,11vw,72px)]">
              Pick a <span className="italic text-[var(--color-royal-blue)]">direction.</span>
            </h2>
            <p className="mt-3 text-base text-[var(--color-royal-deep)]/75">Seven directions to begin with.</p>
          </div>

          <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
            <CompassSVG
              m={m}
              active={shown}
              sway={false}
              className="mx-auto block w-[min(92vw,440px)] lg:w-full lg:max-w-[520px]"
            />

            <div className="mt-6 lg:mt-0">
              <ul className="grid grid-cols-2 gap-2.5">
                {DOMAINS.map((d, i) => {
                  const on = shown === i;
                  return (
                    <li key={d.id} className={i === DOMAINS.length - 1 ? 'col-span-2 sm:col-span-1' : undefined}>
                      <button
                        type="button"
                        aria-pressed={selected === i}
                        onPointerEnter={() => setHovered(i)}
                        onPointerLeave={() => setHovered(null)}
                        onFocus={() => setHovered(i)}
                        onBlur={() => setHovered(null)}
                        onClick={() => setSelected((s) => (s === i ? null : i))}
                        className="flex min-h-[52px] w-full items-center gap-3 rounded-md border bg-white/75 px-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{
                          borderColor: on ? d.hue : 'rgba(30,42,120,0.18)',
                          outlineColor: d.hue,
                        }}
                      >
                        <span style={{ color: d.hue }}>
                          <DomainGlyph id={d.id} size={22} />
                        </span>
                        <span className="font-atlas text-[21px] leading-none text-[var(--color-accent-midnight)]">
                          {d.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <motion.div className="mt-5 min-h-[104px]" aria-live="polite">
                {shown !== null ? (
                  <>
                    <p className="font-atlas text-[28px] leading-none" style={{ color: DOMAINS[shown].hue }}>
                      {DOMAINS[shown].name}
                    </p>
                    <p className="mt-2 text-[15px] leading-snug text-[var(--color-royal-deep)]/85">
                      {DOMAINS[shown].blurb}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--color-royal-deep)]/55">
                      Full pages for each direction are coming soon
                    </p>
                  </>
                ) : (
                  <p className="text-[13px] leading-snug text-[var(--color-royal-deep)]/70">
                    Select a direction to read a short description.
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
