'use client';

import { useSyncExternalStore } from 'react';
import { isKnownStepId } from '@/content/actionPlan';

/**
 * Scene 7: which next steps the student has ticked. Same pattern as compareStore: a small external store backed by
 * sessionStorage, with stored ids re-validated on load. Ticks are the student's own notes: they never reach the
 * comparison store, the ledger or a status label, and nothing leaves the browser.
 */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export const ACTION_KEY = 'cc:action:v1';
const EMPTY: readonly string[] = [];

export function parseStoredSteps(raw: string | null): readonly string[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? [...new Set(parsed.filter(isKnownStepId))] : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** `getStorage` may return null or throw (private mode, blocked storage): ticks then last for this page view only. */
export function createStepStore(getStorage: () => StorageLike | null) {
  const storage = () => {
    try {
      return getStorage();
    } catch {
      return null;
    }
  };
  let state: readonly string[] = EMPTY;
  try {
    state = parseStoredSteps(storage()?.getItem(ACTION_KEY) ?? null);
  } catch {
    state = EMPTY;
  }
  const listeners = new Set<() => void>();
  const set = (next: readonly string[]) => {
    state = next;
    try {
      storage()?.setItem(ACTION_KEY, JSON.stringify(next));
    } catch {
      /* the tick still works for this page view */
    }
    listeners.forEach((l) => l());
  };
  return {
    getSnapshot: () => state,
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    toggle(id: string) {
      if (!isKnownStepId(id)) return;
      set(state.includes(id) ? state.filter((x) => x !== id) : [...state, id]);
    },
    reset() {
      set(EMPTY);
    },
  };
}

const store = createStepStore(() => (typeof window === 'undefined' ? null : window.sessionStorage));

export const stepActions = { toggle: store.toggle, reset: store.reset };

export function useCompletedSteps(): readonly string[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);
}
