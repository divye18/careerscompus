'use client';

import { useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import { DomainGlyph } from '../DomainGlyph';
import { useJourney } from '../JourneyContext';
import { deg2rad, easeOut, finalAngle, markIn, markPosition } from '../choreography';

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
  active,
  onHover,
  onSelect,
}: {
  i: number;
  active: boolean;
  onHover: (i: number | null) => void;
  onSelect: (i: number) => void;
}) {
  const { progress, stageW, stageH, hover } = useJourney();
  const d = DOMAINS[i];
  const x = useTransform([stageW, stageH], ([W, H]: number[]) => markPosition(i, W, H).x);
  const y = useTransform([stageW, stageH], ([W, H]: number[]) => markPosition(i, W, H).y);
  const vis = useTransform(progress, (p) => markIn(i, p));
  const scale = useTransform(vis, (v) => 0.72 + 0.28 * easeOut(v));
  const pe = useTransform(vis, (v) => (v > 0.6 ? 'auto' : 'none'));
  const side = sideFor(i);

  const enter = () => {
    hover.set(i);
    onHover(i);
  };
  const leave = () => {
    hover.set(-1);
    onHover(null);
  };

  return (
    <motion.div
      className="absolute left-0 top-0 w-0 h-0"
      style={{ x, y, opacity: vis, scale, pointerEvents: pe }}
    >
      <button
        type="button"
        aria-label={`${d.name}: ${d.blurb}`}
        aria-pressed={active}
        onPointerEnter={enter}
        onPointerLeave={leave}
        onFocus={enter}
        onBlur={leave}
        onClick={() => onSelect(i)}
        className="group absolute -left-[22px] -top-[22px] h-11 w-11 rounded-full outline-none"
      >
        <span
          className="absolute inset-0 rounded-full border bg-white/95 shadow-[0_6px_18px_rgba(17,20,46,0.12)] transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-offset-2"
          style={{ borderColor: d.hue, color: d.hue, ['--tw-ring-color' as string]: d.hue }}
        />
        <span className="absolute inset-0 flex items-center justify-center" style={{ color: d.hue }}>
          <DomainGlyph id={d.id} size={21} />
        </span>
        <span
          aria-hidden="true"
          className="absolute -inset-1 rounded-full border opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 animate-[atlas-ping_2.4s_ease-out_infinite]"
          style={{ borderColor: d.hue }}
        />
      </button>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute whitespace-nowrap ${LABEL_POS[side]}`}
      >
        <span className="block text-[10px] font-semibold tracking-[0.2em] text-[var(--color-royal-deep)]/55">
          0{i + 1}
        </span>
        <span
          className="block font-atlas text-[clamp(19px,1.7vw,24px)] leading-none transition-colors"
          style={{ color: active ? d.hue : 'var(--color-accent-midnight)' }}
        >
          {d.name}
        </span>
      </span>
    </motion.div>
  );
}

/** Scene 2 interactive layer: seven domain marks and a small description panel. */
export function DomainMarks() {
  const { progress } = useJourney();
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const shown = hovered ?? selected;
  const panelVis = useTransform(progress, (p) => markIn(DOMAINS.length - 1, p));
  const panelPe = useTransform(panelVis, (v) => (v > 0.6 ? 'auto' : 'none'));

  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {DOMAINS.map((_, i) => (
          <Mark
            key={i}
            i={i}
            active={shown === i}
            onHover={setHovered}
            onSelect={(n) => setSelected((s) => (s === n ? null : n))}
          />
        ))}
      </div>

      <motion.div
        className="absolute left-[clamp(24px,5vw,80px)] bottom-[clamp(24px,5.5vh,56px)] w-[min(340px,30vw)]"
        style={{ opacity: panelVis, pointerEvents: panelPe }}
        aria-live="polite"
      >
        {shown !== null ? (
          <div>
            <p className="font-atlas text-[28px] leading-none" style={{ color: DOMAINS[shown].hue }}>
              {DOMAINS[shown].name}
            </p>
            <p className="mt-2 text-[15px] leading-snug text-[var(--color-royal-deep)]/85">{DOMAINS[shown].blurb}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--color-royal-deep)]/55">
              Full pages for each direction are coming soon
            </p>
          </div>
        ) : (
          <p className="text-[13px] leading-snug text-[var(--color-royal-deep)]/70">
            Hover or select a direction to read a short description.
          </p>
        )}
      </motion.div>
    </>
  );
}
