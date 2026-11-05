'use client';

import { useSyncExternalStore } from 'react';
import { MAX_COLUMNS, isKnownOption, type CompareMode, type LedgerView } from '@/content/comparison';

/**
 * Shared comparison state for Scenes 4, 5 and 6: a small external store, so adding an option in the atlas or the
 * pathway never re-renders the journey. The selection survives scrolling between scenes, presenter swaps and
 * reloads in the same tab (sessionStorage; ids are re-validated against the dataset on load).
 */
export interface CompareState {
  mode: CompareMode;
  selections: Record<CompareMode, readonly string[]>;
  view: LedgerView;
  /** parameter ids the student has switched off */
  hidden: readonly string[];
}

const KEY = 'cc:compare:v1';
const INITIAL: CompareState = { mode: 'institutions', selections: { institutions: [], courses: [], programmes: [] }, view: 'all', hidden: [] };
const MODES: readonly CompareMode[] = ['institutions', 'courses', 'programmes'];
const VIEWS: readonly LedgerView[] = ['all', 'verified', 'differences'];

function load(): CompareState {
  if (typeof window === 'undefined') return INITIAL;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return INITIAL;
    const p = JSON.parse(raw) as Partial<CompareState>;
    const clean = (m: CompareMode) => (p.selections?.[m] ?? []).filter((id) => isKnownOption(m, id)).slice(0, MAX_COLUMNS);
    return {
      mode: p.mode && MODES.includes(p.mode) ? p.mode : INITIAL.mode,
      selections: { institutions: clean('institutions'), courses: clean('courses'), programmes: clean('programmes') },
      view: p.view && VIEWS.includes(p.view) ? p.view : INITIAL.view,
      hidden: Array.isArray(p.hidden) ? p.hidden.filter((x) => typeof x === 'string') : [],
    };
  } catch {
    return INITIAL;
  }
}

let state: CompareState = load();
const listeners = new Set<() => void>();

function set(next: CompareState) {
  state = next;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or blocked storage: the selection still works for this page view */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function useCompare(): CompareState {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}

const withSelection = (mode: CompareMode, ids: readonly string[]): CompareState => ({ ...state, selections: { ...state.selections, [mode]: ids } });

export const compareActions = {
  setMode(mode: CompareMode) {
    if (state.mode !== mode) set({ ...state, mode });
  },
  setView(view: LedgerView) {
    set({ ...state, view });
  },
  /** returns false if the comparison is already full or the option is already in it */
  add(mode: CompareMode, id: string): boolean {
    const cur = state.selections[mode];
    if (cur.includes(id) || cur.length >= MAX_COLUMNS || !isKnownOption(mode, id)) return false;
    set({ ...withSelection(mode, [...cur, id]), mode });
    return true;
  },
  remove(mode: CompareMode, id: string) {
    set(withSelection(mode, state.selections[mode].filter((x) => x !== id)));
  },
  replace(mode: CompareMode, oldId: string, newId: string) {
    const cur = state.selections[mode];
    if (cur.includes(newId) || !isKnownOption(mode, newId)) return;
    set(withSelection(mode, cur.map((x) => (x === oldId ? newId : x))));
  },
  toggleParam(id: string) {
    set({ ...state, hidden: state.hidden.includes(id) ? state.hidden.filter((x) => x !== id) : [...state.hidden, id] });
  },
  setParams(ids: readonly string[], visible: boolean) {
    const rest = state.hidden.filter((x) => !ids.includes(x));
    set({ ...state, hidden: visible ? rest : [...rest, ...ids] });
  },
  /** clears the options in this mode and returns view + parameters to their defaults; other modes keep their options */
  reset(mode: CompareMode) {
    set({ ...withSelection(mode, []), view: 'all', hidden: [] });
  },
};
