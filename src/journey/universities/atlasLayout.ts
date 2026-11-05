import type { Institution, RegionId } from '@/content/institutions';
import { INSTITUTIONS } from '@/content/institutions';

/**
 * SCHEMATIC atlas geometry (viewBox units, 1000 × 720). Hubs are arranged like a compass rose for orientation
 * only — they are NOT geographic positions, and institutions are placed on an orbit around their region's hub
 * in alphabetical order, never at coordinates. The UI says so on screen.
 */
export const AV_W = 1000;
export const AV_H = 720;

export const HUBS: Record<RegionId, { x: number; y: number }> = {
  north: { x: 500, y: 108 },
  west: { x: 128, y: 348 },
  central: { x: 500, y: 348 },
  east: { x: 872, y: 348 },
  south: { x: 500, y: 600 },
  international: { x: 872, y: 618 },
};

/** constellation edges between region hubs (decorative wayfinding) */
export const HUB_EDGES: [RegionId, RegionId][] = [
  ['north', 'central'],
  ['west', 'central'],
  ['central', 'east'],
  ['central', 'south'],
  ['east', 'international'],
];

export interface Placed {
  inst: Institution;
  x: number;
  y: number;
  /** which side the label sits on */
  side: 'left' | 'right' | 'above' | 'below';
}

const radiusFor = (n: number) => (n <= 1 ? 70 : n === 2 ? 72 : n === 3 ? 82 : n === 4 ? 86 : 96);

/** Placement of every institution (independent of filters, so markers never jump when filters change). */
export const PLACED: Placed[] = (() => {
  const out: Placed[] = [];
  const byRegion = new Map<RegionId, Institution[]>();
  for (const i of INSTITUTIONS) byRegion.set(i.region, [...(byRegion.get(i.region) ?? []), i]);
  for (const [region, list] of byRegion) {
    const hub = HUBS[region];
    const r = radiusFor(list.length);
    list.forEach((inst, k) => {
      // single institutions sit to the right of the hub; otherwise evenly around it starting at 12 o'clock
      const a = list.length === 1 ? 0 : (-90 + (k * 360) / list.length) * (Math.PI / 180);
      const x = hub.x + r * Math.cos(a);
      const y = hub.y + r * Math.sin(a) * 0.86;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const side: Placed['side'] = c > 0.35 ? 'right' : c < -0.35 ? 'left' : s < 0 ? 'above' : 'below';
      out.push({ inst, x, y, side });
    });
  }
  return out;
})();

/**
 * Region captions sit BELOW each cluster (under its lowest marker row) so they never collide with marker labels.
 */
export const CAPTIONS: Record<RegionId, { x: number; y: number }> = (() => {
  const out = {} as Record<RegionId, { x: number; y: number }>;
  for (const r of Object.keys(HUBS) as RegionId[]) {
    const mine = PLACED.filter((p) => p.inst.region === r);
    const maxY = mine.length ? Math.max(...mine.map((p) => p.y)) : HUBS[r].y;
    const hasBelow = mine.some((p) => p.side === 'below' && p.y === maxY);
    out[r] = { x: HUBS[r].x, y: maxY + (hasBelow ? 54 : 36) + (mine.length ? 0 : 30) };
  }
  return out;
})();

export const pct = (x: number, y: number) => ({ left: `${(x / AV_W) * 100}%`, top: `${(y / AV_H) * 100}%` });
