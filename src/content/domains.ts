/**
 * Career domains for the Meridian Atlas (initial approved set).
 * Descriptions are deliberately general; they contain no statistics, rankings,
 * salaries or outcome claims.
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
}

export const DOMAINS: readonly Domain[] = [
  { id: 'technology', name: 'Technology', hue: domainColor.technology.night, ink: domainColor.technology.ink, blurb: 'Software, data, AI and the systems that run modern life.' },
  { id: 'medicine', name: 'Medicine', hue: domainColor.medicine.night, ink: domainColor.medicine.ink, blurb: 'Care, healing and the science of the human body.' },
  { id: 'business', name: 'Business', hue: domainColor.business.night, ink: domainColor.business.ink, blurb: 'Leading, building and managing organisations and money.' },
  { id: 'design', name: 'Design', hue: domainColor.design.night, ink: domainColor.design.ink, blurb: 'Shaping how products, spaces and ideas look and work.' },
  { id: 'law', name: 'Law', hue: domainColor.law.night, ink: domainColor.law.ink, blurb: 'Rules, rights and the institutions that uphold them.' },
  { id: 'architecture', name: 'Architecture', hue: domainColor.architecture.night, ink: domainColor.architecture.ink, blurb: 'Designing the buildings and places people live in.' },
  { id: 'science', name: 'Science', hue: domainColor.science.night, ink: domainColor.science.ink, blurb: 'Asking why, from atoms and cells to ecosystems and stars.' },
] as const;
