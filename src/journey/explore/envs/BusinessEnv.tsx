import { memo } from 'react';
import { ArtFrame, Label } from './shared';

/**
 * BUSINESS & MANAGEMENT — an editorial strategy plate.
 * Language: abstract market movement, a rising line with branching scenarios (A / B / C), layered
 * information plates, a quiet bar rhythm. Authoritative, structured, illustrative (no real data).
 */
export const BUSINESS_VIEWBOX = '0 0 1400 440';

function BusinessBackdropImpl() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(to bottom, color-mix(in srgb, var(--hue) 9%, transparent) 1px, transparent 1px)',
          backgroundSize: '100% 64px',
          maskImage: 'linear-gradient(to bottom, transparent 18%, black 60%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 18%, black 60%, black 92%, transparent)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[58%]"
        style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--hue) 16%, transparent), transparent 80%)' }}
      />
    </div>
  );
}

const LINE = 'M40 360 L140 330 L220 346 L320 280 L400 296 L500 226 L590 244 L690 176 L780 196 L880 136 L960 150';
const BARS = [64, 92, 78, 120, 104, 150, 132, 176, 160, 206, 188, 232];

function BusinessArtImpl() {
  return (
    <ArtFrame viewBox={BUSINESS_VIEWBOX}>
      {/* layered information plates */}
      <rect x={70} y={44} width={860} height={330} rx={4} className="stroke-ivory" strokeOpacity={0.07} />
      <rect x={52} y={62} width={860} height={330} rx={4} className="stroke-ivory" strokeOpacity={0.11} />
      <rect x={34} y={80} width={860} height={330} rx={4} className="stroke-ivory" strokeOpacity={0.2} />
      {/* axes */}
      <path d="M40 90V380H900" className="stroke-ivory" strokeOpacity={0.5} />
      {[1, 2, 3].map((k) => (
        <path key={k} d={`M40 ${380 - k * 72}H900`} className="stroke-ivory" strokeOpacity={0.1} strokeDasharray="3 7" />
      ))}
      {/* bars (volume) */}
      {BARS.map((h, i) => (
        <rect key={i} x={70 + i * 70} y={380 - h * 0.62} width={30} height={h * 0.62} className="fill-current" fillOpacity={i % 3 === 0 ? 0.32 : 0.14} stroke="none" />
      ))}
      {/* market line + area */}
      <path d={`${LINE} L960 380 L40 380 Z`} className="fill-current" fillOpacity={0.12} stroke="none" />
      <path d={LINE} strokeWidth={2.4} />
      {[[500, 226], [690, 176], [880, 136]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r={5} className="fill-current stroke-ink-950" strokeWidth={2} />
      ))}
      {/* strategic pathways: three scenarios branch from the decision node */}
      <circle cx={960} cy={150} r={7} className="fill-ink-950 stroke-champagne" strokeWidth={2} />
      <path d="M960 150 C1060 150 1090 100 1200 92" className="stroke-champagne" strokeDasharray="5 6" />
      <path d="M960 150 C1060 150 1110 160 1220 168" className="stroke-champagne" strokeDasharray="5 6" />
      <path d="M960 150 C1060 150 1090 240 1190 262" className="stroke-champagne" strokeDasharray="5 6" />
      {[[1200, 92, 'A'], [1220, 168, 'B'], [1190, 262, 'C']].map(([x, y, t]) => (
        <g key={String(t)}>
          <circle cx={Number(x)} cy={Number(y)} r={5} className="fill-champagne" stroke="none" />
          <Label x={Number(x) + 14} y={Number(y) + 4} size={13} opacity={0.95} className="fill-champagne">{String(t)}</Label>
        </g>
      ))}
      <Label x={40} y={420} size={10} opacity={0.55}>FIG. 03 — SCENARIOS (ILLUSTRATIVE, NOT DATA)</Label>
      <Label x={1360} y={420} anchor="end" size={10} opacity={0.55}>DECISION · RISK · RETURN</Label>
    </ArtFrame>
  );
}

export const BusinessArt = memo(BusinessArtImpl);
export const BusinessBackdrop = memo(BusinessBackdropImpl);
