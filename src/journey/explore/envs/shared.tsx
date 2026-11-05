import type { CSSProperties, ReactNode } from 'react';

/**
 * Shared pieces for the seven Explore environments.
 *
 * Every environment = a CSS Backdrop (full-bleed, rasterised once) + an SVG Artwork with a fixed
 * viewBox and a few compositor-only motion overlays. Colour comes from the domain hue (`--hue`, set
 * by the parent) and design tokens (ivory / champagne / silver) — no literal colours here.
 *
 * Artwork is prop-less and memoised so it never re-renders. Motion is switched on by CSS: the active room
 * carries `data-active="true"` and its overlays use `group-data-[active=true]/room:animate-…`. Overlays are
 * plain elements animated with transform/opacity so they never repaint the SVG. Without a `group/room`
 * ancestor (mobile track, reduced motion) everything is static.
 */

export const mono: CSSProperties = { fontFamily: 'var(--font-mono)' };

/** Mono label inside an artwork (SVG text). */
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
    <text x={x} y={y} textAnchor={anchor} fontSize={size} opacity={opacity} className={className} style={{ ...mono, letterSpacing: '0.12em' }}>
      {children}
    </text>
  );
}

/** Artwork frame: a viewBox-sized svg plus an overlay layer positioned in viewBox percentages. */
export function ArtFrame({ viewBox, children, overlay }: { viewBox: string; children: ReactNode; overlay?: ReactNode }) {
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

/** Small pulsing node at a viewBox-percentage position (compositor-only animation). */
export function Pulse({ left, top, delay = 0, size = 8 }: { left: number; top: number; delay?: number; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute rounded-full bg-current opacity-80 group-data-[active=true]/room:animate-[atlas-pulse_2.8s_ease-in-out_infinite]"
      style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, animationDelay: `${delay}s` }}
    />
  );
}
