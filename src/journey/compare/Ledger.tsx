'use client';

import { GROUP_LABELS, GROUP_ORDER, type Cell, type CompareMode, type CompareOption, type GroupId, type LedgerRow } from '@/content/comparison';
import { Figures } from '../Figures';
import { StatusLabel } from '../StatusLabel';
import { focusRing } from './AddToCompare';

/**
 * The ledger, drawn two ways from the same rows:
 *  - LedgerTable: a real <table> for wide screens (sticky column names, row headers, one body per group);
 *  - LedgerStack: phones. One block per parameter with its label always visible, every value named by its option.
 * Only one is displayed at a time (display:none hides the other from assistive tech too).
 *
 * Rows where NOTHING is confirmed for any option are not drawn as empty table rows. They are listed once, in words,
 * with the reason, in <MissingList>, so absence does not dominate the comparison. Nothing is hidden: every parameter
 * still appears, either as a row or in that list. There are no totals, scores or winners.
 *
 * Status vocabulary is the shared four (StatusLabel): Verified, Partially verified (partial lists), Orientation,
 * Not verified. "Not applicable" is not a verification state, so it is plain words with its reason.
 */

const ROMAN: Record<GroupId, string> = { identity: 'I', academic: 'II', financial: 'III', outcomes: 'IV' };

const hostPath = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** Evidence for a verified value: a native disclosure, so it works by touch, keyboard and screen reader. */
function Evidence({ cell, what, partial }: { cell: Extract<Cell, { state: 'verified' }>; what: string; partial: boolean }) {
  return (
    <details className="mt-1">
      <summary className={`inline-flex min-h-[44px] cursor-pointer list-none items-center gap-2 rounded-atlas-sm lg:min-h-[28px] [&::-webkit-details-marker]:hidden ${focusRing}`}>
        <StatusLabel state={partial ? 'partial' : 'verified'} />
        <span aria-hidden="true" className="font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/75 underline decoration-ivory/40 underline-offset-4">Source</span>
        <span className="sr-only">. Show the source for {what}</span>
      </summary>
      <div className="mt-1 space-y-2 border-l border-champagne/40 pl-3 text-[13px] leading-snug text-ivory/85">
        {cell.derived && <p>{cell.derived}</p>}
        {cell.sources.map((s) => (
          <div key={`${s.field}-${s.url}`}>
            {s.quote && <p className="italic text-ivory/90">“{s.quote}”</p>}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] items-center break-all rounded-atlas-sm underline decoration-champagne/70 lg:min-h-[28px] underline-offset-2 hover:decoration-ivory ${focusRing}`}>
              {hostPath(s.url)}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        ))}
        {!cell.sources.length && <p>This address loaded when we last checked it.</p>}
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/75">Last checked {cell.lastVerified}</p>
      </div>
    </details>
  );
}

function CellBody({ cell, figure, partial, what }: { cell: Cell; figure: boolean; partial: boolean; what: string }) {
  switch (cell.state) {
    case 'verified':
      return (
        <>
          {cell.href ? (
            <a href={cell.href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] items-center break-all rounded-atlas-sm text-[15px] lg:min-h-[28px] text-ivory underline decoration-champagne underline-offset-4 hover:decoration-ivory ${focusRing}`}>
              {cell.value}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <p className={figure ? 'font-atlas text-[28px] leading-none text-ivory' : 'text-[15px] leading-snug text-ivory'}>{figure ? <Figures>{cell.value}</Figures> : cell.value}</p>
          )}
          <Evidence cell={cell} what={what} partial={partial || Boolean(cell.partial)} />
        </>
      );
    case 'orientation':
      return (
        <>
          <p className="text-[15px] leading-snug text-ivory/90">{cell.value}</p>
          <StatusLabel state="orientation" className="mt-1.5" />
        </>
      );
    case 'unavailable':
      return (
        <>
          <StatusLabel state="unverified" />
          <p className="mt-1 text-[13px] leading-snug text-ivory/80">{cell.reason}</p>
        </>
      );
    case 'notApplicable':
      return (
        <>
          <p className="text-[14px] leading-snug text-ivory/80">Not applicable</p>
          <p className="mt-1 text-[13px] leading-snug text-ivory/75">{cell.reason}</p>
        </>
      );
  }
}

const DiffMark = () => <span className="mt-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-cyan">Verified values differ</span>;

const grouped = (rows: readonly LedgerRow[]) => GROUP_ORDER.map((g) => ({ id: g, rows: rows.filter((r) => r.group === g) })).filter((g) => g.rows.length);

/** A row has something to show when at least one cell is verified or orientation. */
export const hasData = (r: LedgerRow) => r.cells.some((c) => c.state === 'verified' || c.state === 'orientation');

export function LedgerTable({ mode, options, rows }: { mode: CompareMode; options: readonly CompareOption[]; rows: readonly LedgerRow[] }) {
  const n = options.length;
  return (
    <table className="hidden w-full table-fixed border-separate border-spacing-0 border-t-2 border-champagne/70 bg-ink-900 lg:table">
      <caption className="sr-only">Comparison of {options.map((o) => `${o.title} ${o.subtitle}`).join(', ')}. Parameters with nothing confirmed are listed after the table.</caption>
      <colgroup>
        <col className={n === 1 ? 'w-[34%]' : 'w-[24%]'} />
        {options.map((o) => (
          <col key={o.id} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className="sticky top-16 z-10 border-b border-champagne/40 bg-ink-900 px-5 py-3 text-left align-bottom font-mono text-[11px] font-normal uppercase tracking-[0.18em] text-ivory/75">
            Parameter
          </th>
          {options.map((o) => (
            <th key={o.id} scope="col" className="sticky top-16 z-10 border-b border-l border-b-champagne/40 border-l-ivory/10 bg-ink-900 px-5 py-3 text-left align-bottom font-normal">
              <span className="block font-atlas text-[24px] leading-[1.05] text-ivory">{o.title}</span>
              <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">{o.subtitle}</span>
            </th>
          ))}
        </tr>
      </thead>
      {grouped(rows).map((g) => (
        <tbody key={g.id}>
          <tr>
            <th colSpan={n + 1} scope="rowgroup" className="border-b border-ivory/10 px-5 pb-2 pt-6 text-left font-atlas text-[22px] font-normal italic text-champagne">
              <span aria-hidden="true" className="mr-2 font-mono text-[11px] not-italic tracking-[0.14em] text-ivory/75">{ROMAN[g.id]}</span>
              {GROUP_LABELS[mode][g.id]}
            </th>
          </tr>
          {g.rows.map((r) => (
            <tr key={r.id} data-row={r.id} data-differs={r.differs ? 'true' : undefined}>
              <th scope="row" className="border-b border-ivory/10 px-5 py-3.5 text-left align-top font-normal">
                <span className="block font-mono text-[11px] uppercase leading-snug tracking-[0.12em] text-ivory/90">{r.label}</span>
                {r.note && <span className="mt-1 block text-[12px] leading-snug text-ivory/75">{r.note}</span>}
                {r.differs && <DiffMark />}
              </th>
              {r.cells.map((c, i) => (
                <td
                  key={options[i].id}
                  data-state={c.state}
                  className={`border-b border-b-ivory/10 px-5 py-3.5 align-top ${r.differs && c.state === 'verified' ? 'border-l-2 border-l-cyan' : 'border-l border-l-ivory/10'}`}
                >
                  <CellBody cell={c} figure={r.figure} partial={r.partial} what={`${r.label} at ${options[i].title}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

export function LedgerStack({ mode, options, rows }: { mode: CompareMode; options: readonly CompareOption[]; rows: readonly LedgerRow[] }) {
  return (
    <div className="border-t-2 border-champagne/70 bg-ink-900 lg:hidden">
      {grouped(rows).map((g) => (
        <section key={g.id} aria-label={GROUP_LABELS[mode][g.id]}>
          <h3 className="px-4 pb-1 pt-5 font-atlas text-[22px] font-normal italic text-champagne">
            <span aria-hidden="true" className="mr-2 font-mono text-[11px] not-italic tracking-[0.14em] text-ivory/75">{ROMAN[g.id]}</span>
            {GROUP_LABELS[mode][g.id]}
          </h3>
          {g.rows.map((r) => (
            <div key={r.id} data-row={r.id} data-differs={r.differs ? 'true' : undefined} className="border-t border-ivory/10 px-4 py-3.5">
              <h4 className="font-mono text-[11px] font-normal uppercase leading-snug tracking-[0.12em] text-ivory/90">{r.label}</h4>
              {r.note && <p className="mt-1 text-[12px] leading-snug text-ivory/75">{r.note}</p>}
              {r.differs && <DiffMark />}
              <dl className="mt-2.5 space-y-3">
                {r.cells.map((c, i) => (
                  <div key={options[i].id} data-state={c.state} className={r.differs && c.state === 'verified' ? 'border-l-2 border-cyan pl-3' : 'border-l-2 border-transparent pl-3'}>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">{options[i].title}</dt>
                    <dd className="mt-1">
                      <CellBody cell={c} figure={r.figure} partial={r.partial} what={`${r.label} at ${options[i].title}`} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

/** Reasons for a row with nothing confirmed, named by option only when the reasons differ. */
function reasonsFor(r: LedgerRow, options: readonly CompareOption[]): string[] {
  const pairs = r.cells.map((c, i) => ({ who: options[i].title, reason: 'reason' in c ? c.reason : '' }));
  const unique = [...new Set(pairs.map((p) => p.reason))];
  if (unique.length <= 1) return unique;
  return pairs.map((p) => `${p.who}: ${p.reason}`);
}

/** Parameters with nothing confirmed for any option, stated once each with the reason. */
export function MissingList({ mode, options, rows }: { mode: CompareMode; options: readonly CompareOption[]; rows: readonly LedgerRow[] }) {
  if (!rows.length) return null;
  const notApplicable = rows.filter((r) => r.cells.every((c) => c.state === 'notApplicable'));
  const unverified = rows.filter((r) => !notApplicable.includes(r));
  const block = (list: readonly LedgerRow[], heading: React.ReactNode, id: string) =>
    list.length ? (
      <section aria-labelledby={id} className="mt-8 first:mt-0">
        <h4 id={id} className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-ivory/80">
          {heading}
        </h4>
        <dl className="mt-3 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {list.map((r) => (
            <div key={r.id} data-row={r.id} className="border-t border-ivory/15 pt-3">
              <dt className="text-[15px] leading-snug text-ivory">
                {r.label}
                <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/75">{GROUP_LABELS[mode][r.group]}</span>
              </dt>
              {reasonsFor(r, options).map((t) => (
                <dd key={t} className="mt-1 text-[13px] leading-snug text-ivory/80">
                  {t}
                </dd>
              ))}
            </div>
          ))}
        </dl>
      </section>
    ) : null;
  return (
    <div className="mt-10" data-missing-list>
      <h3 className="font-atlas text-[26px] font-normal italic leading-tight text-champagne">What we cannot tell you yet</h3>
      <p className="mt-1 max-w-2xl text-[14px] leading-snug text-ivory/85">Nothing is confirmed on these parameters for any of the options. Missing information says nothing good or bad about them.</p>
      <div className="mt-5">
        {block(unverified, <><StatusLabel state="unverified" /><span className="normal-case tracking-normal">for every option compared</span></>, 'missing-unverified')}
        {block(notApplicable, <span>Not applicable to this kind of comparison</span>, 'missing-na')}
      </div>
    </div>
  );
}
