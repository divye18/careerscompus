'use client';

import { motion, useTransform } from 'framer-motion';
import { useJourney } from '../JourneyContext';
import { discoverTitleIn } from '../choreography';

/** Scene 2 title block (pinned presenter). Lands with the final meridians. */
export function DiscoverCopy() {
  const { progress } = useJourney();
  const t = useTransform(progress, discoverTitleIn);
  const y = useTransform(t, (v) => (1 - v) * 22);

  return (
    <motion.div
      className="absolute inset-x-0 top-[clamp(76px,10.5vh,116px)] text-center pointer-events-none px-6 [will-change:transform,opacity]"
      style={{ opacity: t, y }}
    >
      <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-champagne">
        02 <span className="mx-2 text-silver/60">—</span> Discover
      </p>
      <h2 className="mt-3 font-atlas font-normal leading-[0.98] tracking-[-0.01em] text-ivory text-[clamp(40px,min(5vw,8.5vh),84px)]">
        Pick a <span className="italic text-champagne">direction.</span>
      </h2>
      <p className="mt-2 text-[15px] text-silver">Seven directions to begin with.</p>
    </motion.div>
  );
}
