'use client';

import { useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { DOMAINS } from '@/content/domains';
import type { DomainId } from '@/theme/tokens';
import { COURSES, ENTRANCE_PLACEHOLDER, LEVELS, PATHWAY_DISCLAIMER, coursesFor, type Course, type LevelId } from '@/content/pathways';
import { DomainGlyph } from '../DomainGlyph';
import { goTo } from '../scroll';
import { Figures } from '../Figures';
import { StatusLabel, StatusLegend } from '../StatusLabel';
import { PathwayConverge } from './PathwayConverge';
import { EMPTY_SEL, hasAny, pathReducer } from './pathwayState';
import { usePathEdges } from './usePathEdges';

/**
 * SCENE 4 — Courses & Learning Pathways.
 * An interactive route chart, not a catalogue: four stages (where you are → course → specialisation → career
 * direction). Choosing a station opens the stations it can lead to and draws the route. Everything is
 * orientation only: see src/content/pathways.ts for the honesty rules.
 *
 * Desktop: four columns with measured connecting lines. Mobile: the same stages stacked vertically
 * (one route line down the left), no overlay, no horizontal scroll. All essential information is plain text.
 */

const focusRing = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-cyan';

function Station({
  stage,
  id,
  label,
  sub,
  selected,
  ring,
  onSelect,
  aria,
}: {
  stage: 1 | 2 | 3 | 4;
  id: string;
  label: string;
  sub?: string;
  selected: boolean;
  /** domain hue for the marker ring when not selected */
  ring?: string;
  onSelect: () => void;
  aria: string;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        aria-label={aria}
        onClick={onSelect}
        className={`group flex min-h-[44px] w-full items-start gap-3 rounded-sm py-[10px] text-left ${focusRing}`}
      >
        <span data-dot={`${stage}:${id}`} className="relative z-[1] mt-[3px] grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full bg-ink-950">
          <span
            className={`block rounded-full border transition-[transform,background-color,border-color] duration-300 ${
              selected ? 'h-[13px] w-[13px] border-cyan bg-cyan' : 'h-[11px] w-[11px] bg-transparent group-hover:scale-110'
            }`}
            style={!selected ? { borderColor: ring ?? 'var(--color-champagne)' } : undefined}
          />
        </span>
        <span data-label={`${stage}:${id}`} className="min-w-0">
          <span className={`inline-block font-atlas text-[21px] leading-[1.1] transition-colors ${selected ? 'text-ivory' : 'text-ivory/85 group-hover:text-ivory'}`}><Figures>{label}</Figures></span>
          {sub && <span className="mt-1 block font-mono text-[11px] uppercase leading-snug tracking-[0.14em] text-silver">{sub}</span>}
        </span>
      </button>
    </li>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return (
    <li className="flex min-h-[44px] items-center gap-3 py-1.5">
      <span aria-hidden="true" className="relative z-[1] grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full bg-ink-950">
        <span className="block h-[9px] w-[9px] rounded-full border border-dashed border-silver/70" />
      </span>
      <span className="font-mono text-[11px] uppercase leading-snug tracking-[0.12em] text-silver">{children}</span>
    </li>
  );
}

function Stage({ n, title, children, count }: { n: 1 | 2 | 3 | 4; title: string; children: ReactNode; count?: string }) {
  return (
    <section aria-labelledby={`stage-${n}`} className="relative pb-6 pl-0 lg:pb-0">
      <h3 id={`stage-${n}`} className="scroll-mt-20 font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
        <span aria-hidden="true">0{n} </span>
        <span className="text-ivory">{title}</span>
        {count && <span className="ml-2 text-silver">{count}</span>}
      </h3>
      <ol
        aria-label={`Stage ${n}: ${title}`}
        className="relative mt-3 before:absolute before:bottom-3 before:left-[8px] before:top-3 before:w-px before:bg-champagne/30"
      >
        {children}
      </ol>
    </section>
  );
}

const levelLabel = (id: LevelId | null) => LEVELS.find((l) => l.id === id)?.label ?? '';

export function CoursesPathway() {
  const [sel, dispatch] = useReducer(pathReducer, EMPTY_SEL);
  const reduced = useReducedMotion() ?? false;
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  usePathEdges(wrap, svg, sel, reduced);

  // Stacked (mobile) layout: after a choice, bring the newly opened stage into view so the student is never lost.
  // Runs only on a user selection, uses the browser's own scroll (no hijack) and skips smooth motion if reduced.
  const depth = useRef(0);
  useEffect(() => {
    const d = sel.career ? 4 : sel.spec ? 3 : sel.course ? 2 : sel.level && sel.domain ? 1 : 0;
    const grew = d > depth.current;
    depth.current = d;
    if (!grew || window.innerWidth >= 1024) return;
    const target = d === 4 ? 'pw-notes' : `stage-${d + 1}`;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(target)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [sel.level, sel.domain, sel.course, sel.spec, sel.career]);

  // Arriving from the University atlas ("See pathways in this domain"): pick that direction here.
  useEffect(() => {
    const h = (e: Event) => {
      const id = (e as CustomEvent<DomainId>).detail;
      if (DOMAINS.some((d) => d.id === id)) dispatch({ t: 'domain', v: id, set: true });
    };
    window.addEventListener('cc:pathway-domain', h);
    return () => window.removeEventListener('cc:pathway-domain', h);
  }, []);

  const domain = DOMAINS.find((d) => d.id === sel.domain) ?? null;
  const level = LEVELS.find((l) => l.id === sel.level) ?? null;

  const { courses, fallback } = useMemo(() => {
    if (!sel.domain || !sel.level) return { courses: [] as Course[], fallback: false };
    const matched = coursesFor(sel.domain, sel.level);
    if (matched.length) return { courses: matched, fallback: false };
    return { courses: COURSES.filter((c) => c.domain === sel.domain), fallback: true };
  }, [sel.domain, sel.level]);

  const course = COURSES.find((c) => c.id === sel.course) ?? null;
  const specialisation = course?.specialisations.find((s) => s.id === sel.spec) ?? null;
  const career = specialisation?.careers.find((c) => c === sel.career) ?? null;

  const crumbs: { label: string; stage: 1 | 2 | 3 | 4 }[] = [];
  if (level) crumbs.push({ label: level.label, stage: 1 });
  if (domain) crumbs.push({ label: domain.name, stage: 1 });
  if (course) crumbs.push({ label: course.name, stage: 2 });
  if (specialisation) crumbs.push({ label: specialisation.name, stage: 3 });
  if (career) crumbs.push({ label: career, stage: 4 });

  const live = career
    ? `Pathway: ${crumbs.map((c) => c.label).join(', then ')}.`
    : specialisation
      ? `${specialisation.careers.length} possible career directions shown for ${specialisation.name}.`
      : course
        ? `${course.specialisations.length} specialisations shown for ${course.name}.`
        : sel.level && sel.domain
          ? `${courses.length} course options shown.`
          : '';

  return (
    <section
      id="act-courses"
      aria-label="Courses and learning pathways"
      data-header-theme="night"
      className="relative scroll-mt-16 overflow-x-clip bg-[linear-gradient(to_bottom,var(--handoff-top)_0%,var(--color-ink-950)_20%,var(--color-ink-950)_82%,var(--handoff-top)_100%)] pb-16 sm:pb-24"
    >
      {/* chart paper: a faint champagne graticule, static */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full text-champagne opacity-[0.07]">
        <defs>
          <pattern id="pw-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M64 0V64M0 64H64" fill="none" stroke="currentColor" strokeWidth="1" shapeRendering="crispEdges" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pw-grid)" />
      </svg>

      <PathwayConverge />

      <div className="relative mx-auto mt-2 w-full max-w-[1240px] px-5 sm:px-8 lg:pr-[clamp(72px,9vw,150px)]">
        {/* direction + navigation */}
        <div>
          <div>
            <p id="pw-direction" className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
              Choose a direction
            </p>
            <ul aria-labelledby="pw-direction" className="mt-3 flex flex-wrap gap-2">
              {DOMAINS.map((d) => {
                const on = sel.domain === d.id;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => dispatch({ t: 'domain', v: d.id })}
                      className={`inline-flex min-h-[44px] items-center gap-2 rounded-atlas-sm border px-3 text-[14px] transition-colors ${focusRing} ${
                        on ? 'border-cyan text-ivory' : 'border-ivory/20 text-ivory/85 hover:border-ivory/50 hover:text-ivory'
                      }`}
                    >
                      <span style={{ color: d.hue }}>
                        <DomainGlyph id={d.id} size={18} />
                      </span>
                      {d.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* breadcrumb: where you are on the route; each crumb steps back to that point */}
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Your route so far" className="min-h-[44px] flex items-center">
          {crumbs.length ? (
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/85">
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-champagne">
                      →
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => dispatch({ t: 'stage', n: c.stage })}
                    aria-current={i === crumbs.length - 1 ? 'step' : undefined}
                    className={`min-h-[44px] rounded-sm px-1 hover:text-ivory ${i === crumbs.length - 1 ? 'text-ivory' : ''} ${focusRing}`}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-silver">Start with where you are today, then pick a direction.</p>
          )}
        </nav>
          <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => dispatch({ t: 'back' })}
                disabled={!hasAny(sel)}
                className={`inline-flex min-h-[44px] items-center rounded-atlas border border-ivory/30 px-4 text-sm font-semibold text-ivory transition-colors hover:border-ivory/60 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-ivory/30 ${focusRing}`}
              >
                ← Back one step
              </button>
              <button
                type="button"
                onClick={() => dispatch({ t: 'reset' })}
                disabled={!hasAny(sel)}
                className={`inline-flex min-h-[44px] items-center rounded-atlas border border-ivory/30 px-4 text-sm font-semibold text-ivory transition-colors hover:border-ivory/60 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-ivory/30 ${focusRing}`}
              >
                Start over
              </button>
            </div>
          </div>

        {/* the route chart */}
        <div ref={wrap} className="relative mt-6 lg:min-h-[300px]">
          <svg ref={svg} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-visible lg:block" />
          <div className="relative grid gap-x-2 lg:grid-cols-4 lg:gap-x-[clamp(24px,4.4vw,72px)]">
            <Stage n={1} title="Where you are">
              {LEVELS.map((l) => (
                <Station
                  key={l.id}
                  stage={1}
                  id={l.id}
                  label={l.label}
                  selected={sel.level === l.id}
                  onSelect={() => dispatch({ t: 'level', v: l.id })}
                  aria={`Current education: ${l.label}`}
                />
              ))}
            </Stage>

            <Stage n={2} title="Course or degree">
              {courses.length ? (
                courses.map((c) => (
                  <Station
                    key={c.id}
                    stage={2}
                    id={c.id}
                    label={c.name}
                    sub={`Commonly after ${c.from.map((f) => levelLabel(f)).join(' / ')}`}
                    ring={domain?.hue}
                    selected={sel.course === c.id}
                    onSelect={() => dispatch({ t: 'course', v: c.id })}
                    aria={`Course: ${c.name}, a possible pathway`}
                  />
                ))
              ) : (
                <Hint>{sel.level ? 'Now choose a direction' : sel.domain ? 'Now choose where you are' : 'Choose where you are and a direction'}</Hint>
              )}
              {fallback && (
                <li className="pt-2 text-[13px] leading-snug text-ivory/80">
                  No common route from {level?.label} is listed for this direction yet, so all its programmes are shown.
                </li>
              )}
            </Stage>

            <Stage n={3} title="Specialisation">
              {course ? (
                course.specialisations.map((s) => (
                  <Station
                    key={s.id}
                    stage={3}
                    id={s.id}
                    label={s.name}
                    ring={domain?.hue}
                    selected={sel.spec === s.id}
                    onSelect={() => dispatch({ t: 'spec', v: s.id })}
                    aria={`Specialisation: ${s.name}`}
                  />
                ))
              ) : (
                <Hint>Choose a course</Hint>
              )}
              {course?.specNote && <li className="pt-2 text-[13px] leading-snug text-ivory/80">{course.specNote}</li>}
            </Stage>

            <Stage n={4} title="Career direction">
              {specialisation ? (
                specialisation.careers.map((c) => (
                  <Station
                    key={c}
                    stage={4}
                    id={c}
                    label={c}
                    ring={domain?.hue}
                    selected={sel.career === c}
                    onSelect={() => dispatch({ t: 'career', v: c })}
                    aria={`Possible career direction: ${c}`}
                  />
                ))
              ) : (
                <Hint>Choose a specialisation</Hint>
              )}
            </Stage>
          </div>
        </div>

        {/* field notes for the deepest selection: plain text, never hidden behind scroll or hover */}
        <div id="pw-notes" className="scroll-mt-20 mt-8 grid gap-6 border-t border-champagne/30 pt-6 lg:grid-cols-3 lg:gap-10" aria-live="off">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">
              {course ? `Subjects in ${course.name}` : 'About this step'}
            </p>
            {course && <StatusLabel state="orientation" className="mt-2" />}
            {course ? (
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1" aria-label={`Subjects you may study in ${course.name}`}>
                {course.subjects.map((s) => (
                  <li key={s} className="text-[14px] leading-snug text-ivory/85 before:mr-3 before:text-silver before:content-['/'] first:before:hidden">
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[15px] leading-relaxed text-ivory/85">
                {level ? level.next : 'Pick the stage you are at now. The chart then opens the courses that are commonly started from there, in the direction you choose.'}
              </p>
            )}
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">Entrance & eligibility</p>
            {course && <StatusLabel state={course.entrance ? 'verified' : 'unverified'} className="mt-2" />}
            {course?.entrance ? (
              <p className="mt-3 text-[15px] leading-relaxed text-ivory/85">
                {course.entrance.exams.join(', ')}. <span className="text-silver">Source: {course.entrance.source} (verified {course.entrance.verifiedOn}).</span>
              </p>
            ) : (
              <p className="mt-3 text-[15px] leading-relaxed text-ivory/85">{course ? ENTRANCE_PLACEHOLDER : 'Choose a course to see what we can and cannot yet say about entrance routes.'}</p>
            )}
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-champagne">Your pathway</p>
            {career && <StatusLabel state="orientation" className="mt-2" />}
            <p className="mt-3 text-[15px] leading-relaxed text-ivory/85">
              {career
                ? `Your route: ${crumbs.map((c) => c.label).join(', ')}. This is a possible pathway, so check institution-specific eligibility.`
                : specialisation
                  ? `${specialisation.name} can point towards the career directions shown. Choose one to complete the route.`
                  : course
                    ? 'Choose a specialisation to see the career directions it can lead to.'
                    : 'Your chosen route appears here as you build it.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => goTo('act-guidance')}
                className={`inline-flex min-h-[44px] items-center rounded-atlas bg-ivory px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-ivory-100 ${focusRing}`}
              >
                About guidance
              </button>
              <button
                type="button"
                aria-disabled="true"
                title="Course pages open when the courses library launches"
                onClick={(e) => e.preventDefault()}
                className={`inline-flex min-h-[44px] cursor-not-allowed items-center gap-2 rounded-atlas border border-ivory/30 px-4 text-sm font-semibold text-ivory/90 ${focusRing}`}
              >
                Explore this course
                <span className="font-mono text-[11px] uppercase tracking-wider text-ivory/80">Soon</span>
              </button>
            </div>
          </div>
        </div>

        {/* legend + honesty line */}
        <StatusLegend states={['orientation', 'unverified']} className="mt-8 grid gap-4 sm:grid-cols-2 lg:gap-10" />
        <div className="mt-5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <p className="max-w-[60ch] text-[13px] leading-snug text-ivory/80">{PATHWAY_DISCLAIMER}</p>
          <p aria-hidden="true" className="hidden shrink-0 items-center gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ivory/75 lg:flex">
            <span className="inline-block h-px w-8 bg-champagne" /> your route
            <span className="inline-block w-8 border-t border-dashed border-champagne/60" /> other possible routes
          </p>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {live}
        </p>
      </div>

    </section>
  );
}
