'use client';

import type { ReactNode } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { HeroSearch } from '@/components/home/HeroSearch';
import { clamp01 } from '../choreography';
import { goTo } from '../scroll';

/**
 * Scene 1 copy (Nocturne Atlas, night ground). Shared by both presenters so the first screen is
 * the same server-rendered HTML either way (LCP-friendly; no layout jump on hydration).
 *
 * `exit` (pinned presenter only) is the 0→1 scroll progress of the copy leaving the stage;
 * each block leaves with a slight stagger. Without it the copy is static.
 * Perf: blocks are promoted (will-change) so the exit is composite-only, not a text repaint.
 */
function Out({ exit, i, children, className }: { exit?: MotionValue<number>; i: number; children: ReactNode; className?: string }) {
  const zero = useMotionValue(0);
  const src = exit ?? zero;
  const local = useTransform(src, (v) => clamp01((v - i * 0.07) / 0.6));
  const opacity = useTransform(local, (v) => 1 - v);
  const y = useTransform(local, (v) => -v * 56);
  const pe = useTransform(local, (v) => (v > 0.85 ? 'none' : 'auto'));
  // fully gone → visibility:hidden, so keyboard focus never lands on invisible controls
  const vis = useTransform(local, (v) => (v >= 0.995 ? 'hidden' : 'visible'));
  return (
    <motion.div className={`${exit ? '[will-change:transform,opacity]' : ''} ${className ?? ''}`} style={{ opacity, y, pointerEvents: pe, visibility: vis }}>
      {children}
    </motion.div>
  );
}

/** Approved button system — night ground: ivory primary, transparent bordered secondary. */
export const btnPrimaryNight =
  'min-h-[48px] inline-flex items-center justify-center rounded-atlas bg-ivory px-8 py-3 font-semibold text-ink-950 transition-colors hover:bg-ivory-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan';
export const btnSecondaryNight =
  'min-h-[48px] inline-flex items-center justify-center rounded-atlas border border-ivory/30 bg-transparent px-8 py-3 font-semibold text-ivory transition-colors hover:border-ivory/60 hover:bg-ivory/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan';

export function ArrivalCopy({ exit, align = 'left' }: { exit?: MotionValue<number>; align?: 'left' | 'center' }) {
  const center = align === 'center';
  return (
    <div className={`flex flex-col ${center ? 'items-center text-center' : 'items-start text-left'}`}>
      <Out exit={exit} i={0}>
        <p className="flex items-center gap-3 font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-champagne">
          <span>CareersCompus</span>
          <span aria-hidden="true" className="hidden sm:block h-px w-8 bg-champagne/40" />
          <span className="hidden sm:inline text-silver">An atlas for your education</span>
        </p>
      </Out>

      <Out exit={exit} i={1} className="mt-5">
        <h1 className="font-atlas font-normal tracking-[-0.012em] leading-[0.98] text-ivory text-[clamp(46px,13vw,76px)] sm:text-[clamp(56px,10vw,92px)] lg:text-[min(6.3vw,10.8vh)]">
          <span className="block">Your Future Has</span>
          <span className="block italic text-champagne">More Than One</span>
          <span className="block italic text-champagne">Direction.</span>
        </h1>
      </Out>

      <Out exit={exit} i={2} className="mt-5">
        <p className="max-w-[34rem] text-[17px] sm:text-lg leading-relaxed text-ivory/75">
          Explore careers, compare courses, discover universities, and chart your future with confidence.
        </p>
      </Out>

      <Out exit={exit} i={3} className="mt-7 w-full max-w-[34rem]">
        <HeroSearch />
      </Out>

      <Out exit={exit} i={4} className="mt-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button type="button" onClick={() => goTo('act-courses')} className={btnPrimaryNight}>
            Explore Courses
          </button>
          <button type="button" onClick={() => goTo('act-discovery')} className={btnSecondaryNight}>
            Explore Careers
          </button>
        </div>
      </Out>
    </div>
  );
}
