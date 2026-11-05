/**
 * Career domains for the Meridian Atlas (initial approved set).
 *
 * HONESTY RULES: every string here is general orientation. No statistics, rankings, salaries, fees,
 * admission rates, entrance-exam names or eligibility cut-offs — those vary by institution and year
 * and must come from official sources before they are ever shown. Programme names are common,
 * widely used degree titles; availability differs between institutions.
 */

import { domainColor, type DomainId } from '@/theme/tokens';

export interface Domain {
  id: DomainId;
  name: string;
  /** Domain hue on night grounds (identifies the domain). Nocturne Atlas, 08 §3.3. */
  hue: string;
  /** Day variant for text/lines on ivory (≥ 4.5:1). */
  ink: string;
  blurb: string;
  /** Common degree / programme routes into the domain (names only). */
  paths: readonly string[];
  /** Kinds of work people in the domain do (types of roles, not promises). */
  roles: readonly string[];
}

export const EXPLORE_DISCLAIMER =
  'General orientation only. Programme names and requirements vary by institution — always check official sources.';

export const DOMAINS: readonly Domain[] = [
  {
    id: 'technology',
    name: 'Technology',
    hue: domainColor.technology.night,
    ink: domainColor.technology.ink,
    blurb: 'Software, data, AI and the systems that run modern life.',
    paths: ['B.Tech / B.E. in Computer Science, IT or Electronics', 'BCA', 'B.Sc. in Computer Science or Data Science', 'Diplomas in engineering or IT'],
    roles: ['Software developer', 'Data analyst or data scientist', 'Cybersecurity specialist', 'Systems and network engineer'],
  },
  {
    id: 'medicine',
    name: 'Medicine',
    hue: domainColor.medicine.night,
    ink: domainColor.medicine.ink,
    blurb: 'Care, healing and the science of the human body.',
    paths: ['MBBS', 'BDS (dentistry)', 'BAMS, BHMS and other AYUSH degrees', 'B.Sc. Nursing and allied health', 'B.Pharm'],
    roles: ['Doctor or surgeon', 'Dentist', 'Nurse or allied-health professional', 'Pharmacist', 'Medical researcher'],
  },
  {
    id: 'business',
    name: 'Business',
    hue: domainColor.business.night,
    ink: domainColor.business.ink,
    blurb: 'Leading, building and managing organisations and money.',
    paths: ['BBA or BMS', 'B.Com', 'Economics (B.A. / B.Sc.)', 'CA, CMA and CS professional routes', 'MBA after a first degree'],
    roles: ['Manager or entrepreneur', 'Accountant or auditor', 'Financial analyst', 'Marketing or operations specialist'],
  },
  {
    id: 'design',
    name: 'Design',
    hue: domainColor.design.night,
    ink: domainColor.design.ink,
    blurb: 'Shaping how products, spaces and ideas look and work.',
    paths: ['B.Des', 'B.A. or B.F.A. in design and fine arts', 'Diplomas in design', 'Animation and multimedia degrees'],
    roles: ['Product or UX designer', 'Graphic or communication designer', 'Fashion or textile designer', 'Animator or illustrator'],
  },
  {
    id: 'law',
    name: 'Law',
    hue: domainColor.law.night,
    ink: domainColor.law.ink,
    blurb: 'Rules, rights and the institutions that uphold them.',
    paths: ['Five-year integrated B.A. LL.B. or BBA LL.B.', 'LL.B. after a first degree', 'LL.M. for specialisation'],
    roles: ['Advocate or litigator', 'Corporate counsel', 'Judicial services (through the relevant selection process)', 'Legal researcher or policy analyst'],
  },
  {
    id: 'architecture',
    name: 'Architecture',
    hue: domainColor.architecture.night,
    ink: domainColor.architecture.ink,
    blurb: 'Designing the buildings and places people live in.',
    paths: ['B.Arch', 'B.Planning (urban and regional planning)', 'Diplomas in architectural assistantship', 'Interior and landscape design programmes'],
    roles: ['Architect', 'Urban planner', 'Interior or landscape designer', 'Construction or project consultant'],
  },
  {
    id: 'science',
    name: 'Science',
    hue: domainColor.science.night,
    ink: domainColor.science.ink,
    blurb: 'Asking why, from atoms and cells to ecosystems and stars.',
    paths: ['B.Sc. in Physics, Chemistry, Biology or Mathematics', 'Integrated B.S.–M.S. programmes', 'Environmental, agricultural and marine science degrees'],
    roles: ['Research scientist', 'Laboratory or field scientist', 'Science teacher or communicator', 'Data and analytics roles'],
  },
] as const;
