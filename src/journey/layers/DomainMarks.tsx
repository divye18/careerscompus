'use client';

import { useEffect, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import { DomainGlyph } from '../DomainGlyph';
import { useJourney } from '../JourneyContext';
import { deg2rad, easeOut, finalAngle, markIn, markPosition } from '../choreography';
import { goTo } from '../scroll';

type Side = 'right' | 'left' | 'below';
function sideFor(i: number): Side {
  const c = Math.cos(deg2rad(finalAngle(i)));
  return c > 0.25 ? 'right' : c < -0.25 ? 'left' : 'below';
}

const LABEL_POS: Record<Side, string> = {
  right: 'left-[30px] top-1/2 -translate-y-1/2 text-left',
  left: 'right-[30px] top-1/2 -translate-y-1/2 text-right',
  below: 'top-[30px] left-1/2 -translate-x-1/2 text-center',
};

function Mark({
  i,
  isSelected,
  onHover,
  onSelect,
}: {
  i: number;
  isSelected: boolean;
  onHover: (i: number | null) => void;
  onSelect: (i: number) => void;
}) {
  const { progress, stageW, stageH } = useJourney();
  const d = DOMAINS[i];
  const x = useTransform([stageW, stageH], ([W, H]: number[]) => markPosition(i, W, H).x);
  const y = useTransform([stageW, stageH], ([W, H]: number[]) => markPosition(i, W, H).y);
  const vis = useTransform(progress, (p) => markIn(i, p));
  const scale = useTransform(vis, (v) => 0.45 + 0.55 * easeOut(v)); // grows out of the bead
  const pe = useTransform(vis, (v) => (v > 0.6 ? 'auto' : 'none'));
  const hidden = useTransform(vis, (v) => (v > 0.01 ? 'visible' : 'hidden'));
  const side = sideFor(i);

  return (
    <motion.div
      className="absolute left-0 top-0 w-0 h-0 [will-change:transform,opacity]"
      style={{ x, y, opacity: vis, scale, pointerEvents: pe, visibility: hidden }}
    >
      <button
        type="button"
        aria-label={`${d.name}: ${d.blurb}`}
        aria-pressed={isSelected}
        onPointerEnter={() => onHover(i)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(i)}
        onBlur={() => onHover(null)}
        onClick={() => onSelect(i)}
        className="group absolute -left-[22px] -top-[22px] h-11 w-11 rounded-full outline-none"
      >
        {/* Domain hue identifies; cyan (ring) marks the selected domain and keyboard focus. */}
        <span
          className={`absolute inset-0 rounded-full border bg-ink-900 shadow-[0_8px_24px_rgb(0_0_0/0.45)] transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-cyan group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-aubergine ${
            isSelected ? 'ring-2 ring-cyan ring-offset-2 ring-offset-aubergine' : ''
          }`}
          style={{ borderColor: d.hue }}
        />
        <span className="absolute inset-0 flex items-center justify-center" style={{ color: d.hue }}>
          <DomainGlyph id={d.id} size={21} />
        </span>
        <span
          aria-hidden="true"
          className="absolute -inset-1 rounded-full border opacity-0 group-hover:opacity-100 group-hover:animate-[atlas-ping_1.2s_ease-out_1_forwards] group-focus-visible:opacity-100 group-focus-visible:animate-[atlas-ping_1.2s_ease-out_1_forwards] transition-opacity duration-300"
          style={{ borderColor: d.hue }}
        />
      </button>
      <span aria-hidden="true" className={`pointer-events-none absolute whitespace-nowrap ${LABEL_POS[side]}`}>
        <span className="block font-mono text-[11px] tracking-[0.18em] text-silver">0{i + 1}</span>
        <span className="block font-atlas text-[clamp(20px,1.8vw,26px)] leading-none text-ivory">{d.name}</span>
      </span>
    </motion.div>
  );
}

/** Scene 2 interactive layer: seven domain marks and a small description panel. */
export function DomainMarks() {
  const { progress, hover, selected: selectedMV } = useJourney();
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const shown = hovered ?? selected;
  const panelVis = useTransform(progress, (p) => markIn(DOMAINS.length - 1, p));
  const panelPe = useTransform(panelVis, (v) => (v > 0.6 ? 'auto' : 'none'));

  // Tell the 3D rig (no React in the render loop): hover emphasises, selection also turns cyan.
  useEffect(() => hover.set(shown ?? -1), [shown, hover]);
  useEffect(() => selectedMV.set(selected ?? -1), [selected, selectedMV]);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {DOMAINS.map((_, i) => (
          <Mark
            key={i}
            i={i}
            isSelected={selected === i}
            onHover={setHovered}
            onSelect={(n) => {
              setSelected(n);
              goTo(`explore-${DOMAINS[n].id}`);
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute left-[clamp(24px,5vw,80px)] bottom-[clamp(24px,5.5vh,56px)] w-[min(320px,27vw)] [will-change:opacity]"
        style={{ opacity: panelVis, pointerEvents: panelPe }}
        aria-live="polite"
      >
        {shown !== null ? (
          <div>
            <p className="font-atlas text-[28px] leading-none" style={{ color: DOMAINS[shown].hue }}>
              {DOMAINS[shown].name}
            </p>
            <p className="mt-2 text-[15px] leading-snug text-ivory/85">{DOMAINS[shown].blurb}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-silver">Select to step inside</p>
          </div>
        ) : (
          <p className="text-[13px] leading-snug text-silver">Hover to preview a direction. Select one to step inside.</p>
        )}
      </motion.div>
    </>
  );
}
