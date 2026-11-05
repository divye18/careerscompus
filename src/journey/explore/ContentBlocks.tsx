import { memo } from 'react';
import { EXPLORE_DISCLAIMER, DOMAINS, type Domain } from '@/content/domains';
import { goTo } from '../scroll';
import { ENVS } from './registry';

/**
 * Scene 3 copy blocks, shared by the pinned stage and the mobile swipe track.
 * `compact` (pinned desktop) trims spacing so both blocks fit short laptop screens.
 */
export const RoomHead = memo(function RoomHead({ d, index, compact = false }: { d: Domain; index: number; compact?: boolean }) {
  const spec = ENVS[d.id];
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
        03 <span className="mx-1.5 text-silver/60">—</span> Explore
        <span className="ml-3 text-silver">
          {String(index + 1).padStart(2, '0')}/{String(DOMAINS.length).padStart(2, '0')}
        </span>
      </p>
      <h3 className={`mt-3 font-atlas font-normal text-ivory ${spec.nameClass}`}>{d.longName}</h3>
      <p className={`${compact ? 'mt-3 text-[17px]' : 'mt-3 text-lg'} leading-snug text-ivory`}>{d.blurb}</p>
      <p className={`${compact ? 'mt-2 text-[14px]' : 'mt-3 text-[15px]'} leading-relaxed text-ivory/75`}>{d.involves}</p>
      <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${d.name} disciplines`}>
        {d.fields.map((f) => (
          <li key={f} className="rounded border border-ivory/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ivory/80">
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => goTo('act-guidance')}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-ivory px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-ivory-100 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-cyan"
        >
          Get Guidance
        </button>
        <button
          type="button"
          aria-disabled="true"
          title="Career pages open when the careers library launches"
          onClick={(e) => e.preventDefault()}
          className="inline-flex min-h-[44px] cursor-not-allowed items-center gap-2 rounded-lg border border-ivory/30 px-4 text-sm font-semibold text-ivory/90 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-cyan"
        >
          Explore Careers
          <span className="rounded border border-ivory/25 px-1.5 py-px font-mono text-[10px] uppercase tracking-wider text-silver">Soon</span>
        </button>
      </div>
    </div>
  );
});

function List({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-champagne">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex gap-2.5 text-[14px] leading-snug text-ivory/85">
            <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--hue)]" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export const RoomDetail = memo(function RoomDetail({ d, cols = false }: { d: Domain; cols?: boolean }) {
  return (
    <div className={cols ? 'grid grid-cols-2 gap-x-8 gap-y-3' : 'space-y-5'}>
      <List title="Paths in" items={d.paths} />
      <List title="Ways it shows up" items={d.roles} />
      <p className={`font-mono text-[10px] leading-relaxed tracking-wide text-silver ${cols ? 'col-span-2' : ''}`}>{EXPLORE_DISCLAIMER}</p>
    </div>
  );
});
