'use client';

import { motion, useTransform } from 'framer-motion';
import { useJourney } from '../JourneyContext';
import { morphAt, range, rigLayout, smoothstep } from '../choreography';

/**
 * Nocturne Atlas night ground for the pinned stage:
 *   Midnight base → Deep Aubergine atmosphere emerging as the meridians open (Scene 2),
 *   a warm champagne key-light pool that follows the compass, and a fine film grain.
 *
 * Perf: every animated layer is composite-only (opacity/transform on promoted layers).
 * - the aubergine atmosphere is a static gradient cross-faded by opacity (animating
 *   background-color or gradient stops would repaint the whole stage each frame);
 * - the glow is promoted (will-change) so moving it never repaints the large gradient;
 * - grain is a plain alpha layer (no blend modes: measured cost over the live canvas).
 */
export function Ground() {
  const { progress, stageW, stageH } = useJourney();
  const m = useTransform(progress, morphAt);
  const atmos = useTransform(m, (v) => smoothstep(range(v, 0.2, 0.9)));

  const glowSize = useTransform([stageW, stageH], ([W, H]: number[]) => 2.1 * rigLayout(W, H, 0).gratPx);
  const glowX = useTransform([m, stageW, stageH, glowSize], ([mm, W, H, S]: number[]) => rigLayout(W, H, mm).cx - S / 2);
  const glowY = useTransform([m, stageW, stageH, glowSize], ([mm, W, H, S]: number[]) => rigLayout(W, H, mm).cy - S / 2);
  const glowOpacity = useTransform(m, (v) => 1 - 0.45 * smoothstep(v));

  return (
    <>
      <div className="absolute inset-0 bg-ink-950" aria-hidden="true" />
      <motion.div
        className="absolute inset-0 [will-change:opacity] bg-[radial-gradient(70%_80%_at_50%_57%,var(--color-aubergine-glow)_0%,var(--color-aubergine)_48%,color-mix(in_srgb,var(--color-aubergine)_22%,transparent)_100%)]"
        style={{ opacity: atmos }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute left-0 top-0 rounded-full pointer-events-none [will-change:transform,opacity] bg-[radial-gradient(closest-side,rgb(201_169_110/0.17)_0%,rgb(201_169_110/0.07)_48%,rgb(201_169_110/0)_100%)]"
        aria-hidden="true"
        style={{ width: glowSize, height: glowSize, x: glowX, y: glowY, opacity: glowOpacity }}
      />
      {/* bottom edge settles to the handoff colour so the stage never ends on a visible line */}
      <div className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-b from-transparent to-[var(--handoff-top)]" aria-hidden="true" />
      <div className="atlas-grain absolute inset-0 pointer-events-none" aria-hidden="true" />

    </>
  );
}
