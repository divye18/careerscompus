'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import { useIsWide } from '../useIsWide';

/**
 * Scene 3 → Scene 4 hand-over and Scene 4's opening: a poster-scale headline, flush left. Seven hue lines (one per career
 * world) fall in from the scene above, merge into one champagne line, and that line sweeps under the headline to the
 * left margin, where the route chart's first rail begins. It says "these worlds become one route" and it leads the eye
 * into the chart. Natural scroll draws it (MotionValue → pathLength, no React state). Reduced motion: fully drawn.
 *
 * No text is ever crossed by a line: the headline column stops before the lines begin, and the sweep runs below it.
 */
interface Geometry {
  w: number;
  h: number;
  tops: readonly number[];
  merge: readonly [number, number];
  trunk: string;
  end: readonly [number, number];
}

const WIDE: Geometry = {
  w: 1000,
  h: 500,
  tops: DOMAINS.map((_, i) => 612 + i * 60),
  merge: [790, 262],
  trunk: 'M790 262 C790 392, 762 472, 650 476 L34 476 C18 476, 9 484, 9 498',
  end: [9, 498],
};

const NARROW: Geometry = {
  w: 350,
  h: 176,
  tops: DOMAINS.map((_, i) => 96 + i * 40),
  merge: [216, 104],
  trunk: 'M216 104 C216 140, 200 158, 168 158 L24 158 C14 158, 9 164, 9 174',
  end: [9, 174],
};

function Line({ d, stroke, width, p, from, to, still }: { d: string; stroke: string; width: number; p: MotionValue<number>; from: number; to: number; still: boolean }) {
  const len = useTransform(p, [from, to], [0, 1]);
  const op = useTransform(p, [from, from + 0.05], [0, 1]);
  return <motion.path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" style={still ? undefined : { pathLength: len, opacity: op }} />;
}

function Bead({ at, r, p, from, still }: { at: readonly [number, number]; r: number; p: MotionValue<number>; from: number; still: boolean }) {
  const op = useTransform(p, [from, from + 0.08], [0, 1]);
  return <motion.circle cx={at[0]} cy={at[1]} r={r} fill="var(--color-champagne)" style={still ? undefined : { opacity: op }} />;
}

function Drawing({ g, p, still }: { g: Geometry; p: MotionValue<number>; still: boolean }) {
  const [mx, my] = g.merge;
  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} preserveAspectRatio="xMinYMin meet" aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
      {DOMAINS.map((d, i) => {
        const x = g.tops[i];
        return (
          <g key={d.id}>
            <Line d={`M${x} 4 C${x} ${my * 0.46}, ${mx} ${my * 0.52}, ${mx} ${my}`} stroke={d.hue} width={1.4} p={p} from={0.02 + i * 0.012} to={0.55} still={still} />
            <circle cx={x} cy={4} r={3.2} fill={d.hue} />
          </g>
        );
      })}
      <Line d={g.trunk} stroke="var(--color-champagne)" width={1.6} p={p} from={0.5} to={0.98} still={still} />
      <Bead at={g.merge} r={4} p={p} from={0.48} still={still} />
      <Bead at={g.end} r={3.4} p={p} from={0.9} still={still} />
    </svg>
  );
}

export function PathwayConverge() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const wide = useIsWide();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'end 0.6'] });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:pr-[clamp(72px,9vw,150px)]">
      <div className="[container-type:inline-size]">
        <div className="relative lg:aspect-[1000/500]">
          {wide && <Drawing key="wide" g={WIDE} p={scrollYProgress} still={reduce} />}
          <div className="relative pt-14 sm:pt-20 lg:w-[60%] lg:pt-[5.5cqw]">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-champagne sm:text-xs">
              04 <span aria-hidden="true" className="mx-2 text-silver">—</span> Pathways
            </p>
            <h2 className="mt-3 font-atlas text-[clamp(46px,13vw,84px)] font-normal leading-[0.98] tracking-[-0.012em] text-ivory lg:text-[8.4cqw]">
              <span className="block">Every career</span>
              <span className="block">has a pathway.</span>
              <span className="block italic text-champagne">Discover yours.</span>
            </h2>
            <p className="mt-5 max-w-[32em] text-[17px] leading-relaxed text-ivory/85">
              You have seen what a career can look like. Now see how people can get there: from where you are today, through a course, to a direction you can aim for.
            </p>
          </div>
        </div>
        <div aria-hidden="true" className="relative mt-6 w-full max-w-[520px] lg:hidden" style={{ aspectRatio: `${NARROW.w} / ${NARROW.h}` }}>
          {!wide && <Drawing key="narrow" g={NARROW} p={scrollYProgress} still={reduce} />}
        </div>
      </div>
    </div>
  );
}
