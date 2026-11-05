/**
 * Scene 4 — Courses & Learning Pathways: content model + illustrative data.
 *
 * CONTENT SOURCES: no verified course/eligibility dataset exists in the repo yet (see docs/content-model.md).
 * Everything here is GENERAL ORIENTATION written for this milestone: programme names are common, widely used
 * degree titles; "subjects" are the kinds of topics such programmes usually cover; "careers" are possible
 * directions, not outcomes. Every course carries `status: 'illustrative'`.
 *
 * HONESTY RULES (enforced by structure): there are deliberately NO fields for durations, fees, seats, cut-offs,
 * salaries, placement figures, rankings, accreditation or affiliation. Entrance exams and eligibility live in
 * `entrance`, which is `null` until a reviewed, sourced record exists — the UI then says so instead of guessing.
 * `from` lists the levels a programme is *commonly* entered from; it is a pointer for orientation, never a
 * guarantee of eligibility or admission.
 *
 * TODO(content): when verified data lands, set `status: 'verified'` and fill `entrance` per course
 * (`exams`, `source`, `verifiedOn`); the UI already renders it.
 */

import type { DomainId } from '@/theme/tokens';

export type LevelId = 'class10' | 'class12' | 'diploma' | 'undergraduate' | 'postgraduate';

export interface Level {
  id: LevelId;
  label: string;
  /** one plain sentence about what usually comes next — orientation, not a rule */
  next: string;
}

export const LEVELS: readonly Level[] = [
  { id: 'class10', label: 'Class 10', next: 'The usual next steps are choosing a stream for Class 11–12, or a diploma programme.' },
  { id: 'class12', label: 'Class 12', next: 'Most degree programmes are commonly started after Class 12. Subjects studied in school can matter.' },
  { id: 'diploma', label: 'Diploma', next: 'Some institutions let diploma holders continue into a degree. This varies, so check each one.' },
  { id: 'undergraduate', label: 'Undergraduate', next: 'A first degree is the usual starting point for postgraduate study and many professional routes.' },
  { id: 'postgraduate', label: 'Postgraduate', next: 'Further specialisation, research and doctoral routes follow from here.' },
];

export interface EntranceInfo {
  exams: readonly string[];
  /** where the information comes from (official page, brochure…) */
  source: string;
  /** ISO date the record was last verified */
  verifiedOn: string;
}

export interface Specialisation {
  id: string;
  name: string;
  /** possible career directions (types of role) */
  careers: readonly string[];
}

export interface Course {
  id: string;
  domain: DomainId;
  name: string;
  /** levels it is commonly entered from — orientation only */
  from: readonly LevelId[];
  /** kinds of subjects such programmes usually cover */
  subjects: readonly string[];
  /** optional plain-language note shown with the specialisations (e.g. "chosen after the degree") */
  specNote?: string;
  specialisations: readonly Specialisation[];
  entrance: EntranceInfo | null;
  status: 'illustrative' | 'verified';
}

export const PATHWAY_DISCLAIMER =
  'Possible pathways for orientation only. Eligibility, entrance routes and programme details vary by institution and year, so check each institution’s official information.';
export const ENTRANCE_PLACEHOLDER =
  'Entrance and eligibility details are not listed yet. They differ by institution, so check official sources. Verified guidance will appear here.';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const spec = (name: string, ...careers: string[]): Specialisation => ({ id: slug(name), name, careers });
const course = (
  domain: DomainId,
  name: string,
  from: LevelId[],
  subjects: string[],
  specialisations: Specialisation[],
  specNote?: string
): Course => ({ id: `${domain}-${slug(name)}`, domain, name, from, subjects, specNote, specialisations, entrance: null, status: 'illustrative' });

export const COURSES: readonly Course[] = [
  // ---- Technology
  course('technology', 'B.Tech / B.E.', ['class12', 'diploma'], ['Mathematics', 'Physics', 'Programming', 'Engineering design', 'Electronics fundamentals'], [
    spec('Computer Science', 'Software engineer', 'Data scientist', 'Cybersecurity analyst'),
    spec('Electronics & Communication', 'Embedded systems engineer', 'Hardware engineer', 'Network engineer'),
    spec('Mechanical Engineering', 'Design engineer', 'Manufacturing engineer', 'Automation engineer'),
  ]),
  course('technology', 'BCA', ['class12'], ['Programming', 'Databases', 'Web development', 'Mathematics for computing'], [
    spec('Software Development', 'Software engineer', 'Web developer'),
    spec('Data & Analytics', 'Data analyst', 'Business analyst'),
    spec('Cloud & Systems', 'Systems administrator', 'Cloud support engineer'),
  ]),
  course('technology', 'Diploma in Engineering', ['class10'], ['Engineering drawing', 'Workshop practice', 'Applied mathematics', 'Branch fundamentals'], [
    spec('Computer Engineering', 'IT support technician', 'Junior developer'),
    spec('Electronics', 'Electronics technician', 'Service engineer'),
    spec('Mechanical', 'Maintenance technician', 'Production supervisor'),
  ], 'Some institutions allow diploma holders to join a degree later. Check each institution.'),
  course('technology', 'M.Tech / M.Sc. Computing', ['undergraduate'], ['Advanced algorithms', 'Research methods', 'Machine learning', 'Systems design'], [
    spec('Artificial Intelligence', 'Machine learning engineer', 'Research scientist'),
    spec('Data Science', 'Data scientist', 'Analytics lead'),
    spec('Cybersecurity', 'Security engineer', 'Security researcher'),
  ]),

  // ---- Medicine & Healthcare
  course('medicine', 'MBBS', ['class12'], ['Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Pharmacology', 'Clinical practice'], [
    spec('General Medicine', 'Doctor', 'Physician'),
    spec('Surgery', 'Surgeon', 'Trauma specialist'),
    spec('Paediatrics', 'Paediatrician', 'Neonatal specialist'),
  ], 'Specialisations are usually chosen through further study after the degree.'),
  course('medicine', 'B.Sc. Nursing', ['class12'], ['Anatomy and physiology', 'Nursing foundations', 'Community health', 'Clinical practice'], [
    spec('Clinical Nursing', 'Staff nurse', 'Critical-care nurse'),
    spec('Community Health', 'Community health nurse', 'Public-health worker'),
    spec('Mental Health Nursing', 'Psychiatric nurse', 'Counselling support'),
  ]),
  course('medicine', 'B.Pharm', ['class12'], ['Pharmaceutics', 'Pharmacology', 'Medicinal chemistry', 'Pharmaceutical analysis'], [
    spec('Clinical Pharmacy', 'Hospital pharmacist', 'Clinical pharmacist'),
    spec('Pharmaceutical Sciences', 'Formulation scientist', 'Quality analyst'),
    spec('Regulatory Affairs', 'Regulatory associate', 'Drug-safety associate'),
  ]),
  course('medicine', 'BDS', ['class12'], ['Dental anatomy', 'Oral pathology', 'Dental materials', 'Clinical practice'], [
    spec('Orthodontics', 'Orthodontist'),
    spec('Oral Surgery', 'Oral surgeon'),
    spec('Public-health Dentistry', 'Public-health dentist'),
  ], 'Specialisations are usually chosen through further study after the degree.'),

  // ---- Business & Management
  course('business', 'BBA', ['class12'], ['Management principles', 'Accounting', 'Economics', 'Marketing', 'Business statistics'], [
    spec('Finance', 'Financial analyst', 'Banking associate'),
    spec('Marketing', 'Marketing executive', 'Brand manager'),
    spec('Human Resources', 'HR generalist', 'Talent coordinator'),
  ]),
  course('business', 'B.Com', ['class12'], ['Accounting', 'Business law', 'Economics', 'Taxation'], [
    spec('Accounting & Taxation', 'Accountant', 'Tax consultant', 'Auditor'),
    spec('Finance', 'Financial analyst', 'Treasury associate'),
    spec('Business Analytics', 'Business analyst', 'Operations analyst'),
  ]),
  course('business', 'Economics (B.A. / B.Sc.)', ['class12'], ['Microeconomics', 'Macroeconomics', 'Statistics', 'Econometrics'], [
    spec('Applied Economics', 'Economic analyst', 'Policy researcher'),
    spec('Finance & Markets', 'Financial analyst', 'Market researcher'),
    spec('Data & Econometrics', 'Data analyst', 'Business analyst'),
  ]),
  course('business', 'MBA', ['undergraduate'], ['Strategy', 'Finance', 'Marketing', 'Operations', 'Leadership'], [
    spec('Finance', 'Financial manager', 'Investment analyst'),
    spec('Marketing', 'Product marketing manager', 'Brand manager'),
    spec('Operations & Analytics', 'Business analyst', 'Operations manager'),
  ]),

  // ---- Design & Creativity
  course('design', 'B.Des', ['class12'], ['Design fundamentals', 'Visual communication', 'Materials and making', 'Design research'], [
    spec('Product Design', 'Product designer', 'Industrial designer'),
    spec('Communication Design', 'Graphic designer', 'UX designer'),
    spec('Fashion & Textile Design', 'Fashion designer', 'Textile designer'),
  ]),
  course('design', 'B.A. / B.F.A. in Design & Fine Arts', ['class12'], ['Drawing', 'Art and design history', 'Composition', 'Digital media'], [
    spec('Visual Arts', 'Illustrator', 'Visual artist'),
    spec('Animation & Multimedia', 'Animator', 'Motion designer'),
    spec('Photography & Film', 'Photographer', 'Visual storyteller'),
  ]),
  course('design', 'Diploma in Design', ['class12'], ['Drawing and sketching', 'Design software', 'Materials', 'Portfolio practice'], [
    spec('Graphic Design', 'Graphic designer', 'Studio assistant'),
    spec('Interior Design', 'Interior designer'),
    spec('Fashion Design', 'Fashion designer'),
  ]),
  course('design', 'M.Des', ['undergraduate'], ['Design research', 'Systems thinking', 'Prototyping', 'Design studio'], [
    spec('Interaction Design', 'UX designer', 'Interaction designer'),
    spec('Product Design', 'Product designer', 'Design researcher'),
    spec('Design Strategy', 'Design strategist', 'Design lead'),
  ]),

  // ---- Law & Public Policy
  course('law', 'B.A. LL.B. (integrated)', ['class12'], ['Constitutional law', 'Contract law', 'Criminal law', 'Legal methods', 'Political science'], [
    spec('Constitutional Law', 'Advocate', 'Legal researcher', 'Policy analyst'),
    spec('Corporate Law', 'Corporate counsel', 'Compliance officer'),
    spec('Criminal Law', 'Advocate', 'Legal aid lawyer'),
  ]),
  course('law', 'LL.B. (after a first degree)', ['undergraduate'], ['Constitutional law', 'Contract law', 'Property law', 'Legal writing'], [
    spec('Litigation', 'Advocate', 'Litigation associate'),
    spec('Corporate & Commercial Law', 'Corporate counsel', 'Contracts specialist'),
    spec('Public Policy & Governance', 'Policy analyst', 'Legal researcher'),
  ]),
  course('law', 'LL.M.', ['postgraduate', 'undergraduate'], ['Advanced legal research', 'Jurisprudence', 'Comparative law', 'Dissertation'], [
    spec('Constitutional Law', 'Legal academic', 'Constitutional lawyer'),
    spec('Corporate Law', 'Senior counsel', 'Compliance lead'),
    spec('International Law', 'Policy adviser', 'International-law researcher'),
  ]),

  // ---- Architecture & Infrastructure
  course('architecture', 'B.Arch', ['class12'], ['Architectural design', 'Building materials', 'Structures', 'History of architecture', 'Environmental design'], [
    spec('Architectural Design', 'Architect', 'Design associate'),
    spec('Urban Design', 'Urban designer', 'Planning associate'),
    spec('Sustainable Architecture', 'Sustainability consultant', 'Green-building specialist'),
  ]),
  course('architecture', 'B.Tech / B.E. Civil Engineering', ['class12', 'diploma'], ['Mathematics', 'Mechanics', 'Surveying', 'Structural analysis', 'Construction'], [
    spec('Structural Engineering', 'Structural engineer', 'Site engineer'),
    spec('Transportation Engineering', 'Transport planner', 'Highway engineer'),
    spec('Environmental Engineering', 'Environmental engineer', 'Water-systems engineer'),
  ]),
  course('architecture', 'B.Planning', ['class12'], ['Urban studies', 'Planning theory', 'Geographic information systems', 'Transport and housing'], [
    spec('Urban Planning', 'Urban planner', 'Housing analyst'),
    spec('Transport Planning', 'Transport planner'),
    spec('Environmental Planning', 'Environmental planner'),
  ]),
  course('architecture', 'Diploma in Architectural Assistantship', ['class10'], ['Architectural drawing', 'Building construction', 'Basic design', 'Drafting software'], [
    spec('Drafting & Detailing', 'Architectural assistant', 'Draftsperson'),
    spec('Site Practice', 'Site supervisor'),
    spec('Interior Detailing', 'Interior assistant'),
  ], 'Some institutions allow diploma holders to join a degree later. Check each institution.'),

  // ---- Science & Research
  course('science', 'B.Sc. (Physical sciences)', ['class12'], ['Physics', 'Chemistry', 'Mathematics', 'Laboratory methods'], [
    spec('Physics', 'Research scientist', 'Science teacher'),
    spec('Chemistry', 'Laboratory scientist', 'Research associate'),
    spec('Mathematics & Statistics', 'Data analyst', 'Research scientist'),
  ]),
  course('science', 'B.Sc. (Life sciences)', ['class12'], ['Biology', 'Chemistry', 'Genetics', 'Laboratory methods'], [
    spec('Biotechnology', 'Biotechnologist', 'Research associate'),
    spec('Microbiology', 'Microbiologist', 'Laboratory scientist'),
    spec('Environmental Science', 'Environmental scientist', 'Field researcher'),
  ]),
  course('science', 'Integrated B.S.–M.S.', ['class12'], ['Core sciences', 'Research methods', 'Mathematics', 'Project work'], [
    spec('Physical Sciences', 'Research scientist', 'Research associate'),
    spec('Life Sciences', 'Research scientist', 'Biotechnologist'),
    spec('Earth & Environmental Sciences', 'Environmental scientist', 'Research associate'),
  ]),
  course('science', 'M.Sc.', ['undergraduate'], ['Advanced coursework', 'Research methods', 'Dissertation', 'Seminars'], [
    spec('Physics', 'Research scientist', 'Lecturer'),
    spec('Biotechnology', 'Biotechnologist', 'Research scientist'),
    spec('Data Science', 'Data scientist', 'Research analyst'),
  ]),
];

/** Courses in a domain, optionally narrowed to those commonly entered from a level. */
export function coursesFor(domain: DomainId, level: LevelId | null): Course[] {
  return COURSES.filter((c) => c.domain === domain && (level === null || c.from.includes(level)));
}
