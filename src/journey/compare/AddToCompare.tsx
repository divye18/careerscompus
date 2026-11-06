'use client';

import { ArrowRight, Check, Plus } from 'lucide-react';
import { MAX_COLUMNS, type CompareMode } from '@/content/comparison';
import { goTo } from '../scroll';
import { compareActions, useCompare } from './compareStore';

export const focusRing = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-cyan';
export const secondaryBtn = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-atlas border border-ivory/30 px-4 text-sm font-semibold text-ivory transition-colors hover:border-ivory/60 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-ivory/30 ${focusRing}`;

export function openComparison(mode: CompareMode) {
  compareActions.setMode(mode);
  goTo('studio-workspace');
}

/**
 * "Add to comparison" as used by Scenes 4 and 5. Adding stays in place, so the student keeps exploring;
 * "Open comparison" goes to the studio. When the comparison is full the button explains itself instead of failing.
 */
export function AddToCompare({ mode, id, label, name }: { mode: CompareMode; id: string; label: string; name: string }) {
  const s = useCompare();
  const cur = s.selections[mode];
  const inIt = cur.includes(id);
  const full = !inIt && cur.length >= MAX_COLUMNS;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          aria-pressed={inIt}
          aria-label={inIt ? `${name} is in the comparison. Remove it.` : `${label}: ${name}`}
          disabled={full}
          onClick={() => (inIt ? compareActions.remove(mode, id) : compareActions.add(mode, id))}
          className={`${secondaryBtn} ${inIt ? 'border-cyan hover:border-cyan' : ''}`}
        >
          {inIt && <Check aria-hidden="true" className="h-4 w-4 text-cyan" />}
          {inIt ? 'In comparison. Remove' : label}
        </button>
        {cur.length > 0 && (
          <button type="button" onClick={() => openComparison(mode)} className={secondaryBtn}>
            Open comparison ({cur.length}/{MAX_COLUMNS})
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
      {full && <p className="mt-2 text-[13px] leading-snug text-ivory/75">The comparison holds {MAX_COLUMNS} options. Open it to remove or replace one.</p>}
    </div>
  );
}

/** Compact toggle for a single verified programme inside the atlas panel. */
export function CompareProgrammeToggle({ id, name }: { id: string; name: string }) {
  const s = useCompare();
  const cur = s.selections.programmes;
  const inIt = cur.includes(id);
  const full = !inIt && cur.length >= MAX_COLUMNS;
  return (
    <button
      type="button"
      aria-pressed={inIt}
      aria-label={inIt ? `${name} is in the programme comparison. Remove it.` : `Add ${name} to the programme comparison`}
      disabled={full}
      title={full ? `The comparison holds ${MAX_COLUMNS} programmes` : undefined}
      onClick={() => (inIt ? compareActions.remove('programmes', id) : compareActions.add('programmes', id))}
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-atlas-sm border px-2.5 font-mono text-[11px] uppercase tracking-wider text-ivory/90 transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${focusRing} ${inIt ? 'border-cyan' : 'border-ivory/25 hover:border-ivory/60'}`}
    >
      {inIt ? <Check aria-hidden="true" className="h-3.5 w-3.5 text-cyan" /> : <Plus aria-hidden="true" className="h-3.5 w-3.5" />}
      {inIt ? 'Added' : 'Compare'}
    </button>
  );
}
