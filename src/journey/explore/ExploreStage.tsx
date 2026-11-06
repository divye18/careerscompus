'use client';

import { memo, useState, type CSSProperties } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import { useJourney } from '../JourneyContext';
import { PINNED_SCROLL_VH, activeDomain, domainWeight, exploreC, range, smoothstep, vhOf } from '../choreography';
import { ENVS } from './registry';
import { RoomDetail, RoomHead } from './ContentBlocks';

const hueStyle = (hue: string) => ({ '--hue': hue }) as CSSProperties;

/**
 * Room BACKDROPS: sit below the graticule and the 3D compass. Each room is a tinted ground plus its own
 * CSS backdrop. Visibility toggles to `hidden` when a room is out so it is never painted.
 */
export function ExploreBackdrops() {
  const { progress } = useJourney();
  return (
    <>
      {DOMAINS.map((d, i) => (
        <BackdropRoom key={d.id} i={i} hue={d.hue} progressSource={progress} id={d.id} />
      ))}
    </>
  );
}

const BackdropRoom = memo(function BackdropRoom({ i, hue, id, progressSource }: { i: number; hue: string; id: (typeof DOMAINS)[number]['id']; progressSource: ReturnType<typeof useJourney>['progress'] }) {
  const w = useTransform(progressSource, (p) => domainWeight(i, p));
  // parallax only while the room is on screen; hidden rooms keep a constant value → no style writes
  const x = useTransform(progressSource, (p) => (domainWeight(i, p) > 0.001 ? (exploreC(p) - i) * -16 : 0));
  const { Backdrop } = ENVS[id];
  return (
    <motion.div
      aria-hidden="true"
      data-room-bg={id}
      className="pointer-events-none absolute inset-0 [will-change:opacity]"
      style={{ ...hueStyle(hue), opacity: w }}
    >
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--hue)_10%,var(--color-ink-950))]" />
      <motion.div className="absolute inset-y-0 -inset-x-[3%] [will-change:transform]" style={{ x }}>
        <Backdrop />
      </motion.div>
    </motion.div>
  );
});

/**
 * End of the journey: the last room's ground settles to the shared handoff colour (bottom third) so the
 * pinned stage meets the dawn handoff without a seam. Opacity-only; invisible until the final 30 vh.
 */
export function StageEndFade() {
  const { progress } = useJourney();
  const o = useTransform(progress, (p) => smoothstep(range(vhOf(p), PINNED_SCROLL_VH - 34, PINNED_SCROLL_VH)));
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-transparent to-[var(--handoff-top)] [will-change:opacity]"
      style={{ opacity: o }}
    />
  );
}

/** Room CONTENT: artwork + text, above the compass layer. Only the active room is interactive. */
export function ExploreContent() {
  const { progress } = useJourney();
  const [active, setActive] = useState(-1); // index of the active room (-1 before Explore)
  const [opened, setOpened] = useState(0); // bitmask of rooms opened at least once on this page view
  // React state changes only when the room changes, never per frame.
  useMotionValueEvent(progress, 'change', (p) => {
    const n = activeDomain(p);
    setActive((a) => (a === n ? a : n));
    if (n >= 0) setOpened((o) => o | (1 << n));
  });
  return (
    <>
      {DOMAINS.map((d, i) => (
        <ContentRoom key={d.id} i={i} isActive={active === i} isOpened={Boolean(opened & (1 << i))} />
      ))}
    </>
  );
}

const ContentRoom = memo(function ContentRoom({ i, isActive, isOpened }: { i: number; isActive: boolean; isOpened: boolean }) {
  const { progress } = useJourney();
  const d = DOMAINS[i];
  const spec = ENVS[d.id];
  const w = useTransform(progress, (p) => domainWeight(i, p));
  const artX = useTransform(progress, (p) => (domainWeight(i, p) > 0.001 ? (exploreC(p) - i) * -spec.depth : 0));
  const textY = useTransform(w, (v) => (1 - v) * 26);
  const pe = useTransform(w, (v) => (v > 0.6 ? 'auto' : 'none'));
  const { Art } = spec;

  return (
    <motion.section
      aria-label={`${d.longName}`}
      aria-hidden={!isActive}
      inert={!isActive}
      className="group/room pointer-events-none absolute inset-0 [will-change:opacity]"
      style={{ ...hueStyle(d.hue), opacity: w }}
      data-room={d.id}
      data-active={isActive ? 'true' : 'false'}
      data-opened={isOpened ? 'true' : 'false'}
    >
      <motion.div aria-hidden="true" className={`absolute [will-change:transform] ${spec.art}`} style={{ x: artX, aspectRatio: spec.ratio }}>
        <Art />
      </motion.div>
      <motion.div className={`absolute ${spec.head}`} style={{ y: textY, pointerEvents: pe }}>
        <RoomHead d={d} index={i} compact />
      </motion.div>
      <motion.div className={`absolute ${spec.detail}`} style={{ y: textY, pointerEvents: pe }}>
        <RoomDetail d={d} cols={spec.detailCols} />
      </motion.div>
    </motion.section>
  );
});
