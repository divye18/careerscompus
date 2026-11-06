'use client';

import { ArrowUpRight, Check } from 'lucide-react';
import { STEP_GROUPS, type ActionPlan, type NextStep } from '@/content/actionPlan';
import { focusRing } from '../compare/AddToCompare';
import { StatusLabel } from '../StatusLabel';
import { returnTo } from './returnTo';
import { StageHeading } from './StageHeading';

const link = `inline-flex min-h-[44px] items-center gap-1 rounded-atlas-sm font-mono text-[11px] uppercase tracking-[0.12em] text-ivory underline decoration-ivory/40 underline-offset-4 hover:decoration-ivory ${focusRing}`;

function Step({ s, n, done, onToggle }: { s: NextStep; n: number; done: boolean; onToggle: (s: NextStep) => void }) {
  return (
    <li data-step={s.id} className="flex gap-3 border-t border-ivory/20 py-3">
      <button
        type="button"
        data-no-print
        aria-pressed={done}
        aria-label={`Mark as done: ${s.text}`}
        onClick={() => onToggle(s)}
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-pill ${focusRing}`}
      >
        <span aria-hidden="true" className={`grid h-6 w-6 place-items-center rounded-pill border transition-colors ${done ? 'border-cyan text-cyan' : 'border-ivory/70 hover:border-ivory'}`}>
          {done && <Check className="h-4 w-4" />}
        </span>
      </button>
      <div className="min-w-0 flex-1 pt-2.5">
        <p className="text-[16px] leading-snug text-ivory">
          <span aria-hidden="true" className="mr-2 font-mono text-[13px] text-champagne">{n}</span>
          {s.text}
          {done && <span className="ml-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/90">Your note: done</span>}
        </p>
        {s.sources.length > 0 && (
          <ul className="mt-2">
            {s.sources.map((x) => (
              <li key={x.institutionId} data-source={x.institutionId} className="border-t border-ivory/10 py-2">
                <a href={x.href} target="_blank" rel="noopener noreferrer" className={link}>
                  {x.institution} official website <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <p className="text-[14px] leading-snug text-ivory/90">To look up: {x.questions.join(', ')}.</p>
              </li>
            ))}
          </ul>
        )}
        {s.targetId && <button type="button" data-no-print className={link} onClick={() => returnTo(s.targetId!)}>Go there</button>}
      </div>
    </li>
  );
}

export function NextStage({ plan, completed, onToggle }: { plan: ActionPlan; completed: readonly string[]; onToggle: (s: NextStep) => void }) {
  const groups = STEP_GROUPS.map((g) => ({ ...g, steps: plan.steps.filter((s) => s.group === g.id) })).filter((g) => g.steps.length);
  return (
    <section id="next-steps" aria-labelledby="next-steps-title" className="scroll-mt-32 pt-20 lg:scroll-mt-24">
      <StageHeading id="next-steps-title" n="III">What you could do next</StageHeading>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <StatusLabel state="orientation" />
        <p className="text-[15px] text-ivory/90">General guidance, in the order tasks depend on each other. It does not say which option to choose. Ticking a step is your own note and changes no label.</p>
      </div>
      {groups.map((g) => (
        <div key={g.id} data-step-group={g.id} className="mt-7">
          <h4 className="font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-ivory/90">{g.label}</h4>
          <ol className="mt-2 border-b border-ivory/20">
            {g.steps.map((s) => <Step key={s.id} s={s} n={plan.steps.indexOf(s) + 1} done={completed.includes(s.id)} onToggle={onToggle} />)}
          </ol>
        </div>
      ))}
    </section>
  );
}
