/**
 * Choreography — the single source of truth for how the Meridian Atlas compass
 * morphs from Scene 1 (Arrival) to Scene 2 (Discover).
 *
 * Everything here is a pure function of:
 *   m  — morph progress, 0 = Arrival, 1 = Discover settled
 *   p  — pinned-journey scroll progress, 0..1 (desktop presenter only)
 * so the WebGL rig, the SVG fallback and the DOM layers always agree, and none of
 * them needs React state per frame.
 */

import { DOMAINS } from '@/content/domains';
import { compass } from '@/theme/tokens';

export const SPOKES = DOMAINS.length; // 7

/* ---------- math helpers ---------- */
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
/** Cubic ease-in-out (ease-settle). */
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** Sine ease-in-out: gentle start, no dead zone at the beginning of a scroll move. */
export const easeInOutSine = (t: number) => -(Math.cos(Math.PI * clamp01(t)) - 1) / 2;
/** Ease-out (ease-atlas-ish). */
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
export const deg2rad = (d: number) => (d * Math.PI) / 180;

/** Interpolate angles in degrees along the shortest arc. */
export function lerpAngle(a: number, b: number, t: number): number {
  let d = (((b - a) % 360) + 540) % 360 - 180;
  if (d === -180) d = 180;
  return a + d * t;
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(lerp(ar, br, t));
  const g = Math.round(lerp(ag, bg, t));
  const bl = Math.round(lerp(ab, bb, t));
  return `rgb(${r}, ${g}, ${bl})`;
}

/* ---------- pinned journey timeline (desktop) ---------- */
/**
 * Timeline in viewport heights of scroll. Scenes 1–2 occupy the first SCENE12_VH (their maths below is
 * written in a local 0..1 "p12" over that range and is unchanged); Scene 3 (Explore) follows.
 */
export const SCENE12_VH = 280;
export const DOMAIN_COUNT = 7;
/** Scroll per domain room. */
export const DOMAIN_VH = 46;
/** First domain room is fully in at this scroll position (the Discover→Explore hand-over ends here). */
export const EXPLORE_START_VH = 290;
/** Total pinned scroll length, in viewport heights (container = 100vh stage + this). */
export const PINNED_SCROLL_VH = EXPLORE_START_VH + DOMAIN_COUNT * DOMAIN_VH;
/** Convert global progress (0..1 over the whole pinned range) to Scene 1–2 local progress. */
export const p12Of = (p: number) => p * (PINNED_SCROLL_VH / SCENE12_VH);
export const vhOf = (p: number) => p * PINNED_SCROLL_VH;

export const PINNED = {
  /** morph m goes 0 → 1 across this p range */
  morph: [0.0, 0.6] as const,
  arrivalTextOut: [0.0, 0.22] as const,
  /** title lands with the last meridians (morph range) */
  discoverTitleInM: [0.58, 0.88] as const,
  cueOut: [0.0, 0.03] as const,
  /** anchor offsets (global progress) used by the Direction Rail / hash links */
  sceneStart: { arrival: 0, discover: (0.62 * SCENE12_VH) / PINNED_SCROLL_VH } as const,
};

export const morphAt = (p: number) => range(p12Of(p), PINNED.morph[0], PINNED.morph[1]);

/* ---------- Scene 3: Explore (global progress p) ---------- */
/** Discover → Explore hand-over (marks and title leave, compass docks low, first room arrives). */
export const exploreIn = (p: number) => smoothstep(range(vhOf(p), 236, 296));

/** Start of domain i's room (scroll vh). Room i is fully in at its start and fully out at the next one. */
export const domainStartVh = (i: number) => EXPLORE_START_VH + DOMAIN_VH * i;

/**
 * Visibility weight of domain i's room (0..1). Neighbouring rooms cross-fade over the same 12 vh
 * window, so the weights of two adjacent rooms always sum to 1.
 */
export function domainWeight(i: number, p: number): number {
  const v = vhOf(p);
  const s0 = domainStartVh(i);
  const inW = i === 0 ? smoothstep(range(v, 262, 296)) : smoothstep(range(v, s0 - 6, s0 + 6));
  const outW = i === DOMAIN_COUNT - 1 ? 0 : smoothstep(range(v, s0 + DOMAIN_VH - 6, s0 + DOMAIN_VH + 6));
  return clamp01(inW * (1 - outW));
}

/** Index of the dominant room, or -1 before Explore begins. */
export function activeDomain(p: number): number {
  if (exploreIn(p) < 0.5) return -1;
  let best = 0;
  let bw = -1;
  for (let i = 0; i < DOMAIN_COUNT; i++) {
    const w = domainWeight(i, p);
    if (w > bw) {
      bw = w;
      best = i;
    }
  }
  return best;
}

/** Continuous room position (0 at the first room, 6 at the last): drives ghost-type parallax. */
export const exploreC = (p: number) => (vhOf(p) - EXPLORE_START_VH) / DOMAIN_VH;

/** Global progress at which anchor links for domain i land (room just settled). */
export const domainAnchorP = (i: number) => (domainStartVh(i) + 9) / PINNED_SCROLL_VH;

/* ---------- spoke (needle / meridian) state ---------- */
/** Arrival angles (degrees). Spoke 0 is the "primary" needle; the rest are ghosts. */
const ARRIVAL_ANGLE = [52, 20, 342, 296, 244, 196, 128];
/** Final fan: seven evenly spaced meridians, none pointing straight up (leaves room for the title). */
export const FAN_START = 64;
export const finalAngle = (i: number) => FAN_START - (i * 360) / SPOKES;

const ARRIVAL_LEN = [0.84, 0.86, 0.8, 0.88, 0.82, 0.86, 0.8]; // local units (bezel radius = 1)
const ARRIVAL_WIDTH = [0.17, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06];
const ARRIVAL_TAIL = [0.36, 0.16, 0.14, 0.16, 0.14, 0.16, 0.14];
const GHOST_COLOR = compass.ghost;
const PRIMARY_COLOR = compass.needle;

export interface SpokeState {
  angle: number; // degrees, math convention (0 = +x, 90 = +y up)
  lengthPx: number;
  widthPx: number;
  tailPx: number;
  beadPx: number; // bead radius in px
  opacity: number;
  color: string;
  e: number; // per-spoke eased progress 0..1
}

/**
 * Needles keep their Arrival character while the compass travels (m < 0.24), then extend in
 * sequence; spoke 6 lands at m ≈ 0.99.
 */
/**
 * Opacity of the cyan light at the primary needle's tip: present at Arrival, fading as the needle
 * becomes the Technology meridian (cyan then only marks selection).
 */
export const tipGlow = (m: number) => 1 - smoothstep(range(spokeEase(0, m), 0.2, 0.75));

export function spokeEase(i: number, m: number): number {
  return easeInOut(clamp01((m - 0.24 - 0.042 * i) / 0.5));
}

export interface RigLayout {
  cx: number;
  cy: number;
  /** bezel radius in px (local unit 1) */
  bezelPx: number;
  /** meridian outer radius in px */
  outerPx: number;
  /** graticule radius in px */
  gratPx: number;
  /** centre of the graticule / key-light pool (follows the compass, then the Explore object) */
  gx: number;
  gy: number;
  /** Explore: signature-object centre and radius (px) */
  objX: number;
  objY: number;
  objR: number;
  tiltX: number; // radians
  tiltY: number;
  /** orbit-ring visual weight 1 → 0 */
  ringsOpacity: number;
  ringsScale: number;
}

export type LayoutKind = 'wide' | 'stack';

/**
 * `x3` (0..1, wide layout only) is the Discover→Explore hand-over: the compass docks small at the
 * bottom centre and the graticule / light pool move up behind the signature object.
 */
export function rigLayout(W: number, H: number, m: number, kind: LayoutKind = 'wide', x3 = 0): RigLayout {
  const e3 = kind === 'wide' ? easeInOutSine(x3) : 0;
  const eP = easeInOutSine(range(m, 0, 0.5)); // position: glides to centre while the copy leaves
  const eB = easeInOut(range(m, 0.12, 0.85)); // scale: shrinks as the meridians take over
  const eT = easeInOutSine(range(m, 0, 0.55)); // tilt flatten
  const base = Math.min(H, W * 0.62);
  const bezelStart = kind === 'wide' ? 0.21 * base : 0.3 * Math.min(W, H);
  const bezelEnd = kind === 'wide' ? 0.105 * base : 0.12 * Math.min(W, H);
  const outer = kind === 'wide' ? 0.31 * base : 0.4 * Math.min(W, H);
  const cxM = lerp(kind === 'wide' ? 0.76 * W : 0.5 * W, 0.5 * W, eP);
  const cyM = lerp(kind === 'wide' ? 0.55 * H : 0.5 * H, kind === 'wide' ? 0.57 * H : 0.5 * H, eP);
  // in the stack (SVG) layout keep the halo inside the viewBox so it is never clipped
  const gratM = lerp(
    kind === 'wide' ? 2.25 * bezelStart : Math.min(2.25 * bezelStart, 0.47 * Math.min(W, H)),
    outer * 1.04,
    easeInOut(range(m, 0.05, 1))
  );
  return {
    cx: cxM,
    cy: lerp(cyM, 0.9 * H, e3),
    bezelPx: lerp(lerp(bezelStart, bezelEnd, eB), 0.046 * base, e3),
    outerPx: outer,
    gratPx: lerp(gratM, 0.36 * base, e3),
    gx: cxM,
    gy: lerp(cyM, 0.47 * H, e3),
    objX: 0.5 * W,
    objY: 0.47 * H,
    objR: 0.2 * base,
    tiltX: lerp(-0.4, 0, eT),
    tiltY: lerp(0.36, 0, eT),
    ringsOpacity: 1 - smoothstep(range(m, 0.18, 0.62)),
    ringsScale: lerp(1, 2.1, easeInOutSine(range(m, 0, 0.7))),
  };
}

/**
 * Clock for the compass's idle life. It runs at normal speed just after the compass appears, then decelerates and stops
 * for good: the instrument settles and stays still instead of floating forever (DESIGN_CONSTITUTION section 10).
 * Scroll and pointer response are unaffected.
 */
const IDLE_FULL_S = 2;
const IDLE_STOP_S = 12;
export function idleTime(t: number): number {
  if (t <= IDLE_FULL_S) return t;
  const span = IDLE_STOP_S - IDLE_FULL_S;
  const x = Math.min(1, (t - IDLE_FULL_S) / span);
  return IDLE_FULL_S + span * (x - x ** 3 + x ** 4 / 2);
}

/** Explore pose for the needles: they fold into a short dial of seven ticks; the active one reaches out. */
export interface ExploreSpoke {
  x3: number;
  active: number;
}

export function spokeState(i: number, m: number, t: number, layout: RigLayout, ex?: ExploreSpoke): SpokeState {
  const e = spokeEase(i, m);
  const drift = Math.sin(t * (0.22 + 0.05 * i) + i * 1.7) * (1 - e) * (i === 0 ? 4 : 12);
  const angle = lerpAngle(ARRIVAL_ANGLE[i] + drift, finalAngle(i), e);
  const hue = DOMAINS[i].hue;

  const arrivalLenPx = ARRIVAL_LEN[i] * layout.bezelPx;
  const lengthPx = lerp(arrivalLenPx, layout.outerPx, e);

  const widthPx = lerp(ARRIVAL_WIDTH[i] * layout.bezelPx, 2.4, e);
  const tailPx = lerp(ARRIVAL_TAIL[i] * layout.bezelPx, 0, smoothstep(range(e, 0, 0.6)));
  const beadPx = 5 * smoothstep(range(e, 0.55, 1));

  const opacity = i === 0 ? 1 : lerp(0.58, 1, smoothstep(range(e, 0, 0.7)));
  const color = mixHex(i === 0 ? PRIMARY_COLOR : GHOST_COLOR, hue, smoothstep(range(e, 0.1, 0.9)));
  if (ex && ex.x3 > 0) {
    const e3 = easeInOutSine(ex.x3);
    const on = ex.active === i;
    return {
      angle,
      lengthPx: lerp(lengthPx, (on ? 2.9 : 1.55) * layout.bezelPx, e3),
      widthPx: lerp(widthPx, on ? 2.8 : 1.6, e3),
      tailPx: 0,
      beadPx: lerp(beadPx, on ? 4.6 : 2.4, e3),
      opacity: lerp(opacity, on ? 1 : 0.5, e3),
      color,
      e,
    };
  }
  return { angle, lengthPx, widthPx, tailPx, beadPx, opacity, color, e };
}

/** Screen position (px, y down) of the tip of spoke i at the settled Discover state. */
export function markPosition(i: number, W: number, H: number, kind: LayoutKind = 'wide') {
  const l = rigLayout(W, H, 1, kind);
  const a = deg2rad(finalAngle(i));
  return {
    x: l.cx + Math.cos(a) * l.outerPx,
    y: l.cy - Math.sin(a) * l.outerPx,
    cos: Math.cos(a),
    sin: Math.sin(a),
  };
}

/* ---------- DOM layer opacities ---------- */
export const arrivalTextOut = (p: number) => range(p12Of(p), PINNED.arrivalTextOut[0], PINNED.arrivalTextOut[1]);
export const discoverTitleIn = (p: number) =>
  smoothstep(range(morphAt(p), PINNED.discoverTitleInM[0], PINNED.discoverTitleInM[1])) * (1 - exploreIn(p));
/** Each domain mark blooms from its bead exactly as its own meridian lands, and leaves into Explore. */
export const markIn = (i: number, p: number) =>
  smoothstep(range(spokeEase(i, morphAt(p)), 0.72, 1)) * (1 - exploreIn(p));
/** cue fades over the first scroll */
export const cueIn = (p: number) => 1 - range(p12Of(p), PINNED.cueOut[0], PINNED.cueOut[1]);
