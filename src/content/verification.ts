/**
 * The four verification states, in plain words. One vocabulary for every scene, so a label always means the same thing.
 *
 *   verified     every part of the fact was confirmed on an official source; the source and check date are kept
 *   partial      part of it was confirmed on an official source; the rest was not, so it may be incomplete
 *   orientation  general guidance written by CareersCompus; it has not been independently verified
 *   unverified   not confirmed on an official source yet; this says nothing good or bad about the option
 *
 * Orientation is deliberately not a weaker kind of "verified": it is a different kind of content, and it must never be
 * counted, styled or described as a checked fact. A missing value is never zero.
 */
export type VerificationStatus = 'verified' | 'partial' | 'orientation' | 'unverified';

export const VERIFICATION: Record<VerificationStatus, { label: string; meaning: string }> = {
  verified: { label: 'Verified', meaning: 'Confirmed on an official source. We keep the source and the date we checked it.' },
  partial: { label: 'Partially verified', meaning: 'Part of this is confirmed on an official source. The rest is not, so it may be incomplete.' },
  orientation: { label: 'Orientation', meaning: 'General guidance written by CareersCompus. It has not been independently verified.' },
  unverified: { label: 'Not verified', meaning: 'We have not confirmed this on an official source yet. That says nothing good or bad about the option.' },
};
