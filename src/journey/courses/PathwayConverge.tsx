'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { DOMAINS } from '@/content/domains';

/**
 * Scene 3 → Scene 4 hand-over. Seven hue lines (one per career world) run down from the top of the scene and
 * converge into a single champagne line — "career discovery" becoming "educational planning". The lines draw
 * with natural scroll (MotionValue → pathLength, no React state, no scroll hijack). Reduced motion: fully drawn.
 *
 * The title sits clear of the lines (above the merge) so no text ever overlaps a line.
 */
const VB_W = 1000;
const VB_H = 360;
const MERGE = { x: 500, y: 250 };

const xs = DOMAINS.map((_, i) => 110 + (i * (VB_W - 220)) / (DOMAINS.length - 1));

function Branch({ i, hue, p, still }: { i: number; hue: string; p: MotionValue<number>; still: boolean }) {
  const x = xs[i];
  const d = `M${x} 0 C${x} 110, ${MERGE.x} 120, ${MERGE.x} ${MERGE.y}`;
  const len = useTransform(p, [0.04 + i * 0.012, 0.62], [0, 1]);
  const op = useTransform(p, [0.04 + i * 0.012, 0.14 + i * 0.012], [0, 0.9]);
  return (
    <>
      <motion.path d={d} fill="none" stroke={hue} strokeWidth={1.4} strokeLinecap="round" style={still ? undefined : { pathLength: len, opacity: op }} opacity={still ? 0.9 : undefined} />
      <circle cx={x} cy={0} r={3.4} fill={hue} opacity={0.9} />
    </>
  );
}

export function PathwayConverge() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'end 0.55'] });
  const trunk = useTransform(scrollYProgress, [0.55, 1], [0, 1]);
  const bead = useTransform(scrollYProgress, [0.85, 1], [0, 1]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8">
      <div className="pt-12 sm:pt-16 text-center">
        <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-champagne">
          04 <span aria-hidden="true" className="mx-2 text-silver">—</span> Pathways
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl font-atlas text-[clamp(38px,6.4vw,76px)] font-normal leading-[1] tracking-[-0.01em] text-ivory">
          Every career has a pathway. <span className="italic text-champagne">Discover yours.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
          You have seen what a career can look like. Now see how people can get there: from where you are today, through a course, to
          a direction you can aim for.
        </p>
      </div>

      <div aria-hidden="true" className="relative mt-6 h-[clamp(170px,26vw,300px)] w-full">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full overflow-visible">
          {DOMAINS.map((d, i) => (
            <Branch key={d.id} i={i} hue={d.hue} p={scrollYProgress} still={reduce} />
          ))}
          <motion.path
            d={`M${MERGE.x} ${MERGE.y} L${MERGE.x} ${VB_H}`}
            fill="none"
            stroke="var(--color-champagne)"
            strokeWidth={1.6}
            strokeLinecap="round"
            style={reduce ? undefined : { pathLength: trunk }}
          />
          <motion.circle cx={MERGE.x} cy={MERGE.y} r={5} fill="var(--color-champagne)" style={reduce ? undefined : { opacity: bead }} />
          <circle cx={MERGE.x} cy={VB_H - 1} r={3} fill="var(--color-champagne)" />
        </svg>
      </div>
    </div>
  );
}
