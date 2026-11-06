/**
 * Career domains for the Meridian Atlas (initial approved set).
 *
 * CONTENT SOURCES: the one-line blurbs echo the earlier homepage copy; everything else is general orientation
 * written for this milestone (no verified dataset exists in the repo yet). TODO(content): replace with reviewed,
 * sourced copy when the content model lands (docs/content-model.md).
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
  /** Fuller name used in Scene 3 (Explore). */
  longName: string;
  /** Domain hue on night grounds (identifies the domain). Nocturne Atlas, 08 §3.3. */
  hue: string;
  /** Day variant for text/lines on ivory (≥ 4.5:1). */
  ink: string;
  blurb: string;
  /** What the field involves — two plain sentences, no claims or figures. */
  involves: string;
  /** Core disciplines / subjects that feed the field. */
  fields: readonly string[];
  /** Common degree / programme routes into the domain (names only). */
  paths: readonly string[];
  /** Kinds of work people in the domain do (types of roles, not promises). */
  roles: readonly string[];
}

export const EXPLORE_DISCLAIMER =
  'Programme names and requirements vary by institution, so always check official sources.';

export const DOMAINS: readonly Domain[] = [
  {
    id: 'technology',
    name: 'Technology',
    longName: 'Technology',
    hue: domainColor.technology.night,
    ink: domainColor.technology.ink,
    blurb: 'Software, data, AI and the systems that run modern life.',
    involves:
      'Building and maintaining the software, data systems and devices people rely on. The work mixes logic, mathematics and a steady appetite for solving problems.',
    fields: ['Computer science', 'Mathematics', 'Electronics', 'Statistics'],
    paths: ['B.Tech / B.E. in Computer Science, IT or Electronics', 'BCA', 'B.Sc. in Computer Science or Data Science', 'Diplomas in engineering or IT'],
    roles: ['Software developer', 'Data analyst or data scientist', 'Cybersecurity specialist', 'Systems and network engineer'],
  },
  {
    id: 'medicine',
    name: 'Medicine',
    longName: 'Medicine & Healthcare',
    hue: domainColor.medicine.night,
    ink: domainColor.medicine.ink,
    blurb: 'Care, healing and the science of the human body.',
    involves:
      'Understanding how the body works, caring for people and advancing treatment. It combines biology and chemistry with communication, patience and responsibility.',
    fields: ['Biology', 'Chemistry', 'Anatomy', 'Public health'],
    paths: ['MBBS', 'BDS (dentistry)', 'BAMS, BHMS and other AYUSH degrees', 'B.Sc. Nursing and allied health', 'B.Pharm'],
    roles: ['Doctor or surgeon', 'Dentist', 'Nurse or allied-health professional', 'Pharmacist', 'Medical researcher'],
  },
  {
    id: 'business',
    name: 'Business',
    longName: 'Business & Management',
    hue: domainColor.business.night,
    ink: domainColor.business.ink,
    blurb: 'Leading, building and managing organisations and money.',
    involves:
      'Running organisations, allocating money and making decisions under uncertainty. It blends economics and data with leadership and clear communication.',
    fields: ['Economics', 'Accounting', 'Management', 'Statistics'],
    paths: ['BBA or BMS', 'B.Com', 'Economics (B.A. / B.Sc.)', 'CA, CMA and CS professional routes', 'MBA after a first degree'],
    roles: ['Manager or entrepreneur', 'Accountant or auditor', 'Financial analyst', 'Marketing or operations specialist'],
  },
  {
    id: 'design',
    name: 'Design',
    longName: 'Design & Creativity',
    hue: domainColor.design.night,
    ink: domainColor.design.ink,
    blurb: 'Shaping how products, spaces and ideas look and work.',
    involves:
      'Giving ideas form: how products, brands, spaces and stories look, feel and work. It pairs craft and experimentation with an understanding of people.',
    fields: ['Visual arts', 'Typography', 'Human behaviour', 'Materials and media'],
    paths: ['B.Des', 'B.A. or B.F.A. in design and fine arts', 'Diplomas in design', 'Animation and multimedia degrees'],
    roles: ['Product or UX designer', 'Graphic or communication designer', 'Fashion or textile designer', 'Animator or illustrator'],
  },
  {
    id: 'law',
    name: 'Law',
    longName: 'Law & Public Policy',
    hue: domainColor.law.night,
    ink: domainColor.law.ink,
    blurb: 'Rules, rights and the institutions that uphold them.',
    involves:
      'Interpreting rules, arguing cases and shaping how institutions serve society. It rewards careful reading, structured reasoning and persuasive writing.',
    fields: ['Constitutional law', 'Political science', 'History', 'Economics'],
    paths: ['Five-year integrated B.A. LL.B. or BBA LL.B.', 'LL.B. after a first degree', 'LL.M. for specialisation'],
    roles: ['Advocate or litigator', 'Corporate counsel', 'Judicial services (through the relevant selection process)', 'Legal researcher or policy analyst'],
  },
  {
    id: 'architecture',
    name: 'Architecture',
    longName: 'Architecture & Infrastructure',
    hue: domainColor.architecture.night,
    ink: domainColor.architecture.ink,
    blurb: 'Designing the buildings and places people live in.',
    involves:
      'Planning and designing buildings, cities and the structures that support them. It joins drawing and creativity with mathematics, materials and the needs of the people who will use the place.',
    fields: ['Design studio', 'Structures and materials', 'Mathematics', 'Urban studies'],
    paths: ['B.Arch', 'B.Planning (urban and regional planning)', 'Diplomas in architectural assistantship', 'Interior and landscape design programmes'],
    roles: ['Architect', 'Urban planner', 'Interior or landscape designer', 'Construction or project consultant'],
  },
  {
    id: 'science',
    name: 'Science',
    longName: 'Science & Research',
    hue: domainColor.science.night,
    ink: domainColor.science.ink,
    blurb: 'Asking why, from atoms and cells to ecosystems and stars.',
    involves:
      'Asking questions about the natural world and testing the answers with experiments, models and data. It depends on curiosity, rigour and the patience to be wrong before being right.',
    fields: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    paths: ['B.Sc. in Physics, Chemistry, Biology or Mathematics', 'Integrated B.S.–M.S. programmes', 'Environmental, agricultural and marine science degrees'],
    roles: ['Research scientist', 'Laboratory or field scientist', 'Science teacher or communicator', 'Data and analytics roles'],
  },
] as const;
