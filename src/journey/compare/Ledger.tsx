'use client';

import { GROUP_LABELS, GROUP_ORDER, type Cell, type CompareMode, type CompareOption, type GroupId, type LedgerRow } from '@/content/comparison';
import { focusRing } from './AddToCompare';

/**
 * The ledger, drawn two ways from the same rows:
 *  - LedgerTable: a real <table> for wide screens (sticky column names, row headers, one body per group);
 *  - LedgerStack: phones. One block per parameter with its label always visible, every value named by its option.
 * Only one is displayed at a time (display:none hides the other from assistive tech too).
 * The ledger states every missing value in words, with the reason. There are no totals, scores or winners.
 */

const ROMAN: Record<GroupId, string> = { identity: 'I', academic: 'II', financial: 'III', outcomes: 'IV' };

const hostPath = (u: string) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** Evidence for a verified value: a native disclosure, so it works by touch, keyboard and screen reader. */
function Evidence({ cell, what }: { cell: Extract<Cell, { state: 'verified' }>; what: string }) {
  return (
    <details className="mt-1">
      <summary className={`inline-flex min-h-[44px] cursor-pointer list-none items-center gap-1.5 rounded-sm font-mono text-[10px] uppercase tracking-[0.14em] text-champagne hover:text-ivory lg:min-h-[28px] [&::-webkit-details-marker]:hidden ${focusRing}`}>
        <span aria-hidden="true">✓</span> Verified <span aria-hidden="true" className="text-ivory/75">· Source</span><span className="sr-only">. Show the source for {what}</span>
      </summary>
      <div className="mt-1 space-y-2 border-l border-champagne/40 pl-3 text-[13px] leading-snug text-ivory/85">
        {cell.derived && <p>{cell.derived}</p>}
        {cell.sources.map((s) => (
          <div key={`${s.field}-${s.url}`}>
            {s.quote && <p className="italic text-ivory/90">“{s.quote}”</p>}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[28px] items-center break-all rounded-sm underline decoration-champagne/70 underline-offset-2 hover:decoration-ivory ${focusRing}`}>
              {hostPath(s.url)}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        ))}
        {!cell.sources.length && <p>This address loaded when we last checked it.</p>}
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ivory/75">Last checked {cell.lastVerified}</p>
      </div>
    </details>
  );
}

function CellBody({ cell, figure, what }: { cell: Cell; figure: boolean; what: string }) {
  switch (cell.state) {
    case 'verified':
      return (
        <>
          {cell.href ? (
            <a href={cell.href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[28px] items-center break-all rounded-sm text-[15px] text-ivory underline decoration-champagne underline-offset-4 hover:decoration-ivory ${focusRing}`}>
              {cell.value}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <p className={figure ? 'font-atlas text-[28px] leading-none text-ivory' : 'text-[15px] leading-snug text-ivory'}>{cell.value}</p>
          )}
          <Evidence cell={cell} what={what} />
        </>
      );
    case 'orientation':
      return (
        <>
          <p className="text-[15px] leading-snug text-ivory/90">{cell.value}</p>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ivory/75">
            <span aria-hidden="true">◇ </span>Orientation, not verified
          </p>
        </>
      );
    case 'unavailable':
      return (
        <>
          <p className="text-[15px] leading-snug text-ivory/85">
            <span aria-hidden="true" className="mr-1.5 text-ivory/60">○</span>Not available
          </p>
          <p className="mt-1 text-[13px] leading-snug text-ivory/75">{cell.reason}</p>
        </>
      );
    case 'notApplicable':
      return (
        <>
          <p className="font-mono text-[11px] uppercase leading-snug tracking-[0.14em] text-ivory/80">
            <span aria-hidden="true" className="mr-1.5">–</span>Not applicable
          </p>
          <p className="mt-1 text-[13px] leading-snug text-ivory/75">{cell.reason}</p>
        </>
      );
  }
}

/** The one-line statement used when every option says the same "missing" thing. */
function MergedBody({ cell, count }: { cell: Cell; count: number }) {
  if (cell.state !== 'unavailable' && cell.state !== 'notApplicable') return null;
  const who = count === 2 ? 'both options' : `all ${count} options`;
  return (
    <>
      {cell.state === 'unavailable' ? (
        <p className="text-[15px] leading-snug text-ivory/85">
          <span aria-hidden="true" className="mr-1.5 text-ivory/60">○</span>Not available for {who}
        </p>
      ) : (
        <p className="font-mono text-[11px] uppercase leading-snug tracking-[0.14em] text-ivory/80">
          <span aria-hidden="true" className="mr-1.5">–</span>Not applicable for {who}
        </p>
      )}
      <p className="mt-1 text-[13px] leading-snug text-ivory/75">{cell.reason}</p>
    </>
  );
}

const DiffMark = () => (
  <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-cyan">
    <span aria-hidden="true">≠ </span>Verified values differ
  </span>
);

const grouped = (rows: readonly LedgerRow[]) => GROUP_ORDER.map((g) => ({ id: g, rows: rows.filter((r) => r.group === g) })).filter((g) => g.rows.length);

export function LedgerTable({ mode, options, rows }: { mode: CompareMode; options: readonly CompareOption[]; rows: readonly LedgerRow[] }) {
  const n = options.length;
  return (
    <table className="hidden w-full table-fixed border-separate border-spacing-0 border-t-2 border-champagne/70 bg-ink-900 lg:table">
      <caption className="sr-only">Comparison of {options.map((o) => `${o.title} ${o.subtitle}`).join(', ')}. Missing values are stated in words.</caption>
      <colgroup>
        <col className={n === 1 ? 'w-[34%]' : 'w-[24%]'} />
        {options.map((o) => (
          <col key={o.id} />
        ))}
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className="sticky top-16 z-10 border-b border-champagne/40 bg-ink-900 px-5 py-3 text-left align-bottom font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-ivory/75">
            Parameter
          </th>
          {options.map((o) => (
            <th key={o.id} scope="col" className="sticky top-16 z-10 border-b border-l border-b-champagne/40 border-l-ivory/10 bg-ink-900 px-5 py-3 text-left align-bottom font-normal">
              <span className="block font-atlas text-[24px] leading-[1.05] text-ivory">{o.title}</span>
              <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-champagne">{o.subtitle}</span>
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
              {r.merged ? (
                <td colSpan={n} className="border-b border-l border-b-ivory/10 border-l-ivory/10 px-5 py-3.5 align-top">
                  <MergedBody cell={r.cells[0]} count={n} />
                </td>
              ) : (
                r.cells.map((c, i) => (
                  <td
                    key={options[i].id}
                    data-state={c.state}
                    className={`border-b border-b-ivory/10 px-5 py-3.5 align-top ${r.differs && c.state === 'verified' ? 'border-l-2 border-l-cyan' : 'border-l border-l-ivory/10'}`}
                  >
                    <CellBody cell={c} figure={r.figure} what={`${r.label} at ${options[i].title}`} />
                  </td>
                ))
              )}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

export function LedgerStack({ mode, options, rows }: { mode: CompareMode; options: readonly CompareOption[]; rows: readonly LedgerRow[] }) {
  const n = options.length;
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
              {r.merged ? (
                <div className="mt-2">
                  <MergedBody cell={r.cells[0]} count={n} />
                </div>
              ) : (
                <dl className="mt-2.5 space-y-3">
                  {r.cells.map((c, i) => (
                    <div key={options[i].id} data-state={c.state} className={r.differs && c.state === 'verified' ? 'border-l-2 border-cyan pl-3' : 'border-l-2 border-transparent pl-3'}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-champagne">{options[i].title}</dt>
                      <dd className="mt-1">
                        <CellBody cell={c} figure={r.figure} what={`${r.label} at ${options[i].title}`} />
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
