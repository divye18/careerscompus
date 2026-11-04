'use client';

import { motion, useTransform } from 'framer-motion';
import { useJourney } from '../JourneyContext';
import { morphAt, rigLayout, smoothstep } from '../choreography';

const PAPER = '#F6F1E7';
const MIST = '#EEF0F7';

/**
 * Paper ground, a warm "dawn" glow that follows the compass, and a fine paper grain.
 * Perf: the grain is a plain alpha layer (a mix-blend layer over the live canvas measurably
 * dropped scroll frame rate on an integrated GPU).
 */
export function Ground() {
  const { progress, stageW, stageH } = useJourney();
  const m = useTransform(progress, morphAt);
  // Cross-fade two static grounds (opacity is composite-only; animating background-color repaints the stage)
  const mistOpacity = useTransform(m, (v) => smoothstep(v));

  const glowSize = useTransform([stageW, stageH], ([W, H]: number[]) => 2.1 * rigLayout(W, H, 0).gratPx);
  const glowX = useTransform([m, stageW, stageH, glowSize], ([mm, W, H, S]: number[]) => rigLayout(W, H, mm).cx - S / 2);
  const glowY = useTransform([m, stageW, stageH, glowSize], ([mm, W, H, S]: number[]) => rigLayout(W, H, mm).cy - S / 2);
  const glowOpacity = useTransform(m, (v) => 1 - 0.35 * smoothstep(v));

  return (
    <>
      <div className="absolute inset-0" style={{ backgroundColor: PAPER }} aria-hidden="true" />
      <motion.div
        className="absolute inset-0 [will-change:opacity]"
        style={{ backgroundColor: MIST, opacity: mistOpacity }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute left-0 top-0 rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          width: glowSize,
          height: glowSize,
          x: glowX,
          y: glowY,
          opacity: glowOpacity,
          background:
            'radial-gradient(closest-side, rgba(255,247,226,0.95) 0%, rgba(255,247,226,0.55) 45%, rgba(255,247,226,0) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] [will-change:transform]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </>
  );
}
