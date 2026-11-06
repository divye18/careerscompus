import { memo } from 'react';
import { ArtCaption, ArtFrame, Label } from './shared';

/**
 * LAW & PUBLIC POLICY — institutions, justice and governance.
 * Language: strict mirror symmetry, a classical elevation (pediment, entablature, fluted columns, steps),
 * a small balance in the pediment, document layers with ruled lines and numbered clauses. Calm and formal.
 */
export const LAW_VIEWBOX = '0 0 1000 700';

function LawBackdropImpl() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to right, color-mix(in srgb, var(--hue) 12%, transparent) 1px, transparent 1px)',
          backgroundSize: '96px 100%',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 80%, transparent)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-[60%]" style={{ background: 'radial-gradient(50% 80% at 50% 0%, color-mix(in srgb, var(--hue) 22%, transparent), transparent 75%)' }} />
    </div>
  );
}

const COLS = [0, 1, 2, 3, 4, 5];

function LawArtImpl() {
  return (
    <ArtFrame viewBox={LAW_VIEWBOX}
      caption={<ArtCaption>Fig. 05 · Institutions · Illustrative</ArtCaption>}>
      {/* document layers behind the façade (mirrored) */}
      {[-1, 0, 1].map((k) => (
        <g key={k} transform={`rotate(${k * 2.2} 500 340)`}>
          <rect x={150 + (k + 1) * 6} y={110 + (k + 1) * 8} width={700 - (k + 1) * 12} height={430} rx={3} className="stroke-ivory" strokeOpacity={0.08 + (k + 1) * 0.05} />
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} className="stroke-ivory" strokeOpacity={0.1}>
          <path d={`M190 ${270 + i * 36}H320`} />
          <path d={`M680 ${270 + i * 36}H810`} />
        </g>
      ))}
      <Label x={190} y={252} size={10} opacity={0.55}>§ 1 · RIGHTS</Label>
      <Label x={810} y={252} anchor="end" size={10} opacity={0.55}>§ 2 · DUTIES</Label>
      {/* pediment */}
      <path d="M170 196L500 66L830 196Z" strokeWidth={1.8} />
      <path d="M214 184L500 80L786 184" strokeOpacity={0.35} />
      {/* balance in the pediment */}
      <path d="M500 112V176" className="stroke-champagne" />
      <path d="M440 128H560" className="stroke-champagne" />
      <path d="M452 128V148M548 128V148" className="stroke-champagne" strokeOpacity={0.7} />
      <path d="M430 150Q452 166 474 150ZM526 150Q548 166 570 150Z" className="stroke-champagne" />
      <circle cx={500} cy={112} r={4} className="fill-champagne" stroke="none" />
      {/* entablature */}
      <rect x={160} y={196} width={680} height={38} className="stroke-current" />
      <path d="M160 214H840" strokeOpacity={0.35} />
      {/* columns (symmetric about x = 500) */}
      {COLS.map((c) => {
        const x = 192 + c * 120.8;
        return (
          <g key={c}>
            <rect x={x} y={234} width={52} height={284} className="stroke-current" />
            {[14, 26, 38].map((d) => (
              <path key={d} d={`M${x + d} 240V512`} className="stroke-ivory" strokeOpacity={0.22} />
            ))}
            <rect x={x - 6} y={226} width={64} height={10} className="stroke-ivory" strokeOpacity={0.5} />
            <rect x={x - 6} y={516} width={64} height={10} className="stroke-ivory" strokeOpacity={0.5} />
          </g>
        );
      })}
      {/* steps */}
      <rect x={150} y={526} width={700} height={22} className="stroke-current" />
      <rect x={120} y={548} width={760} height={22} className="stroke-current" strokeOpacity={0.8} />
      <rect x={90} y={570} width={820} height={22} className="stroke-current" strokeOpacity={0.6} />
      {/* axis of symmetry */}
      <path d="M500 40V620" className="stroke-ivory" strokeOpacity={0.18} strokeDasharray="2 8" />
    </ArtFrame>
  );
}

export const LawArt = memo(LawArtImpl);
export const LawBackdrop = memo(LawBackdropImpl);
