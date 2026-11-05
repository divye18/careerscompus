'use client';

import { motion, useTransform } from 'framer-motion';
import { useJourney } from '../JourneyContext';
import { exploreIn, morphAt, rigLayout, smoothstep, range } from '../choreography';

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i * 5 * Math.PI) / 180;
  const long = i % 6 === 0;
  const r0 = 500;
  const r1 = long ? 478 : 489;
  return `M${(500 + Math.cos(a) * r0).toFixed(1)} ${(500 + Math.sin(a) * r0).toFixed(1)}L${(500 + Math.cos(a) * r1).toFixed(1)} ${(500 + Math.sin(a) * r1).toFixed(1)}`;
}).join('');

/**
 * Atlas graticule: champagne hairline circles and degree ticks under the compass (night ground).
 * It starts as a faint halo around the compass and grows into the map the meridians are drawn on.
 * Perf: strokes scale with the transform (no non-scaling-stroke), so Chrome can composite the
 * layer instead of re-rasterising the SVG on every scroll frame.
 */
export function Graticule() {
  const { progress, stageW, stageH } = useJourney();
  const m = useTransform(progress, morphAt);
  const x3 = useTransform(progress, exploreIn);

  const size = useTransform([stageW, stageH], ([W, H]: number[]) => 2 * rigLayout(W, H, 0).gratPx);
  const x = useTransform([m, x3, stageW, stageH, size], ([mm, x3v, W, H, S]: number[]) => rigLayout(W, H, mm, 'wide', x3v).gx - S / 2);
  const y = useTransform([m, x3, stageW, stageH, size], ([mm, x3v, W, H, S]: number[]) => rigLayout(W, H, mm, 'wide', x3v).gy - S / 2);
  const scale = useTransform([m, x3, stageW, stageH], ([mm, x3v, W, H]: number[]) => {
    const l = rigLayout(W, H, mm, 'wide', x3v);
    return l.gratPx / rigLayout(W, H, 0).gratPx;
  });
  const opacity = useTransform([m, x3], ([v, x]: number[]) => (0.5 + 0.5 * smoothstep(range(v, 0.2, 0.9))) * (1 - 0.55 * x));

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 1000 1000"
      className="absolute left-0 top-0 pointer-events-none"
      style={{ width: size, height: size, x, y, scale, opacity, transformOrigin: '50% 50%', willChange: 'transform, opacity' }}
    >
      <g fill="none" className="stroke-champagne">
        <circle cx="500" cy="500" r="500" strokeOpacity="0.42" strokeWidth="1.6" />
        <circle cx="500" cy="500" r="410" strokeOpacity="0.2" strokeWidth="1.6" />
        <circle cx="500" cy="500" r="290" strokeOpacity="0.18" strokeWidth="1.6" strokeDasharray="2 7" />
        <circle cx="500" cy="500" r="180" strokeOpacity="0.14" strokeWidth="1.6" />
        <path d={TICKS} strokeOpacity="0.42" strokeWidth="1.6" />
      </g>
    </motion.svg>
  );
}
