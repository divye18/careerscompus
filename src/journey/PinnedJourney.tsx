'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { JourneyProvider } from './JourneyContext';
import { Ground } from './layers/Ground';
import { Graticule } from './layers/Graticule';
import { ArrivalCopy } from './layers/ArrivalCopy';
import { DiscoverCopy } from './layers/DiscoverCopy';
import { DomainMarks } from './layers/DomainMarks';
import { DirectionRail } from './layers/DirectionRail';
import { PINNED, PINNED_SCROLL_VH, arrivalTextOut, range } from './choreography';

// 3D is lazy: three/r3f/drei are only downloaded on the "full" tier, after the hero HTML is on screen.
const WorldCanvas = dynamic(() => import('./world/WorldCanvas'), { ssr: false });

/**
 * Desktop presenter: a CSS-sticky 100svh stage inside a tall container.
 * Native scrolling drives `progress`; nothing intercepts wheel/touch events.
 */
export function PinnedJourney({ onWorldFail }: { onWorldFail?: () => void }) {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  // A light spring takes the edge off wheel steps (~150 ms lag) without decoupling from scroll.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.6, restDelta: 0.0004 });

  const exit = useTransform(progress, arrivalTextOut);
  const cue = useTransform(progress, (p) => 1 - range(p, PINNED.cueOut[0], PINNED.cueOut[1]));

  return (
    <section
      ref={containerRef}
      id="act-hero"
      aria-label="Introduction and career directions"
      className="relative"
      style={{ height: `${100 + PINNED_SCROLL_VH}svh` }}
      data-journey="pinned"
      data-header-theme="night"
    >
      <div ref={stageRef} className="sticky top-0 h-dvh min-h-[600px] overflow-hidden">
        <JourneyProvider progress={progress} stageRef={stageRef}>
          <Ground />
          <Graticule />
          <WorldCanvas onFail={onWorldFail} />

          {/* Scene 1 copy */}
          <div className="absolute inset-y-0 left-0 w-[54%] flex items-center pl-[clamp(24px,5vw,80px)] pr-4 pt-14 pointer-events-none">
            <ArrivalCopy exit={exit} />
          </div>

          {/* Scroll cue */}
          <motion.div
            className="absolute left-[clamp(24px,5vw,80px)] bottom-7 flex items-center gap-3 pointer-events-none [@media(max-height:860px)]:hidden"
            style={{ opacity: cue }}
            aria-hidden="true"
          >
            <span className="block h-9 w-px origin-top bg-silver/60 animate-[atlas-cue_1.8s_ease-in-out_infinite]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-silver">
              Scroll
            </span>
          </motion.div>

          {/* Scene 2 */}
          <DiscoverCopy />
          <DomainMarks />
          <DirectionRail />
        </JourneyProvider>
      </div>

      {/* Hash targets inside the pinned range, so anchors, the rail and header links all land correctly */}
      <span
        id="act-discovery"
        aria-hidden="true"
        className="absolute left-0 h-px w-px"
        style={{ top: `calc((100% - 100svh) * ${PINNED.sceneStart.discover})` }}
      />
    </section>
  );
}
