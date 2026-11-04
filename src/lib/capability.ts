'use client';

import { useSyncExternalStore } from 'react';

/**
 * Capability detection for the scroll journey.
 *
 * tier "full" : pinned stage + WebGL (desktop, fine pointer, WebGL ok, motion ok, not low-power)
 * tier "flow" : natural-scroll presentation with SVG visuals (phones, tablets, reduced motion,
 *               no WebGL, low-power devices, and the server render)
 *
 * The server snapshot is always "flow" so SSR output is the semantic, no-JS-friendly version.
 * All values come from one cached snapshot so useSyncExternalStore stays referentially stable.
 */

export interface Capability {
  tier: 'full' | 'flow';
  reducedMotion: boolean;
  webgl: boolean;
  desktop: boolean;
  lowPower: boolean;
  /** Why the flow tier was chosen (for diagnostics / the test harness). */
  reason: string;
}

export const MOTION_OVERRIDE_KEY = 'cc:motion';

const SERVER_SNAPSHOT: Capability = {
  tier: 'flow',
  reducedMotion: false,
  webgl: false,
  desktop: false,
  lowPower: false,
  reason: 'server',
};

let webglCache: boolean | null = null;
function detectWebGL(): boolean {
  if (webglCache !== null) return webglCache;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    webglCache = !!gl;
    // Release the probe context immediately so it does not count against the browser's limit.
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglCache = false;
  }
  return webglCache;
}

function readOverride(): string | null {
  try {
    return window.localStorage.getItem(MOTION_OVERRIDE_KEY);
  } catch {
    return null;
  }
}

/** Test/debug hook: ?tier=flow forces the flow tier, ?tier=full does not bypass real capability. */
function readForcedFlow(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('tier') === 'flow';
  } catch {
    return false;
  }
}

function compute(): Capability {
  const mq = (q: string) => window.matchMedia(q).matches;
  const override = readOverride();
  const reducedMotion = mq('(prefers-reduced-motion: reduce)') || override === 'reduce';
  const desktop = mq('(min-width: 1024px) and (pointer: fine)');
  const webgl = detectWebGL();

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const lowMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4;
  const lowCores = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < 4;
  const saveData = !!nav.connection?.saveData;
  const lowPower = lowMemory || lowCores || saveData;

  let reason = 'ok';
  if (readForcedFlow()) reason = 'forced';
  else if (reducedMotion) reason = 'reduced-motion';
  else if (!desktop) reason = 'not-desktop';
  else if (!webgl) reason = 'no-webgl';
  else if (lowPower) reason = 'low-power';

  return {
    tier: reason === 'ok' ? 'full' : 'flow',
    reducedMotion,
    webgl,
    desktop,
    lowPower,
    reason,
  };
}

let snapshot: Capability | null = null;
const listeners = new Set<() => void>();

function refresh() {
  const next = compute();
  const prev = snapshot;
  if (
    !prev ||
    prev.tier !== next.tier ||
    prev.reducedMotion !== next.reducedMotion ||
    prev.webgl !== next.webgl ||
    prev.desktop !== next.desktop ||
    prev.lowPower !== next.lowPower ||
    prev.reason !== next.reason
  ) {
    snapshot = next;
    listeners.forEach((l) => l());
  }
}

let attached = false;
function attach() {
  if (attached) return;
  attached = true;
  const queries = ['(prefers-reduced-motion: reduce)', '(min-width: 1024px) and (pointer: fine)'];
  queries.forEach((q) => window.matchMedia(q).addEventListener('change', refresh));
  window.addEventListener('storage', refresh);
}

function subscribe(cb: () => void) {
  attach();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): Capability {
  if (!snapshot) snapshot = compute();
  return snapshot;
}

export function useCapability(): Capability {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SNAPSHOT);
}

/** Persist the user's "reduce motion" choice (a visible toggle can call this). */
export function setMotionPreference(reduce: boolean) {
  try {
    if (reduce) window.localStorage.setItem(MOTION_OVERRIDE_KEY, 'reduce');
    else window.localStorage.removeItem(MOTION_OVERRIDE_KEY);
  } catch {
    /* storage unavailable: preference simply isn't persisted */
  }
  refresh();
}
