import * as THREE from 'three';
import { DOMAINS } from '@/content/domains';
import { makeMatcap, TONES } from './matcaps';
import { color, compass } from '@/theme/tokens';

/**
 * All GPU resources for the compass, created once per mounted rig and shared by every mesh.
 * Mutations go through methods so per-frame updates stay outside React's render model.
 */
export class CompassAssets {
  readonly geo = {
    cone: new THREE.ConeGeometry(1, 1, 28, 1),
    sphere: new THREE.SphereGeometry(1, 20, 20),
    bezel: new THREE.TorusGeometry(1, 0.075, 28, 120),
    lip: new THREE.TorusGeometry(0.935, 0.022, 16, 120),
    outerRing: new THREE.TorusGeometry(1.1, 0.011, 12, 120),
    face: new THREE.CylinderGeometry(0.93, 0.93, 0.05, 96, 1),
    loop: new THREE.TorusGeometry(0.13, 0.03, 16, 36),
    stem: new THREE.CylinderGeometry(0.07, 0.085, 0.17, 24),
    ring1: new THREE.TorusGeometry(1.3, 0.008, 8, 160),
    ring2: new THREE.TorusGeometry(1.5, 0.008, 8, 160),
    ring3: new THREE.TorusGeometry(1.72, 0.006, 8, 160),
  };

  // Metals use procedural matcaps (no IBL/PMREM: that cost ~3 s of blocking shader compile).
  readonly matcaps = {
    brass: makeMatcap(TONES.brass),
    brassDark: makeMatcap(TONES.brassDark),
    champagne: makeMatcap(TONES.champagne),
    silver: makeMatcap(TONES.silver),
    steel: makeMatcap(TONES.steel),
  };
  readonly brass = new THREE.MeshMatcapMaterial({ matcap: this.matcaps.brass });
  readonly brassDark = new THREE.MeshMatcapMaterial({ matcap: this.matcaps.brassDark });
  readonly champagne = new THREE.MeshMatcapMaterial({ matcap: this.matcaps.champagne });
  readonly faceSide = new THREE.MeshMatcapMaterial({ matcap: this.matcaps.brassDark });
  readonly faceTop = new THREE.MeshStandardMaterial({ roughness: 0.78, metalness: 0 });
  readonly ringA = new THREE.MeshMatcapMaterial({ matcap: this.matcaps.champagne, transparent: true });
  readonly ringB = new THREE.MeshMatcapMaterial({ matcap: this.matcaps.silver, transparent: true });

  /** Needles/meridians: neutral steel matcap tinted by the per-frame colour. */
  readonly spokeMats = DOMAINS.map(
    () =>
      new THREE.MeshMatcapMaterial({
        matcap: this.matcaps.steel,
        color: compass.ghost,
        transparent: true,
        opacity: 0.3,
      })
  );
  readonly beadMats = DOMAINS.map(
    (d) =>
      new THREE.MeshStandardMaterial({
        color: d.hue,
        emissive: d.hue,
        emissiveIntensity: 0.25,
        metalness: 0.1,
        roughness: 0.55,
      })
  );

  /** Cyan light at the primary needle tip: a small core and a soft halo (no bloom pass). */
  readonly tipCore = new THREE.MeshBasicMaterial({ color: compass.tip, transparent: true, depthWrite: false });
  readonly tipHalo = new THREE.MeshBasicMaterial({ color: compass.tip, transparent: true, opacity: 0.2, depthWrite: false });

  setTip(opacity: number) {
    this.tipCore.opacity = opacity;
    this.tipHalo.opacity = 0.2 * opacity;
  }

  setFaceMap(tex: THREE.Texture | null) {
    this.faceTop.map = tex;
    this.faceTop.needsUpdate = true;
  }

  setRingsOpacity(v: number) {
    this.ringA.opacity = 0.9 * v;
    this.ringB.opacity = 0.5 * v;
  }

  /** `selected`: cyan marks the selected domain's bead (cyan selects; domain hues identify). */
  setSpoke(i: number, tint: string, opacity: number, glow: number, selected: boolean, hue: string) {
    this.spokeMats[i].color.set(tint);
    this.spokeMats[i].opacity = opacity;
    const bead = this.beadMats[i];
    const c = selected ? color.cyan : hue;
    bead.color.set(c);
    bead.emissive.set(c);
    bead.emissiveIntensity = glow;
  }

  dispose() {
    Object.values(this.geo).forEach((g) => g.dispose());
    [this.brass, this.brassDark, this.champagne, this.faceSide, this.faceTop, this.ringA, this.ringB, this.tipCore, this.tipHalo]
      .concat(this.spokeMats, this.beadMats)
      .forEach((m) => m.dispose());
    Object.values(this.matcaps).forEach((t) => t.dispose());
  }
}
