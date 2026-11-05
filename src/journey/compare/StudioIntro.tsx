'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

/**
 * Scene 5 → Scene 6 hand-over: the atlas's six region nodes draw down and gather into three ruled lines, the columns
 * of the comparison ledger. Natural scroll drives `pathLength` through MotionValues (no React state, no scroll hijack).
 * Reduced motion: fully drawn. The title sits above the drawing, so no text is ever crossed by a line.
 */
const W = 1000;
const H = 260;
const TOPS = [90, 258, 426, 574, 742, 910];
const RULES = [250, 500, 750];
const GATHER = 170;

function Line({ d, p, from, to, still, strong }: { d: string; p: MotionValue<number>; from: number; to: number; still: boolean; strong?: boolean }) {
  const len = useTransform(p, [from, to], [0, 1]);
  return <motion.path d={d} fill="none" stroke="var(--color-champagne)" strokeWidth={strong ? 1.5 : 1.2} strokeLinecap="round" strokeOpacity={strong ? 0.9 : 0.55} style={still ? undefined : { pathLength: len }} />;
}

export function StudioIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'end 0.55'] });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8">
      <div className="pt-12 text-center sm:pt-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-champagne sm:text-xs">
          06 <span aria-hidden="true" className="mx-2 text-silver">—</span> Compare
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl font-atlas text-[clamp(38px,6.4vw,76px)] font-normal leading-[1] tracking-[-0.01em] text-ivory">
          Compare your options. <span className="italic text-champagne">Choose with clarity.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
          Two or three options, side by side. Every verified fact keeps its source, anything we have not verified stays visibly missing,
          and nothing here is ranked or scored.
        </p>
      </div>

      <div aria-hidden="true" className="relative mt-6 h-[clamp(110px,18vw,210px)] w-full">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full overflow-visible">
          {TOPS.map((x, i) => {
            const to = RULES[Math.floor(i / 2)];
            return (
              <g key={x}>
                <Line d={`M${x} 0 C${x} 90, ${to} 80, ${to} ${GATHER}`} p={scrollYProgress} from={0.02 + i * 0.02} to={0.6} still={reduce} />
                <circle cx={x} cy={0} r={4} fill="var(--color-ink-950)" stroke="var(--color-champagne)" strokeWidth={1.4} />
              </g>
            );
          })}
          {RULES.map((x) => (
            <g key={x}>
              <Line d={`M${x} ${GATHER} L${x} ${H}`} p={scrollYProgress} from={0.55} to={0.95} still={reduce} strong />
              <circle cx={x} cy={GATHER} r={3.4} fill="var(--color-champagne)" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
