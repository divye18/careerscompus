'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { DATA_LAST_VERIFIED, INSTITUTIONS, type RegionId } from '@/content/institutions';
import { HUBS, HUB_EDGES } from './atlasLayout';

/**
 * Scene 4 → Scene 5 hand-over and Scene 5's opening: a chart plate on the left, a stepped title on the right.
 * The four educational stages draw down, merge into one line and resolve into the atlas's own six regional hubs, in the
 * same arrangement as the chart below (the dashed International hub has no verified entries yet, here and there).
 * Below the title, a small legend states what the atlas holds. Natural scroll draws it. Reduced motion: fully drawn.
 */
const W = 500;
const H = 520;
const STAGES = [142, 214, 286, 358];
const MERGE = { x: 250, y: 92 };
const mx = (x: number) => 30 + x * 0.44;
const my = (y: number) => 150 + y * 0.5;
const hub = (r: RegionId) => ({ x: mx(HUBS[r].x), y: my(HUBS[r].y) });

/** Each route leaves the merge point on its own curve, so the lines fan out rather than stack on the central axis. */
const ROUTES: readonly (readonly [RegionId, string])[] = [
  ['north', `M250 92 L${hub('north').x} ${hub('north').y}`],
  ['central', `M250 92 C196 150, 196 270, ${hub('central').x} ${hub('central').y}`],
  ['south', `M250 92 C314 170, 314 360, ${hub('south').x} ${hub('south').y}`],
  ['west', `M250 92 C180 130, ${hub('west').x} 190, ${hub('west').x} ${hub('west').y}`],
  ['east', `M250 92 C320 130, ${hub('east').x} 190, ${hub('east').x} ${hub('east').y}`],
  ['international', `M250 92 C340 110, 470 260, ${hub('international').x} ${hub('international').y}`],
];

function Line({ d, p, from, to, still, dim }: { d: string; p: MotionValue<number>; from: number; to: number; still: boolean; dim?: boolean }) {
  const len = useTransform(p, [from, to], [0, 1]);
  const op = useTransform(p, [from, from + 0.05], [0, dim ? 0.6 : 0.95]);
  return <motion.path d={d} fill="none" stroke="var(--color-champagne)" strokeWidth={dim ? 1.1 : 1.3} strokeLinecap="round" strokeOpacity={still ? (dim ? 0.6 : 0.95) : undefined} style={still ? undefined : { pathLength: len, opacity: op }} />;
}

function Plate({ p, still }: { p: MotionValue<number>; still: boolean }) {
  const edges = useTransform(p, [0.82, 1], [0, 1]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMin meet" aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
      {STAGES.map((x, i) => (
        <g key={x}>
          <Line d={`M${x} 6 C${x} 50, ${MERGE.x} 40, ${MERGE.x} ${MERGE.y}`} p={p} from={0.02 + i * 0.02} to={0.42} still={still} />
          <circle cx={x} cy={6} r={3.4} fill="var(--color-champagne)" />
        </g>
      ))}
      {ROUTES.map(([r, d], i) => (
        <Line key={r} d={d} p={p} from={0.38 + i * 0.012} to={0.86} still={still} dim />
      ))}
      <motion.g style={still ? undefined : { opacity: edges }}>
        {HUB_EDGES.map(([a, b]) => (
          <line key={a + b} x1={hub(a).x} y1={hub(a).y} x2={hub(b).x} y2={hub(b).y} stroke="var(--color-champagne)" strokeOpacity={0.4} strokeDasharray="2 5" />
        ))}
      </motion.g>
      <circle cx={MERGE.x} cy={MERGE.y} r={4.2} fill="var(--color-champagne)" />
      {(Object.keys(HUBS) as RegionId[]).map((r) => (
        <circle key={r} cx={hub(r).x} cy={hub(r).y} r={5} fill="var(--color-ink-950)" stroke="var(--color-champagne)" strokeWidth={1.4} strokeDasharray={r === 'international' ? '2 2.4' : undefined} />
      ))}
    </svg>
  );
}

const regionsCovered = new Set(INSTITUTIONS.map((i) => i.region)).size;

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase leading-snug tracking-[0.12em] text-ivory/75">{label}</dt>
      <dd className="mt-1 font-mono text-[18px] text-ivory sm:text-[20px]">{value}</dd>
    </div>
  );
}

export function AtlasIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'end 0.62'] });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:pr-[clamp(72px,9vw,150px)]">
      <div className="[container-type:inline-size]">
        <div className="grid gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-[5cqw]">
          <div className="relative w-[78%] max-w-[400px] lg:w-full lg:max-w-none" style={{ aspectRatio: `${W} / ${H}` }}>
            <Plate p={scrollYProgress} still={reduce} />
          </div>
          <div className="lg:pt-[5cqw]">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-champagne sm:text-xs">
              05 <span aria-hidden="true" className="mx-2 text-silver">—</span> Universities
            </p>
            <h2 className="mt-3 font-atlas text-[clamp(40px,11vw,72px)] font-normal leading-[1.02] tracking-[-0.01em] text-ivory lg:text-[6.2cqw]">
              <span className="block">Find the place</span>
              <span className="block pl-[5%]">
                where <span className="italic text-champagne">your next</span>
              </span>
              <span className="block pl-[10%] italic text-champagne">chapter begins.</span>
            </h2>
            <p className="mt-5 max-w-[34em] text-base leading-relaxed text-ivory/85">
              Pathways lead somewhere. Explore institutions by region, type and field of study. Every fact shown is checked against the institution’s own website, and anything we have not checked yet says so.
            </p>
            <dl className="mt-6 grid max-w-[34em] grid-cols-[auto_auto_1fr] gap-x-6 border-t border-champagne/40 pt-4 sm:gap-x-9">
              <Fact label="Institutions" value={String(INSTITUTIONS.length)} />
              <Fact label="Regions" value={String(regionsCovered)} />
              <Fact label="Last checked" value={DATA_LAST_VERIFIED} />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
