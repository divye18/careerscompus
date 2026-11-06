'use client';

import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { DOMAINS } from '@/content/domains';
import {
  INSTITUTIONS,
  REGIONS,
  TYPE_LABELS,
  TYPE_ORDER,
  TYPE_SINGULAR,
  matches,
  type Institution,
  type InstitutionType,
  type RegionId,
} from '@/content/institutions';
import type { DomainId } from '@/theme/tokens';
import type { VerificationStatus } from '@/content/verification';
import { Figures } from '../Figures';
import { goTo } from '../scroll';
import { StatusLabel, StatusLegend } from '../StatusLabel';
import { AddToCompare, CompareProgrammeToggle } from '../compare/AddToCompare';
import { AtlasIntro } from './AtlasIntro';
import { AV_H, AV_W, CAPTIONS, HUBS, HUB_EDGES, PLACED, pct } from './atlasLayout';

/**
 * SCENE 5 — University Discovery Atlas.
 * A schematic regional constellation (NOT a geographic map: positions are for orientation only). Regions are hubs,
 * institutions are markers on an orbit around their hub. Filters (type, domain), a region focus, and an information
 * panel that only ever shows verified facts or "Information coming soon". Content lives in src/content/institutions.ts.
 *
 * Desktop: the atlas + panel side by side. Below lg: the same state drives a region chip row + a vertical route list
 * and the panel sits underneath (auto-scrolled into view after a choice). No hover-only information anywhere.
 */

interface State {
  region: RegionId | null;
  type: InstitutionType | null;
  domain: DomainId | null;
  selected: string | null;
}
const EMPTY: State = { region: null, type: null, domain: null, selected: null };
type Act =
  | { t: 'region'; v: RegionId }
  | { t: 'type'; v: InstitutionType }
  | { t: 'domain'; v: DomainId }
  | { t: 'select'; v: Institution }
  /** open an institution from another scene (never toggles it closed) */
  | { t: 'open'; v: Institution }
  | { t: 'close' }
  | { t: 'allRegions' }
  | { t: 'reset' };

const toggle = <T,>(c: T | null, v: T): T | null => (c === v ? null : v);

function reduce(s: State, a: Act): State {
  switch (a.t) {
    case 'region': {
      const region = toggle(s.region, a.v);
      const sel = INSTITUTIONS.find((i) => i.id === s.selected);
      return { ...s, region, selected: sel && region && sel.region !== region ? null : s.selected };
    }
    case 'type':
      return { ...s, type: toggle(s.type, a.v) };
    case 'domain':
      return { ...s, domain: toggle(s.domain, a.v) };
    case 'select':
      return s.selected === a.v.id ? { ...s, selected: null } : { ...s, selected: a.v.id, region: a.v.region };
    case 'open':
      return { ...s, selected: a.v.id, region: a.v.region };
    case 'close':
      return { ...s, selected: null };
    case 'allRegions':
      return { ...s, region: null, selected: null };
    case 'reset':
      return EMPTY;
  }
}

const focusRing = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-cyan';
const domainName = (id: DomainId) => DOMAINS.find((d) => d.id === id)?.longName ?? id;
const COMING = 'Information coming soon';

function Chip({ on, disabled, onClick, children, title }: { on: boolean; disabled?: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-atlas-sm border px-3 text-[14px] transition-colors ${focusRing} ${
        on ? 'border-cyan text-ivory' : 'border-ivory/20 text-ivory/85 hover:border-ivory/50 hover:text-ivory'
      } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-ivory/20`}
    >
      {children}
    </button>
  );
}

const Count = ({ n }: { n: number }) => <span className="font-mono text-[11px] text-silver">{n}</span>;

function Fact({ label, status, children }: { label: string; status: VerificationStatus; children: ReactNode }) {
  return (
    <div>
      <dt className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-champagne">{label}</span>
        <StatusLabel state={status} />
      </dt>
      <dd className="mt-1.5 text-[15px] leading-snug text-ivory/90">{children}</dd>
    </div>
  );
}
const Soon = () => <span className="text-ivory/70">{COMING}</span>;

function InfoPanel({ s, dispatch, visibleCount, regionCount }: { s: State; dispatch: (a: Act) => void; visibleCount: number; regionCount: number }) {
  const inst = INSTITUTIONS.find((i) => i.id === s.selected) ?? null;
  const region = REGIONS.find((r) => r.id === s.region) ?? null;

  if (!inst) {
    return (
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">{region ? region.label : 'The atlas'}</p>
        <h3 className="mt-2 font-atlas text-[30px] leading-[1.05] text-ivory"><Figures>{region ? `${regionCount} ${regionCount === 1 ? 'institution' : 'institutions'} checked` : `${INSTITUTIONS.length} institutions so far`}</Figures></h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ivory/85">
          {region
            ? region.id === 'international'
              ? 'No international institutions have been verified yet. They will appear here once their details are checked against official sources.'
              : `${region.note} Choose a marker to read what has been verified about it.`
            : 'Choose a region, then a marker, to open an institution. This is a small, carefully checked starting set, not a complete directory.'}
        </p>
        {visibleCount === 0 && (
          <p className="mt-3 text-[15px] leading-relaxed text-ivory/85">No verified institution matches these filters. Try removing one, or reset.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => dispatch({ t: 'close' })}
        className={`-ml-1 inline-flex min-h-[44px] items-center rounded-atlas-sm px-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ivory/85 hover:text-ivory ${focusRing}`}
      >
        ← Back to the atlas
      </button>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
        {inst.city}, {inst.state}
      </p>
      <h3 className="mt-2 font-atlas text-[clamp(28px,2.6vw,36px)] leading-[1.05] text-ivory">{inst.name}</h3>
      <div className="mt-4">
        <AddToCompare mode="institutions" id={inst.id} name={inst.shortName} label="Add to comparison" />
      </div>
      <dl className="mt-5 space-y-4">
        <Fact label="Institution type" status={inst.institutionType ? 'verified' : 'unverified'}>{inst.institutionType ? TYPE_SINGULAR[inst.institutionType] : <Soon />}</Fact>
        <Fact label="Established" status={inst.establishedYear !== null ? 'verified' : 'unverified'}>{inst.establishedYear ?? <Soon />}</Fact>
        <Fact label="Official website" status="verified">
          <a
            href={inst.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-[44px] items-center break-all rounded-sm text-ivory underline decoration-champagne underline-offset-4 hover:decoration-ivory ${focusRing}`}
          >
            {inst.officialWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Fact>
        <Fact label="Academic domains" status={inst.academicDomains.length ? 'partial' : 'unverified'}>
          {inst.academicDomains.length ? (
            <ul className="mt-1 flex flex-wrap gap-1.5" aria-label="Academic domains">
              {inst.academicDomains.map((d) => (
                <li key={d}>
                  <button
                    type="button"
                    title="See pathways in this domain"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('cc:pathway-domain', { detail: d }));
                      goTo('act-courses');
                    }}
                    className={`min-h-[44px] rounded border border-ivory/25 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-ivory/90 hover:border-ivory/60 ${focusRing}`}
                  >
                    {domainName(d)} →
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Soon />
          )}
        </Fact>
        <Fact label="Available courses" status={inst.availableCourses.length ? 'partial' : 'unverified'}>
          {inst.availableCourses.length ? (
            <>
              <ul className="mt-1 space-y-1" aria-label={`Confirmed courses at ${inst.shortName}`}>
                {inst.availableCourses.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3">
                    <span>{c.name}{c.evidence === 'listing' && <span className="ml-2 text-[12px] text-ivory/75">(named in a menu only)</span>}</span>
                    <CompareProgrammeToggle id={c.id} name={`${c.name} at ${inst.shortName}`} />
                  </li>
                ))}
              </ul>
              <span className="mt-1 block text-[13px] text-ivory/75">
                {inst.availableCourses.some((c) => c.evidence === 'listing')
                  ? 'Found so far, not a full list. Programmes marked “named in a menu only” are listed on the institution’s pages but not described, so they are not confirmed as currently offered.'
                  : 'Confirmed so far, not a full list.'}
              </span>
            </>
          ) : (
            <span className="text-ivory/70">Course lists are being verified institution by institution. {COMING}.</span>
          )}
        </Fact>
        <Fact label="Admission information" status="unverified">
          <Soon />
        </Fact>
        <Fact label="Accreditation & recognition" status="unverified">
          <Soon />
        </Fact>
      </dl>
      <details className="mt-5 text-[13px] text-ivory/80">
        <summary className={`flex min-h-[44px] cursor-pointer items-center rounded-sm font-mono text-[11px] uppercase tracking-[0.14em] text-champagne ${focusRing}`}>How we checked this</summary>
        <p className="mt-2 leading-relaxed">
          Last checked {inst.lastVerified} against the institution’s own website. Details not listed above could not be confirmed there, so we do not show them.
        </p>
        <ul className="mt-2 space-y-1.5">
          {inst.dataSources
            .filter((x) => x.field !== 'officialWebsite')
            .map((x) => (
              <li key={`${x.field}-${x.url}`} className="leading-snug">
                <span className="font-mono text-[11px] uppercase tracking-wider text-silver">{x.field.replace('academicDomains:', 'domain: ').replace(/^course:.*$/, 'course').replace(/^duration:.*$/, 'duration')}</span>{' '}
                <a href={x.url} target="_blank" rel="noopener noreferrer" className={`break-all rounded-sm underline decoration-champagne/60 underline-offset-2 hover:decoration-ivory ${focusRing}`}>
                  {x.url.replace(/^https?:\/\//, '')}
                </a>
              </li>
            ))}
        </ul>
        <StatusLegend states={['verified', 'partial', 'unverified']} className="mt-4 space-y-3 border-t border-ivory/15 pt-4" />
      </details>
    </div>
  );
}

export function UniversityAtlas() {
  const [s, dispatch] = useReducer(reduce, EMPTY);
  const [filtersOpen, setFiltersOpen] = useState(false); // phones: filters are tucked away until asked for

  const visible = useMemo(() => new Set(INSTITUTIONS.filter((i) => matches(i, s)).map((i) => i.id)), [s]);
  const typeCounts = useMemo(() => Object.fromEntries(TYPE_ORDER.map((t) => [t, INSTITUTIONS.filter((i) => i.institutionType === t && matches(i, { type: null, domain: s.domain })).length])) as Record<InstitutionType, number>, [s.domain]);
  const domainCounts = useMemo(() => Object.fromEntries(DOMAINS.map((d) => [d.id, INSTITUTIONS.filter((i) => i.academicDomains.includes(d.id) && matches(i, { type: s.type, domain: null })).length])) as Record<DomainId, number>, [s.type]);
  const regionCount = (r: RegionId) => INSTITUTIONS.filter((i) => i.region === r && visible.has(i.id)).length;
  const hasFilter = s.type !== null || s.domain !== null || s.region !== null || s.selected !== null;
  const inRegionList = INSTITUTIONS.filter((i) => visible.has(i.id) && (s.region === null || i.region === s.region));

  // Arriving from the Comparison Studio ("Atlas"): open that institution's panel here.
  useEffect(() => {
    const h = (e: Event) => {
      const inst = INSTITUTIONS.find((i) => i.id === (e as CustomEvent<string>).detail);
      if (inst) dispatch({ t: 'open', v: inst });
    };
    window.addEventListener('cc:atlas-open', h);
    return () => window.removeEventListener('cc:atlas-open', h);
  }, []);

  // Stacked layout: bring the information panel into view after choosing an institution (user action only, native scroll).
  const panel = useRef<HTMLDivElement>(null);
  const prevSel = useRef<string | null>(null);
  useEffect(() => {
    const opened = s.selected && s.selected !== prevSel.current;
    prevSel.current = s.selected;
    if (!opened || window.innerWidth >= 1024) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panel.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, [s.selected]);

  const live = s.selected
    ? `${INSTITUTIONS.find((i) => i.id === s.selected)?.name} selected.`
    : `${inRegionList.length} ${inRegionList.length === 1 ? 'institution' : 'institutions'} shown${s.region ? ` in ${REGIONS.find((r) => r.id === s.region)?.label}` : ''}.`;

  return (
    <section
      id="act-universities"
      aria-label="University discovery atlas"
      data-header-theme="night"
      className="relative -mt-px scroll-mt-16 overflow-x-clip bg-[linear-gradient(to_bottom,var(--handoff-top)_0%,var(--color-aubergine)_22%,var(--color-ink-950)_60%,var(--handoff-top)_100%)] pb-16 sm:pb-24"
    >
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full text-champagne opacity-[0.06]">
        <defs>
          <pattern id="atlas-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M64 0V64M0 64H64" fill="none" stroke="currentColor" strokeWidth="1" shapeRendering="crispEdges" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#atlas-grid)" />
      </svg>

      <AtlasIntro />

      <div className="relative mx-auto mt-2 w-full max-w-[1240px] px-5 sm:px-8 lg:pr-[clamp(72px,9vw,150px)]">
        {/* filters */}
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="atlas-filters"
          onClick={() => setFiltersOpen((o) => !o)}
          className={`flex min-h-[44px] w-full items-center justify-between rounded-atlas-sm border border-ivory/25 px-4 text-sm font-semibold text-ivory lg:hidden ${focusRing}`}
        >
          <span>Filters{s.type || s.domain ? ` · ${(s.type ? 1 : 0) + (s.domain ? 1 : 0)} active` : ''}</span>
          <span aria-hidden="true" className="font-mono text-[11px] text-champagne">{filtersOpen ? 'HIDE' : 'SHOW'}</span>
        </button>
        <div id="atlas-filters" className={`mt-4 grid gap-5 lg:mt-0 lg:grid-cols-[1fr_auto] lg:items-end ${filtersOpen ? '' : 'hidden lg:grid'}`}>
          <div className="space-y-4">
            <div>
              <p id="atlas-type" className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">Institution type</p>
              <ul aria-labelledby="atlas-type" className="mt-2 flex flex-wrap gap-2">
                {TYPE_ORDER.map((t) => (
                  <li key={t}>
                    <Chip on={s.type === t} disabled={typeCounts[t] === 0 && s.type !== t} title={typeCounts[t] === 0 ? 'No verified institutions of this type yet' : undefined} onClick={() => dispatch({ t: 'type', v: t })}>
                      {TYPE_LABELS[t]} <Count n={typeCounts[t]} />
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p id="atlas-domain" className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">Field of study</p>
              <ul aria-labelledby="atlas-domain" className="mt-2 flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <li key={d.id}>
                    <Chip on={s.domain === d.id} disabled={domainCounts[d.id] === 0 && s.domain !== d.id} title={domainCounts[d.id] === 0 ? 'No verified institutions for this field yet' : undefined} onClick={() => dispatch({ t: 'domain', v: d.id })}>
                      {d.longName} <Count n={domainCounts[d.id]} />
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ t: 'reset' })}
            disabled={!hasFilter}
            className={`inline-flex min-h-[44px] items-center justify-center rounded-atlas border border-ivory/30 px-4 text-sm font-semibold text-ivory transition-colors hover:border-ivory/60 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-ivory/30 ${focusRing}`}
          >
            Reset filters
          </button>
        </div>

        <div id="atlas-view" className="mt-8 grid scroll-mt-20 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:gap-10">
          {/* DESKTOP: schematic constellation */}
          <div className="relative hidden lg:block">
            <div className="relative w-full" style={{ aspectRatio: `${AV_W} / ${AV_H}` }}>
              <svg viewBox={`0 0 ${AV_W} ${AV_H}`} aria-hidden="true" className="absolute inset-0 h-full w-full">
                {/* chart paper: faint concentric rings around the centre, like a navigation chart */}
                {[210, 330].map((r) => (
                  <circle key={r} cx={HUBS.central.x} cy={HUBS.central.y} r={r} fill="none" stroke="var(--color-champagne)" strokeOpacity={0.09} strokeDasharray="1 7" />
                ))}
                {HUB_EDGES.map(([a, b]) => (
                  <line key={a + b} x1={HUBS[a].x} y1={HUBS[a].y} x2={HUBS[b].x} y2={HUBS[b].y} stroke="var(--color-champagne)" strokeOpacity={0.28} strokeDasharray="3 6" />
                ))}
                {PLACED.map(({ inst, x, y }) => {
                  const h = HUBS[inst.region];
                  const dim = !visible.has(inst.id) || (s.region !== null && s.region !== inst.region);
                  return <line key={inst.id} x1={h.x} y1={h.y} x2={x} y2={y} stroke="var(--color-champagne)" strokeOpacity={dim ? 0.1 : 0.55} className="transition-[stroke-opacity] duration-300" />;
                })}
                {(['north', 'west', 'central', 'east', 'south', 'international'] as RegionId[]).map((r) => (
                  <circle key={r} cx={HUBS[r].x} cy={HUBS[r].y} r={s.region === r ? 40 : 30} fill="none" stroke="var(--color-champagne)" strokeOpacity={s.region === r ? 0.5 : 0.18} strokeDasharray={r === 'international' ? '2 5' : undefined} className="transition-all duration-300" />
                ))}
              </svg>

              {REGIONS.map((r) => {
                const on = s.region === r.id;
                const n = regionCount(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${r.label}, ${n} ${n === 1 ? 'institution' : 'institutions'}`}
                    onClick={() => dispatch({ t: 'region', v: r.id })}
                    style={{ ...pct(HUBS[r.id].x, HUBS[r.id].y), transform: 'translate(-50%,-50%)' }}
                    className={`group absolute z-[2] grid h-[60px] w-[60px] place-items-center rounded-full ${focusRing}`}
                  >
                    <span className={`block h-3 w-3 rounded-full border-2 bg-ink-950 transition-colors ${on ? 'border-cyan' : 'border-champagne group-hover:border-ivory'}`} />
                  </button>
                );
              })}

              {REGIONS.map((r) => {
                const n = regionCount(r.id);
                return (
                  <span
                    key={`cap-${r.id}`}
                    aria-hidden="true"
                    onClick={() => dispatch({ t: 'region', v: r.id })}
                    style={{ ...pct(CAPTIONS[r.id].x, CAPTIONS[r.id].y), transform: 'translate(-50%,-50%)' }}
                    className={`absolute z-[2] cursor-pointer whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${s.region === r.id ? 'text-ivory' : 'text-champagne hover:text-ivory'}`}
                  >
                    {r.label} <span className="text-silver">{n}</span>
                  </span>
                );
              })}

              {PLACED.map(({ inst, x, y, side }) => {
                const shown = visible.has(inst.id);
                const dim = s.region !== null && s.region !== inst.region;
                const on = s.selected === inst.id;
                const labelPos =
                  side === 'right' ? 'left-[calc(50%+14px)] top-1/2 -translate-y-1/2' : side === 'left' ? 'right-[calc(50%+14px)] top-1/2 -translate-y-1/2' : side === 'above' ? 'bottom-[calc(50%+12px)] left-1/2 -translate-x-1/2' : 'top-[calc(50%+12px)] left-1/2 -translate-x-1/2';
                return (
                  <button
                    key={inst.id}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${inst.name}, ${inst.city}`}
                    onClick={() => dispatch({ t: 'select', v: inst })}
                    style={{ ...pct(x, y), transform: 'translate(-50%,-50%)' }}
                    className={`group absolute z-[3] grid h-[44px] w-[44px] place-items-center rounded-full transition-opacity duration-300 ${focusRing} ${shown ? (dim ? 'opacity-35' : 'opacity-100') : 'pointer-events-none invisible opacity-0'}`}
                  >
                    <span className={`block rounded-full border transition-[transform,background-color,border-color] duration-300 ${on ? 'h-[14px] w-[14px] border-cyan bg-cyan' : 'h-[10px] w-[10px] border-champagne bg-champagne group-hover:scale-125'}`} />
                    <span aria-hidden="true" className={`pointer-events-none absolute whitespace-nowrap font-mono text-[11px] tracking-wide ${on ? 'text-ivory' : 'text-ivory/85'} ${labelPos}`}>
                      {inst.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[13px] leading-snug text-ivory/80">Schematic atlas. Regions are arranged for orientation, not geography.</p>
          </div>

          {/* MOBILE / TABLET: regional exploration list */}
          <div className="lg:hidden">
            <p id="atlas-region-m" className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">Region</p>
            <ul aria-labelledby="atlas-region-m" className="mt-2 flex flex-wrap gap-2">
              {REGIONS.map((r) => (
                <li key={r.id}>
                  <Chip on={s.region === r.id} onClick={() => dispatch({ t: 'region', v: r.id })}>
                    {r.label} <Count n={regionCount(r.id)} />
                  </Chip>
                </li>
              ))}
            </ul>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
              {s.region ? REGIONS.find((r) => r.id === s.region)?.label : 'All regions'} · {inRegionList.length}
            </p>
            <ol aria-label="Institutions" className="relative mt-2 before:absolute before:bottom-3 before:left-[8px] before:top-3 before:w-px before:bg-champagne/30">
              {inRegionList.length ? (
                inRegionList.map((i) => {
                  const on = s.selected === i.id;
                  return (
                    <li key={i.id}>
                      <button type="button" aria-pressed={on} onClick={() => dispatch({ t: 'select', v: i })} className={`group flex min-h-[52px] w-full items-start gap-3 rounded-sm py-[10px] text-left ${focusRing}`}>
                        <span className="relative z-[1] mt-[3px] grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full bg-ink-950">
                          <span className={`block rounded-full border ${on ? 'h-[13px] w-[13px] border-cyan bg-cyan' : 'h-[11px] w-[11px] border-champagne'}`} />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-atlas text-[21px] leading-[1.1] text-ivory">{i.shortName}</span>
                          <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.14em] text-silver">{i.city}, {i.state}</span>
                        </span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="py-3 pl-8 text-[15px] leading-relaxed text-ivory/85">
                  {s.region === 'international' ? 'No international institutions have been verified yet.' : 'No verified institution matches these filters.'}
                </li>
              )}
            </ol>
          </div>

          {/* information panel (both layouts) */}
          <div ref={panel} className="scroll-mt-20 border-t border-champagne/30 pt-6 lg:sticky lg:top-24 lg:self-start lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <InfoPanel s={s} dispatch={dispatch} visibleCount={visible.size} regionCount={regionCount(s.region ?? 'north')} />
            {s.region && (
              <button type="button" onClick={() => dispatch({ t: 'allRegions' })} className={`mt-4 inline-flex min-h-[44px] items-center rounded-atlas-sm px-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ivory/85 hover:text-ivory ${focusRing}`}>
                Show all regions
              </button>
            )}
          </div>
        </div>

        <p className="mt-8 text-[13px] leading-snug text-ivory/80 lg:hidden">Schematic, not a map. Anything not shown has not been verified yet.</p>
        <p className="sr-only" role="status" aria-live="polite">{live}</p>
      </div>

    </section>
  );
}
