'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

/**
 * Scene 4 → Scene 5 hand-over: the four educational stages (where you are → course → specialisation → career)
 * draw down and merge into one line, which then opens into six regional nodes — the atlas's regions.
 * Natural scroll drives `pathLength` through MotionValues (no React state, no scroll hijack). Reduced motion: fully drawn.
 * The title sits above the drawing, so no text is ever crossed by a line.
 */
const W = 1000;
const H = 330;
const MERGE = { x: 500, y: 150 };
const STAGES = [250, 417, 583, 750];
const REGIONS = [90, 258, 426, 574, 742, 910];

function Line({ d, p, from, to, still, dim }: { d: string; p: MotionValue<number>; from: number; to: number; still: boolean; dim?: boolean }) {
  const len = useTransform(p, [from, to], [0, 1]);
  return <motion.path d={d} fill="none" stroke="var(--color-champagne)" strokeWidth={1.3} strokeLinecap="round" strokeOpacity={dim ? 0.55 : 0.9} style={still ? undefined : { pathLength: len }} />;
}

export function AtlasIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'end 0.55'] });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8">
      <div className="pt-12 text-center sm:pt-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-champagne sm:text-xs">
          05 <span aria-hidden="true" className="mx-2 text-silver">—</span> Universities
        </p>
        <h2 className="mx-auto mt-3 max-w-3xl font-atlas text-[clamp(38px,6.4vw,76px)] font-normal leading-[1] tracking-[-0.01em] text-ivory">
          Find the place where <span className="italic text-champagne">your next chapter begins.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ivory/80">
          Pathways lead somewhere. Explore institutions by region, type and field of study. Every fact shown is checked against the
          institution’s own website, and anything we have not checked yet says so.
        </p>
      </div>

      <div aria-hidden="true" className="relative mt-6 h-[clamp(150px,24vw,280px)] w-full">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full overflow-visible">
          {STAGES.map((x, i) => (
            <g key={x}>
              <Line d={`M${x} 0 C${x} 80, ${MERGE.x} 70, ${MERGE.x} ${MERGE.y}`} p={scrollYProgress} from={0.02 + i * 0.02} to={0.5} still={reduce} />
              <circle cx={x} cy={0} r={3.4} fill="var(--color-champagne)" />
            </g>
          ))}
          {REGIONS.map((x, i) => (
            <g key={x}>
              <Line d={`M${MERGE.x} ${MERGE.y} C${MERGE.x} 230, ${x} 200, ${x} ${H - 8}`} p={scrollYProgress} from={0.45 + i * 0.01} to={0.95} still={reduce} dim />
              <circle cx={x} cy={H - 8} r={4} fill="var(--color-ink-950)" stroke="var(--color-champagne)" strokeWidth={1.4} />
            </g>
          ))}
          <circle cx={MERGE.x} cy={MERGE.y} r={5} fill="var(--color-champagne)" />
        </svg>
      </div>
    </div>
  );
}
