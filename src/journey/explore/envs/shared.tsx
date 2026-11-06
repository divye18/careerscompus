import type { CSSProperties, ReactNode } from 'react';

/**
 * Shared pieces for the seven Explore environments.
 *
 * Every environment = a CSS Backdrop (full-bleed, rasterised once) + an SVG Artwork with a fixed
 * viewBox and a few compositor-only motion overlays. Colour comes from the domain hue (`--hue`, set
 * by the parent) and design tokens (ivory / champagne / silver) — no literal colours here.
 *
 * Artwork is prop-less and memoised so it never re-renders. Motion runs once: a room carries `data-opened="true"`
 * from the first time it opens, and its overlays use `group-data-[opened=true]/room:animate-…` with a single iteration,
 * so nothing loops and nothing replays. Overlays are plain elements animated with transform/opacity so they never
 * repaint the SVG. Without a `group/room` ancestor (mobile track, reduced motion) everything is static.
 */

export const mono: CSSProperties = { fontFamily: 'var(--font-mono)' };

/** Annotations scale with their artwork, so they are drawn larger than their nominal size. */
const ART_TEXT_SCALE = 1.5;

/**
 * Annotation inside an artwork (SVG text): illustration detail, aria-hidden, never the only place a fact appears.
 * It scales with the drawing, so it stays below the UI label floor and is hidden on phones and small tablets, where it
 * cannot be read. Anything a student must read goes in the frame's `caption` instead.
 */
export function Label({
  x,
  y,
  children,
  anchor = 'start',
  size = 11,
  opacity = 0.72,
  className = 'fill-ivory',
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size * ART_TEXT_SCALE} opacity={opacity} className={`max-lg:hidden ${className}`} style={{ ...mono, letterSpacing: '0.12em' }}>
      {children}
    </text>
  );
}

/** A figure caption: fixed, readable type at any artwork size. */
export function ArtCaption({ children, className = 'left-1' }: { children: ReactNode; className?: string }) {
  return <p className={`absolute bottom-1 m-0 font-mono text-[11px] uppercase leading-tight tracking-[0.1em] text-ivory/75 ${className}`}>{children}</p>;
}

/** Artwork frame: a viewBox-sized svg plus an overlay layer positioned in viewBox percentages. */
export function ArtFrame({ viewBox, children, overlay, caption }: { viewBox: string; children: ReactNode; overlay?: ReactNode; caption?: ReactNode }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ color: 'var(--hue)' }}>
      <svg
        viewBox={viewBox}
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
      {overlay}
      {caption}
    </div>
  );
}

/**
 * Hairline grid as an SVG pattern (stroke = currentColor → the room hue). Rasterises as one small tile,
 * cheaper to paint than stacked repeating CSS gradients under a mask.
 */
export function GridLayer({ id, size, opacity, style }: { id: string; size: number; opacity: number; style?: CSSProperties }) {
  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full" style={{ color: 'var(--hue)', opacity, ...style }}>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <path d={`M${size} 0V${size}M0 ${size}H${size}`} fill="none" stroke="currentColor" strokeWidth={1} shapeRendering="crispEdges" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Small node at a viewBox-percentage position. It signals once when the room first opens (compositor-only). */
export function Pulse({ left, top, delay = 0, size = 8 }: { left: number; top: number; delay?: number; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute rounded-full bg-current opacity-80 group-data-[opened=true]/room:animate-[atlas-signal_1.4s_ease-out_1]"
      style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, animationDelay: `${delay}s` }}
    />
  );
}
