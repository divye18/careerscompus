'use client';

import { useEffect, useRef } from 'react';
import type { ActionPlan, KeptEntry } from '@/content/actionPlan';
import type { CompareMode } from '@/content/comparison';
import { DOMAINS } from '@/content/domains';
import { focusRing } from '../compare/AddToCompare';
import { compareActions } from '../compare/compareStore';
import { StatusLabel } from '../StatusLabel';
import { returnTo } from './returnTo';
import { StageHeading } from './StageHeading';

export interface Removed {
  mode: CompareMode;
  id: string;
  name: string;
}

const action = `inline-flex min-h-[44px] items-center rounded-atlas-sm font-mono text-[11px] uppercase tracking-[0.12em] text-ivory underline decoration-ivory/40 underline-offset-4 hover:decoration-ivory ${focusRing}`;
const STARTS = [
  { label: 'The career worlds', id: 'act-discovery' },
  { label: 'Course pathways', id: 'act-courses' },
  { label: 'The university atlas', id: 'atlas-view' },
  { label: 'The comparison', id: 'studio-workspace' },
];

function Entry({ e, onRemove }: { e: KeptEntry; onRemove: (r: Removed) => void }) {
  const name = e.mode === 'programmes' ? `${e.title} ${e.subtitle}` : e.title;
  const domain = e.domain ? DOMAINS.find((d) => d.id === e.domain) : null;
  return (
    <li data-kept={e.id} data-status={e.status ?? 'none'} className="grid gap-x-8 gap-y-2 border-t border-ivory/20 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <p className="font-atlas text-[26px] leading-[1.1] text-ivory">
          {e.title}
          {e.listedOnly && <span className="ml-2 font-sans text-[14px] text-ivory/90">(listed only)</span>}
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">{e.subtitle}</p>
      </div>
      <div>
        {e.status ? <StatusLabel state={e.status} /> : <p className="text-[14px] text-ivory/90">Details vary. See what is still open.</p>}
        {e.lastVerified && <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/85">Last checked {e.lastVerified}</p>}
        <div className="mt-1 flex flex-wrap gap-x-4">
          {e.mode === 'institutions' && (
            <button type="button" className={action} aria-label={`Back to the atlas: ${name}`} onClick={() => { returnTo('atlas-view'); window.dispatchEvent(new CustomEvent('cc:atlas-open', { detail: e.id })); }}>
              Back to the atlas
            </button>
          )}
          {e.mode === 'programmes' && (
            <button type="button" className={action} aria-label={`Open in comparison: ${name}`} onClick={() => { compareActions.setMode('programmes'); returnTo('studio-workspace'); }}>
              Open in comparison
            </button>
          )}
          {e.mode === 'courses' && (
            <button type="button" className={action} aria-label={`Back to pathways: ${name}`} onClick={() => { returnTo('act-courses'); window.dispatchEvent(new CustomEvent('cc:pathway-domain', { detail: e.domain })); }}>
              Back to pathways
            </button>
          )}
          {domain && <button type="button" className={action} onClick={() => returnTo(`explore-${domain.id}`)}>See {domain.name} careers</button>}
          <button type="button" data-no-print className={action} aria-label={`Remove ${name}`} onClick={() => onRemove({ mode: e.mode, id: e.id, name })}>Remove</button>
        </div>
      </div>
    </li>
  );
}

function Group({ title, list, onRemove }: { title: string; list: readonly KeptEntry[]; onRemove: (r: Removed) => void }) {
  if (!list.length) return null;
  return (
    <div className="mt-8">
      <h4 className="font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-ivory/90">{title}</h4>
      <ul className="mt-3 border-b border-ivory/20">
        {list.map((e) => <Entry key={e.id} e={e} onRemove={onRemove} />)}
      </ul>
    </div>
  );
}

export function KeptStage({ plan, removed, onRemove, onUndo }: { plan: ActionPlan; removed: Removed | null; onRemove: (r: Removed) => void; onUndo: () => void }) {
  const undo = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (removed) undo.current?.focus({ preventScroll: true });
  }, [removed]);
  return (
    <section id="next-kept" aria-labelledby="next-kept-title" className="scroll-mt-32 pt-14 lg:scroll-mt-24">
      <StageHeading id="next-kept-title" n="I">What you kept</StageHeading>
      {removed && (
        <p data-no-print className="mt-3 flex flex-wrap items-center gap-x-4 text-[14px] text-ivory/90">
          {removed.name} was removed.
          <button ref={undo} type="button" onClick={onUndo} className={action}>Undo</button>
        </p>
      )}
      {plan.state === 'empty' ? (
        <div className="mt-5 border-t border-ivory/20 pt-5">
          <p className="font-atlas text-[28px] leading-tight text-ivory">Nothing kept yet. That is fine.</p>
          <p className="mt-2 max-w-[38em] text-[16px] leading-relaxed text-ivory/90">When you use “Add to comparison” on a course or an institution, it appears here. You could start with any of these:</p>
          <ul className="mt-3 flex flex-wrap gap-x-6">
            {STARTS.map((s) => (
              <li key={s.id}><button type="button" className={action} onClick={() => returnTo(s.id)}>{s.label}</button></li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <Group title="Institutions" list={plan.kept.institutions} onRemove={onRemove} />
          <Group title="Programmes" list={plan.kept.programmes} onRemove={onRemove} />
          <Group title="Courses" list={plan.kept.courses} onRemove={onRemove} />
        </>
      )}
    </section>
  );
}
