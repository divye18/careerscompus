'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * With prefers-reduced-motion, Framer Motion skips transform and layout animation across the site.
 * Opacity fades in the interim sections are handled by the `[data-interim]` rule in globals.css.
 */
export function MotionPreferences({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
