import { memo } from 'react';
import { ArtFrame, Label, Pulse } from './shared';

/**
 * MEDICINE & HEALTHCARE — a clinical, human-centred research plate.
 * Language: soft illuminated cell cluster (membrane, nucleus, organelles), a scientific schematic with
 * lettered leaders and a figure caption, a calm ECG-style trace. Abstract; nothing anatomical.
 */
export const MEDICINE_VIEWBOX = '0 0 1000 700';

function MedicineBackdropImpl() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(38% 46% at 50% 46%, color-mix(in srgb, var(--hue) 26%, transparent) 0%, transparent 72%), radial-gradient(22% 28% at 26% 70%, color-mix(in srgb, var(--hue) 12%, transparent) 0%, transparent 70%), radial-gradient(24% 30% at 78% 26%, color-mix(in srgb, var(--hue) 10%, transparent) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, color-mix(in srgb, var(--hue) 22%, transparent) 1px, transparent 1.5px)',
          backgroundSize: '34px 34px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 48%, black 10%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 48%, black 10%, transparent 75%)',
        }}
      />
    </div>
  );
}

// deterministic organelle positions (polar: radius, angle°, size)
const ORGANELLES: [number, number, number][] = [
  [118, 18, 9], [156, 62, 6], [96, 118, 7], [168, 150, 10], [134, 205, 6], [182, 248, 8], [112, 292, 7], [160, 330, 6], [60, 40, 5], [74, 190, 5],
];
const polar = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)] as const;

const ECG = 'M20 590 H230 l16 -4 l16 4 H340 l14 10 l16 -64 l18 100 l14 -46 H470 l16 -10 l30 20 l16 -10 H700 l14 8 l16 -58 l18 96 l14 -46 H980';

function MedicineArtImpl() {
  const cx = 500;
  const cy = 300;
  return (
    <ArtFrame
      viewBox={MEDICINE_VIEWBOX}
      overlay={
        <>
          <span
            aria-hidden="true"
            className="absolute rounded-full border border-dashed border-current opacity-40 group-data-[active=true]/room:animate-[atlas-spin_90s_linear_infinite]"
            style={{ left: '28%', top: '4.5%', width: '44%', aspectRatio: '1' }}
          />
          <Pulse left={50} top={42.8} size={14} />
        </>
      }
    >
      {/* membrane layers */}
      <circle cx={cx} cy={cy} r={214} strokeOpacity={0.55} />
      <circle cx={cx} cy={cy} r={206} strokeOpacity={0.25} />
      <circle cx={cx} cy={cy} r={150} strokeOpacity={0.4} className="stroke-ivory" />
      {/* nucleus */}
      <circle cx={cx} cy={cy} r={54} className="fill-current" fillOpacity={0.14} />
      <circle cx={cx} cy={cy} r={54} />
      <circle cx={cx + 12} cy={cy - 10} r={16} strokeOpacity={0.6} />
      {/* organelles */}
      {ORGANELLES.map(([r, a, s], i) => {
        const [x, y] = polar(cx, cy, r, a);
        return (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={s * 1.7} ry={s} transform={`rotate(${a} ${x} ${y})`} className="fill-current" fillOpacity={0.12} strokeOpacity={0.8} />
          </g>
        );
      })}
      {/* lettered leaders — scientific plate */}
      {[
        { a: -40, r: 214, t: 'A', tx: 770, ty: 92 },
        { a: 8, r: 214, t: 'B', tx: 790, ty: 330 },
        { a: 150, r: 214, t: 'C', tx: 190, ty: 470 },
      ].map((l) => {
        const [x, y] = polar(cx, cy, l.r, l.a);
        return (
          <g key={l.t}>
            <path d={`M${x} ${y}L${l.tx} ${l.ty}H${l.tx + (l.tx > 500 ? 36 : -36)}`} className="stroke-ivory" strokeOpacity={0.4} />
            <circle cx={x} cy={y} r={3} className="fill-current" stroke="none" />
            <Label x={l.tx + (l.tx > 500 ? 44 : -44)} y={l.ty + 4} anchor={l.tx > 500 ? 'start' : 'end'} size={12} opacity={0.9}>{l.t}</Label>
          </g>
        );
      })}
      {/* ECG-style rhythm trace */}
      <path d={ECG} strokeOpacity={0.9} strokeWidth={1.8} />
      <path d="M20 590H980" className="stroke-ivory" strokeOpacity={0.12} strokeDasharray="2 8" />
      <Label x={20} y={640} size={10} opacity={0.55}>FIG. 02 — CELL SCHEMATIC (ILLUSTRATIVE)</Label>
      <Label x={980} y={640} anchor="end" size={10} opacity={0.55}>RHYTHM · RESEARCH · CARE</Label>
    </ArtFrame>
  );
}

export const MedicineArt = memo(MedicineArtImpl);
export const MedicineBackdrop = memo(MedicineBackdropImpl);
