import type { DomainId } from '@/theme/tokens';
import type { LevelId } from '@/content/pathways';

/** The student's selections along the pathway. Plain data; the reducer is the only place it changes. */
export interface Sel {
  level: LevelId | null;
  domain: DomainId | null;
  course: string | null;
  spec: string | null;
  career: string | null;
}

export const EMPTY_SEL: Sel = { level: null, domain: null, course: null, spec: null, career: null };

export type PathAction =
  | { t: 'level'; v: LevelId }
  | { t: 'domain'; v: DomainId }
  | { t: 'course'; v: string }
  | { t: 'spec'; v: string }
  | { t: 'career'; v: string }
  /** go back to a stage: clears every selection deeper than it (1 level, 2 course, 3 specialisation, 4 career) */
  | { t: 'stage'; n: 1 | 2 | 3 | 4 }
  | { t: 'back' }
  | { t: 'reset' };

const toggle = <T,>(cur: T | null, v: T): T | null => (cur === v ? null : v);

export function pathReducer(s: Sel, a: PathAction): Sel {
  switch (a.t) {
    case 'level': {
      const level = toggle(s.level, a.v);
      // a different starting point can change which courses are listed, so deeper choices are cleared
      return level === s.level ? s : { ...s, level, course: null, spec: null, career: null };
    }
    case 'domain': {
      const domain = toggle(s.domain, a.v);
      return { ...s, domain, course: null, spec: null, career: null };
    }
    case 'course':
      return { ...s, course: toggle(s.course, a.v), spec: null, career: null };
    case 'spec':
      return { ...s, spec: toggle(s.spec, a.v), career: null };
    case 'career':
      return { ...s, career: toggle(s.career, a.v) };
    case 'stage':
      return {
        ...s,
        course: a.n >= 2 ? s.course : null,
        spec: a.n >= 3 ? s.spec : null,
        career: a.n >= 4 ? s.career : null,
      };
    case 'back':
      if (s.career) return { ...s, career: null };
      if (s.spec) return { ...s, spec: null };
      if (s.course) return { ...s, course: null };
      if (s.domain) return { ...s, domain: null };
      if (s.level) return { ...s, level: null };
      return s;
    case 'reset':
      return EMPTY_SEL;
  }
}

export const hasAny = (s: Sel) => Object.values(s).some(Boolean);
