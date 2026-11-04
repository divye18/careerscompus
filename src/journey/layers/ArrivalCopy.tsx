'use client';

import type { ReactNode } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { HeroSearch } from '@/components/home/HeroSearch';
import { clamp01 } from '../choreography';
import { goTo } from '../scroll';

/**
 * Scene 1 copy. Shared by both presenters so the first screen is the same server-rendered
 * HTML either way (good for LCP and no layout jump when the pinned stage hydrates).
 *
 * `exit` (pinned presenter only) is the 0→1 scroll progress of the text leaving the stage;
 * each block leaves with a slight stagger. Without it the copy is static.
 */
function Out({ exit, i, children, className }: { exit?: MotionValue<number>; i: number; children: ReactNode; className?: string }) {
  const zero = useMotionValue(0);
  const src = exit ?? zero;
  const local = useTransform(src, (v) => clamp01((v - i * 0.07) / 0.6));
  const opacity = useTransform(local, (v) => 1 - v);
  const y = useTransform(local, (v) => -v * 56);
  const pe = useTransform(local, (v) => (v > 0.85 ? 'none' : 'auto'));
  return (
    <motion.div className={className} style={{ opacity, y, pointerEvents: pe }}>
      {children}
    </motion.div>
  );
}

export function ArrivalCopy({ exit, align = 'left' }: { exit?: MotionValue<number>; align?: 'left' | 'center' }) {
  const center = align === 'center';
  return (
    <div className={`flex flex-col ${center ? 'items-center text-center' : 'items-start text-left'}`}>
      <Out exit={exit} i={0}>
        <p className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-royal-blue)]">
          <span>CareersCompus</span>
          <span aria-hidden="true" className="hidden sm:block h-px w-8 bg-[var(--color-royal-blue)]/40" />
          <span className="hidden sm:inline text-[var(--color-royal-deep)]/70">An atlas for your education</span>
        </p>
      </Out>

      <Out exit={exit} i={1} className="mt-5">
        <h1 className="font-atlas font-normal tracking-[-0.012em] leading-[0.98] text-[var(--color-accent-midnight)] text-[clamp(46px,13vw,76px)] sm:text-[clamp(56px,10vw,92px)] lg:text-[min(6.3vw,10.8vh)]">
          <span className="block">Your Future Has</span>
          <span className="block italic text-[var(--color-royal-blue)]">More Than One</span>
          <span className="block italic text-[var(--color-royal-blue)]">Direction.</span>
        </h1>
      </Out>

      <Out exit={exit} i={2} className="mt-5">
        <p className="max-w-[34rem] text-[17px] sm:text-lg leading-relaxed text-[var(--color-royal-deep)]/80">
          Explore careers, compare courses, discover universities, and chart your future with confidence.
        </p>
      </Out>

      <Out exit={exit} i={3} className="mt-7 w-full max-w-[34rem]">
        <HeroSearch />
      </Out>

      <Out exit={exit} i={4} className="mt-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => goTo('act-courses')}
            className="min-h-[48px] bg-[var(--color-royal-blue)] hover:bg-[var(--color-royal-deep)] text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md"
          >
            Explore Courses
          </button>
          <button
            type="button"
            onClick={() => goTo('act-discovery')}
            className="min-h-[48px] bg-white/70 border border-[var(--color-royal-deep)]/25 hover:bg-white text-[var(--color-royal-deep)] px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Explore Careers
          </button>
        </div>
      </Out>
    </div>
  );
}
