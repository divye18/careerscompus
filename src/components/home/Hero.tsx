'use client';

import { motion } from 'framer-motion';
import { HeroSearch } from './HeroSearch';

function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] w-full flex items-center pt-24 pb-12 lg:pb-16 bg-transparent pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-center">
          {/* Text column */}
          <div className="lg:col-span-7 text-center lg:text-left pointer-events-auto flex flex-col items-center lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="flex flex-col items-center lg:items-start gap-5"
            >
              <span className="inline-block text-xs uppercase tracking-[0.2em] font-bold text-[var(--color-royal-blue)]">
                CAREERSCOMPUS
              </span>
              <h1 className="text-[38px] leading-[1.1] sm:text-6xl lg:text-[4.25rem] xl:text-[4.5rem] font-extrabold text-[var(--color-ch1-text)] tracking-tight font-display">
                Your Future Has <br className="hidden sm:block" />
                <span className="text-[var(--color-royal-blue)]">More Than One Direction.</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
              className="text-lg sm:text-xl text-slate-600 max-w-xl mt-5 leading-relaxed"
            >
              Explore careers, compare courses, discover universities, and chart your future with confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
              className="w-full mt-8"
            >
              <HeroSearch />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() => goTo('act-courses')}
                className="min-h-[48px] bg-[var(--color-royal-blue)] hover:bg-[var(--color-royal-deep)] text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-md"
              >
                Explore Courses
              </button>
              <button
                type="button"
                onClick={() => goTo('act-discovery')}
                className="min-h-[48px] bg-white/80 backdrop-blur-md border border-[var(--color-royal-deep)]/20 hover:bg-white text-[var(--color-royal-deep)] px-8 py-3 rounded-lg font-semibold transition-colors shadow-sm"
              >
                Explore Careers
              </button>
            </motion.div>
          </div>

          {/*
            Compass area. The persistent 3D compass docks to elements marked
            data-compass-anchor, so it sits beside the text on desktop and in
            its own area below the text on mobile — never behind copy.
          */}
          <div
            data-compass-anchor
            aria-hidden="true"
            className="lg:col-span-5 mt-10 lg:mt-0 h-[260px] sm:h-[320px] lg:h-[460px] w-full"
          />
        </div>
      </div>
    </section>
  );
}
