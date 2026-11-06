'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import { SCENE_NAME, STANDING_EVIDENCE_NOTE, buildActionPlan, planAsText, type NextStep } from '@/content/actionPlan';
import { focusRing, secondaryBtn } from '../compare/AddToCompare';
import { compareActions, useCompare } from '../compare/compareStore';
import { stepActions, useCompletedSteps } from './actionStore';
import { KeptStage, type Removed } from './KeptStage';
import { NextStage } from './NextStage';
import { OpenStage } from './OpenStage';

/**
 * SCENE 7 (internal name: Career Action Studio; students see "Next Steps"). A route sheet on Deep Aubergine: what the student
 * chose to keep, what is still open for those options, and what they could do next. It never recommends or ranks, and
 * needs no WebGL. All logic is in src/content/actionPlan.ts. Natural scroll only: one meridian follows the scroll
 * (transform only) and React state changes only at stage boundaries.
 */
const STAGES = [
  { id: 'next-kept', label: 'Kept', n: 'I' },
  { id: 'next-open', label: 'Still open', n: 'II' },
  { id: 'next-steps', label: 'Next', n: 'III' },
] as const;

export function ActionStudio() {
  const compare = useCompare();
  const completed = useCompletedSteps();
  const plan = useMemo(() => buildActionPlan(compare.selections), [compare.selections]);
  const reduce = useReducedMotion() ?? false;
  const sheet = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sheet, offset: ['start 0.85', 'end 0.7'] });
  const [stage, setStage] = useState<string | null>(null);
  const [removed, setRemoved] = useState<Removed | null>(null);
  const [copy, setCopy] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    // A stage is current only while it crosses the band. Outside all three (the opening, or above or below the scene), none is.
    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target.id);
          else inBand.delete(e.target.id);
        }
        setStage(STAGES.find((s) => inBand.has(s.id))?.id ?? null);
      },
      { rootMargin: '-40% 0px -59% 0px', threshold: 0 }
    );
    STAGES.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const text = planAsText(plan, completed);
  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopy('copied');
      setAnnounce('Your sheet was copied as text.');
    } catch {
      setCopy('failed');
      setAnnounce('Copying was blocked. The text is shown below to select.');
    }
  };
  const printPlan = () => {
    document.querySelectorAll<HTMLDetailsElement>('#act-next-steps details').forEach((d) => {
      d.open = true;
    });
    document.body.classList.add('cc-print-sheet');
    window.addEventListener('afterprint', () => document.body.classList.remove('cc-print-sheet'), { once: true });
    window.print();
  };
  const remove = (r: Removed) => {
    compareActions.remove(r.mode, r.id);
    setRemoved(r);
    setAnnounce(`${r.name} was removed from what you kept.`);
  };
  const undo = () => {
    if (!removed) return;
    const mode = compare.mode;
    compareActions.add(removed.mode, removed.id);
    compareActions.setMode(mode);
    setAnnounce(`${removed.name} was put back.`);
    setRemoved(null);
  };
  const toggle = (s: NextStep) => {
    const wasDone = completed.includes(s.id);
    stepActions.toggle(s.id);
    setAnnounce(`${wasDone ? 'Marked as not done' : 'Marked as done'}: ${s.text}`);
  };

  return (
    <section
      id="act-next-steps"
      data-print-sheet
      data-plan-state={plan.state}
      aria-labelledby="next-title"
      data-header-theme="night"
      className="relative -mt-px scroll-mt-16 overflow-x-clip bg-[linear-gradient(to_bottom,var(--handoff-top)_0,var(--color-aubergine)_220px,var(--color-aubergine)_calc(100%-220px),var(--handoff-top)_100%)] pb-24 pt-20 sm:pb-32 sm:pt-28"
    >
      <div ref={sheet} className="relative mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:pr-[clamp(72px,9vw,150px)]">
        <motion.div
          aria-hidden="true"
          data-no-print
          data-meridian
          style={{ scaleY: reduce ? 1 : scrollYProgress }}
          className="pointer-events-none absolute bottom-0 left-2 top-0 w-px origin-top bg-champagne/70 sm:left-4 lg:static lg:col-start-2 lg:row-span-2 lg:row-start-1"
        />

        <header className="pl-5 sm:pl-6 lg:col-start-2 lg:row-start-1 lg:min-h-[52vh] lg:content-end lg:pl-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-champagne sm:text-xs">
            07 <span aria-hidden="true" className="mx-2 text-silver">—</span> {SCENE_NAME}
          </p>
          <h2 id="next-title" className="mt-3 font-atlas text-[clamp(42px,9vw,64px)] font-normal leading-[1] tracking-[-0.012em] text-ivory lg:text-[clamp(56px,5.2vw,80px)]">
            <span className="block">Turn what you found</span>
            <span className="block italic text-champagne">into what you check next.</span>
          </h2>
          <p className="mt-6 max-w-[34em] text-[17px] leading-relaxed text-ivory/90">
            This sheet holds only what you chose to keep. It does not know your marks or your eligibility, and it does not recommend an option.
          </p>
        </header>

        <nav
          aria-label="Sections of your sheet"
          data-no-print
          className="sticky top-16 z-20 -mx-5 mt-8 border-y border-ivory/15 bg-aubergine px-5 sm:-mx-8 sm:px-8 lg:top-24 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:mt-0 lg:self-start lg:border-0 lg:bg-transparent lg:px-0"
        >
          <ol className="flex lg:flex-col lg:gap-1">
            {STAGES.map((s) => (
              <li key={s.id} className="flex-1 lg:flex-none">
                <a
                  href={`#${s.id}`}
                  aria-current={stage === s.id ? 'location' : undefined}
                  className={`flex min-h-[44px] items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors lg:justify-start ${focusRing} ${stage === s.id ? 'text-ivory underline decoration-cyan decoration-2 underline-offset-8 lg:no-underline' : 'text-ivory/85 hover:text-ivory'}`}
                >
                  <span aria-hidden="true" className="hidden w-6 text-champagne lg:inline">{s.n}</span>
                  {s.label}
                  {stage === s.id && <span aria-hidden="true" className="ml-1 hidden h-2 w-2 rounded-pill bg-cyan lg:inline-block" />}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="pl-5 sm:pl-6 lg:col-start-2 lg:row-start-2 lg:pl-12">
          <KeptStage plan={plan} removed={removed} onRemove={remove} onUndo={undo} />
          <OpenStage plan={plan} />
          <NextStage plan={plan} completed={completed} onToggle={toggle} />

          <div className="mt-14 border-t border-ivory/25 pt-6">
            <p className="max-w-[46em] text-[15px] leading-relaxed text-ivory/90">{STANDING_EVIDENCE_NOTE}</p>
            <div data-no-print className="mt-5 flex flex-wrap gap-2.5">
              <button type="button" onClick={copyPlan} className={secondaryBtn}>Copy as text</button>
              <button type="button" onClick={printPlan} className={`${secondaryBtn} max-lg:hidden`}>Print this sheet</button>
            </div>
            {copy === 'copied' && <p data-no-print className="mt-3 text-[14px] text-ivory/90">Copied. Nothing was sent anywhere.</p>}
            {copy === 'failed' && (
              <label data-no-print className="mt-3 block text-[14px] text-ivory/90">
                Copying was blocked by your browser. Select this text instead:
                <textarea readOnly value={text} rows={8} className={`mt-2 block w-full rounded-atlas-sm border border-ivory/30 bg-transparent p-3 font-mono text-[12px] text-ivory ${focusRing}`} />
              </label>
            )}
          </div>
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{announce}</p>
    </section>
  );
}
