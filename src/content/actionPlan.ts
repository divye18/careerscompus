/**
 * Scene 7 — Next Steps: what the student kept, what is still open, and what they could do next.
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

export interface NextStep {
  id: string;
  group: StepGroup;
  text: string;
  /** the sequence is our general guidance, so every step is Orientation */
  status: 'orientation';
  /** element to return to on this page */
  targetId: string | null;
  /** official website from the dataset */
  href: string | null;
  /** what to look up, for a website step */
  questions: readonly string[];
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

function buildSteps(sel: Selections, open: readonly Question[], listed: readonly KeptEntry[]): NextStep[] {
  const step = (id: string, group: StepGroup, text: string, targetId: string | null, href: string | null = null, questions: readonly string[] = []): NextStep => ({ id, group, text, status: 'orientation', targetId, href, questions });
  const steps: NextStep[] = [];
  const [ni, np, nc] = [sel.institutions.length, sel.programmes.length, sel.courses.length];

  if (nc === 0) steps.push(step('explore', 'explore', 'Look through the career worlds and pathways, and keep any course you want to think about.', 'act-discovery'));
  if (nc > 0 && ni === 0 && np === 0) steps.push(step('find-institutions', 'explore', 'Look for institutions that may teach what you kept.', 'atlas-view'));
  if (ni > 0 && np === 0) steps.push(step('compare-programmes', 'explore', 'Compare specific programmes, not only institutions.', 'studio-workspace'));
  for (const mode of MODES) if (sel[mode].length === 1) steps.push(step(`add-another:${mode}`, 'explore', `Add another ${NOUN[mode]} if you want to compare side by side.`, 'studio-workspace'));

  for (const e of listed) steps.push(step(`check-offered:${e.id}`, 'verify', `Check on the official website that ${e.title} ${e.subtitle} is currently offered.`, null, e.website));

  // one website step per institution, however many kept options point at it
  const byInstitution = new Map<string, Set<string>>();
  for (const q of open) {
    for (const item of q.items) {
      const inst = item.mode === 'institutions' ? item.id : item.mode === 'programmes' ? institutionOfProgramme(item.id).id : null;
      if (!inst) continue;
      const labels = byInstitution.get(inst) ?? new Set<string>();
      labels.add(q.label);
      byInstitution.set(inst, labels);
    }
  }
  for (const [id, labels] of byInstitution) {
    const inst = INSTITUTIONS.find((i) => i.id === id)!;
    steps.push(step(`check-website:${id}`, 'verify', `Look up what is still open on the ${inst.shortName} website.`, null, inst.officialWebsite, [...labels]));
  }

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
  if (id === 'explore' || id === 'find-institutions' || id === 'compare-programmes' || id === 'talk') return true;
  const at = id.indexOf(':');
  if (at < 0) return false;
  const [kind, rest] = [id.slice(0, at), id.slice(at + 1)];
  if (kind === 'add-another') return MODES.includes(rest as CompareMode);
  if (kind === 'check-offered') return isKnownOption('programmes', rest);
  if (kind === 'check-website') return isKnownOption('institutions', rest);
  return false;
}
