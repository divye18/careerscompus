/**
 * Nocturne Atlas — colour tokens (approved; see docs/redesign/08_COLOUR_IDENTITY.md).
 *
 * Single JS source for colours used by WebGL, SVG and choreography (which need real values).
 * CSS mirrors these in src/app/globals.css (@theme, `--color-*`), which also generates the
 * Tailwind utilities used by components. `node scripts/check-tokens.mjs` verifies the two match.
 *
 * Rules: cyan is a SIGNAL (selection, focus, compass light) — never a background or general fill.
 * On ivory grounds use the *-800 / ink variants (contrast measured in 08 §8).
 */
export const color = {
  ink950: '#101014', // Midnight — night ground
  ink900: '#1A1A22', // raised night surface
  ink800: '#24242E', // hover on night surface
  aubergine: '#241333', // night atmosphere
  aubergineGlow: '#2B1840', // centre of the aubergine radial
  plum: '#43205F', // accent environment (Scene 7 only)
  ivory: '#F4F0E8', // day ground, text on night
  ivory100: '#ECE6DA', // day surface
  silver: '#A7A9B5', // secondary on night
  silver700: '#5C5E6D', // secondary on day
  champagne: '#C9A96E', // brass / labels on night
  champagne800: '#7D6331', // brass-coloured text on day
  cyan: '#35E6E6', // signal on night
  cyan800: '#0A6F78', // signal on day
} as const;

/**
 * Radius scale (DESIGN_CONSTITUTION section 8), mirrored in globals.css as `rounded-atlas-sm`, `rounded-atlas`,
 * `rounded-atlas-lg`, `rounded-pill`. Existing components keep their older values until the approved migration.
 */
export const radius = { sm: 8, standard: 14, large: 20, pill: 999 } as const;

/** Compass material palette (3D + SVG). */
export const compass = {
  dialCentre: '#F3EEE2', // smoked ivory
  dialMid: '#E6DECC',
  dialEdge: '#CFC3A8',
  engraving: '#2A2A33', // ink engraving on the dial
  northMark: color.cyan800, // N on the dial (cyan-800: cyan-400 is unreadable on ivory)
  needle: '#2B3550', // blued steel (primary needle, before it becomes a meridian)
  ghost: '#7A7E90', // cool silver-steel ghost needles (readable on the dial; ghostly via opacity)
  tip: color.cyan, // emitted light at the primary needle tip
  keyLight: '#FFE9C4', // warm key (≈3200 K)
  rimLight: color.cyan, // cool rim, low intensity
  ringA: color.champagne,
  ringB: color.silver,
  glow: 'rgba(201, 169, 110, 0.17)', // champagne key-light pool on the ground
} as const;

export type DomainId = 'technology' | 'medicine' | 'business' | 'design' | 'law' | 'architecture' | 'science';

/** Domain hues: `night` identifies on dark grounds, `ink` is the day variant (≥4.5:1 on ivory). */
export const domainColor: Record<DomainId, { night: string; ink: string }> = {
  technology: { night: '#8C95FF', ink: '#3B44B8' },
  medicine: { night: '#5FCB98', ink: '#1D6E49' },
  business: { night: '#E9B44C', ink: '#7A5512' },
  design: { night: '#EE7FA8', ink: '#9E2F5A' },
  law: { night: '#B993F0', ink: '#5E3A96' },
  architecture: { night: '#E58A64', ink: '#99441F' },
  science: { night: '#6DB5F2', ink: '#1F5E92' },
};

/**
 * Matcap shading ramps for the compass metals (studio-lit sphere: highlight → light → mid → dark,
 * plus a bounce rim). These are material definitions, kept here so all colour lives in one file.
 */
export interface MatcapTone {
  highlight: string;
  light: string;
  mid: string;
  dark: string;
  rim: string;
}
export const matcapTone = {
  brass: { highlight: '#FFF4D6', light: '#EED493', mid: '#B89452', dark: '#3A2808', rim: '#E2C27A' },
  brassDark: { highlight: '#F2DEAC', light: '#C29E5C', mid: '#7F6128', dark: '#261905', rim: '#B08C48' },
  champagne: { highlight: '#FFFAEC', light: '#F1E2B8', mid: '#C9A96E', dark: '#5E4A22', rim: '#E9D5A0' },
  silver: { highlight: '#FFFFFF', light: '#E4E6EE', mid: '#A7A9B5', dark: '#34363F', rim: '#D2D5DF' },
  /** neutral steel; tinted per frame by material.color (needles / meridians) */
  steel: { highlight: '#FFFFFF', light: '#F1F3FA', mid: '#C9CEDF', dark: '#5D6378', rim: '#E4E8F4' },
} satisfies Record<string, MatcapTone>;
