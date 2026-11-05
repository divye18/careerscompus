'use client';

import { useEffect, useId, useRef, type RefObject } from 'react';
import type { MotionValue } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import { color, compass, matcapTone } from '@/theme/tokens';
import { SPOKES, deg2rad, rigLayout, spokeState, tipGlow } from './choreography';

/**
 * 2D version of the Meridian Atlas compass, driven by the same choreography as the WebGL rig.
 * Used by the flow presenter: phones/tablets, reduced motion, no WebGL, low-power devices, SSR.
 *
 * `m` is the morph (0 = Arrival, 1 = Discover). It is applied imperatively to SVG attributes
 * (no React re-render while scrolling). `active` thickens one meridian (chip hover/focus);
 * `selected` marks a domain's bead in cyan. Materials come from the Nocturne Atlas tokens.
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
  tipCore: RefObject<SVGCircleElement | null>;
  tipHalo: RefObject<SVGCircleElement | null>;
}

/** Writes the choreography state for morph `v` straight to SVG attributes (no React render). */
function applyCompass(r: SvgRefs, v: number, active: number | null, selected: number | null) {
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
      b.setAttribute('fill', selected === i ? color.cyan : DOMAINS[i].hue);

      // cyan light at the primary needle tip (Arrival), fading as it becomes a meridian
      if (i === 0) {
        const o = tipGlow(v).toFixed(3);
        for (const [ref, rad, op] of [[r.tipCore, 5, o], [r.tipHalo, 12, (0.22 * +o).toFixed(3)]] as const) {
          ref.current?.setAttribute('cx', b.getAttribute('cx') ?? '0');
          ref.current?.setAttribute('cy', b.getAttribute('cy') ?? '0');
          ref.current?.setAttribute('r', String(rad));
          ref.current?.setAttribute('fill-opacity', op);
        }
      }
    }
  }
}

export function CompassSVG({
  m,
  active = null,
  selected = null,
  className,
  label = 'A compass whose needles open out into seven career directions',
  sway = true,
}: {
  m: MotionValue<number>;
  active?: number | null;
  selected?: number | null;
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
  const tipCore = useRef<SVGCircleElement>(null);
  const tipHalo = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const refs = { body, grat, ring, paths, beads, tipCore, tipHalo };
    const run = (v: number) => applyCompass(refs, v, active, selected);
    run(m.get());
    return m.on('change', run);
  }, [m, active, selected]);

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label={label} className={className}>
      <defs>
        <radialGradient id={`${uid}-face`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={compass.dialCentre} />
          <stop offset="70%" stopColor={compass.dialMid} />
          <stop offset="100%" stopColor={compass.dialEdge} />
        </radialGradient>
        <linearGradient id={`${uid}-brass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={matcapTone.brass.light} />
          <stop offset="45%" stopColor={matcapTone.brass.mid} />
          <stop offset="100%" stopColor={matcapTone.brassDark.mid} />
        </linearGradient>
      </defs>

      <circle ref={grat} cx={VB / 2} cy={VB / 2} r="200" fill="none" stroke={color.champagne} strokeOpacity="0.4" strokeWidth="1" />
      <circle
        ref={ring}
        cx={VB / 2}
        cy={VB / 2}
        r="120"
        fill="none"
        stroke={color.champagne}
        strokeOpacity="0.22"
        strokeWidth="1"
        strokeDasharray="2 6"
      />

      <g className={sway ? 'atlas-sway' : undefined} style={{ transformOrigin: '50% 50%' }}>
        {/* body (local units: bezel radius = 1) */}
        <g ref={body}>
          <circle r="1" fill="none" stroke={`url(#${uid}-brass)`} strokeWidth="0.15" />
          <circle r="0.93" fill={`url(#${uid}-face)`} />
          <circle r="0.935" fill="none" stroke={matcapTone.brassDark.dark} strokeOpacity="0.6" strokeWidth="0.02" />
          <path d={TICKS} stroke={compass.engraving} strokeOpacity="0.75" strokeWidth="0.012" fill="none" />
          <path d="M0 -0.82L0.1 -0.1L0 0 L-0.1 -0.1Z" fill={compass.engraving} fillOpacity="0.07" />
          <path d="M0 0.82L0.1 0.1L0 0L-0.1 0.1Z" fill={compass.engraving} fillOpacity="0.04" />
          <path d="M0.82 0L0.1 0.1L0 0L0.1 -0.1Z" fill={compass.engraving} fillOpacity="0.04" />
          <path d="M-0.82 0L-0.1 0.1L0 0L-0.1 -0.1Z" fill={compass.engraving} fillOpacity="0.04" />
          <text y="-0.62" textAnchor="middle" dominantBaseline="middle" fontSize="0.2" fill={compass.northMark} style={{ fontFamily: 'var(--font-atlas)' }}>
            N
          </text>
          {/* crown */}
          <rect x="-0.07" y="-1.25" width="0.14" height="0.17" rx="0.03" fill={matcapTone.brass.mid} />
          <circle cy="-1.4" r="0.13" fill="none" stroke={matcapTone.brass.mid} strokeWidth="0.05" />
        </g>

        {/* needles / meridians in px space */}
        {DOMAINS.map((d, i) => (
          <path
            key={d.id}
            ref={(el) => {
              paths.current[i] = el;
            }}
            d="M0 0"
            fill={compass.ghost}
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
            stroke={color.ink950}
            strokeWidth="2"
          />
        ))}
        <circle ref={tipHalo} r="0" fill={compass.tip} />
        <circle ref={tipCore} r="0" fill={compass.tip} />
        <circle cx={VB / 2} cy={VB / 2} r="5" fill={matcapTone.brass.mid} />
      </g>
    </svg>
  );
}
