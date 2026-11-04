'use client';

import { useRef, createContext, useContext } from 'react';
import { useScroll, useTransform, MotionValue } from 'framer-motion';

/**
 * ScrollJourney — The backbone of the cinematic homepage.
 * 
 * Maps a single scroll container into 7 normalized "acts":
 *   Act 1: ARRIVAL (Hero / Moon)         0.00 – 0.15
 *   Act 2: DISCOVERY (Stars → Nodes)     0.15 – 0.30
 *   Act 3: CAREERS (Career Orbit)        0.30 – 0.45
 *   Act 4: COURSES (Knowledge Archive)   0.45 – 0.60
 *   Act 5: UNIVERSITIES (Horizon)        0.60 – 0.75
 *   Act 6: COMPARISON (Decision Paths)   0.75 – 0.85
 *   Act 7: GUIDANCE + FUTURE             0.85 – 1.00
 * 
 * Each section can read its own normalized progress (0→1 within its act)
 * from this context. The 3D environment also reads the global progress.
 */

interface JourneyContextType {
  globalProgress: MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const JourneyContext = createContext<JourneyContextType | null>(null);

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used within ScrollJourney');
  return ctx;
}

/**
 * Returns a MotionValue that maps a sub-range of globalProgress to 0→1.
 */
export function useActProgress(start: number, end: number) {
  const { globalProgress } = useJourney();
  return useTransform(globalProgress, [start, end], [0, 1], { clamp: true });
}

export function ScrollJourney({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  return (
    <JourneyContext.Provider value={{ globalProgress: scrollYProgress, containerRef }}>
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </JourneyContext.Provider>
  );
}

/**
 * JourneySection — Wraps each act's content.
 * Controls its own background transition based on the act's visual mode.
 */
interface JourneySectionProps {
  children: React.ReactNode;
  mode: 'dark' | 'light' | 'transition-to-light' | 'transition-to-dark';
  className?: string;
  id?: string;
}

export function JourneySection({ children, className = '', id }: JourneySectionProps) {
  // The persistent Scroll3DScene layer handles the actual background colors and transitions.
  // We just ensure pointer events are managed correctly.
  return (
    <div id={id} className={`relative z-10 pointer-events-none scroll-mt-16 ${className}`}>
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
