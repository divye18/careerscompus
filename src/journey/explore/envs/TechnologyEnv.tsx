import { memo } from 'react';
import { ArtCaption, ArtFrame, Label, Pulse } from './shared';

/**
 * TECHNOLOGY — a precision-engineered circuit environment.
 * Language: fine technical grid, a processor die with pinned edges, orthogonal traces with 45° bends,
 * vias, labelled blocks, a signal sweep that crosses the die once when the room first opens.
 */
export const TECH_VIEWBOX = '0 0 1000 700';

function TechnologyBackdropImpl() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in srgb, var(--hue) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--hue) 10%, transparent) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 46%, black 15%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 46%, black 15%, transparent 78%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, color-mix(in srgb, var(--hue) 5%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--hue) 5%, transparent) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
          maskImage: 'radial-gradient(ellipse 45% 45% at 50% 46%, black 10%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 45% 45% at 50% 46%, black 10%, transparent 80%)',
        }}
      />
    </div>
  );
}

const PINS = Array.from({ length: 12 }, (_, k) => k);

function TechnologyArtImpl() {
  return (
    <ArtFrame
      viewBox={TECH_VIEWBOX}
      caption={<ArtCaption>Fig. 01 · Processor die · Schematic</ArtCaption>}
      overlay={
        <>
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-y-[8%] left-0 w-[16%] opacity-0 group-data-[opened=true]/room:animate-[atlas-scan_3.6s_ease-in-out_0.25s_1_both]"
              style={{
                background: 'linear-gradient(to right, transparent, color-mix(in srgb, currentColor 11%, transparent) 50%, transparent)',
                maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)',
              }}
            />
          </div>
          <Pulse left={20.5} top={22} />
          <Pulse left={79.5} top={30} delay={0.9} />
          <Pulse left={34} top={89} delay={1.7} />
          <Pulse left={68} top={7.5} delay={2.3} />
        </>
      }
    >
      {/* die */}
      <rect x={320} y={170} width={360} height={360} rx={8} className="stroke-current" />
      <rect x={350} y={200} width={300} height={300} rx={4} className="stroke-ivory" strokeOpacity={0.22} />
      {/* core blocks */}
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}${c}`}
            x={378 + c * 88}
            y={228 + r * 88}
            width={72}
            height={72}
            rx={3}
            className={r === 1 && c === 1 ? 'fill-current' : 'stroke-ivory'}
            fillOpacity={r === 1 && c === 1 ? 0.18 : 0}
            strokeOpacity={r === 1 && c === 1 ? 0.9 : 0.35}
          />
        ))
      )}
      <rect x={466} y={316} width={68} height={68} rx={3} className="stroke-current" />
      {/* pins + traces on all four sides */}
      {PINS.map((k) => {
        const p = 338 + k * 28;
        const dx = (k - 5.5) * 12;
        const yEnd = 44 + ((k * 37) % 70);
        return (
          <g key={`t${k}`}>
            <path d={`M${p} 170V148`} />
            <path d={`M${p} 148V${yEnd + 60}L${p + dx} ${yEnd + 30}V${yEnd}`} strokeOpacity={0.62} />
            <circle cx={p + dx} cy={yEnd} r={3.5} className="fill-current" stroke="none" />
            <path d={`M${p} 530V552`} />
            <path d={`M${p} 552V${640 - yEnd + 20}L${p - dx} ${640 - yEnd + 50}V${660 - (yEnd % 40)}`} strokeOpacity={0.62} />
            <circle cx={p - dx} cy={660 - (yEnd % 40)} r={3.5} className="fill-current" stroke="none" />
          </g>
        );
      })}
      {PINS.map((k) => {
        const p = 188 + k * 28;
        const dy = (k - 5.5) * 10;
        const xEnd = 30 + ((k * 53) % 90);
        return (
          <g key={`s${k}`}>
            <path d={`M320 ${p}H300`} />
            <path d={`M300 ${p}H${xEnd + 120}L${xEnd + 80} ${p + dy}H${xEnd}`} strokeOpacity={0.62} />
            <circle cx={xEnd} cy={p + dy} r={3.5} className="fill-current" stroke="none" />
            <path d={`M680 ${p}H700`} />
            <path d={`M700 ${p}H${880 - xEnd}L${920 - xEnd} ${p - dy}H${970 - (xEnd % 50)}`} strokeOpacity={0.62} />
            <circle cx={970 - (xEnd % 50)} cy={p - dy} r={3.5} className="fill-current" stroke="none" />
          </g>
        );
      })}
      {/* labels with leaders */}
      <path d="M426 264H400" className="stroke-ivory" strokeOpacity={0.35} />
      <Label x={396} y={268} anchor="end" size={10}>CORE 0·3</Label>
      <Label x={500} y={160} anchor="middle" size={10}>DIE · SCHEMATIC</Label>
      <Label x={500} y={598} anchor="middle" size={10} opacity={0.5}>BUS · I/O · CACHE</Label>
    </ArtFrame>
  );
}

export const TechnologyArt = memo(TechnologyArtImpl);
export const TechnologyBackdrop = memo(TechnologyBackdropImpl);
