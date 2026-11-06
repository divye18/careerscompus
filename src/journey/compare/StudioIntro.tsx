'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';

/**
 * Scene 5 → Scene 6 hand-over and Scene 6's opening: a masthead. A large two-line title sits flush left, its one
 * paragraph hangs to the right on the same baseline, and a ruled line is drawn beneath them across the full width,
 * then drops three ticks that land on the three option slots below. It says "this is a ruled sheet with three columns"
 * and it points at where to start. Natural scroll draws it (MotionValue to pathLength, no React state, no scroll
 * hijack). On phones the ticks are not drawn (there is one column), and under reduced motion everything is fully drawn.
 * No text is crossed by a line.
 */
const W = 1000;
const H = 64;
const RULE_Y = 6;
const TICKS = [0, 1000 / 3, 2000 / 3];

function Draw({ d, p, from, to, still, strong }: { d: string; p: MotionValue<number>; from: number; to: number; still: boolean; strong?: boolean }) {
  const len = useTransform(p, [from, to], [0, 1]);
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="var(--color-champagne)"
      strokeWidth={strong ? 1.6 : 1.1}
      strokeOpacity={strong ? 0.95 : 0.6}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      style={still ? undefined : { pathLength: len }}
    />
  );
}

export function StudioIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.92', 'end 0.6'] });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1240px] px-5 pt-14 sm:px-8 sm:pt-20 lg:pr-[clamp(72px,9vw,150px)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-champagne sm:text-xs">
        06 <span aria-hidden="true" className="mx-2 text-silver">—</span> Compare
      </p>
      <div className="mt-3 grid gap-y-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-x-12">
        <h2 className="font-atlas text-[clamp(40px,9vw,64px)] lg:text-[clamp(52px,4.9vw,76px)] font-normal leading-[0.98] tracking-[-0.012em] text-ivory">
          <span className="block">Compare your options.</span>
          <span className="block italic text-champagne">Choose with clarity.</span>
        </h2>
        <p className="max-w-[30em] pb-2 text-base leading-relaxed text-ivory/85 lg:text-[17px]">
          Two or three options on one ruled sheet. Every verified fact keeps its source, anything we have not verified stays visibly missing, and nothing here is ranked or scored.
        </p>
      </div>

      <div aria-hidden="true" className="relative mt-8 h-[2px] w-full lg:h-16">
        <div className="absolute inset-x-0 top-0 border-t border-champagne/60 lg:hidden" />
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 hidden h-full w-full overflow-visible lg:block">
          <Draw d={`M0 ${RULE_Y} L${W} ${RULE_Y}`} p={scrollYProgress} from={0.05} to={0.55} still={reduce} />
          {TICKS.map((x, i) => (
            <Draw key={x} d={`M${x} ${RULE_Y} L${x} ${H}`} p={scrollYProgress} from={0.5 + i * 0.08} to={0.95} still={reduce} strong />
          ))}
        </svg>
      </div>
    </div>
  );
}
