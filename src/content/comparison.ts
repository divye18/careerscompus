/**
 * Scene 6 — Comparison Studio: what a comparison cell can say, and how a ledger is built.
 * Pure data logic: no React, no invented values. Everything comes from the verified institution dataset
 * (src/content/institutions.ts) or the illustrative pathway content (src/content/pathways.ts).
 *
 * THE THREE STATES of a fact:
 *   verified       supported by a source (URL + quote + last-checked date from the evidence pipeline)
 *   unavailable    could apply, but no source has been checked. Never zero and never a negative result.
 *   notApplicable  the field genuinely does not apply to this kind of option (e.g. a fee for a whole university)
 * Scene 4's course pathways are illustrative and have no sources, so they cannot be "verified". They use a separate
 * `orientation` label, are never counted as verified and can never produce a difference.
 *
 * DIFFERENCES: a row differs only when at least two cells are verified, their values differ, and the parameter is
 * marked `comparable`. Partial lists (academic domains, available courses) are not comparable: an item missing
 * from a partial list says nothing about the institution. There are no scores, ranks or winners anywhere.
 */

import { DOMAINS } from './domains';
import { INSTITUTIONS, REGIONS, TYPE_SINGULAR, type Gap, type Institution, type SourceNote, type VerifiedCourse } from './institutions';
import { COURSES, LEVELS, type Course } from './pathways';

export type CompareMode = 'institutions' | 'courses' | 'programmes';
export const MAX_COLUMNS = 3;

export type Cell =
  | { state: 'verified'; value: string; norm: string; sources: readonly SourceNote[]; lastVerified: string; derived?: string; href?: string; partial?: boolean }
  | { state: 'orientation'; value: string }
  | { state: 'unavailable'; reason: string }
  | { state: 'notApplicable'; reason: string };

export type GroupId = 'identity' | 'academic' | 'financial' | 'outcomes';

interface ParamDef<O> {
  id: string;
  group: GroupId;
  label: string;
  /** a short qualifier shown under the parameter label */
  note?: string;
  /** verified values may be highlighted as a difference */
  comparable?: boolean;
  /** short verified values (years, durations) are set larger */
  figure?: boolean;
  cell: (o: O) => Cell;
}

/** A programme is an institution + one of its verified courses. Only verified pairs can exist. */
export interface Programme {
  id: string;
  institution: Institution;
  course: VerifiedCourse;
}

export const PROGRAMMES: readonly Programme[] = INSTITUTIONS.flatMap((institution) => institution.availableCourses.map((course) => ({ id: course.id, institution, course })));

const unavailable = (reason: string): Cell => ({ state: 'unavailable', reason });
const notApplicable = (reason: string): Cell => ({ state: 'notApplicable', reason });
const sourcesFor = (i: Institution, field: string) => i.dataSources.filter((s) => s.field === field);
/** The recorded reason a fact is missing (from the verification pipeline), or the honest fallback when none was recorded. */
const gapReason = (g: Gap | undefined, fallback: string) => g?.detail ?? fallback;

const WHY = {
  notRecorded: 'No official statement of this has been recorded yet.',
  accreditation: 'Accreditation changes over time and has to come from the accrediting body. No record checked yet.',
  recognition: 'No official recognition record checked yet.',
  scholarships: 'No official scholarship information checked yet.',
  placement: 'No sourced, clearly defined placement report checked yet.',
  employment: 'No sourced employment outcome data checked yet.',
  salary: 'We show salary figures only when they are reliably sourced and clearly defined. We have none yet.',
  perProgramme: 'Set per programme, not per institution. Compare programmes to see it.',
  feesPerProgramme: 'Fees are set per programme and year, so a whole institution has no single figure.',
  byInstitution: 'Set by each institution, so a course in general has no single figure.',
  institutionsOnly: 'Applies to institutions and specific programmes, not to a course in general.',
  placementInstitution: 'Reported by institutions, not for a course in general.',
};

const locationCell = (i: Institution): Cell => ({
  state: 'verified',
  value: `${i.city}, ${i.state}`,
  norm: `${i.city}|${i.state}`,
  sources: sourcesFor(i, 'city'),
  lastVerified: i.lastVerified,
  derived: 'The city is confirmed on the official page. The state follows from the city.',
});

const regionCell = (i: Institution): Cell => ({
  state: 'verified',
  value: REGIONS.find((r) => r.id === i.region)?.label ?? i.region,
  norm: i.region,
  sources: sourcesFor(i, 'city'),
  lastVerified: i.lastVerified,
  derived: 'Our browsing group, worked out from the verified city. Not an official classification.',
});

const typeCell = (i: Institution): Cell =>
  i.institutionType
    ? { state: 'verified', value: TYPE_SINGULAR[i.institutionType], norm: i.institutionType, sources: sourcesFor(i, 'institutionType'), lastVerified: i.lastVerified }
    : unavailable(gapReason(i.gaps.institutionType, WHY.notRecorded));

const websiteCell = (i: Institution): Cell => ({
  state: 'verified',
  value: i.officialWebsite.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  norm: i.officialWebsite,
  sources: [],
  lastVerified: i.lastVerified,
  href: i.officialWebsite,
});

const nameCell = (i: Institution): Cell => ({ state: 'verified', value: i.name, norm: i.id, sources: sourcesFor(i, 'name'), lastVerified: i.lastVerified });

const INSTITUTION_PARAMS: readonly ParamDef<Institution>[] = [
  { id: 'name', group: 'identity', label: 'Full name', cell: nameCell },
  { id: 'location', group: 'identity', label: 'Location', comparable: true, cell: locationCell },
  { id: 'region', group: 'identity', label: 'Region', comparable: true, cell: regionCell },
  { id: 'type', group: 'identity', label: 'Institution type', comparable: true, cell: typeCell },
  {
    id: 'established',
    group: 'identity',
    label: 'Established',
    comparable: true,
    figure: true,
    cell: (i) =>
      i.establishedYear !== null
        ? { state: 'verified', value: String(i.establishedYear), norm: String(i.establishedYear), sources: sourcesFor(i, 'establishedYear'), lastVerified: i.lastVerified }
        : unavailable(gapReason(i.gaps.establishedYear, i.notes.establishedYear ?? WHY.notRecorded)),
  },
  { id: 'website', group: 'identity', label: 'Official website', cell: websiteCell },
  {
    id: 'domains',
    group: 'identity',
    label: 'Academic domains',
    note: 'Partial: only what its official pages confirmed.',
    cell: (i) =>
      i.academicDomains.length
        ? {
            state: 'verified',
            value: i.academicDomains.map((d) => DOMAINS.find((x) => x.id === d)?.longName ?? d).join(', '),
            norm: [...i.academicDomains].sort().join('|'),
            sources: i.dataSources.filter((s) => s.field.startsWith('academicDomains:')),
            lastVerified: i.lastVerified,
          }
        : unavailable(gapReason(i.gaps.academicDomains, WHY.notRecorded)),
  },
  {
    id: 'courses',
    group: 'academic',
    label: 'Available courses',
    note: 'Partial: only what we confirmed so far.',
    cell: (i) =>
      i.availableCourses.length
        ? {
            state: 'verified',
            value: i.availableCourses.map((c) => c.name).join(', '),
            norm: i.availableCourses.map((c) => c.id).sort().join('|'),
            sources: i.dataSources.filter((s) => s.field.startsWith('course:')),
            lastVerified: i.lastVerified,
          }
        : unavailable(gapReason(i.gaps.availableCourses, 'Course lists are being verified one institution at a time.')),
  },
  { id: 'duration', group: 'academic', label: 'Course duration', cell: () => notApplicable(WHY.perProgramme) },
  { id: 'eligibility', group: 'academic', label: 'Eligibility', cell: () => notApplicable(WHY.perProgramme) },
  { id: 'entrance', group: 'academic', label: 'Entrance examinations', cell: () => notApplicable(WHY.perProgramme) },
  { id: 'accreditation', group: 'academic', label: 'Accreditation', cell: () => unavailable(WHY.accreditation) },
  { id: 'recognition', group: 'academic', label: 'Recognition', cell: () => unavailable(WHY.recognition) },
  { id: 'tuition', group: 'financial', label: 'Tuition fees', cell: () => notApplicable(WHY.feesPerProgramme) },
  { id: 'costs', group: 'financial', label: 'Additional costs', cell: () => notApplicable(WHY.feesPerProgramme) },
  { id: 'scholarships', group: 'financial', label: 'Scholarships', cell: () => unavailable(WHY.scholarships) },
  { id: 'placement', group: 'outcomes', label: 'Placement information', cell: () => unavailable(WHY.placement) },
  { id: 'employment', group: 'outcomes', label: 'Employment outcomes', cell: () => unavailable(WHY.employment) },
  { id: 'salary', group: 'outcomes', label: 'Average salary', cell: () => unavailable(WHY.salary) },
];

const onInstitution = (id: string, label: string, cell: (i: Institution) => Cell, extra: Partial<ParamDef<Programme>> = {}): ParamDef<Programme> => ({
  id,
  group: 'identity',
  label,
  cell: (p) => cell(p.institution),
  ...extra,
});

const PROGRAMME_PARAMS: readonly ParamDef<Programme>[] = [
  {
    id: 'programme',
    group: 'identity',
    label: 'Programme',
    cell: (p) => ({
      state: 'verified',
      value: p.course.name,
      norm: p.course.id,
      sources: sourcesFor(p.institution, `course:${p.id}`),
      lastVerified: p.institution.lastVerified,
      // a programme only named in a menu or list is partly confirmed, and says so
      ...(p.course.evidence === 'listing' ? { partial: true, derived: p.course.evidenceNote ?? 'Named in a programme list; no programme page we checked describes it.' } : p.course.evidenceNote ? { derived: p.course.evidenceNote } : {}),
    }),
  },
  onInstitution('institution', 'Institution', nameCell),
  onInstitution('location', 'Location', locationCell, { comparable: true }),
  onInstitution('region', 'Region', regionCell, { comparable: true }),
  onInstitution('type', 'Institution type', typeCell, { comparable: true }),
  onInstitution('website', 'Official website', websiteCell),
  {
    id: 'duration',
    group: 'academic',
    label: 'Course duration',
    comparable: true,
    figure: true,
    cell: (p) =>
      p.course.durationYears !== null
        ? {
            state: 'verified',
            value: `${p.course.durationYears} ${p.course.durationYears === 1 ? 'year' : 'years'}`,
            norm: String(p.course.durationYears),
            sources: sourcesFor(p.institution, `duration:${p.id}`),
            lastVerified: p.institution.lastVerified,
            ...(p.course.durationNote ? { derived: p.course.durationNote } : {}),
          }
        : unavailable(gapReason(p.course.durationGap, 'No duration has been recorded for this programme.')),
  },
  { id: 'eligibility', group: 'academic', label: 'Eligibility', cell: () => unavailable('Differs by programme and year. No official record checked yet.') },
  { id: 'entrance', group: 'academic', label: 'Entrance examinations', cell: () => unavailable('Differs by programme and year. No official record checked yet.') },
  { id: 'accreditation', group: 'academic', label: 'Accreditation', cell: () => unavailable(WHY.accreditation) },
  { id: 'recognition', group: 'academic', label: 'Recognition', cell: () => unavailable(WHY.recognition) },
  { id: 'tuition', group: 'financial', label: 'Tuition fees', cell: () => unavailable('No official fee schedule checked yet.') },
  { id: 'costs', group: 'financial', label: 'Additional costs', cell: () => unavailable('No official fee schedule checked yet.') },
  { id: 'scholarships', group: 'financial', label: 'Scholarships', cell: () => unavailable(WHY.scholarships) },
  { id: 'placement', group: 'outcomes', label: 'Placement information', cell: () => unavailable(WHY.placement) },
  { id: 'employment', group: 'outcomes', label: 'Employment outcomes', cell: () => unavailable(WHY.employment) },
  { id: 'salary', group: 'outcomes', label: 'Average salary', cell: () => unavailable(WHY.salary) },
];

const orientation = (value: string): Cell => ({ state: 'orientation', value });
const levelLabel = (id: string) => LEVELS.find((l) => l.id === id)?.label ?? id;

const COURSE_PARAMS: readonly ParamDef<Course>[] = [
  { id: 'field', group: 'identity', label: 'Field', cell: (c) => orientation(DOMAINS.find((d) => d.id === c.domain)?.longName ?? c.domain) },
  { id: 'entry', group: 'identity', label: 'Commonly entered from', cell: (c) => orientation(c.from.map(levelLabel).join(', ')) },
  { id: 'subjects', group: 'identity', label: 'Subjects you may study', cell: (c) => orientation(c.subjects.join(', ')) },
  { id: 'specialisations', group: 'identity', label: 'Specialisations', cell: (c) => orientation(c.specialisations.map((s) => s.name).join(', ')) },
  { id: 'careers', group: 'identity', label: 'Possible career directions', cell: (c) => orientation([...new Set(c.specialisations.flatMap((s) => s.careers))].join(', ')) },
  {
    id: 'confirmedAt',
    group: 'academic',
    label: 'Confirmed at',
    note: 'Partial: institutions whose official pages we checked.',
    cell: (c) => {
      const all = PROGRAMMES.filter((p) => p.course.pathwayId === c.id);
      // a programme that is only named in a menu or list does not count as confirmed
      const hits = all.filter((p) => p.course.evidence !== 'listing');
      const listed = all.filter((p) => p.course.evidence === 'listing');
      if (!hits.length) return unavailable(listed.length ? `Only named in a menu or list at ${listed.map((p) => p.institution.shortName).join(', ')}; no programme page we checked describes it.` : 'No institution confirmed for this course yet.');
      return {
        state: 'verified',
        value: hits.map((p) => p.institution.shortName).join(', '),
        norm: hits.map((p) => p.id).sort().join('|'),
        sources: hits.flatMap((p) => sourcesFor(p.institution, `course:${p.id}`)),
        lastVerified: hits[0].institution.lastVerified,
        ...(listed.length ? { derived: `Also named in a menu or list, but not described on a programme page, at ${listed.map((p) => p.institution.shortName).join(', ')}.` } : {}),
      };
    },
  },
  { id: 'duration', group: 'academic', label: 'Course duration', cell: () => unavailable('Can differ by institution. Compare programmes for verified durations.') },
  { id: 'eligibility', group: 'academic', label: 'Eligibility', cell: () => unavailable('Differs by institution and year. No official record checked yet.') },
  {
    id: 'entrance',
    group: 'academic',
    label: 'Entrance examinations',
    cell: (c) =>
      c.entrance
        ? { state: 'verified', value: c.entrance.exams.join(', '), norm: [...c.entrance.exams].sort().join('|'), sources: [{ field: 'entrance', url: c.entrance.source, quote: '' }], lastVerified: c.entrance.verifiedOn }
        : unavailable('Differs by institution and year. No official record checked yet.'),
  },
  { id: 'accreditation', group: 'academic', label: 'Accreditation', cell: () => notApplicable(WHY.institutionsOnly) },
  { id: 'recognition', group: 'academic', label: 'Recognition', cell: () => notApplicable(WHY.institutionsOnly) },
  { id: 'tuition', group: 'financial', label: 'Tuition fees', cell: () => notApplicable(WHY.byInstitution) },
  { id: 'costs', group: 'financial', label: 'Additional costs', cell: () => notApplicable(WHY.byInstitution) },
  { id: 'scholarships', group: 'financial', label: 'Scholarships', cell: () => notApplicable(WHY.byInstitution) },
  { id: 'placement', group: 'outcomes', label: 'Placement information', cell: () => notApplicable(WHY.placementInstitution) },
  { id: 'employment', group: 'outcomes', label: 'Employment outcomes', cell: () => unavailable(WHY.employment) },
  { id: 'salary', group: 'outcomes', label: 'Average salary', cell: () => unavailable(WHY.salary) },
];

/* ---- options ---- */

export interface CompareOption {
  id: string;
  title: string;
  subtitle: string;
  website?: string;
  /** institution to open in the Scene 5 atlas */
  atlasId?: string;
}

const instOption = (i: Institution): CompareOption => ({ id: i.id, title: i.shortName, subtitle: `${i.city}, ${i.state}`, website: i.officialWebsite, atlasId: i.id });
const courseOption = (c: Course): CompareOption => ({ id: c.id, title: c.name, subtitle: DOMAINS.find((d) => d.id === c.domain)?.longName ?? c.domain });
const programmeOption = (p: Programme): CompareOption => ({ id: p.id, title: p.course.name, subtitle: `at ${p.institution.shortName}`, website: p.institution.officialWebsite, atlasId: p.institution.id });

export function optionFor(mode: CompareMode, id: string): CompareOption | null {
  if (mode === 'institutions') {
    const i = INSTITUTIONS.find((x) => x.id === id);
    return i ? instOption(i) : null;
  }
  if (mode === 'courses') {
    const c = COURSES.find((x) => x.id === id);
    return c ? courseOption(c) : null;
  }
  const p = PROGRAMMES.find((x) => x.id === id);
  return p ? programmeOption(p) : null;
}

export interface PickerGroup {
  label: string;
  options: readonly CompareOption[];
}

export function pickerGroups(mode: CompareMode): readonly PickerGroup[] {
  if (mode === 'institutions') {
    return REGIONS.map((r) => ({ label: r.label, options: INSTITUTIONS.filter((i) => i.region === r.id).map(instOption) })).filter((g) => g.options.length);
  }
  if (mode === 'courses') {
    return DOMAINS.map((d) => ({ label: d.longName, options: COURSES.filter((c) => c.domain === d.id).map(courseOption) }));
  }
  return INSTITUTIONS.filter((i) => i.availableCourses.length).map((i) => ({
    label: i.shortName,
    options: PROGRAMMES.filter((p) => p.institution.id === i.id).map(programmeOption),
  }));
}

/* ---- ledger ---- */

export const GROUP_LABELS: Record<CompareMode, Record<GroupId, string>> = {
  institutions: { identity: 'The institution', academic: 'Academic', financial: 'Financial', outcomes: 'Outcomes' },
  courses: { identity: 'The course', academic: 'Academic', financial: 'Financial', outcomes: 'Outcomes' },
  programmes: { identity: 'The programme', academic: 'Academic', financial: 'Financial', outcomes: 'Outcomes' },
};
export const GROUP_ORDER: readonly GroupId[] = ['identity', 'academic', 'financial', 'outcomes'];

export interface LedgerRow {
  id: string;
  group: GroupId;
  label: string;
  note?: string;
  figure: boolean;
  cells: readonly Cell[];
  /** two or more verified values that really differ */
  differs: boolean;
  anyVerified: boolean;
  /** a partial list: it shows only what was confirmed, so the label is Partially verified */
  partial: boolean;
}

export type LedgerView = 'all' | 'verified' | 'differences';

function buildRows<O>(params: readonly ParamDef<O>[], items: readonly O[]): LedgerRow[] {
  return params.map((p) => {
    const cells = items.map((o) => p.cell(o));
    const verified = cells.filter((c): c is Extract<Cell, { state: 'verified' }> => c.state === 'verified');
    const differs = Boolean(p.comparable) && verified.length >= 2 && new Set(verified.map((c) => c.norm)).size >= 2;
    const partial = Boolean(p.note?.startsWith('Partial'));
    return { id: p.id, group: p.group, label: p.label, note: p.note, figure: Boolean(p.figure), cells, differs, anyVerified: verified.length > 0, partial };
  });
}

export function ledgerRows(mode: CompareMode, ids: readonly string[]): LedgerRow[] {
  if (mode === 'institutions') {
    const items = ids.map((id) => INSTITUTIONS.find((i) => i.id === id)).filter((x): x is Institution => Boolean(x));
    return buildRows(INSTITUTION_PARAMS, items);
  }
  if (mode === 'courses') {
    const items = ids.map((id) => COURSES.find((c) => c.id === id)).filter((x): x is Course => Boolean(x));
    return buildRows(COURSE_PARAMS, items);
  }
  const items = ids.map((id) => PROGRAMMES.find((p) => p.id === id)).filter((x): x is Programme => Boolean(x));
  return buildRows(PROGRAMME_PARAMS, items);
}

/** Parameter list for a mode (used by the parameter chooser and the empty state). */
export function parametersFor(mode: CompareMode): readonly { id: string; group: GroupId; label: string }[] {
  const list: readonly { id: string; group: GroupId; label: string }[] = mode === 'institutions' ? INSTITUTION_PARAMS : mode === 'courses' ? COURSE_PARAMS : PROGRAMME_PARAMS;
  return list.map(({ id, group, label }) => ({ id, group, label }));
}

export const isKnownOption = (mode: CompareMode, id: string) => optionFor(mode, id) !== null;

/** Two programmes built on different kinds of degree are worth flagging, not hiding. */
export function programmesAreUnlike(ids: readonly string[]): boolean {
  const kinds = new Set(ids.map((id) => PROGRAMMES.find((p) => p.id === id)?.course.pathwayId ?? id));
  return kinds.size > 1;
}
