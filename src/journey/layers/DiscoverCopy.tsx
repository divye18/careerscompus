'use client';

import { motion, useTransform } from 'framer-motion';
import { useJourney } from '../JourneyContext';
import { discoverTitleIn } from '../choreography';

/** Scene 2 title block (pinned presenter). Fades up as the needles open out. */
export function DiscoverCopy() {
  const { progress } = useJourney();
  const t = useTransform(progress, discoverTitleIn);
  const opacity = t;
  const y = useTransform(t, (v) => (1 - v) * 22);

  return (
    <motion.div
      className="absolute inset-x-0 top-[clamp(76px,10.5vh,116px)] text-center pointer-events-none px-6"
      style={{ opacity, y }}
    >
      <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-royal-blue)]">
        02 <span className="mx-2 text-[var(--color-royal-deep)]/40">—</span> Discover
      </p>
      <h2 className="mt-3 font-atlas font-normal leading-[0.98] tracking-[-0.01em] text-[var(--color-accent-midnight)] text-[clamp(40px,min(5vw,8.5vh),84px)]">
        Pick a <span className="italic text-[var(--color-royal-blue)]">direction.</span>
      </h2>
      <p className="mt-2 text-[15px] text-[var(--color-royal-deep)]/75">Seven directions to begin with.</p>
    </motion.div>
  );
}
