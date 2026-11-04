'use client';

import { useEffect, useId, useRef, type RefObject } from 'react';
import type { MotionValue } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import { SPOKES, deg2rad, rigLayout, spokeState } from './choreography';

/**
 * 2D version of the Meridian Atlas compass, driven by the same choreography as the WebGL rig.
 * Used by the flow presenter: phones/tablets, reduced motion, no WebGL, low-power devices, SSR.
 *
 * `m` is the morph (0 = Arrival, 1 = Discover). It is applied imperatively to SVG attributes
 * (no React re-render while scrolling). `active` thickens one meridian (chip hover/focus).
 */
const VB = 600;

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i * 5 * Math.PI) / 180;
  const card = i % 18 === 0;
  const major = i % 6 === 0;
  const r0 = 0.93;
  const r1 = r0 - (card ? 0.085 : major ? 0.062 : 0.03);
  return `M${(Math.sin(a) * r0).toFixed(4)} ${(-Math.cos(a) * r0).toFixed(4)}L${(Math.sin(a) * r1).toFixed(4)} ${(-Math.cos(a) * r1).toFixed(4)}`;
}).join('');

function spokePath(angleDeg: number, len: number, w: number, tail: number): string {
  const a = deg2rad(angleDeg);
  const dx = Math.cos(a);
  const dy = -Math.sin(a);
  const px = -dy;
  const py = dx;
  const hw = w / 2;
  const f = (n: number) => n.toFixed(2);
  const tip = `${f(dx * len)} ${f(dy * len)}`;
  const bl = `${f(px * hw)} ${f(py * hw)}`;
  const br = `${f(-px * hw)} ${f(-py * hw)}`;
  const tl = `${f(-dx * tail)} ${f(-dy * tail)}`;
  return `M${tip}L${br}L${tl}L${bl}Z`;
}

interface SvgRefs {
  body: RefObject<SVGGElement | null>;
  grat: RefObject<SVGCircleElement | null>;
  ring: RefObject<SVGCircleElement | null>;
  paths: RefObject<(SVGPathElement | null)[]>;
  beads: RefObject<(SVGCircleElement | null)[]>;
}

/** Writes the choreography state for morph `v` straight to SVG attributes (no React render). */
function applyCompass(r: SvgRefs, v: number, active: number | null) {
  const l = rigLayout(VB, VB, v, 'stack');
  r.body.current?.setAttribute('transform', `translate(${l.cx.toFixed(2)} ${l.cy.toFixed(2)}) scale(${l.bezelPx.toFixed(2)})`);
  r.grat.current?.setAttribute('r', l.gratPx.toFixed(2));
  r.ring.current?.setAttribute('r', (l.gratPx * 0.64).toFixed(2));
  for (let i = 0; i < SPOKES; i++) {
    const s = spokeState(i, v, 0, l);
    const on = active === i;
    const p = r.paths.current?.[i];
    const b = r.beads.current?.[i];
    if (p) {
      p.setAttribute('d', spokePath(s.angle, s.lengthPx, s.widthPx * (on ? 1.9 : 1), s.tailPx));
      p.setAttribute('fill', s.color);
      p.setAttribute('fill-opacity', s.opacity.toFixed(3));
      p.setAttribute('transform', `translate(${l.cx.toFixed(2)} ${l.cy.toFixed(2)})`);
    }
    if (b) {
      const a = deg2rad(s.angle);
      b.setAttribute('cx', (l.cx + Math.cos(a) * s.lengthPx).toFixed(2));
      b.setAttribute('cy', (l.cy - Math.sin(a) * s.lengthPx).toFixed(2));
      b.setAttribute('r', (s.beadPx * (on ? 1.5 : 1.25)).toFixed(2));
    }
  }
}

export function CompassSVG({
  m,
  active = null,
  className,
  label = 'A compass whose needles open out into seven career directions',
  sway = true,
}: {
  m: MotionValue<number>;
  active?: number | null;
  className?: string;
  label?: string;
  sway?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const body = useRef<SVGGElement>(null);
  const grat = useRef<SVGCircleElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const beads = useRef<(SVGCircleElement | null)[]>([]);
  useEffect(() => {
    const refs = { body, grat, ring, paths, beads };
    const run = (v: number) => applyCompass(refs, v, active);
    run(m.get());
    return m.on('change', run);
  }, [m, active]);

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label={label} className={className}>
      <defs>
        <radialGradient id={`${uid}-face`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBF6E8" />
          <stop offset="70%" stopColor="#F1E8D0" />
          <stop offset="100%" stopColor="#DCCDA8" />
        </radialGradient>
        <linearGradient id={`${uid}-brass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E7CF8E" />
          <stop offset="45%" stopColor="#B98B3E" />
          <stop offset="100%" stopColor="#8E6F2E" />
        </linearGradient>
      </defs>

      <circle ref={grat} cx={VB / 2} cy={VB / 2} r="200" fill="none" stroke="#8A6A2D" strokeOpacity="0.4" strokeWidth="1" />
      <circle
        ref={ring}
        cx={VB / 2}
        cy={VB / 2}
        r="120"
        fill="none"
        stroke="#8A6A2D"
        strokeOpacity="0.25"
        strokeWidth="1"
        strokeDasharray="2 6"
      />

      <g className={sway ? 'atlas-sway' : undefined} style={{ transformOrigin: '50% 50%' }}>
        {/* body (local units: bezel radius = 1) */}
        <g ref={body}>
          <circle r="1" fill="none" stroke={`url(#${uid}-brass)`} strokeWidth="0.15" />
          <circle r="0.93" fill={`url(#${uid}-face)`} />
          <circle r="0.935" fill="none" stroke="#7A5E26" strokeOpacity="0.5" strokeWidth="0.02" />
          <path d={TICKS} stroke="#8A6A2D" strokeWidth="0.012" fill="none" />
          <path d="M0 -0.82L0.1 -0.1L0 0 L-0.1 -0.1Z" fill="#3155D9" fillOpacity="0.1" />
          <path d="M0 0.82L0.1 0.1L0 0L-0.1 0.1Z" fill="#1E2A78" fillOpacity="0.06" />
          <path d="M0.82 0L0.1 0.1L0 0L0.1 -0.1Z" fill="#1E2A78" fillOpacity="0.06" />
          <path d="M-0.82 0L-0.1 0.1L0 0L-0.1 -0.1Z" fill="#1E2A78" fillOpacity="0.06" />
          <text y="-0.62" textAnchor="middle" dominantBaseline="middle" fontSize="0.2" fill="#3155D9" style={{ fontFamily: 'var(--font-atlas)' }}>
            N
          </text>
          {/* crown */}
          <rect x="-0.07" y="-1.25" width="0.14" height="0.17" rx="0.03" fill="#B98B3E" />
          <circle cy="-1.4" r="0.13" fill="none" stroke="#B98B3E" strokeWidth="0.05" />
        </g>

        {/* needles / meridians in px space */}
        {DOMAINS.map((d, i) => (
          <path
            key={d.id}
            ref={(el) => {
              paths.current[i] = el;
            }}
            d="M0 0"
            fill="#8D9BD6"
          />
        ))}
        {DOMAINS.map((d, i) => (
          <circle
            key={`b-${d.id}`}
            ref={(el) => {
              beads.current[i] = el;
            }}
            r="0"
            fill={d.hue}
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        <circle cx={VB / 2} cy={VB / 2} r="5" fill="#B98B3E" />
      </g>
    </svg>
  );
}
