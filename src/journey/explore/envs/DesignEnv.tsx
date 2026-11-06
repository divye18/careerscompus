import { memo } from 'react';
import { mono } from './shared';

/**
 * DESIGN & CREATIVITY — the most expressive room: a creative studio table.
 * Language: oversized serif specimen ("Aa"), overlapping geometric shapes, a colour study, a bézier with
 * handles, editorial rotation. Built from DOM/CSS shapes (compositor-friendly), not SVG strokes.
 */
export const DESIGN_RATIO = '10 / 7';

function DesignBackdropImpl() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute -right-[6%] top-[8%] h-[70%] w-[46%] rotate-[-6deg]"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--hue) 20%, transparent), transparent 70%)' }}
      />
    </div>
  );
}

const SWATCHES = ['bg-domain-design', 'bg-champagne', 'bg-ivory', 'bg-silver', 'bg-domain-technology'];

function DesignArtImpl() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ containerType: 'inline-size', color: 'var(--hue)' }}>
      {/* geometric composition */}
      <span
        aria-hidden="true"
        className="absolute rounded-full bg-current"
        style={{ left: '8%', top: '8%', width: '46%', aspectRatio: '1', opacity: 0.92 }}
      />
      <span aria-hidden="true" className="absolute bg-champagne" style={{ left: '46%', top: '30%', width: '34%', aspectRatio: '1', borderTopLeftRadius: '100%', opacity: 0.95 }} />
      <span
        aria-hidden="true"
        className="absolute rotate-[18deg] border border-ivory/60 group-data-[opened=true]/room:animate-[atlas-turn-in_2.2s_ease-out_1]"
        style={{ left: '56%', top: '2%', width: '34%', aspectRatio: '1' }}
      />
      <span aria-hidden="true" className="absolute bg-silver/90" style={{ left: '4%', top: '58%', width: '22%', aspectRatio: '1', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
      <span aria-hidden="true" className="absolute rounded-full border border-champagne/70" style={{ left: '62%', top: '58%', width: '22%', aspectRatio: '1' }} />
      {/* type specimen */}
      <span
        aria-hidden="true"
        className="font-atlas absolute italic text-ivory"
        style={{ left: '20%', top: '6%', fontSize: '46cqw', lineHeight: 1, transform: 'rotate(-8deg)', letterSpacing: '-0.04em' }}
      >
        Aa
      </span>
      {/* bézier with handles */}
      <svg viewBox="0 0 400 140" className="absolute left-[34%] top-[64%] w-[40%]" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
        <path d="M10 120 C110 120 120 14 210 14 S330 120 390 120" className="stroke-ivory" />
        <path d="M10 120L60 80M390 120L340 60M210 14H260" strokeOpacity={0.5} strokeDasharray="3 4" />
        {[[10, 120], [210, 14], [390, 120]].map(([x, y]) => (
          <rect key={x} x={x - 5} y={y - 5} width={10} height={10} className="fill-ink-950 stroke-champagne" />
        ))}
        {[[60, 80], [340, 60], [260, 14]].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r={4} className="fill-current" stroke="none" />
        ))}
      </svg>
      {/* colour study */}
      <div className="absolute bottom-[1%] left-[8%] flex items-center gap-[1.2cqw]" aria-hidden="true">
        {SWATCHES.map((c, i) => (
          <div key={c} className="flex flex-col items-center gap-[0.8cqw]">
            <span className={`${c} block rounded-full`} style={{ width: '4.2cqw', height: '4.2cqw' }} />
            <span className="text-ivory/60" style={{ ...mono, fontSize: 'max(11px, 1.3cqw)', letterSpacing: '0.1em' }}>
              0{i + 1}
            </span>
          </div>
        ))}
      </div>
      <span className="absolute bottom-[1%] right-[4%] text-ivory/80 max-lg:hidden" style={{ ...mono, fontSize: 'max(11px, 1.3cqw)', letterSpacing: '0.12em' }} aria-hidden="true">
        STUDY · FORM · COLOUR · TYPE
      </span>
    </div>
  );
}

export const DesignArt = memo(DesignArtImpl);
export const DesignBackdrop = memo(DesignBackdropImpl);
