'use client';

import type { ActionPlan, Question } from '@/content/actionPlan';
import { focusRing } from '../compare/AddToCompare';
import { StatusLabel } from '../StatusLabel';
import { useIsWide } from '../useIsWide';
import { StageHeading } from './StageHeading';

/** Options that share a reason are stated together, so three options do not repeat one sentence three times. */
function byReason(q: Question) {
  const m = new Map<string, string[]>();
  for (const i of q.items) m.set(i.reason, [...(m.get(i.reason) ?? []), i.name]);
  return [...m];
}

function QuestionBlock({ q, open }: { q: Question; open: boolean }) {
  return (
    <details data-question={q.id} open={open} className="border-t border-ivory/20">
      <summary className={`flex min-h-[44px] cursor-pointer list-none items-baseline justify-between gap-4 rounded-atlas-sm py-3 [&::-webkit-details-marker]:hidden ${focusRing}`}>
        <span className="text-[16px] font-medium leading-snug text-ivory">{q.label}</span>
        <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/85">{q.items.length} {q.items.length === 1 ? 'option' : 'options'}</span>
      </summary>
      <ul className="pb-4">
        {byReason(q).map(([reason, names]) => (
          <li key={reason} className="mt-2 text-[14px] leading-snug text-ivory/90">
            <span className="text-ivory">{names.join(', ').replace(/\.?$/, '.')}</span> {reason}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function OpenStage({ plan }: { plan: ActionPlan }) {
  const wide = useIsWide();
  const offered = plan.openQuestions.filter((q) => q.id === 'currently-offered');
  const open = plan.openQuestions.filter((q) => q.id !== 'currently-offered');
  return (
    <section id="next-open" aria-labelledby="next-open-title" className="scroll-mt-32 pt-20 lg:scroll-mt-24">
      <StageHeading id="next-open-title" n="II">What is still open</StageHeading>
      {plan.state === 'empty' ? (
        <p className="mt-3 max-w-[38em] text-[16px] leading-relaxed text-ivory/90">Questions appear here once you keep an option. Each one says what we could not confirm, and why.</p>
      ) : (
        <>
          {offered.length > 0 && (
            <div data-open-group="offered" className="mt-6">
              <StatusLabel state="partial" />
              <div className="mt-2 border-b border-ivory/20">{offered.map((q) => <QuestionBlock key={q.id} q={q} open={wide} />)}</div>
            </div>
          )}
          {open.length > 0 && (
            <div data-open-group="unknown" className="mt-6">
              <StatusLabel state="unverified" />
              <div className="mt-2 border-b border-ivory/20">{open.map((q) => <QuestionBlock key={q.id} q={q} open={wide} />)}</div>
            </div>
          )}
          {plan.notApplicable.length > 0 && (
            <div data-open-group="not-applicable" className="mt-8">
              <h4 className="font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-ivory/90">Not applicable to this kind of option</h4>
              <div className="mt-2 border-b border-ivory/20">{plan.notApplicable.map((q) => <QuestionBlock key={q.id} q={q} open={false} />)}</div>
            </div>
          )}
          <p className="mt-6 max-w-[38em] text-[15px] leading-relaxed text-ivory/90">A gap means we have not confirmed it. It says nothing good or bad about the option.</p>
        </>
      )}
    </section>
  );
}
