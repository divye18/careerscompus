import * as THREE from 'three';
import { compass } from '@/theme/tokens';
import { hexToRgb } from '../choreography';

const rgba = (hex: string, a: number) => `rgba(${hexToRgb(hex).join(',')},${a})`;

/**
 * Draws the compass dial (smoked-ivory face, ink engraving, deep-cyan N) into a canvas texture.
 * Drawn procedurally so there are no image/font downloads and no licensing concerns.
 */
export function makeFaceTexture(maxAnisotropy = 8): THREE.CanvasTexture {
  const S = 1024;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const cx = S / 2;
  const cy = S / 2;
  const R = S / 2;

  // deterministic pseudo-random (Park–Miller) so the dial is identical on every load
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // Nocturne Atlas dial: ink engraving on smoked ivory; the only colour is the deep-cyan N.
  const brass = rgba(compass.engraving, 0.78); // (name kept: engraved line colour)
  const brassSoft = rgba(compass.engraving, 0.34);
  const royal = compass.northMark;
  const deep = compass.engraving;

  // The cylinder cap maps canvas-up to world-right, so draw everything rotated -90° to read upright.
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-cx, -cy);

  // paper base + warm vignette
  const base = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
  base.addColorStop(0, compass.dialCentre);
  base.addColorStop(0.7, compass.dialMid);
  base.addColorStop(1, compass.dialEdge);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);

  // faint paper fibres
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = compass.engraving;
  ctx.lineWidth = 1;
  for (let i = 0; i < 260; i++) {
    const a = rnd() * Math.PI * 2;
    const r1 = rnd() * R * 0.95;
    const l = 8 + rnd() * 22;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a + 0.8) * (r1 + l), cy + Math.sin(a + 0.8) * (r1 + l));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // concentric hairlines
  ctx.strokeStyle = brassSoft;
  [R * 0.93, R * 0.86, R * 0.66, R * 0.6, R * 0.2].forEach((r, i) => {
    ctx.lineWidth = i === 0 ? 3 : 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // degree ticks (angle measured clockwise from north / up)
  for (let d = 0; d < 360; d += 5) {
    const a = (d * Math.PI) / 180 - Math.PI / 2;
    const isCard = d % 90 === 0;
    const isMajor = d % 30 === 0;
    const isMid = d % 15 === 0;
    const r0 = R * 0.93;
    const len = isCard ? R * 0.085 : isMajor ? R * 0.062 : isMid ? R * 0.045 : R * 0.028;
    ctx.strokeStyle = isCard ? deep : brass;
    ctx.lineWidth = isCard ? 5 : isMajor ? 3 : 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * (r0 - len), cy + Math.sin(a) * (r0 - len));
    ctx.stroke();
  }

  // compass rose: 4 long + 4 short points, alternating tints
  const point = (ang: number, r: number) => [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r] as const;
  const drawStar = (n: number, outer: number, inner: number, fillA: string, fillB: string, rot: number) => {
    for (let k = 0; k < n; k++) {
      const a0 = rot + (k * Math.PI * 2) / n;
      const tip = point(a0, outer);
      const l = point(a0 - Math.PI / n, inner);
      const rr = point(a0 + Math.PI / n, inner);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(l[0], l[1]);
      ctx.lineTo(tip[0], tip[1]);
      ctx.closePath();
      ctx.fillStyle = fillA;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(rr[0], rr[1]);
      ctx.lineTo(tip[0], tip[1]);
      ctx.closePath();
      ctx.fillStyle = fillB;
      ctx.fill();
      ctx.strokeStyle = brassSoft;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(l[0], l[1]);
      ctx.lineTo(tip[0], tip[1]);
      ctx.lineTo(rr[0], rr[1]);
      ctx.stroke();
    }
  };
  drawStar(4, R * 0.58, R * 0.13, rgba(compass.engraving, 0.07), rgba(compass.engraving, 0.03), -Math.PI / 2 + Math.PI / 4);
  drawStar(4, R * 0.82, R * 0.12, rgba(compass.engraving, 0.1), rgba(compass.engraving, 0.045), -Math.PI / 2);

  // cardinal letters
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const letters: [string, number, string][] = [
    ['N', 0, royal],
    ['E', 90, brass],
    ['S', 180, brass],
    ['W', 270, brass],
  ];
  letters.forEach(([ch, d, col]) => {
    const a = (d * Math.PI) / 180 - Math.PI / 2;
    const x = cx + Math.cos(a) * R * 0.74;
    const y = cy + Math.sin(a) * R * 0.74;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = col;
    ctx.font = `${ch === 'N' ? 600 : 500} ${ch === 'N' ? 96 : 74}px "Instrument Serif", Georgia, "Times New Roman", serif`;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  // centre hairline
  ctx.strokeStyle = brass;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.05, 0, Math.PI * 2);
  ctx.stroke();

  // edge shading (inner bevel shadow)
  const edge = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R);
  edge.addColorStop(0, 'rgba(60,45,15,0)');
  edge.addColorStop(1, 'rgba(60,45,15,0.28)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, S, S);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}
