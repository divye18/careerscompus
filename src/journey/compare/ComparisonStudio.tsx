'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Plus } from 'lucide-react';
import {
  GROUP_LABELS,
  GROUP_ORDER,
  MAX_COLUMNS,
  PROGRAMMES,
  ledgerRows,
  optionFor,
  parametersFor,
  pickerGroups,
  programmesAreUnlike,
  type CompareMode,
  type CompareOption,
  type LedgerView,
} from '@/content/comparison';
import { INSTITUTIONS } from '@/content/institutions';
import { goTo } from '../scroll';
import { StatusLabel } from '../StatusLabel';
import { focusRing, secondaryBtn } from './AddToCompare';
import { compareActions, useCompare } from './compareStore';
import { LedgerStack, LedgerTable, MissingList, hasData } from './Ledger';
import { StudioIntro } from './StudioIntro';

/**
 * SCENE 6 — The Comparison Studio. A decision-making ledger: up to three options side by side, in three modes
 * (universities, courses, programmes = a verified institution + course pair). It reads the shared store, so options
 * added in Scenes 4 and 5 are already here. Logic and wording of the data states live in src/content/comparison.ts.
 * It never ranks, scores or declares a winner, and it needs no WebGL.
 */

const MODES: readonly { id: CompareMode; label: string; noun: string; aNoun: string }[] = [
  { id: 'institutions', label: 'Universities', noun: 'institution', aNoun: 'an institution' },
  { id: 'courses', label: 'Courses', noun: 'course', aNoun: 'a course' },
  { id: 'programmes', label: 'Programmes', noun: 'programme', aNoun: 'a programme' },
];
const VIEWS: readonly { id: LedgerView; label: string; short: string }[] = [
  { id: 'all', label: 'All parameters', short: 'All' },
  { id: 'verified', label: 'Verified parameters', short: 'Verified' },
  { id: 'differences', label: 'Differences only', short: 'Differences' },
];

const toggleBtn = (on: boolean) =>
  `inline-flex min-h-[44px] items-center rounded-atlas-sm border px-2.5 text-[14px] transition-colors sm:px-3.5 ${focusRing} ${on ? 'border-cyan text-ivory' : 'border-ivory/20 text-ivory/85 hover:border-ivory/50 hover:text-ivory'}`;
const slotAction = `inline-flex min-h-[44px] items-center rounded-atlas-sm px-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/85 hover:text-ivory ${focusRing}`;

type PickerTarget = { slot: number; replacing: string | null };

function Picker({ mode, aNoun, target, selected, onPick, onClose }: { mode: CompareMode; aNoun: string; target: PickerTarget; selected: readonly string[]; onPick: (id: string) => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => pickerGroups(mode), [mode]);
  const replacing = target.replacing ? optionFor(mode, target.replacing) : null;

  // move focus into the chooser when it opens, so keyboard users land on it
  useEffect(() => {
    box.current?.querySelector<HTMLButtonElement>('button[data-option]:not(:disabled)')?.focus();
  }, [target]);

  return (
    <div
      ref={box}
      role="group"
      aria-label={replacing ? `Choose a replacement for ${replacing.title}` : `Choose ${aNoun}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
      className="mt-4 border-t border-champagne/50 pt-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-atlas text-[24px] leading-tight text-ivory">{replacing ? `Replace ${replacing.title} with…` : `Choose ${aNoun}`}</p>
        <button type="button" onClick={onClose} className={slotAction}>
          Close
        </button>
      </div>
      {mode === 'programmes' && (
        <p className="mt-1 text-[13px] leading-snug text-ivory/80">Only programmes confirmed on an institution’s own pages can be compared here. This list is partial, not a full catalogue.</p>
      )}
      {mode === 'courses' && <p className="mt-1 text-[13px] leading-snug text-ivory/80">These are the general course pathways from earlier in the journey. They are orientation, not verified records.</p>}
      <div className="mt-4 gap-8 sm:columns-2 lg:columns-3 xl:columns-4">
        {groups.map((g) => (
          <div key={g.label} className="mb-5 break-inside-avoid">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">{g.label}</p>
            <ul className="mt-1">
              {g.options.map((o) => {
                const taken = selected.includes(o.id);
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      data-option={o.id}
                      disabled={taken}
                      onClick={() => onPick(o.id)}
                      className={`w-full min-h-[44px] rounded-atlas-sm py-1.5 text-left text-[15px] leading-snug text-ivory/90 hover:text-ivory disabled:cursor-not-allowed disabled:text-ivory/50 ${focusRing}`}
                    >
                      {o.title}
                      {mode === 'programmes' && <span className="sr-only"> {o.subtitle}</span>}
                      {taken && <span className="ml-1.5 font-mono text-[11px] uppercase tracking-wider"> In comparison</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {mode === 'institutions' && <p className="mt-4 font-mono text-[11px] leading-relaxed tracking-wide text-ivory/75">No international institutions have been verified yet.</p>}
    </div>
  );
}

function Slot({
  i,
  option,
  noun,
  active,
  onAdd,
  onReplace,
  onRemove,
  onAtlas,
}: {
  i: number;
  option: CompareOption | null;
  noun: string;
  active: boolean;
  onAdd: () => void;
  onReplace: () => void;
  onRemove: () => void;
  onAtlas: () => void;
}) {
  if (!option) {
    return (
      <button
        type="button"
        data-slot={i}
        aria-expanded={active}
        onClick={onAdd}
        className={`flex min-h-[64px] items-center gap-3 rounded-atlas border border-dashed px-4 py-3 text-left transition-colors lg:min-h-[132px] ${focusRing} ${active ? 'border-cyan' : 'border-ivory/30 hover:border-ivory/60'}`}
      >
        <Plus aria-hidden="true" className="h-6 w-6 shrink-0 text-champagne" />
        <span>
          <span className="block text-[15px] font-semibold text-ivory">Add {noun}</span>
          {i === 2 && <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-ivory/75">Optional</span>}
        </span>
      </button>
    );
  }
  return (
    <div className={`border-t-2 pb-2 pt-3 ${active ? 'border-cyan' : 'border-champagne/60'}`}>
      <p className="font-atlas text-[24px] leading-[1.05] text-ivory">{option.title}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">{option.subtitle}</p>
      <div className="mt-1.5 -ml-1.5 flex flex-wrap gap-x-1">
        <button type="button" data-slot={i} aria-label={`Replace ${option.title}`} aria-expanded={active} onClick={onReplace} className={slotAction}>
          Replace
        </button>
        <button type="button" aria-label={`Remove ${option.title}`} onClick={onRemove} className={slotAction}>
          Remove
        </button>
        {option.atlasId && (
          <button type="button" aria-label={`View ${option.title} ${option.subtitle} on the atlas`} onClick={onAtlas} className={slotAction}>
            Atlas
          </button>
        )}
        {option.website && (
          <a href={option.website} target="_blank" rel="noopener noreferrer" aria-label={`Official website of ${option.title} ${option.subtitle} (opens in a new tab)`} className={slotAction}>
            Website
            <ArrowUpRight aria-hidden="true" className="ml-1 h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export function ComparisonStudio() {
  const s = useCompare();
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [paramsOpen, setParamsOpen] = useState(false);

  const mode = s.mode;
  const meta = MODES.find((m) => m.id === mode)!;
  const ids = s.selections[mode];
  const options = useMemo(() => ids.map((id) => optionFor(mode, id)).filter((o): o is CompareOption => Boolean(o)), [ids, mode]);
  const allRows = useMemo(() => (ids.length ? ledgerRows(mode, ids) : []), [ids, mode]);
  const params = useMemo(() => parametersFor(mode), [mode]);

  const chosen = allRows.filter((r) => !s.hidden.includes(r.id));
  const rows = chosen.filter((r) => (s.view === 'all' ? true : s.view === 'verified' ? r.anyVerified : r.differs));
  const dataRows = rows.filter(hasData);
  const emptyRows = rows.filter((r) => !hasData(r));
  const verifiedCount = chosen.filter((r) => r.anyVerified).length;
  const diffCount = chosen.filter((r) => r.differs).length;
  const shownParams = params.filter((p) => !s.hidden.includes(p.id)).length;
  const canReset = ids.length > 0 || s.view !== 'all' || s.hidden.length > 0;

  const closePicker = (slot: number | null) => {
    setPicker(null);
    if (slot !== null) requestAnimationFrame(() => document.querySelector<HTMLElement>(`#studio-workspace [data-slot="${slot}"]`)?.focus());
  };

  const pick = (id: string) => {
    if (!picker) return;
    if (picker.replacing) compareActions.replace(mode, picker.replacing, id);
    else compareActions.add(mode, id);
    closePicker(picker.slot);
  };

  const openOnAtlas = (id: string) => {
    goTo('atlas-view');
    window.dispatchEvent(new CustomEvent('cc:atlas-open', { detail: id }));
  };

  const status =
    options.length === 0
      ? `Nothing to compare yet. Add ${meta.aNoun} to begin.`
      : `${options.length} of ${MAX_COLUMNS} options. Verified data on ${verifiedCount} of ${chosen.length} parameters.${options.length >= 2 ? (diffCount ? ` Verified values differ on ${diffCount}.` : ' No verified differences.') : ''}`;

  return (
    <section
      id="act-comparison"
      aria-label="Comparison studio"
      data-header-theme="night"
      className="relative -mt-px scroll-mt-16 overflow-x-clip bg-[linear-gradient(to_bottom,var(--handoff-top)_0%,var(--color-ink-950)_16%,var(--color-ink-950)_88%,var(--handoff-top)_100%)] pb-16 sm:pb-24"
    >
      <StudioIntro />

      <div id="studio-workspace" className="relative mx-auto mt-4 w-full max-w-[1240px] scroll-mt-20 px-5 sm:px-8 lg:pr-[clamp(72px,9vw,150px)]">
        {/* what is being compared + way back */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p id="studio-mode" className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">Compare</p>
            <ul aria-labelledby="studio-mode" className="mt-2 flex flex-wrap gap-2">
              {MODES.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    aria-pressed={mode === m.id}
                    onClick={() => {
                      compareActions.setMode(m.id);
                      setPicker(null);
                    }}
                    className={toggleBtn(mode === m.id)}
                  >
                    {m.label}
                    <span className="ml-2 font-mono text-[11px] text-ivory/75">{s.selections[m.id].length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {mode === 'courses' ? (
              <button type="button" onClick={() => goTo('act-courses')} className={secondaryBtn}>
                <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
                Return to pathways
              </button>
            ) : (
              <button type="button" aria-label="Return to the university atlas" onClick={() => goTo('atlas-view')} className={secondaryBtn}>
                <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />
                <span className="sm:hidden">University atlas</span>
                <span className="hidden sm:inline">Return to the university atlas</span>
              </button>
            )}
            <button
              type="button"
              disabled={!canReset}
              aria-label="Reset comparison"
              onClick={() => {
                compareActions.reset(mode);
                setPicker(null);
              }}
              className={secondaryBtn}
            >
              <span className="sm:hidden">Reset</span>
              <span className="hidden sm:inline">Reset comparison</span>
            </button>
          </div>
        </div>

        {/* the slots: add, replace, remove */}
        <div className="mt-5 grid gap-2.5 lg:mt-6 lg:grid-cols-3 lg:gap-3" aria-label={`Selected ${meta.noun}s`} role="group">
          {Array.from({ length: MAX_COLUMNS }, (_, i) => {
            const o = options[i] ?? null;
            return (
              <Slot
                key={o?.id ?? `empty-${i}`}
                i={i}
                option={o}
                noun={meta.noun}
                active={picker?.slot === i}
                onAdd={() => setPicker(picker?.slot === i ? null : { slot: i, replacing: null })}
                onReplace={() => setPicker(picker?.slot === i ? null : { slot: i, replacing: o!.id })}
                onRemove={() => {
                  compareActions.remove(mode, o!.id);
                  setPicker(null);
                }}
                onAtlas={() => openOnAtlas(o!.atlasId!)}
              />
            );
          })}
        </div>
        {picker && <Picker mode={mode} aNoun={meta.aNoun} target={picker} selected={ids} onPick={pick} onClose={() => closePicker(picker.slot)} />}

        {/* how to read it */}
        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <ul aria-label="Which parameters to show" className="flex flex-wrap gap-2">
            {VIEWS.map((v) => (
              <li key={v.id}>
                <button type="button" aria-pressed={s.view === v.id} aria-label={v.label} onClick={() => compareActions.setView(v.id)} className={toggleBtn(s.view === v.id)}>
                  <span className="sm:hidden">{v.short}</span>
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" aria-expanded={paramsOpen} aria-controls="studio-params" onClick={() => setParamsOpen((o) => !o)} className={secondaryBtn}>
            Choose parameters ({shownParams}/{params.length})
          </button>
        </div>

        {paramsOpen && (
          <div id="studio-params" className="mt-4 grid gap-5 border-t border-ivory/15 pt-5 sm:grid-cols-2 xl:grid-cols-4">
            {GROUP_ORDER.map((g) => {
              const list = params.filter((p) => p.group === g);
              const allOn = list.every((p) => !s.hidden.includes(p.id));
              return (
                <div key={g}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-atlas text-[20px] italic leading-tight text-champagne">{GROUP_LABELS[mode][g]}</p>
                    <button
                      type="button"
                      aria-label={`${allOn ? 'Hide' : 'Show'} all ${GROUP_LABELS[mode][g]} parameters`}
                      onClick={() => compareActions.setParams(list.map((p) => p.id), !allOn)}
                      className={slotAction}
                    >
                      {allOn ? 'Hide all' : 'Show all'}
                    </button>
                  </div>
                  <ul className="mt-1">
                    {list.map((p) => {
                      const on = !s.hidden.includes(p.id);
                      return (
                        <li key={p.id}>
                          <button type="button" aria-pressed={on} onClick={() => compareActions.toggleParam(p.id)} className={`flex min-h-[44px] w-full items-center gap-2.5 rounded-atlas-sm text-left text-[14px] ${on ? 'text-ivory' : 'text-ivory/75'} ${focusRing}`}>
                            <span aria-hidden="true" className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-pill border ${on ? 'border-cyan text-cyan' : 'border-ivory/40'}`}>{on && <Check className="h-3 w-3" />}</span>
                            {p.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* legend: the shared status labels, in words (never hover-only) */}
        <dl className="mt-5 grid gap-x-8 gap-y-3 text-[13px] leading-snug text-ivory/80 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <dt><StatusLabel state="verified" /></dt>
            <dd className="mt-1">Confirmed on an official source. Each shows its source and the date we last checked it. A list that shows only what was confirmed is marked Partially verified.</dd>
          </div>
          <div>
            <dt><StatusLabel state="unverified" /></dt>
            <dd className="mt-1">We have not confirmed it yet. It says nothing good or bad about the option.</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/80">Not applicable</dt>
            <dd className="mt-1">The field does not apply to this kind of option, so it is not a verification state.</dd>
          </div>
          {mode === 'courses' && (
            <div>
              <dt><StatusLabel state="orientation" /></dt>
              <dd className="mt-1">General guidance about a course. It has not been independently verified, so it is never treated as verified.</dd>
            </div>
          )}
        </dl>

        <p role="status" aria-live="polite" className="mt-5 font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-ivory/85">
          {status}
        </p>
        {mode === 'programmes' && ids.length >= 2 && programmesAreUnlike(ids) && (
          <p className="mt-2 text-[14px] leading-snug text-ivory/85">These are different kinds of programme, so they may not be alternatives to each other.</p>
        )}

        {/* the ledger */}
        <div className="mt-4">
          {options.length === 0 ? (
            <div className="border-t-2 border-champagne/70 bg-ink-900 px-5 py-8">
              <p className="font-atlas text-[30px] leading-[1.1] text-ivory">Your ledger is empty.</p>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ivory/85">
                {mode === 'institutions' && `Add two or three of the ${INSTITUTIONS.length} verified institutions above, or add them from the university atlas as you explore.`}
                {mode === 'courses' && 'Add two or three course pathways above, or add a course from the pathway chart as you explore it.'}
                {mode === 'programmes' && `Add two or three of the ${PROGRAMMES.length} programmes confirmed so far. Only verified institution and course pairs are offered.`}
              </p>
              <dl className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {GROUP_ORDER.map((g) => (
                  <div key={g}>
                    <dt className="font-atlas text-[20px] italic text-champagne">{GROUP_LABELS[mode][g]}</dt>
                    <dd className="mt-1 text-[13px] leading-snug text-ivory/75">{params.filter((p) => p.group === g).map((p) => p.label).join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : rows.length === 0 ? (
            <div className="border-t-2 border-champagne/70 bg-ink-900 px-5 py-8">
              <p className="font-atlas text-[26px] leading-[1.1] text-ivory">
                {s.view === 'differences' ? (options.length < 2 ? 'Add another option to see differences.' : 'No verified differences to show.') : s.view === 'verified' ? 'No verified parameters to show.' : 'No parameters selected.'}
              </p>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ivory/85">
                {s.view === 'differences' && options.length >= 2 && 'This does not mean these options are the same. A difference appears only when at least two verified values disagree, and missing values never count.'}
                {s.view === 'differences' && mode === 'courses' && ' Course pathways are orientation rather than verified records, so they do not produce differences.'}
                {s.view === 'verified' && 'Nothing in the chosen parameters has a verified value for these options yet.'}
                {s.view === 'all' && 'Use Choose parameters to switch some back on.'}
              </p>
              {s.view !== 'all' && (
                <button type="button" onClick={() => compareActions.setView('all')} className={`${secondaryBtn} mt-4`}>
                  Show all parameters
                </button>
              )}
            </div>
          ) : (
            <>
              {dataRows.length > 0 ? (
                <>
                  <LedgerTable mode={mode} options={options} rows={dataRows} />
                  <LedgerStack mode={mode} options={options} rows={dataRows} />
                </>
              ) : (
                <p className="border-t-2 border-champagne/70 bg-ink-900 px-5 py-6 text-[15px] leading-relaxed text-ivory/90">Nothing about these options is confirmed on the parameters you chose yet.</p>
              )}
              <MissingList mode={mode} options={options} rows={emptyRows} />
            </>
          )}
        </div>

        {options.length === 1 && <p className="mt-3 text-[14px] leading-snug text-ivory/85">Add at least one more {meta.noun} to compare side by side.</p>}

        <p className="mt-6 max-w-3xl font-mono text-[11px] leading-relaxed tracking-wide text-ivory/75">
          This studio does not pick a winner. It shows what is confirmed, what is not, and where confirmed facts differ, so you can decide what matters to you. Always check details with the institution before you apply.
        </p>
      </div>
    </section>
  );
}
