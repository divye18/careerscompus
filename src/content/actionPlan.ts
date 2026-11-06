/**
 * Scene 7 (internal project name: Career Action Studio; students see "Next Steps"): what the student kept, what is still open, and what they could do next.
 * Pure functions only: no React, no storage, no clock. Everything is derived from the comparison selections and the
 * ledger in ./comparison, so there is no second copy of any fact.
 *
 * Rules (docs/SCENE_7_PRODUCT_BRIEF.md):
 *  - Input is only what the student chose to keep. Nothing is inferred from rooms visited or scrolling.
 *  - Nothing is ranked or recommended. Steps are ordered by how tasks depend on each other, never by merit.
 *  - A programme is Verified only when its evidence is a statement. A listing, or missing evidence, is Partially verified.
 *  - An institution has no overall status, because its facts differ.
 *  - "Not verified" (unknown) and "Not applicable" stay separate, even for the same parameter.
 *  - Verification dates are past events. No freshness is claimed.
 */

import { GROUP_ORDER, PROGRAMMES, isKnownOption, ledgerRows, optionFor, type CompareMode, type GroupId } from './comparison';
import { INSTITUTIONS } from './institutions';
import { COURSES } from './pathways';
import type { VerificationStatus } from './verification';

export type Selections = Readonly<Record<CompareMode, readonly string[]>>;
export type PlanState = 'empty' | 'partial' | 'full';

/** The student-facing name. "Career Action Studio" is internal only and must not appear in student copy. */
export const SCENE_NAME = 'Next Steps';
export const NO_REASON_RECORDED = 'No reason has been recorded.';
export const STANDING_EVIDENCE_NOTE = 'These facts were true on the date we checked. Institutions change details, so confirm on the official website before you act.';

export interface KeptEntry {
  mode: CompareMode;
  id: string;
  title: string;
  subtitle: string;
  /** null for an institution: its facts differ, so one overall label would overstate the evidence */
  status: VerificationStatus | null;
  /** the date checks were last run; null for courses, which are general guidance and have no check */
  lastVerified: string | null;
  /** a programme only named in a menu or list */
  listedOnly: boolean;
  /** what was reviewed, for a listing */
  note: string | null;
  website: string | null;
  /** institution to open in the atlas */
  atlasId: string | null;
  /** career world, for a course */
  domain: string | null;
}

export interface QuestionItem {
  mode: CompareMode;
  id: string;
  /** the option's name, in full ("B.Tech at IIT Madras") */
  name: string;
  reason: string;
}

export interface Question {
  /** parameter id, or "currently-offered" */
  id: string;
  label: string;
  group: GroupId | null;
  items: readonly QuestionItem[];
}

export type StepGroup = 'explore' | 'verify' | 'discuss';
export const STEP_GROUPS: readonly { id: StepGroup; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'verify', label: 'Verify' },
  { id: 'discuss', label: 'Discuss' },
];

/** An official website, with what to look up there. */
export interface StepSource {
  institutionId: string;
  institution: string;
  href: string;
  questions: readonly string[];
}

export interface NextStep {
  id: string;
  group: StepGroup;
  text: string;
  /** the sequence is our general guidance, so every step is Orientation */
  status: 'orientation';
  /** element to return to on this page */
  targetId: string | null;
  /** official websites from the dataset, one per institution, each with every distinct question to look up there */
  sources: readonly StepSource[];
}

export interface ActionPlan {
  state: PlanState;
  kept: { institutions: readonly KeptEntry[]; programmes: readonly KeptEntry[]; courses: readonly KeptEntry[] };
  /** unknown: could apply, but nothing is confirmed */
  openQuestions: readonly Question[];
  /** does not apply to this kind of option: not a gap */
  notApplicable: readonly Question[];
  steps: readonly NextStep[];
}

const MODES: readonly CompareMode[] = ['institutions', 'programmes', 'courses'];
const NOUN: Record<CompareMode, string> = { institutions: 'institution', programmes: 'programme', courses: 'course' };

const clean = (mode: CompareMode, ids: readonly string[] | undefined): string[] => [...new Set(ids ?? [])].filter((id) => isKnownOption(mode, id));

function keptEntry(mode: CompareMode, id: string): KeptEntry {
  const o = optionFor(mode, id)!;
  const base = { mode, id, title: o.title, subtitle: o.subtitle, website: o.website ?? null, atlasId: o.atlasId ?? null };
  if (mode === 'institutions') {
    const i = INSTITUTIONS.find((x) => x.id === id)!;
    return { ...base, status: null, lastVerified: i.lastVerified, listedOnly: false, note: null, domain: null };
  }
  if (mode === 'programmes') {
    const p = PROGRAMMES.find((x) => x.id === id)!;
    const statement = p.course.evidence === 'statement';
    return { ...base, status: statement ? 'verified' : 'partial', lastVerified: p.institution.lastVerified, listedOnly: !statement, note: statement ? null : (p.course.evidenceNote ?? NO_REASON_RECORDED), domain: null };
  }
  const c = COURSES.find((x) => x.id === id)!;
  return { ...base, status: 'orientation', lastVerified: null, listedOnly: false, note: null, domain: c.domain };
}

const fullName = (mode: CompareMode, id: string) => {
  const o = optionFor(mode, id)!;
  return mode === 'programmes' ? `${o.title} ${o.subtitle}` : o.title;
};

/** Group gaps by question, in ledger group order, keeping unknown and not applicable apart. */
function collectQuestions(sel: Selections) {
  type Bucket = Map<string, { id: string; label: string; group: GroupId; items: QuestionItem[] }>;
  const open: Bucket = new Map();
  const na: Bucket = new Map();
  for (const mode of MODES) {
    const ids = sel[mode];
    if (!ids.length) continue;
    for (const row of ledgerRows(mode, ids)) {
      row.cells.forEach((cell, i) => {
        if (cell.state !== 'unavailable' && cell.state !== 'notApplicable') return;
        const bucket = cell.state === 'unavailable' ? open : na;
        const q = bucket.get(row.id) ?? { id: row.id, label: row.label, group: row.group, items: [] };
        q.items.push({ mode, id: ids[i], name: fullName(mode, ids[i]), reason: cell.reason || NO_REASON_RECORDED });
        bucket.set(row.id, q);
      });
    }
  }
  const ordered = (b: Bucket): Question[] => GROUP_ORDER.flatMap((g) => [...b.values()].filter((q) => q.group === g));
  return { open: ordered(open), na: ordered(na) };
}

const institutionOfProgramme = (id: string) => PROGRAMMES.find((p) => p.id === id)!.institution;

/**
 * Merge question labels by institution: one entry per website, no gap lost. Institutions follow the order the student
 * kept them in (institutions, then the institutions of kept programmes); questions keep the order they arrive in, which
 * is ledger order. Nothing is sorted by name, merit or status.
 */
function sourcesFrom(pairs: readonly (readonly [string, string])[], sel: Selections): StepSource[] {
  const by = new Map<string, Set<string>>();
  for (const [inst, label] of pairs) by.set(inst, (by.get(inst) ?? new Set<string>()).add(label));
  const order = [...new Set([...sel.institutions, ...sel.programmes.map((id) => institutionOfProgramme(id).id)])];
  return order.filter((id) => by.has(id)).map((id) => {
    const i = INSTITUTIONS.find((x) => x.id === id)!;
    return { institutionId: id, institution: i.shortName, href: i.officialWebsite, questions: [...by.get(id)!] };
  });
}

function buildSteps(sel: Selections, open: readonly Question[], listed: readonly KeptEntry[]): NextStep[] {
  const step = (id: string, group: StepGroup, text: string, targetId: string | null, sources: readonly StepSource[] = []): NextStep => ({ id, group, text, status: 'orientation', targetId, sources });
  const steps: NextStep[] = [];
  const [ni, np, nc] = [sel.institutions.length, sel.programmes.length, sel.courses.length];
  const hasPlace = ni + np > 0;

  if (!hasPlace && nc === 0) steps.push(step('explore', 'explore', 'Look through the career worlds and pathways, and keep any course you want to think about.', 'act-discovery'));
  if (hasPlace && nc === 0) steps.push(step('explore-courses', 'explore', 'Explore the courses and pathways related to what you kept.', 'act-courses'));
  if (nc > 0 && !hasPlace) steps.push(step('find-institutions', 'explore', 'Look for institutions that may teach what you kept.', 'atlas-view'));
  if (ni > 0 && np === 0) steps.push(step('compare-programmes', 'explore', 'Compare specific programmes, not only institutions.', 'studio-workspace'));
  for (const mode of MODES) if (sel[mode].length === 1) steps.push(step(`add-another:${mode}`, 'explore', `Add another ${NOUN[mode]} if you want to compare side by side.`, 'studio-workspace'));

  // Verify: one grouped action each, however many institutions are involved. Every gap and link stays in `sources`.
  if (listed.length) {
    const pairs = listed.map((e) => [institutionOfProgramme(e.id).id, `Is ${e.title} currently offered?`] as const);
    steps.push(step('check-offered', 'verify', 'Check on the official websites that the programmes marked "listed only" are currently offered.', null, sourcesFrom(pairs, sel)));
  }
  const pairs = open.flatMap((q) =>
    q.items.flatMap((item) => {
      const inst = item.mode === 'institutions' ? item.id : item.mode === 'programmes' ? institutionOfProgramme(item.id).id : null;
      return inst ? [[inst, q.label] as const] : [];
    })
  );
  if (pairs.length) steps.push(step('check-official', 'verify', 'Look up what is still open on the official websites.', null, sourcesFrom(pairs, sel)));

  steps.push(step('talk', 'discuss', 'Talk it through with a teacher, family or a school counsellor.', null));
  return steps;
}

export function buildActionPlan(selections: Partial<Selections>): ActionPlan {
  const sel: Selections = { institutions: clean('institutions', selections.institutions), programmes: clean('programmes', selections.programmes), courses: clean('courses', selections.courses) };
  const entries = (mode: CompareMode) => sel[mode].map((id) => keptEntry(mode, id));
  const kept = { institutions: entries('institutions'), programmes: entries('programmes'), courses: entries('courses') };
  const { open, na } = collectQuestions(sel);
  const listed = kept.programmes.filter((p) => p.listedOnly);
  const offered: Question[] = listed.length
    ? [{ id: 'currently-offered', label: 'Is this currently offered?', group: null, items: listed.map((e) => ({ mode: e.mode, id: e.id, name: `${e.title} ${e.subtitle}`, reason: 'It is named on the institution’s pages but not described.' })) }]
    : [];
  const hasPlace = sel.institutions.length + sel.programmes.length > 0;
  const state: PlanState = !hasPlace && !sel.courses.length ? 'empty' : hasPlace && sel.courses.length ? 'full' : 'partial';
  return { state, kept, openQuestions: [...offered, ...open], notApplicable: na, steps: buildSteps(sel, open, listed) };
}

/** Can this id ever be produced by buildSteps? Used to validate stored ticks. */
export function isKnownStepId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  if (['explore', 'explore-courses', 'find-institutions', 'compare-programmes', 'check-offered', 'check-official', 'talk'].includes(id)) return true;
  return id.startsWith('add-another:') && MODES.includes(id.slice('add-another:'.length) as CompareMode);
}

/** The sheet as plain text, for copying. A tick is the student's own note and changes nothing else. */
export function planAsText(plan: ActionPlan, completed: readonly string[]): string {
  const STATUS: Record<VerificationStatus, string> = { verified: 'Verified', partial: 'Partially verified', orientation: 'Orientation', unverified: 'Not verified' };
  const entry = (e: KeptEntry) => `- ${e.title} (${e.subtitle})${e.listedOnly ? ' (listed only)' : ''}: ${e.status ? STATUS[e.status] : 'Details vary'}${e.lastVerified ? `, last checked ${e.lastVerified}` : ''}`;
  const all = [...plan.kept.institutions, ...plan.kept.programmes, ...plan.kept.courses];
  const lines = [`CareersCompus: ${SCENE_NAME}`, '', 'WHAT I KEPT', ...(all.length ? all.map(entry) : ['- Nothing yet']), ''];
  if (plan.openQuestions.length) {
    lines.push('STILL OPEN', ...plan.openQuestions.map((q) => `- ${q.label}: ${q.items.map((i) => i.name).join(', ')}`), '');
  }
  lines.push('POSSIBLE NEXT STEPS (general guidance)');
  plan.steps.forEach((s, n) => {
    lines.push(`${n + 1}. [${completed.includes(s.id) ? 'x' : ' '}] ${s.text}`);
    for (const x of s.sources) lines.push(`   ${x.institution}: ${x.href} (${x.questions.join(', ')})`);
  });
  lines.push('', STANDING_EVIDENCE_NOTE);
  return lines.join('\n');
}
