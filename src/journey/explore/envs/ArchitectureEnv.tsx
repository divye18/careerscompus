import { memo } from 'react';
import { ArtCaption, ArtFrame, GridLayer, Label } from './shared';

/**
 * ARCHITECTURE & INFRASTRUCTURE — an architectural drawing table brought to life.
 * Language: blueprint grid, one-point perspective floor, an isometric wireframe of three massed blocks,
 * dimension lines, section marks, and a drawing title block. Orthographic and calm.
 */
export const ARCH_VIEWBOX = '0 0 1000 700';

const MASK_COARSE = 'radial-gradient(ellipse 80% 75% at 40% 50%, black 20%, transparent 80%)';
const MASK_FINE = 'radial-gradient(ellipse 60% 55% at 40% 50%, black 10%, transparent 80%)';

function ArchitectureBackdropImpl() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <GridLayer id="arch-g80" size={80} opacity={0.12} style={{ maskImage: MASK_COARSE, WebkitMaskImage: MASK_COARSE }} />
      <GridLayer id="arch-g16" size={16} opacity={0.06} style={{ maskImage: MASK_FINE, WebkitMaskImage: MASK_FINE }} />
    </div>
  );
}

/** isometric projection of (x, y, z) in drawing units */
const S = 26;
const ox = 500;
const oy = 420;
const iso = (x: number, y: number, z: number) => [ox + (x - y) * 0.866 * S, oy + (x + y) * 0.5 * S - z * S] as const;
const pt = (x: number, y: number, z: number) => iso(x, y, z).map((n) => n.toFixed(1)).join(' ');

function Box({ x, y, w, d, h, strong = false }: { x: number; y: number; w: number; d: number; h: number; strong?: boolean }) {
  const o = strong ? 1 : 0.7;
  return (
    <g strokeOpacity={o}>
      <path d={`M${pt(x, y, 0)}L${pt(x + w, y, 0)}L${pt(x + w, y + d, 0)}L${pt(x, y + d, 0)}Z`} strokeOpacity={0.35} />
      <path d={`M${pt(x, y, h)}L${pt(x + w, y, h)}L${pt(x + w, y + d, h)}L${pt(x, y + d, h)}Z`} />
      <path d={`M${pt(x, y, 0)}L${pt(x, y, h)}M${pt(x + w, y, 0)}L${pt(x + w, y, h)}M${pt(x + w, y + d, 0)}L${pt(x + w, y + d, h)}M${pt(x, y + d, 0)}L${pt(x, y + d, h)}`} />
      <path d={`M${pt(x + w, y, h)}L${pt(x + w, y + d, h)}L${pt(x + w, y + d, 0)}L${pt(x + w, y, 0)}Z`} className="fill-current" fillOpacity={0.07} stroke="none" />
    </g>
  );
}

function ArchitectureArtImpl() {
  const vp = [500, 238] as const;
  return (
    <ArtFrame viewBox={ARCH_VIEWBOX}
      caption={<ArtCaption className="left-[8%]">Fig. 06 · Massing study · Illustrative</ArtCaption>}>
      {/* one-point perspective floor */}
      {Array.from({ length: 13 }, (_, k) => (
        <path key={`r${k}`} d={`M${vp[0]} ${vp[1]}L${-120 + k * 100} 700`} className="stroke-ivory" strokeOpacity={0.12} />
      ))}
      {[0.12, 0.22, 0.34, 0.5, 0.7, 1].map((t) => (
        <path key={t} d={`M0 ${vp[1] + (700 - vp[1]) * t}H1000`} className="stroke-ivory" strokeOpacity={0.12} />
      ))}
      <path d={`M0 ${vp[1]}H1000`} className="stroke-ivory" strokeOpacity={0.3} strokeDasharray="10 5 2 5" />
      <Label x={14} y={vp[1] - 8} size={9} opacity={0.5}>HORIZON</Label>
      {/* massed blocks */}
      <Box x={-3} y={-1} w={4} d={3} h={6} strong />
      <Box x={1} y={-2} w={3} d={4} h={3.4} />
      <Box x={-6} y={1} w={3} d={3} h={2.4} />
      {/* structural frame on the tall block */}
      {[1, 2, 3, 4, 5].map((z) => (
        <path key={z} d={`M${pt(-3, -1, z)}L${pt(1, -1, z)}L${pt(1, 2, z)}`} strokeOpacity={0.3} />
      ))}
      {/* dimension line (height) */}
      <g className="stroke-champagne">
        <path d={`M${pt(1, 2, 0)}l34 0M${pt(1, 2, 6)}l34 0`} strokeOpacity={0.6} />
        <path d={`M${(iso(1, 2, 0)[0] + 28).toFixed(1)} ${iso(1, 2, 0)[1].toFixed(1)}V${iso(1, 2, 6)[1].toFixed(1)}`} />
        <path d={`M${(iso(1, 2, 0)[0] + 24).toFixed(1)} ${(iso(1, 2, 0)[1] - 8).toFixed(1)}l4 8l4 -8M${(iso(1, 2, 6)[0] + 24).toFixed(1)} ${(iso(1, 2, 6)[1] + 8).toFixed(1)}l4 -8l4 8`} />
      </g>
      <Label x={iso(1, 2, 3)[0] + 40} y={iso(1, 2, 3)[1] + 4} size={10} opacity={0.9} className="fill-champagne">H</Label>
      {/* section marks */}
      {[[130, 400, 'A'], [870, 330, 'A']].map(([x, y, t]) => (
        <g key={String(x)}>
          <circle cx={Number(x)} cy={Number(y)} r={13} />
          <Label x={Number(x)} y={Number(y) + 4} anchor="middle" size={11} opacity={1} className="fill-current">{String(t)}</Label>
        </g>
      ))}
      <path d="M130 400H870" className="stroke-ivory" strokeOpacity={0.25} strokeDasharray="14 5 2 5" />
      {/* north arrow */}
      <g transform="translate(900 120)">
        <circle r={20} className="stroke-ivory" strokeOpacity={0.5} />
        <path d="M0 -14L6 10L0 5L-6 10Z" className="fill-current" />
        <Label x={0} y={-28} anchor="middle" size={10}>N</Label>
      </g>
      {/* title block */}
      <g transform="translate(640 590)" className="stroke-ivory max-lg:hidden" strokeOpacity={0.55}>
        <rect width={340} height={84} />
        <path d="M0 28H340M0 56H340" />
      </g>
      <Label x={652} y={614} size={10} opacity={0.85}>SHEET A-06 · MASSING STUDY</Label>
      <Label x={652} y={642} size={10} opacity={0.6}>SCALE 1:100 (ILLUSTRATIVE)</Label>
      <Label x={652} y={670} size={10} opacity={0.6}>DRAWN FOR CAREERSCOMPUS</Label>
    </ArtFrame>
  );
}

export const ArchitectureArt = memo(ArchitectureArtImpl);
export const ArchitectureBackdrop = memo(ArchitectureBackdropImpl);
