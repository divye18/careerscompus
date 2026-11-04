import * as THREE from 'three';

/**
 * Procedural "studio" matcaps for the compass metals.
 *
 * Why: an IBL environment (drei <Environment>, PMREM) cost ~3 s of main-thread shader
 * compilation on Windows/ANGLE, during which the page could not scroll. Matcap materials give a
 * lit-metal look from a small canvas texture and compile almost instantly. Measured in
 * docs/PROJECT_STATUS.md (stabilisation milestone).
 */
export interface MatcapTone {
  highlight: string; // specular core (top-left key light)
  light: string; // lit side
  mid: string; // body colour
  dark: string; // terminator / far side
  rim: string; // bounce light from lower right
}

export const TONES = {
  brass: { highlight: '#FFF8E2', light: '#F3D68A', mid: '#BE9339', dark: '#3A2808', rim: '#E7C46E' },
  brassDark: { highlight: '#F7E2AE', light: '#C9A35C', mid: '#86642A', dark: '#2A1C06', rim: '#B8924A' },
  champagne: { highlight: '#FFFBEF', light: '#F7E7BC', mid: '#DCC17E', dark: '#7A6230', rim: '#F1DDA4' },
  royal: { highlight: '#E8EEFF', light: '#7F9BF2', mid: '#3155D9', dark: '#141E5C', rim: '#6F8BE8' },
  /** neutral steel, tinted by material.color (used for needles/meridians) */
  steel: { highlight: '#FFFFFF', light: '#F1F3FA', mid: '#C9CEDF', dark: '#5D6378', rim: '#E4E8F4' },
} satisfies Record<string, MatcapTone>;

export function makeMatcap(t: MatcapTone, size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const r = size / 2;

  // sphere body: key light from upper-left
  const body = ctx.createRadialGradient(r * 0.62, r * 0.58, r * 0.05, r, r, r);
  body.addColorStop(0, t.light);
  body.addColorStop(0.45, t.mid);
  body.addColorStop(0.82, t.dark);
  body.addColorStop(1, t.dark);
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, size, size);

  // horizon band (studio softbox reflection)
  ctx.save();
  ctx.globalAlpha = 0.35;
  const band = ctx.createLinearGradient(0, r * 0.95, 0, r * 1.25);
  band.addColorStop(0, 'rgba(255,255,255,0)');
  band.addColorStop(0.5, t.light);
  band.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, r * 0.95, size, r * 0.3);
  ctx.restore();

  // bounce/rim light lower-right
  const rim = ctx.createRadialGradient(r * 1.55, r * 1.55, 0, r * 1.55, r * 1.55, r * 0.75);
  rim.addColorStop(0, t.rim);
  rim.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, size, size);

  // softbox streak: a curved bright reflection across the upper hemisphere
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = t.highlight;
  ctx.lineWidth = size * 0.045;
  ctx.lineCap = 'round';
  ctx.filter = `blur(${Math.round(size * 0.012)}px)`;
  ctx.beginPath();
  ctx.arc(r, r * 1.05, r * 0.78, Math.PI * 1.18, Math.PI * 1.62);
  ctx.stroke();
  ctx.restore();

  // specular core
  ctx.globalAlpha = 1;
  const spec = ctx.createRadialGradient(r * 0.55, r * 0.5, 0, r * 0.55, r * 0.5, r * 0.32);
  spec.addColorStop(0, t.highlight);
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
