'use client';

import { useState } from 'react';
import { useCapability } from '@/lib/capability';
import { PinnedJourney } from './PinnedJourney';
import { FlowJourney } from './FlowJourney';

/**
 * Chooses a presenter from detected capability:
 *   full → PinnedJourney (sticky stage + lazy WebGL compass)
 *   flow → FlowJourney   (natural scroll, SVG compass) — phones, reduced motion, no WebGL, low power, SSR
 * If the WebGL context is lost at runtime we drop to the flow presenter rather than leave a dead stage.
 */
export function Journey() {
  const cap = useCapability();
  const [worldFailed, setWorldFailed] = useState(false);

  if (cap.tier === 'full' && !worldFailed) {
    return <PinnedJourney onWorldFail={() => setWorldFailed(true)} />;
  }
  return <FlowJourney reducedMotion={cap.reducedMotion} reason={worldFailed ? 'webgl-lost' : cap.reason} />;
}
