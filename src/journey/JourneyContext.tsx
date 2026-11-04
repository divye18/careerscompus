'use client';

import { createContext, useContext, useEffect, useMemo, type ReactNode, type RefObject } from 'react';
import { useMotionValue, type MotionValue } from 'framer-motion';

/**
 * Shared, render-free state for a journey stage.
 * Everything is a MotionValue, so scroll-driven updates never re-render React.
 *
 *  progress — 0..1 scene progress (pinned: smoothed scroll progress; flow: section progress)
 *  stageW/H — measured stage size in CSS px
 *  hover    — index of the domain currently emphasised (-1 = none), read by the 3D rig
 */
export interface JourneyContextValue {
  progress: MotionValue<number>;
  stageW: MotionValue<number>;
  stageH: MotionValue<number>;
  hover: MotionValue<number>;
}

const Ctx = createContext<JourneyContextValue | null>(null);

export function useJourney(): JourneyContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useJourney must be used inside <JourneyProvider>');
  return v;
}

export function JourneyProvider({
  progress,
  stageRef,
  children,
}: {
  progress: MotionValue<number>;
  stageRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const stageW = useMotionValue(0);
  const stageH = useMotionValue(0);
  const hover = useMotionValue(-1);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      stageW.set(el.clientWidth);
      stageH.set(el.clientHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stageRef, stageW, stageH]);

  const value = useMemo(() => ({ progress, stageW, stageH, hover }), [progress, stageW, stageH, hover]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
