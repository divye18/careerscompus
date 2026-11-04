/**
 * Career domains for the Meridian Atlas (initial approved set).
 * Descriptions are deliberately general; they contain no statistics, rankings,
 * salaries or outcome claims.
 */

export interface Domain {
  id: 'technology' | 'medicine' | 'business' | 'design' | 'law' | 'architecture' | 'science';
  name: string;
  /** Domain hue (see docs/redesign/04_VISUAL_SYSTEM.md). */
  hue: string;
  blurb: string;
}

export const DOMAINS: readonly Domain[] = [
  { id: 'technology', name: 'Technology', hue: '#2F46D9', blurb: 'Software, data, AI and the systems that run modern life.' },
  { id: 'medicine', name: 'Medicine', hue: '#1F7A6B', blurb: 'Care, healing and the science of the human body.' },
  { id: 'business', name: 'Business', hue: '#C58A2B', blurb: 'Leading, building and managing organisations and money.' },
  { id: 'design', name: 'Design', hue: '#C2556B', blurb: 'Shaping how products, spaces and ideas look and work.' },
  { id: 'law', name: 'Law', hue: '#4E3470', blurb: 'Rules, rights and the institutions that uphold them.' },
  { id: 'architecture', name: 'Architecture', hue: '#B5654A', blurb: 'Designing the buildings and places people live in.' },
  { id: 'science', name: 'Science', hue: '#2D8CC4', blurb: 'Asking why, from atoms and cells to ecosystems and stars.' },
] as const;
