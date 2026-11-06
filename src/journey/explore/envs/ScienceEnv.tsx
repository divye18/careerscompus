import { memo } from 'react';
import { ArtCaption, ArtFrame, Label } from './shared';

/**
 * SCIENCE & RESEARCH — an exploratory research notebook, not glowing planets.
 * Language: quantised-orbit diagram with level labels, a molecular ball-and-stick ring, a spectrum
 * strip and an absorption-peak plot with plain scientific notation. Figures are schematic.
 */
export const SCIENCE_VIEWBOX = '0 0 1000 700';

const RINGS_MASK = 'radial-gradient(ellipse 70% 75% at 36% 48%, black 10%, transparent 80%)';
const RING_RADII = Array.from({ length: 20 }, (_, k) => 58 * (k + 1));

function ScienceBackdropImpl() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="currentColor"
        style={{ color: 'var(--hue)', opacity: 0.07, maskImage: RINGS_MASK, WebkitMaskImage: RINGS_MASK }}
      >
        {RING_RADII.map((r) => (
          <circle key={r} cx="36%" cy="48%" r={r} />
        ))}
      </svg>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(30% 40% at 36% 48%, color-mix(in srgb, var(--hue) 10%, transparent), transparent 75%)' }} />
    </div>
  );
}

const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k - Math.PI / 6;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });

const SPECTRUM = Array.from({ length: 34 }, (_, k) => {
  const x = 580 + k * 11;
  const strength = Math.exp(-Math.pow((k - 12) / 6, 2)) * 0.85 + Math.exp(-Math.pow((k - 26) / 3, 2)) * 0.6 + 0.08;
  return { x, strength };
});

function ScienceArtImpl() {
  const ring = hex(760, 200, 66);
  return (
    <ArtFrame
      viewBox={SCIENCE_VIEWBOX}
      caption={<ArtCaption>Fig. 07 · Models and measurement · Schematic</ArtCaption>}
      overlay={
        <span
          aria-hidden="true"
          className="absolute group-data-[opened=true]/room:animate-[atlas-turn-in_2.8s_ease-out_1]"
          style={{ left: '3%', top: '9%', width: '52%', aspectRatio: '1' }}
        >
          <svg viewBox="-260 -260 520 520" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth={1.3}>
            {[0, 60, 120].map((r) => (
              <ellipse key={r} rx={240} ry={92} transform={`rotate(${r})`} strokeOpacity={0.6} />
            ))}
            {/* quantised level markers */}
            {[[240, 0], [-120, 80], [-120, -80]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={6} className="fill-current" stroke="none" />
            ))}
          </svg>
        </span>
      }
    >
      {/* nucleus + level circles (static centre of the orbit diagram) */}
      <g transform="translate(290 350)">
        <circle r={22} className="fill-current" fillOpacity={0.16} />
        <circle r={22} />
        <circle r={110} className="stroke-ivory" strokeOpacity={0.15} strokeDasharray="3 6" />
        <Label x={0} y={4} anchor="middle" size={11} opacity={1} className="fill-current">Z</Label>
        <Label x={116} y={-118} size={10}>n = 1</Label>
        <Label x={176} y={-176} size={10}>n = 2</Label>
        <Label x={236} y={-228} size={10}>n = 3</Label>
      </g>
      {/* molecular ring */}
      <path d={`M${ring.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`} strokeWidth={1.8} />
      {hex(760, 200, 46).map(([x, y], k) => {
        const [x2, y2] = hex(760, 200, 46)[(k + 1) % 6];
        return k % 2 === 0 ? <path key={k} d={`M${x.toFixed(1)} ${y.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`} strokeOpacity={0.7} /> : null;
      })}
      {ring.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={7} className="fill-ink-950" strokeWidth={1.6} />
      ))}
      <path d={`M${ring[0][0]} ${ring[0][1]}L${ring[0][0] + 60} ${ring[0][1] - 26}`} />
      <circle cx={ring[0][0] + 60} cy={ring[0][1] - 26} r={9} className="fill-current" fillOpacity={0.2} />
      <Label x={ring[0][0] + 76} y={ring[0][1] - 24} size={11} opacity={0.95}>R</Label>
      <path d={`M${ring[3][0]} ${ring[3][1]}L${ring[3][0] - 56} ${ring[3][1] + 30}`} />
      <circle cx={ring[3][0] - 56} cy={ring[3][1] + 30} r={9} className="fill-current" fillOpacity={0.2} />
      {/* spectrum strip */}
      <rect x={570} y={330} width={390} height={86} rx={3} className="stroke-ivory" strokeOpacity={0.25} />
      {SPECTRUM.map(({ x, strength }) => (
        <path key={x} d={`M${x} 336V${336 + 74 * strength}`} strokeOpacity={0.25 + strength * 0.6} />
      ))}
      <Label x={570} y={436} size={10} opacity={0.6}>λ →</Label>
      {/* absorption-peak plot */}
      <path d="M580 600V470H960" className="stroke-ivory" strokeOpacity={0.5} />
      <path d="M582 596C640 596 660 560 690 530 S740 480 770 520 S830 592 870 590 S930 575 958 572" strokeWidth={1.8} />
      <Label x={770} y={466} anchor="middle" size={10} opacity={0.9}>ΔE = hν</Label>
      <Label x={960} y={622} anchor="end" size={10} opacity={0.6}>energy →</Label>
    </ArtFrame>
  );
}

export const ScienceArt = memo(ScienceArtImpl);
export const ScienceBackdrop = memo(ScienceBackdropImpl);
